---
phase: testing
title: Testing Strategy
feature: glossary-index
description: Chiến lược kiểm thử trang mục lục thuật ngữ
---

# Testing Strategy — Glossary Index (Mục lục)

## Test Coverage Goals
**What level of testing do we aim for?**

- Dự án hiện **không có test runner** cho pages → trọng tâm là **kiểm thử thủ công** + `npm run lint` + build TypeScript sạch.
- Nếu về sau thêm unit test: mục tiêu phủ logic thuần (filter, group, sort, encode href).
- Mọi scenario dưới đây bám sát Success Criteria trong requirements.

## Unit Tests
**What individual components need testing?** (logic thuần, có thể tách khỏi React nếu thêm test sau)

> **Legend**: [x] = đã verify. Nguồn: (build) = HTML build tĩnh, (e2e) = Chrome headless + puppeteer-core trên `next dev` :3939.

### Filtering (`filtered`)
- [x] Query rỗng → trả về đủ 109 term (build: count line "109/109"; e2e: 109 link).
- [x] Query khớp `term`/`detail` (vd "kafka") → chỉ term liên quan (e2e: n=17, gồm "Kafka").
- [x] Query khớp `short`/`detail` (không có trong tên) → vẫn lọt (e2e: 17 kết quả gồm term chỉ nhắc "kafka" trong detail).
- [x] Query không khớp gì → empty state (e2e: "Không tìm thấy thuật ngữ nào", "0 / 109 … 0 nhóm").
- [x] Không phân biệt hoa/thường (logic `toLowerCase`; e2e).

### Grouping & sorting (`groups`)
- [x] Gom đúng theo `cat`, tổng số term = 109 khi query rỗng (build + e2e: 109 link, 10 nhóm).
- [x] Category sắp theo count **giảm dần** (e2e: AI, Messaging, DevOps… đầu danh sách).
- [x] Khi count bằng nhau (Cloud/Database=4; Blockchain/Mobile/Security=3) → sắp `cat` theo alpha (build: thứ tự h2 Cloud<Database, Blockchain<Mobile<Security).
- [x] Term trong mỗi nhóm sắp theo alpha (case-insensitive) — `localeCompare` sensitivity base.
- [x] Sau filter, nhóm còn 0 term bị loại khỏi render (e2e: empty state "0 nhóm").

### Href encoding
- [x] `term` thường → href `/glossary#<term>` đúng.
- [x] `term` có ký tự đặc biệt/space (`Token / JWT` → `Token%20%2F%20JWT`, `AI Agent` → `AI%20Agent`) → `encodeURIComponent` đúng; verify decode round-trip = `Token / JWT`.

## Integration Tests
**How do we test component interactions?**

- [x] Click term ở mục lục → URL đổi sang `/glossary#<term>` và trang chi tiết mở đúng card (e2e: click "LLM" → `location = /glossary#LLM`; deep-link scroll `scrollY=4004`, `.MuiCollapse-entered` = 1, card Kafka mở + highlight + hiện related chips).
- [x] Cross-link 2 chiều: `href="/glossary/muc-luc"` trong `glossary.html`, `href="/glossary"` trong `muc-luc.html` (build); e2e điều hướng muc-luc → glossary OK.
- [x] Link là `<a>` thật (tab/Enter điều hướng được).
- [x] Ctrl/Cmd+F focus ô search (e2e: `document.activeElement` là INPUT).

## End-to-End Tests
**What user flows need validation?**

- [x] User flow 1: mở `/glossary/muc-luc` → 10 category, đếm "109 / 109" (e2e).
- [x] User flow 2: gõ "kafka" → danh sách rút gọn (17), đếm cập nhật, nhóm rỗng ẩn (e2e).
- [x] User flow 3: xóa search → khôi phục đủ 109 (e2e).
- [x] User flow 4: click "LLM" → tới `/glossary#LLM`, card mở (e2e).
- [x] Critical path: `/glossary` chi tiết vẫn hoạt động (A-Z render, deep-link) — không regression (e2e).
- [x] Regression: deep-link paste trực tiếp `/glossary#Kafka` vẫn mở đúng (e2e: scroll + collapse mở + related chips).

## Test Data
**What data do we use for testing?**

- Nguồn thật: `constants/glossary.ts` (109 term, 10 category). Không cần fixture riêng.
- Case mẫu cần chú ý: term có `/` và khoảng trắng (`Token / JWT`), nhóm nhỏ nhất (3 term), nhóm lớn nhất (AI 30).

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- `npm run lint` phải pass (bắt buộc trước commit theo CLAUDE.md).
- `npm run build` (hoặc `next build`) không lỗi TypeScript/route.
- Coverage tự động: N/A (chưa có test runner) — ghi rõ đây là khoảng trống đã biết.
- Kết quả manual test ghi lại ở checklist Manual Testing dưới, ký xác nhận trước khi merge.

## Manual Testing
**What requires human validation?**

- [x] UI/UX: bố cục section category rõ ràng, empty state hiển thị khi không khớp (screenshot desktop dark).
- [x] Theme tối đẹp, đồng nhất trang chi tiết (screenshot). [~] Theme sáng: chưa chụp (dùng chung token nên kỳ vọng OK).
- [~] Accessibility: focus ring ô search thấy được (screenshot); còn cần soát tương phản chip đầy đủ.
- [~] Responsive mobile (1 cột): chưa test viewport nhỏ (grid `auto-fill minmax(340px,1fr)` → tự về 1 cột khi hẹp).
- [ ] Smoke test sau deploy: mở `/glossary/muc-luc` trên production.

## Performance Testing
**How do we validate performance?**

- N/A quy mô lớn (109 item tĩnh). Kiểm tra chủ quan: search gõ mượt, không giật khi lọc.

## Bug Tracking
**How do we manage issues?**

- Ghi issue vào commit/PR mô tả; severity theo mức ảnh hưởng điều hướng (deep-link sai = cao).
- Regression: luôn kiểm lại trang `/glossary` chi tiết mỗi lần đổi mục lục.
