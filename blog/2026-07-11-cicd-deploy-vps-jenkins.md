---
slug: cicd-deploy-vps-jenkins-ghcr
title: "Từ git push đến production: dựng CI/CD cho project với Jenkins + Docker + ghcr 🚀"
description: "Nhật ký dựng pipeline CI/CD thực chiến cho chính blog này: Jenkins build image, đẩy lên ghcr.io, deploy staging tự động và production có cổng duyệt — cùng những cái bẫy đã vấp và cách xử lý."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [DevOps, CI/CD, Jenkins, Docker, Deployment]
date: '2026-07-11T10:00:00Z'
image: https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80
---

Có một khoảng cách rất lớn giữa "app chạy được trên máy mình" và "app chạy ổn định trên production, tự động deploy mỗi khi push code". Bài này mình ghi lại toàn bộ hành trình dựng CI/CD cho chính project này — từ con số 0 (một VPS trắng, deploy thủ công) tới một pipeline hoàn chỉnh: **push code → tự build → tự deploy staging → duyệt → lên production**.

Không lý thuyết suông — mình kể cả những chỗ vấp thật và cách gỡ, vì đó mới là phần đáng giá.

<!-- truncate -->

## 1. Bối cảnh & mục tiêu

Project gồm 2 phần:
- **Frontend**: Next.js 15 (blog bạn đang đọc).
- **Backend**: một json-server nhỏ cấp API.

Ban đầu mình deploy kiểu "cắm cơm": ssh vào VPS, `git pull`, `npm build`, `next start`. Mỗi lần đổi code là lặp lại toàn bộ, hay quên bước, và app chết là không ai biết. Mục tiêu đặt ra:

- **Push là tự deploy** — không đụng tay vào server.
- **Tách staging / production** — test trước khi lên thật.
- **Có cổng duyệt cho prod** — không để code chưa kiểm tra tự nhảy lên production.
- **Nhẹ** — VPS chỉ 1GB RAM, không gánh nổi cả Jenkins lẫn build.

## 2. Chọn kiến trúc: Jenkins chạy ở đâu?

Quyết định đầu tiên và quan trọng nhất: **Jenkins chạy trên máy dev (Mac), không phải trên VPS.** Lý do: build một Next.js image ngốn 1–2GB RAM, VPS 1GB sẽ chết ngộp. Nên phân vai:

- **Máy Mac** = "xưởng build": Jenkins build image rồi đẩy đi.
- **VPS** = chỉ chạy container + Nginx, không build gì cả.

```
Mac (Jenkins build) ──push image──► Registry ──pull──► VPS (chạy container)
```

Một hệ quả thú vị: Mac là ARM64, VPS là x86_64. Nên mọi lệnh build đều phải `--platform linux/amd64`, nếu không image sẽ không chạy được trên VPS.

## 3. Đường đi của một image: từ build tới chạy

Thay vì `docker save | ssh | docker load` (nén image rồi bắn qua SSH mỗi lần — tốn băng thông), mình dùng **Container Registry** — cụ thể là **ghcr.io** (GitHub Container Registry, miễn phí):

```
docker build --platform linux/amd64 --provenance=false -t ghcr.io/<user>/app:tag .
docker push ghcr.io/<user>/app:tag        # Jenkins đẩy lên
# trên VPS:
docker compose pull && docker compose up -d   # kéo về & chạy
```

Đây đúng là cách các công ty làm với Harbor/Nexus — chỉ khác là ghcr free và không phải tự dựng.

## 4. Staging & Production: một Jenkinsfile, hai môi trường

Chìa khóa để tách môi trường mà không nhân đôi code: **Jenkinsfile "branch-aware"** — tự nhận biết đang build nhánh nào:

```groovy
def br = (env.GIT_BRANCH ?: '').replaceAll('^origin/', '')
if (br == 'develop') {
  env.DEPLOY_ENV = 'staging'      // container riêng, cổng 3001, deploy tự động
} else {
  env.DEPLOY_ENV = 'prod'         // nipit.pro, có cổng duyệt
}
env.IMAGE_TAG = "${env.DEPLOY_ENV}-${env.BUILD_NUMBER}"   // staging-N / prod-N
```

Và cổng duyệt cho production chỉ là một stage `input`:

```groovy
stage('Approve deploy to PROD') {
  when { environment name: 'DEPLOY_ENV', value: 'prod' }   // staging bỏ qua
  steps {
    timeout(time: 30, unit: 'MINUTES') {
      input message: 'Deploy lên PROD?', ok: 'Deploy ngay'
    }
  }
}
```

Đây chính là bản "bình dân" của mô hình công ty: staging chạy thoải mái, prod phải có người bấm nút chịu trách nhiệm.

## 5. Toàn cảnh một lần deploy

```
git push develop → build → push ghcr(staging-N) → deploy staging TỰ ĐỘNG → test :3001
git merge develop → main → build → push ghcr(prod-N) → ⏸ DUYỆT → deploy → nipit.pro
```

Trên VPS, frontend gọi backend qua **Docker network nội bộ** (`http://json-server-blog:4000`) chứ không qua IP public — nhờ vậy backend **ẩn hoàn toàn** khỏi internet, chỉ truy cập được qua proxy của Next.js. Nginx đứng trước cùng, chấm dứt HTTPS cho `nipit.pro`.

## 6. Real-time deploy: webhook & giới hạn

Để "push là chạy ngay" thay vì chờ Jenkins hỏi thăm định kỳ, mình dùng **webhook**: GitHub gọi thẳng vào Jenkins mỗi lần push. Nhưng Jenkins chạy local (`localhost:8080`) — internet không với tới được. Giải pháp: **ngrok** tạo một đường hầm public → Jenkins local.

Kèm theo là bài học: **Poll SCM vẫn phải giữ làm lưới an toàn.** Vì webhook chỉ hoạt động khi laptop bật + tunnel sống; khi máy ngủ, Poll SCM (15 phút/lần) vẫn bắt được thay đổi khi máy bật lại.

## 7. Những cái bẫy đã vấp (phần đáng giá nhất)

| Triệu chứng | Thủ phạm | Cách sửa |
|---|---|---|
| `docker: command not found` | Jenkins (launchd) có PATH tối giản | thêm `/usr/local/bin` vào PATH |
| App crash `getaddrinfo EAI_AGAIN` | Next standalone bind vào tên container | `ENV HOSTNAME=0.0.0.0` |
| Container báo `unhealthy` | healthcheck `localhost` → IPv6 `::1` | đổi sang `127.0.0.1` |
| Push ghcr lỗi `500` | buildx sinh attestation manifest | `--provenance=false` |
| Push ghcr lỗi `401` | osxkeychain trả token chập chờn | dùng `DOCKER_CONFIG` riêng + retry |
| Đĩa VPS đầy dần | `prune -f` không xóa image có tag | đổi `prune -af` |

Mỗi dòng ở trên là một buổi tối debug. Ghi lại để lần sau (và để bạn) đỡ mất thời gian.

## 8. Dọn dẹp tự động

Registry và đĩa sẽ phình theo thời gian nếu không dọn:
- **VPS**: mỗi lần deploy tự `docker image prune -af` — chỉ giữ image đang chạy.
- **ghcr**: một **GitHub Actions** chạy cron hàng tuần, xóa bản untagged và chỉ giữ 10 tag mới nhất.

## 9. Kết

Từ "ssh vào gõ tay" tới một pipeline có staging, có cổng duyệt, tự dọn dẹp — điều mình rút ra không phải là công cụ nào xịn nhất, mà là **hiểu rõ từng mắt xích làm gì và vì sao**. Khi đó, dù là Jenkins + ghcr + VPS hay Gerrit + Harbor + ArgoCD ở công ty, bản chất vẫn là một mạch: **quản lý code → build artifact → deploy có kiểm soát**.

Nếu bạn đang deploy thủ công, hãy thử tự động hóa từng bước một. Không cần hoàn hảo ngay — chỉ cần mỗi lần bớt được một thao tác tay là đã tiến một bước.
