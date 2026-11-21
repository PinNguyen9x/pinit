# Xuất memory MCP — phân loại từng mục

Xuất ngày **21/11/2026** từ `~/.ai-devkit/memory.db` (server MCP `memory`,
`@ai-devkit/memory`). Mục đích: trước khi quyết gỡ hay giữ MCP này, biết trong đó thật sự
có gì và còn giá trị gì.

**Không gỡ MCP ở bước này** — đây chỉ là bản xuất và phân loại.

## Lệnh đã dùng

```bash
sqlite3 ~/.ai-devkit/memory.db \
  "select scope, count(*), max(updated_at) from knowledge group by scope;"

sqlite3 ~/.ai-devkit/memory.db \
  "select scope, title, content, date(updated_at) from knowledge order by scope, created_at;"
```

Đọc thẳng SQLite thay vì gọi `memory_searchKnowledge` là có lý do: tool MCP đòi một
**query**, nên không có cách nào chắc chắn là đã lấy *hết*. SQLite cho đủ 21 mục và đếm được.

## Doc đầu việc nói một scope, thực tế có ba

G0-5 ghi "xuất toàn bộ knowledge scope `project:pinit`". Nếu làm đúng chữ đó thì
**bỏ sót 17 trong 21 mục**:

| Scope | Số mục | Ghi lần cuối |
|---|---|---|
| `repo:pinit` | **13** | 2026-08-30 |
| `global` | 4 | 2026-07-19 |
| `project:pinit` | **4** | 2026-07-19 |
| **Tổng** | **21** | |

Bản xuất này lấy cả ba scope.

**Số đáng chú ý nhất không nằm trong bảng trên: mục mới nhất ghi ngày 30/08/2026 — gần
3 tháng không có gì được thêm.** Trong khi đó `CLAUDE.md` vẫn đang chỉ định `saveKnowledge`
làm chỗ lưu learnings. Nghĩa là luật thì còn mà thói quen đã dừng; learnings 3 tháng qua
nằm ở chỗ khác (file memory của Claude Code, Plane Wiki, chính `CLAUDE.md`).

---

## Tổng kết phân loại

| Nhãn | Số mục |
|---|---|
| **Bỏ** | 13 |
| **Chuyển vào `CLAUDE.md`** | 5 |
| **Thành lint rule / check** (vào G3-9) | 3 |

13/21 mục bỏ được, và **không một mục nào bị bỏ vì "không quan trọng"** — 7 mục đã nằm
nguyên trong `CLAUDE.md` rồi, 6 mục đã hết hiệu lực vì code hoặc máy đã đổi. Đó là lập luận
mạnh nhất cho việc gỡ MCP: nội dung có giá trị đã tự di cư sang `CLAUDE.md`, phần còn lại
là bản sao cũ và không ai dọn.

---

## Bảng phân loại đủ 21 mục

| # | Scope | Tiêu đề | Nhãn | Căn cứ |
|---|---|---|---|---|
| 1 | global | ai-devkit CLI quirks | **Bỏ** | Cờ CLI của ai-devkit; G0-2 đề xuất gỡ 14 skill ai-devkit |
| 2 | global | pinit git workflow | **Bỏ** | Trùng "Quy ước commit" + "Git workflow" của `CLAUDE.md`, bản `CLAUDE.md` chi tiết hơn |
| 3 | global | pinit MCP setup | **Bỏ** | `CLAUDE.md` có bảng chẩn 4 triệu chứng MCP, chi tiết hơn hẳn |
| 4 | global | pinit ai-devkit runbook & troubleshooting | **Bỏ** | Gắn với ai-devkit; phần "Node ≥22" đã hết hiệu lực |
| 5 | project:pinit | merge feature vào main bằng merge --no-ff, agent không tự push | **Bỏ** | Trùng gần như nguyên văn `CLAUDE.md` |
| 6 | project:pinit | ai-devkit CLI lỗi trên Node 20.18.1 | **Bỏ** | Hết hiệu lực: `.nvmrc` = 22, máy đang chạy `v26.5.0` |
| 7 | project:pinit | Pages Router — `/glossary/index.tsx` trùng route với `glossary.tsx` | **Lint rule** | → **L1** bên dưới |
| 8 | project:pinit | trang mới giữ self-contained, chỉ tách shared khi có consumer thứ 2 | **`CLAUDE.md`** | → **C1** bên dưới |
| 9 | repo:pinit | vitest chỉ test logic thuần, không có jsdom | **`CLAUDE.md`** | → **C2** bên dưới |
| 10 | repo:pinit | `MermaidFlowchart.tsx` là stub chết | **Bỏ** | Hết hiệu lực: `components/mermaid/` đã bị xóa khỏi repo |
| 11 | repo:pinit | Pages Router — file tĩnh thắng dynamic `[slug]` | **Lint rule** | → **L1** bên dưới |
| 12 | repo:pinit | vitest không type-check, phải chạy cả `npm run build` | **`CLAUDE.md`** | → **C3**; phần `target es5` → **L3** |
| 13 | repo:pinit | có HAI header, `ROUTE_LIST` trong `routes.ts` là code chết | **Bỏ** | Hết hiệu lực: `ROUTE_LIST` không còn ở đâu trong repo |
| 14 | repo:pinit | dev server rất chậm, kiểm UI bằng production build | **`CLAUDE.md`** | → **C4**, và là ràng buộc thiết kế của G1-3 |
| 15 | repo:pinit | barrel constants kéo dữ liệu lớn vào bundle mỗi trang | **Lint rule** | → **L2** bên dưới |
| 16 | repo:pinit | pinit portfolio: dẫn bằng knowledge tracks | **Bỏ** | Quyết định nội dung đã thực hiện xong; `getWorkHref` đã gộp về `utils/work.ts` (có test) |
| 17 | repo:pinit | Plane MCP: không deny được action `delete` ở tầng permission | **Bỏ** | Hệ quả đã nằm trong `CLAUDE.md` (hardcode UUID) và `.claude/settings.json` (deny 3 tool) |
| 18 | repo:pinit | Setup Plane Cloud: env var, dò slug, bẫy PQL trả rỗng im lặng | **Bỏ** | Bẫy PQL rỗng và ca env đã có trong `CLAUDE.md`; phần dò slug → Wiki |
| 19 | repo:pinit | MCP config cấp máy: scope user, đừng sửa `.mcp.json` skip-worktree | **Bỏ** | Đã có trong `CLAUDE.md` mục config MCP `plane` |
| 20 | repo:pinit | ĐÃ CHỐT: branch đã push thì không sync | **Bỏ** | Đã có trong `CLAUDE.md` mục "Git workflow", kèm bẫy `--merged main` |
| 21 | repo:pinit | Thêm term glossary: script check cấu trúc, agent soát nội dung | **`CLAUDE.md`** | → **C5** bên dưới |

### Ba mục nhãn "Bỏ" nhưng có phần nên cứu sang Wiki

Nhãn "bỏ" ở đây nghĩa là **bỏ khỏi memory MCP**, không phải "nội dung vô giá trị". Ba mục
17, 18, 19 là chẩn lỗi hạ tầng — theo đúng luật ba lớp trong `CLAUDE.md`, chỗ của chúng là
**Plane Wiki**, không phải memory riêng của agent:

- **17** — cách kiểm danh sách `action` của `plane-mcp-server` bằng cách đọc source đã cài,
  và lý do "allow một tool = allow cả `delete`". Runbook *Runbook — MCP Plane 403* đã có
  phần 403; phần permission này thì chưa.
- **18** — cách dò workspace slug bằng mã HTTP (200 / 403 / 404), vì Plane API không có
  endpoint list workspaces. Thông tin này không nằm ở đâu khác.
- **19** — đánh đổi của scope user: tool hiện ở mọi project nhưng `deny` lại là cấp project,
  nên guardrail biến mất ở repo khác. `CLAUDE.md` nói *dùng* scope user nhưng không nói
  đánh đổi này.

Việc chép sang Wiki **không thuộc G0-5** (G0-5 chỉ phân loại). Nếu chủ repo quyết gỡ MCP thì
làm trước khi gỡ, kẻo mất.

---

## Nhóm "chuyển vào `CLAUDE.md`" — 5 mục

Viết sẵn ở dạng gần như dán được. Mục này **chưa sửa `CLAUDE.md`** — chờ quyết định về MCP
rồi làm một lần, vì nếu giữ MCP thì vài mục không cần chuyển.

**C1 — Chỉ tách shared khi có consumer thứ hai.** Trang/tính năng mới cần logic đã có thì
giữ self-contained; chỉ tách ra `components/common` hoặc `utils/` khi thật sự có consumer
thứ hai. Refactor sớm làm regression trang đang chạy ổn.

**C2 — `vitest` chạy môi trường `node`, không có jsdom.** Chỉ test được hàm thuần. Muốn test
hook hay component React thì phải cài `jsdom` + `@testing-library/react` trước — đừng viết
test component rồi chờ nó chạy. Chưa cài coverage provider nên không báo con số coverage.

**C3 — `npm test` xanh không thay được `npm run build`.** `vitest` dùng esbuild nên không
type-check; lỗi TypeScript thật lọt qua toàn bộ test xanh. Ca đã gặp: `text.matchAll()` làm
`next build` fail trong khi 35 ca test vẫn pass.

**C4 — Kiểm UI bằng production build, không bằng `next dev`.** `next dev` compile 48–50s mỗi
route và tự restart vì chạm ngưỡng RAM, `curl` timeout. Cách đúng:
`npm run build && npm start` rồi kiểm `localhost:3000`. Lưu ý `npm run dev` ghi đè `.next`
nên sau khi chạy dev phải build lại. Port còn bị giữ thì `lsof -ti:3000 | xargs kill -9`.
**Đây là ràng buộc thiết kế của G1-3**: CLI verify phải tự `build` rồi `start`, không được
dựa vào `next dev`.

**C5 — Thêm term vào `constants/glossary.ts` cần hai tầng kiểm.** Tầng 1 là script parse
toàn file (bắt lỗi cấu trúc: trùng term, `cat` sai union, thiếu `💡 Dễ nhớ:`, `related` trỏ
sai). Tầng 2 là agent `glossary-reviewer` (`.claude/agents/glossary-reviewer.md`) soát độ
chính xác kỹ thuật của `short`/`detail`. Không tầng nào thay được tầng kia: lần thêm 10 term
(25/08/2026) tầng 1 báo sạch tuyệt đối nhưng tầng 2 bắt 4 lỗi nội dung.

> Phần kinh nghiệm chi tiết của C5 — ba loại lỗi nội dung hay lặp (khẳng định tuyệt đối ·
> công cụ đã ngừng phát triển · tên riêng một platform dùng như tên chung) — dài hơn mức một
> dòng luật. Chỗ đúng là **Wiki**, `CLAUDE.md` chỉ trỏ tới.

---

## Nhóm "thành lint rule" — đầu vào cho G3-9

Ba rule. **Chỉ L2 là ESLint rule thật**; hai cái còn lại không biểu diễn được bằng ESLint,
nên ghi rõ ở đây để G3-9 không mất thời gian thử.

### L1 — Xung đột route của Pages Router (gộp mục 7 + 11)

Hai lỗi cùng một họ, cùng đặc điểm: `next build`, `npm test` và lint đều **xanh** trong khi
route đã chết.

1. `pages/<x>.tsx` tồn tại song song với thư mục `pages/<x>/` chứa `index.tsx` → cả hai map
   cùng một URL, xung đột. (Hợp lệ nếu thư mục chỉ có file tên *khác* `index`, như
   `pages/glossary.tsx` + `pages/glossary/muc-luc.tsx` hiện tại.)
2. Trong `pages/<x>/`, file tĩnh thắng `[slug].tsx`. Nếu dữ liệu có item mang `slug` trùng
   tên file tĩnh thì trang của item đó **vĩnh viễn không truy cập được**. Repo đang có đúng
   cặp rủi ro này: `pages/system-design/cheat-sheet.tsx` cạnh `pages/system-design/[slug].tsx`.

**Không phải ESLint rule.** ESLint xem từng file, không thấy quan hệ giữa cây thư mục và dữ
liệu. Chỗ đúng là một **check script** — và nó thuộc về `scripts/verify/` của G1-3 hơn là
giai đoạn 3, vì verify đã có sẵn danh sách route từ feature map. Rule 2 cần đọc dữ liệu
(`constants/system-design.ts`) nên hợp nhất với một ca vitest.

### L2 — Cấm import barrel `@/constants` từ code dùng chung

Chuỗi đã gây lỗi: `pages/_app` → `@/components/common` → `header/index.tsx` → `@/hooks` →
barrel `@/constants`. Hậu quả: **mọi** thứ re-export từ `constants/index.ts` bị gộp vào
bundle dùng chung của toàn site — 13 buổi System Design và 109 thuật ngữ glossary tải trên
cả trang chủ. Shared first-load 340kB → 264kB sau khi sửa.

Rule: `no-restricted-imports` cấm pattern `@/constants` (đúng barrel, không cấm
`@/constants/*`) trong `components/**`, `hooks/**`, `context/**` và `pages/_app.tsx`.
Thông báo lỗi phải nêu cách đúng: *"import từ module cụ thể, ví dụ `@/constants/storage-key`"*.

Hiện trạng: **2 file** import barrel, cả hai là `pages/glossary.tsx` và
`pages/glossary/muc-luc.tsx` — đúng chỗ cần `GLOSSARY` và không nằm trong chuỗi dùng chung.
Nên rule này thêm được mà **không phải dọn vi phạm cũ**.

Lưu ý loại lỗi: lint, type-check và test đều xanh trong lúc lỗi tồn tại — chỉ đọc kích thước
chunk trong output `next build` mới thấy. Đó là lý do nó phải thành rule chứ không phải lời nhắc.

### L3 — Cú pháp vượt `target: es5` (phần còn lại của mục 12)

`tsconfig.json` đặt `target: es5`, nên `matchAll`, `for-of` trên iterator, spread của
`Set`/`Map` làm `next build` fail. Hai đường:

- `no-restricted-syntax` chặn vài cú pháp cụ thể — chữa triệu chứng, danh sách không bao giờ đủ.
- **Hoặc xem lại `target: es5`.** Repo đã bỏ hẳn IE; `es5` làm bundle lớn hơn và cấm cú pháp
  hiện đại mà không ai còn cần. Nâng `target` lên `es2017+` xóa cả họ lỗi này một lần.

**Đây là câu hỏi cho chủ repo, không phải việc agent tự quyết** — đổi `target` ảnh hưởng
output build của cả site. Nếu giữ `es5` thì làm `no-restricted-syntax`; nếu nâng thì L3
không còn cần.

---

## Bản xuất đầy đủ

21 mục với nguyên văn `content` nằm ở `docs/agent-workflow/memory-export-raw.md` — xuất
thô, không biên tập, để sau này còn tra lại được nếu MCP bị gỡ.
