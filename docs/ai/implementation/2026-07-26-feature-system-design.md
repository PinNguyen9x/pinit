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
| M1 — Hạ tầng & khung dữ liệu | ✅ **Xong** (8/8 task) | Đi được từ header → lộ trình → trang chi tiết; tiến độ lưu được |
| M2 — Vertical slice buổi 1–2 | ⬜ Chưa bắt đầu | Cổng chặn: chốt data model |
| M3–M6 | ⬜ Chưa bắt đầu | |

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
models/system-design.ts            Type: Lesson, LessonSection, Flashcard, InterviewStep, MockPrompt
constants/system-design.ts         13 lesson (metadata đủ, nội dung điền dần)
constants/system-design.test.ts    10 ca toàn vẹn cấu trúc
constants/storage-key.ts           + SYSTEM_DESIGN_PROGRESS
utils/system-design.ts             Logic thuần: parse tiến độ, toggle, percent, parser [[Term]], glossaryHref
utils/system-design.test.ts        25 ca
hooks/use-lesson-progress.ts       Wiring localStorage ↔ React state
hooks/use-mermaid.ts               Render .mermaid client-side
components/system-design/          tokens, TermLink, RichText, LessonSectionView, FlashcardDeck, LessonCard, RoadmapProgress
pages/system-design/index.tsx      Lộ trình + tiến độ + search
pages/system-design/[slug].tsx     13 trang tĩnh
components/common/header/routes.ts + tab System Design
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

## Follow-up

- **[M2]** Viết `constants/system-design-content.test.ts` (đủ số từ, có diagram, đủ flashcard, đếm `[[Term]]`) sau khi chốt khuôn mẫu ở T2.3.
- **[T5.2]** Thêm lại CTA cheat sheet vào trang lộ trình khi trang đó tồn tại.
- **[v2]** Refactor `blog/[slug].tsx` và `works/details.tsx` sang `useMermaid`; hai trang này hiện **không vẽ lại diagram khi đổi theme** và dùng `securityLevel: 'loose'`. Xóa stub chết `components/mermaid/MermaidFlowchart.tsx`.
- **[v2]** Thêm jsdom + testing-library để tự động hóa phần hành vi hook/component.
- **[Vệ sinh repo]** `tsconfig.tsbuildinfo` đang bị track trong git — nên đưa vào `.gitignore`, nhưng là thay đổi ngoài scope feature.
