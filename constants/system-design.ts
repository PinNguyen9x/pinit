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
    sections: [],
    flashcards: [],
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
    relatedTerms: ['Load Balancer', 'Sharding', 'Replication'],
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
    relatedTerms: ['Cache', 'Redis', 'Message Queue'],
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
    relatedTerms: ['CDN', 'Elasticsearch'],
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
    relatedTerms: ['Cache', 'Hash'],
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
    relatedTerms: ['CDN', 'Message Queue'],
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
    relatedTerms: ['Cache', 'Sharding'],
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
    relatedTerms: ['Cache', 'Elasticsearch'],
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
    relatedTerms: ['WebSocket', 'Message Queue'],
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
