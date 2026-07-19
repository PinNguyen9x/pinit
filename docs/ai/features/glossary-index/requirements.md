---
phase: requirements
title: Requirements & Problem Understanding
feature: glossary-index
description: Trang mục lục thuật ngữ nhóm theo category, có tìm kiếm, link tới trang chi tiết
---

# Requirements & Problem Understanding — Glossary Index (Mục lục)

## Problem Statement
**What problem are we solving?**

- Trang `/glossary` hiện tại có 109 thuật ngữ, nhóm **theo chữ cái A-Z**, kèm search + lọc category + deep-link. Nó tốt để tra một từ cụ thể, nhưng **không cho phép nhìn tổng quan theo chủ đề** (topic/category).
- Người học theo lĩnh vực (ví dụ "cho tôi xem hết thuật ngữ AI", "nhóm Messaging có những gì") phải bật bộ lọc rồi cuộn qua các card lớn — chậm khi muốn quét nhanh cả bộ từ vựng.
- Ai bị ảnh hưởng: độc giả blog / người học đang muốn nắm bản đồ tổng thể các thuật ngữ theo nhóm, trước khi đọc chi tiết.
- Hiện trạng/workaround: dùng bộ lọc category trên `/glossary` (chỉ xem 1 nhóm một lúc, vẫn ở dạng card A-Z, không thấy toàn cảnh nhiều nhóm cùng lúc).

## Goals & Objectives
**What do we want to achieve?**

- **Primary goals**
  - Thêm trang **mục lục** mới tại `/glossary/muc-luc` nhóm thuật ngữ **theo category**, dạng danh sách gọn (compact directory).
  - Có **search** lọc trực tiếp danh sách mục lục (khớp term / short / detail); nhóm rỗng tự ẩn.
  - Mỗi thuật ngữ là **link** → điều hướng sang `/glossary#<term>` để tái dùng deep-link + hành vi mở/flash sẵn có ở trang chi tiết.
- **Secondary goals**
  - Cross-link hai chiều: `/glossary` ⇄ `/glossary/muc-luc` để người dùng chuyển qua lại.
  - Giữ nhất quán thị giác với trang chi tiết (MainLayout, BackgroundFx, Seo, theme tokens, tiếng Việt).
- **Non-goals (out of scope)**
  - Không sửa/không đổi trang `/glossary` chi tiết hiện có (ngoài việc thêm 1 link trỏ sang mục lục).
  - Không thay đổi data model `constants/glossary.ts`.
  - Không thêm anchor-jump theo category trong nội bộ trang mục lục ở v1 (có thể thêm sau).
  - Không thêm dữ liệu/thuật ngữ mới.

## User Stories & Use Cases
**How will users interact with the solution?**

- Là **người học theo chủ đề**, tôi muốn thấy tất cả thuật ngữ nhóm theo category trên một trang để nắm bản đồ tổng thể.
- Là **người tra cứu nhanh**, tôi muốn gõ từ khóa và thấy danh sách rút gọn ngay, để nhảy tới thuật ngữ cần tìm.
- Là **người đọc**, tôi muốn click một thuật ngữ ở mục lục và được đưa thẳng tới phần giải thích chi tiết (`/glossary#term`) đã mở sẵn.
- **Workflows chính**
  1. Vào `/glossary/muc-luc` → thấy các section category (sắp theo số lượng giảm dần) với danh sách tên thuật ngữ.
  2. Gõ search → danh sách lọc realtime, category rỗng ẩn đi, có đếm kết quả.
  3. Click thuật ngữ → sang `/glossary#term`, card mở + flash.
- **Edge cases**
  - Search không khớp gì → hiển thị empty state.
  - Category chỉ có 1 thuật ngữ vẫn hiển thị đúng (Security/Mobile/Blockchain = 3, Database/Cloud = 4).
  - Tên thuật ngữ có ký tự đặc biệt (`Token / JWT`, `C/C++`…) phải encode đúng khi tạo href `#term`.

## Success Criteria
**How will we know when we're done?**

- `/glossary/muc-luc` render được toàn bộ 109 thuật ngữ, nhóm đúng theo 10 category, không sót/không trùng.
- Category sắp xếp **theo count giảm dần** (AI 30 → Messaging 25 → DevOps 17 → …); thuật ngữ trong mỗi category **sắp chữ cái**.
- Search lọc đúng theo term/short/detail; số đếm "đang hiển thị X / 109" chính xác; nhóm rỗng ẩn.
- Click thuật ngữ điều hướng tới `/glossary#<term>` và trang chi tiết mở đúng card (deep-link cũ vẫn hoạt động).
- `/glossary` vẫn hoạt động y như cũ (không regression).
- `npm run lint` pass; build không lỗi TypeScript.

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical**
  - Next.js **Pages Router**: `pages/glossary.tsx` đã chiếm `/glossary`. Trang mới đặt tại `pages/glossary/muc-luc.tsx` → route `/glossary/muc-luc` (KHÔNG dùng `pages/glossary/index.tsx` vì trùng route).
  - Node local v20.18.1 < yêu cầu của `ai-devkit` (>=20.20) → CLI `docs init-feature` lỗi; docs feature này được tạo thủ công theo template phase.
  - MUI + Emotion, theme sáng/tối; tái dùng token màu như trang chi tiết.
- **Assumptions (đã user xác nhận)**
  1. Category sắp theo count desc, term alpha trong nhóm.
  2. Trang static, đọc từ `constants/glossary.ts`, không đổi data model.
  3. Tái dùng MainLayout + BackgroundFx + Seo + theme; thêm cross-link 2 chiều.
  4. UI tiếng Việt, nhất quán trang cũ.
  5. Anchor-jump theo category out-of-scope v1.
- **Convention**: Conventional Commits, mỗi commit một thay đổi logic, chạy lint trước commit, không tự push (theo CLAUDE.md).

## Questions & Open Items
**What do we still need to clarify?**

- (Đã chốt) Route: `/glossary/muc-luc`.
- (Đã chốt) Layout: mục lục gọn, link → `/glossary#term`.
- (Đã chốt) Toàn bộ named assumptions ở trên được user chấp nhận.
- Không còn open question chặn — sẵn sàng sang `dev-design`.
