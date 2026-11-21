# Bản xuất thô memory MCP — 21 mục

Xuất **21/11/2026** từ `~/.ai-devkit/memory.db`, nguyên văn, **không biên tập**.
Phân loại và việc cần làm nằm ở `memory-export.md`; file này chỉ để tra lại sau khi MCP bị gỡ.

Lệnh sinh file:

```bash
sqlite3 ~/.ai-devkit/memory.db \
  "select '## '||title||char(10)||char(10)
          ||'- scope: `'||scope||'`'||char(10)
          ||'- tags: `'||tags||'`'||char(10)
          ||'- tạo: '||date(created_at)||' · sửa: '||date(updated_at)||char(10)||char(10)
          ||content||char(10)||char(10)||'---'||char(10)
   from knowledge order by scope, created_at;"
```

Thứ tự: `global` → `project:pinit` → `repo:pinit`, trong mỗi scope theo ngày tạo.
Tiêu đề mỗi mục là `##`. Vài mục có `##` riêng bên trong phần nội dung — giữ nguyên, không
hạ cấp, để bản xuất đúng là nguyên văn. Điều hướng bằng panel outline hoặc `Cmd + F`.

---

## ai-devkit CLI quirks

- scope: `global`
- tags: `[]`
- tạo: 2026-07-19 · sửa: 2026-07-19

kill <name> positional; detail --id <name>; memory search -q <query>; không có memory list; channel start --agent --daemon

---

## pinit git workflow

- scope: `global`
- tags: `[]`
- tạo: 2026-07-19 · sửa: 2026-07-19

Commit thể mệnh lệnh ≤72 ký tự, không co-author. Agent không push. Sync worktree: rebase origin/main. Merge feature về main: git merge --no-ff, do người làm.

---

## pinit MCP setup

- scope: `global`
- tags: `[]`
- tạo: 2026-07-19 · sửa: 2026-07-19

MCP memory wire qua .mcp.json project root; session mới cần approve prompt; nếu server không hiện: claude mcp reset-project-choices

---

## pinit ai-devkit runbook & troubleshooting

- scope: `global`
- tags: `[]`
- tạo: 2026-07-19 · sửa: 2026-07-19

MCP wire: .ai-devkit.json mcpServers + .mcp.json root, approve prompt khi start, kẹt thì claude mcp reset-project-choices. Memory CLI: search -q, store --title/--content, không có list. Store qua agent phải gọi đích danh MCP tool. Bridge Telegram: restart sau khi kill agent, người nhắn đầu được authorize. Node ≥22 cho ai-devkit console. Lệnh phase prefix /dev-. Config hạ tầng sửa ở main rồi push + sync.

---

## pinit: merge feature vào main bằng merge --no-ff, agent không tự push

- scope: `project:pinit`
- tags: `["git","convention","workflow","pinit","merge","commit"]`
- tạo: 2026-07-19 · sửa: 2026-07-19

## Quy ước Git — project pinit

- **Merge feature về `main`**: dùng `git merge --no-ff` (giữ lại merge commit, không fast-forward). Việc merge về main do người dùng hoặc agent integrator làm.
- **Push**: agent **không** tự `git push` — để người dùng tự push.
- **Không** dùng `--force`, `git reset --hard`, hoặc sửa lịch sử commit.
- **Đồng bộ với main**: dùng `git rebase origin/main`, **không** `git merge main`. Không rebase branch đã push lên remote. Nếu rebase conflict thì dừng lại, báo người dùng, không tự resolve.
- **Commit**: Conventional Commits `<type>(<scope>): <mô tả>` (imperative, ≤72 ký tự, không dấu chấm cuối). Không thêm co-author / footer quảng cáo tool. Mỗi commit một thay đổi logic. Chạy `npm run lint` trước khi commit.

---

## pinit: ai-devkit CLI lỗi trên Node 20.18.1, docs feature phải tạo tay

- scope: `project:pinit`
- tags: `["ai-devkit","tooling","node","docs","pinit"]`
- tạo: 2026-07-19 · sửa: 2026-07-19

## Tooling constraint — project pinit (frontend Next.js)

- Máy local chạy **Node v20.18.1**, nhưng `ai-devkit` (>=0.47) yêu cầu **Node >=20.20 / một số dep >=22**.
- Hệ quả: `npx ai-devkit@latest docs init-feature <name>` **crash** với `ERR_MODULE_NOT_FOUND: Cannot find package 'telegraf'` (channel.js). `lint`/`memory search` cũng chỉ in warning EBADENGINE, không chạy đúng.
- **Workaround**: tạo docs feature **thủ công** tại `docs/ai/features/<name>/{requirements,design,testing}.md`, theo template ở `docs/ai/<phase>/README.md`. Docs đã init sẵn tại `docs/ai/` (config `.ai-devkit.json`, không có `paths.docs` custom → mặc định `docs/ai`).
- Muốn dùng CLI đầy đủ: nâng Node >= 22 (nvm).

---

## pinit: Next.js Pages Router — /glossary/index.tsx trùng route với glossary.tsx

- scope: `project:pinit`
- tags: `["nextjs","pages-router","routing","glossary","pinit"]`
- tạo: 2026-07-19 · sửa: 2026-07-19

## Next.js Pages Router routing — project pinit

- Dự án dùng **Pages Router** (`pages/*.tsx`), không phải App Router.
- `pages/glossary.tsx` map route `/glossary`. Nếu tạo thêm `pages/glossary/index.tsx` thì **cả hai cùng map `/glossary` → xung đột route**.
- Muốn có trang con dưới `/glossary` mà vẫn giữ `pages/glossary.tsx`: đặt file tên khác trong thư mục, ví dụ `pages/glossary/muc-luc.tsx` → `/glossary/muc-luc`. (Next cho phép tồn tại song song `pages/glossary.tsx` + thư mục `pages/glossary/` với các route con tên khác `index`.)
- Áp dụng cho feature `glossary-index` (mục lục thuật ngữ nhóm theo category): route chốt là **`/glossary/muc-luc`**, KHÔNG `/glossary/index`.

---

## pinit: trang mới giữ self-contained, chỉ tách shared khi có consumer thứ 2

- scope: `project:pinit`
- tags: `["architecture","frontend","refactor","reuse","glossary","pinit"]`
- tạo: 2026-07-19 · sửa: 2026-07-19

## Nguyên tắc kiến trúc frontend — project pinit

- Khi thêm trang/tính năng mới cần logic đã có (vd hàm `Highlight` local trong `pages/glossary.tsx`), **ưu tiên giữ trang mới self-contained** thay vì refactor file đang chạy ổn để export/chia sẻ.
- Chỉ **tách ra component/util dùng chung** (vd `components/common`) khi thực sự có **consumer thứ 2 cần dùng** — tránh refactor sớm gây rủi ro regression cho trang đang hoạt động.
- Áp dụng ở feature `glossary-index`: trang mục lục `/glossary/muc-luc` KHÔNG dùng lại `Highlight` (bỏ highlight, search chỉ lọc), để không đụng `glossary.tsx`.
- Component tái dùng an toàn (đã export sẵn ở `components/common`): `Seo`, `BackgroundFx`; layout `MainLayout` (`components/layouts`); dữ liệu `GLOSSARY`/`GlossaryTerm` (`@/constants`).

---

## pinit: vitest chi test logic thuan, khong co jsdom

- scope: `repo:pinit`
- tags: `["pinit","testing","vitest","convention"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

Tu 2026-07-26 repo pinit co vitest (npm test / npm run test:watch), cau hinh o vitest.config.ts: environment node, KHONG jsdom, KHONG testing-library, include **/*.test.ts. Chi test duoc ham thuan - muon test hook hay component React thi phai cai them jsdom + @testing-library/react truoc. Coverage provider chua cai nen dung bao con so coverage. Truoc do repo khong co test runner nao.

---

## pinit: MermaidFlowchart.tsx la stub chet, dung pattern o blog/[slug].tsx

- scope: `repo:pinit`
- tags: `["pinit","mermaid","nextjs","tech-debt"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

components/mermaid/MermaidFlowchart.tsx co toan bo than ham bi comment, chi render chu 'MermaidFlowchart' - KHONG dung component nay. Pattern mermaid dang chay that nam o pages/blog/[slug].tsx:72 va pages/works/[workId]/details.tsx:139: dynamic import('mermaid') trong useEffect, query cac node .mermaid roi render SVG vao do, co catch console.error. Khi can mermaid o trang moi thi tach hooks/use-mermaid.ts tu pattern nay.

---

## pinit: Pages Router - file tinh thang dynamic [slug] trong cung thu muc

- scope: `repo:pinit`
- tags: `["pinit","nextjs","routing","pitfall"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

Trong pages/<x>/, file tinh (vd cheat-sheet.tsx) duoc uu tien hon [slug].tsx. Neu data co mot item mang slug trung ten file tinh thi trang cua item do vinh vien khong truy cap duoc. Luon them ca kiem thu 'khong item nao co slug trung ten file tinh'. Ngoai ra KHONG duoc tao pages/<x>.tsx song song voi thu muc pages/<x>/ - dung route (da gap o feature glossary-index).

---

## pinit: vitest khong type-check, phai chay ca npm run build

- scope: `repo:pinit`
- tags: `["pinit","vitest","typescript","es5","pitfall"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

vitest dung esbuild nen KHONG type-check. Loi TypeScript that su van lot qua toan bo test xanh. Vi du da gap: text.matchAll() lam next build fail voi 'can only be iterated through when using downlevelIteration or target es2015+' vi tsconfig cua pinit dat target es5 - 35 ca test van pass. Ket luan: 'npm test' xanh KHONG thay the duoc 'npm run build'; phai chay ca hai truoc khi coi mot task la xong. Luu y them: tsconfig target es5 nen tranh matchAll, for-of tren iterator, spread cua Set/Map - dung exec trong vong lap hoac Array.from.

---

## pinit: co HAI header, ROUTE_LIST trong routes.ts la code chet

- scope: `repo:pinit`
- tags: `["pinit","header","nextjs","dead-code","pitfall"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

MainLayout import dong components/common/header/index.tsx - file nay co mang navItems HARDCODE ben trong (Home, Blog, Glossary, System Design, Works). Muon them/sua tab header thi sua navItems o day. File components/common/header/header-desktop.tsx va header-mobile.tsx dung ROUTE_LIST tu routes.ts nhung KHONG duoc import o bat ky dau - code chet, sua vao do khong co tac dung gi. Da mat mot vong sua nham (commit ad8769b phai revert). Luu y: next build va npm test deu KHONG phat hien duoc loai loi nay vi sua vao code chet van compile sach va pass het test - phai mo trinh duyet moi thay.

---

## pinit: dev server rat cham, kiem UI bang production build

- scope: `repo:pinit`
- tags: `["pinit","nextjs","dev-server","verification"]`
- tạo: 2026-07-26 · sửa: 2026-07-26

next dev cua pinit compile 48-50s moi route (16k-27k module) va tu restart vi cham nguong RAM - curl bi timeout, khong kiem UI duoc. Cach lam viec: chay 'npm run build && npm start' roi kiem tren localhost:3000, phan hoi duoi 10ms. Luu y npm run dev ghi de thu muc .next nen sau khi chay dev phai build lai truoc khi npm start. Neu port 3000 con bi giu thi 'lsof -ti:3000 | xargs kill -9'. Header duoc import dong voi ssr:false nen KHONG xuat hien trong HTML tu curl - phai dung trinh duyet that de kiem tab header.

---

## pinit: barrel constants keo du lieu lon vao bundle moi trang

- scope: `repo:pinit`
- tags: `["pinit","bundle","nextjs","performance","barrel","pitfall"]`
- tạo: 2026-07-27 · sửa: 2026-07-27

Chuoi phu thuoc: pages/_app -> @/components/common -> header/index.tsx -> @/hooks -> use-auth va cac hook khac -> import barrel @/constants. Hau qua: MOI THU re-export tu constants/index.ts bi gop vao bundle dung chung cua toan site. Da tung lam noi dung 13 buoi System Design va 109 thuat ngu glossary tai tren ca trang chu va blog; shared first-load 340kB. Sau khi doi 6 hook import tu module cu the (@/constants/storage-key, @/constants/query-key) va go ./system-design khoi barrel: 264kB, _app 236kB->160kB. QUAN TRONG: lint, type-check va toan bo test deu XANH trong luc loi ton tai - chi doc kich thuoc chunk trong output next build moi thay. Kiem bang: grep chuoi ASCII dac trung trong .next/static/chunks/pages/_app-*.js, va node -e doc .next/build-manifest.json xem trang nao tai chunk nao.

---

## pinit portfolio: dẫn bằng knowledge tracks, không phải danh sách works

- scope: `repo:pinit`
- tags: `["portfolio","content","nextjs","works","blog"]`
- tạo: 2026-08-08 · sửa: 2026-08-08

## Bố cục nội dung pinit (chốt 2026-08-08, feature `enhance-content-pinit`)

Tài sản mạnh của pinit nằm ở **blog**, không phải ở works:

| Nguồn | Vị trí | Quy mô |
|---|---|---|
| Blog | `blog/*.md` + `utils/posts.ts` | 30 bài; cụm AI/Claude Code 13 bài ~322k ký tự |
| System design | `constants/system-design.ts` | 13 bài |
| Glossary | `constants/glossary.ts` | 109 thuật ngữ |
| Works | API repo riêng `json-server-blog` | 11 work, `fullDescription` chỉ 189–599 ký tự |

**Quyết định:** trang chủ dẫn bằng 4 knowledge track (AI & Claude Code · DevOps
CI/CD→GitOps · Kafka & Redis · Frontend craft), derive từ `tags` trong frontmatter
— không hardcode. Works rút còn 3 case study có chiều sâu (`pinit`, `Json-Server`,
`Twitter-Node-Server`); 8 cái còn lại gom thành "Other experiments".

Lý do: nhà tuyển dụng đọc kỹ 2–3 project chứ không đọc 11; để tic tac toe cạnh
Kafka làm loãng.

## Ràng buộc khi thêm nội dung work

- **Không đổi schema `Work`** (`models/work.ts`) vì dữ liệu ở repo API riêng.
- `fullDescription` đã render markdown + mermaid server-side (`utils/markdown.ts`,
  dùng ở `pages/works/[workId]/details.tsx`) → viết case study **không cần code mới**.
- Sửa nội dung qua form `/works/{id}` (có `requireLogin`) hoặc sửa thẳng repo
  `json-server-blog`.
- Case study theo 4 phần: Bối cảnh · Vấn đề · Giải pháp · Kết quả.

## Bẫy routing (đã có trong requirements doc)

`getWorkHref` lặp nguyên văn ở 3 file (`work-grid-card.tsx`, `work-mini-card.tsx`,
`work-hero.tsx`). Work `published` + có `slug` bị trỏ sang `/works/{id}/{slug}` —
route này chỉ render game, nuốt mất trang `details.tsx`. Khi sửa phải sửa cả 3 nơi;
tốt nhất gộp về `utils/`.

---

## Plane MCP: không deny được action delete ở tầng permission

- scope: `repo:pinit`
- tags: `["plane","mcp","permissions","claude-code","settings"]`
- tạo: 2026-08-25 · sửa: 2026-08-25

`plane-mcp-server` (Python, uvx) gói **mỗi resource thành một tool duy nhất với `action` là tham số**, không tách tool theo thao tác:

```
mcp__plane__workitem  action: list|retrieve|search|count|create|update|delete|archive|manage_assignee|manage_label
mcp__plane__workitem_comment  action: list|retrieve|create|update|delete
```

Permission rule của Claude Code match theo **tên tool**, không match argument (chỉ `Bash(cmd:*)` mới match được prefix). Hệ quả:

- "Cho create/update, cấm delete" trên cùng một tool là **không biểu diễn được** trong `.claude/settings.json`.
- Allow `mcp__plane__workitem` = allow luôn `action: "delete"`.

Cách xử lý đã dùng trong pinit:
1. Deny **nguyên tool** những resource không bao giờ cần ghi: `mcp__plane__project`, `mcp__plane__module`, `mcp__plane__cycle`. Cái này cưỡng chế được thật.
2. Cấm `delete` work item bằng **rule trong CLAUDE.md** — guardrail mềm, không cưỡng chế.
3. Vì `module` bị deny nên **hardcode UUID** của project/module/state vào CLAUDE.md để agent không cần gọi tool đó.

Kiểm chứng danh sách action bằng cách đọc source đã cài:
`~/.cache/uv/archive-v0/*/lib/python3.10/site-packages/plane_mcp/tools/*.py` — xem block `ACTIONS = (...)` và `Literal[...]`.

---

## Setup Plane Cloud: env var, dò slug, và bẫy PQL trả rỗng im lặng

- scope: `repo:pinit`
- tags: `["plane","mcp","env-var","pql","debugging","api"]`
- tạo: 2026-08-25 · sửa: 2026-08-25

Ba cái vấp khi wire Plane Cloud vào pinit, đều mất thời gian đoán:

**1. `${PLANE_API_KEY}` trong `.mcp.json` expand từ process env của Claude Code, không phải từ `~/.zshrc`.**
Export biến vào `~/.zshrc` xong thì session Claude Code / tmux pane **đang mở** vẫn không thấy — non-interactive shell không source `.zshrc`. Triệu chứng: MCP chết với `ValueError: PLANE_API_KEY is not set`. Phải thoát và mở lại Claude Code từ terminal đã source. Kiểm tra nhanh: `echo ${#PLANE_API_KEY}` trong Bash tool.

**2. Plane API không có endpoint list workspaces.**
`/api/v1/workspaces/` và `/api/v1/users/me/workspaces/` đều trả 404. Cách dò slug khi quên:
```bash
curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: $PLANE_API_KEY" \
  "https://api.plane.so/api/v1/workspaces/<slug>/projects/"
# 200 = đúng slug | 403 = slug tồn tại nhưng không phải của mình | 404 = không tồn tại
```
`/api/v1/users/me/` (200) dùng để verify token còn sống.

**3. PQL sai module id → trả rỗng, KHÔNG báo lỗi.**
```json
{"results": [], "total_count": 0, "count": 0}
```
Nhìn y hệt "hết việc". Với workflow "đầu session query task", đây là lỗi im lặng nguy hiểm nhất: agent kết luận không có gì để làm rồi ngồi không. Luôn query bằng **UUID hardcode**, không bằng tên module, và coi list rỗng là tín hiệu phải đối chiếu lại id.

**Ghi chú thêm:** `plane-mcp-server` không có `--help` — arg là positional `stdio|sse|http`, truyền sai thì crash `ValueError: '--help' is not a valid ServerMode`. `PLANE_BASE_URL` default sẵn là `https://api.plane.so` (`plane_mcp/client.py`).

Smoke test MCP không cần restart Claude Code: spawn `uvx plane-mcp-server stdio` bằng subprocess rồi bắn JSON-RPC (`initialize` → `notifications/initialized` → `tools/call`) vào stdin.

---

## MCP config cấp máy: dùng scope user, đừng sửa .mcp.json skip-worktree

- scope: `repo:pinit`
- tags: `["mcp","claude-code","skip-worktree","config","plane","secrets"]`
- tạo: 2026-08-25 · sửa: 2026-08-25

`.mcp.json` của pinit có bit **skip-worktree** (`git ls-files -v .mcp.json` → `S`). Đặt có chủ đích: bản trong git dùng `npx -y @ai-devkit/memory`, bản local trỏ absolute path `/opt/homebrew/lib/node_modules/ai-devkit/.../dist/index.js` — workaround cho bug npx/Node 26.

Hệ quả dễ dính bẫy: **sửa `.mcp.json` thì `git status` sạch trơn**, thay đổi không vào git và không lan sang worktree khác. Đừng gỡ skip-worktree để commit, sẽ kéo theo absolute path của máy.

Cách đúng cho MCP server có secret/env riêng của máy — dùng scope user:
```bash
claude mcp add plane --scope user \
  --env PLANE_API_KEY='${PLANE_API_KEY}' \
  --env PLANE_WORKSPACE_SLUG=pin \
  --env PLANE_BASE_URL=https://api.plane.so \
  -- uvx plane-mcp-server stdio
```
Nháy đơn quanh `'${PLANE_API_KEY}'` là bắt buộc — để shell không expand, lưu chuỗi literal vào `~/.claude.json` cho Claude Code expand lúc spawn. Verify không lộ token: `grep -c "plane_api_" ~/.claude.json` phải ra 0.

**Đánh đổi phải nhớ:** scope user = tool xuất hiện ở *mọi* project trên máy, nhưng `.claude/settings.json` deny lại là **cấp project**. Guardrail biến mất ở các repo khác. Nếu deny mang tính an toàn thì đặt luôn ở `~/.claude/settings.json` cho khớp phạm vi tool:
```json
{ "permissions": { "deny": ["mcp__plane__project", "mcp__plane__module", "mcp__plane__cycle"] } }
```

Health check: `claude mcp list` — nhưng phải chạy từ shell đã source `~/.zshrc`, không thì báo `PLANE_API_KEY is not set` gây hiểu nhầm là config sai.

---

## ĐÃ CHỐT: branch đã push thì không sync, tạo branch mới từ main

- scope: `repo:pinit`
- tags: `["git","workflow","claude-md","agents-sh","rebase","resolved","plane"]`
- tạo: 2026-08-25 · sửa: 2026-08-30

**Đã chốt và sửa xong 30/08/2026** (PINIT-17, commit `21d09bc`). Trước đó là TODO treo từ 25/08.

Vấn đề cũ: hai dòng trong "Git workflow" của CLAUDE.md khoá lẫn nhau khi branch đã push —
"đồng bộ bằng `git rebase origin/main`" phát biểu vô điều kiện, cộng với "không rebase branch
đã push" ⇒ không còn đường hợp lệ nào.

**Quyết định: branch đã push thì KHÔNG sync nữa.** Không rebase (sai lịch sử người khác đã
fetch, chữa lệch chỉ còn `--force` cũng bị cấm), cũng không merge (đẻ merge commit vào nhánh
feature). Cần main mới thì **merge PR hiện tại rồi tạo branch mới từ `origin/main`**.

Đã đồng bộ cả hai đầu, đừng sửa một bên rồi quên bên kia:
- `CLAUDE.md` — luật rebase thêm điều kiện "chỉ cho branch chưa push"; thêm bullet riêng cho
  branch đã push; **xoá** dòng cũ "Không rebase branch đã push" vì đã gộp vào bullet mới.
- `~/bin/pinit-agents.sh` — `sync_one()` trước in gợi ý `git merge origin/main` (đúng thứ luật
  cấm), đã đổi thành gợi ý merge PR rồi `agents create <tên-mới>`.
  ⚠️ File này **nằm ngoài repo pinit**, `~/bin` không phải git repo — không có commit nào bảo vệ.

Kiểm branch đã push chưa:
```bash
git rev-parse --verify origin/$(git branch --show-current)
```

**Bẫy còn nguyên giá trị:** sau khi một branch đã push bị rebase lên main tip, `git branch
--merged main` với branch đó là **kết luận vô nghĩa** — nó "merged" vì bị rebase, không phải
vì việc của nó nằm trong main. Muốn biết thật thì tra lịch sử PR. Đã ghi luôn vào CLAUDE.md.

**Hệ quả vận hành:** mỗi việc nên có branch riêng tạo từ `origin/main`. Phiên 29–30/08 làm
ngược lại (push `feat/create-new-blog`, merge PR #31, rồi push tiếp lên chính branch đó) nên
phải mở PR #32 trên một branch đã merge một lần — đúng thứ luật mới tránh được.

**Chưa kiểm được:** thông điệp mới chỉ chạy khi có branch *đã push nhưng chưa merge*; lúc sửa
không worktree nào ở trạng thái đó, mới qua `bash -n` và đọc tay. Lần tới gặp thì đối chiếu.

**Hai bài học phụ cùng phiên:**
1. Đừng chạy `agents sync` khi working tree còn thay đổi chưa commit — `sync_one` gỡ cờ
   skip-worktree rồi `checkout -- .mcp.json` và rebase, dễ đụng việc đang dở. Commit trước.
2. **Plane API bị Cloudflare WAF chặn (HTTP 403 kèm trang "Sorry, you have been blocked")
   nếu `description_html` chứa chuỗi kiểu `curl ... | bash`.** Đây KHÔNG phải ca 403
   "Given API token is not valid" trong CLAUDE.md — phân biệt bằng body: WAF trả HTML
   Cloudflare có Ray ID, còn lỗi token trả JSON. Cách chữa: diễn đạt lệnh bằng lời
   ("native installer", "một request HEAD") thay vì dán nguyên lệnh có pipe sang shell.

---

## Thêm term glossary: script check cấu trúc, agent soát nội dung

- scope: `repo:pinit`
- tags: `["glossary","review","workflow","content-quality"]`
- tạo: 2026-08-25 · sửa: 2026-08-25

Khi thêm mục vào `constants/glossary.ts` (pinit), phải chạy **hai tầng kiểm** vì chúng bắt hai loại lỗi khác nhau — tầng nào cũng không thay được tầng kia.

**Tầng 1 — script parse toàn file** (nhanh, chắc chắn, làm trước):
regex strict theo đúng shape `term/cat/short/detail/related` rồi kiểm: số entry parse được (nếu ít hơn thực tế nghĩa là có entry sai format), trùng term, `cat` nằm trong union `GlossaryCategory`, mọi `detail` kết bằng `💡 Dễ nhớ:`, mọi `related` trỏ tới term có thật. Chỉ bắt được lỗi **cấu trúc**.

**Tầng 2 — agent `glossary-reviewer`** với prompt yêu cầu rõ soát **độ chính xác kỹ thuật của `short`/`detail`**, không chỉ soát nhất quán dữ liệu.

Bằng chứng vì sao cần cả hai: lần thêm 10 term (2026-08-25), tầng 1 báo sạch tuyệt đối (119 entry, 0 trùng, 0 related sai, 119/119 có điểm neo) nhưng tầng 2 bắt 4 lỗi nội dung mà script không thể thấy:
- khẳng định quá mạnh (mô tả ACID Isolation như thể mọi mức đều cô lập hoàn toàn — thực tế mặc định phần lớn DB là Read Committed/Repeatable Read)
- khẳng định quá mạnh kiểu khác ("TLS chỉ lộ tên miền" — còn lộ IP, kích thước, thời điểm gói tin)
- công cụ đã chết (giới thiệu CodePush như còn dùng được)
- nhầm thuật ngữ theo platform (gọi chung "universal link" cho cả Android, đúng ra Android là "App Links")

**Reviewer tự đánh dấu mức chắc chắn — chỗ nó nói không chắc thì phải tự tra web, đừng chốt bằng trí nhớ.** Ca CodePush: reviewer nhớ mốc ~31/3/2025 nhưng không chắc; tra web xác nhận đúng ngày đó và Microsoft archive repo server 20/5/2025.

Ba loại lỗi nội dung hay lặp lại, nên tự soát trước khi nhờ agent: **khẳng định tuyệt đối** ("chỉ", "luôn", "không bao giờ"), **tên công cụ đã ngừng phát triển**, và **tên riêng của một platform bị dùng như tên chung**.

---

