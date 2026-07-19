---
slug: kafka-architecture-guide
title: "Apache Kafka từ A–Z: kiến trúc, flow hoạt động và lỗi thường gặp 🗞️"
description: "Tài liệu tổng hợp kiến trúc Kafka: topic, partition, offset, broker, replication, consumer group, Kafka Connect — kèm flow end-to-end, delivery semantics và checklist config production."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Kafka, Architecture, Messaging, Distributed Systems, DevOps]
date: '2026-07-19T10:00:00Z'
image: https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80
---

Kafka có mặt ở gần như mọi hệ thống backend quy mô lớn, nhưng nhiều người dùng nó như một hộp đen: cứ `produce` rồi `consume`, tới lúc lag tăng vọt hay mất message giữa production mới cuống. Bài này gom lại **toàn bộ kiến trúc Kafka** — từ topic/partition/offset tới Kafka Connect — kèm flow hoạt động end-to-end và các lỗi thực tế hay gặp, giải thích bằng ví von dễ hình dung.

<!-- truncate -->

## 1. Kafka là gì?

Apache **[Kafka](/glossary#Kafka)** là một **distributed event streaming platform** — nền tảng truyền và lưu trữ luồng sự kiện (events) phân tán, với 3 khả năng chính:

1. **Publish/Subscribe** — ghi và đọc stream of events (giống message queue nhưng mạnh hơn).
2. **Store** — lưu events bền vững (durable), có thể replay lại bất cứ lúc nào.
3. **Process** — xử lý stream real-time (Kafka Streams, ksqlDB) hoặc kết nối hệ thống ngoài (Kafka Connect).

**Ví dụ dễ hiểu:** Hãy tưởng tượng Kafka như một **tòa soạn báo khổng lồ**:

- **Producer** = phóng viên gửi bài về tòa soạn.
- **Topic** = chuyên mục báo (Thể thao, Kinh tế...).
- **Broker** = tòa soạn lưu trữ tất cả bài viết.
- **Consumer** = độc giả đọc báo. Mỗi độc giả tự đánh dấu mình đã đọc đến bài nào (**offset**), báo cũ vẫn nằm trong kho lưu trữ chứ không bị xé đi sau khi đọc.

Điểm khác biệt lớn nhất so với message queue truyền thống (**[RabbitMQ](/glossary#RabbitMQ)**, ActiveMQ): **message không bị xóa sau khi consume** — nó được giữ lại theo retention policy, cho phép nhiều consumer độc lập đọc cùng một data, và replay lại từ đầu khi cần.

## 2. Kiến trúc tổng quan

```
                        ┌─────────────────────────────────────┐
                        │           KAFKA CLUSTER             │
                        │                                     │
 ┌──────────┐           │  ┌────────┐ ┌────────┐ ┌────────┐  │          ┌──────────┐
 │ Producer │──produce──▶  │Broker 1│ │Broker 2│ │Broker 3│  ──consume──▶ Consumer │
 └──────────┘           │  └────────┘ └────────┘ └────────┘  │          │  Group   │
 ┌──────────┐           │       ▲                            │          └──────────┘
 │ Producer │──produce──▶       │                            │          ┌──────────┐
 └──────────┘           │  ┌────┴─────────┐                  ──consume──▶ Consumer │
                        │  │ KRaft Quorum │                  │          │  Group   │
                        │  │ (metadata)   │                  │          └──────────┘
                        │  └──────────────┘                  │
                        └─────────────────────────────────────┘
```

- **Producer** ghi message vào **Topic** trên **Broker**.
- **Consumer** (thường nhóm thành **Consumer Group**) đọc message từ topic.
- **Cluster** gồm nhiều broker; metadata (topic, partition, leader...) được quản lý bởi **KRaft** (Kafka Raft — thay thế ZooKeeper từ Kafka 3.x, ZooKeeper đã bị loại bỏ hoàn toàn từ Kafka 4.0).

## 3. Các thành phần cốt lõi

### 3.1. Topic

**[Topic](/glossary#Topic)** là **kênh logic** để phân loại message, giống tên bảng trong database hoặc tên thư mục.

```
topic: order.created
topic: payment.completed
topic: tracking.events
```

### 3.2. Partition

Mỗi topic được chia thành nhiều **[partition](/glossary#Partition)** — đây là đơn vị **song song hóa (parallelism)** và **phân tán** của Kafka.

```
Topic "orders" (3 partitions):

Partition 0:  [msg0][msg1][msg2][msg3] ──▶ append tiếp vào cuối
Partition 1:  [msg0][msg1][msg2]       ──▶
Partition 2:  [msg0][msg1][msg2][msg3][msg4] ──▶
```

Đặc điểm quan trọng:

- Mỗi partition là một **append-only log**: message chỉ được ghi thêm vào cuối, không sửa/xóa.
- **Thứ tự (ordering) chỉ được đảm bảo trong phạm vi 1 partition**, KHÔNG đảm bảo giữa các partition.
- Message có cùng **key** sẽ luôn vào cùng 1 partition (hash key % số partition) → dùng key để giữ ordering. Ví dụ: dùng `user_id` làm key thì mọi event của cùng 1 user luôn được xử lý theo đúng thứ tự.

### 3.3. Offset

**[Offset](/glossary#Offset)** là **số thứ tự** của message trong partition (0, 1, 2, ...). Consumer dùng offset để biết mình đã đọc đến đâu.

```
Partition 0: [0][1][2][3][4][5][6][7][8][9]
                          ▲              ▲
                  committed offset    log end offset
                  (consumer đã xử lý  (message mới nhất)
                   đến msg 3)

                  └──── LAG = 9 - 3 = 6 ────┘
```

- **Committed offset**: vị trí consumer đã xác nhận xử lý xong.
- **[Consumer lag](/glossary#Consumer%20Lag)** = log end offset − committed offset → chỉ số quan trọng nhất để monitor.

### 3.4. Broker

**[Broker](/glossary#Broker)** là một **server Kafka** — nhận message từ producer, lưu xuống disk, phục vụ consumer. Một cluster production thường có tối thiểu 3 brokers.

### 3.5. Replication (Leader & Follower)

Mỗi partition có nhiều **replica** nằm trên các broker khác nhau để chống mất data:

```
Topic "orders", replication.factor = 3:

              Broker 1        Broker 2        Broker 3
Partition 0:  LEADER          follower        follower
Partition 1:  follower        LEADER          follower
Partition 2:  follower        follower        LEADER
```

- **[Leader](/glossary#Leader%20%2F%20Follower)**: replica duy nhất nhận read/write cho partition đó.
- **Follower**: liên tục sao chép (replicate) data từ leader.
- **[ISR (In-Sync Replicas)](/glossary#ISR)**: tập các replica đang bắt kịp leader. Khi leader chết, một follower trong ISR được bầu làm leader mới → cluster tự phục hồi, không mất data.

### 3.6. Producer

**[Producer](/glossary#Producer)** là client ghi message vào Kafka. Các config quan trọng:

| Config | Ý nghĩa |
|---|---|
| `acks=0` | Gửi xong không chờ xác nhận — nhanh nhất, có thể mất data |
| `acks=1` | Chờ leader ghi xong — cân bằng |
| `acks=all` | Chờ toàn bộ ISR ghi xong — an toàn nhất, chậm hơn |
| `retries` | Số lần retry khi gửi fail |
| `enable.idempotence=true` | Chống duplicate khi retry (exactly-once ở phía produce) |
| `batch.size` / `linger.ms` | Gom message thành batch để tăng throughput |
| `compression.type` | Nén batch (lz4, snappy, zstd) — giảm băng thông và disk |

**Flow produce một message:**

```
1. producer.send(topic="orders", key="user_123", value={...})
2. Serializer chuyển value thành bytes (JSON/Avro/Protobuf)
3. Partitioner tính: hash("user_123") % 3 = partition 1
4. Message vào buffer, gom batch theo batch.size/linger.ms
5. Batch gửi tới LEADER của partition 1
6. Leader ghi log, followers replicate
7. Leader trả ack về producer (tùy acks config)
```

### 3.7. Consumer & Consumer Group

Consumer đọc message từ topic. **[Consumer Group](/glossary#Consumer%20Group)** là cơ chế scale:

```
Topic "orders" (4 partitions) — Consumer Group "billing-service":

Partition 0 ──▶ Consumer A
Partition 1 ──▶ Consumer A       Mỗi partition chỉ được gán cho
Partition 2 ──▶ Consumer B       ĐÚNG 1 consumer trong group
Partition 3 ──▶ Consumer C
```

Quy tắc vàng:

- **1 partition chỉ được 1 consumer trong group xử lý** tại một thời điểm.
- Số consumer > số partition → consumer thừa sẽ **ngồi chơi (idle)**.
- Nhiều group khác nhau đọc cùng topic thì **độc lập hoàn toàn** — mỗi group có bộ offset riêng. Ví dụ: `billing-service` và `analytics-service` cùng đọc topic `orders` nhưng không ảnh hưởng nhau.

### 3.8. Rebalancing

Khi consumer join/leave group (deploy, crash, scale), Kafka **phân chia lại partition** giữa các consumer — gọi là **[rebalance](/glossary#Rebalancing)**. Trong lúc rebalance (kiểu eager cũ), toàn bộ group tạm dừng consume → gây "stop-the-world". Các phiên bản mới dùng **cooperative sticky / incremental rebalance** để giảm gián đoạn.

### 3.9. Retention & Compaction

- **[Retention](/glossary#Retention) theo thời gian/dung lượng**: `retention.ms=604800000` (7 ngày) → message cũ hơn 7 ngày bị xóa.
- **[Log compaction](/glossary#Log%20Compaction)** (`cleanup.policy=compact`): chỉ giữ **message mới nhất của mỗi key** — phù hợp lưu state/snapshot (ví dụ: số dư ví mới nhất của mỗi user).

## 4. Kafka Connect & Connector

### 4.1. Khái niệm

**[Kafka Connect](/glossary#Kafka%20Connect)** là framework chuẩn để **stream data giữa Kafka và hệ thống ngoài** mà không cần viết producer/consumer code — chỉ cần config JSON.

```
                    KAFKA CONNECT
┌──────────┐   ┌─────────────────┐   ┌───────┐   ┌────────────────┐   ┌───────────────┐
│  MySQL   │──▶│ Source Connector│──▶│ Kafka │──▶│ Sink Connector │──▶│ S3 / ES /     │
│ Postgres │   │ (vd: Debezium)  │   │ Topics│   │ (vd: S3 Sink)  │   │ BigQuery ...  │
└──────────┘   └─────────────────┘   └───────┘   └────────────────┘   └───────────────┘
```

- **Source Connector**: kéo data từ ngoài **vào** Kafka (VD: Debezium đọc binlog MySQL → CDC events).
- **Sink Connector**: đẩy data từ Kafka **ra** ngoài (VD: S3 Sink ghi Parquet lên data lake).

> Muốn đào sâu Source/Sink, CDC với Debezium và SMT, xem bài riêng: [Kafka Connect: bơm dữ liệu vào/ra Kafka không cần viết code](/blog/kafka-connector-source-sink-cdc).

### 4.2. Kiến trúc Kafka Connect

```
Connect Cluster (distributed mode):

┌─────────── Worker 1 ──────────┐  ┌─────────── Worker 2 ──────────┐
│ Connector A                   │  │                               │
│  ├─ Task A-0 (đọc table X,Y)  │  │  ├─ Task A-1 (đọc table Z)    │
│ Connector B                   │  │                               │
│  ├─ Task B-0                  │  │  ├─ Task B-1                  │
└───────────────────────────────┘  └───────────────────────────────┘
         Worker chết → tasks tự động chuyển sang worker còn sống
```

| Thành phần | Vai trò |
|---|---|
| **Connector** | Định nghĩa job mức cao (kết nối đâu, topic nào), deploy qua REST API |
| **Task** | Đơn vị thực thi thật sự, chạy song song (`tasks.max`) |
| **Worker** | JVM process chạy connectors/tasks; distributed mode tự rebalance khi worker chết |
| **Converter** | Serialize/deserialize (JSON, Avro, Protobuf) — thường đi kèm Schema Registry |
| **SMT** | Single Message Transform — transform nhẹ inline: rename field, mask PII, route topic |

### 4.3. Ví dụ config

**Source — Debezium CDC từ MySQL:**

```json
{
  "name": "mysql-cdc-orders",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql-prod",
    "database.include.list": "shop",
    "table.include.list": "shop.orders",
    "topic.prefix": "cdc",
    "tasks.max": "1"
  }
}
```

**Sink — đổ data lake S3:**

```json
{
  "name": "s3-sink-events",
  "config": {
    "connector.class": "io.confluent.connect.s3.S3SinkConnector",
    "tasks.max": "4",
    "topics": "tracking.events",
    "s3.bucket.name": "datalake-raw",
    "format.class": "io.confluent.connect.s3.format.parquet.ParquetFormat",
    "flush.size": "10000",
    "rotate.interval.ms": "600000"
  }
}
```

### 4.4. Khi nào dùng Connect, khi nào tự viết consumer?

| Dùng Kafka Connect | Tự viết consumer / stream processing |
|---|---|
| Ingest/egress thuần (DB → Kafka, Kafka → S3) | Business logic phức tạp |
| Transform đơn giản (SMT: mask, rename) | Enrich, join nhiều topic, aggregate |
| Muốn tận dụng offset management, retry sẵn có | Cần kiểm soát chi tiết error handling, DLQ tùy biến |
| Connector có sẵn trên Confluent Hub | Không có connector phù hợp |

## 5. Flow hoạt động end-to-end (ví dụ minh họa)

**Bài toán:** Hệ thống thanh toán — user bấm nút thanh toán, cần: trừ tiền, gửi notification, ghi analytics.

```
                                    ┌──────────────────────────────────┐
                                    │      Topic: payment.events       │
┌──────────┐    produce             │  P0: [e1][e4][e7]                │
│ Payment  │ ──(key=user_id)──────▶ │  P1: [e2][e5]                    │
│ API      │                        │  P2: [e3][e6][e8]                │
└──────────┘                        └──────────────────────────────────┘
                                        │              │           │
                          ┌─────────────┘              │           └─────────────┐
                          ▼                            ▼                         ▼
                 Group: "wallet-svc"          Group: "notify-svc"       Sink Connector
                 (trừ tiền, 3 consumers)      (gửi push, 2 consumers)   (đổ BigQuery)
```

**Diễn giải từng bước:**

1. **Produce**: Payment API tạo event `{user_id: "u123", amount: 50000, status: "success"}`, dùng `user_id` làm key → mọi event của u123 luôn vào cùng partition → wallet-svc xử lý đúng thứ tự (không bị race trừ tiền).
2. **Store**: Broker (leader) ghi event vào log, followers replicate. Với `acks=all`, producer chỉ nhận OK khi toàn bộ ISR đã ghi.
3. **Consume song song, độc lập**: 3 group đọc cùng data, mỗi group có offset riêng:
   - `wallet-svc` trừ tiền.
   - `notify-svc` gửi push notification.
   - Sink connector đổ BigQuery cho team analytics.
4. **Commit offset**: mỗi consumer sau khi xử lý xong commit offset. Nếu consumer crash trước khi commit → sau restart sẽ đọc lại message đó (**at-least-once** → cần xử lý **[idempotent](/glossary#Idempotency)**, ví dụ check transaction_id đã tồn tại chưa trước khi trừ tiền).
5. **Replay khi cần**: analytics phát hiện bug tính toán → reset offset của group analytics về 7 ngày trước, chạy lại toàn bộ mà không ảnh hưởng wallet-svc hay notify-svc.

**Delivery semantics:**

| Semantics | Ý nghĩa | Cách đạt được |
|---|---|---|
| At-most-once | Có thể mất message, không duplicate | Commit offset TRƯỚC khi xử lý |
| At-least-once | Không mất, có thể duplicate | Commit offset SAU khi xử lý (phổ biến nhất) |
| Exactly-once | Không mất, không duplicate | Idempotent producer + transactions (`isolation.level=read_committed`), hoặc consumer tự idempotent |

## 6. Các lỗi thường gặp & cách xử lý

### 6.1. Consumer Lag — consume không theo kịp produce ⭐

Đây là vấn đề phổ biến nhất. Producer ghi 10.000 msg/s nhưng consumer chỉ xử lý được 4.000 msg/s → lag tăng liên tục.

```
Lag tăng dần theo thời gian:

msg/s │  produce rate ────────────────── 10k
      │
      │  consume rate ────────────────── 4k
      │
 lag  │            ╱╱╱╱  ← lag = tích lũy 6k msg/s, càng lúc càng xa
      └──────────────────────────▶ time
```

**Nguyên nhân & giải pháp:**

| Nguyên nhân | Giải pháp |
|---|---|
| Xử lý mỗi message quá chậm (gọi API ngoài, ghi DB từng record) | Batch processing: gom N messages rồi bulk insert; dùng async I/O; cache |
| Ít consumer hơn khả năng scale | Thêm consumer instance (tối đa = số partition) |
| Số partition quá ít → không scale thêm consumer được | Tăng số partition (lưu ý: làm thay đổi mapping key→partition, ảnh hưởng ordering) |
| Fetch config chưa tối ưu | Tăng `max.poll.records`, `fetch.min.bytes`, `fetch.max.bytes` |
| Một message "độc" (poison pill) làm consumer retry mãi | **[Dead Letter Queue](/glossary#Dead%20Letter%20Queue)** (DLQ): đẩy message lỗi sang topic riêng, xử lý sau |
| Traffic spike tạm thời | Chấp nhận lag tạm, đảm bảo retention đủ dài để không mất data; autoscale consumer theo lag (KEDA trên Kubernetes) |

**Monitoring bắt buộc:** theo dõi `consumer_lag` per partition (Burrow, Kafka Exporter + Prometheus/Grafana), alert khi lag vượt ngưỡng hoặc tăng liên tục.

### 6.2. Rebalance liên tục (rebalance storm)

**Triệu chứng:** consumer group liên tục rebalance, throughput tụt về gần 0, log đầy `Attempt to heartbeat failed since group is rebalancing`.

**Nguyên nhân phổ biến:** xử lý 1 batch lâu hơn `max.poll.interval.ms` (mặc định 5 phút) → broker tưởng consumer chết → kick khỏi group → rebalance → consumer quay lại → rebalance tiếp → vòng lặp.

**Giải pháp:**

- Giảm `max.poll.records` (xử lý ít message hơn mỗi vòng poll).
- Tăng `max.poll.interval.ms` nếu job thật sự cần xử lý lâu.
- Tách phần xử lý nặng ra worker thread riêng, thread poll chỉ lo poll + commit.
- Dùng `partition.assignment.strategy=CooperativeStickyAssignor` để rebalance không stop-the-world.
- Đặt `group.instance.id` (static membership) để restart/deploy không trigger rebalance.

### 6.3. Message bị duplicate

**Nguyên nhân:** consumer xử lý xong nhưng crash trước khi commit offset → restart đọc lại; hoặc producer retry khi network timeout nhưng message đầu thực ra đã ghi thành công.

**Giải pháp:**

- Phía producer: `enable.idempotence=true`.
- Phía consumer: thiết kế **idempotent processing** — dùng unique key (event_id) check trước khi ghi DB, hoặc upsert thay vì insert.

### 6.4. Mất message

| Tình huống | Nguyên nhân | Phòng tránh |
|---|---|---|
| Producer mất msg | `acks=0/1` + leader chết trước khi replicate | `acks=all`, `min.insync.replicas=2` |
| Consumer "mất" msg | Auto-commit offset trước khi xử lý xong, rồi crash | Tắt auto-commit, commit thủ công SAU khi xử lý |
| Msg bị xóa trước khi đọc | Lag lớn hơn retention → message hết hạn bị xóa | Tăng `retention.ms`, alert lag sớm |
| `unclean.leader.election=true` | Follower ngoài ISR được bầu làm leader → mất msg chưa replicate | Giữ mặc định `false` |

### 6.5. Message quá lớn

**Lỗi:** `RecordTooLargeException` (mặc định giới hạn ~1MB).

**Giải pháp:** nén (`compression.type=zstd`); hoặc **claim-check pattern** — lưu payload lớn lên S3, chỉ gửi reference qua Kafka; hạn chế tăng `message.max.bytes` vì ảnh hưởng memory và latency toàn cluster.

### 6.6. Partition skew — phân bố lệch

**Triệu chứng:** một partition chứa 80% traffic (**[hot partition](/glossary#Hot%20Partition)**), consumer của partition đó quá tải trong khi các consumer khác rảnh.

**Nguyên nhân:** chọn key có cardinality thấp hoặc phân bố lệch (VD: key = `merchant_id` mà 1 merchant chiếm phần lớn giao dịch).

**Giải pháp:** chọn key phân bố đều hơn (VD: `user_id` thay vì `merchant_id`), hoặc key composite (`merchant_id + bucket ngẫu nhiên`) nếu chấp nhận mất ordering theo merchant.

### 6.7. Offset out of range / OffsetOutOfRangeException

**Nguyên nhân:** consumer offline lâu, offset đã commit trỏ tới message đã bị xóa bởi retention.

**Xử lý:** config `auto.offset.reset`:

- `earliest` → đọc lại từ message cũ nhất còn tồn tại (an toàn cho data pipeline).
- `latest` → nhảy tới message mới nhất (chấp nhận bỏ qua data cũ).

### 6.8. Schema thay đổi làm vỡ consumer

**Tình huống:** producer đổi format (xóa field, đổi type) → consumer deserialize fail hàng loạt.

**Giải pháp:** dùng **Schema Registry** (Avro/Protobuf) với compatibility mode `BACKWARD` — mọi schema mới phải được registry chấp nhận trước khi producer dùng, đảm bảo consumer cũ vẫn đọc được.

## 7. Checklist config production tham khảo

```properties
# ---- Producer ----
acks=all
enable.idempotence=true
compression.type=zstd
linger.ms=10
batch.size=65536

# ---- Consumer ----
enable.auto.commit=false          # commit thủ công sau khi xử lý
max.poll.records=200
max.poll.interval.ms=300000
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
auto.offset.reset=earliest

# ---- Topic ----
replication.factor=3
min.insync.replicas=2
retention.ms=604800000            # 7 ngày
```

## 8. Tóm tắt nhanh

| Khái niệm | Một câu ghi nhớ |
|---|---|
| Topic | Kênh logic phân loại message |
| Partition | Đơn vị song song hóa; ordering chỉ trong 1 partition |
| Offset | Số thứ tự message; consumer tự quản lý vị trí đọc |
| Broker | Server lưu trữ và phục vụ message |
| Replication/ISR | Chống mất data; leader nhận write, follower sao chép |
| Consumer Group | Scale consume; 1 partition ↔ 1 consumer trong group |
| Rebalance | Chia lại partition khi group thay đổi thành viên |
| Kafka Connect | Framework ingest/egress bằng config, không cần code |
| Source/Sink Connector | Kéo data vào Kafka / đẩy data ra ngoài |
| Consumer Lag | Chỉ số quan trọng nhất — produce nhanh hơn consume |
| DLQ | Nơi chứa message lỗi để không chặn pipeline |

Muốn tra nhanh từng thuật ngữ, ghé **[từ điển thuật ngữ](/glossary)** — mọi khái niệm Kafka ở trên đều có mục riêng kèm ví von dễ nhớ. 🗞️
