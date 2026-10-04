# Khu private `/me`

> Bản nháp từ Phase 1 — Phase 5 viết đầy đủ (setup, sync content, xoay secret,
> threat model). Hiện chỉ ghi những điều kiện mà thiếu thì prod chạy sai im lặng.

## Env

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `OWNER_PASSWORD_HASH` | có | bcrypt của passphrase. Sinh: `node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" '<passphrase>'` |
| `SESSION_SECRET` | có | ≥ 32 ký tự, ví dụ `openssl rand -hex 32`. Xoay biến này = đá mọi phiên ra |
| `TRUST_PROXY` | prod | `1` để rate limit tin `X-Forwarded-For` — xem dưới |

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
