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

import { InterviewStep, Lesson } from '@/models/system-design'

/**
 * Khung 45 phút của một buổi System Design Interview.
 * Nguồn sự thật dùng chung cho buổi 6, trang cheat-sheet và buổi 13 tự luyện.
 * Bảng in trong buổi 6 phải khớp với danh sách này — có ca kiểm thử chặn lệch.
 */
export const INTERVIEW_STEPS: InterviewStep[] = [
  {
    order: 1,
    name: 'Làm rõ yêu cầu',
    minutes: 5,
    checklist: [
      'Chốt các chức năng bắt buộc, nói rõ phần để ngoài phạm vi',
      'Hỏi số người dùng hoạt động mỗi ngày và tỉ lệ đọc trên ghi',
      'Hỏi độ trễ chấp nhận được và mức nhất quán cần thiết',
      'Ghi ràng buộc đã chốt lên góc bảng và giữ nguyên suốt buổi',
    ],
  },
  {
    order: 2,
    name: 'Ước lượng quy mô',
    minutes: 5,
    checklist: [
      'Số request mỗi giây trung bình, rồi nhân hệ số đỉnh hai tới ba lần',
      'Dung lượng lưu trữ mỗi ngày và theo thời hạn cần giữ',
      'Băng thông ra vào nếu có tệp lớn hoặc video',
      'Nói to phép tính, làm tròn mạnh tay để lấy đúng bậc độ lớn',
    ],
  },
  {
    order: 3,
    name: 'Thiết kế API và mô hình dữ liệu',
    minutes: 8,
    checklist: [
      'Ba tới năm endpoint quan trọng nhất',
      'Các thực thể chính và quan hệ giữa chúng',
      'Khóa truy cập: truy vấn luôn đi qua trường nào',
      'Từ khóa truy cập suy ra loại database và khóa chia dữ liệu',
    ],
  },
  {
    order: 4,
    name: 'Kiến trúc tổng thể',
    minutes: 12,
    checklist: [
      'Bắt đầu từ phương án đơn giản nhất chạy được',
      'Đi theo đường của một request từ client vào tới nơi lưu dữ liệu',
      'Chỉ thêm cache, hàng đợi, CDN ở chỗ có lý do rõ ràng',
      'Mỗi thành phần thêm vào phải kèm một lý do và một cái giá',
    ],
  },
  {
    order: 5,
    name: 'Đi sâu một thành phần',
    minutes: 10,
    checklist: [
      'Chọn phần khó nhất, thường là chỗ xung đột giữa quy mô và nhất quán',
      'Trình bày cấu trúc dữ liệu và thuật toán cụ thể',
      'Nêu phương án thay thế đã cân nhắc và lý do không chọn',
    ],
  },
  {
    order: 6,
    name: 'Điểm nghẽn và đánh đổi',
    minutes: 5,
    checklist: [
      'Chỗ nào vỡ trước khi tải tăng mười lần',
      'Điểm chết duy nhất và điểm nóng dữ liệu',
      'Điều gì xảy ra khi một thành phần chết',
      'Tóm tắt: ưu tiên gì, hy sinh gì, khi nào sẽ chọn khác đi',
    ],
  },
]

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
    sections: [
      {
        heading: 'Chặng đường của một request trước khi chạm tới code',
        body: [
          'Trước khi dòng code đầu tiên của bạn chạy, một request đã đi qua vài bước tốn thời gian mà ứng viên hay bỏ quên. Trình duyệt phải phân giải tên miền qua [[DNS]], bắt tay TCP, bắt tay TLS, rồi mới gửi được byte dữ liệu đầu tiên. Mỗi bước là một hoặc vài vòng đi về trên mạng, và mỗi vòng ở khoảng cách liên lục địa tốn cỡ 100–150 mili giây.',
          '[[DNS]] hoạt động theo tầng: trình duyệt hỏi bộ phân giải của nhà mạng, bộ này hỏi máy chủ gốc, rồi máy chủ quản lý phần đuôi tên miền, rồi máy chủ quản lý tên miền của bạn. Kết quả được lưu đệm ở mọi tầng theo giá trị TTL. Chính TTL là thứ khiến chuyển đổi hạ tầng bằng DNS chậm — đặt TTL 24 giờ nghĩa là sau khi đổi bản ghi vẫn còn người truy cập vào máy chủ cũ suốt một ngày. Trước một đợt chuyển đổi có kế hoạch, hãy hạ TTL xuống trước vài ngày.',
          'Bắt tay TLS tốn thêm vòng đi về nữa. Đây là lý do người ta kết thúc TLS ngay tại [[Load Balancer]] ở biên thay vì ở từng máy chủ ứng dụng, và bật giữ kết nối để nhiều request dùng chung một lần bắt tay. Với nội dung tĩnh, [[CDN]] giải quyết triệt để hơn: rút ngắn quãng đường vật lý nên giảm cả độ trễ lẫn số vòng.',
        ],
        diagram: `flowchart LR
  B["Trình duyệt"] --> D["DNS — phân giải tên miền"]
  D --> T["Bắt tay TCP + TLS"]
  T --> LB["Load balancer — kết thúc TLS"]
  LB --> S["Service"]
  S --> DB[("Database")]`,
        callout:
          'Con số đáng thuộc: một vòng đi về trong cùng vùng khoảng 1–2 ms, xuyên lục địa khoảng 100–150 ms. Nhân số vòng với con số này trước khi nói hệ thống của bạn nhanh.',
      },
      {
        heading: 'REST và GraphQL: hình dạng dữ liệu quyết định',
        body: [
          '[[REST]] tổ chức [[API]] quanh tài nguyên, mỗi tài nguyên một [[Endpoint]], dùng đúng ngữ nghĩa của phương thức HTTP. Ưu điểm lớn nhất ít khi được nhắc: vì GET là thao tác an toàn và không đổi trạng thái, mọi tầng đệm trên đường đi đều đệm được — trình duyệt, CDN, proxy. Đó là thứ GraphQL đánh mất.',
          '[[GraphQL]] cho client mô tả chính xác trường nào mình cần trong một truy vấn duy nhất. Nó giải quyết hai bệnh của REST: lấy thừa dữ liệu (endpoint trả cả object trong khi màn hình chỉ cần hai trường) và lấy thiếu (phải gọi năm lần mới đủ dữ liệu cho một màn hình). Rất hợp khi có nhiều loại client với nhu cầu dữ liệu khác nhau.',
          'Cái giá của GraphQL: mọi truy vấn thường đi qua một endpoint duy nhất bằng POST nên mất khả năng đệm theo HTTP, phải tự dựng tầng đệm ở phía sau. Truy vấn lồng nhiều tầng dễ sinh bài toán N+1 nếu không gom lô. Và vì client tự do đặt truy vấn, một truy vấn lồng sâu ác ý có thể làm sập máy chủ — phải giới hạn độ sâu và chi phí truy vấn.',
          'gRPC là lựa chọn thứ ba, nhắm vào giao tiếp giữa các dịch vụ nội bộ. Nó dùng Protocol Buffers nên gói tin nhỏ hơn JSON đáng kể, chạy trên HTTP/2 nên ghép nhiều luồng trên một kết nối, và sinh sẵn mã client từ file định nghĩa. Đổi lại là khó gỡ lỗi bằng mắt vì dữ liệu ở dạng nhị phân, và trình duyệt không gọi trực tiếp được nếu không qua lớp trung gian.',
        ],
        table: {
          headers: ['Tiêu chí', 'REST', 'GraphQL', 'gRPC'],
          rows: [
            ['Hợp nhất với', 'API công khai, tài nguyên rõ ràng', 'Nhiều client, nhu cầu dữ liệu khác nhau', 'Dịch vụ nội bộ gọi nhau'],
            ['Đệm theo HTTP', 'Sẵn có, mạnh nhất', 'Mất, phải tự dựng', 'Không áp dụng'],
            ['Kích thước gói tin', 'JSON, trung bình', 'JSON, chỉ trường cần', 'Nhị phân, nhỏ nhất'],
            ['Gỡ lỗi bằng mắt', 'Dễ, đọc thẳng bằng curl', 'Vừa', 'Khó, cần công cụ riêng'],
            ['Rủi ro riêng', 'Lấy thừa hoặc lấy thiếu dữ liệu', 'Truy vấn lồng sâu, N+1', 'Trình duyệt không gọi trực tiếp'],
          ],
        },
      },
      {
        heading: 'Khi server cần chủ động đẩy dữ liệu',
        body: [
          'HTTP vốn là mô hình client hỏi, server trả lời. Khi nghiệp vụ cần server thông báo ngay cho client — tin nhắn mới, giá cổ phiếu, vị trí tài xế — có bốn cách, và chọn sai là mất điểm.',
          'Polling ngắn nghĩa là client hỏi lại mỗi vài giây. Đơn giản đến mức không cần hạ tầng gì thêm, nhưng lãng phí: phần lớn lần hỏi trả về "chưa có gì mới", và độ trễ tệ nhất bằng đúng chu kỳ hỏi. Long polling giữ request treo cho tới khi có dữ liệu hoặc hết giờ, giảm được lãng phí nhưng mỗi kết nối treo vẫn chiếm một chỗ trên máy chủ.',
          'SSE mở một kết nối HTTP một chiều để server đẩy liên tục, có sẵn cơ chế tự kết nối lại và đánh số sự kiện. Rất hợp cho bảng tin, thông báo, thanh tiến trình — những thứ chỉ cần đẩy một chiều. [[WebSocket]] nâng cấp kết nối lên song công, cả hai bên gửi bất cứ lúc nào, độ trễ thấp nhất. Đây là lựa chọn cho chat, cộng tác thời gian thực, game.',
          'Điều quan trọng cần nói được: kết nối dài không miễn phí. Mỗi [[WebSocket]] chiếm một kết nối mở suốt phiên, nên phải tính số kết nối đồng thời chứ không phải số request mỗi giây. Nó cũng làm máy chủ có trạng thái — cần một tầng theo dõi người dùng đang bám vào máy nào, và [[Load Balancer]] phải hỗ trợ nâng cấp giao thức. Khi client tiêu thụ chậm hơn tốc độ server đẩy, phải có cơ chế [[Backpressure]] chứ không để bộ đệm phình vô hạn.',
        ],
        diagram: `flowchart TD
  Q{"Ai khởi xướng dữ liệu?"} -->|"Client hỏi"| R["REST hoặc polling"]
  Q -->|"Server đẩy"| D{"Cần gửi hai chiều?"}
  D -->|Không| SSE["SSE — nhẹ, tự kết nối lại"]
  D -->|Có| WS["WebSocket — song công, độ trễ thấp nhất"]`,
        table: {
          headers: ['Cách', 'Độ trễ', 'Chi phí máy chủ', 'Hợp với'],
          rows: [
            ['Polling ngắn', 'Bằng chu kỳ hỏi', 'Lãng phí nhiều request rỗng', 'Dữ liệu đổi chậm, cần đơn giản'],
            ['Long polling', 'Gần tức thì', 'Mỗi kết nối treo chiếm một chỗ', 'Cần gần thời gian thực, hạ tầng cũ'],
            ['SSE', 'Tức thì', 'Một kết nối một chiều', 'Thông báo, bảng tin, tiến trình'],
            ['WebSocket', 'Thấp nhất', 'Kết nối mở suốt phiên, có trạng thái', 'Chat, cộng tác, vị trí thời gian thực'],
          ],
        },
        callout:
          'Nhiều ứng viên chọn WebSocket theo phản xạ. Nếu dữ liệu chỉ đi một chiều từ server xuống, SSE rẻ hơn và đơn giản hơn nhiều — nói được điều này là điểm cộng.',
      },
      {
        heading: 'Lỗi và thử lại trên mạng',
        body: [
          'Mọi lời gọi qua mạng đều có thể thất bại, và thất bại nguy hiểm nhất không phải lỗi rõ ràng mà là hết giờ chờ. Khi request hết giờ, client không biết server đã xử lý xong hay chưa — có thể tiền đã bị trừ mà phản hồi bị mất trên đường về.',
          'Vì vậy thử lại là bắt buộc, và [[Idempotency]] là điều kiện để thử lại an toàn. Cách làm phổ biến là client sinh một khóa idempotency cho mỗi thao tác; server lưu khóa đó cùng kết quả, nên lần gửi trùng sẽ trả về kết quả cũ thay vì tạo đơn hàng thứ hai.',
          'Thử lại cũng phải có kỷ luật. Thử lại ngay lập tức và đồng loạt sẽ đánh sập chính dịch vụ đang hồi phục — hiện tượng bão thử lại. Cách đúng là giãn cách theo cấp số nhân kèm một lượng ngẫu nhiên để các client không cùng gõ cửa một lúc. Kèm theo đó là ngắt mạch: sau một số lần hỏng liên tiếp thì ngừng gọi hẳn trong một khoảng, trả lỗi ngay để không dồn thêm áp lực.',
          'Cuối cùng, hãy nhớ đặt giới hạn thời gian chờ ở mọi lời gọi. Không đặt giới hạn nghĩa là một dịch vụ chậm sẽ kéo theo toàn bộ chuỗi gọi phía trên treo cùng, và một sự cố nhỏ lan thành sập dây chuyền.',
        ],
        callout:
          'Bộ ba luôn đi cùng nhau khi nói về gọi qua mạng: giới hạn thời gian chờ, thử lại có giãn cách ngẫu nhiên, và ngắt mạch. Thiếu một trong ba là thiết kế chưa xong.',
      },
      {
        heading: 'Chọn giao thức theo tình huống',
        body: [
          'Tổng hợp lại thành vài quy tắc dùng được ngay. API công khai cho bên thứ ba thì [[REST]] — dễ hiểu, dễ đệm, ai cũng gọi được. Nhiều loại client với nhu cầu dữ liệu rất khác nhau thì cân nhắc [[GraphQL]], nhưng phải kèm giới hạn độ sâu truy vấn và tầng đệm tự dựng. Giao tiếp giữa các dịch vụ nội bộ, cần [[Throughput]] cao và gói tin nhỏ thì gRPC.',
          'Về hướng đẩy dữ liệu: server đẩy một chiều thì SSE, hai chiều độ trễ thấp thì [[WebSocket]], còn dữ liệu đổi chậm thì polling vẫn là câu trả lời hợp lý và đừng ngại nói ra. Nội dung tĩnh và tệp lớn thì đưa ra [[CDN]] thay vì cho đi qua tầng ứng dụng.',
          'Một chi tiết nhỏ hay bị hỏi thêm: [[CORS]] chỉ là cơ chế của trình duyệt, không phải lớp bảo mật của server. Nó ngăn trang web khác gọi API bằng phiên đăng nhập của người dùng, chứ không ngăn được ai đó gọi thẳng API bằng công cụ dòng lệnh. Xác thực vẫn phải làm ở phía server.',
        ],
      },
    ],
    flashcards: [
      {
        question: 'Vì sao TTL của DNS quan trọng khi chuyển đổi hạ tầng?',
        answer:
          'Kết quả phân giải được lưu đệm ở mọi tầng theo TTL. Đặt TTL 24 giờ nghĩa là sau khi đổi bản ghi vẫn còn người truy cập vào máy chủ cũ suốt một ngày. Trước đợt chuyển đổi có kế hoạch, hạ TTL xuống vài phút trước đó vài ngày, chuyển xong rồi mới nâng lại.',
        pitfall:
          'Coi DNS là công cụ chuyển đổi tức thì. Nó không tức thì, và bạn không kiểm soát được bộ đệm ở phía nhà mạng.',
      },
      {
        question: 'REST mất gì khi đổi sang GraphQL?',
        answer:
          'Mất khả năng đệm theo HTTP. REST dùng GET nên trình duyệt, CDN và proxy đều đệm được; GraphQL thường gửi POST qua một endpoint duy nhất nên các tầng đó không đệm được, phải tự dựng tầng đệm phía sau. Ngoài ra phải xử lý bài toán N+1 khi truy vấn lồng nhau và giới hạn độ sâu để chống truy vấn ác ý.',
        pitfall:
          'Chọn GraphQL chỉ vì "linh hoạt hơn" mà không nhắc tới chuyện mất đệm — đây là cái giá lớn nhất.',
      },
      {
        question: 'Khi nào dùng SSE thay vì WebSocket?',
        answer:
          'Khi dữ liệu chỉ đi một chiều từ server xuống client: thông báo, bảng tin, thanh tiến trình, cập nhật trạng thái. SSE chạy trên HTTP thường, có sẵn cơ chế tự kết nối lại và đánh số sự kiện, nhẹ hơn và ít phần phải tự lo hơn. WebSocket chỉ cần khi thật sự phải gửi hai chiều với độ trễ thấp như chat hay cộng tác thời gian thực.',
        pitfall:
          'Chọn WebSocket theo phản xạ cho mọi bài toán thời gian thực, rồi phải tự cài lại cơ chế kết nối lại mà SSE vốn có sẵn.',
      },
      {
        question: 'WebSocket thay đổi cách ước lượng quy mô như thế nào?',
        answer:
          'Phải tính theo số kết nối đồng thời thay vì số request mỗi giây, vì mỗi kết nối mở suốt phiên. Nó cũng làm máy chủ có trạng thái nên cần tầng theo dõi người dùng đang bám vào máy nào, load balancer phải hỗ trợ nâng cấp giao thức, và cần cơ chế backpressure khi client tiêu thụ chậm hơn tốc độ server đẩy.',
        pitfall:
          'Ước lượng WebSocket bằng đơn vị request mỗi giây. Sai đơn vị dẫn tới sai toàn bộ phần tính tài nguyên.',
      },
      {
        question: 'Vì sao hết giờ chờ nguy hiểm hơn lỗi rõ ràng, và xử lý thế nào?',
        answer:
          'Vì client không biết server đã xử lý xong hay chưa — có thể thao tác đã thực hiện mà phản hồi mất trên đường về. Nếu thử lại mà thao tác không idempotent thì tạo ra bản ghi trùng. Cách xử lý: client sinh khóa idempotency cho mỗi thao tác, server lưu khóa cùng kết quả và trả lại kết quả cũ khi gặp khóa trùng.',
        pitfall:
          'Thêm cơ chế thử lại mà không làm idempotency trước. Đó là cách tạo ra hai đơn hàng từ một lần bấm nút.',
      },
      {
        question: 'Bộ ba cần có ở mọi lời gọi qua mạng là gì?',
        answer:
          'Giới hạn thời gian chờ, thử lại có giãn cách theo cấp số nhân kèm ngẫu nhiên, và ngắt mạch. Không đặt giới hạn thời gian chờ thì một dịch vụ chậm kéo cả chuỗi gọi treo theo. Thử lại đồng loạt không giãn cách sẽ đánh sập chính dịch vụ đang hồi phục. Ngắt mạch dừng hẳn việc gọi sau một số lần hỏng liên tiếp để không dồn thêm áp lực.',
        pitfall:
          'Thử lại ngay lập tức và đồng loạt, tạo ra bão thử lại đúng lúc dịch vụ đang cố hồi phục.',
      },
    ],
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
    sections: [
      {
        heading: 'Cache: mua tốc độ bằng nguy cơ dữ liệu cũ',
        body: [
          '[[Cache]] tồn tại ở nhiều tầng cùng lúc, và nói được chuỗi này là điểm cộng: bộ nhớ trình duyệt, [[CDN]] ở biên, tầng đệm phân tán dùng chung giữa các máy chủ ứng dụng, bộ đệm cục bộ trong tiến trình, và cuối cùng là bộ đệm của chính [[Database]]. Mỗi tầng chặn được một phần lưu lượng, tầng nào chặn càng sớm càng rẻ.',
          'Mẫu phổ biến nhất là cache-aside: ứng dụng hỏi cache trước, trượt thì đọc database rồi ghi ngược vào cache kèm thời hạn sống. Ưu điểm là chỉ dữ liệu thật sự được đọc mới nằm trong cache, và cache chết thì hệ thống vẫn chạy, chỉ chậm hơn. Nhược điểm là lần đọc đầu tiên luôn trượt, và có khoảng thời gian ngắn dữ liệu trong cache lệch với database.',
          'Write-through ghi đồng thời vào cache và database nên cache luôn khớp, đổi lại mỗi lệnh ghi chậm hơn và cache chứa cả dữ liệu chẳng ai đọc. Write-behind ghi vào cache rồi đẩy xuống database sau — nhanh nhất nhưng mất dữ liệu nếu cache chết trước khi kịp đẩy, chỉ dùng khi chấp nhận được mất mát, ví dụ đếm lượt xem.',
          'Câu hỏi khó nhất về cache không phải "dùng cái nào" mà là "làm mới thế nào". Ba cách: đặt thời hạn sống rồi chấp nhận cũ trong khoảng đó, chủ động xóa khóa khi dữ liệu đổi, hoặc phát sự kiện thay đổi để mọi tầng cùng xóa. Cách đầu đơn giản nhất và thường là câu trả lời đúng.',
        ],
        diagram: `flowchart LR
  A["Ứng dụng"] --> C{"Có trong cache?"}
  C -->|Trúng| R["Trả về ngay"]
  C -->|Trượt| DB[("Database")]
  DB --> W["Ghi vào cache kèm TTL"]
  W --> R`,
        table: {
          headers: ['Chiến lược', 'Cách ghi', 'Ưu điểm', 'Rủi ro'],
          rows: [
            ['Cache-aside', 'Ứng dụng tự ghi vào cache khi trượt', 'Chỉ đệm dữ liệu thật sự được đọc', 'Lần đọc đầu luôn trượt, có khoảng lệch'],
            ['Write-through', 'Ghi cache và database cùng lúc', 'Cache luôn khớp database', 'Mỗi lệnh ghi chậm hơn, đệm cả dữ liệu không ai đọc'],
            ['Write-behind', 'Ghi cache trước, đẩy xuống sau', 'Ghi nhanh nhất', 'Mất dữ liệu nếu cache chết trước khi đẩy'],
          ],
        },
        callout:
          'Khi thêm cache vào thiết kế, hãy nói ngay chiến lược làm mới và mức dữ liệu cũ chấp nhận được. Thêm cache mà không nhắc hai điều này là câu trả lời chưa xong.',
      },
      {
        heading: 'Ba sự cố kinh điển của cache',
        body: [
          'Sự cố thứ nhất là giẫm đạp: một khóa nóng hết hạn, hàng nghìn request cùng trượt và cùng lao xuống database trong một khoảnh khắc, đủ để làm sập tầng dữ liệu. Cách xử lý là cho một request duy nhất đi nạp lại trong khi các request khác chờ kết quả đó, cộng thêm rải ngẫu nhiên thời hạn sống để các khóa không hết hạn cùng lúc.',
          'Sự cố thứ hai là xuyên thủng: kẻ tấn công liên tục hỏi những khóa chắc chắn không tồn tại, nên lần nào cũng trượt cache và xuống thẳng database. Cách xử lý là đệm cả kết quả rỗng với thời hạn ngắn, hoặc dùng bộ lọc xác suất để loại sớm những khóa chắc chắn không có.',
          'Sự cố thứ ba là khóa nóng: một khóa duy nhất nhận quá nhiều lưu lượng đến mức chính node cache chứa nó bị quá tải, trong khi các node khác rảnh rỗi. Đây cùng bản chất với [[Hot Partition]] ở tầng dữ liệu. Cách xử lý là nhân bản khóa đó ra nhiều bản có hậu tố, hoặc thêm một tầng đệm cục bộ ngay trong tiến trình ứng dụng.',
          'Về chính sách loại bỏ khi cache đầy: LRU loại thứ lâu không dùng, hợp với phần lớn trường hợp. LFU loại thứ ít được dùng, tốt hơn khi có nhóm dữ liệu nóng ổn định nhưng phản ứng chậm với thay đổi xu hướng. Chọn sai chính sách làm tỉ lệ trúng tụt mà không ai để ý, nên tỉ lệ trúng phải là một chỉ số được theo dõi.',
        ],
        callout:
          'Rải ngẫu nhiên thời hạn sống là mẹo nhỏ giá trị lớn: đặt TTL 300 giây cho mọi khóa nghĩa là mỗi 5 phút sẽ có một đợt trượt đồng loạt.',
      },
      {
        heading: 'Hàng đợi và pub/sub: tách rời người gửi khỏi người nhận',
        body: [
          'Hàng đợi giải quyết ba bài toán mà gọi trực tiếp không giải quyết được. Thứ nhất là hấp thụ đỉnh tải: lưu lượng tăng vọt được xếp hàng thay vì đánh sập dịch vụ phía sau. Thứ hai là tách rời: người gửi không cần biết ai xử lý, thêm một bên tiêu thụ mới không phải sửa bên gửi. Thứ ba là thử lại có kỷ luật: thông điệp xử lý hỏng quay lại hàng đợi thay vì mất hẳn.',
          'Phân biệt hai mô hình. Hàng đợi điểm-tới-điểm: mỗi thông điệp chỉ một bên tiêu thụ nhận được, hợp với phân phối công việc. Pub/sub: mỗi thông điệp được gửi tới mọi bên đăng ký, hợp khi một sự kiện cần kích hoạt nhiều hành động độc lập — đặt hàng xong thì trừ kho, gửi email, ghi nhận doanh thu.',
          '[[Kafka]] là lựa chọn khi cần thông lượng rất cao và giữ lại lịch sử sự kiện. Điểm khác biệt lớn nhất so với hàng đợi truyền thống: thông điệp không bị xóa sau khi đọc mà nằm lại theo chính sách [[Retention]], nên bên tiêu thụ mới có thể đọc lại từ đầu, và có thể tua lại khi cần xử lý lại. [[RabbitMQ]] hợp hơn khi cần định tuyến phức tạp và mỗi thông điệp là một việc cần làm.',
          'Trong [[Kafka]], một [[Topic]] chia thành nhiều [[Partition]] — đây là đơn vị song song. Thêm partition thì tăng được [[Throughput]], nhưng số bên tiêu thụ hữu ích trong một [[Consumer Group]] không vượt quá số partition. Và thứ tự chỉ được bảo đảm trong phạm vi một partition, không phải toàn topic.',
        ],
        diagram: `flowchart LR
  P["Producer — đặt hàng"] --> T["Topic: order.created"]
  T --> C1["Consumer: trừ kho"]
  T --> C2["Consumer: gửi email"]
  T --> C3["Consumer: ghi nhận doanh thu"]
  C1 -. hỏng nhiều lần .-> DLQ["Dead letter queue"]`,
        callout:
          'Muốn các sự kiện của cùng một người dùng giữ đúng thứ tự, hãy dùng chính id người dùng làm [[Partition Key]] — thứ tự chỉ được bảo đảm trong một partition.',
      },
      {
        heading: 'Bảo đảm giao hàng: exactly-once phần lớn là ảo tưởng',
        body: [
          'Có ba mức bảo đảm. At-most-once: gửi rồi thôi, thông điệp có thể mất — chỉ chấp nhận được với dữ liệu đo lường không quan trọng. At-least-once: gửi lại cho tới khi có xác nhận, không mất nhưng có thể trùng. Exactly-once: mỗi thông điệp có tác dụng đúng một lần.',
          'Câu trả lời trưởng thành trong phỏng vấn là: hầu như mọi hệ thống thực tế chạy at-least-once và đạt hiệu quả exactly-once bằng cách làm bên tiêu thụ [[Idempotency]]. Lưu id thông điệp đã xử lý, gặp lại thì bỏ qua. Kafka có cơ chế giao dịch trong nội bộ nó, nhưng ngay khi bên tiêu thụ ghi ra một hệ thống khác — gửi email, gọi cổng thanh toán — bảo đảm đó không còn kéo dài tới đầu kia được nữa.',
          'Hai chỉ số vận hành cần nói được. [[Consumer Lag]] là khoảng cách giữa vị trí ghi mới nhất và vị trí bên tiêu thụ đang đọc; lag tăng đều nghĩa là năng lực xử lý không theo kịp tốc độ ghi, và đây là chỉ số đáng cảnh báo nhất. [[Dead Letter Queue]] là nơi chứa thông điệp hỏng sau nhiều lần thử; không có nó thì một thông điệp lỗi có thể chặn cả partition mãi mãi.',
          'Cuối cùng là [[Backpressure]]: khi bên tiêu thụ chậm hơn bên gửi, phải có cơ chế báo ngược hoặc giới hạn tốc độ, chứ không để hàng đợi phình vô hạn rồi hết bộ nhớ.',
        ],
        table: {
          headers: ['Mức bảo đảm', 'Rủi ro', 'Dùng khi', 'Cần thêm gì'],
          rows: [
            ['At-most-once', 'Mất thông điệp', 'Dữ liệu đo lường không quan trọng', 'Không'],
            ['At-least-once', 'Thông điệp trùng', 'Mặc định cho hầu hết hệ thống', 'Bên tiêu thụ phải idempotent'],
            ['Exactly-once', 'Phức tạp, giới hạn trong một hệ', 'Trong nội bộ một nền tảng', 'Giao dịch, và vẫn cần idempotency ở biên'],
          ],
        },
      },
      {
        heading: 'Monitoring: biết hệ thống ốm trước khi người dùng báo',
        body: [
          'Ba loại dữ liệu quan sát bổ sung cho nhau. Số đo cho biết có chuyện gì đó bất thường và rẻ để lưu dài hạn. Nhật ký cho biết chi tiết chuyện gì đã xảy ra ở một thời điểm. Vết theo dõi phân tán cho biết một request cụ thể đã đi qua những dịch vụ nào và tốn thời gian ở đâu — thứ gần như bắt buộc khi đã tách [[Microservices]].',
          'Với dịch vụ hướng request, bốn chỉ số cần theo là số request mỗi giây, tỉ lệ lỗi, độ trễ, và mức bão hòa tài nguyên. Điểm quan trọng nhất về độ trễ: đừng báo cáo giá trị trung bình. Trung bình che giấu phần đuôi, mà chính phần đuôi là trải nghiệm tệ nhất người dùng gặp phải. Hãy theo p95 và p99. Một hệ thống có trung bình 50 mili giây nhưng p99 là 4 giây nghĩa là cứ 100 request có một request khiến người dùng nghĩ trang bị treo.',
          'Với hệ thống có nhiều lời gọi nội bộ, độ trễ đuôi còn bị khuếch đại: một trang gọi 20 dịch vụ, mỗi dịch vụ có p99 là 1%, thì xác suất trang đó dính ít nhất một lời gọi chậm lên tới khoảng 18%. Đây là lý do người ta cắt bớt số lời gọi tuần tự và gửi request dự phòng cho các lời gọi quan trọng.',
          'Về cảnh báo: hãy cảnh báo theo triệu chứng người dùng cảm nhận được — tỉ lệ lỗi tăng, độ trễ p99 vượt ngưỡng, [[Consumer Lag]] tăng đều — chứ không cảnh báo theo mọi nguyên nhân có thể. Cảnh báo theo nguyên nhân sinh ra hàng loạt thông báo nhiễu, và đội ngũ sẽ nhanh chóng học cách phớt lờ chúng.',
        ],
        callout:
          'Câu đáng nhớ khi bị hỏi về hiệu năng: "trung bình nói cho bạn biết hệ thống chạy thế nào, p99 nói cho bạn biết người dùng cảm thấy thế nào".',
      },
    ],
    flashcards: [
      {
        question: 'Cache-aside, write-through và write-behind khác nhau ở đâu?',
        answer:
          'Cache-aside: ứng dụng hỏi cache trước, trượt thì đọc database rồi ghi ngược vào cache — chỉ đệm dữ liệu thật sự được đọc, cache chết thì hệ thống vẫn chạy. Write-through: ghi cache và database cùng lúc, cache luôn khớp nhưng mỗi lệnh ghi chậm hơn. Write-behind: ghi cache trước rồi đẩy xuống database sau, nhanh nhất nhưng mất dữ liệu nếu cache chết trước khi đẩy.',
        pitfall:
          'Chỉ nói tên chiến lược mà không nói cách làm mới và mức dữ liệu cũ chấp nhận được — đó mới là phần khó của bài toán cache.',
      },
      {
        question: 'Cache stampede là gì và xử lý thế nào?',
        answer:
          'Một khóa nóng hết hạn, hàng nghìn request cùng trượt và cùng lao xuống database trong một khoảnh khắc, đủ để làm sập tầng dữ liệu. Xử lý bằng cách cho một request duy nhất đi nạp lại trong khi các request khác chờ kết quả đó, kết hợp rải ngẫu nhiên thời hạn sống để các khóa không hết hạn cùng lúc.',
        pitfall:
          'Đặt cùng một TTL cho mọi khóa. Nghe gọn gàng nhưng tạo ra đợt trượt đồng loạt đều đặn theo chu kỳ.',
      },
      {
        question: 'Vì sao nói exactly-once phần lớn là ảo tưởng?',
        answer:
          'Vì bảo đảm đó chỉ giữ được trong nội bộ một nền tảng. Ngay khi bên tiêu thụ ghi ra hệ thống khác — gửi email, gọi cổng thanh toán — bảo đảm không kéo dài tới đầu kia được. Thực tế mọi hệ thống chạy at-least-once và đạt hiệu quả exactly-once bằng cách làm bên tiêu thụ idempotent: lưu id thông điệp đã xử lý, gặp lại thì bỏ qua.',
        pitfall:
          'Trả lời "tôi bật exactly-once" rồi dừng lại. Người phỏng vấn sẽ hỏi ngay điều gì xảy ra khi consumer gọi ra dịch vụ bên ngoài.',
      },
      {
        question: 'Thứ tự thông điệp được bảo đảm ở phạm vi nào?',
        answer:
          'Chỉ trong phạm vi một partition, không phải toàn topic. Muốn các sự kiện của cùng một thực thể giữ đúng thứ tự thì dùng id của thực thể đó làm partition key — ví dụ id người dùng hoặc id đơn hàng. Đổi lại, nếu một khóa quá nóng thì partition chứa nó thành điểm nghẽn.',
        pitfall:
          'Giả định toàn bộ topic có thứ tự toàn cục. Không hệ thống hàng đợi phân tán nào cho bạn điều đó mà vẫn giữ được thông lượng.',
      },
      {
        question: 'Vì sao theo dõi p99 thay vì giá trị trung bình?',
        answer:
          'Trung bình che giấu phần đuôi, mà phần đuôi chính là trải nghiệm tệ nhất người dùng gặp. Hệ thống trung bình 50 mili giây nhưng p99 là 4 giây nghĩa là cứ 100 request có một request khiến người dùng nghĩ trang bị treo. Với hệ thống nhiều lời gọi nội bộ, độ trễ đuôi còn bị khuếch đại: 20 lời gọi mỗi cái p99 1% thì xác suất dính ít nhất một lời gọi chậm khoảng 18%.',
        pitfall:
          'Báo cáo độ trễ trung bình rồi kết luận hệ thống nhanh. Đây là lỗi kinh điển khi trình bày phần hiệu năng.',
      },
      {
        question: 'Nên cảnh báo theo triệu chứng hay theo nguyên nhân?',
        answer:
          'Theo triệu chứng người dùng cảm nhận được: tỉ lệ lỗi tăng, p99 vượt ngưỡng, consumer lag tăng đều. Cảnh báo theo mọi nguyên nhân có thể sẽ sinh ra hàng loạt thông báo nhiễu và đội ngũ sẽ học cách phớt lờ. Nguyên nhân là thứ để điều tra sau khi triệu chứng đã báo, và đó là lúc dùng tới nhật ký và vết theo dõi phân tán.',
        pitfall:
          'Đặt cảnh báo cho từng chỉ số hạ tầng như CPU của mọi máy. Phần lớn sẽ là nhiễu, và cảnh báo thật sẽ chìm trong đó.',
      },
    ],
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
    sections: [
      {
        heading: 'CDN: rút ngắn quãng đường vật lý',
        body: [
          '[[CDN]] đặt bản sao nội dung tại hàng trăm điểm hiện diện gần người dùng. Lợi ích lớn nhất không phải tiết kiệm băng thông mà là giảm [[Latency]]: ánh sáng trong cáp quang có tốc độ hữu hạn, nên một vòng đi về xuyên lục địa không thể dưới khoảng 100 mili giây dù máy chủ của bạn nhanh đến đâu. Đưa nội dung tới gần là cách duy nhất phá được giới hạn đó.',
          'Có hai kiểu nạp nội dung. Kiểu kéo: điểm biên chưa có thì đi lấy từ máy chủ gốc rồi giữ lại — đơn giản, tự động, nhưng người dùng đầu tiên ở mỗi vùng phải chịu lần trượt. Kiểu đẩy: chủ động đưa nội dung ra biên trước — phù hợp với tệp lớn phát hành theo lịch, ví dụ bản cập nhật game hay video vừa xuất bản.',
          'Vấn đề khó nhất vẫn là làm mới. Xóa nội dung khỏi hàng trăm điểm biên tốn thời gian và thường bị giới hạn số lần. Cách làm thực dụng hơn là đánh dấu phiên bản ngay trong tên tệp hoặc chuỗi truy vấn: mỗi lần đổi nội dung thì tên đổi theo, nên không cần xóa gì cả và có thể đặt thời hạn sống rất dài. Với nội dung động, hãy đặt thời hạn ngắn hoặc dùng cơ chế xác thực lại thay vì đệm cứng.',
          'Một chi tiết hay bị bỏ sót là khóa đệm. Nếu khóa gồm cả các header không cần thiết hoặc toàn bộ chuỗi truy vấn kể cả tham số theo dõi quảng cáo, cùng một nội dung sẽ bị lưu thành hàng chục bản khác nhau và tỉ lệ trúng tụt thảm hại.',
        ],
        callout:
          'Đặt phiên bản trong tên tệp rồi cho thời hạn sống một năm sẽ khỏe hơn nhiều so với đặt thời hạn ngắn rồi xóa liên tục.',
      },
      {
        heading: 'Blobstore: metadata ở database, byte ở kho đối tượng',
        body: [
          'Nguyên tắc cốt lõi khi thiết kế lưu trữ tệp: [[Database]] chỉ giữ metadata — id, tên, kích thước, chủ sở hữu, đường dẫn — còn byte thật nằm trong kho đối tượng. Nhồi tệp vào database làm sao lưu phình to, nhân bản chậm và chi phí tăng vọt mà chẳng được lợi gì.',
          'Luồng tải lên đúng cách không đi qua tầng ứng dụng. Client xin một đường dẫn có chữ ký với thời hạn ngắn, rồi tải thẳng lên kho đối tượng. Tầng ứng dụng chỉ cấp phép và ghi metadata, nên không phải gánh băng thông của tệp lớn. Tải xuống làm ngược lại: tầng ứng dụng kiểm tra quyền rồi trả về đường dẫn có chữ ký, hoặc phục vụ qua [[CDN]].',
          'Với tệp rất lớn, tải lên phải chia thành nhiều phần. Lợi ích là tải lại được đúng phần bị hỏng thay vì làm lại từ đầu, và tải song song nhiều phần cùng lúc. Kèm theo đó cần cơ chế dọn dẹp những lần tải lên dở dang, nếu không kho sẽ đầy rác không ai biết.',
          'Về độ bền, kho đối tượng đạt độ bền rất cao bằng cách nhân bản dữ liệu qua nhiều vùng sẵn sàng hoặc dùng mã sửa lỗi để giảm chi phí lưu trữ. Điểm cần nhớ khi phỏng vấn: độ bền và tính sẵn sàng là hai chỉ số khác nhau — dữ liệu có thể không bao giờ mất nhưng vẫn có lúc không truy cập được.',
        ],
        diagram: `flowchart LR
  C["Client"] -->|"1. Xin quyền tải lên"| A["App service"]
  A -->|"2. Trả đường dẫn có chữ ký"| C
  C -->|"3. Tải tệp thẳng lên"| B[("Blobstore")]
  A -->|"4. Ghi metadata"| DB[("Database")]
  B --> CDN["CDN phục vụ tải xuống"]`,
        callout:
          'Câu hỏi đánh giá ngay được kinh nghiệm: "tệp đi qua tầng ứng dụng hay tải thẳng lên kho?". Trả lời đúng là tải thẳng bằng đường dẫn có chữ ký.',
      },
      {
        heading: 'Tìm kiếm phân tán: chỉ mục đảo ngược',
        body: [
          'Câu hỏi mở đầu quen thuộc là vì sao không dùng câu lệnh khớp chuỗi của [[Database]] quan hệ. Lý do là nó phải quét toàn bộ bảng, không tận dụng được chỉ mục thông thường, và không xếp hạng được theo mức độ liên quan.',
          'Giải pháp là chỉ mục đảo ngược: thay vì lưu tài liệu chứa từ nào, ta lưu mỗi từ xuất hiện trong những tài liệu nào. Trước đó văn bản được tách từ, đưa về chữ thường, cắt về dạng gốc và loại bỏ từ dừng. Nhờ vậy tra một từ khóa chỉ là tra bảng, và ghép nhiều từ khóa là phép giao trên các danh sách.',
          'Ở quy mô lớn, chỉ mục vừa được chia nhỏ vừa được nhân bản. Chia theo tài liệu là cách phổ biến: mỗi shard giữ một tập tài liệu và có chỉ mục đầy đủ của riêng nó, truy vấn được gửi tới mọi shard rồi gộp kết quả và xếp hạng lại. Nhân bản mỗi shard giúp chịu tải đọc và sống sót khi máy chết.',
          'Hai đánh đổi cần nói được. Thứ nhất, chỉ mục không cập nhật tức thì: tài liệu mới thường xuất hiện trong kết quả sau một khoảng ngắn, vì việc ghi được gom lô để đổi lấy [[Throughput]]. Thứ hai, hệ tìm kiếm nên là bản sao phục vụ đọc chứ không phải nguồn sự thật — dữ liệu gốc vẫn nằm ở [[Database]], và đồng bộ sang chỉ mục qua luồng sự kiện, thường là [[Kafka]]. Như vậy khi chỉ mục hỏng thì dựng lại được từ đầu.',
        ],
        table: {
          headers: ['Nhu cầu', 'Công cụ phù hợp', 'Lý do'],
          rows: [
            ['Tra cứu chính xác theo khóa', 'Database quan hệ hoặc kho khóa-giá trị', 'Nhanh, nhất quán, không cần xếp hạng'],
            ['Tìm toàn văn, xếp hạng liên quan', 'Hệ tìm kiếm với chỉ mục đảo ngược', 'Tách từ, chấm điểm, gợi ý sửa lỗi chính tả'],
            ['Lọc theo nhiều thuộc tính kết hợp', 'Hệ tìm kiếm hoặc chỉ mục chuyên biệt', 'Giao nhiều danh sách hiệu quả'],
          ],
        },
      },
      {
        heading: 'Logging phân tán: tìm được thứ mình cần lúc 2 giờ sáng',
        body: [
          'Khi hệ thống chỉ có một máy chủ, đọc nhật ký là chuyện mở tệp ra xem. Khi có hàng trăm tiến trình, nhật ký phải được gom về một nơi, nếu không việc điều tra sự cố trở thành đăng nhập từng máy để tìm.',
          'Đường đi tiêu chuẩn gồm bốn chặng: ứng dụng ghi nhật ký có cấu trúc, một tác nhân trên mỗi máy thu thập, đẩy qua một hàng đợi đệm để chịu được đỉnh tải, rồi nạp vào kho có thể tìm kiếm. Hàng đợi ở giữa là chi tiết quan trọng — không có nó, một đợt lỗi bùng phát sẽ đánh sập chính hệ thống nhật ký đúng lúc bạn cần nó nhất.',
          'Nhật ký phải có cấu trúc, nghĩa là mỗi dòng là một bản ghi có trường rõ ràng chứ không phải câu văn tự do. Trường quan trọng nhất là mã tương quan đi xuyên suốt một request qua mọi dịch vụ — không có nó thì không ghép lại được câu chuyện của một request cụ thể. Kèm theo là mức độ, tên dịch vụ, phiên bản, và id người dùng nếu được phép.',
          'Chi phí là ràng buộc thật. Ghi mọi thứ ở mức chi tiết nhất sẽ tốn hơn cả hệ thống chính. Cách xử lý gồm lấy mẫu với nhật ký khối lượng lớn nhưng giữ toàn bộ bản ghi lỗi, đặt thời hạn lưu theo tầng — vài ngày ở kho nóng tra cứu nhanh, vài tháng ở kho lạnh giá rẻ — và tuyệt đối không ghi dữ liệu nhạy cảm vào nhật ký vì gỡ ra sau đó rất khó.',
        ],
        diagram: `flowchart LR
  S["Dịch vụ ghi log có cấu trúc"] --> AG["Agent trên mỗi máy"]
  AG --> Q["Hàng đợi đệm"]
  Q --> IX["Kho tìm kiếm — dữ liệu nóng vài ngày"]
  Q --> CO["Kho lạnh — lưu dài hạn giá rẻ"]`,
        callout:
          'Mã tương quan là thứ rẻ nhất để thêm và đắt nhất khi thiếu. Thêm ngay từ đầu, đừng đợi tới lúc có sự cố.',
      },
      {
        heading: 'Điểm chung của cả bốn thành phần',
        body: [
          'Bốn thứ trong buổi này — [[CDN]], kho đối tượng, hệ tìm kiếm, hệ nhật ký — đều phục vụ cùng một mục đích: gỡ tải khỏi tầng ứng dụng và tầng dữ liệu chính. Nội dung tĩnh ra biên, byte tệp ra kho đối tượng, truy vấn toàn văn sang hệ tìm kiếm, và nhật ký sang một đường ống riêng.',
          'Điểm chung thứ hai là ba trong bốn thứ này đều là bản sao phục vụ đọc, không phải nguồn sự thật. Chỉ mục tìm kiếm, bộ đệm ở biên và kho nhật ký đều có thể dựng lại từ dữ liệu gốc. Nói được điều này cho thấy bạn hiểu đường phục hồi khi chúng hỏng — mà chúng sẽ hỏng.',
        ],
      },
    ],
    flashcards: [
      {
        question: 'CDN kiểu kéo và kiểu đẩy khác nhau thế nào?',
        answer:
          'Kiểu kéo: điểm biên chưa có nội dung thì đi lấy từ máy chủ gốc rồi giữ lại — đơn giản, tự động, nhưng người dùng đầu tiên ở mỗi vùng chịu lần trượt. Kiểu đẩy: chủ động đưa nội dung ra biên trước khi có ai yêu cầu — hợp với tệp lớn phát hành theo lịch như bản cập nhật hoặc video vừa xuất bản.',
        pitfall:
          'Quên bàn về cách làm mới. Xóa nội dung khỏi hàng trăm điểm biên chậm và thường bị giới hạn số lần — đặt phiên bản trong tên tệp là cách thực dụng hơn.',
      },
      {
        question: 'Tệp người dùng tải lên nên đi đường nào?',
        answer:
          'Không đi qua tầng ứng dụng. Client xin một đường dẫn có chữ ký với thời hạn ngắn rồi tải thẳng lên kho đối tượng; tầng ứng dụng chỉ cấp phép và ghi metadata. Database giữ metadata, kho đối tượng giữ byte. Với tệp rất lớn thì chia phần để tải lại được đúng phần hỏng và tải song song.',
        pitfall:
          'Cho tệp đi xuyên qua tầng ứng dụng. Nó biến máy chủ ứng dụng thành nút cổ chai băng thông một cách không cần thiết.',
      },
      {
        question: 'Vì sao không dùng khớp chuỗi của database quan hệ để làm tìm kiếm?',
        answer:
          'Vì nó phải quét toàn bộ bảng, không tận dụng được chỉ mục thông thường và không xếp hạng theo mức độ liên quan. Hệ tìm kiếm dùng chỉ mục đảo ngược: lưu mỗi từ xuất hiện trong những tài liệu nào, sau khi đã tách từ, đưa về chữ thường, cắt về dạng gốc và loại từ dừng. Nhờ vậy tra từ khóa chỉ là tra bảng.',
        pitfall:
          'Coi hệ tìm kiếm là nguồn sự thật. Nó nên là bản sao phục vụ đọc, đồng bộ từ database qua luồng sự kiện để dựng lại được khi hỏng.',
      },
      {
        question: 'Vì sao đường ống log cần một hàng đợi ở giữa?',
        answer:
          'Để chịu được đỉnh tải. Một đợt lỗi bùng phát sinh ra lượng log tăng vọt; không có hàng đợi đệm thì chính hệ thống log bị đánh sập đúng lúc bạn cần nó nhất để điều tra. Hàng đợi cũng tách rời tốc độ ghi của ứng dụng khỏi tốc độ nạp của kho tìm kiếm.',
        pitfall:
          'Cho ứng dụng ghi thẳng vào kho tìm kiếm. Khi kho chậm hoặc đầy, ứng dụng bị kéo chậm theo.',
      },
      {
        question: 'Trường quan trọng nhất trong log có cấu trúc là gì?',
        answer:
          'Mã tương quan đi xuyên suốt một request qua mọi dịch vụ. Không có nó thì không ghép lại được câu chuyện của một request cụ thể khi nó đi qua nhiều dịch vụ. Kèm theo là mức độ, tên dịch vụ, phiên bản và id người dùng nếu được phép ghi.',
        pitfall:
          'Ghi log dạng câu văn tự do. Không lọc được, không tổng hợp được, và tới lúc cần thì chỉ còn cách đọc bằng mắt.',
      },
      {
        question: 'Chi phí lưu log kiểm soát bằng cách nào?',
        answer:
          'Lấy mẫu với nhật ký khối lượng lớn nhưng giữ toàn bộ bản ghi lỗi; đặt thời hạn lưu theo tầng, vài ngày ở kho nóng tra cứu nhanh và vài tháng ở kho lạnh giá rẻ; và không ghi dữ liệu nhạy cảm vì gỡ ra sau đó rất khó.',
        pitfall:
          'Ghi mọi thứ ở mức chi tiết nhất và giữ mãi. Hệ thống log khi đó tốn hơn cả hệ thống chính.',
      },
    ],
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
    sections: [
      {
        heading: 'Vì sao cần một khung cố định',
        body: [
          'Bốn mươi lăm phút trôi nhanh hơn bạn tưởng. Không có khung, phần lớn ứng viên tiêu hai mươi phút đầu vẽ hộp và mũi tên, rồi hết giờ trước khi kịp chạm tới phần thú vị nhất — điểm nghẽn và đánh đổi, vốn là nơi người phỏng vấn chấm điểm nặng nhất.',
          'Khung cố định giải quyết hai việc. Nó bảo đảm bạn không bỏ sót bước nào dưới áp lực, và nó cho người phỏng vấn thấy bạn có phương pháp làm việc chứ không phải ứng biến may rủi. Ngay cả khi bị hỏi một đề chưa từng gặp, có khung nghĩa là bạn vẫn biết bước tiếp theo phải làm gì.',
          'Điều quan trọng: khung là để bám, không phải để đọc thuộc lòng. Người phỏng vấn có thể cắt ngang, đổi hướng, thêm ràng buộc giữa chừng. Lúc đó hãy điều chỉnh và nói rõ mình đang quay lại bước nào.',
        ],
        diagram: `flowchart LR
  S1["1. Làm rõ yêu cầu — 5'"] --> S2["2. Ước lượng quy mô — 5'"]
  S2 --> S3["3. API và mô hình dữ liệu — 8'"]
  S3 --> S4["4. Kiến trúc tổng thể — 12'"]
  S4 --> S5["5. Đi sâu một thành phần — 10'"]
  S5 --> S6["6. Điểm nghẽn và đánh đổi — 5'"]
  S6 -. "bị hỏi thêm ràng buộc" .-> S1`,
        table: {
          headers: ['Bước', 'Tên', 'Thời gian', 'Kết quả cần có'],
          rows: [
            ['1', 'Làm rõ yêu cầu', '5 phút', 'Danh sách chức năng trong phạm vi và ngoài phạm vi'],
            ['2', 'Ước lượng quy mô', '5 phút', 'Vài con số về lưu lượng, dung lượng, băng thông'],
            ['3', 'Thiết kế API và mô hình dữ liệu', '8 phút', 'Vài endpoint chính và các thực thể'],
            ['4', 'Kiến trúc tổng thể', '12 phút', 'Sơ đồ các thành phần và luồng dữ liệu'],
            ['5', 'Đi sâu một thành phần', '10 phút', 'Chi tiết phần khó nhất hoặc phần được hỏi'],
            ['6', 'Điểm nghẽn và đánh đổi', '5 phút', 'Chỗ sẽ vỡ trước và cách xử lý'],
          ],
        },
        callout:
          'Nói to khung của bạn ngay đầu buổi: "tôi sẽ làm rõ yêu cầu, ước lượng quy mô, phác API và dữ liệu, rồi vẽ kiến trúc và đi sâu vào phần khó". Câu này một mình đã tạo ấn tượng tốt.',
      },
      {
        heading: 'Bước 1: làm rõ yêu cầu — nơi ăn điểm dễ nhất',
        body: [
          'Đề bài luôn cố tình mơ hồ. "Thiết kế Twitter" có thể là hệ thống đăng bài, có thể là bảng tin, có thể là tìm kiếm — và bạn không đủ thời gian làm tất cả. Việc đầu tiên là thu hẹp.',
          'Hỏi về chức năng: những thao tác nào bắt buộc phải có? Người dùng làm gì với hệ thống? Sau đó chốt rõ phần nào để ngoài phạm vi và nói thành lời — "tôi sẽ không làm phần quảng cáo và kiểm duyệt nội dung trong buổi này". Nói ra phần bỏ qua là dấu hiệu của người biết quản lý phạm vi, không phải người thiếu sót.',
          'Hỏi về yêu cầu phi chức năng, vốn quyết định kiến trúc nhiều hơn cả chức năng: bao nhiêu người dùng hoạt động mỗi ngày, tỉ lệ đọc trên ghi, độ trễ chấp nhận được, mức nhất quán cần thiết, và hệ thống phải sống sót ở mức nào khi có sự cố. Bốn câu này gần như luôn dùng được cho mọi đề.',
          'Ghi những gì chốt được lên góc bảng và giữ nguyên ở đó suốt buổi. Về sau khi bảo vệ một lựa chọn, bạn chỉ cần chỉ vào ràng buộc đã chốt thay vì tranh luận cảm tính.',
        ],
      },
      {
        heading: 'Bước 2: ước lượng quy mô — cần đúng bậc, không cần chính xác',
        body: [
          'Mục đích của ước lượng không phải ra con số đúng, mà là biết mình đang ở bậc độ lớn nào. Một triệu request mỗi ngày và một tỉ request mỗi ngày dẫn tới hai kiến trúc hoàn toàn khác nhau; nhầm bậc là hỏng cả thiết kế.',
          'Cách làm gọn: bắt đầu từ số người dùng hoạt động mỗi ngày, nhân với số thao tác mỗi người, chia cho số giây trong ngày để ra số request trung bình mỗi giây, rồi nhân hệ số đỉnh khoảng hai tới ba lần. Với dung lượng, nhân số bản ghi mỗi ngày với kích thước một bản ghi rồi nhân số ngày cần lưu.',
          'Vài con số nên thuộc để ước lượng nhanh: một ngày có khoảng 86 nghìn giây, tiện làm tròn thành 100 nghìn. Một vòng đi về trong cùng vùng khoảng 1–2 mili giây, xuyên lục địa khoảng 100–150 mili giây. Đọc tuần tự từ ổ SSD nhanh hơn ổ đĩa quay hàng chục lần, và đọc từ bộ nhớ nhanh hơn SSD lại hàng trăm lần.',
          'Nói to phép tính của bạn. Người phỏng vấn quan tâm cách bạn suy luận hơn kết quả cuối. Làm tròn mạnh tay và nói rõ mình đang làm tròn là chuyện hoàn toàn bình thường.',
        ],
        callout:
          'Một câu dùng được cho mọi đề: "tôi sẽ làm tròn để lấy đúng bậc độ lớn, vì điều tôi cần biết là hệ thống này ở mức nghìn hay mức triệu request mỗi giây".',
      },
      {
        heading: 'Bước 3 và 4: từ API tới kiến trúc',
        body: [
          'Phác vài [[Endpoint]] chính trước khi vẽ hộp. Việc này ép bạn nghĩ theo hướng người dùng cần gì thay vì nghĩ theo công nghệ, và nó lộ ra ngay những chỗ mô hình dữ liệu chưa ổn. Không cần đầy đủ — ba tới năm endpoint quan trọng nhất là đủ.',
          'Tiếp đó là mô hình dữ liệu: các thực thể chính, quan hệ giữa chúng, và quan trọng nhất là khóa truy cập. Truy vấn sẽ luôn đi qua trường nào? Câu trả lời quyết định chọn loại [[Database]] và chọn khóa chia dữ liệu về sau.',
          'Khi vẽ kiến trúc, hãy đi theo đường của một request từ client vào tới nơi lưu dữ liệu rồi quay ra. Bắt đầu từ phương án đơn giản nhất chạy được — client, [[Load Balancer]], vài máy chủ ứng dụng, một database — rồi mới thêm [[Cache]], hàng đợi, [[CDN]] ở đúng chỗ có lý do. Vẽ ngay một kiến trúc mười thành phần từ đầu khiến bạn không giải thích được vì sao cần từng thứ.',
          'Vừa vẽ vừa nói lý do. Mỗi lần thêm một thành phần, nói nó giải quyết vấn đề gì và tốn thêm cái gì. Đó chính là thứ đang được chấm.',
        ],
      },
      {
        heading: 'Bước 5 và 6: đi sâu, rồi nói về chỗ sẽ vỡ',
        body: [
          'Người phỏng vấn thường chọn một thành phần và yêu cầu đi sâu. Nếu được tự chọn, hãy chọn phần khó nhất của bài — thường là chỗ có xung đột giữa quy mô và tính nhất quán. Với bảng tin thì đó là cách phát tán bài viết; với hệ đặt chỗ thì đó là chống đặt trùng; với hệ nhắn tin thì đó là quản lý kết nối dài.',
          'Phần cuối là chỗ nhiều ứng viên bỏ lỡ vì hết giờ, mà lại là phần ăn điểm nặng nhất. Hãy chủ động chỉ ra chỗ nào trong chính thiết kế của bạn sẽ vỡ trước khi tải tăng mười lần, và bạn sẽ làm gì khi đó. Nói về điểm chết duy nhất, về [[Hot Partition]], về chuyện điều gì xảy ra khi một thành phần chết.',
          'Kết thúc bằng một câu tóm tắt các đánh đổi đã chọn: bạn ưu tiên gì, hy sinh gì, và trong hoàn cảnh nào bạn sẽ chọn khác đi. Đây là câu phân biệt rõ nhất giữa ứng viên đã làm hệ thống thật và ứng viên mới đọc lý thuyết.',
        ],
        table: {
          headers: ['Lỗi trừ điểm', 'Vì sao mất điểm', 'Làm thế nào cho đúng'],
          rows: [
            ['Vẽ ngay khi vừa nghe đề', 'Thiết kế không có ràng buộc để bảo vệ', 'Dành 5 phút làm rõ yêu cầu trước'],
            ['Không đưa ra con số nào', 'Mọi lựa chọn công nghệ thành cảm tính', 'Ước lượng thô, nói to phép tính'],
            ['Kể tên công nghệ mà không nói vì sao', 'Nghe như thuộc lòng', 'Mỗi thành phần kèm một lý do và một cái giá'],
            ['Chỉ nói ưu điểm', 'Không thấy được khả năng đánh giá', 'Chủ động nêu chỗ sẽ vỡ trước'],
            ['Im lặng khi suy nghĩ', 'Người phỏng vấn không chấm được', 'Nói to hướng đang cân nhắc'],
          ],
        },
        callout:
          'Nếu chỉ nhớ được một điều từ buổi này: dành năm phút cuối để tự chỉ ra điểm yếu trong thiết kế của mình. Ứng viên tự tìm ra lỗ hổng luôn được đánh giá cao hơn ứng viên chờ bị hỏi.',
      },
    ],
    flashcards: [
      {
        question: 'Phân bổ 45 phút của buổi phỏng vấn System Design thế nào?',
        answer:
          'Làm rõ yêu cầu 5 phút, ước lượng quy mô 5 phút, thiết kế API và mô hình dữ liệu 8 phút, kiến trúc tổng thể 12 phút, đi sâu một thành phần 10 phút, điểm nghẽn và đánh đổi 5 phút. Điều quan trọng là giữ được 5 phút cuối, vì đó là phần ăn điểm nặng nhất mà nhiều người bỏ lỡ vì hết giờ.',
        pitfall:
          'Tiêu hai mươi phút đầu vẽ hộp và mũi tên rồi không còn thời gian nói về đánh đổi.',
      },
      {
        question: 'Bốn câu hỏi phi chức năng dùng được cho mọi đề là gì?',
        answer:
          'Bao nhiêu người dùng hoạt động mỗi ngày; tỉ lệ đọc trên ghi; độ trễ chấp nhận được; mức nhất quán cần thiết. Bốn câu này quyết định kiến trúc nhiều hơn cả danh sách chức năng, và trả lời được chúng thì mọi lựa chọn về sau đều có căn cứ để bảo vệ.',
        pitfall:
          'Chỉ hỏi về chức năng rồi bắt tay vẽ. Yêu cầu phi chức năng mới là thứ định hình kiến trúc.',
      },
      {
        question: 'Mục đích thật của bước ước lượng quy mô là gì?',
        answer:
          'Biết mình đang ở bậc độ lớn nào, không phải ra con số chính xác. Một triệu request mỗi ngày và một tỉ request mỗi ngày dẫn tới hai kiến trúc hoàn toàn khác nhau. Cách làm: số người dùng hoạt động nhân số thao tác mỗi người, chia số giây trong ngày, nhân hệ số đỉnh hai tới ba lần. Làm tròn mạnh tay và nói rõ mình đang làm tròn.',
        pitfall:
          'Sa vào tính toán chi li tới từng byte. Người phỏng vấn quan tâm cách suy luận hơn kết quả cuối.',
      },
      {
        question: 'Vì sao nên phác API trước khi vẽ kiến trúc?',
        answer:
          'Vì nó ép bạn nghĩ theo hướng người dùng cần gì thay vì nghĩ theo công nghệ, và lộ ra ngay những chỗ mô hình dữ liệu chưa ổn. Ba tới năm endpoint quan trọng nhất là đủ. Sau đó tới mô hình dữ liệu, trong đó khóa truy cập là thứ quyết định chọn loại database và khóa chia dữ liệu về sau.',
        pitfall:
          'Vẽ ngay một kiến trúc mười thành phần từ đầu, rồi không giải thích được vì sao cần từng thứ.',
      },
      {
        question: 'Nói gì trong 5 phút cuối để ăn điểm?',
        answer:
          'Chủ động chỉ ra chỗ nào trong chính thiết kế của mình sẽ vỡ trước khi tải tăng mười lần, và cách xử lý khi đó: điểm chết duy nhất, điểm nóng dữ liệu, điều gì xảy ra khi một thành phần chết. Kết thúc bằng câu tóm tắt bạn ưu tiên gì, hy sinh gì, và trong hoàn cảnh nào sẽ chọn khác đi.',
        pitfall:
          'Chỉ trình bày ưu điểm và chờ bị hỏi. Ứng viên tự tìm ra lỗ hổng của mình luôn được đánh giá cao hơn.',
      },
      {
        question: 'Vì sao im lặng khi suy nghĩ là lỗi trừ điểm?',
        answer:
          'Vì người phỏng vấn chấm quá trình suy luận, không chấm kết quả cuối. Im lặng nghĩa là họ không thấy gì để chấm và cũng không kịp gợi ý khi bạn đi sai hướng. Hãy nói to hướng đang cân nhắc, kể cả khi chưa chắc chắn — "tôi đang phân vân giữa hai cách, cách một thì..." là câu hoàn toàn hợp lệ.',
        pitfall:
          'Cố nghĩ ra câu trả lời hoàn hảo rồi mới mở miệng. Buổi phỏng vấn là cuộc trao đổi, không phải bài thi viết.',
      },
    ],
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
