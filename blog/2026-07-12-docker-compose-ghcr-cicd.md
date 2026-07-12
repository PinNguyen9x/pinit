---
slug: docker-compose-ghcr-cicd
title: "Docker Compose & ghcr trong CI/CD: từ build image tới container chạy trên VPS 🐳"
description: "Giải thích dễ hiểu vai trò của docker-compose và GitHub Container Registry trong pipeline deploy của dự án: image là gì, ship lên ghcr.io ra sao, và compose dựng container trên VPS thế nào."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Docker, Docker Compose, ghcr, CI/CD, DevOps]
date: '2026-07-12T09:00:00Z'
image: https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&auto=format&fit=crop&q=80
---

Trong bài trước mình kể tổng thể pipeline CI/CD. Bài này zoom vào hai mảnh ghép làm nên phần "chạy được trên VPS": **Docker Compose** (dựng container) và **ghcr.io** (kho chứa image). Mình sẽ giải thích thật chậm, từ khái niệm gốc, để ai chưa quen Docker cũng theo được.

<!-- truncate -->

## 1. Ba khái niệm gốc: Dockerfile → Image → Container

Rất nhiều người lẫn lộn ba thứ này. Ví von cho dễ:

| Khái niệm | Là gì | Ví von |
|---|---|---|
| **Dockerfile** | Công thức: cài gì, copy gì, chạy lệnh nào | Công thức nấu ăn |
| **Image** | Sản phẩm đóng gói bất biến từ Dockerfile | Hộp cơm đã nấu, đóng gói kín |
| **Container** | Một image **đang chạy** | Hộp cơm được mở ra ăn |

Từ **một image** có thể chạy **nhiều container** giống hệt nhau — như từ một hộp cơm mẫu nhân bản ra nhiều phần. Image **bất biến** (build xong không đổi), nên "chạy được trên máy tôi" thì chạy được ở mọi nơi.

## 2. Vấn đề: build ở đâu, chạy ở đâu?

Trong dự án này:
- **Máy Mac** build image (vì VPS 1GB yếu, không build nổi Next.js).
- **VPS** chạy container.

Vậy phải có cách chuyển image từ Mac sang VPS. Có hai lối:

1. **Bắn thẳng qua SSH**: `docker save | ssh | docker load` — nén image thành file rồi gửi. Đơn giản nhưng mỗi lần gửi lại toàn bộ, tốn băng thông.
2. **Qua Registry** (cách dự án dùng): đẩy image lên một "kho" trung gian, VPS kéo về. Đây là cách chuẩn công nghiệp.

## 3. ghcr.io — cái "kho" ở giữa

**GitHub Container Registry (ghcr.io)** là kho lưu image, miễn phí, gắn liền tài khoản GitHub. Luồng:

```
Mac:  docker build ──► docker push ──► ghcr.io/pinnguyen9x/learn-nextjs:prod-14
                                            │
VPS:                        docker pull ◄──┘  ──► docker compose up
```

Lệnh cụ thể phía CI (trên Mac):

```bash
# Mac arm64 build cho VPS amd64 -> phải chỉ định platform
docker build --platform linux/amd64 --provenance=false \
  -t ghcr.io/pinnguyen9x/learn-nextjs:prod-14 .

echo "$TOKEN" | docker login ghcr.io -u pinnguyen9x --password-stdin
docker push ghcr.io/pinnguyen9x/learn-nextjs:prod-14
```

Vài điểm đáng nhớ khi "ship" lên ghcr:
- **Tag** (`prod-14`) là số phiên bản — mỗi build một tag, để biết chính xác cái gì đang chạy và rollback được.
- **`--platform linux/amd64`**: Mac là ARM, VPS là x86 — không khai báo là image chạy sai kiến trúc.
- **Image public**: đặt package public thì VPS `pull` **không cần đăng nhập** (chỉ `push` mới cần token).

## 4. Docker Compose — "bản khai báo" container

Chạy một container bằng `docker run` với cả tá cờ (`-p`, `-e`, `-v`, `--restart`...) rất dài và dễ sai. **Docker Compose** cho phép **khai báo** mọi thứ trong một file YAML, rồi chỉ cần `docker compose up`.

File `docker-compose.yml` của frontend (rút gọn, đã tham số hóa cho cả prod/staging):

```yaml
services:
  web:
    image: ${IMAGE:-ghcr.io/pinnguyen9x/learn-nextjs:latest}  # image kéo từ ghcr
    container_name: ${CONTAINER:-learn-nextjs}
    restart: unless-stopped         # tự bật lại khi crash / reboot
    ports:
      - "${HOST_PORT:-3000}:3000"    # cổng host : cổng trong container
    environment:
      - API_URL=${API_TARGET:-http://json-server-blog:4000}  # gọi backend qua tên container
      - HOSTNAME=0.0.0.0
    networks:
      - webnet                        # mạng nội bộ để frontend gặp backend
    healthcheck:                      # Docker tự kiểm tra container còn sống không
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:3000"]
      interval: 30s

networks:
  webnet:
    external: true
```

Đọc file này như đọc một tờ khai:
- **image**: kéo bản nào từ ghcr (biến `${IMAGE}` do CI truyền vào lúc deploy).
- **ports** `"3000:3000"`: map cổng 3000 của VPS vào cổng 3000 trong container.
- **restart: unless-stopped**: container chết là Docker tự dựng lại — không cần người canh.
- **networks: webnet**: cả frontend và backend cùng một mạng ảo, nên frontend gọi backend bằng **tên container** (`json-server-blog`) thay vì IP. Nhờ vậy backend **không cần mở cổng ra internet** — ẩn hoàn toàn.
- **healthcheck**: Docker định kỳ "bắt mạch" container; hỏng thì báo `unhealthy`.

## 5. Ghép lại: một lần deploy trên VPS

Sau khi image đã ở trên ghcr, phần deploy trên VPS gọn lỏn:

```bash
export IMAGE=ghcr.io/pinnguyen9x/learn-nextjs:prod-14
docker compose pull            # kéo image mới từ ghcr
docker compose up -d           # dựng/thay container theo docker-compose.yml
docker image prune -af         # dọn image cũ không dùng
```

- `pull`: lấy đúng tag CI vừa đẩy.
- `up -d`: Compose so sánh tờ khai với thực tế, container nào đổi thì tạo lại (`-d` = chạy nền).
- `prune -af`: xóa image cũ để đĩa VPS không phình.

## 6. Vì sao tách image (ghcr) khỏi cách chạy (compose)?

Điểm hay của mô hình này:
- **Image bất biến** trên ghcr = "cái gì chạy" — có phiên bản, rollback được.
- **docker-compose.yml** = "chạy như thế nào" — cổng, biến môi trường, mạng.

Hai thứ tách bạch: đổi phiên bản app chỉ là đổi **tag image**; đổi cấu hình chạy chỉ là sửa **compose**. Cùng một image `prod-14` có thể chạy ở prod (cổng 3000) hay staging (cổng 3001) chỉ bằng cách truyền biến khác — không build lại.

## 7. Kết

Docker Compose + Registry là bộ đôi biến việc deploy từ "ssh vào gõ một tràng lệnh" thành "kéo image + đọc một tờ khai". Nắm được:
- **Image** là sản phẩm bất biến, sống trên **registry** (ghcr), có tag/phiên bản.
- **Compose** là bản khai báo cách dựng container từ image đó.

...là bạn đã nắm xương sống của gần như mọi hệ thống deploy container hiện đại — dù nhỏ như VPS này hay lớn như cả một hạ tầng doanh nghiệp.
