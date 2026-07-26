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
    sections: [
      {
        heading: 'Load balancer làm gì và đặt ở đâu',
        body: [
          '[[Load Balancer]] nhận request từ client rồi phân phối xuống nhiều máy chủ phía sau. Ba việc nó làm: chia tải để không máy nào quá tải, loại máy chết ra khỏi vòng quay nhờ health check, và che giấu số lượng máy thật khỏi client. Một hệ thống nghiêm túc thường có nhiều tầng cân bằng tải chứ không chỉ một: DNS phân giải về nhiều địa chỉ, một tầng cân bằng tải ở biên, rồi các tầng nội bộ giữa các dịch vụ.',
          'Phân biệt quan trọng nhất là tầng 4 so với tầng 7. Cân bằng tải tầng 4 chỉ nhìn địa chỉ IP và cổng, chuyển tiếp gói tin mà không đọc nội dung — rất nhanh, rất ít tốn tài nguyên, nhưng không định tuyến theo đường dẫn được. Tầng 7 đọc được HTTP nên định tuyến theo URL, theo header, kết thúc TLS tại đó, nén, và ghi log chi tiết; đổi lại tốn CPU hơn và thêm chút [[Latency]]. Trong phỏng vấn, nói được "tôi dùng tầng 4 cho lưu lượng thô và tầng 7 cho định tuyến theo đường dẫn" là đủ.',
          'Về thuật toán phân phối: round robin đơn giản nhưng giả định mọi request tốn như nhau. Least connections tốt hơn khi thời gian xử lý chênh lệch. Consistent hashing dùng khi máy chủ giữ trạng thái hoặc cache cục bộ — thêm bớt một máy chỉ xáo trộn một phần nhỏ khóa thay vì toàn bộ.',
        ],
        diagram: `flowchart TD
  C["Client"] --> DNS["DNS"]
  DNS --> LB4["LB tầng 4 — chia lưu lượng thô"]
  LB4 --> LB7["LB tầng 7 — định tuyến theo URL"]
  LB7 --> A["App server 1"]
  LB7 --> B["App server 2"]
  LB7 --> D["App server 3"]
  A --> P[("Primary DB")]
  B --> P
  D --> P
  P --> R1[("Replica đọc 1")]
  P --> R2[("Replica đọc 2")]`,
        table: {
          headers: ['Thuật toán', 'Cách chia', 'Hợp khi', 'Điểm yếu'],
          rows: [
            ['Round robin', 'Lần lượt từng máy', 'Request đồng đều, máy chủ không trạng thái', 'Máy yếu nhận bằng máy khỏe'],
            ['Least connections', 'Máy đang ít kết nối nhất', 'Thời gian xử lý chênh lệch nhiều', 'Cần theo dõi trạng thái kết nối'],
            ['Consistent hashing', 'Băm khóa về vòng tròn máy chủ', 'Máy chủ giữ cache hoặc phiên cục bộ', 'Phức tạp hơn, cần virtual node để chia đều'],
          ],
        },
        callout:
          'Sticky session nghe tiện nhưng là bẫy: nó biến máy chủ thành có trạng thái, làm hỏng khả năng scale ngang. Tốt hơn là đẩy phiên ra [[Cache]] dùng chung.',
      },
      {
        heading: 'Replication: nhân bản để đọc nhiều và để không mất dữ liệu',
        body: [
          'Replication tạo bản sao dữ liệu trên nhiều máy. Mô hình phổ biến nhất là [[Leader / Follower]]: mọi lệnh ghi đi vào leader, các follower sao chép lại và phục vụ lệnh đọc. Nó giải quyết hai bài toán khác nhau — tăng khả năng đọc, và giữ dữ liệu sống sót khi một máy chết.',
          'Điểm mấu chốt là chọn sao chép đồng bộ hay bất đồng bộ. Đồng bộ nghĩa là leader chờ follower xác nhận rồi mới báo ghi thành công: không mất dữ liệu khi leader chết, nhưng mỗi lệnh ghi gánh thêm một vòng đi về trên mạng, và nếu follower chậm thì ghi bị chặn. Bất đồng bộ thì leader trả lời ngay: nhanh hơn nhiều, nhưng nếu leader chết trước khi kịp sao chép thì phần dữ liệu đó mất vĩnh viễn. Nhiều hệ thống chọn đường giữa — đồng bộ với một follower, bất đồng bộ với phần còn lại.',
          'Hệ quả trực tiếp: replication lag. Người dùng vừa đăng một bình luận rồi tải lại trang và không thấy bình luận của mình, vì lệnh đọc rơi vào một replica chưa kịp cập nhật. Cách xử lý là đọc-sau-ghi cho chính người vừa ghi: trong vài giây đầu, định tuyến lệnh đọc của họ về leader.',
          'Cũng nên biết rằng replication không giúp gì cho giới hạn ghi. Mọi lệnh ghi vẫn dồn về một leader duy nhất. Khi tầng ghi hết chỗ, câu trả lời là sharding chứ không phải thêm replica.',
        ],
        callout:
          'Nói rõ trong phỏng vấn: replica giải quyết áp lực đọc, shard giải quyết áp lực ghi. Nhầm hai thứ này là lỗi thường gặp.',
      },
      {
        heading: 'Sharding: chia dữ liệu khi một máy không chứa nổi',
        body: [
          'Sharding cắt dữ liệu thành nhiều phần, mỗi phần nằm trên một cụm máy riêng. Khác replication ở chỗ mỗi shard giữ một tập dữ liệu khác nhau, không phải bản sao của cùng một tập.',
          'Chọn khóa chia (shard key) là quyết định khó đảo ngược nhất trong cả bài toán. Chia theo dải giá trị cho phép truy vấn theo khoảng hiệu quả, nhưng dễ tạo điểm nóng — chia theo thời gian thì toàn bộ lệnh ghi hôm nay dồn vào một shard. Chia theo băm phân bố đều hơn nhưng mất khả năng quét theo khoảng. Chia theo thư mục tra cứu thì linh hoạt nhất nhưng bảng tra cứu tự nó thành điểm chết duy nhất.',
          'Ba hệ quả đau đớn cần nói được. Thứ nhất, truy vấn không kèm shard key phải hỏi tất cả các shard rồi gộp kết quả — chậm và tốn. Thứ hai, join giữa hai shard khác nhau gần như không làm được, nên thường phải chấp nhận lặp dữ liệu. Thứ ba, tái cân bằng khi thêm shard là chiến dịch vận hành thực sự; dùng consistent hashing hoặc shard ảo ngay từ đầu sẽ đỡ hơn nhiều so với chia dư theo modulo số máy.',
          'Điểm nóng ([[Hot Partition]]) là rủi ro dễ bị hỏi nhất: một người nổi tiếng có mười triệu người theo dõi sẽ làm shard chứa họ quá tải trong khi các shard khác rảnh rỗi. Cách xử lý gồm thêm hậu tố ngẫu nhiên vào khóa để rải, hoặc tách riêng nhóm dữ liệu nóng.',
        ],
        diagram: `flowchart LR
  Q["Truy vấn"] --> RT{"Có shard key?"}
  RT -->|Có| ONE["Hỏi đúng 1 shard — nhanh"]
  RT -->|Không| ALL["Hỏi mọi shard rồi gộp — chậm"]
  ONE --> S1[("Shard 1")]
  ALL --> S1
  ALL --> S2[("Shard 2")]
  ALL --> S3[("Shard 3")]`,
        table: {
          headers: ['Cách chia', 'Ưu điểm', 'Rủi ro'],
          rows: [
            ['Theo dải giá trị', 'Truy vấn theo khoảng hiệu quả', 'Điểm nóng khi dữ liệu lệch theo thời gian'],
            ['Theo băm', 'Phân bố đều', 'Mất truy vấn theo khoảng'],
            ['Theo thư mục tra cứu', 'Linh hoạt, đổi ánh xạ dễ', 'Bảng tra cứu thành điểm chết duy nhất'],
          ],
        },
      },
      {
        heading: 'Chọn loại database theo tình huống',
        body: [
          'Câu hỏi "SQL hay NoSQL" gần như luôn được hỏi, và câu trả lời tệ nhất là chọn phe. Câu trả lời tốt bắt đầu từ hình dạng truy vấn và yêu cầu nhất quán.',
          'Cơ sở dữ liệu quan hệ ([[SQL]]) mạnh khi dữ liệu có quan hệ rõ ràng, cần transaction ACID và truy vấn linh hoạt chưa biết trước. Chúng đi xa hơn nhiều người tưởng — một máy chủ được cấu hình tốt phục vụ hàng chục nghìn giao dịch mỗi giây là bình thường. Đừng vội bỏ nó chỉ vì nghe từ "quy mô lớn".',
          'Kho khóa-giá trị hợp với tra cứu theo một khóa duy nhất, độ trễ cực thấp: phiên đăng nhập, giới hạn tần suất, bộ đệm. Kho theo cột rộng hợp với ghi rất nặng và truy vấn theo khóa đã biết trước, ví dụ chuỗi thời gian hay bảng tin. Cơ sở dữ liệu tài liệu hợp khi mỗi bản ghi tự chứa và lược đồ hay thay đổi. Cơ sở dữ liệu đồ thị hợp khi bản thân quan hệ mới là thứ cần truy vấn nhiều bậc, như gợi ý bạn bè.',
          'Một điểm cộng khi phỏng vấn là chỉ ra rằng một hệ thống thật thường dùng nhiều loại cùng lúc: quan hệ cho đơn hàng, khóa-giá trị cho phiên, cột rộng cho nhật ký sự kiện, và tìm kiếm toàn văn cho ô tra cứu. Đó là lưu trữ đa dạng theo mục đích, không phải thiếu nhất quán.',
        ],
        table: {
          headers: ['Loại', 'Hợp với', 'Ví dụ tình huống'],
          rows: [
            ['Quan hệ', 'Quan hệ rõ, cần ACID, truy vấn linh hoạt', 'Đơn hàng, thanh toán, tồn kho'],
            ['Khóa-giá trị', 'Tra cứu một khóa, độ trễ cực thấp', 'Phiên đăng nhập, giới hạn tần suất, [[Cache]]'],
            ['Cột rộng', 'Ghi rất nặng, truy vấn theo khóa biết trước', 'Chuỗi thời gian, bảng tin, nhật ký'],
            ['Tài liệu', 'Bản ghi tự chứa, lược đồ hay đổi', 'Hồ sơ sản phẩm, nội dung do người dùng tạo'],
            ['Đồ thị', 'Truy vấn quan hệ nhiều bậc', 'Gợi ý bạn bè, phát hiện gian lận'],
          ],
        },
        callout:
          'Đừng nói "NoSQL scale tốt hơn". Hãy nói "truy vấn của bài toán này luôn đi qua một khóa duy nhất nên tôi chọn kho khóa-giá trị; nếu sau này cần truy vấn liên bảng thì lựa chọn này sẽ đắt".',
      },
      {
        heading: 'Thứ tự áp dụng khi hệ thống bắt đầu nghẽn',
        body: [
          'Có một trình tự gần như chuẩn khi mở rộng tầng dữ liệu, và trình bày đúng thứ tự này cho thấy bạn hiểu chi phí của từng bước. Trước hết là tối ưu thứ đang có: thêm chỉ mục, sửa truy vấn tệ, dùng connection pool. Bước này rẻ nhất và thường đủ lâu hơn người ta nghĩ.',
          'Tiếp theo là thêm [[Cache]] cho các truy vấn đọc lặp lại, kèm chiến lược làm mới rõ ràng. Sau đó là thêm replica đọc nếu áp lực đọc vẫn còn. Chỉ khi tầng ghi thực sự chạm trần mới đến sharding — vì nó kéo theo mất join, mất truy vấn không có shard key, và một chiến dịch tái cân bằng mỗi lần mở rộng.',
          'Cuối cùng, hãy nhớ nêu [[Throughput]] và độ trễ mục tiêu trước khi chọn bước nào. Không có con số thì mọi lập luận về mở rộng chỉ là cảm tính.',
        ],
        callout:
          'Sharding là bước cuối, không phải bước đầu. Ứng viên đề xuất sharding ngay khi vừa nghe đề thường bị hỏi ngược lại "vì sao chưa thử cache và replica?".',
      },
    ],
    flashcards: [
      {
        question: 'Khác nhau giữa load balancer tầng 4 và tầng 7?',
        answer:
          'Tầng 4 chỉ nhìn IP và cổng, chuyển tiếp gói tin mà không đọc nội dung — nhanh, nhẹ, nhưng không định tuyến theo đường dẫn được. Tầng 7 đọc HTTP nên định tuyến theo URL hoặc header, kết thúc TLS, nén, ghi log chi tiết; đổi lại tốn CPU và thêm chút độ trễ. Hệ thống lớn thường dùng cả hai: tầng 4 ở biên cho lưu lượng thô, tầng 7 phía trong để định tuyến.',
        pitfall:
          'Nói tầng 7 luôn tốt hơn. Với lưu lượng rất lớn không cần định tuyến theo nội dung, tầng 4 rẻ hơn nhiều.',
      },
      {
        question: 'Replication và sharding giải quyết hai bài toán gì khác nhau?',
        answer:
          'Replication nhân bản cùng một tập dữ liệu ra nhiều máy — giải quyết áp lực đọc và khả năng sống sót khi máy chết. Sharding cắt dữ liệu thành các tập khác nhau trên các cụm khác nhau — giải quyết giới hạn dung lượng và áp lực ghi. Thêm replica không hề tăng khả năng ghi vì mọi lệnh ghi vẫn dồn về một leader.',
        pitfall:
          'Đề xuất thêm replica khi vấn đề là ghi quá tải. Đó là lúc cần shard, không phải thêm bản sao.',
      },
      {
        question: 'Sao chép đồng bộ và bất đồng bộ đánh đổi thế nào?',
        answer:
          'Đồng bộ: leader chờ follower xác nhận rồi mới báo thành công — không mất dữ liệu khi leader chết, nhưng mỗi lệnh ghi tốn thêm một vòng mạng và bị chặn nếu follower chậm. Bất đồng bộ: leader trả lời ngay — nhanh, nhưng leader chết trước khi sao chép kịp thì mất phần dữ liệu đó. Thực tế thường dùng nửa đồng bộ: đồng bộ với một follower, bất đồng bộ với phần còn lại.',
        pitfall:
          'Quên nhắc replication lag và hệ quả của nó: người dùng vừa ghi xong tải lại trang không thấy thay đổi của chính mình.',
      },
      {
        question: 'Chọn shard key sai dẫn tới hậu quả gì?',
        answer:
          'Ba hậu quả. Điểm nóng: chia theo thời gian làm mọi lệnh ghi hôm nay dồn vào một shard. Truy vấn tán xạ: truy vấn không kèm shard key phải hỏi mọi shard rồi gộp. Tái cân bằng đau đớn: chia theo modulo số máy thì thêm một máy làm xáo trộn gần như toàn bộ dữ liệu — nên dùng consistent hashing hoặc shard ảo ngay từ đầu. Shard key rất khó đổi sau khi đã có dữ liệu thật.',
        pitfall:
          'Chọn khóa tăng dần theo thời gian làm shard key. Nghe hợp lý nhưng tạo điểm nóng ghi ngay lập tức.',
      },
      {
        question: 'Trả lời thế nào cho câu "dùng SQL hay NoSQL"?',
        answer:
          'Bắt đầu từ hình dạng truy vấn và yêu cầu nhất quán, không chọn phe. Cần transaction và truy vấn linh hoạt chưa biết trước thì quan hệ. Tra cứu một khóa với độ trễ cực thấp thì khóa-giá trị. Ghi rất nặng theo khóa biết trước thì cột rộng. Quan hệ nhiều bậc thì đồ thị. Hệ thống thật thường dùng nhiều loại cùng lúc theo từng mục đích.',
        pitfall:
          'Nói "NoSQL scale tốt hơn nên tôi chọn NoSQL". Một máy chủ quan hệ được cấu hình tốt phục vụ hàng chục nghìn giao dịch mỗi giây.',
      },
      {
        question: 'Thứ tự đúng khi tầng dữ liệu bắt đầu nghẽn là gì?',
        answer:
          'Tối ưu thứ đang có trước (chỉ mục, sửa truy vấn tệ, connection pool), rồi thêm cache cho truy vấn đọc lặp lại, rồi thêm replica đọc, và chỉ sharding khi tầng ghi thực sự chạm trần. Mỗi bước sau đắt hơn bước trước cả về vận hành lẫn ràng buộc thiết kế.',
        pitfall:
          'Nhảy thẳng vào sharding. Nó kéo theo mất join, mất truy vấn không có shard key và một chiến dịch tái cân bằng mỗi lần mở rộng.',
      },
    ],
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
