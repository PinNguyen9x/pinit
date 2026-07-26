---
phase: requirements
title: Requirements & Problem Understanding
feature: system-design
description: Trang học System Design Interview theo lộ trình 13 buổi — index tiến độ, 13 trang chi tiết, flashcard, cheat sheet
---

# Requirements & Problem Understanding — System Design (Lộ trình 13 buổi)

## Problem Statement
**What problem are we solving?**

- Chủ sở hữu site đang ôn **System Design Interview** theo một khóa 13 buổi. Tài liệu hiện nằm rải rác ở note cá nhân, slide khóa học và bookmark — **không có một nơi duy nhất để ôn lại theo đúng thứ tự lộ trình**.
- Khi cần ôn gấp trước buổi phỏng vấn, không có bản tóm tắt "20 phút cuối": các con số latency cần thuộc, bảng chọn database, khung các bước trả lời.
- Không có cách **tự kiểm tra** kiến thức (đọc lại thì thấy quen, nhưng vào phỏng vấn lại không nói ra được) và không theo dõi được **đã ôn tới đâu** trong 13 buổi.
- Trang `/glossary` hiện có (109 thuật ngữ) giải quyết việc **tra cứu một từ**, nhưng không dạy theo **thứ tự lộ trình** và không có case study.
- Ai bị ảnh hưởng: chủ site (người học chính); thứ cấp là độc giả blog cùng đang ôn phỏng vấn backend.

### Làm rõ tên gọi (đã chốt)
Nội dung lộ trình là **System Design** (thiết kế hệ thống phân tán: CAP, load balancer, sharding, CDN, case study TinyURL/YouTube/Uber…), **không phải "Design System"** (design token / component library trong frontend). Feature vì vậy đặt tên `system-design`. Branch `feat/design-system-learning` giữ nguyên để không sửa lịch sử git.

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Thêm tab **"System Design"** vào header (desktop + mobile) trỏ tới `/system-design`.
- Trang lộ trình `/system-design`: liệt kê 13 buổi đúng thứ tự, kèm mô tả ngắn, **thanh % tiến độ**, và **ô search** xuyên toàn bộ nội dung.
- 13 trang chi tiết `/system-design/[slug]`, mỗi trang ~800–1200 từ, gồm: ý cốt lõi, mermaid diagram, bảng so sánh/đánh đổi, và **flashcard câu hỏi phỏng vấn** (4–6 câu, click lật xem gợi ý trả lời).
- Trang **cheat sheet** `/system-design/cheat-sheet` phục vụ kịch bản "ôn 20 phút trước khi vào phỏng vấn".
- **Checklist tiến độ** lưu `localStorage`: tick từng buổi đã ôn xong, phản ánh lên thanh % ở trang index.

### Secondary goals
- Thuật ngữ trong bài **cross-link** sang `/glossary#<term>` để tái dùng 109 định nghĩa sẵn có.
- Nhất quán thị giác với `/glossary`: `MainLayout` + `BackgroundFx` + `Seo`, theme sáng/tối, nội dung tiếng Việt.
- Tách `hooks/use-mermaid.ts` dùng chung, gỡ nợ kỹ thuật cho lần dùng mermaid thứ 3.

### Non-goals (out of scope v1)
- **Không** sửa hành vi `/glossary`, `/blog`, `/works` (chỉ thêm 1 mục vào `routes.ts`).
- **Không** refactor mermaid ở `pages/blog/[slug].tsx` và `pages/works/[workId]/details.tsx` — tránh regression; để việc riêng.
- **Không** sửa/xóa stub chết `components/mermaid/MermaidFlowchart.tsx`.
- **Không** backend / API / database — toàn bộ nội dung static trong repo.
- **Không** đăng nhập, không đồng bộ tiến độ giữa nhiều thiết bị (localStorage là đủ).
- **Không** spaced-repetition / chấm điểm flashcard — v1 chỉ lật thẻ.
- **Không** sao chép slide hay tài liệu độc quyền của khóa học; nội dung là kiến thức system design phổ thông do AI soạn, chủ site review.

## User Stories & Use Cases
**How will users interact with the solution?**

- Là **người đang học theo lộ trình**, tôi muốn thấy 13 buổi theo đúng thứ tự với tiến độ của mình, để biết hôm nay ôn buổi nào.
- Là **người ôn kiến thức nền**, tôi muốn mở một buổi và đọc bản tóm tắt có sơ đồ + bảng đánh đổi, để nhớ lại nhanh mà không phải đọc lại cả khóa.
- Là **người tự kiểm tra**, tôi muốn lật flashcard câu hỏi phỏng vấn và tự trả lời trước khi xem gợi ý, để biết mình thật sự nói ra được hay chỉ thấy quen.
- Là **người sắp vào phỏng vấn trong 20 phút**, tôi muốn một trang cheat sheet gom các con số và khung trả lời, để nạp lại nhanh nhất.
- Là **người gặp thuật ngữ lạ**, tôi muốn click thuật ngữ trong bài và nhảy thẳng sang định nghĩa ở `/glossary`.
- Là **người tra nhanh**, tôi muốn gõ "sharding" vào ô search và thấy ngay buổi nào có nội dung đó.

### Key workflows
1. Click tab "System Design" trên header → `/system-design` → thấy 13 buổi + % tiến độ.
2. Click một buổi → trang chi tiết → đọc → cuộn xuống phần flashcard → lật thẻ tự kiểm tra → tick "đã ôn xong" → quay lại index thấy % tăng.
3. Gõ từ khóa ở ô search index → danh sách buổi lọc lại theo tiêu đề/từ khóa/nội dung tóm tắt.
4. Trước phỏng vấn → mở `/system-design/cheat-sheet` → quét con số + khung 6 bước.
5. Buổi 13 → trang tự luyện mock interview: khung thời gian 45 phút theo bước, danh sách đề bài tự luyện, checklist tiêu chí tự chấm.

### Edge cases
- **localStorage bị chặn / trình duyệt ẩn danh** → tiến độ không lưu được; UI phải không crash, coi như 0% và vẫn dùng được toàn bộ nội dung.
- **SSR hydration**: `localStorage` chỉ có ở client → % tiến độ phải render sau khi mount để tránh hydration mismatch.
- **Slug không tồn tại** (`/system-design/khong-co`) → trang 404, không crash.
- **Search không khớp** → empty state có gợi ý xóa từ khóa.
- **Mermaid lỗi cú pháp** → không làm vỡ cả trang; log lỗi, phần còn lại của bài vẫn đọc được.
- **Cross-link glossary trỏ tới term không tồn tại** → link vẫn dẫn tới `/glossary`, không lỗi 404 (trang glossary tự bỏ qua hash lạ).
- **Term có ký tự đặc biệt** (`Token / JWT`, `C/C++`) → phải encode đúng khi tạo `href="#term"` (bài học rút ra từ feature `glossary-index`).
- **JS tắt** → nội dung 13 buổi vẫn đọc được (static render); chỉ mất flashcard/tiến độ/mermaid.

## Success Criteria
**How will we know when we're done?**

### Acceptance criteria
1. Tab "System Design" hiện trên **cả** header desktop và mobile, click vào ra `/system-design`.
2. `/system-design` render **đúng 13 buổi**, đúng thứ tự 1→13, tiêu đề khớp lộ trình gốc, không thiếu/không trùng.
3. Mỗi buổi 1–12 có trang chi tiết `/system-design/[slug]` truy cập được, nội dung **≥ 800 từ**, có **≥ 1 mermaid diagram** render thành công, có **≥ 4 flashcard**.
4. Buổi 13 là trang tự luyện mock interview: có khung 45 phút chia bước, **≥ 5 đề bài** tự luyện, checklist tiêu chí tự chấm.
5. `/system-design/cheat-sheet` có: bảng latency numbers, bảng chọn loại DB theo tình huống, khung các bước trả lời SDI, và 1 dòng chốt cho mỗi buổi trong 13 buổi.
6. Tick checkbox một buổi → reload trang → trạng thái tick **vẫn còn**; thanh % cập nhật đúng (vd 3/13 → 23%).
7. Search ở index lọc đúng theo tiêu đề + từ khóa của buổi; có đếm số kết quả; empty state khi không khớp.
8. **≥ 15 cross-link** sang `/glossary#<term>` trên toàn feature, click vào mở đúng thuật ngữ.
9. `/glossary`, `/blog`, `/works` hoạt động **y như trước** (không regression) — kiểm tra thủ công.
10. `npm run lint` pass; `npm run build` không lỗi TypeScript.

### Measurable outcomes
- 13/13 buổi bám đúng đầu mục trong lộ trình gốc (đối chiếu bảng ánh xạ ở mục Constraints).
- Trang index dùng được trên màn hình ≥ 360px không vỡ layout.

### Performance
- Toàn bộ static (SSG) → không có network call khi đọc bài.
- `mermaid` phải là **dynamic import**, không nằm trong bundle trang index (đây là thư viện nặng).

## Constraints & Assumptions
**What limitations do we need to work within?**

### Technical constraints
- **Next.js Pages Router** (không phải App Router). Route: `pages/system-design/index.tsx`, `pages/system-design/[slug].tsx`, `pages/system-design/cheat-sheet.tsx`. Lưu ý thứ tự ưu tiên route: file tĩnh `cheat-sheet.tsx` thắng `[slug].tsx` — nên **không** được có buổi nào mang slug `cheat-sheet`.
- **Không được** tạo `pages/system-design.tsx` song song với thư mục `pages/system-design/` (đụng route — đúng lỗi đã gặp ở feature `glossary-index`).
- MUI v5 + Emotion, theme sáng/tối; tái dùng token màu như `/glossary`.
- **Project không có test framework** (không jest/vitest, `package.json` chỉ có `dev/build/start/lint`) → validation dựa vào `npm run lint`, `npm run build` và kịch bản thủ công.
- `components/mermaid/MermaidFlowchart.tsx` là **stub chết** (thân hàm bị comment, chỉ render chữ "MermaidFlowchart") → **không dùng**. Pattern mermaid đang chạy thật nằm ở `pages/blog/[slug].tsx:72` và `pages/works/[workId]/details.tsx:139`: dynamic `import('mermaid')` rồi render vào các node `.mermaid`.
- Ràng buộc repo (`CLAUDE.md`): mỗi commit một thay đổi logic; chạy `npm run lint` trước commit; không `git push`; không thêm co-author footer.

### Business/time constraints
- Khối lượng ~13 trang × ~1000 từ là lớn → **chia nhiều commit / nhiều phiên**. Phase planning sẽ tách task theo từng buổi để giao dần.
- Nội dung do AI soạn cần chủ site review về độ chính xác kỹ thuật trước khi coi là "tài liệu ôn thi tin cậy".

### Assumptions (đã user xác nhận)
1. Tên feature/route/tab dùng `system-design`, không dùng `design-system`.
2. Kiến trúc index + 13 trang chi tiết (không phải 1 trang accordion).
3. Data lưu ở `constants/system-design.ts`, typed, static — không dùng markdown blog, không gọi API.
4. Bật cả 4 tính năng: checklist tiến độ, flashcard, mermaid diagram, search + cross-link glossary.
5. Mỗi buổi ~800–1200 từ.
6. AI soạn toàn bộ nội dung 13 buổi; là kiến thức system design phổ thông, không phải slide khóa học.
7. Tab thêm vào `ROUTE_LIST` trong `components/common/header/routes.ts` (không thêm Glossary vào header — ngoài scope).
8. Buổi 13 chuyển thành trang **tự luyện** mock interview.
9. Mermaid: tách `hooks/use-mermaid.ts` mới, **không** refactor 2 trang cũ.
10. Có trang cheat sheet riêng tại `/system-design/cheat-sheet`.

### Ánh xạ 13 buổi (nguồn: 4 ảnh lộ trình)

| # | Tiêu đề buổi | Nội dung cốt lõi |
|---|---|---|
| 1 | System design interview and principles | Giới thiệu SDI, CAP theorem, Microservices |
| 2 | Load balancers + Database | Load balancer toàn tập, distributed storage, các loại DB & tình huống dùng, replication, sharding |
| 3 | Networking for distributed systems | HTTPS, REST, HTTP polling, WebSocket, gRPC, GraphQL, DNS |
| 4 | Caching and stream processing + Monitoring | Distributed cache (Redis, DynamoDB), message queue + pub/sub, monitoring |
| 5 | Distributed File Storage & Logging | CDN, thiết kế blobstore, distributed search (Solr/Elasticsearch), distributed logging |
| 6 | Framework For Backend System Design Interviews | Tuần tự các bước trong buổi phỏng vấn SDI, cách thể hiện tốt |
| 7 | Case study — Design TinyURL | Thiết kế hệ thống rút gọn URL |
| 8 | Case study — Design YouTube | Storage video/ảnh, search video, like/comment |
| 9 | Case study — Design Social Media App | Newsfeed, follow, post; GraphDB |
| 10 | Case study — Design Typeahead Suggestion | Gợi ý kết quả kiểu Google Search (trie, ranking) |
| 11 | Case study — Design Taxi Booking (Grab/Uber) | Matching tài xế, geo-index, realtime location |
| 12 | Case study — Design Messaging App | Chat/messaging, xử lý hàng triệu request/phút |
| 13 | Tự luyện Mock Interview | Khung 45 phút, đề bài tự luyện, checklist tiêu chí tự chấm |

> Buổi 11 trong ảnh gốc chỉ ghi "Toggle Content" (nội dung chưa mở) → đầu mục được suy ra từ tiêu đề "Design Taxi Booking System (Grab/Uber)". Đây là **giả định**, cần chủ site đối chiếu với bài học thật.

## Questions & Open Items
**What do we still need to clarify?**

### Đã giải quyết
- ~~Tên feature là `design-system` hay `system-design`?~~ → `system-design`.
- ~~Một trang accordion hay index + chi tiết?~~ → index + 13 trang chi tiết.
- ~~Nguồn dữ liệu?~~ → `constants/system-design.ts`.
- ~~Ai viết nội dung?~~ → AI soạn, chủ site review.
- ~~Buổi 13 xử lý sao?~~ → trang tự luyện mock interview.
- ~~Mermaid dùng lại thế nào?~~ → tách hook mới, không đụng trang cũ.
- ~~Có cheat sheet không?~~ → có, route riêng.

### Còn mở (không chặn phase design)
- **[Nội dung]** Buổi 11 (Taxi Booking) chưa có đầu mục chi tiết trong ảnh gốc → nội dung sẽ soạn theo chuẩn phổ thông (geo-hash/quadtree, matching, realtime location). Chủ site đối chiếu lại sau.
- **[Rà soát]** Nội dung AI soạn cần chủ site review độ chính xác kỹ thuật trước khi dùng làm tài liệu ôn thi chính thức.
- **[v2]** Có nên đưa `/glossary` lên header cùng System Design không (hiện glossary bị ẩn, phải gõ URL)? → hoãn, ngoài scope.
- **[v2]** Refactor mermaid ở `blog/[slug].tsx` + `works/details.tsx` dùng chung `use-mermaid.ts`; xóa stub `MermaidFlowchart.tsx`.
- **[v2]** Spaced-repetition cho flashcard; export/import tiến độ; đồng bộ đa thiết bị.
