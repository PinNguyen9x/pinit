# Runbook — Vòng đời một task với `agents` (pinit-agents.sh)

> **Xuất từ Plane Wiki 21/11/2026.** Nguồn: page `3cf1c6d3-6cc6-4bf0-848e-6952a2214b5f`,
> workspace `pin`. Chuyển vào repo vì Wiki bị khoá sau paywall ở gói Free.
>
> ⚠️ **4 trong 11 khối code mất xuống dòng**, bị ép thành một dòng; 7 khối còn lại bình
> thường. Mất từ lúc ghi vào Plane chứ không phải do bước xuất. Lệnh nhiều dòng trong 4 khối
> đó phải tự tách lại trước khi chạy.
>
> Mục lục ngay dưới đây nói "Plane không hỗ trợ neo nhảy trong trang" và bảo dùng panel
> outline — **câu đó không còn đúng ở đây**: GitHub sinh neo cho mọi heading, bấm vào mục lục
> là nhảy được. Giữ nguyên câu gốc để bản xuất đúng là bản xuất.

## Mục lục

Plane không hỗ trợ neo nhảy trong trang (nó xoá `id` trên heading). Muốn nhảy nhanh giữa các mục thì **mở panel outline** ở góc phải thanh công cụ — mọi heading dưới đây đều nằm trong đó. Hoặc `Cmd + F` rồi gõ "Ca 3".

- **Mô hình**

- **1. Bảng lệnh đầy đủ**

- **2. Vòng đời một task** — 9 bước

- **3.** `agents console` — session 2 pane

- **4. Lịch sử lỗi** — 12 ca, vì sao script trông như bây giờ

- **5. Bẫy vận hành**

## Mô hình

**1 worktree = 1 branch = 1 tmux session = 1 agent.** Ba điều cần nhớ:

- **Context của Claude gắn với CWD (worktree), KHÔNG gắn với tên agent.** `claude --continue` nối lại phiên mới nhất *của thư mục đó* — nên kill agent rồi tạo lại ở cùng worktree là làm tiếp việc cũ, không mất gì.

- **Danh sách agent tự suy ra từ** `git worktree list`, không hard-code. Thêm worktree không phải sửa script. Tên agent = tên thư mục bỏ tiền tố `pinit-`; riêng `pinit` gốc → `main`.

- **ai-devkit tự discover các phiên claude này**, nên `ai-devkit agent list/console/send` vẫn quản được dù ta bật qua tmux.

Đường dẫn gốc: `~/Desktop/pinit`. Worktree main: `~/Desktop/pinit/pinit` (mọi lệnh git cấp repo chạy ở đây).

## 1. Bảng lệnh đầy đủ

```
agents create <name> [branch]   # worktree mới từ origin/main + npm install + bật agent
agents up                       # mở lại mọi agent feature còn thiếu (bỏ qua main)
agents new <name>               # tạo/TÁI TẠO 1 agent (tự --continue)
agents open <name>              # attach/nhảy vào 1 agent
agents ls                       # trạng thái worktree + ai-devkit discover
agents rm <name>                # kill agent + gỡ worktree (branch giữ lại)
agents kill <name>              # kill 1 agent
agents kill-all                 # kill tất cả (hỏi xác nhận)
agents sync                     # đồng bộ mọi worktree với origin/main
agents mcp-fix                  # vá entry memory trong .mcp.json, mọi worktree
agents send <name> "lời nhắn"   # gửi tin cho agent (dự phòng khi console lag)
agents detail <name>            # 20 dòng cuối của agent
agents console                  # session 'console' chia 2 pane (xem mục 3)
agents help                     # in phần usage
```

Alias: `add`=create, `resume`=up, `recreate`=new, `attach`=open, `status`=ls, `remove`=rm, `msg`=send, `con`=console.

Biến môi trường: `PINIT_AGENT_MODEL` (mặc định `claude-opus-5`), `PINIT_AGENT_CMD` (override lệnh phóng, tiện để test).

## 2. Vòng đời một task

### Bước 1 — tạo worktree + agent

```
agents create glossary                 # branch mặc định: feat/glossary
agents create hotfix fix/login-500     # hoặc chỉ định branch
```

Nó làm 6 việc: `fetch origin` → `git worktree add -b <branch> <path> origin/main` → `branch --unset-upstream` (**Ca 7 — push trần bắn vào main**) → vá `.mcp.json` → `npm install` theo `.nvmrc` (**Ca 10 — thiếu node_modules**) → bật agent.

### Bước 2 — vào làm việc

```
agents open glossary
```

### Bước 3 — theo dõi nhiều agent cùng lúc

```
agents ls                          # ai đang chạy, ai ngủ
agents console                     # 2 pane: console trên, shell dưới
agents send glossary "nhận task đi"
agents detail glossary             # 20 dòng cuối
```

### Bước 4 — agent commit (KHÔNG push)

Theo `CLAUDE.md`: agent chạy `npm run lint`, commit local, comment lên Plane, chuyển state `In Review`. Push là việc của người.

### Bước 5 — push

```
git push -u origin feat/glossary
```

**Lần đầu bắt buộc có** `-u <branch>` — script cố ý gỡ upstream để `git push` trần không bắn nhầm vào main (**Ca 7 — push trần bắn vào main**). Từ lần thứ hai trở đi `git push` trần là đủ.

### Bước 6 — tạo PR

```
gh pr create --base main --head feat/glossary \
  --title "feat(glossary): ..." --body-file /đường/dẫn/body.md
```

### Bước 7 — merge

Trên GitHub chọn **"Create a merge commit"** — tương đương `git merge --no-ff` theo `CLAUDE.md`. **Đừng chọn Squash**: nó gộp các commit đã tách bạch thành một.

### Bước 8 — đồng bộ mọi worktree

```
agents sync
```

Với từng worktree: `main` thì `pull --ff-only`, còn lại thì `rebase origin/main`. Trước khi rebase nó gỡ cờ và trả `.mcp.json` về bản git, xong thì vá lại (**Ca 2 — skip-worktree chặn rebase**). `package-lock.json` đổi thì tự `npm install` (**Ca 8 — quên npm install**).

**Branch đã push thì** `sync` **BỎ QUA, không rebase** (**Ca 3 — rebase branch đã push**) và in ra một trong hai:

- *"đã merge vào origin/main — bỏ qua"* → dọn được rồi, sang bước 9.

- *"đã push lên origin/<br> — KHÔNG rebase"* → merge PR trước rồi sync lại, hoặc tự `git merge origin/main` và chấp nhận một merge commit.

**Conflict thì** `sync` **DỪNG, không tự resolve.** Vào worktree xử lý tay (`git rebase --continue` hoặc `--abort`) rồi chạy lại. Trong lúc chờ, `.mcp.json` đang ở bản git và *chưa* có cờ skip-worktree — cố ý (**Ca 4 — vá giữa lúc rebase dở**).

### Bước 9 — dọn

```
agents rm glossary                                   # kill agent + gỡ worktree
git -C ~/Desktop/pinit/pinit branch -d feat/glossary  # xoá branch local
git -C ~/Desktop/pinit/pinit push origin --delete feat/glossary
```

`agents rm` giữ lại branch. Worktree còn thay đổi chưa commit thì nó **từ chối** và in lệnh `--force` để bạn tự quyết — không tự xoá.

## 3. `agents console` — session 2 pane

Đây là lệnh chia đôi màn hình để vừa theo dõi agent vừa gõ lệnh:

```
agents console
```

- **Pane trên** — `ai-devkit agent console` (theo dõi mọi agent)

- **Pane dưới** — shell thường, và là pane *active* ngay khi tạo

Session tên `console`, cwd `~/Desktop/pinit`, **độc lập với mọi agent session** — kill agent không ảnh hưởng. Chia 50/50 cố ý: pane nhỏ + tmux tiết chế redraw để né lag của TUI. Gọi lại lần sau thì nó chỉ nhảy vào session cũ, không tạo trùng.

Khi console lag quá không dùng được thì bỏ TUI, dùng CLI: `agents send` và `agents detail`.

## 4. Lịch sử lỗi — vì sao script trông như bây giờ

Mỗi ca dưới đây từng làm hỏng việc thật. **Điểm chung: gần như tất cả đều là lỗi "hỏng im lặng"** — `git status` xanh, health check ✔, process exit 0. Vì vậy script thiên về *in cảnh báo và từ chối làm* hơn là đoán.

*Danh sách để quét nhanh — dùng panel outline hoặc* `Cmd + F` *để nhảy tới ca cần đọc:*

1. **Ca 1** — MCP `plane` trả 403, mà health check vẫn ✔

2. **Ca 2** — `.mcp.json` skip-worktree chặn rebase

3. **Ca 3** — rebase branch đã push

4. **Ca 4** — vá `.mcp.json` giữa lúc rebase còn dở

5. **Ca 5** — npx + symlink giết MCP `memory` im lặng

6. **Ca 6** — ghi đè `.mcp.json` làm bay entry server khác

7. **Ca 7** — `git push` trần bắn thẳng vào main

8. **Ca 8** — `package-lock.json` đổi mà quên `npm install`

9. **Ca 9** — `agents new` tự giết chính nó

10. **Ca 10** — worktree mới thiếu `node_modules`

11. **Ca 11** — `send`/`detail` gọi sai tên

12. **Ca 12** — `ai-devkit start` làm mất context

### Ca 1 — MCP `plane` trả 403, mà health check vẫn ✔

**Triệu chứng:** `HTTP 403 Given API token is not valid`, trong khi `claude mcp list` báo ✔ Connected.

**Nguyên nhân:** tmux chạy command của pane qua `sh -c`, không qua zsh → `~/.zshrc` không được đọc → agent thừa kế env của *tmux server*. Server tạo từ lâu thì thiếu mọi biến khai sau đó, nên `PLANE_API_KEY` rỗng và MCP nhận nguyên chuỗi literal `${PLANE_API_KEY}`.

**Sửa:** helper `login_cmd()` bọc lệnh thành `zsh -ic '<cmd>'`. Phải là `-i`: zsh chỉ source `~/.zshrc` khi interactive — đo trong pane: `-lc` → 0, `-ic` → 42, `sh -c` → 0. Chi tiết ở page *Runbook — MCP Plane 403 & env của tmux server*.

### Ca 2 — `.mcp.json` skip-worktree chặn rebase

**Triệu chứng:**

```
error: Your local changes to the following files would be overwritten by checkout: .mcp.json
error: could not detach HEAD
```

**Đây KHÔNG phải conflict** — không có rebase nào đang dở để `--continue`, worktree đứng nguyên ở HEAD cũ, mà `git status` vẫn xanh.

**Nguyên nhân:** `.mcp.json` mang cờ `skip-worktree` và nội dung local khác bản git. Git coi file đó như "sạch" nên status không báo gì, nhưng hễ `origin/main` có commit đụng path đó là chết ngay.

**Sửa:** `sync_one` gỡ cờ và `checkout -- .mcp.json` **TRƯỚC** khi rebase, vá lại workaround **SAU**.

### Ca 3 — rebase branch đã push

**Nguyên nhân:** rebase làm local lệch `origin/<branch>`, mà chữa lệch thì chỉ còn `--force` — cũng bị `CLAUDE.md` cấm nốt. Vào thế kẹt.

**Sửa:** guard trong `sync_one`, và **đặt TRƯỚC đoạn gỡ cờ** `.mcp.json` — bỏ qua sớm thì không đụng vào file đó chút nào, khỏi phải vá lại.

### Ca 4 — vá `.mcp.json` giữa lúc rebase còn dở

**Nguyên nhân:** rebase lỗi mà vá lại `.mcp.json` ngay thì chính bản vá đó chặn `git rebase --continue`.

**Sửa:** khi rebase fail, cố ý *để nguyên* `.mcp.json` ở bản git và chưa set cờ, kèm cảnh báo in ra màn hình. Nghĩa là trong lúc đó MCP `memory` đang ở bản npx (chết im lặng trên Node ≥ 26) — chấp nhận đánh đổi cho tới khi rebase xong.

### Ca 5 — npx + symlink giết MCP `memory` im lặng

**Triệu chứng:** MCP báo `-32000`, server exit 0, không một dòng log.

**Nguyên nhân:** npx chạy bin qua symlink, nên guard `argv[1] === import.meta.url` trong `dist/index.js` không khớp trên Node ≥ 26 → server tự thoát, coi như "không phải entry point".

**Sửa:** `setup_mcp` trỏ `node` thẳng vào file `dist/index.js` thật. Phải chạy qua `realpath` — path còn sót symlink thì guard lại gãy y hệt.

### Ca 6 — ghi đè `.mcp.json` làm bay entry server khác

**Nguyên nhân:** repo đã commit thêm server khác (`agentic-mermaid`) vào `.mcp.json`, mà file thì đang `skip-worktree` — clobber cả file một phát là entry đó bay mất và **git không hé một lời**.

**Sửa:** chỉ patch đúng `.mcpServers.memory` bằng `jq`, không ghi đè cả file. Không có `jq` → từ chối sửa, in hướng dẫn sửa tay. File không parse được → giữ nguyên, không đụng vào.

### Ca 7 — `git push` trần bắn thẳng vào main

**Nguyên nhân:** `git worktree add -b <br> <path> origin/main` để lại upstream = `origin/main`, **không phải** `origin/<br>`. Hệ quả: `git push` trần trên branch feature nhắm vào main.

**Sửa:** `cmd_create` chạy `git branch --unset-upstream` ngay sau khi tạo worktree, buộc lần push đầu phải nói rõ tên: `git push -u origin <br>`.

### Ca 8 — `package-lock.json` đổi mà quên `npm install`

**Nguyên nhân:** rebase kéo về lock file mới, dependency chưa cài → MCP chết im lặng.

**Sửa:** `sync_one` chụp `git hash-object package-lock.json` trước và sau rebase, khác nhau thì gọi `npm_install_at`.

### Ca 9 — `agents new` tự giết chính nó

**Nguyên nhân:** `cmd_new` `kill-session` session cùng tên *trước* khi tạo lại. Chạy nó từ trong chính session đó thì tự sát giữa chừng.

**Sửa:** luôn chạy `agents new <name>` **từ một session tmux khác** — `prefix + s` để chuyển, hoặc dùng session `console`.

### Ca 10 — worktree mới thiếu `node_modules`

**Triệu chứng:** `npm run lint` chết với `sh: next: command not found`. Vì lint là bước bắt buộc trước commit, agent kẹt ngay từ task đầu tiên.

**Nguyên nhân:** git không theo dõi `node_modules` nên worktree mới luôn trống. Kèm bẫy: repo pin **node 22** qua `.nvmrc` còn shell mặc định là **v26** — cài sai version thì `package-lock.json` bị viết lại.

**Sửa (2026-08-25):** thêm helper `npm_install_at()`, gọi trong `cmd_create` ngay sau `setup_mcp` và dùng lại trong `sync_one`. Nó tự `nvm use` theo `.nvmrc` của worktree, chạy trong subshell với `set +u` (nvm.sh đụng biến chưa khai, gặp `set -u` là chết). Không có nvm thì vẫn cài, chỉ cảnh báo.

Chạy tay khi cần:

```
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm use 22
npm install --no-audit --no-fund
```

Cài xong kiểm `git status` — `package-lock.json` **không được đổi**. Nếu đổi thì node/npm đang sai version, đừng commit lock file đó.

### Ca 11 — `send`/`detail` gọi sai tên

**Nguyên nhân:** hai hệ tên khác nhau — tmux dùng tên ngắn (`glossary`), ai-devkit dùng tên dài (`pinit-glossary-16713`).

**Sửa:** tên ngắn thường khớp nhờ so trùng một phần (`--id glossary`). Không chắc thì `agents ls` — nó in cả hai danh sách cạnh nhau.

### Ca 12 — `ai-devkit start` làm mất context

**Sửa:** dùng `agents new <name>`, nó chạy `claude --continue` nên nối lại phiên cũ của worktree.

## 5. Bẫy vận hành cần nhớ

- `agents up` **bỏ qua** `main` — worktree main là nơi chạy console/integrator, không cần agent riêng. Muốn bật thì `agents new main`.

- `agents new` **khác** `agents open` — `new` kill rồi tạo lại (dùng khi agent treo hoặc cần nạp config MCP mới), `open` chỉ nhảy vào.

- **Sau** `agents mcp-fix` **phải** `agents new` từng agent đang chạy, vì config chỉ đọc lúc khởi động.

- `agents rm` **không xoá branch** — phải tự `branch -d` và `push origin --delete`.

- **Đặt tên worktree đúng quy ước** `pinit-<name>`, vì tên agent suy ra bằng cách cắt tiền tố đó. Sai quy ước thì `CLAUDE.md` yêu cầu hỏi chứ không đoán module.
