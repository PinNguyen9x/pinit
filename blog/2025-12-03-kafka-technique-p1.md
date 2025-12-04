---
slug: kafka-techniques-p2
title: Apache Kafka Complete Knowledge Base
author: Pin Nguyen
author_title: Software Developer
tags: [kafka, rabbitmq, system design, message queue, architecture]
date: '2024-12-02T12:00:00Z'
---

Apache Kafka là một nền tảng streaming phân tán được thiết kế để xử lý dòng dữ liệu real-time với thропропut cao và khả năng chịu lỗi tốt. Kafka đặc biệt xuất sắc trong việc tách biệt (decouple) giữa producers và consumers, cho phép xây dựng kiến trúc có khả năng mở rộng cho big data và các pipeline machine learning.

<!-- truncate -->
# Tìm hiểu Apache Kafka: Khái niệm cốt lõi và Ứng dụng trong Machine Learning

## 1. Producers và Consumers

### Producers (Nhà sản xuất)

**Producers** là các ứng dụng/service tạo ra và gửi messages (tin nhắn) đến Kafka. Đây là nguồn phát sinh dữ liệu trong hệ thống.

**Cách hoạt động:**
- Producers ghi messages vào cuối log của partition (được theo dõi bởi **log end offset**)
- Messages được append (thêm vào) theo thứ tự, không thể xóa hay sửa đổi
- Producers có thể chỉ định **key** cho message để routing đến partition cụ thể

**Chiến lược gửi message:**
- **Key-based routing**: Sử dụng hash của key để đảm bảo messages cùng key luôn đến cùng một partition (đảm bảo thứ tự)
- **Round-robin**: Nếu không có key, messages được phân phối đều qua các partitions

```
Producer A ──┐
             ├──> Kafka Topic
Producer B ──┘     (Partition 0, 1, 2...)
```

### Consumers (Người tiêu thụ)

**Consumers** là các ứng dụng đọc và xử lý messages từ Kafka. 

**Cách hoạt động:**
- Consumers **pull** (kéo) messages từ partitions, không phải Kafka push
- Mỗi consumer theo dõi vị trí đọc của mình bằng **offset**
- Consumer có thể **replay** (phát lại) dữ liệu bằng cách reset offset về vị trí cũ

**Ưu điểm của mô hình Push-Pull:**
- **Decoupling**: Producers và Consumers hoàn toàn độc lập
- **Asynchronous**: Xử lý không đồng bộ, tăng throughput
- **Scalability**: Dễ dàng thêm producers/consumers mà không ảnh hưởng hệ thống
- **Fault Recovery**: Consumer bị lỗi có thể tiếp tục từ offset đã commit

```
            ┌──> Consumer 1 (offset: 100)
Topic ──────┼──> Consumer 2 (offset: 150)
            └──> Consumer 3 (offset: 120)
```

### So sánh với hàng đợi truyền thống (RabbitMQ)

| Đặc điểm | Kafka | RabbitMQ |
|----------|-------|----------|
| Mô hình | Pull-based | Push-based |
| Throughput | Rất cao (triệu msg/s) | Trung bình |
| Persistence | Lưu trữ lâu dài | Xóa sau khi consume |
| Replay | Có thể replay | Không thể |
| Use case | Event streaming, logs | Task queues, RPC |

## 2. Topics và Partitions

### Topics (Chủ đề)

**Topic** là đơn vị tổ chức logic để phân loại messages trong Kafka. Mỗi topic đại diện cho một luồng dữ liệu cụ thể.

**Đặc điểm:**
- Tương tự như một "thư mục" hoặc "bảng" trong database
- Ví dụ: topic "orders" chứa đơn hàng, topic "logs" chứa log hệ thống
- Có thể có nhiều producers ghi và nhiều consumers đọc cùng một topic
- Giúp tách biệt các loại dữ liệu, tăng hiệu suất xử lý

```
Application
    │
    ├─> Topic: user-events
    ├─> Topic: orders
    ├─> Topic: payment-transactions
    └─> Topic: system-logs
```

### Partitions (Phân vùng)

**Partition** là đơn vị vật lý chia nhỏ một topic thành nhiều phần song song. Đây là yếu tố then chốt giúp Kafka có khả năng mở rộng.

**Đặc điểm quan trọng:**
- Mỗi partition là một **ordered, immutable log** (log có thứ tự, không thay đổi)
- Messages trong một partition được **đảm bảo thứ tự**, nhưng không đảm bảo giữa các partitions
- Mỗi partition được lưu trên một broker cụ thể
- Cho phép xử lý song song (parallelism)

**Ví dụ trực quan:**

```
Topic: orders (3 partitions)

Partition 0:  [msg0, msg3, msg6, msg9 ...]  → Consumer A
Partition 1:  [msg1, msg4, msg7, msg10...]  → Consumer B  
Partition 2:  [msg2, msg5, msg8, msg11...]  → Consumer C
```

**Tại sao cần Partitions?**

1. **Scalability**: Mỗi partition có thể nằm trên broker khác nhau, tăng throughput
2. **Parallelism**: Nhiều consumers có thể đọc đồng thời từ các partitions khác nhau
3. **Ordering guarantee**: Đảm bảo thứ tự trong partition (quan trọng cho nhiều use case)

### Bảng so sánh Topic vs Partition

| Khía cạnh | Topic | Partition |
|-----------|-------|-----------|
| Mục đích | Phân loại messages theo logic | Cho phép song song hóa và mở rộng |
| Thứ tự | Không đảm bảo giữa partitions | Đảm bảo nghiêm ngặt trong partition |
| Lưu trữ | Container logic | Log segments vật lý trên brokers |
| Ví dụ | "user-clicks", "payments" | Partition 0, 1, 2 của topic "payments" |

### Sơ đồ Topic và Partition

```
Topic: customer-events
┌─────────────────────────────────────────┐
│                                         │
│  Partition 0 (Leader: Broker 1)         │
│  [offset 0][offset 1][offset 2]...      │
│                                         │
│  Partition 1 (Leader: Broker 2)         │
│  [offset 0][offset 1][offset 2]...      │
│                                         │
│  Partition 2 (Leader: Broker 3)         │
│  [offset 0][offset 1][offset 2]...      │
│                                         │
└─────────────────────────────────────────┘
```

### Làm rõ mối quan hệ Broker - Partition - Offset

#### 1. Một Broker có thể chứa NHIỀU Partitions

**Điều này hoàn toàn ĐÚNG và rất phổ biến!** 

Trong thực tế, mỗi broker thường quản lý hàng chục đến hàng trăm partitions từ nhiều topics khác nhau.

**Ví dụ thực tế:**

```
Broker 1:
├── Topic "orders" 
│   ├── Partition 0 (Leader)
│   └── Partition 2 (Follower)
├── Topic "payments"
│   ├── Partition 1 (Leader)
│   └── Partition 0 (Follower)
└── Topic "logs"
    └── Partition 3 (Leader)

→ Broker 1 đang chứa 6 partitions từ 3 topics khác nhau!
```

**Chi tiết hơn:**

```
Kafka Cluster (3 brokers)

┌─────────────────────────┐
│      Broker 1           │
│  ┌──────────────────┐   │
│  │ orders-p0 (L)    │   │ ← Leader cho partition 0 của topic "orders"
│  │ orders-p2 (F)    │   │ ← Follower cho partition 2 của topic "orders"
│  │ payments-p1 (L)  │   │ ← Leader cho partition 1 của topic "payments"
│  │ logs-p0 (F)      │   │ ← Follower cho partition 0 của topic "logs"
│  └──────────────────┘   │
└─────────────────────────┘

┌─────────────────────────┐
│      Broker 2           │
│  ┌──────────────────┐   │
│  │ orders-p1 (L)    │   │
│  │ orders-p0 (F)    │   │ ← Backup của orders-p0 từ Broker 1
│  │ payments-p0 (L)  │   │
│  │ logs-p1 (L)      │   │
│  └──────────────────┘   │
└─────────────────────────┘

┌─────────────────────────┐
│      Broker 3           │
│  ┌──────────────────┐   │
│  │ orders-p2 (L)    │   │
│  │ orders-p1 (F)    │   │
│  │ payments-p1 (F)  │   │
│  │ logs-p0 (L)      │   │
│  └──────────────────┘   │
└─────────────────────────┘

L = Leader, F = Follower
```

**Tại sao một Broker chứa nhiều Partitions?**

1. **Tối ưu tài nguyên**: Không lãng phí server - một broker mạnh có thể xử lý nhiều partitions
2. **Load balancing**: Phân phối đều partitions qua các brokers
3. **Fault tolerance**: Mỗi partition có replicas trên nhiều brokers khác nhau

---

#### 2. Một Partition chứa NHIỀU Offsets (không phải một offset)

**Đây là điểm quan trọng cần hiểu rõ!**

**Offset** không phải là một "thứ" độc lập, mà là **số thứ tự/vị trí** của mỗi message trong partition.

**Cách hiểu đúng:**

```
Partition 0 của Topic "orders":

┌─────────────────────────────────────────────────────┐
│                                                     │
│  Offset 0: {orderId: 1, item: "Laptop", price: 1000}│
│  Offset 1: {orderId: 2, item: "Mouse", price: 20}   │
│  Offset 2: {orderId: 3, item: "Keyboard", price: 50}│
│  Offset 3: {orderId: 4, item: "Monitor", price: 300}│
│  ...                                                │
│  Offset 99999: {orderId: 100000, ...}               │
│                                                     │
└─────────────────────────────────────────────────────┘

→ Một partition chứa HÀNG TRIỆU messages
→ Mỗi message có một offset riêng (như index trong array)
```

**So sánh với Array/List:**

```python
# Tương tự như một list trong Python:
partition_0 = [
    "message_0",  # offset 0
    "message_1",  # offset 1  
    "message_2",  # offset 2
    "message_3",  # offset 3
    # ... có thể có hàng triệu messages
]

# Offset = Index của message trong list
```

---

#### 3. Minh họa đầy đủ: Broker → Partition → Offset

```
┌─────────────────────────────────────────────────────────────┐
│                        BROKER 1                             │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PARTITION: orders-0 (Leader)               │    │
│  │                                                    │    │
│  │  [Offset 0] → {"order": 1, "total": 100}          │    │
│  │  [Offset 1] → {"order": 2, "total": 250}          │    │
│  │  [Offset 2] → {"order": 3, "total": 75}           │    │
│  │  [Offset 3] → {"order": 4, "total": 500}          │    │
│  │  ... (có thể có hàng triệu offsets)                │    │
│  │                                                    │    │
│  │  Log End Offset: 1,234,567 ← Offset của msg tiếp theo│  │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PARTITION: payments-2 (Follower)           │    │
│  │                                                    │    │
│  │  [Offset 0] → {"payment": "A", "amount": 1000}    │    │
│  │  [Offset 1] → {"payment": "B", "amount": 2000}    │    │
│  │  ... (có thể có hàng triệu offsets)                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PARTITION: logs-1 (Leader)                 │    │
│  │                                                    │    │
│  │  [Offset 0] → {"log": "ERROR", "msg": "..."}      │    │
│  │  [Offset 1] → {"log": "INFO", "msg": "..."}       │    │
│  │  ... (có thể có hàng triệu offsets)                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

#### 4. Các thuật ngữ quan trọng liên quan đến Offset

**a) Log End Offset (LEO)**
- Offset của message **tiếp theo** sẽ được ghi vào partition
- Nếu partition có 1000 messages (offset 0-999), LEO = 1000

```
Partition hiện có:
[0][1][2][3]...[999]
                     ↑
                   LEO = 1000 (vị trí message tiếp theo)
```

**b) Consumer Offset (Current Offset)**
- Vị trí hiện tại mà consumer đã đọc đến
- Consumer tự track offset này để biết đã đọc đến đâu

```
Partition: [0][1][2][3][4][5][6][7][8][9]
Consumer A đã đọc đến: ────────↑
                            offset 5
Consumer B đã đọc đến: ──↑
                      offset 2
```

**c) Committed Offset**
- Offset mà consumer đã **xác nhận** xử lý xong
- Được lưu trong topic đặc biệt `__consumer_offsets`
- Dùng để recover khi consumer restart

```
Scenario: Consumer bị crash

Trước crash:
- Đã đọc đến offset 100
- Committed offset = 95 (đã xử lý xong)

Sau khi restart:
- Consumer tiếp tục từ offset 95 (không bị mất data)
- Offset 96-100 sẽ được xử lý lại (at-least-once delivery)
```

---

#### 5. Ví dụ thực tế: Tracking User Events

```
Topic: user-clicks (3 partitions, 2 brokers)

┌──────────────────────────────────────────┐
│          BROKER 1                        │
│                                          │
│  Partition 0 (user_id % 3 == 0)         │
│  ├─ [Offset 0] user_id=3, clicked=home  │
│  ├─ [Offset 1] user_id=6, clicked=product│
│  ├─ [Offset 2] user_id=9, clicked=cart  │
│  └─ ... (10,000 messages total)         │
│                                          │
│  Partition 2 (user_id % 3 == 2)         │
│  ├─ [Offset 0] user_id=2, clicked=login │
│  ├─ [Offset 1] user_id=5, clicked=checkout│
│  └─ ... (8,000 messages total)          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│          BROKER 2                        │
│                                          │
│  Partition 1 (user_id % 3 == 1)         │
│  ├─ [Offset 0] user_id=1, clicked=search│
│  ├─ [Offset 1] user_id=4, clicked=profile│
│  └─ ... (12,000 messages total)         │
└──────────────────────────────────────────┘

Tổng: 30,000 messages across 3 partitions on 2 brokers
```

---

#### 6. Tóm tắt các mối quan hệ

```
CLUSTER
  │
  ├─ BROKER 1
  │    │
  │    ├─ PARTITION A (chứa NHIỀU offsets: 0, 1, 2, ... N)
  │    ├─ PARTITION B (chứa NHIỀU offsets: 0, 1, 2, ... M)
  │    └─ PARTITION C (chứa NHIỀU offsets: 0, 1, 2, ... K)
  │
  └─ BROKER 2
       │
       ├─ PARTITION D (chứa NHIỀU offsets)
       └─ PARTITION E (chứa NHIỀU offsets)
```

**Các điểm cốt lõi:**

✅ **1 Broker** → chứa **NHIỀU Partitions** (từ nhiều topics khác nhau)

✅ **1 Partition** → chứa **NHIỀU Messages**, mỗi message có 1 offset riêng

✅ **Offset** → là **số thứ tự** của message trong partition (0, 1, 2, 3,...)

✅ **Offset bắt đầu từ 0** và tăng dần mãi mãi (không bao giờ reset về 0)

✅ **Messages cũ** có thể bị xóa theo retention policy, nhưng **offset không bao giờ giảm**

## 3. Brokers và Clusters

### Broker

**Broker** là một server instance của Kafka. Đây là thành phần thực thi chính trong kiến trúc Kafka.

**Nhiệm vụ của Broker:**
- Lưu trữ dữ liệu của các partitions được gán cho nó
- Xử lý requests từ producers (ghi dữ liệu)
- Xử lý requests từ consumers (đọc dữ liệu)
- Đồng bộ metadata với các brokers khác
- Quản lý replication (sao chép) giữa các brokers

**Đặc điểm:**
- Mỗi broker được định danh bằng một **Broker ID** duy nhất
- Dữ liệu được lưu trữ bền vững trong **commit logs**
- Một broker có thể là **leader** cho một số partitions và **follower** cho các partitions khác

### Kafka Cluster

**Cluster** là tập hợp nhiều brokers làm việc cùng nhau, tạo thành một hệ thống phân tán.

**Lợi ích của Cluster:**
- **High availability**: Nếu một broker chết, các brokers khác tiếp tục hoạt động
- **Load balancing**: Phân phối partitions và traffic qua nhiều brokers
- **Scalability**: Thêm brokers để tăng capacity và throughput
- **Performance**: Có thể xử lý hàng trăm nghìn operations/giây

**Sơ đồ Kafka Cluster:**

```
                    Kafka Cluster
┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Broker 1 │  │ Broker 2 │  │ Broker 3 │ │
│  │  (ID: 1) │  │  (ID: 2) │  │  (ID: 3) │ │
│  │          │  │          │  │          │ │
│  │ Part 0-L │  │ Part 1-L │  │ Part 2-L │ │
│  │ Part 1-F │  │ Part 2-F │  │ Part 0-F │ │
│  │ Part 2-F │  │ Part 0-F │  │ Part 1-F │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                            │
│  L = Leader, F = Follower                  │
│                                            │
│       ┌──────────────────┐                 │
│       │   ZooKeeper      │                 │
│       │ (hoặc KRaft)     │                 │
│       │ Cluster metadata │                 │
│       └──────────────────┘                 │
└────────────────────────────────────────────┘
```

### ZooKeeper và KRaft

**ZooKeeper** (phiên bản cũ):
- Quản lý metadata của cluster (brokers nào đang sống, partition leaders...)
- Điều phối leader election khi broker bị lỗi
- Lưu trữ cấu hình topics, ACLs

**KRaft** (phiên bản mới từ Kafka 2.8+):
- Thay thế ZooKeeper, được tích hợp trực tiếp vào Kafka
- Đơn giản hóa deployment
- Cải thiện khả năng mở rộng và hiệu suất

## 4. Consumer Groups

### Khái niệm

**Consumer Group** là cơ chế cho phép nhiều consumers phối hợp với nhau để đọc dữ liệu từ một topic, mỗi consumer chỉ xử lý một tập hợp con các partitions.

**Nguyên tắc hoạt động:**
- Mỗi partition chỉ được gán cho **một consumer duy nhất** trong một group
- Nếu có nhiều consumers hơn partitions, một số consumers sẽ **idle** (rảnh rỗi)
- Khi consumer mới tham gia hoặc rời khỏi group, Kafka tự động **rebalance** (cân bằng lại)

### Load Balancing với Consumer Groups

**Ví dụ thực tế:**

**Trường hợp 1: Optimal (5 partitions, 5 consumers)**
```
Group: order-processors

Partition 0 ──> Consumer A
Partition 1 ──> Consumer B  
Partition 2 ──> Consumer C
Partition 3 ──> Consumer D
Partition 4 ──> Consumer E

→ Mỗi consumer xử lý 1 partition, tối ưu!
```

**Trường hợp 2: Under-provisioned (5 partitions, 2 consumers)**
```
Partition 0 ──┐
Partition 1 ──┼──> Consumer A (xử lý 3 partitions)
Partition 2 ──┘

Partition 3 ──┬──> Consumer B (xử lý 2 partitions)
Partition 4 ──┘

→ Load không đều, Consumer A quá tải
```

**Trường hợp 3: Over-provisioned (5 partitions, 7 consumers)**
```
Partition 0 ──> Consumer A
Partition 1 ──> Consumer B
Partition 2 ──> Consumer C
Partition 3 ──> Consumer D
Partition 4 ──> Consumer E

Consumer F ──> IDLE (chờ đợi)
Consumer G ──> IDLE (chờ đợi)

→ F và G sẽ chỉ làm việc khi có consumer khác fail
```

### Horizontal Scaling

Consumer Groups cho phép **mở rộng ngang** dễ dàng:

1. **Bắt đầu**: 1 consumer xử lý tất cả
2. **Tăng tải**: Thêm consumers → Kafka tự động chia partitions
3. **Failover**: Consumer chết → partitions được gán lại cho consumers còn lại

### Multiple Consumer Groups (Fan-out Pattern)

Các groups độc lập có thể đọc cùng một topic cho các mục đích khác nhau:

```
Topic: user-events
       │
       ├──> Group: analytics-team
       │    └─> Consumer 1, 2, 3 (phân tích dữ liệu)
       │
       └──> Group: logging-team
            └─> Consumer A, B (ghi logs)

→ Mỗi group đọc toàn bộ topic độc lập
```

### Sơ đồ Rebalancing

```
TRƯỚC rebalance:
Group: processors (3 consumers, 6 partitions)

C1: [P0, P1]
C2: [P2, P3]  
C3: [P4, P5]

↓ Consumer C2 bị crash ↓

SAU rebalance:

C1: [P0, P1, P2]
C3: [P4, P5, P3]

→ Kafka tự động phân phối lại partitions
```

## 5. Replication và Fault Tolerance

### Khái niệm Leader và Follower - Giải thích Chi tiết

#### Tại sao cần Leader và Follower?

Trong hệ thống phân tán, dữ liệu cần được **sao lưu** (replicate) để đảm bảo:
- ✅ **Không mất dữ liệu** khi một server chết
- ✅ **High availability** - hệ thống luôn hoạt động
- ✅ **Fault tolerance** - chịu lỗi tốt

Nhưng khi có nhiều bản sao, ai sẽ quyết định dữ liệu nào là "đúng"? Đây là lý do cần **Leader**.

---

#### Leader là gì?

**Leader** là replica chính thức của một partition, có nhiệm vụ:

1. **Xử lý TẤT CẢ write requests** (ghi dữ liệu)
2. **Xử lý TẤT CẢ read requests** (đọc dữ liệu) - mặc định
3. **Là nguồn sự thật duy nhất** (single source of truth)
4. **Điều phối việc đồng bộ** dữ liệu tới followers

**Ví dụ:**

```
Topic: orders, Partition 0, Replication Factor = 3

         ┌─────────────────────────┐
         │   Broker 1 (LEADER)     │
         │   Partition 0           │
         │                         │
Producer │   [msg0][msg1][msg2]    │
  ════>  │         ↓               │
Ghi vào │   Writes đến đây TRƯỚC  │
Leader  │                         │
         └─────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ↓                   ↓
┌──────────────────┐  ┌──────────────────┐
│ Broker 2 (FOL)   │  │ Broker 3 (FOL)   │
│ Partition 0      │  │ Partition 0      │
│                  │  │                  │
│ [msg0][msg1][msg2]  │ [msg0][msg1][msg2]
│ ↑ Sync từ Leader│  │ ↑ Sync từ Leader │
└──────────────────┘  └──────────────────┘
```

**Quy tắc quan trọng:**
- ❌ Producer **KHÔNG THỂ** ghi trực tiếp vào Follower
- ❌ Consumer **KHÔNG ĐỌC** từ Follower (mặc định)
- ✅ Mọi traffic đều đi qua Leader

---

#### Follower là gì?

**Follower** là các bản sao dự phòng (backup replicas) của partition, có nhiệm vụ:

1. **Liên tục đồng bộ** dữ liệu từ Leader (fetch requests)
2. **Sẵn sàng thay thế** Leader khi Leader chết
3. **KHÔNG xử lý** write/read requests từ clients (mặc định)
4. **Chỉ hoạt động như backup** thụ động

**Quá trình đồng bộ:**

```
BƯỚC 1: Producer ghi message mới

Producer ──[msg3]──> LEADER (Broker 1)
                     Partition 0: [msg0][msg1][msg2][msg3]
                                                       ↑
                                                   Vừa ghi

BƯỚC 2: Follower chủ động fetch từ Leader

LEADER (Broker 1) 
  ↓ Fetch request: "Cho tôi data từ offset 3"
FOLLOWER (Broker 2)
  Partition 0: [msg0][msg1][msg2][msg3]
                                   ↑ Vừa sync

LEADER (Broker 1)
  ↓ Fetch request: "Cho tôi data từ offset 3"  
FOLLOWER (Broker 3)
  Partition 0: [msg0][msg1][msg2][msg3]
                                   ↑ Vừa sync

BƯỚC 3: Tất cả replicas đã sync xong
→ Message được coi là "committed"
```

**Đặc điểm của Follower:**
- ✅ Hoạt động như **consumer đặc biệt** - liên tục đọc từ Leader
- ✅ **Không phục vụ clients** - chỉ sync dữ liệu
- ✅ Có thể bị **lag** (chậm hơn Leader một chút)

---

#### Leader Election - Bầu chọn Leader mới

Khi Leader chết, một Follower sẽ được chọn làm Leader mới.

**Quá trình chi tiết:**

```
TRẠNG THÁI BAN ĐẦU:

┌─────────────────┐
│ Broker 1 ★      │ ← LEADER (xử lý tất cả traffic)
│ Part 0: [0..100]│
└─────────────────┘
        │
    ┌───┴───┐
    │       │
    ↓       ↓
┌─────────┐ ┌─────────┐
│Broker 2 │ │Broker 3 │ ← FOLLOWERS (chỉ sync)
│Part 0   │ │Part 0   │
│[0..100] │ │[0..100] │
└─────────┘ └─────────┘

═══════════════════════════════════

⚠️  Broker 1 BỊ CRASH ⚠️

┌─────────────────┐
│ Broker 1 ✗      │ ← OFFLINE
│ Part 0: [...]   │
└─────────────────┘

═══════════════════════════════════

BƯỚC 1: ZooKeeper/KRaft phát hiện Leader chết (3-5 giây)

BƯỚC 2: Controller chọn Follower trong ISR làm Leader mới
        (thường chọn replica có offset cao nhất)

BƯỚC 3: Broker 2 được thăng chức

┌─────────────────┐
│ Broker 2 ★      │ ← LEADER MỚI (bắt đầu nhận traffic)
│ Part 0: [0..100]│
└─────────────────┘
        │
        │
        ↓
┌─────────────────┐
│ Broker 3        │ ← Vẫn là FOLLOWER (sync từ Leader mới)
│ Part 0: [0..100]│
└─────────────────┘

═══════════════════════════════════

BƯỚC 4: Broker 1 quay lại online

┌─────────────────┐
│ Broker 1        │ ← Trở thành FOLLOWER (không còn là Leader)
│ Part 0: [0..100]│ ← Sync từ Broker 2
└─────────────────┘
        ↑
        │ Sync
        │
┌─────────────────┐
│ Broker 2 ★      │ ← VẪN LÀ LEADER
│ Part 0: [0..105]│
└─────────────────┘
```

**Các điều kiện để trở thành Leader:**

1. ✅ Phải nằm trong **ISR** (In-Sync Replicas) - không bị lag quá xa
2. ✅ Có **offset cao nhất** trong ISR (ưu tiên)
3. ✅ Broker phải **healthy** và đáp ứng được requests

❌ Follower bị lag quá xa (out of ISR) **KHÔNG THỂ** trở thành Leader

---

#### In-Sync Replicas (ISR) - Khái niệm cực kỳ quan trọng

**ISR** là danh sách các replicas đang đồng bộ kịp thời với Leader.

**Tiêu chí nằm trong ISR:**

```python
# Pseudo-code
def is_in_sync(follower, leader):
    lag = leader.leo - follower.leo  # Log End Offset difference
    time_since_last_fetch = now() - follower.last_fetch_time
    
    if lag <= replica_lag_max_messages and \
       time_since_last_fetch <= replica_lag_time_max_ms:
        return True  # Trong ISR
    else:
        return False  # Out of ISR
```

**Ví dụ cụ thể:**

```
Cấu hình: replica.lag.max.messages = 10

Leader (Broker 1):  Offset 1000
Follower A (Broker 2): Offset 998 → Lag = 2 → IN ISR ✅
Follower B (Broker 3): Offset 985 → Lag = 15 → OUT OF ISR ❌

┌──────────────────────────────────┐
│ ISR = [Broker 1, Broker 2]       │
│                                  │
│ Chỉ Broker 1 và 2 mới có thể    │
│ trở thành Leader                 │
└──────────────────────────────────┘
```

**Tại sao ISR quan trọng?**

1. **Đảm bảo không mất dữ liệu**: Chỉ replicas trong ISR mới có đầy đủ data
2. **Leader election**: Chỉ chọn Leader từ ISR
3. **Acknowledgment**: Producer có thể đợi ISR confirm để đảm bảo durability

---

#### Preferred Leader - Leader ưa thích

Mỗi partition có một **Preferred Leader** (thường là replica đầu tiên trong danh sách).

**Ví dụ:**

```
Topic: orders, Partition 0
Replica assignment: [1, 2, 3]
                     ↑
              Preferred Leader = Broker 1
```

**Auto Leader Rebalancing:**

Khi `auto.leader.rebalance.enable = true`, Kafka sẽ tự động đưa leadership về Preferred Leader để **cân bằng tải**.

```
Scenario:

T0: Broker 1 (Preferred Leader) là Leader ✅

T1: Broker 1 restart → Broker 2 trở thành Leader

T2: Broker 1 quay lại → Vẫn là Follower

T3: Auto rebalance kicks in → Broker 1 lại trở thành Leader
    (để cân bằng leadership across brokers)
```

---

#### Read from Follower (Kafka 2.4+)

Từ Kafka 2.4, **consumers có thể đọc từ Followers** trong một số trường hợp:

**Use case:**

```
Cluster phân bố địa lý:

┌──────────────────────┐       ┌──────────────────────┐
│   US Data Center     │       │   EU Data Center     │
│                      │       │                      │
│  Broker 1 (Leader) ★ │       │  Broker 2 (Follower) │
│  Partition 0         │═══════│  Partition 0         │
│                      │ Sync  │                      │
└──────────────────────┘       └──────────────────────┘
                                         ↑
                                    EU Consumer
                                 (đọc từ Follower gần hơn
                                  để giảm latency)
```

**Lợi ích:**
- ✅ Giảm latency cho consumers ở xa
- ✅ Giảm tải cho Leader
- ✅ Giảm băng thông cross-datacenter

**Cấu hình:**

```properties
# Consumer config
fetch.from.follower = true
replica.selector.class = org.apache.kafka.common.replica.RackAwareReplicaSelector
```

---

### Replication (Sao chép dữ liệu)

**Replication** là cơ chế sao chép dữ liệu của mỗi partition sang nhiều brokers để đảm bảo độ tin cậy.

**Các thành phần:**
- **Leader**: Broker xử lý tất cả read/write requests cho partition
- **Followers**: Các broker backup, đồng bộ dữ liệu từ leader
- **Replication Factor**: Số lượng bản sao (thường là 3)

**Ví dụ với Replication Factor = 3:**

```
Partition 0 của Topic "orders"

┌─────────────┐
│  Broker 1   │ ← Leader (nhận writes, xử lý reads)
│  [P0-Leader]│
└─────────────┘
      │
      │ Sync dữ liệu
      ↓
┌─────────────┐   ┌─────────────┐
│  Broker 2   │   │  Broker 3   │
│ [P0-Follower]   │ [P0-Follower]│ ← Followers (backup)
└─────────────┘   └─────────────┘
```

### In-Sync Replicas (ISR)

**ISR** là tập hợp các replicas đang đồng bộ kịp thời với leader.

- Followers trong ISR không bị lag quá xa so với leader
- Chỉ ISR mới có thể trở thành leader mới khi leader cũ fail
- Đảm bảo không mất dữ liệu đã commit

```
Leader: offset 1000
Follower A: offset 998 → IN ISR (lag 2 messages)
Follower B: offset 850 → OUT OF ISR (lag quá nhiều)
```

### Acknowledgments (ACKs)

Producers có thể cấu hình mức độ đảm bảo khi ghi dữ liệu:

| ACK Setting | Mô tả | Độ bền | Latency | Use case |
|-------------|-------|---------|---------|----------|
| `acks=0` | Không đợi ACK | Thấp nhất | Thấp nhất | Logs không quan trọng |
| `acks=1` | Đợi leader ACK | Trung bình | Trung bình | Hầu hết applications |
| `acks=all` | Đợi tất cả ISR ACK | Cao nhất | Cao nhất | Financial transactions |

### Leader Election (Bầu chọn Leader)

Khi leader của một partition bị lỗi:

```
BƯỚC 1: Leader (Broker 1) bị crash
┌─────────────┐
│  Broker 1   │ ✗ CRASHED
│  [P0-Leader]│
└─────────────┘

BƯỚC 2: ZooKeeper/KRaft phát hiện leader chết

BƯỚC 3: Bầu follower trong ISR làm leader mới
┌─────────────┐
│  Broker 2   │ ← NEW LEADER
│ [P0-Leader] │
└─────────────┘
      │
      ↓
┌─────────────┐
│  Broker 3   │ ← Vẫn là follower
│ [P0-Follower]│
└─────────────┘

BƯỚC 4: Broker 1 khởi động lại → trở thành follower

→ Zero downtime, không mất dữ liệu!
```

### Fault Tolerance trong thực tế

**Scenario: Broker failure**

```
Cluster: 5 brokers, replication factor = 3

Ban đầu:
- Broker 1 chết
- Impact: Chỉ các partitions mà Broker 1 là leader bị ảnh hưởng
- Followers của những partitions đó trở thành leaders
- Producers/Consumers tự động kết nối đến leaders mới
- Downtime: < 1 giây

Broker 1 quay lại:
- Tự động sync dữ liệu từ leaders
- Trở thành follower cho các partitions đã mất leadership
```

## 6. Kafka trong Machine Learning Pipelines

### Vai trò của Kafka trong ML

Kafka đóng vai trò là **backbone** (xương sống) của hệ thống ML real-time, kết nối các giai đoạn:

```
Data Sources → Kafka → Data Processing → Kafka → Model Training
                ↓                           ↓
           Feature Store              Model Serving
                                           ↓
                                   Kafka → Predictions → Applications
```

### Pipeline ML thực tế với Kafka

**Ví dụ: Hệ thống gợi ý sản phẩm real-time**

```
1. DATA INGESTION
   User events (clicks, views)
      ↓
   Topic: raw-user-events
   
2. PREPROCESSING  
   Consumer Group: preprocessors
      ↓ (Clean, transform)
   Topic: processed-events
   
3. FEATURE ENGINEERING
   Consumer Group: feature-generators
      ↓ (Calculate features)
   Topic: features
   
4. MODEL INFERENCE
   Consumer Group: ml-models
      ↓ (Predict recommendations)
   Topic: predictions
   
5. SERVING
   Consumer Group: api-servers
      ↓ (Send to users)
   Web/Mobile App
```

### Lợi ích của Kafka cho ML

**1. Decoupling các microservices ML**
- Data ingestion, preprocessing, training, serving hoàn toàn độc lập
- Dễ dàng thay đổi/nâng cấp từng component

**2. Xử lý batch và streaming**
```python
# Batch processing (training)
consumer.seek_to_beginning()  # Đọc lại toàn bộ data
for msg in consumer:
    train_model(msg.value)

# Streaming (inference)
for msg in consumer:
    prediction = model.predict(msg.value)
    producer.send('predictions', prediction)
```

**3. Replay data cho retraining**
- Lưu trữ lâu dài (tuần/tháng) cho phép retraining với historical data
- Debug models bằng cách replay specific time ranges

**4. Fault tolerance**
- Pipeline không bị gián đoạn khi một service tạm ngừng
- Messages được buffer trong Kafka, không bị mất

**5. Scalability**
- Tăng consumers khi traffic tăng
- Tăng partitions để xử lý parallel nhiều hơn

### Demo Implementation

Từ video Mì AI, có một repo GitHub minh họa: [https://github.com/thangnch/MiAi_Kafka](https://github.com/thangnch/MiAi_Kafka)

**Kiến trúc đơn giản:**

```python
# Producer: Gửi raw data
producer = KafkaProducer(bootstrap_servers='localhost:9092')
producer.send('ml-input', value=json.dumps(data))

# Consumer 1: Preprocessing
consumer = KafkaConsumer('ml-input', group_id='preprocessors')
for msg in consumer:
    processed = preprocess(msg.value)
    producer.send('ml-processed', value=processed)

# Consumer 2: Inference
consumer = KafkaConsumer('ml-processed', group_id='models')
for msg in consumer:
    prediction = model.predict(msg.value)
    producer.send('ml-predictions', value=prediction)
```

### Best Practices cho ML với Kafka

1. **Partition strategy**: Dùng user_id làm key để đảm bảo events của cùng user vào cùng partition (đảm bảo order)

2. **Schema management**: Dùng Avro/Protobuf với Schema Registry để validate data format

3. **Monitoring**: Theo dõi lag của consumers để phát hiện bottlenecks

4. **Retention policy**: Cấu hình retention phù hợp (vd: 7 ngày cho raw data, 30 ngày cho processed features)

### Sơ đồ ML Pipeline hoàn chỉnh

```
┌─────────────────┐
│  Data Sources   │
│ (Apps, IoT, DB) │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│     Kafka Topic: raw-events     │
│  Partitions: 10, RF: 3          │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Consumer Group: preprocessors  │
│  (5 instances, auto-scaling)    │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Kafka Topic: features          │
│  (Feature Store)                │
└────────┬────────────────────────┘
         │
         ├──→ Model Training (Batch)
         │
         └──→ Model Inference (Stream)
                    ↓
         ┌──────────────────────┐
         │ Topic: predictions   │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │  API Services        │
         │  (Serve to users)    │
         └──────────────────────┘
```

## 7. Setup và Thực hành

### Docker Compose setup đơn giản

```yaml
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

### Lệnh CLI cơ bản

```bash
# Tạo topic
kafka-topics --create --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 3 --replication-factor 1

# List topics
kafka-topics --list --bootstrap-server localhost:9092

# Gửi messages
kafka-console-producer --topic my-topic \
  --bootstrap-server localhost:9092

# Đọc messages
kafka-console-consumer --topic my-topic \
  --from-beginning --bootstrap-server localhost:9092

# Xem consumer groups
kafka-consumer-groups --list --bootstrap-server localhost:9092

# Xem lag
kafka-consumer-groups --describe --group my-group \
  --bootstrap-server localhost:9092
```

## Kết luận

Apache Kafka là công nghệ nền tảng cho các hệ thống real-time hiện đại, đặc biệt trong lĩnh vực machine learning và big data. Những khái niệm cốt lõi bao gồm:

✅ **Producers/Consumers**: Mô hình push-pull linh hoạt, decoupled  
✅ **Topics/Partitions**: Phân loại và song song hóa dữ liệu  
✅ **Brokers/Clusters**: Hệ thống phân tán, fault-tolerant  
✅ **Consumer Groups**: Load balancing và horizontal scaling  
✅ **Replication**: Đảm bảo độ bền và availability  