# Cloudflare day-2 — các bước còn lại

> # ⚠️ Hạn chót: 27/12/2026
>
> Cert Let's Encrypt đang phục vụ `nginx :443` hết hạn ngày đó — đã đo:
> `issuer=Let's Encrypt CN=YR2`, `notAfter=Dec 27 17:05:50 2026 GMT`.
>
> Route tunnel trỏ `https://localhost:443`, nên **cert hết hạn = cloudflared không verify
> được origin = site sập.** Mà đóng cổng 80 làm HTTP-01 không gia hạn được nữa.
>
> **Bước 1 (thay cert) phải xong trước bước 2 (đóng cổng), và cả hai trước 27/12.**

Tiếp sau [docs/cloudflare.md](cloudflare.md), nơi ghi trạng thái đã chạy được từ 06/10/2026.
File này là **runbook để owner chạy tay**: mỗi bước có lệnh cụ thể, cách kiểm, và rollback.

## Hai lựa chọn đã chốt

| Việc | Chốt | Vì sao |
|---|---|---|
| Gỡ phụ thuộc cert | **Cloudflare Origin CA** | free, hạn 15 năm, chỉ thay 2 file cert + reload. Không phải mổ vhost đang chạy prod. |
| `IMAGE` cho `compose up` tay | **`/opt/learn-nextjs/.env`** | CI vẫn là nguồn tag thật (env của shell đè `.env`); dòng trong `.env` chỉ là giá trị dự phòng cho lệnh tay. |

Ba việc, **làm theo đúng thứ tự này**:

| # | Việc | Chờ |
|---|---|---|
| 0 | Thêm `IMAGE` vào `$DIR/.env` | — (làm trước cho đỡ vướng các bước sau) |
| 1 | Thay cert sang Cloudflare Origin CA | — |
| 2 | Đóng ufw 80/443 | ≥ 1 ngày sau khi bước 1 ổn |
| 3 | Staging qua `staging.nipit.pro` | độc lập, lúc nào cũng được |

Điều kiện "tunnel ổn ≥ 1 ngày" **đã thoả**: tunnel chạy liên tục từ 06/10, qua một lần
deploy prod, đo lại 09/10 vẫn phục vụ bình thường.

---

## Bước 0 — `IMAGE` vào `$DIR/.env`

Mỗi lần sửa `.env.private` rồi recreate container đều phải nhớ `IMAGE=$(docker inspect ...)`,
vì **CI không push tag `:latest`** (chỉ `prod-<n>`/`staging-<n>`). Thiếu nó compose rơi về
default `:latest` → `manifest unknown`.

```bash
cd /opt/learn-nextjs
# Lấy đúng tag đang chạy, ghi vào .env
TAG=$(docker inspect -f '{{.Config.Image}}' learn-nextjs)
echo "$TAG"                                  # ghcr.io/pinnguyen9x/learn-nextjs:prod-NN

grep -q '^IMAGE=' .env 2>/dev/null \
  && echo 'đã có IMAGE, sửa tay' \
  || printf 'IMAGE=%s\n' "$TAG" >> .env

cat .env     # phải thấy cả COMPOSE_PROFILES=tunnel và IMAGE=
```

Từ đó recreate container gọn hơn:

```bash
cd /opt/learn-nextjs && docker compose up -d --force-recreate web
```

> **Dòng `IMAGE=` trong `.env` KHÔNG phải nguồn tag của hệ thống.** `deploy.yml` export
> `IMAGE` qua ssh, và **env của shell đè `.env`**, nên mỗi lần deploy vẫn dùng tag mới
> đúng — dòng trong `.env` không cản được gì.
>
> Hệ quả phải hiểu đúng: sau vài lần deploy, dòng đó **thành cũ**. Nó chỉ là giá trị dự
> phòng cho lệnh tay. Đừng đọc `.env` để kết luận "prod đang chạy tag này" — muốn biết
> thật thì `docker inspect -f '{{.Config.Image}}' learn-nextjs`.
>
> Cố ý **không** cho CI ghi tag vào `$DIR/.env`: `deploy.yml` hiện không đụng file đó, và
> chính tính chất ấy đang bảo vệ `COMPOSE_PROFILES=tunnel` khỏi bị CI làm mất.

**Rollback 0:** xoá dòng `IMAGE=` khỏi `/opt/learn-nextjs/.env`. Không ảnh hưởng deploy.

---

## Bước 1 — Thay cert sang Cloudflare Origin CA

Origin CA: free, hạn 15 năm, **chỉ Cloudflare tin** — đủ, vì sau khi đóng cổng thì chỉ
cloudflared kết nối tới nginx.

### 1a. Tạo cert trên dashboard

*SSL/TLS → Origin Server → Create Certificate* → giữ mặc định (RSA 2048, hostname
`nipit.pro` + `*.nipit.pro`, 15 năm) → *Create*.

Trang hiện **hai khối text**: *Origin Certificate* và *Private Key*. Copy cả hai ngay —
**private key chỉ hiện một lần**, đóng trang là mất.

### 1b. Đặt cert lên VPS

```bash
# Chỗ đặt cert mới, KHÔNG ghi đè cert LE (để còn đường lùi)
sudo mkdir -p /etc/ssl/cloudflare && sudo chmod 700 /etc/ssl/cloudflare

# Dán Origin Certificate, kết thúc bằng Ctrl-D
sudo tee /etc/ssl/cloudflare/nipit.pro.pem > /dev/null
# Dán Private Key, Ctrl-D
sudo tee /etc/ssl/cloudflare/nipit.pro.key > /dev/null
sudo chmod 600 /etc/ssl/cloudflare/nipit.pro.key
```

```bash
# Kiểm cert đọc được, đúng hạn 15 năm, issuer là Cloudflare
sudo openssl x509 -in /etc/ssl/cloudflare/nipit.pro.pem -noout -subject -issuer -enddate

# Kiểm key KHỚP cert — hai hash phải GIỐNG nhau
sudo openssl x509 -in /etc/ssl/cloudflare/nipit.pro.pem -noout -modulus | openssl md5
sudo openssl rsa  -in /etc/ssl/cloudflare/nipit.pro.key -noout -modulus | openssl md5
```

Bước kiểm key/cert khớp là bước **đừng bỏ**: dán lệch thì `nginx -t` vẫn pass ở một số bản,
rồi nginx fail lúc handshake — triệu chứng là site sập, không phải lỗi config.

### 1c. Trỏ vhost sang cert mới

Sửa vhost `nipit.pro` (`/etc/nginx/sites-available/`), đổi **đúng hai dòng**:

```nginx
    ssl_certificate     /etc/ssl/cloudflare/nipit.pro.pem;
    ssl_certificate_key /etc/ssl/cloudflare/nipit.pro.key;
```

Giữ nguyên mọi thứ khác — **nhất là ba dòng `proxy_set_header`** và `include` snippet real_ip.

```bash
sudo nginx -t && sudo systemctl reload nginx

# Từ chính VPS: phải thấy issuer Cloudflare, hạn 15 năm
echo | openssl s_client -connect 127.0.0.1:443 -servername nipit.pro 2>/dev/null \
  | openssl x509 -noout -issuer -enddate

curl -fsS http://127.0.0.1:20241/ready && echo    # tunnel vẫn ready
docker logs cloudflared --since 5m 2>&1 | grep -iE 'ERR|error'   # phải rỗng
```

### 1d. Kiểm từ ngoài — gồm bước "cert invalid là đúng"

```bash
# Site qua Cloudflare: PHẢI vẫn 200
curl -sSI --max-time 15 https://nipit.pro | head -1
curl -sSI --max-time 15 https://nipit.pro/me | head -1      # 302 về Access
```

```bash
# Vào THẲNG origin, bỏ qua Cloudflare. PHẢI FAIL vì cert.
curl -sS --max-time 10 --resolve nipit.pro:443:<IP-VPS> https://nipit.pro/ ; echo "exit=$?"
```

| Lúc nào | Kết quả mong đợi |
|---|---|
| **Trước** bước 1 (cert LE) | `status=200`, `exit=0` — cert LE được tin công khai nên origin lộ ra như một site thật *(đã đo 09/10)* |
| **Sau** bước 1 (Origin CA) | **fail**, `exit=60` — `SSL certificate problem: unable to get local issuer certificate` |

> **`exit=60` ở đây là ĐÚNG KỲ VỌNG, không phải lỗi.** Origin CA chỉ được Cloudflare tin,
> không nằm trong CA store của hệ điều hành. Đây là bằng chứng cert mới đã vào và origin
> không còn phục vụ một cert công khai nào.
>
> Một số bản curl trả `35` hoặc `51` thay vì `60` — miễn là **khác 0** và thông báo nói về
> certificate thì đạt. Thêm `-k` phải trả lại `200`: đó là cách phân biệt "cert không được
> tin" (đúng) với "nginx chết" (sai).

```bash
# Phân biệt hai ca: -k bỏ qua verify, phải 200
curl -sS --max-time 10 -k -o /dev/null -w 'status=%{http_code}\n' \
  --resolve nipit.pro:443:<IP-VPS> https://nipit.pro/
```

Lưu ý: `curl https://<IP-VPS>/` (không `--resolve`) **đã fail từ trước** do hostname
mismatch, kể cả với cert LE — nên phép thử đó không phân biệt được gì. Phải dùng `--resolve`.

### 1e. Tắt certbot renewal

Chỉ làm sau khi site chạy bằng cert mới được **≥ 1 giờ** và 1d đã đạt hết.

```bash
sudo systemctl disable --now certbot.timer
systemctl list-timers | grep -i certbot      # phải rỗng
```

Cố ý `disable` chứ không `apt purge`: giữ cert LE và certbot lại làm đường lùi.

**Rollback 1:** đổi hai dòng `ssl_certificate*` về `/etc/letsencrypt/live/nipit.pro/`,
`sudo nginx -t && sudo systemctl reload nginx`, rồi
`sudo systemctl enable --now certbot.timer`. Cert LE vẫn còn hạn tới 27/12/2026.

### Vì sao KHÔNG chọn plain HTTP `:80`

Thiết kế ban đầu định đổi route tunnel sang `http://localhost:80` và bỏ TLS nội bộ hẳn.
Đã đo và loại, vì `nginx :80` với `Host: nipit.pro` **đang trả 301 về HTTPS**:

```
$ curl -sSI -H 'Host: nipit.pro' http://<IP-VPS>/
HTTP/1.1 301 Moved Permanently
Location: https://nipit.pro/
```

Đổi route mà chưa sửa vhost thì thành vòng lặp:

```
CF edge → tunnel → nginx:80 → 301 https://nipit.pro → CF edge → tunnel → nginx:80 → …
```

Làm đúng được, nhưng phải thêm một server block riêng trên `127.0.0.1:8080` (để không đụng
block `:80` đang phục vụ traffic public) và đặt cứng `X-Forwarded-Proto https`. Đổi lại
chẳng được gì hơn Origin CA — cả hai đều bỏ được certbot. Nên chọn đường ít sửa hơn.

`curl http://<IP-VPS>/` (Host là IP) trả `200` vì khớp vhost catch-all — **đừng lấy phép
thử đó làm bằng chứng rằng `:80` phục vụ app.**

---

## Bước 2 — Đóng ufw 80/443

**Điều kiện vào bước này** — tick hết:

- [ ] Bước 1 xong, site chạy bằng cert Origin CA **≥ 1 ngày**
- [ ] `1d` đạt: qua Cloudflare `200`, vào thẳng origin fail vì cert
- [ ] `docker logs cloudflared --since 24h 2>&1 | grep -iE 'ERR|error'` → rỗng
- [ ] `curl -fsS http://127.0.0.1:20241/ready` trên VPS → OK
- [ ] DNS không còn A record nào trỏ IP VPS
- [ ] **ssh (22) vẫn mở** — đường duy nhất còn lại để sửa nếu sai

```bash
sudo ufw status numbered      # xem trước, để biết xoá đúng dòng nào
```

```bash
# Xoá theo tên rule, không theo số: số thay đổi sau mỗi lần xoá
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
sudo ufw status               # còn 22/tcp. KHÔNG xoá dòng này.
```

Còn dòng `80`/`443` dạng `(v6)` thì xoá tiếp bản v6 tương ứng.

**Kiểm ngay sau khi đóng** (từ máy ngoài, không phải từ VPS):

```bash
# Phải timeout / refused — khác hẳn ca "cert invalid" ở bước 1d
curl -sS --max-time 8 -k --resolve nipit.pro:443:<IP-VPS> https://nipit.pro/ ; echo "exit=$?"
curl -sS --max-time 8 http://<IP-VPS>/ ; echo "exit=$?"

# Phải vẫn sống
curl -sSI --max-time 15 https://nipit.pro    | head -1      # 200
curl -sSI --max-time 15 https://nipit.pro/me | head -1      # 302
```

Phân biệt hai trạng thái, đừng lẫn:

| Triệu chứng | Nghĩa |
|---|---|
| `exit=60` + nói về certificate | cổng **còn mở**, chỉ là cert không được tin (sau bước 1) |
| `exit=28` timeout, hoặc `exit=7` refused | cổng **đã đóng** (sau bước 2) ✓ |

> **Cổng 3001 của staging KHÔNG bị ufw chặn.** Docker publish port bằng cách ghi iptables
> vào chain `DOCKER`, **đi vòng qua ufw**. Nên sau bước này `http://<IP-VPS>:3001` **vẫn
> vào được** — không phải lỗi, đóng nó là việc của bước 3.

**Rollback 2:**

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Vẫn không vào được site thì vấn đề không phải ufw — tạo lại A record `nipit.pro` → IP VPS
(proxied) để bỏ qua tunnel hoàn toàn. Lưu ý sau bước 1, A record + Origin CA cần SSL mode
**Full (strict)** vẫn hoạt động (Cloudflare tin Origin CA), nên đường lùi này còn dùng được.

---

## Bước 3 — Staging qua `staging.nipit.pro`

Thứ tự ở đây quan trọng: **flip `BIND_ADDR` là bước CUỐI.** Làm sớm là mất hẳn đường vào
staging, vì `:3001` đang là đường duy nhất.

### 3a. Published application route

*Networks → Tunnels → `pinit-vps` → Published application routes → Add*:

| Hostname | Service |
|---|---|
| `staging.nipit.pro` | `HTTP` → `localhost:3001` |

Cloudflare tự tạo CNAME `staging` → tunnel.

`HTTP` không `HTTPS`: container staging bind thẳng `:3001`, không qua nginx, không có TLS.

### 3b. Access cho toàn bộ staging

*Zero Trust → Access → Applications → Add → Self-hosted*:

| Mục | Giá trị |
|---|---|
| Tên | `pinit-staging` |
| Destination | `staging.nipit.pro` — **không có path** |
| Policy | *Allow*, Emails = owner |
| Login method | One-time PIN |

Không đặt path: che **toàn bộ** hostname. Staging không có `.env.private` nên `/me` vẫn 404;
Access ở đây là để staging không còn phơi ra internet, không phải để mở `/me`.

**Kiểm trước khi sang 3c:**

```bash
curl -sSI --max-time 15 https://staging.nipit.pro | head -1    # 302 về Access
```

Và mở trình duyệt, qua OTP, thấy được trang staging. **Chưa vào được thì DỪNG** — làm 3c
lúc đó là mất cả hai đường.

### 3c. Đóng `:3001` công khai

Đây là **thay đổi trong repo**, cần PR:

```diff
--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
             DIR=/opt/learn-nextjs-staging; CON=learn-nextjs-staging; PORT=3001; API=http://json-server-blog-staging:4000
-            BIND=0.0.0.0; LOG_MODE=ro
+            BIND=127.0.0.1; LOG_MODE=ro
```

Merge rồi deploy `develop`. Sau đó container chỉ nghe `127.0.0.1:3001`, cloudflared
(`network_mode: host`) vẫn tới được, còn internet thì không.

```bash
curl -sS --max-time 8 http://<IP-VPS>:3001/ ; echo "exit=$?"        # timeout/refused
curl -sSI --max-time 15 https://staging.nipit.pro | head -1         # 302 Access
```

**Rollback 3c:** đổi lại `BIND=0.0.0.0`, deploy `develop`.

---

## Nghiệm thu sau mỗi bước

Chạy từ máy ngoài sau **mỗi** bước. Dòng nào lệch thì rollback bước vừa làm, đừng đi tiếp.

```bash
# 1. apex còn sống
curl -sSI --max-time 15 https://nipit.pro | head -1                      # HTTP/2 200

# 2. cache static — PHẢI dùng GET, curl -I (HEAD) luôn trả MISS
A=$(curl -sS https://nipit.pro | grep -oE '/_next/static/[^"]+\.js' | head -1)
curl -sS -o /dev/null -D - "https://nipit.pro$A" | grep -i cf-cache-status   # HIT (lần 2+)

# 3. /me vẫn bị Access che
curl -sSI --max-time 15 https://nipit.pro/me | grep -iE '^HTTP|cloudflareaccess' | head -2
#   -> 302 + location chứa lively-sunset-c9b0.cloudflareaccess.com
#   -> thấy 307 /me/login  = lớp Access ở edge đã mất
#   -> thấy 403            = env CF_ACCESS_* nửa vời, sẽ tự khoá mình

# 4. /api/me cũng bị che
curl -sSI --max-time 15 https://nipit.pro/api/me/practice/generate | head -1   # 302

# 5. www redirect
curl -sSI --max-time 15 https://www.nipit.pro | grep -i '^location'      # https://nipit.pro/
```

Hai thứ **chỉ kiểm được bằng tay**, và đừng bỏ:

- **`/me/practice` một lượt thật**: *Sinh 5 câu hỏi* + *Chấm* một câu, rồi
  `sudo wc -l /srv/pinit-private/practice-log/practice-log.jsonl` phải **tăng 6 dòng**.
- **real_ip có tác dụng thật**: 6 lần sai passphrase từ máy A, rồi thử máy B. Máy B phải
  **vẫn đăng nhập được**. Bị khoá luôn ⇒ snippet real_ip không áp dụng, và rate limit đang
  gộp mọi khách vào một bucket. Lỗi này không có log, không có triệu chứng nào khác.

---

## Nếu site sập, theo thứ tự này

| # | Nghi vấn | Kiểm | Chữa |
|---|---|---|---|
| 1 | tunnel chết | `docker ps \| grep cloudflared`, `curl -fsS http://127.0.0.1:20241/ready` | `cd /opt/learn-nextjs && docker compose up -d cloudflared` |
| 2 | cert origin sai / key lệch | `echo \| openssl s_client -connect 127.0.0.1:443 -servername nipit.pro 2>/dev/null \| openssl x509 -noout -issuer -enddate` | rollback bước 1 (về cert LE) |
| 3 | nginx không chạy | `sudo systemctl status nginx`, `sudo nginx -t` | sửa config, `systemctl reload nginx` |
| 4 | app chết | `docker logs learn-nextjs --tail 50` | xem `[me]` / `[cf-access]` trong log |
| 5 | mọi cách trên đều không ra | — | mở lại ufw 80/443 **và** tạo A record → bỏ qua tunnel hoàn toàn |

Dòng 5 là đường lùi cuối. Nó còn dùng được miễn là cert origin hợp lệ — sau bước 1 là Origin
CA (15 năm), trước bước 1 là LE (27/12/2026).

## Việc nhỏ còn lại

- [x] Pin `cloudflared:2026.10.0` trong `docker-compose.yml` — xong, có hiệu lực từ lần
      deploy `main` tiếp theo
- [ ] Bật **HSTS** (free) — chỉ bật khi đã chắc mọi thứ chạy HTTPS; nó có thời hạn cam kết
      và trình duyệt đã nhớ thì không rút lại ngay được
- [ ] Chạy lại `scripts/cloudflare-realip.sh` định kỳ (dải IP Cloudflare đổi theo thời gian).
      Nhớ `scp` script từ máy owner — `scripts/` không có trên VPS
