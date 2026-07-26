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

**Cập nhật 2026-07-26 (M1):** repo ban đầu không có test framework nào. Đã thêm **`vitest` ở mức tối thiểu** (commit `93f30ec`): môi trường `node`, **không** jsdom, **không** testing-library. Lý do giới hạn phạm vi: chỉ cần test hàm thuần là đã phủ được hai rủi ro nặng nhất trong planning (R2 slug đụng `cheat-sheet`, R4 thiếu `encodeURIComponent`), mà không phải dựng cả hạ tầng test React.

Hệ quả: **hành vi của hook và component vẫn không có automated coverage** — đó là lựa chọn có chủ đích, không phải thiếu sót. Mục tiêu "100% unit coverage" theo template vẫn không áp dụng cho feature này.

### Mục tiêu thực tế cho v1

| Tầng | Công cụ | Mục tiêu | Trạng thái |
|---|---|---|---|
| Type safety | `tsc` qua `npm run build` | 100% — build fail nếu lesson thiếu field | ✅ pass |
| Lint | `npm run lint` | không thêm warning so với baseline (baseline: 1 warning có sẵn ở `works`, 0 error) | ✅ pass |
| Logic thuần (parser `[[Term]]`, tiến độ, href) | `npm test` (vitest) | 100% nhánh của các hàm trong `utils/system-design.ts` | ✅ 25 ca pass |
| Toàn vẹn dữ liệu (13 buổi, slug trùng, slug cấm) | `npm test` (vitest) | 100% ca cấu trúc tự động; ca nội dung thêm ở M2 | ✅ 10 ca pass |
| Hành vi hook/component | Thủ công trên trình duyệt | 100% các ca liệt kê | ⏳ chờ M6 |
| Luồng người dùng | Thủ công trên trình duyệt | 100% các luồng ở mục End-to-End | ⏳ chờ M6 |

### Bám theo acceptance criteria
Mỗi ca kiểm thử dưới đây gắn với tiêu chí trong `requirements` — ký hiệu **[ACn]** tương ứng "Acceptance criteria" số n.

### Khuyến nghị (ngoài scope v1)
Thêm `jsdom` + `@testing-library/react` để tự động hóa nốt phần hành vi hook/component (`useLessonProgress` wiring, `Flashcard` lật bằng bàn phím, `LessonCard` chặn nổi bọt sự kiện). Hiện các phần này chỉ có checklist thủ công.

### Bài học rút ra ở M1
`vitest` dùng esbuild nên **không type-check**. Lỗi `matchAll` cần `downlevelIteration` (tsconfig target `es5`) lọt qua toàn bộ 35 ca test xanh và chỉ lộ ra ở `next build` (fix ở commit `364a1ba`). **`npm test` xanh không thay thế được `npm run build`** — phải chạy cả hai trước khi coi một task là xong.

## Unit Tests
**What individual components need testing?**

Ký hiệu: **[auto]** = chạy bằng `npm test`; **[thủ công]** = kiểm bằng tay trên trình duyệt.

### Logic tiến độ — `utils/system-design.ts` **[auto]** ✅ 15/15 pass
- [x] `parseCompletedSlugs(null)` → mảng rỗng
- [x] Đọc đúng mảng slug đã lưu
- [x] **Edge**: JSON hỏng → mảng rỗng, không throw
- [x] **Edge**: JSON hợp lệ nhưng không phải mảng → mảng rỗng
- [x] **Edge**: phần tử sai kiểu (số, null) → bị lọc bỏ
- [x] **Edge**: slug của buổi đã xóa khỏi `LESSONS` → bị lọc, `percent` không vượt 100
- [x] **Edge**: slug trùng lặp → khử trùng
- [x] `toggleSlug` thêm slug chưa có / gỡ slug đã có / không sửa mảng gốc
- [x] `computeProgressPercent`: 0/13 → 0, 3/13 → 23, 13/13 → 100
- [x] **Edge**: tổng bằng 0 → trả 0, không chia cho 0
- [x] **Edge**: đếm vượt tổng → chặn trên ở 100

### Wiring hook `hooks/use-lesson-progress.ts` **[thủ công]** ⏳
- [ ] Lần render đầu trả `completed` rỗng và `hydrated === false` — không đọc `localStorage` trong thân render **[AC6]**
- [ ] Sau mount, `hydrated === true` và hiện đúng tiến độ đã lưu
- [ ] `toggle` ghi được xuống `localStorage`; `reset()` xóa sạch
- [ ] **Edge**: `localStorage` ném lỗi khi đọc (Safari private mode) → coi như 0%, không crash
- [ ] **Edge**: `localStorage` ném lỗi khi ghi (quota) → state trong phiên vẫn cập nhật

### Parser `[[Term]]` — `utils/system-design.ts` **[auto]** ✅ 10/10 pass
- [x] Chuỗi không có marker → trả nguyên văn, không tạo link
- [x] Một marker giữa câu → tách đúng 3 phần
- [x] Nhiều marker trong một đoạn → đủ số link, đúng thứ tự
- [x] Marker chiếm trọn chuỗi → không sinh đoạn text rỗng thừa
- [x] Cắt khoảng trắng thừa quanh tên thuật ngữ
- [x] **Edge**: marker không đóng `[[Term` → render nguyên văn, không throw
- [x] **Edge**: marker rỗng `[[]]` → không sinh link rỗng
- [x] **Edge**: `Token / JWT` → `/glossary#Token%20%2F%20JWT` **[Edge: ký tự đặc biệt]**
- [x] **Edge**: `C/C++` → `/glossary#C%2FC%2B%2B`
- [x] `glossaryHref` cơ bản

### `hooks/use-mermaid.ts`
- [ ] Container không có node `.mermaid` → không import `mermaid`, không lỗi
- [ ] Có node `.mermaid` → dynamic import chạy, SVG được chèn vào node
- [ ] **Edge**: cú pháp mermaid sai → `console.error`, phần còn lại của trang vẫn render **[Edge: mermaid lỗi]**
- [ ] Import dùng `import('mermaid')` trong `useEffect` — xác nhận `mermaid` **không** có trong bundle của `/system-design` (kiểm qua output `next build`)
- [ ] `securityLevel: 'strict'` được set (không phải `'loose'`)

### Toàn vẹn cấu trúc `constants/system-design.ts` **[auto]** ✅ 10/10 pass
- [x] Đúng **13** lesson **[AC2]**
- [x] `order` là 1..13, không thiếu số, không trùng
- [x] `slug` không trùng nhau
- [x] **Không lesson nào có slug trùng tên file tĩnh cùng thư mục** (`cheat-sheet`, `index`) — nếu vi phạm, trang đó vĩnh viễn không truy cập được **[Design decision 6]**
- [x] Mọi slug là kebab-case
- [x] Mọi lesson có `title` và `summary` không rỗng
- [x] Mọi lesson có `keyTakeaway` không rỗng (cheat sheet phụ thuộc trường này) **[AC5]**
- [x] `track` chỉ nhận giá trị thuộc `LESSON_TRACKS`
- [x] Mọi lesson có ≥ 1 keyword để search
- [x] `readingMinutes` là số dương

### Toàn vẹn nội dung — thêm ở M2, chạy ở M6 **[auto, chưa viết]** ⏳
> Chưa viết được ở M1 vì `sections`/`flashcards` còn rỗng theo thiết kế — các ca này sẽ fail đến hết M4. Viết thành file riêng `constants/system-design-content.test.ts` sau khi chốt khuôn mẫu ở T2.3.

- [ ] Lesson 1–12: `sections.length >= 3`, tổng số từ trong `body` ≥ 800 **[AC3]**
- [ ] Lesson 1–12: có ≥ 1 `section.diagram` **[AC3]**
- [ ] Lesson 1–12: `flashcards.length >= 4` **[AC3]**
- [ ] Mọi `relatedTerms` khớp một `term` có thật trong `constants/glossary.ts`
- [ ] Tổng số marker `[[Term]]` trên toàn bộ nội dung ≥ 15 **[AC8]**

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

- **Lệnh chạy được**:
  - `npm test` → vitest, **35 ca pass** tính đến hết M1
  - `npm run lint` → 0 error, không thêm warning so với baseline
  - `npm run build` → phải thành công, không lỗi TypeScript **[AC10]**
- **`npm test -- --coverage` chưa cấu hình** — chưa cài provider coverage. Không báo con số coverage khi chưa đo được.
- **Coverage gaps (có chủ đích, đã chấp nhận)**:
  - `useLessonProgress` wiring, `useMermaid`, toàn bộ component React → **0% automated coverage**. Bù bằng checklist thủ công.
  - Lý do: cần jsdom + testing-library, là hạ tầng riêng ngoài scope feature này.
- **Bundle**: `next build` xác nhận `/system-design` 4.05 kB / 298 kB first-load và `/system-design/[slug]` 3.77 kB / 294 kB, trên nền shared 290 kB → mermaid (~500 kB) **không** nằm trong first-load. ✅
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
