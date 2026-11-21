# Runbook — MCP Plane 403 & env của tmux server

> **Xuất từ Plane Wiki 21/11/2026.** Nguồn: page `be9ed9c9-967b-4db2-bc9d-4b62b2c1dacc`,
> workspace `pin`. Chuyển vào repo vì Wiki bị khoá sau paywall ở gói Free — agent qua MCP đọc
> ghi được, chủ repo mở bằng trình duyệt thì không.
>
> ⚠️ **Khối code trong file này mất hết xuống dòng.** Cả **14/14** khối bị ép thành một dòng.
> Mất từ lúc nội dung được ghi vào Plane, **không phải do bước xuất**: kiểm cả ba tầng biểu
> diễn của page — `description_html`, `description_json`, và cả tài liệu Yjs trong
> `description_binary` — không tầng nào còn ký tự xuống dòng trong `codeBlock`.
>
> Hệ quả: lệnh nhiều dòng **không copy-paste chạy được**, phải tự tách lại. Dấu hiệu nhận ra
> chỗ từng xuống dòng: thụt lề còn nguyên nhưng newline biến mất, nên `{` bị dính liền
> `  local q=...`, và comment `#` dính vào đuôi lệnh phía trước. Tôi **không tự tách lại** —
> làm thế là bịa ra cấu trúc không có trong nguồn.

## Tóm tắt một dòng

**MCP** `plane` **trả HTTP 403** `Given API token is not valid` **vì** `PLANE_API_KEY` **chưa expand — và nguyên nhân nằm ở env của *tmux server*, không phải ở pane. Mở pane mới KHÔNG cứu được.** Đã vá ở `~/bin/pinit-agents.sh` (2026-08-25).

## 1. Bảng chẩn đoán theo triệu chứng

- **Không thấy tool** `plane` **đâu** → session chưa nạp config MCP. Mở lại Claude Code.

- **Lỗi** `PLANE_API_KEY is not set` → biến rỗng hẳn.

- **HTTP 403** `Given API token is not valid` → biến chưa expand: MCP server nhận nguyên chuỗi literal `${PLANE_API_KEY}`. Đây là ca hay gặp nhất.

### ⚠ Đừng tin `claude mcp list`

Nó vẫn báo ✔ **Connected** kể cả khi đang 403, vì server chỉ kiểm biến rỗng hay không — chuỗi literal `${PLANE_API_KEY}` thì *không rỗng* nên lọt qua health check.

**Muốn test tầng auth thì gọi một tool đọc bất kỳ**, ví dụ `workitem` action `list` hoặc `member` action `me`. Đừng nhìn health check.

## 2. Nguyên nhân gốc

`PLANE_API_KEY` khai ở `~/.zshrc` (dòng 151). Nhưng `pinit-agents.sh` phóng agent bằng:

```
tmux new-session -d -s "$name" -c "$path" "$CLAUDE_CONT"
```

Nó truyền `claude` làm **command của pane**. tmux chạy command đó qua `sh -c`, **không qua zsh** — nên `~/.zshrc` không bao giờ được đọc, và `claude` thừa kế env của **tmux server**.

tmux server ở máy này chạy từ **08/08/2026**, tức là trước khi dòng export được thêm vào `~/.zshrc`. Server thiếu biến thì mọi session sinh ra từ nó cũng thiếu.

### Vì sao mở pane mới không cứu được

Env hỏng nằm ở **server**, không phải ở pane. Kiểm chứng:

```
tmux show-environment -g | grep PLANE_API_KEY# → rỗng
```

## 3. Bản vá (đã áp dụng)

Thêm helper vào `~/bin/pinit-agents.sh`, ngay sau dòng khai báo `CLAUDE_CONT`:

```
login_cmd() {  local q="'\\''"            # thay mỗi ' trong cmd thành '\'' để nhét vừa dấu nháy đơn  printf "zsh -ic '%s'" "${1//\'/$q}"}
```

Rồi bọc 2 chỗ phóng pane:

- **dòng 87** (`start_one`): `... -c "$path" "$(login_cmd "$CLAUDE_CONT")"`

- **dòng 342** (`cmd_console`): `... -c "$BASE" "$(login_cmd 'ai-devkit agent console')"`

### 🔑 Phải là `-ic`, KHÔNG phải `-lc`

Export nằm trong `~/.zshrc`, mà zsh chỉ source file này khi **interactive**. `zsh -lc` là login nhưng không interactive nên vẫn rỗng. Số đo thực tế trong pane:

```
zsh -lc  'echo ${#PLANE_API_KEY}'   → 0    ← sai, bẫy dễ mắczsh -ic  'echo ${#PLANE_API_KEY}'   → 42   ← đúngsh  -c   'echo ${#PLANE_API_KEY}'   → 0    ← hành vi cũ, trước khi vá
```

Sau khi vá, mỗi pane tự đọc `~/.zshrc` lúc khởi động — không còn phụ thuộc tuổi của tmux server, và biến thêm sau này cũng tự có.

## 4. Runbook — gặp lại 403 thì làm gì

### Cách chuẩn (sau khi đã vá script)

Chạy **từ một session tmux khác** — `cmd_new` kill session cùng tên trước khi tạo lại, chạy trong chính nó thì tự giết giữa chừng:

```
prefix + s              # chọn session khác (console, research-plane...)agents new <name>       # tái tạo agent, tự --continue nên không mất contextagents open <name>      # vào lại
```

### Chữa tạm, không cần restart agent

Từ một pane *đã có* biến:

```
tmux set-environment -g PLANE_API_KEY "$PLANE_API_KEY"
```

**Giới hạn:** chỉ áp cho session tạo *sau* đó. Process đang chạy không nhận env mới, nên agent hiện tại vẫn 403.

### Kiểm tra biến ở shell hiện tại

```
echo ${#PLANE_API_KEY}    # phải ra 42
```

## 5. Cheatsheet — `agents` (`~/bin/pinit-agents.sh`)

```
agents create <name> [branch]   # tạo worktree mới từ origin/main + bật agentagents up                       # mở lại các agent feature còn thiếu (bỏ qua main)agents new <name>               # tạo/tái tạo 1 agent (tự --continue)agents open <name>              # attach/nhảy vào 1 agentagents ls                       # trạng thái các agentagents kill <name>              # kill 1 agentagents rm <name>                # kill agent + gỡ worktree (branch giữ lại)agents sync                     # đồng bộ mọi worktree với origin/mainagents send <name> "lời nhắn"   # gửi tin cho agent (dự phòng khi console lag)agents console                  # session 'console' riêng, né lag
```

### tmux — kiểm tra env

```
tmux show-environment -g              # env global của SERVER (chỗ hay hỏng)tmux show-environment                 # env của session hiện tạitmux ls                               # xem server chạy từ bao giờtmux list-panes -a -F '#S:#I.#P #{pane_current_command} #{pane_current_path}'
```

## 6. Runbook — worktree thiếu `node_modules`

**Triệu chứng:** `npm run lint` chết với `sh: next: command not found`.

**Nguyên nhân:** worktree mới tách chưa cài dependency. Kèm theo một bẫy: repo pin **node 22** qua `.nvmrc`, nhưng shell mặc định đang là **v26.5.0**.

```
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"nvm use 22npm install --no-audit --no-fundnpm run lint
```

Sau khi cài, kiểm `git status` — `package-lock.json` **không được đổi**. Nếu nó đổi thì node/npm version đang sai, đừng commit lock file đó.

## 7. ID cố định của Plane

⚠ **Nguồn sự thật là** `CLAUDE.md` **trong repo** — chép ở đây cho tiện tra, sửa thì sửa cả hai chỗ.

```
project  pinit             3471d6c1-0c05-417e-8211-03f47ad5f648module   glossary          9e2260db-6d52-4ded-8b94-52a18758106bmodule   research-planed   4d198c44-ed66-4606-b8cf-76d5ce86e7bastate    Todo              d6f14d6c-c832-4003-8c26-4d94f14330bastate    In Progress       632c35fa-4945-4e2e-8723-2f3b58c8bff0state    In Review         6f9b66cb-d44a-4f33-8af3-69581d8d90f0state    Blocked           c94c0d6a-039e-418d-bff9-a4227de07135
```

### Bẫy khi query

Query bằng **module id**, không bằng tên. Module id sai thì API trả `{"results": [], "total_count": 0}` — **không phải lỗi, nhìn y hệt "hết việc"**. List rỗng thì đối chiếu lại id trước khi kết luận không có task.

Tên module thật trên Plane là `research-planed` — không có module nào tên `blog-scp`.

## 8. Bẫy phụ đã gặp

- `workitem_comment` **bị escape hai lần** — truyền `comment_html` dạng đã escape (`&lt;p&gt;`) thì Plane lưu nguyên và UI hiện ra thẻ thô. Truyền **HTML thật** (`<p>`), đừng escape trước.

## 9. Pane tmux biến mất im lặng — `agents console` chỉ còn một pane

**Triệu chứng.** `agents console` đáng lẽ mở session `console` chia đôi: pane trên chạy `ai-devkit agent console`, pane dưới là zsh. Nhưng nó chỉ attach vào một pane shell chiếm full màn hình. Chạy lại bao nhiêu lần cũng vậy.

**Vì sao khó thấy.** Ba thứ cộng lại, không thứ nào tự báo lỗi:

1. `remain-on-exit` mặc định `off`. Command của pane thoát — crash, lỡ Ctrl-C, env hỏng — là tmux *xoá* pane, không để lại một dòng nào. Không có xác, không có log, không có mã lỗi.

2. Code cũ chỉ hỏi `tmux has-session`. Session vẫn còn (nhờ pane shell), nên nhánh dựng layout bị bỏ qua hoàn toàn và lệnh chỉ còn mỗi việc attach. Session "có" không đồng nghĩa layout "đúng".

3. Console từng là *command của session* (`tmux new-session -d -s console "...agent console"`). Pane gốc chết thì cả session chết theo: `split-window` ngay sau báo `no such session`, gặp `set -e` là script tắt ngóm — người dùng chỉ thấy lệnh im lặng không mở gì.

**Chẩn.** Đừng nhìn `tmux ls` (nó chỉ đếm window, một pane hay hai pane đều ra `1 windows`). Đếm pane và xem vai:

```
tmux list-panes -t console -F '#{pane_index} #{@role} #{pane_current_command} #{pane_width}x#{pane_height}'
```

Ra đúng một dòng `zsh` chiếm trọn chiều cao = pane console đã chết từ lúc nào không rõ.

**Đã vá trong** `~/bin/pinit-agents.sh` (`cmd_console` + helper `console_pane`/`console_spawn`):

- **Pane gốc là shell**, console chèn lên trên bằng `split-window -bv`. Shell không bao giờ tự thoát, nên session sống dai hơn console — đảo ngược quan hệ chết chùm ở điểm (3).

- **Đánh dấu vai bằng pane option**: `tmux set-option -p -t <pane> @role console`, đọc lại qua `#{@role}`. Không dùng `pane_title` vì chương trình chạy trong pane ghi đè được bằng escape sequence; không dùng pane index vì mỗi lần split là số đổi.

- **Tự chữa, idempotent**: session còn sống mà không tìm thấy pane `@role console` → dựng lại đúng pane đó. Chạy lại lần nữa không đẻ thêm pane.

- **Bọc console trong vòng lặp** để nó thoát thì pane vẫn sống và in ra lý do:

```
while :; do ai-devkit agent console; rc=$?; printf "\n[thoát — mã %s] Enter: chạy lại | Ctrl-C: bỏ pane\n" "$rc"; read -r _ || exit "$rc"; done
```

Đây mới là phần quan trọng nhất: biến một lỗi *im lặng* thành một lỗi *đọc được*.

- `select-layout even-vertical` cho 50/50 thật, rồi `select-pane -t "$s:.{bottom}"` để con trỏ nằm ở shell.

- Thêm biến `PINIT_CONSOLE_SESSION` để thử nghiệm trên session tên khác, khỏi đụng session thật.

**Bài học dùng lại được.** Bất cứ pane tmux nào phóng bằng một command dài hạn đều dính bẫy này. Hai quy tắc:

- Kiểm tra *hình dạng* (số pane + vai), đừng kiểm tra *sự tồn tại* (`has-session`). Hàm dựng session phải tự chữa được layout hỏng dở, không chỉ xử lý hai ca "chưa có" và "có sẵn".

- Command quan trọng thì bọc vòng lặp hoặc bật `remain-on-exit`. Pane chết mà không để lại dấu vết là kiểu hỏng tốn nhiều thời gian nhất để tìm — cùng họ với `claude mcp list` báo ✔ Connected trong khi token là chuỗi literal.

*Ghi chú — sửa script ở đâu:* bản **chuẩn** là `scripts/pinit-agents.sh` **trong repo pinit**; commit `f8458dc` đã đưa file từ `~/bin/` vào repo, mang theo nguyên bản vá này, và alias `agents` trỏ vào bản ở worktree `main`. **Đừng sửa** `~/bin/pinit-agents.sh` — bản đó chỉ còn là dự phòng, không ai chạy nữa, sửa vào đó là thay đổi biến mất im lặng. Thêm code vào bản repo thì giữ hai điều: thân script bị bọc trong khối `{ ... }` (mở ở dòng 2, đóng cuối file, để bash parse trọn vẹn trước khi chạy vì `agents sync` có thể ghi đè file giữa lúc nó đang chạy) nên code mới phải nằm trong khối; và `usage()` quét mọi dòng `#` giữa dòng 2 và `set -euo pipefail` để in help, nên ghi chú kỹ thuật phải đặt *sau* dòng `set`.

## 10. Bổ sung vào một Wiki page đã dài — đừng gõ lại body

**Vấn đề.** Cả `page update` (MCP) lẫn REST đều thay *toàn bộ* `description_html`; không có API append. Muốn thêm một mục vào cuối runbook thì trên lý thuyết phải gửi lại cả body cũ. Với page cỡ này (~22k ký tự HTML, Plane còn tự nhét class riêng vào từng thẻ `<code>`) thì gõ lại là cầm chắc sai âm thầm — mất một đoạn cũ mà không ai để ý, vì response trả về 200 như thường.

Đọc bằng MCP còn vướng thêm một tầng: `page retrieve` trả ~97k ký tự (kèm `description_binary` và `description_json`) nên vượt giới hạn token, output bị đẩy ra file thay vì vào context.

**Cách làm.** Lấy HTML gốc bằng `jq`, nối file bằng `cat`, đẩy lên bằng `curl`. Không một ký tự nào của bản cũ đi qua tay người hay model.

```
PAGE=be9ed9c9-967b-4db2-bc9d-4b62b2c1daccURL="https://api.plane.so/api/v1/workspaces/pin/pages/$PAGE/"# 1. lấy bản gốc — đây là phao cứu sinh nếu ghi hỏngcurl -s "$URL" -H "X-API-Key: $PLANE_API_KEY" > page.jsonjq -r '.description_html' page.json > before.html# 2. nối phần mới (soạn riêng ở append.html), giữ body trên một dòngcat before.html append.html | tr -d '\n' > after.html# 3. PUT — phải gửi kèm name vì PUT là full replace, thiếu thì 400jq -n --rawfile h after.html --slurpfile p page.json \   '{name: $p[0].name, description_html: $h}' > payload.jsoncurl -s -o resp.json -w '%{http_code}\n' -X PUT "$URL" \   -H "X-API-Key: $PLANE_API_KEY" -H "Content-Type: application/json" \   --data-binary @payload.json
```

**Bẫy ở endpoint.** `PATCH` trả `405 Method "PATCH" not allowed` — page chỉ nhận `GET, PUT, DELETE, HEAD, OPTIONS` (hỏi thẳng bằng `curl -i -X OPTIONS` rồi đọc header `allow:`, nhanh hơn đoán). Vì là `PUT` nên payload thiếu `name` sẽ bị từ chối bằng `400`, không phải lỗi ở body.

**Kiểm sau khi ghi — bốn thứ, đừng tin mỗi mã 200:**

- `page_collection_id` còn nguyên. `PUT` là full replace nên đây là thứ dễ bị thổi bay nhất, mà page rơi khỏi collection thì lần sau tra không ra.

- So **text**, không so HTML thô: `jq -r '.description_stripped'` trước và sau, cắt bỏ đúng đoạn mình vừa thay, phần còn lại phải khớp từng ký tự. Đừng `diff` `description_html` — Plane chuẩn hoá markup ở mỗi lần lưu (đo được: nó tự bỏ `class="tight" data-tight="true"` trên một thẻ `<ul>` mà mình không hề đụng tới), nên diff byte sẽ báo đỏ cả khi không mất một chữ nào — một cái check hay báo nhầm thì chẳng khác gì không có check.

- Tiêu đề mục mới xuất hiện **đúng một lần** (chạy lại script hai lượt là nhân đôi).

- `description_binary` phải đổi độ dài. Đây là kiểm tra dễ quên nhất: editor của Plane render từ tài liệu Yjs trong `description_binary`, không phải từ `description_html`. Binary không đổi nghĩa là server chưa sinh lại — API báo thành công mà UI vẫn hiện bản cũ.

*Áp dụng lần đầu:* nối mục "Pane tmux biến mất im lặng" vào chính runbook này — 22.9k → 32.1k ký tự HTML, binary 23.7k → 34.1k, collection giữ nguyên.
