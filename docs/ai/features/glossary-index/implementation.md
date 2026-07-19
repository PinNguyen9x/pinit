---
phase: implementation
title: Implementation Guide
feature: glossary-index
description: Ghi chú triển khai trang mục lục thuật ngữ theo chủ đề
---

# Implementation Guide — Glossary Index (Mục lục)

## Development Setup
**How do we get started?**

- Không cần setup mới. Chạy `npm run dev` để xem `/glossary/muc-luc`.
- Verify: `npm run lint` + `npm run build` (dự án chưa có test runner → không có `npm test`).

## Code Structure
**How is the code organized?**

- **File mới**: `pages/glossary/muc-luc.tsx` → route `/glossary/muc-luc` (Pages Router).
  - `pages/glossary.tsx` (route `/glossary`) tồn tại song song, KHÔNG dùng `pages/glossary/index.tsx` để tránh trùng route.
- **File sửa**: `pages/glossary.tsx` — thêm 1 cross-link trong header trỏ sang `/glossary/muc-luc` (dùng `ArrowForwardIcon` đã import sẵn). Không đụng logic hiện có.
- Import theo alias dự án: `@/components/common` (`Seo`, `BackgroundFx`), `@/components/layouts` (`MainLayout`), `@/constants` (`GLOSSARY`, `GlossaryTerm`), `@/models` (`NextPageWithLayout`).

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **Nhóm theo category**: `groups = useMemo` gom `filtered` theo `d.cat`, sort term trong nhóm theo alpha (`localeCompare`, sensitivity base), sort nhóm theo `count desc` rồi `cat` alpha khi bằng.
- **Search**: `filtered = useMemo` lọc `GLOSSARY` theo `term/short/detail.includes(q)` (lowercase). Query rỗng → trả nguyên `GLOSSARY`. **Không highlight** (chốt Phase 3).
- **List inline**: mỗi nhóm là 1 `<section>` (card), term là `<Link>` inline ngăn bằng `·` (dùng `Fragment`, chèn separator khi `i > 0`), tự wrap.
- **Deep-link**: href = `/glossary#${encodeURIComponent(d.term)}`. Trang `/glossary` bắt `hashchange`/mount → `decodeURIComponent` → `goToTerm`. Không sửa trang chi tiết cho luồng này.
- **Cross-link 2 chiều**: mục lục có link → `/glossary` (header + footer); trang chi tiết có link → `/glossary/muc-luc` (header).
- **Ctrl/Cmd+F**: focus ô search (đồng nhất trang chi tiết).

### Patterns & Best Practices
- Trang **self-contained**: chỉ reuse component đã export (`Seo`, `BackgroundFx`, `MainLayout`); không phụ thuộc `Highlight` (local trong `glossary.tsx`). Xem nguyên tắc "tách shared khi có consumer thứ 2".
- Theme-aware: token màu tính từ `useTheme()` (sáng/tối), đồng bộ trang chi tiết.
- `NextPageWithLayout` + `GlossaryIndex.Layout = MainLayout`.

## Integration Points
**How do pieces connect?**

- Không có API/DB. Giao tiếp giữa 2 trang thuần qua **URL hash** (`/glossary#<term>`).
- Hợp đồng ngầm: hash = `encodeURIComponent(term)`, `term` khớp chính xác một `GLOSSARY[].term`. Cùng nguồn `GLOSSARY` nên luôn khớp.

## Error Handling
**How do we handle failures?**

- Search không khớp → `groups.length === 0` → empty state.
- Term có ký tự đặc biệt (`Token / JWT` → `Token%20%2F%20JWT`, `AI Agent` → `AI%20Agent`): `encodeURIComponent` đảm bảo href hợp lệ; đã verify round-trip decode đúng.
- Không có network → không áp dụng (trang static).

## Performance Considerations
**How do we keep it fast?**

- SSG: cả `/glossary` và `/glossary/muc-luc` prerender static HTML (xác nhận qua `next build`).
- `filtered`/`groups` bọc `useMemo`; 109 item — chi phí không đáng kể.
- Chỉ thêm 1 page, không tăng bundle chung đáng kể.

## Security Notes
**What security measures are in place?**

- Không có auth/secret/input nhạy cảm. Dữ liệu tĩnh, chỉ đọc.
- `encodeURIComponent` cho giá trị đưa vào URL hash (tránh URL vỡ).

## Verification Evidence
**Proof of working (Phase 5 verify):**

- `npm run lint`: pass (chỉ 1 warning cũ ở `pages/works/index.tsx`, không liên quan).
- `npm run build`: pass. Routes tạo static: `/glossary` (`glossary.html`) và `/glossary/muc-luc` (`glossary/muc-luc.html`), không conflict (`routes-manifest.json` liệt kê cả hai).
- HTML render (`.next/server/pages/glossary/muc-luc.html`):
  - 10 category đúng thứ tự count desc: AI, Messaging, DevOps, Web, General, Cloud, Database, Blockchain, Mobile, Security.
  - **109** link `href="/glossary#..."` (đủ, không sót).
  - Encode đúng: `AI%20Agent`, `Token%20%2F%20JWT` (decode → `Token / JWT`).
  - Count line: "Đang hiển thị 109 / 109 thuật ngữ trong … nhóm".
  - Cross-link `href="/glossary/muc-luc"` xuất hiện trong `glossary.html`.

### Design deviations
- Không có deviation so với design đã chốt Phase 3.
- Lệch quy trình: **không TDD** (dự án không có test runner) → verify bằng lint + build + kiểm tra HTML build-time + manual (đúng như testing.md).
