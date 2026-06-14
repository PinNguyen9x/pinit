// Từ điển thuật ngữ Phần mềm & AI — định nghĩa tiếng Việt, dễ hiểu & dễ nhớ.
// Mỗi mục có:
//   term    — tên thuật ngữ
//   cat      — nhóm: Web | Cloud | DevOps | Database | Security | AI | General
//   short    — một câu ví von ngắn, dễ hình dung
//   detail   — giải thích chi tiết; kết bằng "💡 Dễ nhớ:" làm điểm neo trí nhớ
//   related  — các thuật ngữ liên quan (click để nhảy tới)

export type GlossaryCategory =
  | 'Web'
  | 'Cloud'
  | 'DevOps'
  | 'Database'
  | 'Security'
  | 'AI'
  | 'Messaging'
  | 'General'

export interface GlossaryTerm {
  term: string
  cat: GlossaryCategory
  short: string
  detail: string
  related?: string[]
}

export const GLOSSARY: GlossaryTerm[] = [
  // ─────────────────────────── Software ───────────────────────────
  {
    term: 'API',
    cat: 'Web',
    short: 'Giao diện lập trình ứng dụng — cách các phần mềm "nói chuyện" với nhau.',
    detail:
      'API (Application Programming Interface) là tập hợp các quy tắc và endpoint cho phép hai ứng dụng trao đổi dữ liệu với nhau. Thay vì truy cập trực tiếp database, client gọi API và nhận về dữ liệu đã được kiểm soát, định dạng sẵn (thường là JSON). 💡 Dễ nhớ: API như người phục vụ trong nhà hàng — bạn không vào bếp, chỉ gọi món và họ mang ra.',
    related: ['REST', 'GraphQL', 'Endpoint', 'SDK'],
  },
  {
    term: 'Authentication',
    cat: 'Security',
    short: 'Xác minh "bạn là ai" trước khi cho phép truy cập hệ thống.',
    detail:
      'Authentication (xác thực) là quá trình xác minh danh tính của người dùng — qua mật khẩu, OTP, sinh trắc học hoặc token. Khác với Authorization (phân quyền) vốn quyết định "bạn được làm gì" sau khi đã xác thực. 💡 Dễ nhớ: Authentication = "bạn là ai?", Authorization = "bạn được làm gì?".',
    related: ['Token / JWT', 'OAuth', 'CORS'],
  },
  {
    term: 'Cache',
    cat: 'General',
    short: 'Lưu tạm dữ liệu để lần sau lấy ra nhanh hơn.',
    detail:
      'Cache là vùng nhớ lưu trữ tạm thời các dữ liệu hay được truy cập, giúp giảm thời gian phản hồi và tải cho server/database. Có thể nằm ở trình duyệt, CDN, server (Redis/Memcached) hoặc ngay trong CPU. 💡 Dễ nhớ: như để chai nước hay uống ngay trên bàn thay vì xuống bếp lấy mỗi lần.',
    related: ['CDN', 'Latency', 'Database'],
  },
  {
    term: 'CDN',
    cat: 'Web',
    short: 'Mạng máy chủ phân tán giúp tải nội dung nhanh theo vị trí địa lý.',
    detail:
      'CDN (Content Delivery Network) là hệ thống máy chủ đặt ở nhiều nơi trên thế giới, lưu bản sao nội dung tĩnh (ảnh, CSS, JS, video) và phục vụ từ máy gần người dùng nhất — giảm latency và tải cho server gốc. 💡 Dễ nhớ: như chuỗi kho hàng đặt khắp nơi, bạn nhận hàng từ kho gần nhất.',
    related: ['Cache', 'Latency', 'Load Balancer'],
  },
  {
    term: 'CI/CD',
    cat: 'DevOps',
    short: 'Tự động build, test và deploy mỗi khi code thay đổi.',
    detail:
      'CI/CD (Continuous Integration / Continuous Delivery) là quy trình tự động hóa: CI tự động tích hợp & test code khi developer push, CD tự động đưa code đã qua test lên môi trường staging/production. Giúp phát hiện lỗi sớm và release nhanh, an toàn. 💡 Dễ nhớ: như băng chuyền nhà máy — code vào một đầu, sản phẩm chạy được ra đầu kia.',
    related: ['Git', 'Docker', 'Kubernetes'],
  },
  {
    term: 'Container',
    cat: 'DevOps',
    short: 'Đóng gói app cùng mọi thứ nó cần để chạy giống nhau ở mọi nơi.',
    detail:
      'Container đóng gói ứng dụng cùng tất cả dependencies (thư viện, config, runtime) thành một đơn vị nhẹ, chạy đồng nhất trên mọi máy. Khác máy ảo (VM), container chia sẻ kernel của OS nên khởi động nhanh và tốn ít tài nguyên. 💡 Dễ nhớ: như container hàng hải — đóng gói một lần, chở được trên mọi loại tàu/xe.',
    related: ['Docker', 'Kubernetes', 'Microservices'],
  },
  {
    term: 'CORS',
    cat: 'Web',
    short: 'Cơ chế cho phép web ở domain này gọi API ở domain khác.',
    detail:
      'CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt, dùng HTTP header để quyết định trang web từ origin này có được phép gọi tài nguyên ở origin khác hay không. Lỗi CORS rất hay gặp khi frontend và backend khác domain/port. 💡 Dễ nhớ: như bảo vệ tòa nhà — chỉ cho khách có tên trong danh sách được vào.',
    related: ['API', 'Authentication', 'Endpoint'],
  },
  {
    term: 'CRUD',
    cat: 'Database',
    short: 'Bốn thao tác cơ bản với dữ liệu: Tạo, Đọc, Sửa, Xóa.',
    detail:
      'CRUD viết tắt của Create, Read, Update, Delete — bốn thao tác cơ bản trên dữ liệu mà hầu hết ứng dụng đều có. Trong REST API, chúng tương ứng với các method POST, GET, PUT/PATCH, DELETE. 💡 Dễ nhớ: vòng đời mọi dữ liệu — sinh ra, được xem, được sửa, rồi mất đi.',
    related: ['REST', 'Database', 'SQL'],
  },
  {
    term: 'Database',
    cat: 'Database',
    short: 'Nơi lưu trữ, tổ chức và truy vấn dữ liệu một cách có cấu trúc.',
    detail:
      'Database (cơ sở dữ liệu) là hệ thống lưu trữ dữ liệu có tổ chức để dễ truy vấn và quản lý. Chia thành SQL (quan hệ, có schema chặt như PostgreSQL, MySQL) và NoSQL (linh hoạt như MongoDB, Redis). 💡 Dễ nhớ: như một thư viện — sách (dữ liệu) được phân kệ ngăn nắp để tìm là thấy.',
    related: ['SQL', 'ORM', 'Cache', 'CRUD'],
  },
  {
    term: 'DNS',
    cat: 'Web',
    short: '"Danh bạ" của Internet — đổi tên miền thành địa chỉ IP.',
    detail:
      'DNS (Domain Name System) dịch tên miền dễ nhớ (vd: example.com) sang địa chỉ IP mà máy tính dùng để kết nối. Khi bạn gõ một URL, trình duyệt hỏi DNS để biết server nằm ở đâu trước khi gửi request. 💡 Dễ nhớ: như danh bạ điện thoại — bạn nhớ "tên", máy tra ra "số".',
    related: ['CDN', 'Load Balancer'],
  },
  {
    term: 'Docker',
    cat: 'DevOps',
    short: 'Công cụ phổ biến nhất để tạo và chạy container.',
    detail:
      'Docker là nền tảng cho phép đóng gói ứng dụng thành container thông qua Dockerfile, rồi build thành image và chạy ở bất cứ đâu có Docker. Là chuẩn de-facto cho containerization hiện nay. 💡 Dễ nhớ: Dockerfile là công thức, image là hộp cơm đóng sẵn, container là bữa ăn đang chạy.',
    related: ['Container', 'Kubernetes', 'CI/CD'],
  },
  {
    term: 'Endpoint',
    cat: 'Web',
    short: 'Một URL cụ thể của API để gửi request tới.',
    detail:
      'Endpoint là một địa chỉ URL cụ thể mà client gọi tới để thực hiện một hành động trên API, ví dụ GET /users hoặc POST /orders. Mỗi endpoint thường ứng với một tài nguyên và method nhất định. 💡 Dễ nhớ: như từng quầy dịch vụ trong bưu điện — mỗi quầy lo một việc.',
    related: ['API', 'REST', 'Webhook'],
  },
  {
    term: 'Framework',
    cat: 'General',
    short: 'Bộ khung code sẵn giúp xây ứng dụng nhanh và có quy chuẩn.',
    detail:
      'Framework là bộ khung phần mềm cung cấp cấu trúc, công cụ và quy ước sẵn để developer xây dựng ứng dụng mà không phải làm lại từ đầu (vd: React, Next.js, Django, Spring). Khác với library, framework điều khiển luồng chạy của app. 💡 Dễ nhớ: library là bạn gọi nó; framework thì nó gọi bạn ("đừng gọi chúng tôi, chúng tôi sẽ gọi bạn").',
    related: ['SDK', 'Middleware'],
  },
  {
    term: 'Git',
    cat: 'DevOps',
    short: 'Hệ thống quản lý phiên bản code phổ biến nhất.',
    detail:
      'Git là hệ thống version control phân tán, theo dõi mọi thay đổi của mã nguồn, cho phép nhiều người làm việc song song qua branch và merge. GitHub/GitLab là dịch vụ host repository Git phổ biến. 💡 Dễ nhớ: như nút "save game" cho code — luôn quay lại được bản trước.',
    related: ['CI/CD'],
  },
  {
    term: 'GraphQL',
    cat: 'Web',
    short: 'Ngôn ngữ truy vấn API — client tự chọn đúng dữ liệu cần.',
    detail:
      'GraphQL là ngôn ngữ truy vấn cho API, cho phép client yêu cầu chính xác các trường dữ liệu cần thiết trong một request duy nhất — tránh over-fetching/under-fetching thường gặp ở REST. Chỉ có một endpoint duy nhất. 💡 Dễ nhớ: REST là set menu cố định, GraphQL là buffet — lấy đúng những gì bạn muốn.',
    related: ['API', 'REST', 'Endpoint'],
  },
  {
    term: 'Idempotency',
    cat: 'General',
    short: 'Gọi nhiều lần cũng cho kết quả như gọi một lần.',
    detail:
      'Idempotency (tính bất biến) nghĩa là thực hiện một thao tác nhiều lần cho ra cùng kết quả như làm một lần. Quan trọng với API thanh toán/network không ổn định — vd dùng idempotency key để tránh trừ tiền hai lần khi request bị gửi lại. 💡 Dễ nhớ: như bấm nút thang máy 5 lần — thang vẫn chỉ đến một lần.',
    related: ['REST', 'API'],
  },
  {
    term: 'Kubernetes',
    cat: 'Cloud',
    short: 'Hệ thống điều phối, tự động scale & quản lý container.',
    detail:
      'Kubernetes (K8s) là nền tảng orchestration giúp triển khai, scale và quản lý hàng loạt container tự động — tự khởi động lại container chết, phân bổ tải, rolling update. Là tiêu chuẩn cho hệ thống cloud-native quy mô lớn. 💡 Dễ nhớ: như nhạc trưởng điều phối cả dàn nhạc container chơi đúng nhịp.',
    related: ['Container', 'Docker', 'Microservices', 'Load Balancer'],
  },
  {
    term: 'Latency',
    cat: 'General',
    short: 'Độ trễ — thời gian từ lúc gửi request đến khi nhận phản hồi.',
    detail:
      'Latency là khoảng thời gian trễ giữa hành động và phản hồi, thường đo bằng mili-giây (ms). Latency thấp = trải nghiệm mượt. Bị ảnh hưởng bởi khoảng cách địa lý, tải server, băng thông mạng. 💡 Dễ nhớ: là khoảng lặng từ lúc bạn hỏi đến lúc nghe câu trả lời.',
    related: ['CDN', 'Cache', 'Load Balancer'],
  },
  {
    term: 'Load Balancer',
    cat: 'Cloud',
    short: 'Phân phối lưu lượng đều cho nhiều server để tránh quá tải.',
    detail:
      'Load Balancer (cân bằng tải) là thành phần phân phối request đến nhiều server backend, giúp không server nào bị quá tải, tăng độ sẵn sàng và khả năng chịu tải. Nếu một server chết, lưu lượng được chuyển sang server khác. 💡 Dễ nhớ: như nhân viên điều phối hàng ở siêu thị — "mời quý khách qua quầy số 3 đang trống".',
    related: ['CDN', 'Kubernetes', 'Latency'],
  },
  {
    term: 'Microservices',
    cat: 'General',
    short: 'Chia app lớn thành nhiều dịch vụ nhỏ, độc lập.',
    detail:
      'Microservices là kiến trúc chia ứng dụng thành nhiều dịch vụ nhỏ, độc lập, mỗi service lo một nghiệp vụ và có thể deploy riêng. Ngược với monolith. Linh hoạt và dễ scale nhưng phức tạp hơn về vận hành. 💡 Dễ nhớ: monolith là một siêu thị khổng lồ, microservices là một dãy cửa hàng chuyên doanh.',
    related: ['Container', 'Kubernetes', 'API'],
  },
  {
    term: 'Middleware',
    cat: 'Web',
    short: 'Lớp xử lý trung gian nằm giữa request và response.',
    detail:
      'Middleware là đoạn code chạy xen giữa khi nhận request và khi trả response — dùng để xác thực, logging, parse dữ liệu, xử lý lỗi... Trong Express/Next.js, middleware xếp thành chuỗi, mỗi cái xử lý rồi chuyển tiếp. 💡 Dễ nhớ: như các cửa an ninh ở sân bay — request phải qua từng trạm trước khi tới cổng.',
    related: ['API', 'Framework', 'Authentication'],
  },
  {
    term: 'OAuth',
    cat: 'Security',
    short: 'Chuẩn cho phép đăng nhập bằng tài khoản bên thứ ba an toàn.',
    detail:
      'OAuth là giao thức ủy quyền cho phép ứng dụng truy cập tài nguyên của người dùng ở dịch vụ khác mà không cần mật khẩu — nền tảng của "Đăng nhập bằng Google/Facebook". Cấp access token với phạm vi quyền giới hạn. 💡 Dễ nhớ: như chìa khóa cho nhân viên đỗ xe — vào được xe nhưng không mở được nhà bạn.',
    related: ['Authentication', 'Token / JWT'],
  },
  {
    term: 'ORM',
    cat: 'Database',
    short: 'Thao tác database bằng object thay vì viết SQL thủ công.',
    detail:
      'ORM (Object-Relational Mapping) ánh xạ bảng trong database thành object/class trong code, cho phép truy vấn dữ liệu bằng cú pháp ngôn ngữ lập trình thay vì SQL thuần (vd: Prisma, TypeORM, Hibernate). Tiện và an toàn nhưng có thể kém tối ưu với truy vấn phức tạp. 💡 Dễ nhớ: như phiên dịch viên giữa code (object) và database (bảng).',
    related: ['Database', 'SQL'],
  },
  {
    term: 'REST',
    cat: 'Web',
    short: 'Phong cách thiết kế API dựa trên tài nguyên và HTTP method.',
    detail:
      'REST (Representational State Transfer) là kiểu kiến trúc API dùng các HTTP method (GET, POST, PUT, DELETE) trên các tài nguyên được định danh bằng URL. Stateless, dễ hiểu và phổ biến nhất hiện nay. 💡 Dễ nhớ: danh từ là URL (/users), động từ là method (GET/POST) — "làm gì với cái gì".',
    related: ['API', 'GraphQL', 'Endpoint', 'CRUD'],
  },
  {
    term: 'SDK',
    cat: 'General',
    short: 'Bộ công cụ giúp tích hợp một dịch vụ vào app của bạn nhanh hơn.',
    detail:
      'SDK (Software Development Kit) là gói gồm thư viện, công cụ, tài liệu và mã mẫu giúp developer tích hợp một nền tảng/dịch vụ vào ứng dụng (vd: Stripe SDK, AWS SDK). Bọc sẵn các lời gọi API thành hàm dễ dùng. 💡 Dễ nhớ: API là ổ điện, SDK là cả bộ dây + phích cắm sẵn để bạn dùng ngay.',
    related: ['API', 'Framework'],
  },
  {
    term: 'Serverless',
    cat: 'Cloud',
    short: 'Chạy code mà không cần quản lý server — trả tiền theo lần dùng.',
    detail:
      'Serverless là mô hình cloud nơi nhà cung cấp tự quản lý hạ tầng; developer chỉ viết hàm (function) và nó chạy khi có sự kiện, tự scale, tính tiền theo số lần gọi (vd: AWS Lambda, Vercel Functions). Không phải là "không có server" mà là bạn không phải lo về server. 💡 Dễ nhớ: như đi taxi thay vì mua xe — chỉ trả tiền khi thực sự đi.',
    related: ['Container', 'Microservices', 'API'],
  },
  {
    term: 'SQL',
    cat: 'Database',
    short: 'Ngôn ngữ truy vấn dữ liệu trong database quan hệ.',
    detail:
      'SQL (Structured Query Language) là ngôn ngữ chuẩn để truy vấn và thao tác dữ liệu trong database quan hệ — SELECT để đọc, INSERT/UPDATE/DELETE để ghi, JOIN để kết hợp bảng. Dùng trong PostgreSQL, MySQL, SQL Server... 💡 Dễ nhớ: bạn mô tả "muốn gì", SQL lo "lấy thế nào".',
    related: ['Database', 'ORM', 'CRUD'],
  },
  {
    term: 'Token / JWT',
    cat: 'Security',
    short: 'Chuỗi mã chứng minh người dùng đã đăng nhập, gắn theo request.',
    detail:
      'Token là chuỗi cấp cho người dùng sau khi xác thực, gửi kèm mỗi request để chứng minh danh tính. JWT (JSON Web Token) là dạng token tự chứa thông tin và được ký số, server không cần lưu session — tiện cho hệ thống phân tán. 💡 Dễ nhớ: như vé vào cửa có dán tem chống giả — soát vé là biết thật/giả ngay.',
    related: ['Authentication', 'OAuth', 'API'],
  },
  {
    term: 'Webhook',
    cat: 'Web',
    short: 'API "gọi ngược" — hệ thống tự báo cho bạn khi có sự kiện.',
    detail:
      'Webhook là cơ chế đảo ngược của API: thay vì bạn liên tục hỏi (polling), hệ thống bên ngoài sẽ tự gửi HTTP request đến URL của bạn khi có sự kiện (vd: thanh toán thành công). Hiệu quả và real-time hơn polling. 💡 Dễ nhớ: thay vì cứ mở cửa xem bưu tá tới chưa, bạn để chuông — có hàng nó tự reo.',
    related: ['API', 'Endpoint', 'REST'],
  },
  {
    term: 'WebSocket',
    cat: 'Web',
    short: 'Kết nối hai chiều, real-time giữa client và server.',
    detail:
      'WebSocket là giao thức cho phép kênh kết nối hai chiều, luôn mở giữa client và server — dữ liệu đẩy tức thì theo cả hai hướng mà không cần request lại. Dùng cho chat, thông báo real-time, game online, bảng giá live. 💡 Dễ nhớ: HTTP như gửi thư qua lại, WebSocket như cuộc gọi điện luôn mở máy.',
    related: ['API', 'Latency', 'Endpoint'],
  },

  // ─────────────────────────── AI / Machine Learning ───────────────────────────
  {
    term: 'AI',
    cat: 'AI',
    short: 'Trí tuệ nhân tạo — máy mô phỏng khả năng tư duy, học hỏi của con người.',
    detail:
      'AI (Artificial Intelligence) là lĩnh vực giúp máy tính thực hiện những việc vốn cần trí tuệ con người: hiểu ngôn ngữ, nhận diện hình ảnh, ra quyết định, sáng tạo nội dung. Machine Learning và Deep Learning là các nhánh con của AI. 💡 Dễ nhớ: AI là cái ô lớn, Machine Learning nằm trong nó, Deep Learning nằm trong Machine Learning.',
    related: ['Machine Learning', 'Deep Learning', 'LLM', 'Neural Network'],
  },
  {
    term: 'Machine Learning',
    cat: 'AI',
    short: 'Máy tự học quy luật từ dữ liệu thay vì được lập trình từng bước.',
    detail:
      'Machine Learning (học máy) là nhánh của AI, nơi mô hình tự rút ra quy luật từ dữ liệu mẫu rồi dự đoán trên dữ liệu mới — thay vì lập trình viên viết rõ từng if/else. Gồm 3 kiểu chính: học có giám sát, không giám sát và tăng cường. 💡 Dễ nhớ: bạn không dạy luật, bạn đưa ví dụ và để máy tự rút ra luật.',
    related: ['AI', 'Deep Learning', 'Training', 'Dataset', 'Supervised Learning'],
  },
  {
    term: 'Deep Learning',
    cat: 'AI',
    short: 'Học máy dùng mạng nơ-ron nhiều tầng để học đặc trưng phức tạp.',
    detail:
      'Deep Learning là nhánh của Machine Learning dùng mạng nơ-ron nhân tạo với nhiều tầng (deep = sâu) để tự học các đặc trưng từ dữ liệu thô như ảnh, âm thanh, văn bản. Là nền tảng của hầu hết đột phá AI hiện đại (ảnh, giọng nói, LLM). 💡 Dễ nhớ: "deep" = nhiều tầng — mỗi tầng học một mức trừu tượng cao hơn (cạnh → hình → khuôn mặt).',
    related: ['Machine Learning', 'Neural Network', 'Transformer', 'GPU'],
  },
  {
    term: 'Neural Network',
    cat: 'AI',
    short: 'Mạng các "nơ-ron" mô phỏng cách não xử lý thông tin.',
    detail:
      'Neural Network (mạng nơ-ron) gồm nhiều đơn vị tính toán (nơ-ron) nối với nhau qua các trọng số, xếp thành tầng. Khi huấn luyện, mạng điều chỉnh trọng số để giảm sai số dự đoán. Là khối xây dựng cơ bản của Deep Learning. 💡 Dễ nhớ: như mạng lưới công tắc — học bằng cách chỉnh độ "mạnh/yếu" của từng kết nối.',
    related: ['Deep Learning', 'Training', 'Inference', 'Transformer'],
  },
  {
    term: 'LLM',
    cat: 'AI',
    short: 'Mô hình ngôn ngữ lớn — học từ khối văn bản khổng lồ để hiểu & sinh chữ.',
    detail:
      'LLM (Large Language Model) là mô hình AI huấn luyện trên lượng văn bản khổng lồ để dự đoán từ tiếp theo, từ đó hiểu và sinh ngôn ngữ tự nhiên (vd: Claude, GPT, Gemini). Nền tảng là kiến trúc Transformer. 💡 Dễ nhớ: về bản chất nó là máy "đoán từ kế tiếp" cực giỏi — đoán đủ tốt thì trông như đang suy nghĩ.',
    related: ['Transformer', 'Token', 'Prompt', 'Foundation Model', 'Hallucination'],
  },
  {
    term: 'Transformer',
    cat: 'AI',
    short: 'Kiến trúc mạng nơ-ron là "động cơ" của các LLM hiện đại.',
    detail:
      'Transformer là kiến trúc deep learning (Google, 2017) dùng cơ chế attention để cân nhắc mức quan trọng của từng từ trong câu so với các từ khác, xử lý song song toàn bộ chuỗi. Đây là nền tảng của gần như mọi LLM ngày nay. 💡 Dễ nhớ: "Attention is all you need" — sức mạnh nằm ở việc mỗi từ biết "chú ý" tới từ nào.',
    related: ['LLM', 'Attention', 'Deep Learning', 'Embedding'],
  },
  {
    term: 'Attention',
    cat: 'AI',
    short: 'Cơ chế giúp mô hình biết "nên tập trung vào từ nào" khi xử lý.',
    detail:
      'Attention cho phép mô hình gán trọng số cho mối liên hệ giữa các phần tử trong chuỗi — khi xử lý một từ, nó biết nên "chú ý" tới những từ nào khác để hiểu ngữ cảnh. Self-attention là trái tim của Transformer. 💡 Dễ nhớ: như đọc câu "nó" và tự biết "nó" đang nói về danh từ nào phía trước.',
    related: ['Transformer', 'LLM', 'Context Window'],
  },
  {
    term: 'Prompt',
    cat: 'AI',
    short: 'Câu lệnh/đầu vào bạn đưa cho mô hình AI để nhận kết quả.',
    detail:
      'Prompt là phần văn bản (hoặc hình ảnh) bạn nhập vào mô hình để định hướng đầu ra. Cách diễn đạt prompt ảnh hưởng lớn đến chất lượng kết quả — nghệ thuật tối ưu việc này gọi là prompt engineering. 💡 Dễ nhớ: prompt như câu hỏi bạn đặt — hỏi rõ ràng, cụ thể thì câu trả lời mới đúng ý.',
    related: ['LLM', 'Token', 'Context Window', 'Temperature'],
  },
  {
    term: 'Token',
    cat: 'AI',
    short: 'Đơn vị nhỏ của văn bản (chữ/mảnh từ) mà mô hình AI xử lý.',
    detail:
      'Token là mẩu văn bản mà LLM chia nhỏ để xử lý — có thể là một từ, một phần của từ, hay dấu câu. Mô hình đọc và sinh từng token một; chi phí API và giới hạn độ dài đều tính theo số token. 💡 Dễ nhớ: ~1 token ≈ 4 ký tự tiếng Anh (~¾ một từ). Lưu ý: khác với Token/JWT trong bảo mật.',
    related: ['LLM', 'Prompt', 'Context Window', 'Embedding'],
  },
  {
    term: 'Embedding',
    cat: 'AI',
    short: 'Biến chữ/ảnh thành vector số để máy đo được độ "giống nhau".',
    detail:
      'Embedding là cách biểu diễn dữ liệu (từ, câu, ảnh) thành vector số nhiều chiều, sao cho những thứ có ý nghĩa gần nhau thì vector cũng gần nhau. Là nền tảng cho tìm kiếm ngữ nghĩa, gợi ý và RAG. 💡 Dễ nhớ: "vua − đàn ông + đàn bà ≈ nữ hoàng" — ý nghĩa trở thành phép toán trên vector.',
    related: ['Vector Database', 'RAG', 'Transformer', 'Token'],
  },
  {
    term: 'Training',
    cat: 'AI',
    short: 'Quá trình mô hình học từ dữ liệu bằng cách chỉnh dần tham số.',
    detail:
      'Training (huấn luyện) là giai đoạn mô hình quan sát dữ liệu, dự đoán, đo sai số rồi điều chỉnh các trọng số để lần sau dự đoán tốt hơn — lặp lại hàng triệu lần. Tốn nhiều tài nguyên tính toán (thường là GPU). 💡 Dễ nhớ: như luyện đề thi — làm sai, dò đáp án, sửa, làm lại cho tới khi giỏi.',
    related: ['Inference', 'Fine-tuning', 'Dataset', 'GPU', 'Overfitting'],
  },
  {
    term: 'Inference',
    cat: 'AI',
    short: 'Dùng mô hình đã huấn luyện để tạo dự đoán/đầu ra cho dữ liệu mới.',
    detail:
      'Inference (suy luận) là giai đoạn "chạy thật": đưa đầu vào mới vào mô hình đã train xong để nhận kết quả. Mỗi lần bạn chat với một LLM chính là một lần inference. Nhanh và rẻ hơn training nhiều. 💡 Dễ nhớ: Training là ôn thi, Inference là đi thi thật.',
    related: ['Training', 'LLM', 'Latency', 'Quantization'],
  },
  {
    term: 'Fine-tuning',
    cat: 'AI',
    short: 'Huấn luyện thêm một mô hình có sẵn cho một nhiệm vụ cụ thể.',
    detail:
      'Fine-tuning là việc lấy một mô hình đã được pre-train rồi huấn luyện tiếp trên tập dữ liệu chuyên biệt để nó giỏi hơn ở một lĩnh vực/giọng văn cụ thể — rẻ và nhanh hơn train từ đầu. 💡 Dễ nhớ: như một người giỏi sẵn rồi đi học thêm khóa chuyên ngành.',
    related: ['Training', 'Foundation Model', 'RLHF', 'Dataset'],
  },
  {
    term: 'RAG',
    cat: 'AI',
    short: 'Cho LLM tra cứu tài liệu ngoài trước khi trả lời để bớt bịa.',
    detail:
      'RAG (Retrieval-Augmented Generation) kết hợp LLM với một kho dữ liệu: khi nhận câu hỏi, hệ thống tìm các đoạn tài liệu liên quan (thường qua embedding + vector database) rồi đưa vào prompt để mô hình trả lời dựa trên đó. Giảm bịa đặt và cập nhật kiến thức mới. 💡 Dễ nhớ: như cho thí sinh mở sách khi làm bài — trả lời dựa trên tài liệu thật.',
    related: ['Embedding', 'Vector Database', 'LLM', 'Hallucination', 'Context Window'],
  },
  {
    term: 'Hallucination',
    cat: 'AI',
    short: 'Khi AI tự tin đưa ra thông tin nghe hợp lý nhưng sai/bịa.',
    detail:
      'Hallucination (ảo giác) là hiện tượng mô hình sinh ra nội dung sai sự thật nhưng trình bày rất thuyết phục — do nó dự đoán từ ngữ "nghe đúng" chứ không tra cứu sự thật. Giảm thiểu bằng RAG, trích dẫn nguồn và kiểm chứng. 💡 Dễ nhớ: AI không "nói dối" — nó đoán từ kế tiếp, và đôi khi đoán trật một cách rất tự tin.',
    related: ['LLM', 'RAG', 'Temperature', 'Inference'],
  },
  {
    term: 'Dataset',
    cat: 'AI',
    short: 'Tập dữ liệu dùng để huấn luyện và đánh giá mô hình.',
    detail:
      'Dataset là tập hợp dữ liệu mẫu (ảnh, văn bản, số liệu...) dùng để train, validate và test mô hình. Chất lượng và độ đa dạng của dataset quyết định phần lớn chất lượng mô hình — "rác vào, rác ra". 💡 Dễ nhớ: dataset là "giáo trình" của mô hình — giáo trình tồi thì học trò dốt.',
    related: ['Training', 'Machine Learning', 'Overfitting', 'Supervised Learning'],
  },
  {
    term: 'Overfitting',
    cat: 'AI',
    short: 'Mô hình "học vẹt" dữ liệu cũ nên kém với dữ liệu mới.',
    detail:
      'Overfitting xảy ra khi mô hình khớp quá sát dữ liệu huấn luyện (kể cả nhiễu) nên mất khả năng tổng quát hóa — điểm cao lúc train nhưng tệ khi gặp dữ liệu thật. Chống lại bằng thêm dữ liệu, regularization, dropout. 💡 Dễ nhớ: như học sinh học thuộc lòng đáp án đề cũ, gặp đề mới là tịt.',
    related: ['Training', 'Dataset', 'Machine Learning'],
  },
  {
    term: 'Supervised Learning',
    cat: 'AI',
    short: 'Học từ dữ liệu đã gắn nhãn sẵn (có "đáp án").',
    detail:
      'Supervised Learning (học có giám sát) huấn luyện mô hình trên dữ liệu đã có nhãn đúng (vd: ảnh + nhãn "mèo/chó") để học cách dự đoán nhãn cho dữ liệu mới. Ngược lại, học không giám sát tự tìm cấu trúc trong dữ liệu chưa gắn nhãn. 💡 Dễ nhớ: có giám sát = có đáp án mẫu để đối chiếu; không giám sát = tự nhóm, không có đáp án.',
    related: ['Machine Learning', 'Dataset', 'Training'],
  },
  {
    term: 'GPU',
    cat: 'AI',
    short: 'Chip tính toán song song mạnh, "cỗ máy" của huấn luyện AI.',
    detail:
      'GPU (Graphics Processing Unit) có hàng nghìn lõi xử lý song song, rất hợp với các phép nhân ma trận khổng lồ trong deep learning — nhanh hơn CPU nhiều lần cho tác vụ AI. Là tài nguyên đắt đỏ và khan hiếm khi train mô hình lớn. 💡 Dễ nhớ: CPU như vài giáo sư giỏi làm tuần tự; GPU như nghìn học sinh làm song song.',
    related: ['Training', 'Deep Learning', 'Inference', 'Quantization'],
  },
  {
    term: 'RLHF',
    cat: 'AI',
    short: 'Tinh chỉnh AI theo phản hồi của con người để trả lời hữu ích, an toàn.',
    detail:
      'RLHF (Reinforcement Learning from Human Feedback) là kỹ thuật dùng đánh giá của con người về các câu trả lời để huấn luyện mô hình theo hướng hữu ích, trung thực và an toàn hơn. Là bước quan trọng biến một LLM thô thành trợ lý hội thoại tốt. 💡 Dễ nhớ: con người chấm điểm "câu này hay hơn câu kia", mô hình học theo gu đó.',
    related: ['Fine-tuning', 'LLM', 'Training'],
  },
  {
    term: 'Temperature',
    cat: 'AI',
    short: 'Tham số chỉnh độ "ngẫu nhiên/sáng tạo" trong câu trả lời của AI.',
    detail:
      'Temperature điều chỉnh độ ngẫu nhiên khi mô hình chọn token tiếp theo: gần 0 → câu trả lời ổn định, an toàn, lặp lại được; cao hơn (0.7–1+) → đa dạng, sáng tạo nhưng dễ "bay". 💡 Dễ nhớ: temperature thấp = nghiêm túc & nhất quán; cao = phóng khoáng & bất ngờ.',
    related: ['LLM', 'Prompt', 'Inference', 'Hallucination'],
  },
  {
    term: 'Context Window',
    cat: 'AI',
    short: 'Lượng văn bản tối đa mô hình "nhớ" được trong một lần xử lý.',
    detail:
      'Context Window là giới hạn số token mà mô hình có thể xem cùng lúc (prompt + lịch sử hội thoại + câu trả lời). Vượt quá thì phần cũ nhất bị "quên". Cửa sổ càng lớn càng xử lý được tài liệu dài. 💡 Dễ nhớ: như trí nhớ ngắn hạn — chỉ giữ được một lượng nhất định, đầy thì rơi bớt phần đầu.',
    related: ['Token', 'LLM', 'Prompt', 'RAG'],
  },
  {
    term: 'Foundation Model',
    cat: 'AI',
    short: 'Mô hình lớn train tổng quát, làm nền cho nhiều ứng dụng khác.',
    detail:
      'Foundation Model là mô hình quy mô lớn được pre-train trên dữ liệu rộng, đa nhiệm, rồi được dùng làm nền tảng (qua prompt hoặc fine-tuning) cho vô số tác vụ downstream — vd Claude, GPT, Llama. 💡 Dễ nhớ: như một người học rộng nền tảng, sau đó dễ dàng rẽ sang bất kỳ nghề cụ thể nào.',
    related: ['LLM', 'Fine-tuning', 'Multimodal', 'Training'],
  },
  {
    term: 'Multimodal',
    cat: 'AI',
    short: 'Mô hình hiểu & kết hợp nhiều loại dữ liệu: chữ, ảnh, âm thanh...',
    detail:
      'Multimodal (đa phương thức) là khả năng của mô hình xử lý đồng thời nhiều dạng đầu vào/đầu ra — ví dụ nhìn ảnh và mô tả bằng lời, hay nghe giọng nói rồi trả lời bằng văn bản. 💡 Dễ nhớ: "multi" = nhiều, "modal" = giác quan — AI dùng nhiều "giác quan" cùng lúc như con người.',
    related: ['Foundation Model', 'LLM', 'Embedding', 'Computer Vision'],
  },
  {
    term: 'Vector Database',
    cat: 'AI',
    short: 'Database lưu embedding, tìm theo độ tương đồng ngữ nghĩa.',
    detail:
      'Vector Database lưu trữ các embedding và cho phép tìm nhanh những vector "gần nhất" với một vector truy vấn — tức tìm theo ý nghĩa thay vì khớp từ khóa. Là xương sống của RAG và tìm kiếm ngữ nghĩa (vd: Pinecone, Weaviate, pgvector). 💡 Dễ nhớ: SQL tìm "khớp đúng chữ", vector DB tìm "gần nghĩa nhất".',
    related: ['Embedding', 'RAG', 'Database', 'LLM'],
  },
  {
    term: 'AI Agent',
    cat: 'AI',
    short: 'AI tự lập kế hoạch và dùng công cụ để hoàn thành mục tiêu nhiều bước.',
    detail:
      'AI Agent là hệ thống dùng LLM làm "bộ não" để tự chia nhỏ mục tiêu, gọi công cụ (tìm kiếm, chạy code, gọi API), quan sát kết quả rồi quyết định bước tiếp theo — lặp tới khi xong việc, thay vì chỉ trả lời một lần. 💡 Dễ nhớ: chatbot trả lời; agent thì hành động — biết tự làm từng bước để đạt đích.',
    related: ['LLM', 'RAG', 'Prompt', 'API'],
  },
  {
    term: 'Diffusion Model',
    cat: 'AI',
    short: 'Mô hình sinh ảnh bằng cách khử nhiễu dần từ nhiễu ngẫu nhiên.',
    detail:
      'Diffusion Model tạo ảnh bằng cách bắt đầu từ nhiễu ngẫu nhiên rồi từng bước "khử nhiễu" để hiện ra hình ảnh khớp với mô tả — nền tảng của các công cụ sinh ảnh như Stable Diffusion, Midjourney, DALL·E. 💡 Dễ nhớ: như tạc tượng từ khối đá nhiễu — gọt dần đến khi lộ ra hình.',
    related: ['Deep Learning', 'Neural Network', 'Multimodal', 'GPU'],
  },
  {
    term: 'Quantization',
    cat: 'AI',
    short: 'Nén mô hình bằng cách hạ độ chính xác số để chạy nhẹ, nhanh hơn.',
    detail:
      'Quantization giảm độ chính xác của trọng số mô hình (vd từ 16-bit xuống 4-bit) để mô hình nhỏ hơn, chạy nhanh và tốn ít bộ nhớ hơn — đánh đổi một chút độ chính xác. Giúp chạy LLM trên thiết bị yếu/cục bộ. 💡 Dễ nhớ: như nén ảnh JPEG — file nhẹ hơn nhiều, chất lượng giảm một chút khó nhận ra.',
    related: ['Inference', 'GPU', 'LLM', 'Deep Learning'],
  },
  {
    term: 'NLP',
    cat: 'AI',
    short: 'Xử lý ngôn ngữ tự nhiên — dạy máy hiểu và tạo ngôn ngữ con người.',
    detail:
      'NLP (Natural Language Processing) là lĩnh vực AI giúp máy hiểu, phân tích và sinh ngôn ngữ con người — gồm dịch máy, phân tích cảm xúc, tóm tắt, chatbot. LLM là bước nhảy vọt lớn nhất gần đây của NLP. 💡 Dễ nhớ: NLP là cây cầu giữa tiếng người và ngôn ngữ máy.',
    related: ['LLM', 'Transformer', 'Embedding', 'Computer Vision'],
  },
  {
    term: 'Computer Vision',
    cat: 'AI',
    short: 'Dạy máy "nhìn" và hiểu nội dung trong hình ảnh, video.',
    detail:
      'Computer Vision (thị giác máy tính) là lĩnh vực AI giúp máy phân tích hình ảnh/video: nhận diện vật thể, khuôn mặt, đọc chữ (OCR), phân vùng ảnh. Ứng dụng từ xe tự lái tới y tế, kiểm soát chất lượng. 💡 Dễ nhớ: NLP lo phần "đọc/nghe chữ", Computer Vision lo phần "nhìn".',
    related: ['Deep Learning', 'Neural Network', 'Multimodal', 'NLP'],
  },

  // ─────────────────── Messaging / Kafka (gỡ lỗi về topic) ───────────────────
  {
    term: 'Kafka',
    cat: 'Messaging',
    short: 'Nền tảng streaming phân tán — đường ống truyền sự kiện thông lượng cao.',
    detail:
      'Apache Kafka là nền tảng event streaming phân tán, lưu các message dưới dạng log bền vững theo topic/partition. Producer ghi vào, consumer đọc ra theo tốc độ riêng; dữ liệu được giữ lại theo thời gian (retention) nên có thể đọc lại. Khác message queue truyền thống ở chỗ message không bị xoá ngay sau khi đọc. 💡 Dễ nhớ: Kafka không phải hàng đợi "đọc xong là mất" — nó là cuốn nhật ký ghi lại mọi sự kiện để ai cần thì giở lại.',
    related: ['Topic', 'Partition', 'Consumer Group', 'Offset', 'Broker', 'RabbitMQ'],
  },
  {
    term: 'Topic',
    cat: 'Messaging',
    short: 'Kênh/danh mục logic để phân loại luồng message trong Kafka.',
    detail:
      'Topic là tên gọi của một luồng dữ liệu trong Kafka — producer gửi message vào topic, consumer đăng ký đọc từ topic đó. Mỗi topic được chia thành nhiều partition để scale. Khi gặp issue, kiểm tra số partition, replication factor và retention của topic là việc đầu tiên (`kafka-topics --describe`). 💡 Dễ nhớ: topic như một kênh truyền hình — đài (producer) phát vào kênh, người xem (consumer) bắt đúng kênh để xem.',
    related: ['Kafka', 'Partition', 'Replication Factor', 'Retention', 'Consumer Group'],
  },
  {
    term: 'Partition',
    cat: 'Messaging',
    short: 'Lát cắt song song của một topic — đơn vị scale và đảm bảo thứ tự.',
    detail:
      'Partition là phần chia nhỏ của topic; mỗi partition là một log có thứ tự, message mới được append vào cuối. Kafka chỉ đảm bảo thứ tự TRONG một partition, không đảm bảo giữa các partition. Số partition quyết định mức song song tối đa của consumer group. Issue hay gặp: thiếu partition gây nghẽn, hoặc chọn sai key khiến message dồn lệch vào một partition (hot partition). 💡 Dễ nhớ: muốn nhiều người đọc song song thì phải nhiều partition — 1 partition chỉ 1 consumer trong group đọc được.',
    related: ['Topic', 'Partition Key', 'Consumer Group', 'Offset', 'Hot Partition'],
  },
  {
    term: 'Partition Key',
    cat: 'Messaging',
    short: 'Khóa quyết định message rơi vào partition nào.',
    detail:
      'Khi producer gửi message kèm key, Kafka băm (hash) key để chọn partition — cùng key luôn vào cùng partition, nhờ đó giữ đúng thứ tự cho các sự kiện liên quan (vd mọi event của một userId). Không có key thì message được rải đều (round-robin/sticky). Chọn key có phân bố kém là nguyên nhân chính của hot partition. 💡 Dễ nhớ: cùng key = cùng partition = đúng thứ tự; chọn key lệch = một partition gánh hết.',
    related: ['Partition', 'Hot Partition', 'Producer', 'Topic'],
  },
  {
    term: 'Offset',
    cat: 'Messaging',
    short: 'Số thứ tự của message trong partition — đánh dấu "đã đọc tới đâu".',
    detail:
      'Offset là chỉ số tăng dần định danh vị trí mỗi message trong một partition. Consumer commit offset để ghi nhớ đã xử lý tới đâu; khi restart nó đọc tiếp từ offset đã commit. Commit sai thời điểm gây mất message (commit trước khi xử lý) hoặc xử lý trùng (commit sau, bị crash giữa chừng). 💡 Dễ nhớ: offset như cái kẹp sách (bookmark) — đánh dấu trang đang đọc để lần sau mở đúng chỗ.',
    related: ['Partition', 'Consumer Group', 'Consumer Lag', 'Idempotency'],
  },
  {
    term: 'Consumer Group',
    cat: 'Messaging',
    short: 'Nhóm consumer chia nhau đọc các partition của một topic.',
    detail:
      'Consumer Group là tập các consumer cùng group.id chia nhau các partition để xử lý song song — mỗi partition chỉ được gán cho ĐÚNG MỘT consumer trong group tại một thời điểm. Nếu số consumer > số partition thì sẽ có consumer ngồi chơi. Mỗi group giữ offset riêng nên nhiều group đọc cùng topic độc lập với nhau. 💡 Dễ nhớ: nhiều consumer cùng group = chia việc; khác group = ai cũng đọc đủ bản sao của mình.',
    related: ['Partition', 'Offset', 'Rebalancing', 'Consumer Lag', 'Topic'],
  },
  {
    term: 'Consumer Lag',
    cat: 'Messaging',
    short: 'Khoảng cách giữa message mới nhất và offset consumer đã xử lý.',
    detail:
      'Consumer Lag = offset cuối của partition − offset consumer đã commit, tức số message còn tồn chưa xử lý. Lag tăng dần liên tục là dấu hiệu consumer xử lý chậm hơn tốc độ producer ghi vào — chỉ số quan trọng nhất cần theo dõi khi gặp issue về topic. Khắc phục: thêm partition + consumer, tối ưu xử lý, hoặc tăng throughput. 💡 Dễ nhớ: lag như chồng việc tồn đọng trên bàn — càng cao nghĩa là bạn càng đuối so với việc đổ về.',
    related: ['Offset', 'Consumer Group', 'Backpressure', 'Throughput', 'Partition'],
  },
  {
    term: 'Rebalancing',
    cat: 'Messaging',
    short: 'Quá trình chia lại partition cho consumer khi group thay đổi.',
    detail:
      'Rebalancing xảy ra khi có consumer tham gia/rời nhóm, thêm partition, hoặc một consumer bị coi là "chết" (quá session.timeout). Kafka phân bổ lại partition cho các consumer còn lại — trong lúc này việc tiêu thụ bị tạm dừng ("stop-the-world"). Rebalance liên tục (do xử lý lâu hơn max.poll.interval) là issue kinh điển làm lag tăng vọt. 💡 Dễ nhớ: như chia lại bàn cho nhân viên khi có người vào/ra ca — đang chia thì quán ngừng phục vụ một lúc.',
    related: ['Consumer Group', 'Partition', 'Consumer Lag', 'Offset'],
  },
  {
    term: 'Broker',
    cat: 'Messaging',
    short: 'Một node server Kafka lưu trữ dữ liệu partition.',
    detail:
      'Broker là một máy chủ trong cụm Kafka, chịu trách nhiệm lưu các partition và phục vụ producer/consumer. Nhiều broker hợp thành cluster; mỗi partition có một broker làm leader (nhận đọc/ghi) và các broker khác làm follower (sao chép). Broker chết khiến leader của các partition trên đó được bầu lại — nếu mất quá nhiều bản sao có thể gây gián đoạn. 💡 Dễ nhớ: broker là từng chi nhánh kho; cluster là cả chuỗi kho cùng chia nhau giữ hàng.',
    related: ['Kafka', 'Partition', 'Replication Factor', 'ISR', 'Leader / Follower'],
  },
  {
    term: 'Replication Factor',
    cat: 'Messaging',
    short: 'Số bản sao của mỗi partition trên các broker khác nhau.',
    detail:
      'Replication Factor (RF) là số bản sao của một partition giữ trên các broker khác nhau để chịu lỗi. RF=3 nghĩa là mỗi partition có 1 leader + 2 follower; mất 1–2 broker vẫn không mất dữ liệu. RF quá thấp (=1) là nguyên nhân mất dữ liệu khi một broker hỏng — điểm cần kiểm tra ngay khi điều tra sự cố topic. 💡 Dễ nhớ: RF như số bản photo của một tài liệu quan trọng — càng nhiều bản, cháy một tủ vẫn còn.',
    related: ['Partition', 'Broker', 'ISR', 'Leader / Follower'],
  },
  {
    term: 'ISR',
    cat: 'Messaging',
    short: 'In-Sync Replicas — các bản sao đang theo kịp leader.',
    detail:
      'ISR (In-Sync Replicas) là tập các bản sao của một partition đang đồng bộ kịp với leader. Chỉ replica trong ISR mới đủ điều kiện được bầu làm leader mới. ISR co lại (under-replicated) là cảnh báo follower đang tụt hậu — kết hợp với acks=all, nếu ISR < min.insync.replicas thì producer sẽ bị từ chối ghi. Đây là một trong các metric quan trọng khi topic gặp sự cố. 💡 Dễ nhớ: ISR là nhóm "học trò chép bài kịp thầy" — chỉ ai theo kịp mới được cử lên thay thầy.',
    related: ['Replication Factor', 'Broker', 'Leader / Follower', 'Acks'],
  },
  {
    term: 'Leader / Follower',
    cat: 'Messaging',
    short: 'Mỗi partition có 1 leader nhận đọc/ghi, follower sao chép theo.',
    detail:
      'Với mỗi partition, một broker giữ vai trò leader (xử lý mọi request đọc/ghi), các broker khác là follower chỉ sao chép dữ liệu từ leader. Khi leader chết, một follower trong ISR được bầu lên làm leader mới (leader election). Sự cố thường gặp: leader election dồn dập khi broker không ổn định gây gián đoạn ngắn. 💡 Dễ nhớ: leader là người phát ngôn duy nhất; follower đứng sau chép lại, sẵn sàng thay khi cần.',
    related: ['Broker', 'Partition', 'ISR', 'Replication Factor'],
  },
  {
    term: 'Retention',
    cat: 'Messaging',
    short: 'Thời gian/dung lượng Kafka giữ lại message trước khi xoá.',
    detail:
      'Retention quy định message trong topic được giữ bao lâu (retention.ms) hoặc tới dung lượng nào (retention.bytes) trước khi bị xoá — mặc định thường 7 ngày. Đây là nguyên nhân hay bị bỏ sót: consumer chết vài ngày, khi sống lại thì message đã hết hạn → "mất" dữ liệu dù chưa đọc. Cần cân nhắc retention theo tốc độ tiêu thụ của consumer chậm nhất. 💡 Dễ nhớ: retention như hạn dùng của thực phẩm trong tủ lạnh — quá hạn là bị dọn đi, dù bạn chưa kịp ăn.',
    related: ['Topic', 'Log Compaction', 'Offset', 'Consumer Lag'],
  },
  {
    term: 'Log Compaction',
    cat: 'Messaging',
    short: 'Chính sách chỉ giữ bản ghi mới nhất cho mỗi key.',
    detail:
      'Log Compaction (cleanup.policy=compact) là chế độ Kafka giữ lại message MỚI NHẤT cho mỗi key thay vì xoá theo thời gian — hữu ích cho topic dạng "trạng thái hiện tại" (vd snapshot cấu hình, changelog). Khác với retention xoá theo tuổi. Nhầm lẫn giữa delete và compact là issue cấu hình hay gặp. 💡 Dễ nhớ: compaction như danh bạ — chỉ giữ số điện thoại mới nhất của mỗi người, số cũ bị ghi đè.',
    related: ['Retention', 'Topic', 'Partition Key', 'Offset'],
  },
  {
    term: 'Producer',
    cat: 'Messaging',
    short: 'Bên ghi message vào topic của Kafka.',
    detail:
      'Producer là ứng dụng gửi message vào topic. Các tham số quan trọng khi gỡ lỗi: acks (0/1/all — mức đảm bảo ghi), retries, batch.size/linger.ms (gộp message tăng throughput), và enable.idempotence để tránh ghi trùng. acks=all + min.insync.replicas cho độ bền cao nhất nhưng chậm hơn. 💡 Dễ nhớ: producer như người gửi thư — chọn gửi thường (acks=0, nhanh, dễ mất) hay gửi bảo đảm có ký nhận (acks=all).',
    related: ['Topic', 'Acks', 'Partition Key', 'Idempotency', 'Throughput'],
  },
  {
    term: 'Acks',
    cat: 'Messaging',
    short: 'Mức xác nhận producer chờ khi ghi message (0 / 1 / all).',
    detail:
      'Acks quy định producer chờ bao nhiêu bản sao xác nhận đã nhận message: acks=0 (không chờ, nhanh nhất, dễ mất), acks=1 (chờ leader, mất nếu leader chết trước khi follower chép), acks=all (chờ tất cả replica trong ISR, an toàn nhất). Kết hợp với min.insync.replicas để đảm bảo độ bền. Cấu hình acks sai là nguyên nhân gốc của mất message. 💡 Dễ nhớ: acks=0 thả thư rồi đi; acks=1 đợi bưu cục nhận; acks=all đợi cả kho xác nhận.',
    related: ['Producer', 'ISR', 'Replication Factor', 'Idempotency'],
  },
  {
    term: 'Dead Letter Queue',
    cat: 'Messaging',
    short: 'Nơi chứa các message xử lý thất bại để xử lý lại sau.',
    detail:
      'Dead Letter Queue (DLQ) là topic/queue riêng để đẩy các message mà consumer xử lý lỗi nhiều lần (poison message), tránh chúng chặn cả partition hay gây retry vô hạn. Sau đó team có thể điều tra, sửa và replay. Không có DLQ thì một message hỏng có thể làm kẹt toàn bộ consumer — issue rất hay gặp trong thực tế. 💡 Dễ nhớ: DLQ như khay "hồ sơ lỗi để xử lý sau" — gạt sang một bên để dây chuyền vẫn chạy.',
    related: ['Consumer Group', 'Offset', 'Idempotency', 'Backpressure'],
  },
  {
    term: 'Backpressure',
    cat: 'Messaging',
    short: 'Cơ chế ghìm tốc độ khi bên nhận xử lý không kịp bên gửi.',
    detail:
      'Backpressure là tình huống (và cơ chế xử lý) khi consumer/đầu nhận không theo kịp tốc độ message đổ về, khiến hàng tồn (lag) tăng. Cách giảm: tăng số partition + consumer, xử lý theo batch, giới hạn max.poll.records, hoặc đẩy bớt sang DLQ. Bỏ qua backpressure dẫn tới lag tăng không kiểm soát và có thể OOM. 💡 Dễ nhớ: như vòi nước chảy mạnh hơn cống thoát — không ghìm lại thì tràn bồn.',
    related: ['Consumer Lag', 'Throughput', 'Dead Letter Queue', 'Partition'],
  },
  {
    term: 'Throughput',
    cat: 'Messaging',
    short: 'Số message/dữ liệu xử lý được trên một đơn vị thời gian.',
    detail:
      'Throughput là lượng message hoặc byte mà hệ thống ghi/đọc được mỗi giây. Trong Kafka, throughput tăng nhờ nhiều partition, gộp batch (linger.ms/batch.size), nén (compression) và đủ consumer. Khác với latency (độ trễ một message). Khi điều tra issue, cần soi cả throughput lẫn lag để biết nghẽn ở producer hay consumer. 💡 Dễ nhớ: throughput là "bao nhiêu xe qua cầu mỗi phút"; latency là "một xe mất bao lâu để qua".',
    related: ['Consumer Lag', 'Backpressure', 'Partition', 'Latency'],
  },
  {
    term: 'Hot Partition',
    cat: 'Messaging',
    short: 'Một partition nhận lượng dữ liệu lệch hẳn so với các partition khác.',
    detail:
      'Hot Partition là tình trạng một partition gánh phần lớn lưu lượng do partition key phân bố kém (vd dùng cùng một key cho hầu hết message). Hậu quả: consumer của partition đó quá tải và lag cao trong khi các consumer khác rảnh — mất tác dụng song song. Khắc phục bằng thiết kế lại key hoặc tăng độ phân tán. 💡 Dễ nhớ: như một quầy thu ngân bị xếp hàng dài trong khi các quầy khác vắng tanh.',
    related: ['Partition', 'Partition Key', 'Consumer Lag', 'Throughput'],
  },
  {
    term: 'RabbitMQ',
    cat: 'Messaging',
    short: 'Message broker truyền thống theo mô hình hàng đợi (queue).',
    detail:
      'RabbitMQ là message broker dựa trên giao thức AMQP, định tuyến message qua exchange tới các queue; message thường bị xoá sau khi consumer ack. Khác Kafka (lưu log đọc lại được), RabbitMQ mạnh ở định tuyến linh hoạt và tác vụ kiểu hàng đợi/RPC. Chọn nhầm công cụ cho bài toán là "issue" ở tầng kiến trúc. 💡 Dễ nhớ: RabbitMQ là bưu cục chia thư theo địa chỉ rồi giao là xong; Kafka là cuốn sổ lưu lại mọi bức thư.',
    related: ['Kafka', 'Dead Letter Queue', 'Topic', 'Backpressure'],
  },
]
