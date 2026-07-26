// Lộ trình học System Design Interview — 13 buổi.
// Nguồn: lộ trình khóa học, đối chiếu bảng ánh xạ trong
// docs/ai/requirements/2026-07-26-feature-system-design.md
//
// Mỗi buổi có:
//   order          — số thứ tự, quyết định thứ tự hiển thị
//   slug           — URL /system-design/<slug>, không đổi sau khi phát hành
//   summary        — một câu mô tả ở trang lộ trình
//   keywords       — phục vụ ô search
//   keyTakeaway    — một dòng chốt, dùng lại ở trang cheat-sheet
//   sections       — nội dung bài; thuật ngữ bọc [[Term]] để link sang glossary
//   flashcards     — câu hỏi phỏng vấn để tự kiểm tra
//
// sections/flashcards được điền dần theo milestone M2-M5 của kế hoạch.

import { Lesson } from '@/models/system-design'

export const LESSONS: Lesson[] = [
  {
    order: 1,
    slug: 'nguyen-ly-cap-microservices',
    title: 'Nhập môn System Design Interview, CAP & Microservices',
    summary:
      'Buổi phỏng vấn System Design đánh giá điều gì, định lý CAP, và khi nào nên tách microservices.',
    track: 'Nền tảng',
    keywords: ['system design interview', 'CAP', 'microservices', 'monolith', 'consistency'],
    readingMinutes: 12,
    sections: [
      {
        heading: 'Buổi phỏng vấn này thực sự đánh giá điều gì',
        body: [
          'Khác với phỏng vấn thuật toán vốn có một đáp án đúng, System Design Interview là bài kiểm tra khả năng ra quyết định khi thiếu thông tin. Người phỏng vấn cố tình đưa một đề bài mơ hồ — "thiết kế Twitter" — và quan sát bạn biến nó thành một bài toán kỹ thuật có ràng buộc rõ ràng. Không có kiến trúc nào đúng tuyệt đối; chỉ có kiến trúc phù hợp với ràng buộc mà bạn đã nêu ra và bảo vệ được.',
          'Bốn thứ được chấm điểm: (1) bạn có làm rõ yêu cầu trước khi vẽ không; (2) bạn có ước lượng được quy mô để chọn công nghệ có cơ sở không; (3) bạn có nhận ra điểm nghẽn của chính thiết kế mình vừa vẽ không; (4) bạn có nói được vì sao chọn phương án này thay vì phương án kia. Điểm thứ tư là thứ phân biệt ứng viên senior — họ không trình bày một kiến trúc, họ trình bày một chuỗi đánh đổi.',
          'Lỗi phổ biến nhất không phải là thiếu kiến thức, mà là vẽ ngay khi vừa nghe đề. Ứng viên vẽ [[Load Balancer]], [[Cache]], [[Database]] trong ba phút đầu rồi mắc kẹt vì không biết hệ thống cần chịu bao nhiêu người dùng, đọc nhiều hay ghi nhiều, chấp nhận trễ bao lâu.',
        ],
        callout:
          'Câu hỏi mở đầu tốt nhất không phải "dùng SQL hay NoSQL" mà là "hệ thống này phục vụ bao nhiêu người dùng hoạt động mỗi ngày, và tỉ lệ đọc trên ghi khoảng bao nhiêu?".',
      },
      {
        heading: 'Định lý CAP: bạn chỉ thực sự phải chọn khi mạng đứt',
        body: [
          'CAP nói rằng một hệ phân tán không thể đồng thời bảo đảm cả ba: Consistency (mọi lần đọc đều thấy dữ liệu mới nhất), Availability (mọi request đều nhận được phản hồi), và Partition tolerance (hệ thống vẫn chạy khi mạng giữa các node bị đứt).',
          'Cách hiểu sai phổ biến là coi đây như một menu chọn hai trong ba. Thực tế, với bất kỳ hệ thống nào chạy trên nhiều máy, phân vùng mạng là chuyện chắc chắn sẽ xảy ra — cáp đứt, switch lỗi, một data center mất kết nối. Nghĩa là P không phải thứ để chọn, mà là điều kiện bắt buộc phải chịu đựng. Lựa chọn thật chỉ xuất hiện tại thời điểm mạng đứt: lúc đó bạn ưu tiên C hay A.',
          'Khi mạng bình thường, hệ thống hoàn toàn có thể vừa nhất quán vừa sẵn sàng. Đó là lý do định lý này chỉ hữu ích như một khung suy nghĩ cho tình huống hỏng hóc, không phải nhãn dán vĩnh viễn cho một database.',
        ],
        diagram: `flowchart TD
  P{"Mạng giữa các node có đứt?"} -->|Không| OK["Vừa nhất quán vừa sẵn sàng"]
  P -->|Có| CH{"Buộc phải chọn một"}
  CH -->|"Ưu tiên nhất quán (CP)"| CP["Từ chối phục vụ — dữ liệu luôn đúng"]
  CH -->|"Ưu tiên sẵn sàng (AP)"| AP["Vẫn phục vụ — dữ liệu có thể cũ"]`,
        table: {
          headers: ['Ưu tiên', 'Hành vi khi mạng đứt', 'Hợp với bài toán', 'Ví dụ hệ thống'],
          rows: [
            [
              'CP — nhất quán',
              'Từ chối request thay vì trả dữ liệu có thể sai',
              'Số dư tài khoản, tồn kho, đặt chỗ',
              'HBase, MongoDB (mặc định), etcd',
            ],
            [
              'AP — sẵn sàng',
              'Vẫn trả lời bằng dữ liệu cũ, đồng bộ lại sau',
              'Newsfeed, đếm lượt xem, giỏ hàng',
              'Cassandra, DynamoDB, Riak',
            ],
          ],
        },
        callout:
          'Trong phỏng vấn, đừng nói "tôi chọn AP". Hãy nói "nghiệp vụ này chấp nhận thấy dữ liệu cũ vài giây nên tôi ưu tiên sẵn sàng, nhưng riêng luồng thanh toán thì tôi tách ra và ưu tiên nhất quán".',
      },
      {
        heading: 'Nhất quán không phải công tắc bật hoặc tắt',
        body: [
          'CAP trình bày C như một giá trị nhị phân, nhưng thực tế nhất quán là một dải mức độ, và chọn đúng mức là chỗ thể hiện kinh nghiệm.',
          'Strong consistency bảo đảm sau khi ghi thành công, mọi lần đọc ở bất kỳ node nào đều thấy giá trị mới. Đổi lại là [[Latency]] cao hơn vì phải chờ đồng thuận giữa các node. Eventual consistency chỉ hứa rằng nếu ngừng ghi, sau một khoảng thời gian mọi node sẽ hội tụ về cùng giá trị — nhanh hơn nhiều nhưng người dùng có thể đọc phải dữ liệu cũ. Read-your-writes là mức trung gian rất hữu dụng: người dùng luôn thấy thay đổi của chính mình, còn thay đổi của người khác thì có thể trễ. Đây chính là mô hình mà phần lớn mạng xã hội dùng.',
          'Một điểm cộng lớn khi phỏng vấn là chỉ ra rằng mức nhất quán nên chọn theo từng luồng chứ không theo cả hệ thống. Cùng một ứng dụng thương mại điện tử, luồng trừ tồn kho cần strong consistency, còn luồng hiển thị số lượt đánh giá thì eventual là quá đủ.',
          'Cũng nên biết PACELC như một phần mở rộng: kể cả khi mạng không đứt (Else), bạn vẫn phải đánh đổi giữa Latency và Consistency. Đây là đánh đổi diễn ra hằng ngày, còn CAP chỉ mô tả tình huống hỏng hóc.',
        ],
      },
      {
        heading: 'Monolith hay Microservices',
        body: [
          '[[Microservices]] chia ứng dụng thành nhiều dịch vụ nhỏ, mỗi dịch vụ sở hữu database riêng và deploy độc lập. Ưu điểm thường được nhắc: mỗi đội tự triển khai không chờ nhau, scale riêng phần đang nghẽn, một dịch vụ chết không kéo sập toàn hệ thống.',
          'Cái giá ít được nhắc thì lớn hơn nhiều. Lời gọi hàm trong bộ nhớ biến thành lời gọi qua mạng, kèm theo [[Latency]] và khả năng thất bại. Transaction trải trên nhiều database nên không còn dùng được ACID đơn giản, phải chuyển sang saga hoặc chấp nhận eventual consistency. Debug một request phải lần qua nhiều dịch vụ nên bắt buộc có distributed tracing. Và mọi lời gọi qua mạng đều cần cơ chế retry, kéo theo yêu cầu về [[Idempotency]] để retry không tạo ra hai đơn hàng.',
          'Nguyên tắc thực dụng: microservices giải quyết vấn đề tổ chức nhiều hơn vấn đề kỹ thuật. Nếu chỉ có một đội mười người, monolith được cấu trúc tốt gần như luôn là lựa chọn đúng. Ranh giới dịch vụ nên cắt theo miền nghiệp vụ, không cắt theo tầng kỹ thuật — tách "Order", "Payment", "Shipping" thì hợp lý, còn tách "Controller service", "Database service" thì chỉ tạo ra một monolith phân tán với đủ nhược điểm của cả hai mô hình.',
        ],
        diagram: `flowchart LR
  U["Client"] --> G["API Gateway"]
  G --> O["Order Service"]
  G --> P["Payment Service"]
  G --> S["Shipping Service"]
  O --> DO[("DB Order")]
  P --> DP[("DB Payment")]
  S --> DS[("DB Shipping")]`,
        table: {
          headers: ['Tiêu chí', 'Monolith', 'Microservices'],
          rows: [
            ['Triển khai', 'Một lần, đơn giản', 'Độc lập từng dịch vụ, cần CI/CD trưởng thành'],
            ['Transaction', 'ACID trong một [[Database]]', 'Saga, bù trừ, eventual consistency'],
            ['Gỡ lỗi', 'Đọc một stack trace', 'Cần distributed tracing'],
            ['Scale', 'Nhân bản cả khối', 'Scale riêng phần nghẽn'],
            ['Hợp khi', 'Đội nhỏ, miền nghiệp vụ chưa rõ', 'Nhiều đội, ranh giới nghiệp vụ đã ổn định'],
          ],
        },
        callout:
          'Nếu người phỏng vấn hỏi "có nên dùng microservices không", câu trả lời an toàn và đúng là hỏi ngược lại về quy mô đội và tốc độ triển khai — chứ không phải chọn phe.',
      },
      {
        heading: 'Khung tư duy mang vào buổi phỏng vấn',
        body: [
          'Ba nguyên lý dưới đây đủ dùng cho hầu hết đề bài ở buổi đầu. Thứ nhất, luôn hỏi trước khi vẽ: người dùng hoạt động mỗi ngày, tỉ lệ đọc/ghi, kích thước dữ liệu, mức trễ chấp nhận được. Thứ hai, nêu rõ đánh đổi ngay khi đưa ra một lựa chọn — thêm [[Cache]] thì phải nói luôn về dữ liệu cũ và chiến lược làm mới. Thứ ba, thiết kế cho lỗi: giả định mọi lời gọi qua mạng đều có thể thất bại, và mọi retry đều có thể gửi trùng.',
          'Về khối lượng, phần lớn hệ thống thực tế đọc nhiều hơn ghi rất nhiều — tỉ lệ 100:1 hoặc hơn là chuyện bình thường với mạng xã hội và thương mại điện tử. Nhận ra điều này sớm giúp bạn tập trung vào [[Cache]], [[CDN]] và bản sao đọc thay vì tối ưu tầng ghi vốn ít áp lực hơn. Ngược lại, hệ thống ghi nặng như thu thập log hay đo lường lại cần hàng đợi và ghi theo lô.',
        ],
        callout:
          'Một câu đáng thuộc: "Tôi sẽ bắt đầu từ phương án đơn giản nhất chạy được, rồi chỉ thêm phức tạp ở đúng chỗ số liệu cho thấy bị nghẽn."',
      },
    ],
    flashcards: [
      {
        question: 'Định lý CAP nói gì, và vì sao nói "chọn hai trong ba" là cách hiểu sai?',
        answer:
          'CAP nói hệ phân tán không thể đồng thời bảo đảm Consistency, Availability và Partition tolerance. Nói "chọn hai trong ba" là sai vì phân vùng mạng không phải thứ để chọn — nó chắc chắn xảy ra với mọi hệ chạy trên nhiều máy. Lựa chọn thật chỉ xuất hiện lúc mạng đứt: khi đó ưu tiên nhất quán (từ chối phục vụ) hay ưu tiên sẵn sàng (trả dữ liệu có thể cũ). Khi mạng bình thường, hệ thống vừa nhất quán vừa sẵn sàng được.',
        pitfall:
          'Trả lời kiểu "MySQL là CA" — không tồn tại hệ phân tán CA, vì bỏ P nghĩa là chỉ chạy trên một máy.',
      },
      {
        question: 'Khi nào chọn strong consistency, khi nào eventual là đủ?',
        answer:
          'Chọn strong consistency khi đọc sai dữ liệu gây thiệt hại không đảo ngược được: số dư tài khoản, trừ tồn kho, đặt chỗ. Chọn eventual khi dữ liệu cũ vài giây không gây hại: số lượt thích, newsfeed, số lượt xem. Điểm quan trọng là chọn theo từng luồng nghiệp vụ chứ không theo cả hệ thống — cùng một ứng dụng có thể dùng cả hai.',
        pitfall:
          'Áp một mức nhất quán cho toàn hệ thống. Nói được "luồng này strong, luồng kia eventual" là điểm cộng rõ rệt.',
      },
      {
        question: 'Cái giá thật của việc chuyển sang microservices là gì?',
        answer:
          'Lời gọi hàm trong bộ nhớ trở thành lời gọi qua mạng, kèm độ trễ và khả năng thất bại. Transaction trải nhiều database nên mất ACID đơn giản, phải dùng saga hoặc chấp nhận eventual consistency. Gỡ lỗi cần distributed tracing. Retry bắt buộc kéo theo yêu cầu idempotency. Vận hành cần CI/CD, monitoring và service discovery trưởng thành.',
        pitfall:
          'Chỉ kể ưu điểm. Người phỏng vấn muốn nghe bạn nhận ra microservices giải quyết vấn đề tổ chức nhiều hơn vấn đề kỹ thuật.',
      },
      {
        question: 'Ranh giới giữa các microservice nên cắt theo tiêu chí nào?',
        answer:
          'Cắt theo miền nghiệp vụ — Order, Payment, Shipping — sao cho mỗi dịch vụ sở hữu dữ liệu của mình và thay đổi vì một lý do nghiệp vụ duy nhất. Không cắt theo tầng kỹ thuật.',
        pitfall:
          'Tách kiểu "service controller", "service database" tạo ra monolith phân tán: vẫn phải deploy đồng thời nhưng lại chịu thêm độ trễ mạng.',
      },
      {
        question: 'Vì sao câu hỏi đầu tiên nên là về quy mô và tỉ lệ đọc/ghi?',
        answer:
          'Vì hai con số này quyết định gần như mọi lựa chọn sau đó. Đọc nhiều hơn ghi rất nhiều thì trọng tâm là cache, CDN và bản sao đọc. Ghi nặng thì cần hàng đợi, ghi theo lô và sharding. Không có hai con số này, mọi lựa chọn công nghệ đều là đoán mò.',
        pitfall:
          'Vẽ kiến trúc ngay trong ba phút đầu. Đây là lỗi trừ điểm phổ biến nhất ở buổi phỏng vấn System Design.',
      },
      {
        question: 'PACELC bổ sung gì so với CAP?',
        answer:
          'PACELC nói: nếu có phân vùng (P) thì chọn giữa Availability và Consistency; còn ngược lại (Else) thì vẫn phải chọn giữa Latency và Consistency. Nó mô tả đánh đổi diễn ra hằng ngày, trong khi CAP chỉ mô tả tình huống hỏng hóc hiếm gặp.',
        pitfall:
          'Nghĩ rằng khi mạng khỏe thì được cả nhất quán lẫn nhanh. Đồng thuận giữa các node luôn tốn thời gian đi về trên mạng.',
      },
    ],
    keyTakeaway:
      'CAP buộc chọn giữa nhất quán và sẵn sàng khi mạng phân vùng — nói rõ mình chọn gì và vì sao.',
    relatedTerms: ['Microservices', 'Latency', 'API'],
  },
  {
    order: 2,
    slug: 'load-balancer-va-database',
    title: 'Load balancer & Database: replication, sharding',
    summary:
      'Các tầng load balancer, lưu trữ phân tán, chọn loại database theo tình huống, replication và sharding.',
    track: 'Kiến thức lõi',
    keywords: ['load balancer', 'database', 'replication', 'sharding', 'SQL', 'NoSQL'],
    readingMinutes: 15,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Sharding giải quyết giới hạn ghi, replication giải quyết giới hạn đọc — đừng nhầm hai bài toán.',
    relatedTerms: ['Load Balancer', 'Database', 'Leader / Follower'],
  },
  {
    order: 3,
    slug: 'networking-he-phan-tan',
    title: 'Networking cho hệ phân tán',
    summary:
      'HTTPS, REST, HTTP polling, WebSocket, gRPC, GraphQL và cách DNS phân giải tên miền.',
    track: 'Kiến thức lõi',
    keywords: ['HTTPS', 'REST', 'WebSocket', 'gRPC', 'GraphQL', 'DNS', 'polling'],
    readingMinutes: 14,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Chọn giao thức theo hướng đẩy dữ liệu: client hỏi thì REST/polling, server đẩy thì WebSocket/SSE.',
    relatedTerms: ['REST', 'GraphQL', 'WebSocket', 'DNS'],
  },
  {
    order: 4,
    slug: 'caching-message-queue-monitoring',
    title: 'Caching, message queue & monitoring',
    summary:
      'Distributed cache (Redis, DynamoDB), message queue và pub/sub, cùng cách giám sát hệ thống.',
    track: 'Kiến thức lõi',
    keywords: ['cache', 'Redis', 'message queue', 'pub/sub', 'Kafka', 'monitoring'],
    readingMinutes: 15,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Cache mua tốc độ bằng nguy cơ dữ liệu cũ — luôn nói rõ chiến lược invalidation.',
    relatedTerms: ['Cache', 'Kafka', 'Backpressure'],
  },
  {
    order: 5,
    slug: 'cdn-blobstore-search-logging',
    title: 'Distributed file storage, search & logging',
    summary:
      'CDN, thiết kế blobstore, distributed search (Solr/Elasticsearch) và distributed logging.',
    track: 'Kiến thức lõi',
    keywords: ['CDN', 'blobstore', 'S3', 'Elasticsearch', 'Solr', 'logging'],
    readingMinutes: 14,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'File lớn đi thẳng vào blobstore qua pre-signed URL, database chỉ giữ metadata.',
    relatedTerms: ['CDN', 'Latency'],
  },
  {
    order: 6,
    slug: 'framework-tra-loi-phong-van',
    title: 'Framework trả lời phỏng vấn System Design',
    summary:
      'Tuần tự các bước trong buổi phỏng vấn 45 phút và cách phân bổ thời gian cho từng bước.',
    track: 'Framework',
    keywords: ['framework', 'phỏng vấn', 'requirement', 'ước lượng', 'trade-off'],
    readingMinutes: 12,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Làm rõ yêu cầu và ước lượng quy mô trước khi vẽ — nhảy thẳng vào kiến trúc là lỗi trừ điểm phổ biến nhất.',
  },
  {
    order: 7,
    slug: 'case-study-tinyurl',
    title: 'Case study — Thiết kế TinyURL',
    summary: 'Hệ thống rút gọn URL: sinh mã, chống trùng, đọc nhiều hơn ghi rất nhiều.',
    track: 'Case study',
    keywords: ['TinyURL', 'URL shortener', 'base62', 'hash', 'redirect'],
    readingMinutes: 15,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Tỉ lệ đọc/ghi rất lệch nên cache và CDN quan trọng hơn tối ưu tầng ghi.',
    relatedTerms: ['Cache', 'CDN'],
  },
  {
    order: 8,
    slug: 'case-study-youtube',
    title: 'Case study — Thiết kế YouTube',
    summary: 'Lưu trữ video và ảnh, pipeline transcode, tìm kiếm video, like và comment.',
    track: 'Case study',
    keywords: ['YouTube', 'video', 'transcode', 'streaming', 'CDN', 'blobstore'],
    readingMinutes: 18,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Upload và transcode phải bất đồng bộ qua queue — người dùng không chờ được quá trình mã hóa.',
    relatedTerms: ['CDN', 'Kafka'],
  },
  {
    order: 9,
    slug: 'case-study-social-media',
    title: 'Case study — Thiết kế mạng xã hội',
    summary: 'Newsfeed, follow, post và bài toán fan-out; khi nào cần GraphDB.',
    track: 'Case study',
    keywords: ['newsfeed', 'fan-out', 'follow', 'GraphDB', 'timeline'],
    readingMinutes: 18,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Fan-out khi ghi cho người thường, fan-out khi đọc cho người nổi tiếng — hệ thật dùng cả hai.',
    relatedTerms: ['Cache', 'Database'],
  },
  {
    order: 10,
    slug: 'case-study-typeahead',
    title: 'Case study — Thiết kế Typeahead Suggestion',
    summary: 'Gợi ý từ khóa kiểu Google Search: cấu trúc trie, xếp hạng và cập nhật.',
    track: 'Case study',
    keywords: ['typeahead', 'autocomplete', 'trie', 'ranking', 'prefix'],
    readingMinutes: 15,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Trie cắt sẵn top-k tại mỗi node, đổi bộ nhớ lấy độ trễ vài mili-giây.',
    relatedTerms: ['Cache', 'Latency'],
  },
  {
    order: 11,
    slug: 'case-study-taxi-booking',
    title: 'Case study — Thiết kế đặt xe (Grab/Uber)',
    summary:
      'Ghép tài xế với khách, đánh chỉ mục vị trí địa lý và cập nhật vị trí thời gian thực.',
    track: 'Case study',
    keywords: ['Grab', 'Uber', 'geohash', 'quadtree', 'matching', 'realtime'],
    readingMinutes: 18,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Chia không gian thành ô (geohash/quadtree) để thu hẹp phạm vi tìm tài xế trước khi tính khoảng cách thật.',
    relatedTerms: ['WebSocket', 'Cache'],
  },
  {
    order: 12,
    slug: 'case-study-messaging',
    title: 'Case study — Thiết kế ứng dụng nhắn tin',
    summary:
      'Chat một-một và nhóm, đảm bảo thứ tự tin nhắn, trạng thái online, xử lý hàng triệu request mỗi phút.',
    track: 'Case study',
    keywords: ['messaging', 'chat', 'WebSocket', 'presence', 'inbox', 'Zalo'],
    readingMinutes: 18,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Kết nối dài (WebSocket) cần tầng session riêng để biết người dùng đang bám vào máy chủ nào.',
    relatedTerms: ['WebSocket', 'Kafka'],
  },
  {
    order: 13,
    slug: 'tu-luyen-mock-interview',
    title: 'Tự luyện Mock Interview',
    summary:
      'Khung thời gian 45 phút, bộ đề tự luyện và checklist tiêu chí tự chấm sau khi trình bày.',
    track: 'Luyện tập',
    keywords: ['mock interview', 'tự luyện', 'rubric', '45 phút'],
    readingMinutes: 10,
    sections: [],
    flashcards: [],
    keyTakeaway:
      'Bấm giờ thật và nói thành tiếng — nghĩ trong đầu luôn thấy trôi chảy hơn lúc phải trình bày.',
  },
]
