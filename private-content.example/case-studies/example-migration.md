---
title: Di chuyển batch job sang streaming
summary: Bài học khi chuyển một job đối soát chạy đêm sang pipeline streaming.
tags: [data-platform, streaming]
visibility: private
updated: 2026-08-15
questions:
  - id: measure-e2e-latency
    q: Vì sao phải đo độ trễ end-to-end trước khi tối ưu từng bước?
    a: Tối ưu một bước không nằm trên đường găng không làm dữ liệu đến sớm hơn; số end-to-end chỉ ra bước nào thật sự chiếm thời gian.
---

## Bối cảnh

Một công ty (ẩn danh) chạy job đối soát mỗi đêm, trễ dữ liệu tới 24 giờ.

## Bài học

Đo độ trễ end-to-end trước khi tối ưu từng bước.
