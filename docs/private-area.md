# Khu private `/me`

> Bản nháp từ Phase 1 — Phase 5 viết đầy đủ (setup, sync content, xoay secret,
> threat model). Hiện chỉ ghi những điều kiện mà thiếu thì prod chạy sai im lặng.

## Env

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `OWNER_PASSWORD_HASH` | có | bcrypt của passphrase. Sinh: `node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" '<passphrase>'` |
| `SESSION_SECRET` | có | ≥ 32 ký tự, ví dụ `openssl rand -hex 32`. Xoay biến này = đá mọi phiên ra |
| `TRUST_PROXY` | prod | `1` để rate limit tin `X-Forwarded-For` — xem dưới |
| `ANTHROPIC_API_KEY` | cho Practice | thiếu → `/me/practice` tắt, API trả 503 `practice-not-configured` |
| `PRACTICE_MODEL` | không | mặc định `claude-haiku-4-5` (rẻ nhất) |
| `PRACTICE_LOG_PATH` | prod | mặc định `<PRIVATE_CONTENT_DIR>/practice-log.jsonl`. Thư mục content mount `:ro` nên trỏ biến này vào một **thư mục** rw riêng (đừng bind-mount một file đơn: file chưa có trên host thì Docker tạo thư mục trùng tên) |
| `PRIVATE_CONTENT_DIR` | không | mặc định `./private-content`. Cấu trúc xem `private-content.example/README.md`; chạy thử: `PRIVATE_CONTENT_DIR=./private-content.example npm run dev` |

Thiếu một trong hai biến đầu (hoặc secret ngắn hơn 32 ký tự) thì cả khu `/me` tắt:
mọi route trả 404, log khởi động in một dòng `[me] ...`. Staging cố ý không đặt hai
biến này — staging mở thẳng HTTP :3001, không qua nginx.

## Hai điều kiện bắt buộc ở prod

1. **`TRUST_PROXY=1`** trong env container. Thiếu nó, IP để rate limit là địa chỉ
   socket — mà sau Docker thì mọi request đều mang IP gateway của bridge. Kết quả:
   5 lần sai của *bất kỳ ai* khoá đăng nhập của *mọi người* 15 phút.
2. **nginx phải set header**, trong `location` proxy tới container:

   ```nginx
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   ```

   App lấy **phần tử cuối** của `X-Forwarded-For` — phần nginx nối vào, các phần
   tử phía trước do client tự khai. Bật `TRUST_PROXY=1` mà nginx không set header
   thì phần tử cuối là do client viết, rate limit bị lách bằng cách đổi header.

Cookie `pinit_owner` mang cờ `Secure` khi `NODE_ENV=production` hoặc request đến
qua https (`X-Forwarded-Proto: https`); dev local trên http không có cờ này.

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

## Ràng buộc cho các phase sau

- **Text do model sinh (Phase 4: câu hỏi, feedback chấm điểm) KHÔNG đi qua
  `utils/markdown.ts`.** Pipeline đó bật `rehype-raw` — giữ nguyên HTML thô — vì
  content markdown do chính owner viết. Output của model thì không tin được
  (prompt injection qua chính notes có thể khiến nó in ra `<script>`/`<img onerror>`).
  Render dạng text thuần (React tự escape) hoặc markdown đã sanitize
  (không `rehype-raw`, hoặc qua `sanitize-html` sẵn có trong dependencies).
