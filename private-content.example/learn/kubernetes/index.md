---
title: Kubernetes
tags: [k8s, infra]
updated: 2026-09-20
questions:
  - q: Pod khác container ở điểm nào?
    a: Pod là đơn vị lập lịch nhỏ nhất, gồm một hay nhiều container chia sẻ network namespace và volume.
---

Tổng quan topic. Các note con nằm cùng thư mục.

```mermaid
flowchart LR
  user[kubectl] --> api[API server]
  api --> sched[Scheduler]
  api --> etcd[(etcd)]
  sched --> node[Kubelet]
```
