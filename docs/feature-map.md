# Feature map — mọi route của pinit

Nguồn: thư mục `pages/` thật, đọc ngày **21/11/2026** trên `origin/main` (`03b579d`).
Đây là danh sách mà `npm run verify` đi qua; thêm route mới thì **sửa file này trước**,
không thì verify bỏ qua route đó trong im lặng.

```bash
# sinh lại danh sách file để đối chiếu
find pages -type f \( -name '*.tsx' -o -name '*.ts' \) | grep -v '^pages/api/' | sort
```

**34 file** trong `pages/` ngoài `api/`, trừ `_app.tsx` và `_document.tsx` (không phải route)
còn **32 route** — đủ 32 có mặt dưới đây.

Bản **máy đọc được** của file này là `scripts/verify/routes.mjs`. Thêm route thì sửa cả hai:
file này giữ *vì sao*, file kia giữ *điều kiện kiểm*. Chỉ sửa một bên thì verify bỏ qua route
mới trong im lặng.

## Đọc bảng thế nào

- **Điều kiện vào** — cần auth gì, cần biến môi trường gì. "—" là vào thẳng được.
- **Dữ liệu** — nguồn dữ liệu và *thời điểm* lấy. Phân biệt quan trọng: `getStaticProps`
  lấy lúc **build**, `getServerSideProps` lấy lúc **request**.
- **Dấu hiệu đang chạy đúng** — thứ phải kiểm, viết đủ cụ thể để máy kiểm được.

Hai quy ước cho cột cuối:

- **404 có khi là đúng.** `/posts/[postId]` trả `notFound` khi API không có id đó — đó là
  thiết kế, không phải lỗi. Verify phải so với kỳ vọng từng route, đừng coi mọi non-200 là fail.
- **Không có console error** là tiêu chí mặc định của **mọi** route, không nhắc lại từng dòng.

---

## Phụ thuộc ngoài

Ba nguồn dữ liệu nằm ngoài repo này. Đo lúc 21/11/2026:

| Nguồn | Dùng ở | Trạng thái đo được | Khi không với tới |
|---|---|---|---|
| `json-server-blog.vercel.app` | `/works/*`, `/`, `/login` | **200**, ~3,0s | `safeFetchJson` trả `null` → `paths: []` + `fallback: 'blocking'`, build không sập |
| `js-post-api.herokuapp.com` | `/posts`, `/posts/[postId]` | **200**, ~1,0s | `/posts` hiện danh sách rỗng; `/posts/[postId]` trả `notFound` |
| `PRIVATE_CONTENT_DIR` (disk) | mọi `/me/*` | fixture `private-content.example/` | loader trả mảng rỗng + `errors`, trang vẫn render |

```bash
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" --max-time 12 \
  "https://json-server-blog.vercel.app/api/works?_page=1&_limit=2"
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" --max-time 12 \
  "https://js-post-api.herokuapp.com/api/posts?_page=1"
```

**Hệ quả cho G1-3:** verify **không được** coi hai API này là luôn sẵn. Chúng ở ngoài tầm
kiểm soát, và một lần chúng chết là verify đỏ vì lý do không liên quan đến thay đổi vừa làm.
Các route phụ thuộc chúng được đánh dấu **[ngoài]** — verify kiểm "trang render được và không
có 5xx", không kiểm nội dung dữ liệu.

## Biến môi trường

| Biến | Bắt buộc cho | Không đặt thì |
|---|---|---|
| `OWNER_PASSWORD_HASH` | toàn bộ `/me/*` | mọi route `/me` trả **404** (kể cả `/me/login`) |
| `SESSION_SECRET` | toàn bộ `/me/*` | như trên; phải ≥ 32 ký tự |
| `PRIVATE_CONTENT_DIR` | nội dung `/me/*` | mặc định `./private-content` |
| `CF_ACCESS_TEAM_DOMAIN` + `CF_ACCESS_AUD` | lớp Cloudflare Access | **để rỗng cả hai** → lớp Access tắt, đúng cho local |
| `ANTHROPIC_API_KEY` | `/me/practice` sinh/chấm câu hỏi | trang vẫn vào được, hành động sinh/chấm lỗi |
| `API_URL` | `/works/*`, `/login` | mặc định `https://json-server-blog.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | thẻ `og:url` | thẻ dùng giá trị mặc định |
| `TRUST_PROXY` | rate limit lấy IP thật | lấy `remoteAddress` |
| `PRACTICE_MODEL`, `PRACTICE_LOG_PATH` | `/me/practice` | có mặc định |

⚠️ **Đặt một biến `CF_ACCESS_*` mà quên biến kia thì lớp Access bị bỏ qua hoàn toàn** —
`cfAccessProblem()` in cảnh báo lúc khởi động (`instrumentation.ts`). Verify nên đọc log
khởi động, không chỉ đọc HTTP status.

---

## 1. Trang công khai — nội dung chính

| URL | Điều kiện vào | Dữ liệu | Dấu hiệu đang chạy đúng |
|---|---|---|---|
| `/` | — | `getStaticProps` lúc build: 35 bài `blog/*.md` + `constants/*` **[ngoài]** works | 200; có heading `Đọc theo chủ đề` và `Featured Works` |
| `/about` | — | tĩnh trong component | 200; có nội dung giới thiệu |
| `/blog` | — | `getStaticProps`: 35 file `blog/*.md` | 200; danh sách **35** bài, mỗi bài có ngày + tag |
| `/blog/reactjs-techniques-hooks` | — | `getStaticPaths` theo `slug` ở frontmatter, `fallback: false` | 200; thân bài render; mục lục bên cạnh; nút Copy ở mỗi khối code |
| `/glossary` | — | `constants/glossary.ts`, **client-side** | 200; **119** thuật ngữ; ô tìm làm lọc được |
| `/glossary#API` | — | như trên, đọc `window.location.hash` lúc mount | mục `API` **tự mở và cuộn tới**; đổi hash (back/forward) thì mục đang mở đổi theo |
| `/glossary/muc-luc` | — | `constants/glossary.ts`, client-side | 200; nhóm theo category; **không** có highlight (cố ý) |
| `/system-design` | — | `constants/system-design.ts`, client-side | 200; danh sách **13** buổi |
| `/system-design/nguyen-ly-cap-microservices` | — | `getStaticPaths` 13 slug, `fallback: false` | 200; thân bài render; **sơ đồ hiện ra** (diagram pre-render lúc build) |
| `/system-design/cheat-sheet` | — | `constants/`, client-side | 200; bảng tra render |

⚠️ `cheat-sheet.tsx` là **file tĩnh nằm cạnh `[slug].tsx`** trong cùng `pages/system-design/`.
File tĩnh thắng dynamic, nên nếu một buổi System Design được đặt `slug: 'cheat-sheet'` thì
trang của buổi đó vĩnh viễn không vào được — và `next build`, `npm test`, lint đều xanh.
Đây là rule **L1** trong `docs/agent-workflow/memory-export.md`.

## 2. Trang công khai — works

| URL | Điều kiện vào | Dữ liệu | Dấu hiệu đang chạy đúng |
|---|---|---|---|
| `/works` | — | `getStaticProps` rỗng; danh sách tải **client-side** **[ngoài]** | 200; thẻ work hiện ra sau khi tải xong |
| `/works/infinity-scroll` | — | client-side, tải thêm khi cuộn **[ngoài]** | 200; cuộn tới cuối thì tải thêm trang sau. ⚠️ **Đang có lỗi hydrate React #418** trên `main` — PINIT-63 |
| `/works/85287225-2cec-5155-8a6e-555d97248cb7/details` | — | `getStaticPaths` 10 work đầu + `fallback: 'blocking'` **[ngoài]** | 200; `fullDescription` render markdown; sơ đồ mermaid trong đó hiện ra |
| `/works/85287225-2cec-5155-8a6e-555d97248cb7` | **cần login** (`requireLogin`) | form sửa work, client-side **[ngoài]** | chưa login → chuyển sang `/login`; đã login → form có dữ liệu work |
| `/works/<id>/<slug>` | — | `getStaticPaths` + `fallback: 'blocking'` **[ngoài]** | route này **chỉ render game**, không phải trang chi tiết. Với 3 work hiện tại (đều không có `published`) nó trả **404** — đó là kỳ vọng |

⚠️ Work có `published` **và** có `slug` thì `getWorkHref` trỏ sang `/works/{id}/{slug}` —
route game — **nuốt mất** `details.tsx`. Ba work hiện tại (`pinit`, `json-server`,
`twitter-node-server`) đều **không** có `published` nên đang trỏ đúng vào `details`.
`getWorkHref` đã gộp về `utils/work.ts` (có test), không còn lặp ở 3 component như trước.

## 3. Trang công khai — nhóm học/thử nghiệm cũ

Bốn trang dưới là bài tập Next.js còn lại từ trước, **không nằm trong luồng nội dung chính**.
Giữ trong map để verify không báo "route lạ", nhưng tiêu chí chỉ là "không 5xx".

| URL | Điều kiện vào | Dữ liệu | Dấu hiệu đang chạy đúng |
|---|---|---|---|
| `/posts` | — | `getStaticProps` + `revalidate: 60` **[ngoài]** | 200; **10** tiêu đề (API trả 10 item/trang) |
| `/posts/aqbbx1vj1lqrtv3wg` | — | `getStaticPaths` 10 id + `fallback: 'blocking'` **[ngoài]** | 200 với id có thật; **404 với id bất kỳ khác — đúng thiết kế** (`notFound: true`) |
| `/posts/create` | — | form, client-side | 200; form render |
| `/posts/a/b/c` | — | catch-all, chỉ in `router.query` | 200; hiện `{"params":["a","b","c"]}` |
| `/product` | — | tĩnh (MUI + ảnh local) | 200; ảnh avatar tải được |
| `/swr` | — | demo SWR gọi `/api/students/<id>` ghim cứng **[ngoài]** | 200; id ghim cứng đó **không còn ở API ngoài nên trả 404** — tiếng ồn đã biết, khai trong `tolerate` của route |
| `/login` | — | form đăng nhập **[ngoài]** | 200; sai mật khẩu hiện lỗi, không trắng trang |

## 4. Khu private `/me`

**Cửa vào có ba lớp, theo thứ tự** (`middleware.ts`, matcher `/me/:path*` + `/api/me/:path*`):

1. **Config** — thiếu `OWNER_PASSWORD_HASH` hoặc `SESSION_SECRET` → **404** cho mọi route
   `/me`, kể cả `/me/login`. Cố ý: như thể feature không tồn tại.
2. **Cloudflare Access** — chỉ bật khi có **cả hai** biến `CF_ACCESS_*`. Thiếu JWT → **403**
   (không redirect: trang login của Access ở edge, origin không có gì để trỏ tới).
3. **Cookie HMAC** — không có/hết hạn → trang redirect về `/me/login?next=...`, API trả **401**.

`getServerSideProps` của **mọi** trang `/me` gọi lại `requireOwner` — lớp thứ hai, phòng khi
matcher bị sửa sai. Mọi response `/me` đều có header `X-Robots-Tag: noindex, nofollow`.

| URL | Điều kiện vào | Dữ liệu (lúc request) | Dấu hiệu đang chạy đúng |
|---|---|---|---|
| `/me/login` | config hợp lệ (+ Access nếu bật) | — | 200; nhập passphrase đúng → chuyển về `?next=`; sai → lỗi, **không** redirect |
| `/me` | cookie hợp lệ | `loadCockpit()` | 200; cockpit có số liệu; không trắng trang |
| `/me/posts` | cookie hợp lệ | `posts/*.md` trong content dir | 200; fixture có **1** bài |
| `/me/posts/vi-du-bai-viet` | cookie hợp lệ | `loadPost(slug)` — slug ở frontmatter | 200; thân bài render |
| `/me/learn` | cookie hợp lệ | `loadTopicActivity()` | 200; fixture có topic `kubernetes` |
| `/me/learn/kubernetes` | cookie hợp lệ | `learn/<topic>/index.md` + các note | 200; có `index` + note `scheduling` |
| `/me/learn/kubernetes/scheduling` | cookie hợp lệ | `learn/<topic>/<slug>.md` — slug theo **tên file** | 200; thân note render; có flashcard từ `questions[]` |
| `/me/case-studies` | cookie hợp lệ | `case-studies/*.md` | 200; fixture có **2** case study |
| `/me/case-studies/example-migration` | cookie hợp lệ | slug theo **tên file** | 200; 4 phần; flashcard từ `questions[]`; bấm sơ đồ phóng to toàn màn hình |
| `/me/roadmap` | cookie hợp lệ | `roadmap.yaml` + activity | 200; các lane render; checklist tick được |
| `/me/practice` | cookie hợp lệ | content dir; sinh/chấm cần `ANTHROPIC_API_KEY` | 200 **không cần** API key; bấm sinh câu hỏi mà thiếu key → lỗi có thông báo, không trắng trang |

⚠️ **`/me/practice` gọi Anthropic API thật.** Verify phải mock lời gọi này (G1-2) — không thì
mỗi lần chạy verify là một lần trả tiền, và kết quả phụ thuộc model nên không lặp lại được.
Phần *vào được trang* thì không cần key.

⚠️ Dữ liệu `/me` **chỉ được đọc lúc request**, không bao giờ lúc build: repo và image đều
public, đọc lúc build là bake content vào HTML. File sai schema không làm sập trang — entry
hỏng bị bỏ qua và lỗi nằm trong `errors` để trang hiện ra.

---

## Tiếng ồn nền, đã xác nhận không phải lỗi

Đo bằng `npm run verify` ngày 21/11/2026, không phải suy luận từ code.

**Mọi trang công khai đều log một console error `401` từ `/api/profile`.** Đó là `useAuth`
trong `pages/_app.tsx` dò trạng thái đăng nhập; 401 là câu trả lời đúng cho khách ẩn danh.
18 trong 35 route gặp nó. `scripts/verify/index.mjs` bỏ qua đúng cặp (URL `/api/profile`,
mã 401) và đếm lại số lần bỏ qua trong báo cáo — bỏ qua rộng hơn thế thì mất khả năng bắt
lỗi auth thật.

**Trang mà 404 là kỳ vọng cũng log console error.** Response 404 của chính trang đó hiện ra
dưới dạng console error. Verify bỏ qua đúng response của trang khi `status` khai là 404, chứ
không bỏ qua mọi 404 trên trang.

Hai điều này giải thích vì sao "không có console error" **không** dùng được làm tiêu chí thô.
Tiêu chí thật là "không có console error nào ngoài danh sách đã khai, và danh sách đó phải
ngắn và có lý do".

---

## Fixture dùng cho verify

Không tạo thư mục fixture mới. Dùng **`private-content.example/`** đã có trong repo — cùng
thư mục mà `utils/private-content.test.ts` đang dùng (`EXAMPLE` ở dòng 30).

Lý do không tạo `fixtures/private-content/` như doc đầu việc gợi ý: hai fixture cho cùng một
schema **sẽ lệch nhau**, và lúc lệch thì không ai biết bản nào đúng. Đây đúng loại lỗi mà
`CLAUDE.md` đã chép hai lần kinh nghiệm ("thêm mẫu mới thì sửa một file, đừng chép sang").
Thiếu dữ liệu cho một ca verify thì **thêm vào `private-content.example/`**, và ca vitest
tương ứng được lợi theo.

Nội dung fixture hiện có:

```
private-content.example/
├── README.md
├── denylist.example
├── roadmap.yaml
├── case-studies/example-migration.md
├── case-studies/public-candidate-example.md
├── learn/kubernetes/index.md
├── learn/kubernetes/scheduling.md
└── posts/vi-du-bai-viet.md
```

Đủ để mọi trang `/me/*` trong bảng trên render có dữ liệu thật.
