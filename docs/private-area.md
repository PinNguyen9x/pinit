# Khu private `/me`

Khu chỉ owner xem được: roadmap sự nghiệp (`/me/roadmap`), notes ôn luyện (`/me/learn`),
case study ẩn danh (`/me/case-studies`), luyện phỏng vấn với Claude (`/me/practice`).
Repo **và** image Docker đều public, nên toàn bộ thiết kế xoay quanh một nguyên tắc:
**content chỉ nằm trên disk VPS, secret chỉ nằm trong env của container prod.**

## Threat model

| Tài sản | Nằm ở đâu | Chặn lộ bằng gì |
|---|---|---|
| Content (roadmap, notes, case study) | `/srv/pinit-private/content` trên VPS, mount `:ro` | `.gitignore`, `.dockerignore`, `outputFileTracingExcludes`; CI đọc danh sách file **thật** trong image (`scripts/check-image-private.sh`) và không push nếu vi phạm; đọc lúc request, không bao giờ lúc build |
| `.denylist` (tên nội bộ) | trong thư mục content | như trên; không bao giờ gửi lên model |
| Passphrase | chỉ trong đầu owner; server giữ hash bcrypt | bcrypt cost 12; 5 lần sai / 15 phút / IP |
| `SESSION_SECRET`, `ANTHROPIC_API_KEY` | `/opt/learn-nextjs/.env.private` (chmod 600) | không qua GitHub, không vào image, không có ở staging |
| Cookie phiên `pinit_owner` | trình duyệt owner | httpOnly, Secure, SameSite=Lax, hạn 7 ngày, HMAC-SHA256; lộ thì xoay `SESSION_SECRET` |
| Tiền API Anthropic | — | quota 40 request/giờ toàn cục; timeout 30s, không retry |

Các lớp còn lại:
- **Staging tắt hẳn `/me`** (không có secrets → mọi route 404): staging mở HTTP thẳng
  ở :3001, không qua nginx — passphrase sẽ đi plaintext và `X-Forwarded-For` giả được.
- **Không link, không index:** site public không link vào `/me`; mọi phản hồi `/me/*`
  mang `X-Robots-Tag: noindex, nofollow`. Cố ý **không** thêm `Disallow: /me` vào
  robots.txt — làm thế là tự công bố đường dẫn. Người dò vẫn biết `/me` tồn tại
  (redirect thay vì 404) — chấp nhận được, thứ cần giữ là nội dung chứ không phải URL.
- **Output của model là dữ liệu không tin được:** render text thuần; model không có tool.
- **Ngoài phạm vi:** VPS bị chiếm quyền root (đọc được mọi thứ); chính sách lưu dữ liệu
  của Anthropic với notes gửi lên.

## Bố cục trên VPS

Đã tạo sẵn — không cần chạy lại:

| Đường dẫn | Chủ / quyền | Vai trò |
|---|---|---|
| `/srv/pinit-private/content/` | `pin:pin` 755 | clone của `PinNguyen9x/pinit-private-content`, owner `git pull`; container (uid 1001) chỉ đọc |
| `/srv/pinit-private/practice-log/` | `1001:1001` 700 | container ghi `practice-log.jsonl`; `pin` không đọc được — dùng `sudo` (xem *Đọc practice log*) |
| `/opt/learn-nextjs/.env.private` | chmod 600 | secrets prod — **cần tạo**, xem dưới |
| `/opt/learn-nextjs-staging/.env.private` | rỗng | `deploy.yml` tự `touch`; để rỗng |

`/srv/pinit-private/practice-log/` mount rw ở prod nhưng **`:ro` ở staging**
(`PRACTICE_LOG_MODE=ro`) — hai container dùng chung thư mục, staging không được ghi.

`docker-compose.yml` trong repo là **nguồn duy nhất**: `deploy.yml` chép nó lên VPS
mỗi lần deploy rồi mới `compose pull && up`. Đừng sửa compose trực tiếp trên VPS —
sẽ bị ghi đè. Khác biệt giữa hai môi trường do `deploy.yml` export qua ssh, không
nằm trong file nào trên VPS:

| Biến | Prod | Staging |
|---|---|---|
| `BIND_ADDR` | `127.0.0.1` (nginx đứng trước) | `0.0.0.0` (mở thẳng :3001) |
| `HOST_PORT` | `3000` | `3001` |
| `PRACTICE_LOG_MODE` | `rw` | `ro` |
| `IMAGE`, `CONTAINER`, `API_TARGET` | theo môi trường | theo môi trường |

## Secrets: `/opt/learn-nextjs/.env.private`

```bash
# trên VPS, chỉ prod
cd /opt/learn-nextjs && touch .env.private && chmod 600 .env.private
```

```dotenv
# Hash bcrypt PHẢI bọc nháy đơn.
OWNER_PASSWORD_HASH='$2b$12$TNZPNDMMR3An6PvWBOoujeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
SESSION_SECRET=<openssl rand -hex 32>
ANTHROPIC_API_KEY=<key từ Claude Console>
TRUST_PROXY=1
```

**Vì sao nháy đơn** (đo trên Docker Compose 2.31): viết không nháy *hoặc* nháy kép thì
Compose hiểu `$TNZ...` trong hash là tên biến — hash tới container chỉ còn `$2b$12`,
kèm một dòng warning dễ trôi. Salt bcrypt mở đầu bằng chữ cái ~80% số lần. App kiểm
dạng bcrypt lúc khởi động: hash cụt → khu `/me` tắt và log
`[me] OWNER_PASSWORD_HASH không phải hash bcrypt đầy đủ ...`.

Sinh hash **trên máy owner**, không trên VPS (để passphrase không vào shell history của server):

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" '<passphrase>'
```

| Biến | Ở đâu | Ghi chú |
|---|---|---|
| `OWNER_PASSWORD_HASH` | `.env.private` | thiếu/sai dạng → `/me` 404 |
| `SESSION_SECRET` | `.env.private` | ≥ 32 ký tự; ngắn hơn → `/me` 404 |
| `ANTHROPIC_API_KEY` | `.env.private` | thiếu → `/me/practice` tắt, API 503 `practice-not-configured`. Có nhưng không giống key thật (không bắt đầu bằng `sk-ant-` hoặc < 40 ký tự) → **chỉ cảnh báo**: log `[practice] ANTHROPIC_API_KEY không giống key thật…` + banner trên `/me/practice`; roadmap/learn không bị ảnh hưởng |
| `TRUST_PROXY` | `.env.private` | `1` — xem mục nginx |
| `PRACTICE_MODEL` | `.env.private` (tuỳ chọn) | mặc định `claude-haiku-4-5` |
| `PRIVATE_CONTENT_DIR` | compose | `/app/private-content` |
| `PRACTICE_LOG_PATH` | compose | `/app/practice-data/practice-log.jsonl` |

Chạy local: `PRIVATE_CONTENT_DIR=./private-content.example npm run dev` (cấu trúc xem
`private-content.example/README.md`). Không có `PRACTICE_LOG_PATH` thì log nằm trong
thư mục content.

## nginx và `X-Forwarded-For`

Rate limit đăng nhập tính theo IP. Sau Docker, địa chỉ socket luôn là gateway của
bridge — mọi người chung một IP, 5 lần sai của bất kỳ ai khoá tất cả. Nên prod cần đủ:

1. `TRUST_PROXY=1` trong `.env.private`;
2. vhost proxy tới container set header (app lấy **phần tử cuối** — phần nginx nối
   vào; phần trước do client tự khai):

   ```nginx
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

**Trạng thái: đã thỏa.** Vhost `nipit.pro` (HTTPS) được thêm ba dòng trên; vhost
catch-all `learn-nextjs` có sẵn. Bật `TRUST_PROXY=1` mà vhost thiếu header thì phần
tử cuối do client viết — rate limit bị lách. Đổi/thêm vhost thì kiểm lại:

```bash
sudo nginx -T 2>/dev/null | grep -n 'proxy_pass\|X-Forwarded-For'   # mỗi proxy_pass tới :3000 phải đi kèm X-Forwarded-For
```

**Đi qua Cloudflare thì ba dòng trên KHÔNG còn đủ.** Phần tử cuối của `X-Forwarded-For`
lúc đó là IP của cloudflared (`127.0.0.1`), không phải của khách — cần thêm snippet
`real_ip`. Xem [docs/cloudflare.md](cloudflare.md), mục *nginx: real_ip*.

## Content: repo, deploy key, sync

Content là repo git **private** `PinNguyen9x/pinit-private-content`, clone vào
`/srv/pinit-private/content` bằng user `pin` qua một **deploy key chỉ đọc** — VPS
kéo được content nhưng không đẩy ngược được, và key này không mở được repo nào khác.

**Clone lần đầu** (user `pin`):

```bash
# 1. Key riêng cho repo content
ssh-keygen -t ed25519 -f ~/.ssh/pinit_content -N '' -C 'pinit-content-readonly'
cat ~/.ssh/pinit_content.pub
#    → repo content → Settings → Deploy keys → Add; KHÔNG tick "Allow write access"

# 2. Alias ssh: git dùng đúng key này cho repo này (IdentitiesOnly chặn ssh thử key khác)
cat >> ~/.ssh/config <<'EOF'
Host github-pinit-content
  HostName github.com
  User git
  IdentityFile ~/.ssh/pinit_content
  IdentitiesOnly yes
EOF

# 3. Clone VÀO thư mục hiện tại — dấu `.` cuối lệnh là bắt buộc
cd /srv/pinit-private/content
git clone git@github-pinit-content:PinNguyen9x/pinit-private-content.git .
ls    # phải thấy roadmap.yaml, learn/, case-studies/ ngay tại đây
```

**Thiếu dấu `.`** thì git tạo thư mục con `content/pinit-private-content/…` — app không
thấy gì: đăng nhập được nhưng mọi trang hiện "Chưa có roadmap.yaml / topic / case study"
(trạng thái trống, không phải lỗi 500). Đã gặp đúng triệu chứng này ở lần deploy đầu
(khi đó thư mục còn rỗng hẳn).

**Cập nhật:**

```bash
cd /srv/pinit-private/content && git pull
```

Không cần restart: mọi trang đọc file lúc request.

### `.denylist` chỉ sống trên VPS

Viết trực tiếp tại `/srv/pinit-private/content/.denylist` — **không commit** (repo
content đã `.gitignore` file này, và `git pull` không đụng tới file untracked). Tên
nội bộ không đi qua GitHub, không đi qua phiên làm việc với AI. Nút *Kiểm denylist*
trên trang case study đọc file này. Muốn quét toàn bộ content bằng
`npm run check:denylist` trên máy owner: clone repo content vào thư mục tạm, chép
`.denylist` từ VPS vào đó, chạy `PRIVATE_CONTENT_DIR=<thư-mục-tạm> npm run check:denylist`
trong repo `pinit`, rồi xoá thư mục tạm.

### Đọc practice log

Thư mục log thuộc `1001:1001` quyền 700 (chỉ container ghi), nên user `pin` cần `sudo`:

```bash
sudo wc -l /srv/pinit-private/practice-log/practice-log.jsonl
sudo tail -3 /srv/pinit-private/practice-log/practice-log.jsonl
```

## Xoay passphrase / secret / key

Sửa `/opt/learn-nextjs/.env.private` rồi **tạo lại** container:

```bash
cd /opt/learn-nextjs && IMAGE=$(docker inspect -f '{{.Config.Image}}' learn-nextjs) \
  docker compose up -d --force-recreate
```

`docker compose restart` **không đủ**: `env_file` chỉ được đọc lúc *tạo* container,
restart giữ nguyên env cũ. `IMAGE=...` giữ đúng tag đang chạy — thiếu nó compose rơi
về `:latest` (deploy.yml export biến này qua ssh, shell của bạn thì không có).

| Xoay | Làm | Hệ quả |
|---|---|---|
| Passphrase | sinh hash mới (máy owner), thay `OWNER_PASSWORD_HASH` (nháy đơn) | phiên đang mở **vẫn sống** tới hết hạn — muốn đá ra thì xoay luôn `SESSION_SECRET` |
| `SESSION_SECRET` | `openssl rand -hex 32` | mọi phiên mất hiệu lực ngay |
| `ANTHROPIC_API_KEY` | revoke key cũ trong Claude Console, tạo key mới | — |

Tạo lại container cũng reset bộ đếm rate limit (đếm trong RAM).

## Denylist

`.denylist` nằm trong `PRIVATE_CONTENT_DIR` (gitignore + dockerignore), mỗi dòng một
từ khóa; dòng trống và dòng bắt đầu bằng `#` bị bỏ qua. So chuỗi thuần, không phân
biệt hoa thường, sau khi chuẩn hoá Unicode NFC cả hai phía.

- `npm run check:denylist` — quét `roadmap.yaml`, `learn/**/*.md`, `case-studies/*.md`,
  in `file:line:từ-khóa`. Exit `0` sạch · `1` có khớp · `2` chưa có/rỗng denylist
  hoặc không có thư mục content. Từ khóa ≤ 3 ký tự chỉ bị cảnh báo.
- Nút **Kiểm denylist** trên trang case study gọi `POST /api/me/check-denylist`
  (`{ slug }`, sau middleware) để kiểm riêng file đó.
- **Đừng chạy script trên CI có log public**: output in nguyên từ khóa — chính những
  tên nội bộ cần giấu.

## Practice

- `POST /api/me/practice/generate` `{ topic }` → 5 câu hỏi; `POST /api/me/practice/grade`
  `{ topic, question, answer }` → `{ score 0–10, missing[], followUp }`. Cả hai sau middleware.
- Chỉ gửi `learn/<topic>/` (index.md trước, rồi note theo `updated` mới nhất), cắt ở
  12.000 ký tự theo ranh giới note — UI báo note nào bị bỏ. Không bao giờ gửi
  `case-studies/`, `roadmap.yaml`, `.denylist`.
- Quota **40 request/giờ chung cho cả hai API, toàn cục** (không theo IP) — chặn đốt
  tiền nếu cookie lộ. Một lượt = 1 generate + 5 grade. Đếm trong RAM: restart là reset.
- Timeout 30s, không retry. Output model sai schema / refusal / bị cắt → 502, không
  bao giờ trả text thô. Quyền ghi log được kiểm **trước** khi gọi model.
- Text model sinh ra render text thuần (`white-space: pre-wrap`), không qua `utils/markdown.ts`.


## Checklist sau deploy đầu tiên

Theo thứ tự — bước nào hỏng thì dừng ở đó.

1. Image đã qua bước `Kiểm image không chứa content private` trong Actions (xanh).
2. Tạo `/opt/learn-nextjs/.env.private` như trên, `chmod 600`, rồi tạo lại container bằng
   `docker compose up -d --force-recreate` (kèm `IMAGE=...` như mục *Xoay passphrase*) —
   `restart` **không đủ** vì `env_file` chỉ được đọc lúc tạo container. Áp dụng cho
   **mọi lần** sửa `.env.private` về sau.
3. Log không có cảnh báo: `docker logs learn-nextjs 2>&1 | grep -E '\[me\]|\[practice\]'` → rỗng.
   `[practice] ANTHROPIC_API_KEY không giống key thật` = key là chuỗi giữ chỗ hoặc dán thiếu.
4. Clone repo content theo mục *Content: repo, deploy key, sync* — nhớ dấu `.`.
5. Mount đúng chiều:
   - `docker exec learn-nextjs touch /app/private-content/x` → `Read-only file system`;
   - `docker exec learn-nextjs touch /app/practice-data/x && docker exec learn-nextjs rm /app/practice-data/x` → thành công.
6. Từ máy ngoài: `curl -sI https://nipit.pro/me` → `307` về `/me/login?next=…`, có `x-robots-tag: noindex, nofollow`.
7. Staging: `curl -sI http://<staging>:3001/me` → `404` (khu `/me` tắt ở staging).
8. Đăng nhập trên `https://nipit.pro/me/login`; `/me/roadmap`, `/me/learn`, `/me/case-studies` hiện content thật.
9. **Practice với Anthropic API thật** (đạt lần đầu 2026-10-04 với claude-haiku-4-5):
   một lượt *Sinh 5 câu hỏi* + *Chấm* một câu trên `/me/practice`. Đạt khi: không lỗi 502
   (JSON đúng schema), câu hỏi bám notes, điểm/`missing`/`followUp` hợp lý; và
   `sudo wc -l /srv/pinit-private/practice-log/practice-log.jsonl` tăng 6 dòng (5 câu + 1 lần chấm).
   Lỗi upstream hiện mã + type ngay trên UI (vd `401 authentication_error` → kiểm key).
   Model trả sai schema lặp lại → sửa prompt trong `utils/practice.ts` hoặc đổi `PRACTICE_MODEL`.

## Ràng buộc khi sửa code

- **Text do model sinh (câu hỏi, feedback chấm điểm) KHÔNG đi qua
  `utils/markdown.ts`.** Pipeline đó bật `rehype-raw` — giữ nguyên HTML thô — vì
  content markdown do chính owner viết. Output của model thì không tin được
  (prompt injection qua chính notes có thể khiến nó in ra `<script>`/`<img onerror>`).
  Render dạng text thuần (React tự escape) hoặc markdown đã sanitize
  (không `rehype-raw`, hoặc qua `sanitize-html` sẵn có trong dependencies).
