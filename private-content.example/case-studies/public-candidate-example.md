---
title: Giảm chi phí gọi LLM bằng cache ngữ nghĩa
summary: Ví dụ một case study sắp promote lên blog — vẫn còn sót một tên nội bộ.
tags: [ai-platform, cost]
visibility: public-candidate
updated: 2026-09-30
---

## Bối cảnh

Đội Project Falcon gọi cùng một prompt hàng nghìn lần mỗi ngày.

## Cách làm

Cache theo embedding của prompt, ngưỡng tương đồng 0.95.

> Câu "Project Falcon" ở trên cố tình để lại: chạy `npm run check:denylist` với
> `denylist.example` sẽ bắt được nó — đó là việc denylist phải làm trước khi promote.
