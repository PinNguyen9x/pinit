---
slug: kafka-connector-source-sink-cdc
title: "Kafka Connect: bơm dữ liệu vào/ra Kafka không cần viết code 🔌"
description: "Giải thích dễ hiểu về Kafka Connect: Source vs Sink connector, cách cấu hình bằng JSON, làm CDC với Debezium, và những lỗi thực tế hay gặp khi vận hành connector."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Kafka, Kafka Connect, CDC, Debezium, DevOps]
date: '2026-07-19T09:00:00Z'
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80
---

Bạn đã có Kafka chạy, có topic, có producer/consumer. Nhưng rồi sếp bảo: "Đồng bộ toàn bộ bảng `orders` trong Postgres sang Elasticsearch để search real-time đi." Bạn định ngồi viết một service đọc database, bắt sự kiện thay đổi, rồi push vào Kafka, rồi viết thêm một service nữa đọc Kafka đẩy sang Elasticsearch... Dừng lại. Đó chính xác là việc **Kafka Connect** sinh ra để làm — và bạn gần như không phải viết dòng code nào.

<!-- truncate -->

## 1. Vấn đề: ai cũng viết đi viết lại cùng một thứ

Trong thực tế, phần lớn công việc quanh Kafka không phải là logic nghiệp vụ phức tạp, mà là **bê dữ liệu từ chỗ này sang chỗ kia**:

- Kéo dữ liệu từ Postgres/MySQL vào Kafka
- Đẩy dữ liệu từ Kafka sang Elasticsearch, S3, BigQuery
- Đồng bộ giữa hai hệ thống

Ai cũng viết producer/consumer để làm việc này. Mà đã tự viết thì phải tự lo: retry khi lỗi, nhớ **[offset](/glossary#Offset)** đã đọc tới đâu, chia tải khi dữ liệu lớn, khởi động lại khi service chết... Toàn những bài toán đã được giải hàng nghìn lần.

**Kafka Connect** là câu trả lời: một framework tích hợp chạy sẵn cùng Kafka, biến việc "bê dữ liệu" thành **khai báo cấu hình** thay vì viết code.

## 2. Hai loại connector: Source và Sink

Đây là khái niệm cốt lõi, nhớ được cái này là hiểu 80% Kafka Connect.

```
   Hệ ngoài                Kafka                 Hệ ngoài
 (upstream)                                     (downstream)
┌──────────┐   Source    ┌─────────┐   Sink    ┌──────────────┐
│ Postgres │ ──────────> │  Topic  │ ────────> │ Elasticsearch│
│  MySQL   │  connector  │  Kafka  │ connector │   S3 / GCS   │
│   API    │             └─────────┘           │   Database   │
└──────────┘                                   └──────────────┘
   kéo VÀO Kafka                            đẩy RA khỏi Kafka
```

- **Source connector** — kéo dữ liệu từ hệ thống **[upstream](/glossary#Upstream)** (database, file, API) **VÀO** topic Kafka. Nó đóng vai một **[producer](/glossary#Producer)** thông minh.
- **Sink connector** — đẩy dữ liệu **TỪ** topic Kafka **RA** hệ thống **[downstream](/glossary#Downstream)** (Elasticsearch, S3, database khác). Nó đóng vai một **[consumer group](/glossary#Consumer%20Group)**.

> 💡 Dễ nhớ: **Source** là ống hút — hút dữ liệu vào Kafka. **Sink** là ống xả (sink = bồn rửa) — xả dữ liệu ra khỏi Kafka.

## 3. Cấu hình thay vì code

Bạn không viết Java. Bạn gửi một file JSON tới REST API của Connect. Ví dụ một **Sink connector** đẩy topic `orders` sang Elasticsearch:

```json
{
  "name": "orders-to-elasticsearch",
  "config": {
    "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
    "topics": "orders",
    "connection.url": "http://elasticsearch:9200",
    "key.ignore": "true",
    "schema.ignore": "true",
    "tasks.max": "3"
  }
}
```

Đăng ký nó bằng một lời gọi HTTP:

```bash
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d @orders-to-elasticsearch.json
```

Xong. Connect sẽ tự đọc topic `orders`, đẩy từng message sang Elasticsearch, tự nhớ offset, tự retry khi ES tạm thời chết. Muốn xem trạng thái:

```bash
curl http://localhost:8083/connectors/orders-to-elasticsearch/status
```

## 4. Worker và Task: Connect scale thế nào

Kafka Connect chạy như một cụm các **worker** (tiến trình JVM). Khi bạn tạo một connector, Connect chia công việc thành nhiều **task** và rải đều lên các worker.

```
        Kafka Connect Cluster
┌─────────────┐   ┌─────────────┐
│  Worker 1   │   │  Worker 2   │
│  ┌───────┐  │   │  ┌───────┐  │
│  │Task 0 │  │   │  │Task 2 │  │
│  │Task 1 │  │   │  └───────┘  │
│  └───────┘  │   │             │
└─────────────┘   └─────────────┘
```

- `tasks.max` quyết định số task tối đa. Với Sink connector, số task hữu ích **không vượt quá số [partition](/glossary#Partition)** của topic — vì mỗi partition chỉ được một task đọc (đúng luật consumer group).
- Worker chết → task được **rebalance** sang worker còn sống (giống **[rebalancing](/glossary#Rebalancing)** của consumer group).
- Trạng thái (offset, config, status) được lưu trong các **internal topic** của Connect, nên cụm khởi động lại không mất dấu.

> Điểm hay: bạn nhận được khả năng chịu lỗi và scale của consumer group mà không phải tự code — đó là giá trị thật của Connect.

## 5. Ngôi sao thực sự: CDC với Debezium

Source connector mạnh nhất khi kết hợp với **CDC (Change Data Capture)**. Thay vì cứ vài giây lại `SELECT * FROM orders` (nặng và trễ), **Debezium** đọc thẳng **transaction log** của database (WAL của Postgres, binlog của MySQL) để bắt **mọi** thay đổi ngay khi nó xảy ra.

```json
{
  "name": "postgres-orders-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.dbname": "shop",
    "table.include.list": "public.orders",
    "plugin.name": "pgoutput",
    "topic.prefix": "cdc"
  }
}
```

Mỗi lần có `INSERT`/`UPDATE`/`DELETE` trên bảng `orders`, Debezium sinh một event vào topic `cdc.public.orders` với cả giá trị **trước** (`before`) và **sau** (`after`) khi thay đổi:

```json
{
  "op": "u",
  "before": { "id": 42, "status": "pending" },
  "after":  { "id": 42, "status": "paid" },
  "ts_ms": 1752900000000
}
```

Từ đây, database của bạn trở thành một nguồn phát sự kiện real-time cho toàn hệ thống mà **không phải sửa một dòng code nào của ứng dụng đang chạy**. Đây là nền tảng của rất nhiều kiến trúc event-driven và **[microservices](/glossary#Microservices)** hiện đại.

## 6. Single Message Transforms (SMT): nắn dữ liệu ngay trên đường ống

Đôi khi dữ liệu không cần logic phức tạp, chỉ cần **chỉnh nhẹ** trước khi vào/ra Kafka: đổi tên field, bỏ cột nhạy cảm, thêm timestamp, đổi topic đích... Viết hẳn một service cho việc này thì phí. **SMT (Single Message Transforms)** cho phép biến đổi **từng message một** ngay trong connector — vẫn chỉ bằng cấu hình.

SMT nằm chèn giữa connector và Kafka:

```
Source:  Nguồn ──▶ [ SMT ] ──▶ Topic Kafka
Sink:    Topic Kafka ──▶ [ SMT ] ──▶ Hệ đích
```

Bạn khai báo một **chuỗi** transform (chạy tuần tự) qua key `transforms`. Ví dụ Sink connector ở mục 3, giờ thêm: che số điện thoại (mask PII), bỏ field nội bộ, và gắn thời điểm xử lý:

```json
{
  "name": "orders-to-elasticsearch",
  "config": {
    "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
    "topics": "orders",
    "connection.url": "http://elasticsearch:9200",

    "transforms": "maskPhone,dropInternal,addTs",

    "transforms.maskPhone.type": "org.apache.kafka.connect.transforms.MaskField$Value",
    "transforms.maskPhone.fields": "phone",
    "transforms.maskPhone.replacement": "***",

    "transforms.dropInternal.type": "org.apache.kafka.connect.transforms.ReplaceField$Value",
    "transforms.dropInternal.exclude": "internal_note",

    "transforms.addTs.type": "org.apache.kafka.connect.transforms.InsertField$Value",
    "transforms.addTs.timestamp.field": "ingested_at"
  }
}
```

Vài SMT có sẵn hay dùng:

| SMT | Việc nó làm |
|---|---|
| `MaskField` | Che giá trị field nhạy cảm (PII: phone, email, CCCD) |
| `ReplaceField` | Bỏ (`exclude`) hoặc đổi tên (`renames`) field |
| `InsertField` | Chèn thêm field (timestamp, topic, partition, static value) |
| `Cast` | Ép kiểu dữ liệu (string → int, ...) |
| `TimestampConverter` | Đổi định dạng thời gian (unix ↔ ISO string) |
| `RegexRouter` | Đổi **topic đích** theo regex — vd gộp `cdc.public.orders` → `orders` |
| `ExtractField` | Rút một field con lên làm toàn bộ key/value |

Có thể gắn thêm **predicate** để SMT chỉ chạy với message thỏa điều kiện (vd chỉ mask khi topic khớp một tên nhất định).

**Ranh giới cần nhớ:** SMT xử lý **đúng một message tại một thời điểm** — nó **không** join hai luồng, **không** aggregate, **không** nhớ trạng thái giữa các message. Cần những việc đó thì đây là ranh giới để chuyển sang **Kafka Streams** hoặc Flink (xem mục 8). Ngoài ra chuỗi SMT quá dài cũng bào throughput — nặng thì tách ra stream processing riêng.

> 💡 Dễ nhớ: SMT như trạm chỉnh trang cuối băng chuyền — dán nhãn, che tem, bỏ bớt phụ kiện cho **từng món**; nhưng nó không ghép hai món lại thành một.

## 7. Những lỗi thực tế hay gặp

Connect "không cần code" không có nghĩa là "không cần hiểu". Đây là các vết xe đổ phổ biến:

**1. Schema và converter lệch nhau.** Đây là lỗi số một. Cấu hình `key.converter` / `value.converter` (JSON, Avro, Protobuf) ở producer và ở connector phải khớp. Dùng Avro thì thường cần thêm **Schema Registry**. Sai converter → Connect ném lỗi deserialize và task chết ngay message đầu tiên.

**2. Một message hỏng làm chết cả task (poison message).** Mặc định, gặp message không parse được là task dừng. Hãy bật cơ chế bỏ qua và đẩy vào **[dead letter queue](/glossary#Dead%20Letter%20Queue)**:

```json
"errors.tolerance": "all",
"errors.deadletterqueue.topic.name": "orders-dlq"
```

**3. `tasks.max` cao hơn số partition.** Đặt `tasks.max: 10` cho topic chỉ có 3 partition → chỉ 3 task chạy, 7 task còn lại ngồi chơi. Không lỗi, nhưng bạn tưởng đã scale mà thực ra không.

**4. Sink downstream chậm gây tồn đọng.** Nếu Elasticsearch/S3 xử lý chậm hơn tốc độ message đổ về, **[consumer lag](/glossary#Consumer%20Lag)** của Sink tăng dần — đây là biểu hiện của **[backpressure](/glossary#Backpressure)**. Theo dõi lag là việc bắt buộc, đừng đợi tới lúc tràn.

**5. CDC đầu tiên "đơ" vì snapshot.** Debezium lần đầu thường chụp toàn bộ bảng (initial snapshot) trước khi stream. Bảng lớn → snapshot lâu, dễ tưởng nhầm là treo. Biết trước để không hoảng.

## 8. Khi nào KHÔNG nên dùng Kafka Connect

Connect tuyệt vời cho việc **bê dữ liệu tiêu chuẩn**, nhưng không phải viên đạn bạc:

- Cần **biến đổi dữ liệu phức tạp** (join nhiều luồng, aggregate theo cửa sổ thời gian) → dùng **Kafka Streams** hoặc Flink, đừng cố nhồi vào SMT (mục 6) của Connect.
- Chỉ có **một luồng nhỏ, một lần** → có khi tự viết một script consumer còn nhanh hơn dựng cả cụm Connect.
- Hệ đích **không có connector sẵn** và bạn không muốn tự viết plugin → cân nhắc lại.

## Tóm lại

Kafka Connect biến bài toán tích hợp dữ liệu từ "viết và bảo trì hàng loạt producer/consumer" thành "khai báo vài file JSON":

- **Source** kéo dữ liệu từ upstream **vào** Kafka; **Sink** đẩy dữ liệu **ra** downstream.
- Bạn nhận được retry, quản lý offset, scale theo task, chịu lỗi qua rebalance — miễn phí.
- **Debezium + CDC** biến database thành nguồn sự kiện real-time mà không đụng vào app.
- **SMT** nắn nhẹ từng message (mask, rename, route) ngay trên đường ống — nhưng dừng lại ở đó, việc nặng để cho Kafka Streams.
- Cạm bẫy nằm ở **converter/schema**, **poison message**, và **lag ở Sink** — hiểu chúng là vận hành được yên tâm.

Muốn ôn lại các khái niệm nền, ghé qua **[Kafka Connect](/glossary#Kafka%20Connect)**, **[Upstream](/glossary#Upstream)**, **[Downstream](/glossary#Downstream)** trong từ điển thuật ngữ nhé. 🔌
