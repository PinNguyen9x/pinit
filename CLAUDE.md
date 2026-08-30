# pinit — quy ước cho AI agent

## Dự án
- Frontend: Next.js + TypeScript (thư mục này)
- API: `json-server-blog` (repo riêng)
- Branch tích hợp: `main`. Mỗi agent làm trên một worktree tách từ `main`.
- Work state (task/board): Plane Cloud — workspace `pin`, project `pinit`.
  Mỗi agent ứng với một module, map theo **tên thư mục worktree** (`git worktree list`):
  - `pinit-research-plane` → module `research-planed`
  - `pinit-glossary` → module `glossary`
  - `pinit-tmux-terminal-git` → module `tmux-terminal-git`
  - `pinit-research-archify` → module `tmux-terminal-git`

  Worktree không có tên trong bảng trên (ví dụ `pinit-fix-content-blog`, hay `pinit` gốc)
  thì KHÔNG tự suy ra module từ tên gần giống — hỏi tôi. Đoán sai module id thì query
  trả rỗng im lặng, agent tưởng hết việc mà thật ra đang nhìn nhầm chỗ.

## Task workflow (Plane)
Ba lớp lưu trữ, mỗi thứ một chỗ — không trộn:
- **Plane work item + comment** — *trạng thái công việc*: đang làm gì, xong chưa, kẹt ở đâu.
- **Plane Wiki** — *runbook & cheatsheet dùng chung*: quy trình lặp lại, cách chẩn lỗi hạ tầng,
  bảng lệnh. Thứ mà agent khác hoặc tôi cần tra lại sau nhiều tháng.
- **memory (`saveKnowledge`)** — *learnings riêng của agent*: kinh nghiệm rút ra trong phiên,
  chưa đủ chín hoặc quá riêng để thành runbook chung.

Đặt nhầm chỗ thì hỏng theo kiểu khó thấy: status task nằm trong memory thì board sai mà không ai
biết; runbook nằm trong comment work item thì chôn theo task đã đóng, tra không ra.

Runbook đã có (Wiki workspace `pin`, collection *Runbook & Cheatsheet*) — **đọc trước khi tự
mò lại**, nhất là khi task yêu cầu viết tài liệu về quy trình:
- *Runbook — MCP Plane 403 & env của tmux server* — `be9ed9c9-967b-4db2-bc9d-4b62b2c1dacc`
  (chẩn lỗi MCP `plane`, cheatsheet `agents`/tmux, worktree thiếu `node_modules`)
- *Runbook — Vòng đời một task với `agents`* — `3cf1c6d3-6cc6-4bf0-848e-6952a2214b5f`
  (14 lệnh `agents`, vòng đời 9 bước worktree → PR → merge → sync, 12 ca lỗi kèm nguyên nhân)

Plane không giữ `id` trên heading nên **link neo trong page không hoạt động** — đừng phí công
viết `<a href="#...">`, nó còn tự thành `target="_blank"` trỏ vào hư không. Điều hướng bằng
panel outline hoặc `Cmd + F`.

Config MCP `plane` nằm ở **scope user** (`~/.claude.json`), cố tình KHÔNG để trong `.mcp.json`
của repo: token đọc qua `${PLANE_API_KEY}` là biến môi trường của máy, không phải thứ commit được.
Khi tool `plane` trục trặc, đọc triệu chứng theo bảng này — đừng tin `claude mcp list`:
- Không thấy tool `plane` đâu → session chưa nạp config, mở lại Claude Code.
- Lỗi `PLANE_API_KEY is not set` → biến rỗng hẳn.
- **HTTP 403 `Given API token is not valid`** → biến chưa expand: server nhận nguyên chuỗi
  `${PLANE_API_KEY}`. Đây là ca hay gặp nhất và `claude mcp list` vẫn báo ✔ Connected,
  vì server chỉ kiểm tra biến rỗng hay không, chuỗi literal thì không rỗng nên lọt.
  Muốn test tầng auth thì gọi một tool đọc bất kỳ, đừng nhìn health check.

Gốc rễ của hai lỗi sau: `PLANE_API_KEY` khai trong `~/.zshrc`, nhưng `pinit-agents.sh` phóng
agent bằng `tmux new-session ... "$CLAUDE_CONT"` — truyền `claude` làm *command của pane*.
tmux chạy command đó qua `sh -c`, không qua zsh, nên `~/.zshrc` không bao giờ được đọc và
`claude` thừa kế env của **tmux server**. Server chạy từ lâu thì thiếu mọi biến khai sau đó.

Vì env hỏng nằm ở server chứ không ở pane, **mở pane mới không cứu được** — kiểm chứng bằng
`tmux show-environment -g | grep PLANE_API_KEY` (rỗng). Đã vá ở `~/bin/pinit-agents.sh`: helper
`login_cmd()` bọc lệnh thành `zsh -ic '<cmd>'` để pane tự đọc `~/.zshrc` lúc khởi động.
Phải là `-i`: export nằm trong `~/.zshrc`, mà zsh chỉ source file này khi interactive —
`zsh -lc` là login nhưng không interactive nên vẫn rỗng (đo trong pane: `-ic` → 42, `sh -c` → 0).

Nếu gặp lại 403 sau khi đã vá: chạy `agents new <name>` **từ session tmux khác** (`cmd_new`
kill session cùng tên trước khi tạo lại, chạy trong chính nó thì tự giết giữa chừng).
Chữa tạm không cần restart agent thì `tmux set-environment -g PLANE_API_KEY "$PLANE_API_KEY"`
từ một pane có biến, nhưng chỉ áp cho session tạo *sau* đó.

ID cố định — dùng thẳng, không cần tra (tool `module` và `project` đã bị deny):
- project `pinit` — `3471d6c1-0c05-417e-8211-03f47ad5f648`
- module `glossary` — `9e2260db-6d52-4ded-8b94-52a18758106b`
- module `research-planed` — `4d198c44-ed66-4606-b8cf-76d5ce86e7ba`
- module `tmux-terminal-git` — `4135fd88-de22-4a9a-a431-add12a5ed40e`
- state `Todo` — `d6f14d6c-c832-4003-8c26-4d94f14330ba`
- state `In Progress` — `632c35fa-4945-4e2e-8723-2f3b58c8bff0`
- state `In Review` — `6f9b66cb-d44a-4f33-8af3-69581d8d90f0`
- state `Blocked` — `c94c0d6a-039e-418d-bff9-a4227de07135`
- state `Done` — `4aa41fc6-5879-45c9-a3ef-cd0163d4ce88`

Có module mới chưa có trong bảng thì lấy id thế này (tool `module` bị deny nên không tra thẳng
được): `workitem_activity` action `list` trên một item thuộc module đó — dòng
`"comment": "added module <tên>"` mang `new_identifier` chính là module id.

Vòng đời một task:
1. **Đầu session** — `workitem` action `list`, pql `module = "<module-id>"`, lọc state `Todo`
   và `In Progress`. Đây là bước khôi phục ngữ cảnh sau restart: item đang `In Progress`
   chính là việc đang làm dở.
   ⚠️ Query bằng **module id ở trên**, không bằng tên. Module id sai thì API trả
   `{"results": [], "total_count": 0}` — không phải lỗi, nhìn y hệt "hết việc".
   List rỗng thì đối chiếu lại id trước khi kết luận không có task, đừng im lặng bỏ qua.
   Lưu ý tên module thực tế trên Plane là `research-planed` — **không có module tên `blog-scp`**.
2. **Trước khi bắt tay làm** — `workitem` action `update`, state → `In Progress`.
3. **Khi kẹt** — state → `Blocked` + comment lý do cụ thể (xem "Git workflow", "Bắt buộc").
4. **Khi xong hoặc khi handoff** — xem "Bàn giao khi kết thúc phiên".

Giới hạn:
- Chỉ thao tác work item thuộc module của mình; không đụng item của agent khác.
- Không xoá work item, không sửa/xoá comment của người khác.
- Không tạo/xoá project, module, cycle.
- Gán work item vào module là việc của tôi trên UI — agent chỉ đọc.
- Wiki: được tạo page mới và cập nhật page do chính mình tạo. Sửa page của người khác thì
  hỏi trước; không archive, không xoá page của ai. Xếp page vào collection là việc của tôi
  trên UI.

## Diagram

Hai skill cùng nhận yêu cầu "vẽ diagram", chọn theo **output cần gì**, không theo thói quen:

- **`archify` — mặc định.** Dùng cho mọi diagram để người đọc xem: kiến trúc, workflow,
  sequence, data-flow, lifecycle. Ra một file HTML tự chứa có animation, search node, trace
  upstream/downstream, export PNG/SVG/WebM. Nhúng thẳng vào bài blog Next.js được.
- **`agentic-mermaid-diagram-workflow` — khi cần diagram ở dạng *text* sống trong file.**
  Tức là khi hình phải nằm trong Markdown/Wiki và được sửa bằng diff về sau: README, page
  Plane Wiki, comment PR. Mermaid là source text nên review được qua git; HTML của archify
  thì không.

Archify **nhận cả Mermaid làm input** — có sẵn `flowchart`/`sequenceDiagram`/`stateDiagram`
thì đưa thẳng cho archify, đừng vẽ lại từ đầu.

Kiểm tra trước khi tin: `archify check <output.html>` đo hình học đường nối thật (số lần gấp
khúc, độ kéo giãn, đoạn ngắn nhất) và trả `issues`. Render xong mà không chạy `check` thì
không có cơ sở nói bố cục đạt — đây là điểm khác biệt chính so với Mermaid, đừng bỏ.

## Bootstrap worktree mới

Worktree mới clone về **thiếu skill ở hai nguồn khác nhau**, phải chạy cả hai lệnh:

    npx ai-devkit install              # đọc .ai-devkit.json, dựng 19 skill dev-*/task/tdd/...
    npx skills experimental_install    # kéo archify về .agents/

`agents create` tự chạy cả hai sau `npm install`. Worktree tạo trước khi có bước đó thì chạy
tay một lần.

⚠️ **`experimental_install` KHÔNG ghim theo `computedHash` trong `skills-lock.json`** — bất kể
tên gọi, nó kéo bản mới nhất từ `tt-a1i/archify` rồi **ghi đè `computedHash`** bằng hash của bản
vừa tải. Đo 30/08/2026 trên một clone sạch: renderer về 7.7MB (máy cũ 6.7MB) và `git status`
bẩn ngay với một dòng sửa `skills-lock.json`.

Hệ quả: sau bootstrap, **kiểm `git status` trước khi commit**. Dòng `skills-lock.json` đó là
sản phẩm phụ của lệnh cài, không phải việc bạn làm — đừng gộp vào commit của task. Muốn nâng
archify thì commit riêng, có chủ đích.

Vì sao hai nguồn, và vì sao chỉ một cái được commit:

| | ai-devkit (19 skill) | archify |
|---|---|---|
| Lockfile trong git | `.ai-devkit.json` | `skills-lock.json` |
| Bản thật nằm ở | `~/.ai-devkit/skills/` — **ngoài repo** | `.agents/skills/` — trong repo |
| Symlink | tuyệt đối, **không commit** | tương đối, **có commit** |
| Lý do | path neo vào `$HOME` từng máy, viết tương đối không được | `../../` nên clone nào cũng đúng |

`ai-devkit install` **có** wire `.claude/skills/` (đã đo: log in ra `→ .claude/skills/<tên>
(symlinked)`), khác với `skills experimental_install` vốn bỏ sót Claude Code — đó là toàn bộ
lý do archify phải commit symlink còn 19 cái kia thì không.

Triệu chứng khi quên: skill `archify` không xuất hiện trong danh sách skill, hoặc symlink
`.claude/skills/archify` dangling. Renderer chạy được (`archify doctor` xanh) mà Claude Code
vẫn không thấy skill thì ngược lại — thiếu symlink chứ không thiếu `.agents/`.

Bản thân symlink `.claude/skills/archify` **có commit** (git lưu 28 byte, mode `120000`), cố ý:
`experimental_install` chỉ wire cho Codex/Cline/Amp/Antigravity và bỏ sót Claude Code, nên nếu
để nó tự sinh thì clone mới sẽ có renderer mà agent không thấy skill.

## Quy ước commit
Conventional Commits: `<type>(<scope>): <mô tả>`

- type: feat | fix | refactor | docs | test | chore | style
- scope: module liên quan (glossary, blog, deploy, theme...)
- mô tả: thể mệnh lệnh, không dấu chấm cuối, ≤ 72 ký tự

Ví dụ:
- `feat(glossary): thêm deep-link cho từng thuật ngữ`
- `fix(blog): sửa lỗi scp không copy thư mục con`

## Bắt buộc
- Mỗi commit một thay đổi logic — không gộp nhiều việc
- Chạy `npm run lint` trước khi commit
- Không thêm co-author hay footer quảng cáo tool vào commit message
- Nhận việc và cập nhật state qua Plane theo "Task workflow (Plane)" — không làm việc ngoài board
- `npm run lint` fail mà không sửa được: state → `Blocked` + comment, KHÔNG chuyển `In Review`

## Tuyệt đối không
- Không `git push` — để tôi tự push
- Không `--force`, không `git reset --hard`, không sửa lịch sử commit
- Không sửa file trong `.next/`, `node_modules/`
- Không xoá work item trên Plane; không tạo/xoá project, module, cycle

## Git workflow
- Đồng bộ với main: dùng `git rebase origin/main`, KHÔNG `git merge main`.
  **Chỉ áp dụng cho branch chưa push.**
- **Branch đã push lên remote thì không sync nữa.** Không rebase (làm sai lịch sử người
  khác đã fetch, chữa lệch thì chỉ còn `--force` — cũng bị cấm), cũng không merge (đẻ
  merge commit vào nhánh feature). Cần main mới thì **merge PR hiện tại rồi tạo branch
  mới từ `origin/main`**, đừng dùng lại branch cũ.
  Kiểm branch đã push chưa: `git rev-parse --verify origin/$(git branch --show-current)`
- Nếu rebase có conflict: chuyển work item → `Blocked` + comment lý do, rồi dừng và báo tôi.
  Không tự resolve. "Dừng và báo tôi" luôn kèm bước đổi state — dừng im lặng thì board sai.
- Merge feature về `main`: dùng `git merge --no-ff` (việc này do tôi hoặc agent integrator làm)

Hệ quả cần nhớ khi đọc `git branch --merged main`: một branch từng bị `agents sync` rebase
lên main tip sẽ hiện là "merged" **vì bị rebase, không phải vì việc của nó nằm trong main**.
Muốn biết thật thì tra lịch sử PR, đừng tin cờ merged.

## Bàn giao khi kết thúc phiên
Khi tôi nói "handoff", hoặc khi làm xong một task, chạy đúng thứ tự này:

1. `npm run lint` → phải xanh (fail mà không sửa được → `Blocked`, dừng ở đây)
2. Commit local — không push
3. **Plane** — `workitem_comment` action `create`: tóm tắt việc đã làm + commit dạng
   `abc1234 — https://github.com/PinNguyen9x/pinit/commit/abc1234`
   (URL còn 404 tới khi tôi push, đó là bình thường — vẫn ghi sẵn)
4. `workitem` action `update`, state → `In Review`
5. `HANDOFF.md` trong worktree — **chỉ** phần working tree chưa commit: file đang sửa dở,
   thử nghiệm chưa xong, bước tiếp theo. Không commit file này.

Ranh giới cứng giữa hai nơi, không được viết trùng:
- Plane comment KHÔNG nhắc chi tiết uncommitted changes
- `HANDOFF.md` KHÔNG lặp lại tóm tắt đã có trên Plane
- Khi mọi thứ đã commit sạch, `HANDOFF.md` được phép chỉ ghi `clean, xem Plane`

Learnings rút ra trong phiên → `saveKnowledge` (memory), KHÔNG ghi vào work item/comment.
Nếu learning đó là quy trình lặp lại hoặc cách chẩn một lỗi hạ tầng — thứ agent khác sẽ cần —
thì viết thành page trên **Wiki** thay vì chôn trong comment (xem "Task workflow (Plane)").
Comment work item chỉ trỏ tới page, không chép lại nội dung.
