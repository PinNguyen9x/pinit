# pinit — quy ước cho AI agent

## Dự án
- Frontend: Next.js + TypeScript (thư mục này)
- API: `json-server-blog` (repo riêng)
- Branch tích hợp: `main`. Mỗi agent làm trên một worktree tách từ `main`.
- Work state (task/board): Plane Cloud — workspace `pin`, project `pinit`.
  Mỗi agent ứng với một module, map theo **tên thư mục worktree** (`git worktree list`):
  - `pinit-research-plane` → module `research-planed`
  - `pinit-glossary` → module `glossary`

  Worktree không có tên trong bảng trên (ví dụ `pinit-fix-content-blog`, hay `pinit` gốc)
  thì KHÔNG tự suy ra module từ tên gần giống — hỏi tôi. Đoán sai module id thì query
  trả rỗng im lặng, agent tưởng hết việc mà thật ra đang nhìn nhầm chỗ.

## Task workflow (Plane)
Plane giữ **trạng thái công việc**; memory (`saveKnowledge`) giữ **kiến thức tích luỹ**.
Không trộn hai lớp: status task KHÔNG lưu vào memory, learnings KHÔNG ghi vào Plane.

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
- state `Todo` — `d6f14d6c-c832-4003-8c26-4d94f14330ba`
- state `In Progress` — `632c35fa-4945-4e2e-8723-2f3b58c8bff0`
- state `In Review` — `6f9b66cb-d44a-4f33-8af3-69581d8d90f0`
- state `Blocked` — `c94c0d6a-039e-418d-bff9-a4227de07135`

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
- Đồng bộ với main: dùng `git rebase origin/main`, KHÔNG `git merge main`
- Nếu rebase có conflict: chuyển work item → `Blocked` + comment lý do, rồi dừng và báo tôi.
  Không tự resolve. "Dừng và báo tôi" luôn kèm bước đổi state — dừng im lặng thì board sai.
- Không rebase branch đã push lên remote
- Merge feature về `main`: dùng `git merge --no-ff` (việc này do tôi hoặc agent integrator làm)

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

Learnings rút ra trong phiên → `saveKnowledge` (memory), KHÔNG ghi vào Plane.
