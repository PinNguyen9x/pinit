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

### Filtering (`filtered`)
- [ ] Query rỗng → trả về đủ 109 term.
- [ ] Query khớp `term` (vd "kafka") → chỉ term liên quan.
- [ ] Query khớp `short`/`detail` (không có trong tên) → vẫn lọt.
- [ ] Query không khớp gì → mảng rỗng (kích hoạt empty state).
- [ ] Không phân biệt hoa/thường (case-insensitive).

### Grouping & sorting (`groups`)
- [ ] Gom đúng theo `cat`, tổng số term = 109 khi query rỗng.
- [ ] Category sắp theo count **giảm dần** (AI 30 → Messaging 25 → DevOps 17 → …).
- [ ] Khi count bằng nhau (Database/Cloud=4; Security/Mobile/Blockchain=3) → sắp `cat` theo alpha (ổn định).
- [ ] Term trong mỗi nhóm sắp theo alpha (case-insensitive).
- [ ] Sau filter, nhóm còn 0 term bị loại khỏi danh sách render.

### Href encoding
- [ ] `term` thường → href `/glossary#<term>` đúng.
- [ ] `term` có ký tự đặc biệt/space (`Token / JWT`, `C/C++`) → `encodeURIComponent` đúng, không vỡ URL.

## Integration Tests
**How do we test component interactions?**

- [ ] Click term ở mục lục → URL đổi sang `/glossary#<term>` và trang chi tiết mở đúng card (deep-link cũ chạy).
- [ ] Cross-link `/glossary` → `/glossary/muc-luc` và ngược lại điều hướng đúng.
- [ ] Điều hướng bằng bàn phím (tab tới link, Enter) hoạt động.
- [ ] Ctrl/Cmd+F focus vào ô search của trang (không mở find của trình duyệt) — nếu triển khai như trang chi tiết.

## End-to-End Tests
**What user flows need validation?**

- [ ] User flow 1: mở `/glossary/muc-luc` → thấy 10 category, đếm "109 / 109".
- [ ] User flow 2: gõ "rag" → danh sách rút gọn, đếm cập nhật, nhóm rỗng ẩn.
- [ ] User flow 3: xóa search (Clear) → khôi phục đủ 109.
- [ ] User flow 4: click "LLM" → tới `/glossary#LLM`, card mở + flash.
- [ ] Critical path: `/glossary` chi tiết vẫn hoạt động y cũ (A-Z, filter, deep-link) — không regression.
- [ ] Regression: deep-link paste trực tiếp `/glossary#Kafka` vẫn mở đúng.

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

- [ ] UI/UX: bố cục section category rõ ràng, đọc tốt; empty state hiển thị khi không khớp.
- [ ] Accessibility: tương phản chữ/nền đạt; focus ring thấy được; link có text rõ.
- [ ] Theme sáng & tối đều đẹp, đồng nhất với trang chi tiết.
- [ ] Responsive: mobile (1 cột), desktop (nhiều cột nếu dùng grid) không vỡ layout, không cuộn ngang.
- [ ] Smoke test sau deploy: mở `/glossary/muc-luc` trên production.

## Performance Testing
**How do we validate performance?**

- N/A quy mô lớn (109 item tĩnh). Kiểm tra chủ quan: search gõ mượt, không giật khi lọc.

## Bug Tracking
**How do we manage issues?**

- Ghi issue vào commit/PR mô tả; severity theo mức ảnh hưởng điều hướng (deep-link sai = cao).
- Regression: luôn kiểm lại trang `/glossary` chi tiết mỗi lần đổi mục lục.
