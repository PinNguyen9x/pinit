---
phase: testing
title: Testing Strategy
feature: system-design
description: Chiến lược kiểm thử feature system-design — lint + build + kịch bản thủ công (project chưa có test framework)
---

# Testing Strategy — Feature `system-design`

## Test Coverage Goals
**What level of testing do we aim for?**

### Thực trạng ràng buộc
Project **chưa có test framework**: `package.json` chỉ có `dev`, `build`, `start`, `lint` — không jest, không vitest, không playwright. Vì vậy mục tiêu "100% unit coverage" theo template là **không đạt được** trong feature này, và việc dựng hạ tầng test là một quyết định kiến trúc riêng, không nên nhét vào feature nội dung học.

### Mục tiêu thực tế cho v1

| Tầng | Công cụ | Mục tiêu |
|---|---|---|
| Type safety | `tsc` qua `npm run build` | 100% — mọi lesson phải đủ field, build fail nếu thiếu |
| Lint | `npm run lint` | 0 error |
| Logic thuần (hook tiến độ, parser `[[Term]]`) | *chưa có runner* | Ghi sẵn ca kiểm thử ở mục Unit Tests, chạy tay; tự động hóa khi có runner |
| Toàn vẹn dữ liệu (13 buổi, slug trùng, slug cấm) | Kiểm tra thủ công theo checklist | 100% các ca liệt kê |
| Luồng người dùng | Thủ công trên trình duyệt | 100% các luồng ở mục End-to-End |

### Bám theo acceptance criteria
Mỗi ca kiểm thử dưới đây gắn với tiêu chí trong `requirements` — ký hiệu **[ACn]** tương ứng "Acceptance criteria" số n.

### Khuyến nghị (ngoài scope v1)
Thêm `vitest` + `@testing-library/react` thành một feature hạ tầng riêng; khi có, ưu tiên tự động hóa trước hết `use-lesson-progress` và parser `[[Term]]` vì đó là hai chỗ logic thuần dễ hồi quy nhất.

## Unit Tests
**What individual components need testing?**

> Chưa có runner → đây là **đặc tả ca kiểm thử**, kiểm tra thủ công ở v1, và là danh sách viết test đầu tiên khi có runner.

### `hooks/use-lesson-progress.ts`
- [ ] Lần render đầu (SSR/trước hydrate) trả `completed` rỗng và `hydrated === false` — không đọc `localStorage` trong thân render **[AC6]**
- [ ] Sau mount, đọc đúng mảng slug đã lưu từ `localStorage`, `hydrated === true`
- [ ] `toggle(slug)` với slug chưa có → thêm vào set và ghi `localStorage`
- [ ] `toggle(slug)` với slug đã có → gỡ khỏi set và ghi `localStorage`
- [ ] `percent` làm tròn đúng: 0/13 → 0, 3/13 → 23, 13/13 → 100
- [ ] `reset()` xóa sạch set và key trong `localStorage`
- [ ] **Edge**: `localStorage` ném lỗi khi đọc (private mode) → hook trả set rỗng, không throw ra ngoài **[Edge: localStorage bị chặn]**
- [ ] **Edge**: `localStorage` ném lỗi khi ghi (quota) → state trong phiên vẫn cập nhật, không crash UI
- [ ] **Edge**: giá trị lưu bị hỏng (không phải JSON, hoặc JSON nhưng không phải mảng string) → bỏ qua, coi như rỗng, không throw
- [ ] **Edge**: slug lưu trong `localStorage` không còn tồn tại trong `LESSONS` (buổi bị xóa) → bị lọc ra, `percent` không vượt quá 100

### Parser `[[Term]]` (trong `LessonSectionView` / `TermLink`)
- [ ] Chuỗi không có marker → trả nguyên văn, không tạo link
- [ ] Một marker giữa câu → tách đúng 3 phần: trước, link, sau
- [ ] Nhiều marker trong một đoạn → tạo đủ số link, thứ tự đúng
- [ ] Marker ở đầu và ở cuối chuỗi → không sinh đoạn text rỗng thừa
- [ ] **Edge**: term chứa ký tự đặc biệt `Token / JWT` → href là `/glossary#Token%20%2F%20JWT`, không phải `/glossary#Token / JWT` **[Edge: ký tự đặc biệt]**
- [ ] **Edge**: term chứa `C/C++` → encode đúng, không vỡ route
- [ ] **Edge**: marker không đóng `[[Term` → render nguyên văn, không throw
- [ ] **Edge**: marker rỗng `[[]]` → không sinh link rỗng

### `hooks/use-mermaid.ts`
- [ ] Container không có node `.mermaid` → không import `mermaid`, không lỗi
- [ ] Có node `.mermaid` → dynamic import chạy, SVG được chèn vào node
- [ ] **Edge**: cú pháp mermaid sai → `console.error`, phần còn lại của trang vẫn render **[Edge: mermaid lỗi]**
- [ ] Import dùng `import('mermaid')` trong `useEffect` — xác nhận `mermaid` **không** có trong bundle của `/system-design` (kiểm qua output `next build`)
- [ ] `securityLevel: 'strict'` được set (không phải `'loose'`)

### Toàn vẹn dữ liệu `constants/system-design.ts`
- [ ] Đúng **13** lesson **[AC2]**
- [ ] `order` là 1..13, không thiếu số, không trùng
- [ ] `slug` không trùng nhau
- [ ] **Không lesson nào có slug `cheat-sheet`** — nếu vi phạm, trang đó vĩnh viễn không truy cập được do file tĩnh thắng `[slug]` **[Design decision 6]**
- [ ] Mọi slug là kebab-case, chỉ `[a-z0-9-]`
- [ ] Lesson 1–12: `sections.length >= 3`, tổng số từ trong `body` ≥ 800 **[AC3]**
- [ ] Lesson 1–12: có ≥ 1 `section.diagram` **[AC3]**
- [ ] Lesson 1–12: `flashcards.length >= 4` **[AC3]**
- [ ] Mọi lesson có `keyTakeaway` không rỗng (cheat sheet phụ thuộc trường này) **[AC5]**
- [ ] Mọi `relatedTerms` khớp một `term` có thật trong `constants/glossary.ts` — hoặc chấp nhận không khớp nhưng phải có chủ đích
- [ ] Tổng số marker `[[Term]]` trên toàn bộ nội dung ≥ 15 **[AC8]**
- [ ] `track` chỉ nhận giá trị thuộc `LessonTrack`

### `components/system-design/Flashcard.tsx`
- [ ] Mặc định hiện mặt câu hỏi, ẩn đáp án
- [ ] Click → hiện đáp án; click lại → ẩn
- [ ] `pitfall` không có → không render khối pitfall rỗng
- [ ] Bàn phím: Enter và Space lật được thẻ; có `aria-expanded` đúng trạng thái **[Accessibility]**

### `components/system-design/LessonCard.tsx`
- [ ] Click vào thân card → điều hướng sang trang chi tiết
- [ ] Click vào checkbox → **chỉ** toggle tiến độ, **không** điều hướng (`stopPropagation`)
- [ ] Trước khi `hydrated` → không hiện trạng thái tick (tránh nháy)

## Integration Tests
**How do we test component interactions?**

> Không có API nên "integration" ở đây là tương tác giữa data ↔ page ↔ hook ↔ storage.

- [ ] `getStaticPaths` sinh đúng 13 path, khớp 1-1 với `LESSONS[].slug` **[AC3]**
- [ ] `getStaticProps` trả đúng lesson theo slug; slug lạ → 404 (`fallback: false`) **[Edge: slug không tồn tại]**
- [ ] Trang index đọc `LESSONS` và render đủ 13 card theo `order` tăng dần **[AC2]**
- [ ] Tick ở trang index → mở trang chi tiết cùng buổi → nút "đã ôn xong" ở trang chi tiết hiển thị đúng trạng thái (chung một nguồn `localStorage`)
- [ ] Tick ở trang chi tiết → quay lại index → `percent` đã cập nhật **[AC6]**
- [ ] Trang cheat sheet đọc `keyTakeaway` của cả 13 buổi, không thiếu dòng nào **[AC5]**
- [ ] `TermLink` điều hướng sang `/glossary#<term>` và trang glossary mở đúng card + hiệu ứng flash sẵn có **[AC8]**
- [ ] Term không tồn tại trong glossary → vẫn tới `/glossary`, không 404, trang không crash **[Edge]**
- [ ] Tab "System Design" trong `ROUTE_LIST` render ở **cả** `header-desktop.tsx` và `header-mobile.tsx` **[AC1]**
- [ ] Mục mới không có `requireLogin` → hiện cả khi chưa đăng nhập (lưu ý `header-desktop.tsx:14` lọc theo `requireLogin`)
- [ ] **API endpoint tests: không áp dụng** — feature không có API
- [ ] **Failure mode**: chặn `localStorage` trong DevTools → toàn bộ trang vẫn dùng được, chỉ mất tiến độ **[Edge]**

## End-to-End Tests
**What user flows need validation?**

- [ ] **Luồng 1 — Vào học lần đầu**: Trang chủ → click tab "System Design" → thấy 13 buổi đúng thứ tự, tiến độ 0/13 **[AC1, AC2]**
- [ ] **Luồng 2 — Ôn một buổi**: index → click buổi 2 → đọc nội dung, diagram render thành SVG, lật 4 flashcard → tick "đã ôn xong" → back về index thấy 1/13 (8%) **[AC3, AC6]**
- [ ] **Luồng 3 — Tiến độ bền vững**: tick 3 buổi → **reload trang** (F5) → vẫn 3/13, đúng 3 buổi đó **[AC6]**
- [ ] **Luồng 4 — Tìm nhanh**: gõ "sharding" vào ô search → chỉ còn buổi liên quan, có số đếm kết quả; xóa từ khóa → về đủ 13 **[AC7]**
- [ ] **Luồng 5 — Ôn gấp trước phỏng vấn**: index → cheat sheet → thấy bảng latency numbers, bảng chọn DB, khung các bước, và 13 dòng chốt **[AC5]**
- [ ] **Luồng 6 — Tự luyện mock**: mở buổi 13 → thấy khung 45 phút chia bước, ≥ 5 đề bài, checklist tiêu chí tự chấm **[AC4]**
- [ ] **Luồng 7 — Tra thuật ngữ giữa bài**: đang đọc buổi 4 → click thuật ngữ `[[Redis]]` → sang `/glossary#Redis`, card mở sẵn → back → về đúng vị trí cũ **[AC8]**
- [ ] **Critical path**: đi hết 13 buổi, tick tất cả → tiến độ 13/13 (100%), không buổi nào lỗi 404 hay trắng trang
- [ ] **Regression — `/glossary`**: search, lọc category, deep-link `#term` hoạt động y như trước **[AC9]**
- [ ] **Regression — `/glossary/muc-luc`**: mục lục và link sang chi tiết vẫn đúng **[AC9]**
- [ ] **Regression — `/blog/[slug]`**: mermaid trong bài blog **vẫn render** (feature này không được đụng vào, nhưng phải xác nhận) **[AC9]**
- [ ] **Regression — `/works/[workId]/details`**: mermaid kiến trúc vẫn render **[AC9]**
- [ ] **Regression — header**: các tab Home / Blog / Works vẫn đúng đường dẫn (`/works?_page=1&_limit=10` giữ nguyên query) **[AC9]**

## Test Data
**What data do we use for testing?**

- **Fixtures**: chính `constants/system-design.ts` là fixture — không cần seed data riêng vì feature static.
- **Fixture tối thiểu cho unit test (khi có runner)**: mảng 2 lesson giả (`fake-lesson-a`, `fake-lesson-b`) để test `use-lesson-progress` mà không phụ thuộc nội dung thật.
- **Mock cần có khi tự động hóa**:
  - `localStorage` — mock cả 3 trạng thái: bình thường / ném lỗi khi đọc / ném lỗi khi ghi.
  - `import('mermaid')` — mock module để test không phải chạy render SVG thật.
  - `next/router` — cho test điều hướng của `LessonCard`.
- **Dữ liệu biên cần chuẩn bị sẵn**: term `Token / JWT` và `C/C++` (ký tự đặc biệt), lesson có `flashcards` rỗng, `localStorage` chứa slug không tồn tại.
- **Test database**: không áp dụng — không có database.

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- **Lệnh chạy được ở v1**:
  - `npm run lint` → phải 0 error
  - `npm run build` → phải thành công, không lỗi TypeScript **[AC10]**
- **`npm run test -- --coverage`: chưa dùng được** — project không có test runner. Không tạo ảo giác về con số coverage.
- **Coverage gaps (có chủ đích, đã chấp nhận)**:
  - `use-lesson-progress`, parser `[[Term]]`, `use-mermaid`, các component → **0% automated coverage**. Bù bằng ca kiểm thử thủ công liệt kê ở trên.
  - Lý do: dựng hạ tầng test là việc riêng, không gộp vào feature nội dung (theo `CLAUDE.md`: mỗi commit một thay đổi logic).
- **Kiểm tra bundle**: đọc output `next build` xác nhận `mermaid` không nằm trong first-load JS của `/system-design`.
- **Sign-off thủ công**: người thực hiện tick toàn bộ checkbox trong tài liệu này và ghi kết quả vào `docs/ai/implementation/2026-07-26-feature-system-design.md` trước khi merge về `main`.

## Manual Testing
**What requires human validation?**

### UI/UX checklist
- [ ] Theme **sáng**: chữ, bảng, callout, diagram đều đọc được, tương phản đạt AA
- [ ] Theme **tối**: tương tự; đặc biệt kiểm tra SVG mermaid (nền trắng mặc định có thể chói trên nền tối)
- [ ] Chuyển theme khi đang ở trang chi tiết → diagram không biến mất/vỡ
- [ ] Bảng dài tràn ngang → có scroll ngang trong khung riêng, **body trang không scroll ngang**
- [ ] Nội dung tiếng Việt: không lỗi font, không mất dấu, không lẫn tiếng Anh ở nhãn UI

### Accessibility
- [ ] Tab qua bàn phím tới được mọi flashcard, checkbox và link; thứ tự focus hợp lý
- [ ] Focus ring nhìn thấy rõ ở cả hai theme
- [ ] Flashcard lật bằng Enter/Space; `aria-expanded` đổi đúng
- [ ] Thanh tiến độ có `role="progressbar"` + `aria-valuenow`
- [ ] Checkbox có `aria-label` mô tả rõ buổi nào
- [ ] Đọc thử một trang bằng VoiceOver: heading có cấu trúc h1→h2→h3 hợp lý

### Browser/device
- [ ] Chrome desktop
- [ ] Safari desktop (chú ý `localStorage` ở private mode)
- [ ] Safari iOS / Chrome Android
- [ ] Màn hình hẹp 360px → không vỡ layout, tab System Design hiện trong menu mobile **[AC1]**

### Nội dung (không thuần kỹ thuật nhưng chặn merge)
- [ ] 13 tiêu đề buổi khớp bảng ánh xạ trong `requirements` **[AC2]**
- [ ] Chủ site review độ chính xác kỹ thuật của nội dung AI soạn — **đây là open item đã ghi trong requirements**
- [ ] Buổi 11 (Taxi Booking) đối chiếu lại với bài học thật (ảnh gốc chỉ ghi "Toggle Content")
- [ ] Không có đoạn nào sao chép nguyên văn slide/tài liệu độc quyền của khóa học
- [ ] Con số trong cheat sheet (latency numbers) đúng thứ tự độ lớn, không sai đơn vị

### Smoke test sau deploy
- [ ] `/system-design` trả 200
- [ ] 3 slug bất kỳ trong 13 trả 200; 1 slug bịa trả 404
- [ ] `/system-design/cheat-sheet` trả 200 (**không** bị `[slug]` nuốt)
- [ ] Tab System Design hiện trên header production

## Performance Testing
**How do we validate performance?**

- **Load/stress testing: không áp dụng** — trang tĩnh, không backend, không có gì để chịu tải ngoài CDN/nginx phục vụ file.
- [ ] `next build` — first-load JS của `/system-design` không tăng bất thường so với `/glossary` (baseline cùng kiểu trang)
- [ ] `mermaid` xuất hiện trong chunk riêng, chỉ tải ở trang chi tiết có diagram
- [ ] Lighthouse trên `/system-design` và một trang chi tiết: Performance ≥ 90, Accessibility ≥ 95
- [ ] Trang chi tiết dài nhất: thời gian render diagram không gây giật khi cuộn (kiểm tra trực quan)

## Bug Tracking
**How do we manage issues?**

- **Quy trình**: lỗi phát hiện khi làm ghi thẳng vào `docs/ai/implementation/2026-07-26-feature-system-design.md`; lỗi phát hiện sau khi merge mở issue trên GitHub với nhãn `feature/system-design`.
- **Mức độ nghiêm trọng**:
  - **Blocker** — build/lint fail; trang 404 sai; `/glossary`, `/blog`, `/works` bị regression **[AC9]**; slug đụng `cheat-sheet`
  - **Major** — tiến độ không lưu được; mermaid không render; flashcard không lật; tab không hiện trên mobile
  - **Minor** — lệch màu/khoảng cách, sai chính tả, tương phản chưa đạt
  - **Nội dung** — sai kiến thức kỹ thuật trong bài; xử lý riêng vì cần chủ site xác nhận, **không** để AI tự sửa kiến thức đã được review
- **Regression strategy**: mọi thay đổi sau này chạm `constants/system-design.ts` phải chạy lại checklist "Toàn vẹn dữ liệu"; mọi thay đổi chạm `routes.ts` hoặc `hooks/` phải chạy lại mục Regression trong End-to-End.
