---
title: Scheduling
tags: [k8s, scheduler]
updated: 2026-09-21
questions:
  - id: filter-then-score
    q: Scheduler chọn node qua những bước nào?
    a: Lọc (filter) các node không thoả ràng buộc, chấm điểm (score) các node còn lại, chọn node điểm cao nhất rồi bind.
  - id: taint-toleration
    q: Taint và toleration dùng để làm gì?
    a: Taint đẩy pod ra khỏi node; chỉ pod có toleration tương ứng mới được lập lịch lên đó.
---

## Filter rồi score

Scheduler chạy hai pha. `nodeSelector`, affinity và taint thuộc pha lọc.

| Cơ chế | Pha |
|---|---|
| nodeSelector | filter |
| podAffinity (preferred) | score |
