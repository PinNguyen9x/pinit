# CI/CD & GitOps — Kiến trúc triển khai dự án `pinit`

> Tài liệu mô tả **toàn bộ** hệ thống CI/CD của dự án: từng thành phần, công dụng, và một flow chạy hoàn chỉnh từ lúc `git push` đến khi lên production.

---

## 1. Tổng quan kiến trúc

```
                    ┌──────────────────────────── MÁY DEV (Mac, arm64) ────────────────────────────┐
   git push ──────► │  GitHub (SCM)                                                                 │
                    │     │  webhook ──► ngrok tunnel ──► Jenkins (localhost:8080, brew/launchd)     │
                    │     │  (fallback: Poll SCM 15')          │                                     │
                    │     │                                    ▼                                     │
                    │     │                      Build image (Docker, --platform amd64)              │
                    │     │                                    │                                     │
                    │     │                       Push ──► ghcr.io (registry, public)                │
                    │     │                                    │                                     │
                    │     │        [main] ⏸ Approval gate      │        [develop] auto               │
                    │     │                                    ▼                                     │
                    └─────┼────────────────────────── ssh + docker compose ────────────────────────┘
                          │
                          ▼
   ┌──────────────────────────── VPS Vultr (Ubuntu, amd64, 149.28.18.204) ───────────────────────────┐
   │  Nginx (reverse proxy, HTTPS Let's Encrypt)                                                       │
   │     ├── nipit.pro (:80/:443) ──► learn-nextjs (:3000)  ─┐                                          │
   │     └── (IP:3001)            ──► learn-nextjs-staging   │  webnet (Docker network nội bộ)          │
   │                                                          ├──► json-server-blog (:4000, ẩn)          │
   │                                              staging  ───┘──► json-server-blog-staging (ẩn)         │
   └──────────────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────── GitOps LAB (local, học tập) ───────────┐
   │  k3d (k3s trong Docker) + ArgoCD                   │
   │  ArgoCD theo dõi repo pinit-gitops ──► reconcile   │
   │  cụm k8s (sửa Git = tự deploy, self-heal)          │
   └────────────────────────────────────────────────────┘
```

**Hai kiểu triển khai song song:**
- **Push-based (production thật)**: Jenkins chủ động `ssh` + `docker compose` đẩy lên VPS.
- **Pull-based / GitOps (lab học tập)**: ArgoCD trong cụm k8s tự kéo manifest từ Git về đồng bộ.

---

## 2. Các thành phần & công dụng

| Thành phần | Nơi chạy | Công dụng |
|---|---|---|
| **GitHub** | cloud | SCM — lưu source. Nhánh `main` = prod, `develop` = staging. Bắn **webhook** khi push. |
| **Jenkins** | Mac (brew/launchd, `:8080`) | CI/CD server — build image, push registry, ssh deploy. Chạy local để VPS 1GB không phải gánh. |
| **ngrok** | Mac (LaunchAgent) | Tunnel cho GitHub webhook chọc vào Jenkins local (Jenkins không có IP public). URL tĩnh free. |
| **ghcr.io** | cloud | Container Registry — kho image `ghcr.io/pinnguyen9x/{learn-nextjs,json-server-blog}` (public). |
| **GitHub Actions** | cloud | Cron hàng tuần tự dọn image cũ trên ghcr (`ghcr-cleanup.yml`). |
| **Docker** | Mac (build) + VPS (run) | Đóng gói app thành image; chạy container. |
| **VPS Vultr** | cloud (amd64, 1GB) | Host production. Chạy Nginx + các container app. |
| **Nginx** | VPS | Reverse proxy `:80/:443` → container, chấm dứt TLS (HTTPS Let's Encrypt cho `nipit.pro`). |
| **webnet** | VPS (Docker network) | Mạng nội bộ để frontend gọi backend qua tên container; backend **ẩn** khỏi internet. |
| **k3d + k3s** | Mac (Docker) | Cụm Kubernetes nhẹ để học GitOps. |
| **ArgoCD** | cụm k3s | Công cụ GitOps — đồng bộ trạng thái cụm theo repo manifest, tự self-heal. |
| **pinit-gitops** | GitHub repo | Kho **manifest** khai báo trạng thái mong muốn (tách khỏi repo source). |

**App trong dự án:**
- `learn-nextjs` — frontend Next.js 15 (standalone), cổng 3000.
- `json-server-blog` — backend json-server (Express), cổng 4000. Frontend gọi qua `pages/api/*` proxy → `API_URL`.

---

## 3. Môi trường

| | **Staging** | **Production** |
|---|---|---|
| Nhánh | `develop` | `main` |
| Trigger deploy | **Tự động** (không hỏi) | Có **Approval gate** (bấm duyệt) |
| Frontend | `learn-nextjs-staging` :3001 | `learn-nextjs` :3000 → `nipit.pro` |
| Backend | `json-server-blog-staging` (ẩn) | `json-server-blog` (ẩn) |
| Thư mục VPS | `/opt/*-staging` | `/opt/*` |
| Tag image | `staging-<N>` | `prod-<N>` |

Cùng **1 Jenkinsfile branch-aware**: dựa vào `env.GIT_BRANCH` để chọn môi trường (DEPLOY_ENV/DIR/CONTAINER/PORT). Compose được tham số hóa qua biến môi trường.

---

## 4. Flow chạy hoàn chỉnh (production)

**Kịch bản: lập trình viên sửa code và đưa lên prod.**

1. **Code & push staging**
   ```bash
   git checkout develop && git commit -am "feat: ..." && git push
   ```
2. **CI kích hoạt**: GitHub bắn webhook → ngrok → Jenkins job `learn-nextjs-staging` chạy.
3. **Build**: Jenkins `docker build --platform linux/amd64 --provenance=false` (Mac arm64 → VPS amd64) → image `staging-N`.
4. **Push registry**: `docker login ghcr.io` → `docker push ghcr.io/pinnguyen9x/learn-nextjs:staging-N`.
5. **Deploy staging (auto)**: Jenkins `ssh` vào VPS → `docker compose pull && up -d` ở `/opt/learn-nextjs-staging`. Container mới lên cổng 3001.
6. **Test**: mở `http://<vps>:3001` kiểm tra.
7. **Promote lên prod**:
   ```bash
   git checkout main && git merge develop && git push
   ```
8. **CI prod chạy**: build → push `prod-N` → **DỪNG ở stage "Approve deploy to PROD"**.
9. **Duyệt**: người có quyền vào Jenkins bấm **"Deploy ngay"**.
10. **Deploy prod**: VPS pull `prod-N` → `docker compose up -d` → Nginx phục vụ bản mới tại `nipit.pro`.
11. **Dọn dẹp**: `docker image prune -af` trên VPS mỗi lần deploy; GitHub Actions dọn ghcr hàng tuần.

**Sơ đồ rút gọn:**
```
push develop → build → push ghcr(staging-N) → deploy staging (auto) → test
push main    → build → push ghcr(prod-N)    → ⏸ DUYỆT → deploy prod → nipit.pro
```

---

## 5. Flow GitOps (lab k3s + ArgoCD)

1. Sửa manifest trong repo `pinit-gitops` (vd `replicas: 1 → 3`) → `git push`.
2. ArgoCD (poll 20s) phát hiện Git đổi → **tự reconcile** cụm cho khớp.
3. Nếu ai sửa tay trên cụm (vd scale = 5) → ArgoCD phát hiện lệch → **self-heal** về đúng Git.

> Khác biệt cốt lõi: **Git là nguồn chân lý duy nhất**; cụm luôn tự khớp theo Git (điều mà push-based không có).

---

## 6. Những "bẫy" đã gặp & cách xử lý

| Vấn đề | Nguyên nhân | Cách sửa |
|---|---|---|
| `docker: command not found` (Jenkins) | launchd PATH tối giản | Thêm `/usr/local/bin` vào PATH trong Jenkinsfile |
| Next crash `getaddrinfo EAI_AGAIN <id>` | Next standalone bind vào `HOSTNAME`=container id | `ENV HOSTNAME=0.0.0.0` |
| Container "unhealthy" | healthcheck `localhost` ra IPv6 `::1` | Dùng `127.0.0.1` |
| Push ghcr lỗi `500` | buildx tạo attestation manifest | `--provenance=false` |
| Push ghcr lỗi `401 anonymous` | osxkeychain trả token không ổn định | `DOCKER_CONFIG` riêng (ghi token vào file) + retry |
| Build staging `unknown flag --provenance` | set DOCKER_CONFIG trước `docker build` → rơi về legacy builder | `docker build` chạy TRƯỚC khi set DOCKER_CONFIG |
| Đĩa VPS đầy | `prune -f` chỉ xóa image không tag | Đổi `prune -af`; GitHub Actions dọn ghcr |
| Cổng 3000 bị chiếm | app cũ chạy `next start` thủ công | Tắt process cũ, để Docker quản |

---

## 7. Cheat-sheet vận hành

```bash
# --- Promote staging → prod ---
git checkout main && git merge develop && git push    # rồi bấm "Deploy ngay" trong Jenkins

# --- VPS ---
ssh pin@<vps> 'docker ps'                              # xem container
ssh pin@<vps> 'docker image prune -af'                 # dọn image

# --- Registry ---
gh api user/packages/container/learn-nextjs/versions   # xem tag ghcr

# --- GitOps lab (Mac) ---
k3d cluster start argo | stop argo | delete argo        # bật/tắt/xóa cụm
kubectl port-forward svc/argocd-server -n argocd 8090:443   # UI ArgoCD
kubectl -n argocd get app                               # trạng thái app ArgoCD

# --- Dọn Mac ---
docker builder prune -f                                 # dọn build cache (an toàn)
brew services stop jenkins-lts                          # tắt Jenkins khi cần
```

---

## 8. So với quy trình doanh nghiệp

| Doanh nghiệp (điển hình) | Dự án này |
|---|---|
| Gerrit + Code-Review +2 | GitHub + Approval gate |
| Jenkins → Harbor/Nexus | Jenkins → **ghcr.io** |
| Môi trường dev/staging/prod | **develop→staging / main→prod** |
| ArgoCD + Kubernetes (nhiều node) | **ArgoCD + k3s** (1 node, local) |
| Artifact promotion (retag digest) | Build-per-environment *(có thể nâng cấp)* |

Khác biệt còn lại chủ yếu là **quy mô & độ bền** (always-on nhiều node), không phải khái niệm.
