---
name: verify-pinit
description: Chạy app pinit thật bằng `npm run verify` rồi đọc kết quả, để chứng minh một thay đổi còn hoạt động chứ không chỉ compile. Dùng SAU KHI sửa bất cứ thứ gì người dùng nhìn hoặc bấm được — component, trang trong `pages/`, route mới, layout, style, middleware, auth của `/me`, loader đọc content, hay biến môi trường. Cũng dùng khi cần bằng chứng để dán vào Plane, khi verify báo đỏ mà chưa rõ vì sao, hay khi thêm route và phải cập nhật feature map. Không dùng cho thay đổi chỉ sửa tài liệu hay comment.
---

# verify-pinit

`npm run lint` và `npm test` **không** chứng minh được một thay đổi UI còn hoạt động.
Ba lần đã gặp trong repo này: sửa vào code chết (`ROUTE_LIST`) vẫn compile sạch và pass hết
test; barrel `@/constants` kéo toàn bộ glossary và System Design vào bundle mọi trang mà lint, type-check, test
đều xanh; `/works/infinity-scroll` lỗi hydrate mà không công cụ nào kêu. Chỉ mở trang thật
mới thấy.

## Khi nào phải chạy

**Phải chạy** sau khi sửa: component · file trong `pages/` · route mới hoặc đổi route ·
layout, style, theme · `middleware.ts` · auth của `/me` · loader đọc content private ·
biến môi trường · dependency ảnh hưởng render.

**Không cần chạy** khi chỉ sửa: tài liệu, comment, commit message, file trong
`docs/`, hay test không đụng code production.

**Giá phải trả — biết trước để không né:**

| Lệnh | Thời gian thật |
|---|---|
| `npm run verify` | **~6 phút** (gồm `next build` ~45s) |
| `npm run verify -- --no-build` | **~5 phút** |
| `npm run verify -- --route /glossary --no-build` | **~4 giây** |
| `npm run verify -- --both` | **~7 phút** (2 viewport) |

Sáu phút là thật và không tránh được: nó build production rồi mở 35 route bằng Chromium.
Dùng `--route` trong lúc làm, chạy đầy đủ một lần trước khi commit.

## Lệnh

```bash
npm run verify                                  # 35 route, viewport desktop
npm run verify -- --route /me/roadmap           # một route
npm run verify -- --route /glossary --no-build  # vòng lặp nhanh khi đang sửa
npm run verify -- --mobile                      # viewport 390x844
npm run verify -- --both                        # cả hai viewport
npm run verify -- --keep                        # giữ server ở 127.0.0.1:4318 để tự mở
```

`--no-build` dùng `.next` đang có. Nhanh nhưng **sai nếu vừa sửa code** — nó kiểm bản build
cũ. Chỉ dùng khi đang hiệu chỉnh chính `scripts/verify/`.

## Đọc kết quả: ba chỗ dễ đọc sai

Dòng tổng kết bình thường trông thế này:

```
[verify] 38/38 đạt trong 353s · mock Anthropic nhận 2 lời gọi · bỏ qua 18 console error · 1 lỗi đã biết
```

**1. Exit code, không phải chữ "đạt".**

| Exit | Nghĩa |
|---|---|
| `0` | mọi route đạt |
| `1` | có route đỏ — đọc dòng `✗` |
| `2` | **từ chối chạy** vì cấu hình sai, chưa kiểm gì cả |

Exit 2 hay bị đọc thành "hỏng nặng". Không phải: nó dừng *trước* khi build, vì
`ANTHROPIC_BASE_URL` không trỏ loopback hoặc `knownIssue` khai thiếu mã work item. Đọc thông
báo, nó nói cách sửa.

**2. "1 lỗi đã biết" không phải là sạch.**

Mỗi lần chạy, `.verify-out/summary.md` có mục **"Lỗi đã biết, đã có work item"**. Đó là lỗi
**thật**, đang được cố tình không tính đỏ vì đã có work item theo dõi. Đọc mục đó mỗi lần.
Con số này chỉ được giảm, không được tăng.

**3. "bỏ qua 18 console error" là khoảng mù, không phải thành tích.**

18 là số console error bị allowlist loại. Phần lớn là `401` từ `/api/profile` — `useAuth`
trong `pages/_app.tsx` dò trạng thái đăng nhập ở mọi trang, và 401 là câu trả lời đúng cho
khách ẩn danh. Cộng thêm các trang mà 404 là kỳ vọng thì log chính response 404 của nó.

**Con số này nhảy lên là tín hiệu.** Nó nghĩa là có tiếng ồn mới được dung thứ, hoặc ai đó
vừa nới allowlist. Đừng nới `CONSOLE_IGNORE` để làm xanh một ca đỏ — mỗi dòng ở đó là một
lỗi verify thôi bắt được. Muốn dung thứ một endpoint cụ thể thì dùng `tolerate` của riêng
route, kèm lý do.

## Khi verify đỏ

Đọc đúng dòng `✗`, nó nói rõ route nào và vì sao:

```
✗ desktop /glossary#API
    chuỗi "💡 Dễ nhớ:": cần đúng 1 lần, có 0
```

Rồi phân ba hướng:

- **Lỗi do mình vừa gây ra** → sửa code, chạy lại `--route` đúng route đó.
- **Kỳ vọng trong `routes.mjs` sai, app đúng** → sửa kỳ vọng, và sửa cả
  `docs/feature-map.md` cho khớp. Ca này hay gặp hơn tưởng: lần dựng verify đầu tiên, **cả
  20 ca đỏ đều là kỳ vọng sai**, không phải app sai.
- **Lỗi có sẵn trên `main`, không do mình** → kiểm bằng cách stash thay đổi rồi chạy lại.
  Nếu vẫn đỏ thì **mở work item Plane** rồi khai `knownIssue` (xem dưới). Không im lặng bỏ qua.

Screenshot full-page từng route nằm trong `.verify-out/` — xem khi thông báo chưa đủ rõ.

## `knownIssue`: phải truy ra được một work item

```js
knownIssue: {
  ref: 'PINIT-63',                  // bắt buộc, dạng PINIT-<số>
  pattern: /React error #418/,      // bắt buộc là RegExp, hẹp
}
```

Thiếu `ref` đúng dạng, hoặc `pattern` không phải RegExp → **verify exit 2 ngay trước khi
build**. Cố ý: đây là cơ chế duy nhất làm verify bỏ qua một lỗi thật, nên là chỗ dễ thành
nơi giấu lỗi nhất.

Sửa được lỗi rồi thì **gỡ khối `knownIssue`**. Để lại thì verify thôi canh chỗ đó mãi mãi.

## Thêm route mới: sửa hai file, không phải một

| File | Giữ gì |
|---|---|
| `docs/feature-map.md` | **vì sao** — điều kiện vào, nguồn dữ liệu, dấu hiệu chạy đúng |
| `scripts/verify/routes.mjs` | **điều kiện kiểm** — bản máy đọc được |

Sửa một bên thì verify **bỏ qua route mới trong im lặng** — không báo lỗi, chỉ là không kiểm.

Chọn điều kiện kiểm theo thứ tự ưu tiên này:

1. **Số đếm phần tử** — `{ selector: 'article', count: 119 }`. Chắc nhất.
2. **Chuỗi cố định của UI** — `{ text: 'Đọc theo chủ đề' }`. So sánh không phân biệt hoa thường.
3. **Không gì cả** — route phụ thuộc API ngoài thì khai `external: true`, chỉ kiểm "không 5xx".

Đừng neo vào số liệu đổi theo nội dung ("35 bài viết") hay dữ liệu của API ngoài repo. Một
lần API đó chết là verify đỏ vì chuyện không liên quan thay đổi vừa làm.

## Mẫu bằng chứng dán vào Plane

`workitem_comment` action `create`, field `comment_html`, **tag HTML thô** — gửi `&lt;p&gt;`
thì Plane hiện nguyên tag.

```html
<p><b>Verify:</b> <code>npm run verify</code> → <code>exit=0</code>,
<b>38/38 đạt</b> trong 353s. Bỏ qua 18 console error (bằng allowlist cũ,
không nới thêm), 1 lỗi đã biết (PINIT-63).</p>
<p>Route đụng tới: <code>/me/roadmap</code> — 200, checklist render, không console error mới.</p>
<p>Commit: <code>abc1234</code> — https://github.com/PinNguyen9x/pinit/commit/abc1234</p>
```

Ba thứ **phải** có, thiếu thì bằng chứng không dùng được:

- **exit code**, không chỉ chữ "xong".
- **số route đạt / tổng**, và route mình vừa đụng tới có trong đó.
- **số console error bị bỏ qua**, kèm khẳng định có nới allowlist hay không.

Theo luật trong `CLAUDE.md`: chỉ chuyển work item sang `In Review` **sau khi** đã comment
bằng chứng. Thiếu bằng chứng thì để nguyên `In Progress`.

## Vấp thường gặp

- **`cổng 4318 đang bị giữ`** → `lsof -ti:4318 | xargs kill -9`. Verify dùng 4318 cho app và
  4319 cho mock, không dùng 3000 — để không bắn vào `npm run dev` của phiên khác.
- **`/me/login không có ô passphrase`** → thiếu `OWNER_PASSWORD_HASH` hoặc `SESSION_SECRET`,
  và khi đó **mọi** route `/me` trả 404 kể cả trang login. Kiểm `scripts/verify/fixture.env`.
- **`anthropic-mock: không nhận ra schema`** → code production có lời gọi model mới mà stub
  chưa biết. Thêm nhánh vào `payloadFor()` trong `scripts/verify/anthropic-mock.mjs`.
- **Verify xanh nhưng `mock Anthropic nhận 0 lời gọi`** → ba ca API không chạy. Chúng bị bỏ
  khi dùng `--route`; chạy đầy đủ mới có.
- **Ổ đĩa đầy** → `next build` cần ~230MB. `.next/` của các worktree pinit chiếm hàng GB;
  xoá `.next` của worktree khác thì phải hỏi, có thể đang có phiên chạy ở đó.
