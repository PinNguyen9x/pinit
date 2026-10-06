# Cloudflare day-2 — các bước còn lại

Tiếp sau [docs/cloudflare.md](cloudflare.md), nơi ghi trạng thái đã chạy được từ 06/10/2026.
File này là **runbook để owner chạy tay**: mỗi bước có lệnh cụ thể, cách kiểm, và rollback.

Ba việc, **làm theo đúng thứ tự này**:

| # | Việc | Vì sao thứ tự đó | Chờ |
|---|---|---|---|
| 1 | Gỡ phụ thuộc cert | làm **trước** khi đóng cổng, nếu không là tự tạo bom hẹn giờ | — |
| 2 | Đóng ufw 80/443 | cần tunnel đã ổn qua một đêm | ≥ 1 ngày sau 06/10 |
| 3 | Staging qua `staging.nipit.pro` | độc lập, làm lúc nào cũng được | — |

> ⚠️ **Hạn chót 27/12/2026.** Cert Let's Encrypt đang phục vụ `nginx :443` hết hạn ngày đó
> (đã đo: `issuer=Let's Encrypt CN=YR2`, `notAfter=Dec 27 17:05:50 2026 GMT`). Route tunnel
> hiện trỏ `https://localhost:443`, nên **cert hết hạn = cloudflared không verify được
> origin = site sập**. Đóng cổng 80 làm HTTP-01 không gia hạn được nữa. Vì vậy bước 1 phải
> xong trước bước 2, và cả hai phải xong trước 27/12.

---

## Bước 1 — Gỡ phụ thuộc cert

Hai đường. **Đề xuất B** vì ít rủi ro hơn hẳn, lý do đo được ở ngay dưới.

| | A. Plain HTTP :80 | B. Cloudflare Origin CA |
|---|---|---|
| Làm gì | sửa vhost cho `:80` phục vụ app, đổi route tunnel sang `http://localhost:80`, bỏ TLS | giữ nguyên route `https://localhost:443`, chỉ **thay cert** bằng Origin CA 15 năm |
| Phải sửa vhost prod | **có** | không |
| Rủi ro đã đo | **vòng lặp redirect** (xem dưới) | thấp — chỉ thay 2 file cert + reload |
| Bỏ được certbot | có | có |
| Khớp thiết kế ban đầu | có | không (nhưng kết quả tương đương về bảo mật) |

### Vì sao A rủi ro: đã đo được vòng lặp

`nginx :80` với `Host: nipit.pro` **đang trả 301 về HTTPS**:

```
$ curl -sSI -H 'Host: nipit.pro' http://<IP-VPS>/
HTTP/1.1 301 Moved Permanently
Location: https://nipit.pro/
```

Nếu đổi route tunnel sang `http://localhost:80` mà chưa sửa vhost thì:

```
CF edge → tunnel → nginx:80 → 301 https://nipit.pro → CF edge → tunnel → nginx:80 → 301 → …
```

Trình duyệt báo `ERR_TOO_MANY_REDIRECTS`, và Cloudflare "Always Use HTTPS" làm vòng lặp
chặt hơn chứ không cứu được. Lưu ý `curl http://<IP-VPS>/` (Host là IP) trả `200` vì khớp
vhost catch-all — **đừng lấy phép thử đó làm bằng chứng rằng `:80` phục vụ app**.

### B. Cloudflare Origin CA (đề xuất)

Origin CA: free, hạn 15 năm, **chỉ Cloudflare tin** — đủ, vì sau khi đóng cổng thì chỉ
cloudflared kết nối tới nginx.

**Dashboard:** *SSL/TLS → Origin Server → Create Certificate* → giữ mặc định (RSA 2048,
hostname `nipit.pro` + `*.nipit.pro`, 15 năm) → *Create*. Trang hiện **hai khối text**:
*Origin Certificate* và *Private Key*. Copy cả hai ngay — **private key chỉ hiện một lần**.

**Trên VPS:**

```bash
# 1. Chỗ đặt cert mới, không ghi đè cert LE (để còn đường lùi)
sudo mkdir -p /etc/ssl/cloudflare && sudo chmod 700 /etc/ssl/cloudflare

# 2. Dán Origin Certificate vào đây (kết thúc bằng Ctrl-D)
sudo tee /etc/ssl/cloudflare/nipit.pro.pem > /dev/null
# 3. Dán Private Key vào đây (Ctrl-D)
sudo tee /etc/ssl/cloudflare/nipit.pro.key > /dev/null
sudo chmod 600 /etc/ssl/cloudflare/nipit.pro.key

# 4. Kiểm cert đọc được và đúng hạn 15 năm
sudo openssl x509 -in /etc/ssl/cloudflare/nipit.pro.pem -noout -subject -issuer -enddate
# 5. Kiểm key khớp cert (hai hash phải GIỐNG nhau)
sudo openssl x509 -in /etc/ssl/cloudflare/nipit.pro.pem -noout -modulus | openssl md5
sudo openssl rsa  -in /etc/ssl/cloudflare/nipit.pro.key -noout -modulus | openssl md5
```

Bước 5 là bước đừng bỏ: dán lệch cert/key thì `nginx -t` **vẫn pass** ở một số bản, rồi
nginx fail lúc handshake — triệu chứng là site sập chứ không phải lỗi config.

Sửa vhost `nipit.pro` (`/etc/nginx/sites-available/`), đổi **hai dòng**:

```nginx
    ssl_certificate     /etc/ssl/cloudflare/nipit.pro.pem;
    ssl_certificate_key /etc/ssl/cloudflare/nipit.pro.key;
```

Giữ nguyên mọi thứ khác, **nhất là ba dòng proxy header** và `include` snippet real_ip.

```bash
sudo nginx -t && sudo systemctl reload nginx
# Kiểm từ chính VPS: phải thấy issuer Cloudflare
echo | openssl s_client -connect 127.0.0.1:443 -servername nipit.pro 2>/dev/null \
  | openssl x509 -noout -issuer -enddate
curl -fsS http://127.0.0.1:20241/ready && echo   # tunnel vẫn ready
```

Rồi kiểm từ ngoài (xem *Nghiệm thu sau mỗi bước*).

**Tắt certbot renewal** (sau khi đã chắc site chạy bằng cert mới ≥ 1 giờ):

```bash
sudo systemctl disable --now certbot.timer
systemctl list-timers | grep -i certbot    # phải rỗng
```

Cố ý `disable` chứ không `apt purge`: giữ cert LE và certbot lại làm đường lùi.

**Rollback B:** đổi hai dòng `ssl_certificate*` về đường dẫn
`/etc/letsencrypt/live/nipit.pro/`, `sudo nginx -t && sudo systemctl reload nginx`,
`sudo systemctl enable --now certbot.timer`.

### A. Plain HTTP :80 (nếu vẫn muốn đi đường này)

Chỉ làm khi **chưa** đóng ufw — cần cổng 443 còn mở để còn đường vào nếu `:80` sai.

Thêm một server block **riêng cho tunnel**, nghe trên loopback, thay vì sửa block `:80`
đang redirect (đụng vào nó là đụng cả traffic public đang còn):

```nginx
# /etc/nginx/sites-available/nipit-tunnel
server {
    listen 127.0.0.1:8080;
    server_name nipit.pro;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

`X-Forwarded-Proto https` đặt cứng: request tới đây là HTTP nên `$scheme` = `http`, mà app
đứng sau Cloudflare thì client thật dùng HTTPS — để `$scheme` sẽ làm cookie `Secure` và
redirect sai.

```bash
sudo ln -s /etc/nginx/sites-available/nipit-tunnel /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# Phải 200, KHÔNG phải 301
curl -sSI -H 'Host: nipit.pro' http://127.0.0.1:8080/ | head -1
```

Thấy `200` rồi mới đổi route trên dashboard: *Networks → Tunnels → `pinit-vps` → Published
application routes* → `nipit.pro` → service `HTTP` `localhost:8080`, bỏ *Origin Server Name*.

**Rollback A:** đổi route về `HTTPS` `localhost:443` + *Origin Server Name* `nipit.pro`
(có hiệu lực trong vài giây, không cần restart gì).

---

## Bước 2 — Đóng ufw 80/443

**Điều kiện vào bước này** — tick hết, đừng bỏ bước nào:

- [ ] Bước 1 xong, site chạy bằng cert Origin CA (hoặc route `:8080`) được **≥ 1 giờ**
- [ ] `docker logs cloudflared --since 24h 2>&1 | grep -iE 'ERR|error'` → rỗng
- [ ] `curl -fsS http://127.0.0.1:20241/ready` trên VPS → OK
- [ ] Tunnel đã sống qua **ít nhất một lần deploy** và một đêm
- [ ] `https://nipit.pro` và `https://nipit.pro/me` vào được từ ngoài
- [ ] DNS không còn A record nào trỏ IP VPS
- [ ] **ssh (22) vẫn mở** — đường duy nhất còn lại để sửa nếu sai

```bash
# Xem trước, để biết mình xoá đúng dòng nào
sudo ufw status numbered
```

```bash
# Xoá theo tên rule, không theo số: số thay đổi sau mỗi lần xoá
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
sudo ufw status            # còn 22/tcp. KHÔNG xoá dòng này.
```

Nếu `ufw status` còn dòng `80` hoặc `443` dạng `(v6)` thì xoá tiếp bản v6 tương ứng.

**Kiểm ngay sau khi đóng** (từ máy ngoài, không phải từ VPS):

```bash
# Phải timeout hoặc refused
curl -sS --max-time 8 -o /dev/null -w '%{http_code}\n' -k https://<IP-VPS>/ ; echo "exit=$?"
curl -sS --max-time 8 -o /dev/null -w '%{http_code}\n'    http://<IP-VPS>/  ; echo "exit=$?"
# Phải vẫn 200 / 302
curl -sSI --max-time 15 https://nipit.pro      | head -1
curl -sSI --max-time 15 https://nipit.pro/me   | head -1
```

> **Cổng 3001 của staging KHÔNG bị ufw chặn.** Docker publish port bằng cách ghi iptables
> vào chain `DOCKER`, **đi vòng qua ufw**. Nên sau bước này `http://<IP-VPS>:3001` **vẫn
> vào được** — đó không phải lỗi, đóng nó là việc của bước 3.

**Rollback 2:**

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Nếu vẫn không vào được site thì vấn đề không phải ufw — tạo lại A record `nipit.pro` → IP
VPS (proxied) trên dashboard DNS để bỏ qua tunnel hoàn toàn.

---

## Bước 3 — Staging qua `staging.nipit.pro`

Thứ tự ở đây quan trọng: **flip `BIND_ADDR` là bước CUỐI**. Làm sớm là mất hẳn đường vào
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
curl -sSI --max-time 15 https://staging.nipit.pro | head -1    # phải 302 về Access
```

Và mở trình duyệt, qua OTP, thấy được trang staging. **Chưa vào được thì DỪNG** — đừng làm
3c, nếu không là mất cả hai đường.

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

**Kiểm:**

```bash
curl -sS --max-time 8 -o /dev/null -w '%{http_code}\n' http://<IP-VPS>:3001/ ; echo "exit=$?"   # timeout/refused
curl -sSI --max-time 15 https://staging.nipit.pro | head -1                                     # 302 Access
```

**Rollback 3c:** đổi lại `BIND=0.0.0.0`, deploy `develop`.

---

## Nghiệm thu sau mỗi bước

Chạy từ máy ngoài sau **mỗi** bước trên. Bất kỳ dòng nào lệch thì rollback bước vừa làm,
đừng đi tiếp.

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
  gộp mọi khách vào một bucket. Đây là lỗi không có log, không có triệu chứng nào khác.

---

## Nếu site sập, theo thứ tự này

Từ nhanh nhất tới chậm nhất:

| # | Nghi vấn | Kiểm | Chữa |
|---|---|---|---|
| 1 | tunnel chết | `docker ps \| grep cloudflared`, `curl -fsS http://127.0.0.1:20241/ready` | `docker compose up -d cloudflared` (kèm `IMAGE=$(docker inspect -f '{{.Config.Image}}' learn-nextjs)`) |
| 2 | cert origin sai/hết hạn | `echo \| openssl s_client -connect 127.0.0.1:443 -servername nipit.pro 2>/dev/null \| openssl x509 -noout -issuer -enddate` | rollback bước 1 |
| 3 | vòng lặp redirect | `curl -sSI -H 'Host: nipit.pro' http://127.0.0.1:8080/` → phải 200 | rollback route về `https://localhost:443` |
| 4 | nginx không chạy | `sudo systemctl status nginx`, `sudo nginx -t` | sửa config, `systemctl reload nginx` |
| 5 | app chết | `docker logs learn-nextjs --tail 50` | xem `[me]`/`[cf-access]` trong log |
| 6 | mọi cách trên đều không ra | — | mở lại ufw 80/443 **và** tạo A record → bỏ qua tunnel hoàn toàn |

Dòng 6 là đường lùi cuối: nó đưa hệ thống về đúng trạng thái trước khi có Cloudflare, miễn
là cert LE còn hạn (27/12/2026).

## Việc nhỏ còn lại

- [x] Pin `cloudflared:2026.10.0` trong `docker-compose.yml` — xong, cần deploy để có hiệu lực
- [ ] Bật **HSTS** (free) — chỉ bật khi đã chắc mọi thứ chạy HTTPS, vì nó có thời hạn cam kết
      và trình duyệt đã nhớ thì không rút lại ngay được
- [ ] Chạy lại `scripts/cloudflare-realip.sh` định kỳ (dải IP Cloudflare đổi theo thời gian)
- [ ] Chọn cách xử lý `IMAGE` cho lệnh `compose up` tay — xem
      [docs/cloudflare.md](cloudflare.md), mục *Đề xuất: đưa IMAGE vào `$DIR/.env`*
