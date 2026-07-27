---
phase: implementation
title: Implementation Guide
feature: system-design
description: Nhật ký triển khai — M1 hạ tầng đã xong, ghi lại quyết định, lệch thiết kế và edge case đã xử lý
---

# Implementation Guide — Feature `system-design`

## Trạng thái

| Milestone | Trạng thái | Ghi chú |
|---|---|---|
| M1 — Hạ tầng & khung dữ liệu | ✅ **Xong** (8/8 task), **đã kiểm trên trình duyệt** | Cổng M1 pass — xem mục Kiểm chứng |
| M2 — Vertical slice buổi 1–2 | ✅ Xong | Data model chốt từ đây, không sửa lần nào nữa |
| M3 — Kiến thức lõi (buổi 3–6) | ✅ Xong | |
| M4 — Case study (buổi 7–12) | ✅ Xong | |
| M5 — Buổi 13 + cheat sheet | ✅ Xong | Kèm fix bundle |
| M6 — Kiểm thử & sign-off | ✅ **Xong phần tự động và E2E** | Còn nợ 360px, VoiceOver, và review nội dung |

## Development Setup
**How do we get started?**

- Node theo `.nvmrc`; `npm install` (worktree mới **không** kế thừa `node_modules` — đây là lý do commit docs đầu tiên không chạy được lint).
- `.npmrc` đặt `legacy-peer-deps=true`, giữ nguyên.
- Lệnh dùng trong feature này:
  - `npm test` — vitest, logic thuần
  - `npm run lint` — baseline có sẵn **1 warning** ở `works` (không phải do feature này), 0 error
  - `npm run build` — type-check + sinh trang tĩnh
- ⚠️ **Không chạy `npx tsc --noEmit`**: nó ghi đè `tsconfig.tsbuildinfo`, mà file này đang bị track trong git nên working tree sẽ bẩn. Dùng `npm run build` để type-check.

## Code Structure
**How is the code organized?**

```
models/system-design.ts                   Lesson, LessonSection, Flashcard, InterviewStep, MockPrompt, CheatSheetTable
constants/system-design.ts                13 lesson + INTERVIEW_STEPS + CHEAT_SHEET_TABLES
constants/system-design.test.ts           10 ca toàn vẹn cấu trúc
constants/system-design-content.test.ts   Chuẩn nội dung, cross-link, chống markdown, INTERVIEW_STEPS
constants/barrel-bundle.test.ts           Chặn tái phát lỗi lọt bundle dùng chung
constants/storage-key.ts                  + SYSTEM_DESIGN_PROGRESS
constants/index.ts                        CỐ Ý không re-export ./system-design — xem sự cố bundle
utils/system-design.ts                    Logic thuần: parse tiến độ, toggle, percent, parser [[Term]], glossaryHref
utils/system-design.test.ts               27 ca
hooks/use-lesson-progress.ts              Wiring localStorage ↔ state; nhận slug qua tham số
hooks/use-mermaid.ts                      Render .mermaid client-side, vẽ lại khi đổi theme
components/system-design/                 tokens, TermLink, RichText, LessonSectionView,
                                          FlashcardDeck, LessonCard, RoadmapProgress, MockPractice
pages/system-design/index.tsx             Lộ trình + tiến độ + search + CTA cheat sheet
pages/system-design/[slug].tsx            13 trang tĩnh
pages/system-design/cheat-sheet.tsx       Trang ôn gấp
components/common/header/index.tsx        + tab System Design trong navItems
```

Quy ước: file kebab-case, barrel `index.ts` mỗi thư mục — bám theo repo sẵn có.

## Implementation Notes
**Key technical details to remember:**

### Quyết định trong lúc làm

1. **Tách logic thuần ra `utils/` để test được mà không cần jsdom.** Hook chỉ còn phần wiring localStorage ↔ state. Đây là lý do 25 ca test chạy được với `vitest` cấu hình `environment: 'node'`, không cần testing-library.

2. **Khóa `localStorage` đặt trong `StorageKeys`** (`constants/storage-key.ts`) thay vì tạo hằng riêng — repo đã có convention này cho `USER_INFO`. Ban đầu viết `SYSTEM_DESIGN_STORAGE_KEY` trong `constants/system-design.ts` rồi chuyển sang.

3. **Trang có props dùng `export default function X({...}: Props)` rồi `X.Layout = MainLayout`**, không dùng `NextPageWithLayout<Props>` — vì `NextPageWithLayout` trong `models/common.ts` **không phải generic**. Đây là pattern `pages/blog/[slug].tsx:23` đang dùng. Tránh phải sửa type dùng chung cho toàn repo.

4. **`RichText` tách riêng khỏi `LessonSectionView`** để dùng lại được ở cả body, ô bảng, callout và đáp án flashcard — thuật ngữ `[[Term]]` cần link ở mọi chỗ, không chỉ trong đoạn văn.

5. **`useMermaid` lưu mã nguồn vào `data-mermaid-src`.** `mermaid.run()` bỏ qua node đã có `data-processed`, nên đổi theme sáng/tối sẽ không vẽ lại nếu không khôi phục text gốc. Hai trang cũ (`blog/[slug].tsx`, `works/details.tsx`) **có lỗi này** nhưng không sửa — ngoài scope, đã ghi thành follow-up.

### Lệch so với thiết kế

| Thiết kế nói | Thực tế | Lý do |
|---|---|---|
| `hooks/use-mermaid.ts` nhận `(containerRef, deps?)` | Nhận `(containerRef, isDark)` | Chỉ có đúng một dependency thật là theme; interface hẹp hơn thì khó dùng sai hơn |
| Component `LessonSection` + `Flashcard` + `FlashcardDeck` tách 3 file | `Flashcard` nằm trong `flashcard-deck.tsx`, không export ra ngoài | Thẻ đơn không dùng độc lập ở đâu; giữ private trong module |
| Không nhắc `tokens.ts` | Thêm `components/system-design/tokens.ts` | 6 component cùng cần một bảng màu; lặp lại 6 lần là sai |
| Model có `LessonTrack` là union literal | Thêm mảng `LESSON_TRACKS` rồi suy ra type | Cần giá trị runtime để test kiểm `track` hợp lệ |
| Trang lộ trình có CTA sang cheat sheet | **Đã bỏ khỏi M1** | `/system-design/cheat-sheet` tới T5.2 mới tồn tại; không ship link 404. Có comment đánh dấu chỗ thêm lại |
| Tab thêm vào `ROUTE_LIST` (`routes.ts`) | Thêm vào `navItems` trong `components/common/header/index.tsx` | `ROUTE_LIST` là **code chết** — xem mục dưới |

### Sự cố: sửa nhầm vào code chết

Bản sửa T1.8 đầu tiên (`ad8769b`) thêm mục vào `components/common/header/routes.ts` và **không có tác dụng gì**. Phát hiện khi mở trình duyệt: tab không xuất hiện.

Repo có **hai** implementation header:

| File | Nguồn menu | Được dùng? |
|---|---|---|
| `components/common/header/index.tsx` | mảng `navItems` hardcode trong file | ✅ **Có** — `MainLayout` import động file này |
| `components/common/header/header-desktop.tsx` + `header-mobile.tsx` | `ROUTE_LIST` từ `routes.ts` | ❌ **Không** — `grep` toàn repo cho 0 lượt import |

Đã `git revert ad8769b` rồi sửa lại vào `navItems` (`4214ac6`).

**Hai bài học:**
1. `next build` và `npm test` đều **không** phát hiện được lỗi này — sửa vào code chết vẫn compile sạch, vẫn pass hết test. Chỉ mở trình duyệt mới thấy.
2. Nhận định trong requirements rằng "`/glossary` không có tab" là **sai** — nó vốn đã có trong `navItems`. Sai vì đọc `routes.ts` (file chết) thay vì file thật.

### Edge case đã xử lý

- `localStorage` bị chặn khi **đọc** → `try/catch`, coi như chưa ôn buổi nào, nội dung vẫn đọc được.
- `localStorage` bị chặn/hết quota khi **ghi** → state trong phiên vẫn cập nhật, chỉ mất tính bền vững sau reload.
- Giá trị lưu là JSON hỏng / không phải mảng / phần tử sai kiểu → lọc sạch, không throw.
- Slug của buổi đã bị xóa còn sót trong `localStorage` → lọc bỏ, `percent` không vượt 100.
- Hydration: `hydrated` mặc định `false`, UI hiện `"13 buổi"` thay vì `"0/13 — 0%"` cho tới khi đọc xong `localStorage`.
- Marker `[[]]` rỗng và `[[Term` không đóng → giữ nguyên văn, không sinh link rỗng.
- Term chứa `/` và khoảng trắng → `encodeURIComponent`.
- Slug lạ → `fallback: false` → 404.
- Buổi chưa có nội dung → hiện "đang được biên soạn" thay vì trang trắng.
- Bảng rộng → cuộn trong khung riêng (`overflowX: auto`), body trang không scroll ngang.
- Nút tick nằm ngoài thẻ `Link` + `preventDefault` + `stopPropagation` → click tick không điều hướng.

## Integration Points
**How do pieces connect?**

- **Không có API, không database, không third-party service.** Toàn bộ static, `LESSONS` import thẳng vào page tại build time.
- Điểm nối duy nhất ra ngoài feature: `components/common/header/routes.ts` (thêm 1 mục) và link `[[Term]]` → `/glossary#<term>`.
- `localStorage` là trạng thái runtime duy nhất, một khóa `pinit:system-design:progress`.

## Error Handling
**How do we handle failures?**

- `localStorage`: `try/catch` ở cả đọc và ghi, nuốt lỗi im lặng — hỏng tiến độ không được phép làm hỏng việc đọc bài.
- Mermaid: `.catch(err => console.error('Mermaid render error:', err))`, một diagram lỗi không làm vỡ trang.
- Slug không tồn tại: `getStaticProps` trả `notFound: true`; `getStaticPaths` dùng `fallback: false`.
- Không có retry/fallback mechanism nào — không có network call để mà retry.

## Performance Considerations
**How do we keep it fast?**

- 14 trang tĩnh (index + 13 lesson), 0 network call khi đọc.
- **Đo thực tế sau M1**: `/system-design` 4.05 kB / 298 kB first-load; `/system-design/[slug]` 3.77 kB / 294 kB; shared baseline 290 kB. `mermaid` (~500 kB) **không** trong first-load → dynamic import hoạt động đúng.
- Search lọc mảng 13 phần tử trong `useMemo`, không cần debounce.
- `completed` là `Set` bọc `useMemo` để `isCompleted` không phải quét mảng mỗi lần render card.

## Security Notes
**What security measures are in place?**

- Không authentication/authorization — trang công khai, tab không đặt `requireLogin`.
- Input người dùng duy nhất là ô search, chỉ dùng để lọc mảng in-memory. Không đẩy vào DOM dạng HTML.
- **Không dùng `dangerouslySetInnerHTML`** ở bất kỳ đâu trong feature.
- Mermaid dùng `securityLevel: 'strict'` (hai trang cũ trong repo dùng `'loose'`). Diagram do repo kiểm soát, không cần click handler.
- `localStorage` chỉ chứa mảng slug — không dữ liệu nhạy cảm.
- Không secret, không biến môi trường mới.

## Kiểm chứng cổng M1 (2026-07-26, trình duyệt thật)

Chạy trên **production server** (`npm run build && npm start`), không phải dev server — dev mode ở repo này compile 48-50s mỗi route (27k module) và tự restart vì chạm ngưỡng RAM, không kiểm được.

| Hạng mục | Kết quả |
|---|---|
| Tab "System Design" trên header, trạng thái active | ✅ hiện đúng, bold khi ở `/system-design` và cả trang chi tiết |
| 13 buổi đúng thứ tự trên trang lộ trình | ✅ 13 link duy nhất trong HTML |
| Tick 3 buổi → phần trăm | ✅ "Đã ôn 3/13 buổi — 23%" (khớp ca test `computeProgressPercent(3,13) === 23`) |
| Reload → tiến độ còn | ✅ vẫn 3/13, đúng 3 buổi đó |
| Giá trị `localStorage` | ✅ `["nguyen-ly-cap-microservices","load-balancer-va-database","networking-he-phan-tan"]` — lưu **slug**, không phải index |
| Click tick không điều hướng | ✅ vẫn ở `/system-design` |
| Tiến độ dùng chung index ↔ trang chi tiết | ✅ nút "Đã ôn xong buổi này" ở buổi 3 hiện trạng thái đã bật |
| Trang chi tiết: chip, keyTakeaway, prev/next | ✅ đủ |
| Buổi chưa có nội dung | ✅ "Nội dung buổi này đang được biên soạn." |
| Search "sharding" | ✅ "1 / 13 buổi khớp từ khóa", đúng buổi 2 |
| Search không khớp | ✅ "0 / 13" + empty state có gợi ý xóa từ khóa |
| Nút "Đặt lại tiến độ" | ✅ về 0/13 — 0% |
| Theme sáng | ✅ tương phản tốt, accent xanh đọc rõ |
| Console | ✅ **không** hydration warning, không lỗi. Chỉ có `fetch profile error` từ hook auth — có sẵn, không liên quan |
| Route `/system-design/cheat-sheet` | ✅ trả 404, **không** bị `[slug]` nuốt |
| Slug lạ | ✅ 404 |
| Regression `/`, `/glossary`, `/glossary/muc-luc`, `/blog` | ✅ đều 200 |

**Chưa kiểm** (để M6): mermaid render thật (M1 chưa có diagram nào), flashcard lật (chưa có thẻ nào), màn hình 360px, Safari private mode, VoiceOver.

## Kiểm chứng T2.1 — buổi 1 (2026-07-26, trình duyệt thật)

Lần đầu có nội dung thật nên đây cũng là lần đầu mermaid, bảng, callout, cross-link và flashcard chạy thật.

| Hạng mục | Kết quả |
|---|---|
| Mermaid render | ✅ cả 2 sơ đồ ra SVG (711×720 và 697×329) |
| **Mermaid vẽ lại khi đổi theme** | ✅ chuyển từ bảng màu tối sang sáng đúng — cơ chế `data-mermaid-src` hoạt động |
| Cross-link `[[Term]]` | ✅ `Latency`, `Microservices`, `Idempotency`, `Cache`, `CDN` render thành link gạch chân |
| Bảng đánh đổi | ✅ 2 bảng, header nền chìm, không đẩy trang scroll ngang |
| Callout | ✅ viền trái accent + icon bóng đèn |
| Flashcard | ✅ 6 thẻ, "Lật tất cả" ↔ "Ẩn tất cả đáp án", khối "Bẫy thường gặp" có icon cảnh báo |
| Theme sáng lẫn tối | ✅ đọc được cả hai |

**Cảnh báo giả đã loại trừ**: khối "Bẫy thường gặp" ban đầu trông như bị cắt chữ — thực ra chỉ là animation `Collapse` chưa xong. Đo bằng JS cho `clipped: false`, `overflow: visible`.

**Điểm cần theo dõi**: sơ đồ quyết định CAP cao 720px, chiếm nhiều màn hình. Mermaid tự đặt `style="max-width: 711px"` inline nên đè lên rule `maxWidth: 100%` của container; may là khung cha có `overflowX: auto` nên màn hình hẹp sẽ cuộn ngang trong khung thay vì vỡ layout. **Chưa kiểm ở 360px** — để T2.3.

## Kiểm chứng M6 (2026-07-27)

Chạy trên production server (`npm run build && npm start`).

### Tự động
| Hạng mục | Kết quả |
|---|---|
| `npm test` | ✅ **122/122** pass, 4 file test |
| `npm run lint` | ✅ 0 error, **1 warning có sẵn** ở `works` — không thêm warning nào |
| `npm run build` | ✅ pass, sinh 15 trang tĩnh của feature |
| Toàn vẹn dữ liệu 13 buổi | ✅ mỗi buổi ≥ 839 từ, ≥ 3 khối, ≥ 1 sơ đồ, đúng 6 flashcard |
| Marker `[[Term]]` | ✅ **116** trên toàn feature (yêu cầu ≥ 15) **[AC8]**, 0 marker trỏ thuật ngữ không tồn tại |

### Luồng người dùng
| Luồng | Kết quả |
|---|---|
| L1 — tab header → lộ trình 13 buổi | ✅ 14 link (13 buổi + CTA cheat sheet) |
| L2 — mở buổi, lật thẻ, tick | ✅ |
| L3 — tiến độ bền vững qua reload | ✅ 13/13 — 100% giữ nguyên |
| L4 — search | ✅ "sharding" → 1/13, empty state đúng |
| L5 — cheat sheet | ✅ 3 bảng, 13 dòng chốt, có con số latency |
| L6 — buổi 13 tự luyện | ✅ 6 đề, 51 checkbox, khung 45 phút |
| L7 — cross-link glossary | ✅ `/glossary#Load%20Balancer` mở đúng, encode đúng |
| **Critical path** — tick đủ 13 buổi | ✅ **13/13 → 100%**, `aria-valuenow=100`, URL không đổi (click tick không điều hướng) |

### Regression
| Route | Kết quả |
|---|---|
| `/`, `/about`, `/blog`, `/glossary`, `/glossary/muc-luc`, `/works?_page=1&_limit=10` | ✅ 200 |
| 13 trang buổi + `/system-design` + `/system-design/cheat-sheet` | ✅ 200 |
| Slug lạ | ✅ 404 |

### Accessibility
| Hạng mục | Kết quả |
|---|---|
| Flashcard nhận focus | ✅ `tabindex="0"`, `document.activeElement` đúng |
| Enter lật thẻ | ✅ `aria-expanded` false → true |
| Space lật thẻ | ✅ true → false |
| Thanh tiến độ | ✅ `role="progressbar"` + `aria-valuenow` đúng |
| Nút đã ôn xong | ✅ `aria-pressed` phản ánh trạng thái |
| Theme sáng và tối | ✅ đọc được cả hai, mermaid vẽ lại khi đổi theme |

### Bundle **[AC10]**
| Mốc | Shared first-load | `_app` chunk |
|---|---|---|
| Trước feature | 287 kB | 183 kB |
| Khi phát hiện lỗi | 340 kB | 236 kB |
| Sau khi gỡ nội dung khỏi barrel | 287 kB | 183 kB |
| **Sau khi sửa cả 6 hook** | **264 kB** | **160 kB** |

`build-manifest.json` xác nhận chunk nội dung chỉ nạp trên 3 route `system-design`. Mermaid không nằm trong first-load.

### ❌ Chưa làm được
- **Viewport 360px thật**: công cụ điều khiển Chrome render cố định ở 1440 (`window.innerWidth` luôn 1440 dù `resize_window` báo thành công, `outerWidth` trả 0). Đã thử ba lần ở M2 và M6. Mô phỏng bằng cách ép chiều rộng `body` cho kết quả tốt (bảng cuộn nội bộ 312/480, mermaid co xuống 310px) nhưng **media query của MUI không phản ứng** nên không thay thế được kiểm thật. **Cách kiểm 30 giây**: mở DevTools, bật device toolbar (Cmd+Shift+M), chọn 360px.
- **VoiceOver**: cần thao tác người thật.
- **Review nội dung chuyên môn (T6.6)**: chặn merge, cần chủ site — xem Follow-up.

## Follow-up

- **[M2]** Viết `constants/system-design-content.test.ts` (đủ số từ, có diagram, đủ flashcard, đếm `[[Term]]`) sau khi chốt khuôn mẫu ở T2.3.
- **[T5.2]** Thêm lại CTA cheat sheet vào trang lộ trình khi trang đó tồn tại.
- **[v2]** Refactor `blog/[slug].tsx` và `works/details.tsx` sang `useMermaid`; hai trang này hiện **không vẽ lại diagram khi đổi theme** và dùng `securityLevel: 'loose'`. Xóa stub chết `components/mermaid/MermaidFlowchart.tsx`.
- **[v2]** Thêm jsdom + testing-library để tự động hóa phần hành vi hook/component.
- **[Vệ sinh repo]** `tsconfig.tsbuildinfo` đang bị track trong git — nên đưa vào `.gitignore`, nhưng là thay đổi ngoài scope feature.
- **[CHẶN MERGE]** Chủ site review độ chính xác kỹ thuật nội dung 13 buổi, và đối chiếu riêng **buổi 11 (đặt xe)** vì đầu mục do AI suy đoán — ảnh lộ trình gốc chỉ ghi "Toggle Content".
- **[Chưa kiểm]** Viewport 360px và VoiceOver — cần thao tác người thật.
- **[Gợi ý cho glossary]** Năm thuật ngữ cốt lõi của System Design không có trong `constants/glossary.ts`: Sharding, Replication, Redis, Message Queue, Elasticsearch. Bổ sung sẽ tăng số cross-link dùng được. Ngoài scope feature này.
