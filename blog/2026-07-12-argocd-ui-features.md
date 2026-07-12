---
slug: argocd-ui-features
title: "Đọc hiểu giao diện ArgoCD: Sync, Health, Diff, Rollback và cây tài nguyên 🐙"
description: "Hướng dẫn từng khu vực trong UI của ArgoCD: danh sách Application, cây tài nguyên, trạng thái Synced/OutOfSync và Healthy/Degraded, nút Sync/Refresh, xem Diff Git↔cụm, và rollback qua History."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [ArgoCD, GitOps, Kubernetes, DevOps, CI/CD]
date: '2026-07-12T10:00:00Z'
image: https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80
---

ArgoCD là công cụ GitOps: nó theo dõi một repo chứa manifest Kubernetes và tự đồng bộ cụm cho khớp. Nhưng sức mạnh thật sự nằm ở **giao diện trực quan** — nơi bạn thấy được "Git nói gì" vs "cụm đang chạy gì", và can thiệp bằng vài cú click. Bài này mình đi qua từng khu vực trong UI để bạn không còn nhìn nó như một mớ hộp xanh đỏ khó hiểu.

<!-- truncate -->

## 1. Hai trạng thái cốt lõi: Sync & Health

Trước khi nói UI, phải hiểu hai "chỉ số sinh tồn" mà ArgoCD gắn cho mọi thứ:

**Sync Status** — cụm có KHỚP với Git không?
- 🟢 **Synced**: trạng thái thật của cụm = đúng như manifest trong Git.
- 🟡 **OutOfSync**: có lệch — Git đổi mà cụm chưa cập nhật (hoặc ai đó sửa tay trên cụm).

**Health Status** — thứ đang chạy có KHỎE không?
- 💚 **Healthy**: pod chạy ổn, service sẵn sàng.
- 💛 **Progressing**: đang khởi động/cập nhật.
- ❤️ **Degraded**: lỗi (pod crash, image sai...).
- 🩶 **Missing**: chưa được tạo.

Nhớ: **Sync ≠ Health**. Một app có thể *Synced* (đúng Git) nhưng *Degraded* (Git khai một image lỗi). Hoặc *Healthy* nhưng *OutOfSync* (đang chạy tốt nhưng Git vừa đổi, chưa áp).

## 2. Màn hình Applications (trang chủ)

Sau khi đăng nhập, bạn thấy các **thẻ Application** — mỗi thẻ là một "ứng dụng" ArgoCD quản (vd `pinit`, `web`). Mỗi thẻ hiển thị:
- Tên app, cụm đích, namespace.
- Hai nhãn **Sync** và **Health** (màu như trên).
- Repo Git nguồn và đường dẫn manifest.

Đây là chỗ nhìn tổng quan "mọi thứ có xanh hết không". Click vào một thẻ để đi sâu.

## 3. Cây tài nguyên (Resource Tree) — trái tim của UI

Vào trong một app, bạn thấy một **sơ đồ cây**: từ `Application` tỏa ra `Deployment` → `ReplicaSet` → `Pod`, cùng `Service`, `Ingress`... Đây là **toàn bộ tài nguyên Kubernetes** mà manifest sinh ra, vẽ theo quan hệ cha–con.

Mỗi node trong cây có:
- **Viền màu** = Health (xanh/vàng/đỏ).
- **Icon mũi tên** = Sync.
- Click vào node → panel chi tiết: **YAML** thực tế trên cụm, **Events**, **Logs** (với pod), và nút thao tác (Delete, Restart...).

Nhìn cây này bạn thấy ngay: pod nào đỏ, service nào chưa có endpoint, deployment nào đang progressing — thay vì gõ hàng loạt lệnh `kubectl get`.

## 4. Các nút hành động chính

Trên thanh đầu app:

| Nút | Làm gì |
|---|---|
| **Refresh** | Bảo ArgoCD **đọc lại Git ngay** (thay vì chờ chu kỳ poll). Có "Hard Refresh" bỏ qua cache. |
| **Sync** | **Áp Git xuống cụm ngay** — dùng khi để chế độ manual, hoặc muốn deploy tức thì. |
| **App Diff** | Xem **khác biệt giữa Git và cụm** (OutOfSync ở chỗ nào) — như `git diff` nhưng cho hạ tầng. |
| **History and Rollback** | Danh sách các lần sync đã qua; bấm một mốc cũ để **rollback**. |
| **Delete** | Xóa app (và tùy chọn xóa luôn tài nguyên trên cụm). |

## 5. Diff — "Git nói gì vs cụm đang gì"

Khi app **OutOfSync**, mở **App Diff** để xem chính xác chỗ lệch: bên trái là manifest mong muốn (Git), bên phải là trạng thái thật (cụm), tô đậm dòng khác nhau. Ví dụ Git ghi `image: ...:gitops-2` mà cụm còn `gitops-1` → Diff chỉ rõ dòng đó. Cực hữu ích để hiểu "vì sao nó bảo lệch".

## 6. Sync Policy — tự động hay thủ công

Trong **App Details → Sync Policy**:
- **Manual**: bạn phải bấm **Sync** mới deploy (giống một cổng duyệt).
- **Automated**: ArgoCD tự sync khi Git đổi. Kèm 2 tùy chọn:
  - **Prune**: xóa tài nguyên đã bị bỏ khỏi Git.
  - **Self-Heal**: ai sửa tay trên cụm → ArgoCD **tự kéo về đúng Git**.

Đây là chỗ quyết định app "tự lái" hay "chờ người bấm".

## 7. History & Rollback — sức mạnh thật của GitOps

Vào **History**: mỗi lần sync là một dòng, kèm **commit Git** tương ứng. Muốn quay lại bản cũ? Bấm mốc đó → **Rollback** → ArgoCD deploy lại đúng trạng thái lúc ấy. Vì mọi thay đổi đều gắn với commit, rollback nhanh và không mơ hồ — khác hẳn việc phải nhớ "hôm qua mình deploy tag nào".

## 8. Xem log & debug ngay trong UI

Click một **Pod** trong cây → tab **Logs**: xem log real-time không cần `kubectl logs`. Tab **Events** cho biết vì sao pod pending/crash (thiếu image, hết tài nguyên...). Với người mới học Kubernetes, đây là cách debug trực quan hơn nhiều so với dòng lệnh.

## 9. Kết

Giao diện ArgoCD gói gọn triết lý GitOps thành thứ nhìn-là-hiểu:
- **Sync** trả lời "cụm có giống Git không", **Health** trả lời "nó có khỏe không".
- **Cây tài nguyên** cho thấy toàn cảnh; **Diff** chỉ ra chỗ lệch; **History/Rollback** cho phép lùi an toàn.

Lần tới khi mở ArgoCD, đừng nhìn nó như bảng đèn xanh đỏ bí ẩn — hãy đọc nó như một tấm bản đồ: Git là bản thiết kế, cụm là công trình thật, và ArgoCD liên tục so hai bên rồi nắn công trình cho khớp thiết kế.
