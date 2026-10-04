#!/usr/bin/env bash
{
# pinit-agents.sh — quản lý agent Claude theo worktree (mỗi agent = 1 tmux session)
# Viết cho bash 3.2 (macOS) — không dùng declare -A.
#
# Nguyên lý:
#   - Context của Claude gắn với CWD (worktree), KHÔNG gắn với tên agent.
#     `claude --continue` nối lại phiên mới nhất của worktree đó
#     -> kill agent rồi tạo lại (cùng worktree) = làm tiếp việc cũ.
#   - ai-devkit TỰ discover các phiên claude này, nên `ai-devkit agent list/console/send`
#     vẫn quản lý được dù ta bật qua tmux.
#   - Danh sách agent tự suy ra từ `git worktree list` -> thêm worktree không cần sửa script.
#
# Dùng — TẠO agent (thao tác tmux, KHÔNG lag theo ai-devkit):
#   agents create <name> [branch]  # worktree mới từ origin/main + npm install + skills + bật agent
#   agents up            # mở lại các agent feature còn thiếu (bỏ qua main)
#   agents new <name>    # tạo/tái tạo 1 agent theo tên (tự --continue)
#   agents open <name>   # attach/nhảy vào 1 agent
#   agents ls            # trạng thái các agent (tmux + ai-devkit)
#   agents rm <name>     # kill agent + gỡ worktree (branch giữ lại)
#   agents kill <name>   # kill 1 agent
#   agents kill-all      # kill tất cả (hỏi xác nhận)
#   agents sync          # đồng bộ mọi worktree với origin/main:
#                        #   gỡ cờ .mcp.json -> rebase (main: pull --ff-only)
#                        #   -> vá lại .mcp.json + cờ -> npm install / skills nếu lock đổi
#   agents mcp-fix       # vá entry memory trong .mcp.json (bản node) + skip-worktree, mọi worktree
#
# Dùng — DỰ PHÒNG khi ai-devkit console lag (qua CLI, không cần TUI):
#   agents send <name> "lời nhắn"   # gửi tin cho agent (ai-devkit agent send)
#   agents detail <name>            # xem chi tiết 20 dòng cuối
#   agents console                  # session 'console' riêng: pane trên = ai-devkit console,
#                                   # pane dưới = shell, chia đôi 50/50 (pane nhỏ -> né lag).
#                                   # Chạy lại khi pane console đã chết = dựng lại pane đó.

set -euo pipefail

# Vì sao cả script bị bọc trong khối { } mở ở dòng 2 và đóng ở cuối file:
# file này nằm trong chính worktree mà nó quản lý, nên `agents sync` (git pull trên
# main) có thể ghi đè nó GIỮA LÚC ĐANG CHẠY. Bash đọc script theo offset chứ không nạp
# hết vào RAM, nên không bọc thì nó đọc tiếp từ offset cũ trong file MỚI -> chạy nhầm
# nửa câu lệnh, lỗi rất khó truy. Khối { } buộc bash parse trọn vẹn trước khi chạy.
# Cố ý KHÔNG thụt lề phần thân: giữ diff ở mức vài dòng thay vì cả 512 dòng.

BASE="$HOME/Desktop/pinit"
MAIN="$BASE/pinit"                 # worktree main — dùng để chạy lệnh git
# Model dùng cho mọi agent. Đổi khi cần: PINIT_AGENT_MODEL=claude-fable-5
AGENT_MODEL="${PINIT_AGENT_MODEL:-claude-opus-5}"
# Lệnh phóng trong mỗi session. Override để test: PINIT_AGENT_CMD='sleep 999'
# --model ép model ngay lúc phóng (default toàn cục không áp cho phiên --continue)
CLAUDE_CONT="${PINIT_AGENT_CMD:-claude --continue --model $AGENT_MODEL || claude --model $AGENT_MODEL}"

# tmux chạy command của pane qua `sh -c`, KHÔNG qua zsh, nên pane thừa kế env của
# tmux *server* — server tạo từ lâu thì thiếu mọi biến khai sau đó trong ~/.zshrc.
# Ca đã gặp: PLANE_API_KEY rỗng -> MCP plane nhận literal `${PLANE_API_KEY}` -> HTTP 403,
# mà `claude mcp list` vẫn báo ✔ Connected nên rất khó thấy. Mở pane mới không cứu được
# vì env hỏng nằm ở server. Bọc qua zsh để pane tự đọc ~/.zshrc lúc khởi động.
# Phải là `-i`: export nằm trong ~/.zshrc, mà zsh chỉ source file này khi interactive
# (`zsh -lc` không interactive -> vẫn rỗng). Đo thực tế trong pane: -ic ra 42, sh -c ra 0.
login_cmd() {
  local q="'\\''"            # thay mỗi ' trong cmd thành '\'' để nhét vừa dấu nháy đơn
  printf "zsh -ic '%s'" "${1//\'/$q}"
}

NAMES=()
PATHS=()

# Suy ra tên agent + đường dẫn từ git worktree list.
#   pinit-glossary -> glossary ; pinit-blog-scp -> blog-scp ; pinit (main) -> main
load_agents() {
  NAMES=(); PATHS=()
  local path="" name=""
  # Mỗi entry: dòng "worktree <path>" ... kết thúc bằng dòng trống.
  while IFS= read -r line; do
    if [ "${line#worktree }" != "$line" ]; then
      path="${line#worktree }"
    elif [ -z "$line" ] && [ -n "$path" ]; then
      name="$(basename "$path")"
      name="${name#pinit-}"
      [ "$name" = "pinit" ] && name="main"
      NAMES+=("$name"); PATHS+=("$path")
      path=""
    fi
  done < <(git -C "$MAIN" worktree list --porcelain)
  # flush entry cuối nếu không có dòng trống kết
  if [ -n "$path" ]; then
    name="$(basename "$path")"; name="${name#pinit-}"
    [ "$name" = "pinit" ] && name="main"
    NAMES+=("$name"); PATHS+=("$path")
  fi
}

path_for() {
  local want="$1" i=0
  while [ $i -lt ${#NAMES[@]} ]; do
    [ "${NAMES[$i]}" = "$want" ] && { printf '%s\n' "${PATHS[$i]}"; return 0; }
    i=$((i+1))
  done
  return 1
}

alive() { tmux has-session -t "$1" 2>/dev/null; }

# Cài dependency cho một worktree.
#
# Bọc nvm vì repo pin node qua .nvmrc còn shell mặc định có thể là bản khác — cài
# sai version thì package-lock.json bị viết lại, mà lock bẩn lọt vào commit là hỏng
# cho mọi worktree. Không có nvm hay thiếu bản node thì vẫn cài, chỉ cảnh báo.
#
# Chạy trong subshell + `set +u`: nvm.sh đụng biến chưa khai, gặp `set -u` là chết ngay.
npm_install_at() {
  local p="$1"
  [ -f "$p/package.json" ] || return 0
  (
    set +u
    cd "$p" || exit 1
    if [ -s "$HOME/.nvm/nvm.sh" ] && [ -f .nvmrc ]; then
      export NVM_DIR="$HOME/.nvm"
      . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
      nvm use >/dev/null 2>&1 \
        || echo "  ! nvm chưa có node $(cat .nvmrc) — cài bằng node hiện tại ($(node -v 2>/dev/null))"
    fi
    npm install --no-audit --no-fund
  )
}

# Khôi phục skill từ skills-lock.json (hiện là archify — renderer 6.7MB, `.agents/` gitignore
# nên worktree mới luôn thiếu).
#
# KHÔNG tự tạo symlink ở đây: `.claude/skills/archify` đã được commit vào git (28 byte, mode
# 120000). Cố ý vậy vì `experimental_install` chỉ wire cho Codex/Cline/Amp/Antigravity và bỏ
# sót Claude Code — để nó tự sinh thì worktree có renderer chạy được mà agent không thấy skill,
# hỏng kiểu im lặng.
#
# Lệnh còn mang nhãn `experimental_` nên coi là best-effort: lỗi thì cảnh báo, không chặn
# `agents create` (agent vẫn làm được mọi task không cần diagram).
skills_install_at() {
  local p="$1"
  [ -f "$p/skills-lock.json" ] || return 0
  (
    set +u
    cd "$p" || exit 1
    npx -y skills experimental_install
  )
}

# Khôi phục 19 skill dev-*/task/tdd/... từ `.ai-devkit.json` (file này ĐƯỢC commit, đóng
# vai lockfile). Bản thật nằm ở ~/.ai-devkit/skills/ — ngoài repo — nên symlink bắt buộc
# là đường dẫn tuyệt đối và KHÔNG commit được: mỗi máy phải tự sinh path của mình.
#
# Khác `skills_install_at` ở một điểm quyết định: lệnh này CÓ tự wire `.claude/skills/`
# (đo 30/08/2026, log in `→ .claude/skills/<tên> (symlinked)`), nên không phải commit
# symlink như đã buộc phải làm với archify.
adk_install_at() {
  local p="$1"
  [ -f "$p/.ai-devkit.json" ] || return 0
  (
    set +u
    cd "$p" || exit 1
    npx -y ai-devkit install
  )
}

start_one() {   # tạo nếu chưa có
  local name="$1" path
  if ! path="$(path_for "$name")"; then
    echo "  ✗ không có worktree tên '$name' (xem: pinit-agents ls)"; return 1
  fi
  if alive "$name"; then echo "  • $name — đang chạy, bỏ qua"; return 0; fi
  tmux new-session -d -s "$name" -c "$path" "$(login_cmd "$CLAUDE_CONT")"
  echo "  + $name -> $path"
}

cmd_up() {   # bỏ qua 'main' (nơi chạy console/integrator, không cần agent riêng)
  local i=0
  echo "Mở lại agent còn thiếu (bỏ qua 'main'):"
  while [ $i -lt ${#NAMES[@]} ]; do
    if [ "${NAMES[$i]}" = "main" ]; then i=$((i+1)); continue; fi
    start_one "${NAMES[$i]}"
    i=$((i+1))
  done
  echo
  echo "Xong. \`agents ls\` để xem; \`agents open <name>\` để vào."
  echo "(Muốn bật agent cho main: \`agents new main\`)"
}

cmd_new() {     # tái tạo 1 agent (kill window cũ, bật lại --continue)
  local name="${1:?dùng: pinit-agents new <name>}"
  path_for "$name" >/dev/null || { echo "✗ không có worktree tên '$name'"; return 1; }
  tmux kill-session -t "$name" 2>/dev/null || true
  start_one "$name"
}

cmd_open() {
  local name="${1:?dùng: pinit-agents open <name>}"
  alive "$name" || { echo "✗ '$name' chưa chạy — \`pinit-agents new $name\`"; return 1; }
  if [ -n "${TMUX:-}" ]; then tmux switch-client -t "$name"; else tmux attach -t "$name"; fi
}

cmd_ls() {
  echo "=== worktree / agent ==="
  local i=0
  while [ $i -lt ${#NAMES[@]} ]; do
    local n="${NAMES[$i]}" st="ngủ"
    alive "$n" && st="chạy"
    printf "  %-12s %-5s %s\n" "$n" "$st" "${PATHS[$i]}"
    i=$((i+1))
  done
  echo
  echo "=== ai-devkit discover ==="
  ai-devkit agent list 2>/dev/null || echo "  (ai-devkit không sẵn sàng)"
}

# Đồng bộ MỘT worktree với origin/main.
#
# Vì sao không gọi thẳng `git rebase`: .mcp.json mang cờ skip-worktree và nội
# dung local khác bản git (workaround memory -> dist). Git coi file đó như
# "sạch" nên `git status` không báo gì, nhưng hễ origin/main có commit đụng vào
# path đó là chết ngay:
#     error: Your local changes to the following files would be overwritten
#            by checkout: .mcp.json
#     error: could not detach HEAD
# Đây KHÔNG phải conflict — không có rebase nào đang dở để `--continue`, và
# worktree đứng nguyên ở HEAD cũ trong khi status vẫn xanh. Nên phải gỡ cờ và
# trả file về bản git TRƯỚC, vá lại workaround SAU.
sync_one() {
  local p="$1" n="$2" lock0 lock1 slock0 slock1 adk0 adk1 rc=0 br

  # Branch đã đẩy lên remote thì KHÔNG sync — CLAUDE.md cấm cả hai đường: rebase làm
  # local lệch origin/<branch> (chữa lệch chỉ còn --force, cũng bị cấm), còn merge thì
  # đẻ merge commit vào nhánh feature. Cần main mới thì merge PR rồi tạo branch mới.
  # Guard phải nằm TRƯỚC đoạn gỡ cờ .mcp.json bên dưới: bỏ qua thì không đụng vào
  # file đó chút nào, khỏi phải vá lại.
  br="$(git -C "$p" branch --show-current 2>/dev/null)"
  if [ "$p" != "$MAIN" ] && [ -n "$br" ] \
     && git -C "$p" rev-parse --verify --quiet "refs/remotes/origin/$br" >/dev/null
  then
    if git -C "$p" merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
      echo "  ○ '$n' đã merge vào origin/main — bỏ qua."
      echo "    Dọn: agents rm $n && git -C \"$MAIN\" push origin --delete $br"
    else
      echo "  ! '$n' đã push lên origin/$br — KHÔNG sync (theo CLAUDE.md)."
      echo "    Branch đã push thì không rebase và cũng không merge origin/main."
      echo "    Cần main mới: merge PR của branch này, rồi tạo branch mới:"
      echo "      agents create <tên-mới>        # worktree mới từ origin/main"
    fi
    return 0
  fi

  lock0="$(git -C "$p" hash-object package-lock.json 2>/dev/null || echo -)"
  slock0="$(git -C "$p" hash-object skills-lock.json 2>/dev/null || echo -)"
  adk0="$(git -C "$p" hash-object .ai-devkit.json 2>/dev/null || echo -)"

  git -C "$p" update-index --no-skip-worktree .mcp.json 2>/dev/null || true
  git -C "$p" checkout -- .mcp.json 2>/dev/null || true

  if [ "$p" = "$MAIN" ]; then
    git -C "$p" pull --ff-only origin main || rc=$?
  else
    git -C "$p" rebase origin/main || rc=$?
  fi

  if [ "$rc" != "0" ]; then
    echo "  ! '$n' DỪNG, chưa resolve gì (theo CLAUDE.md)."
    echo "    Vào $p xử lý tay — nếu đang dở rebase thì \`git rebase --continue\`"
    echo "    hoặc \`--abort\`, xong chạy lại \`agents sync\`."
    echo "    LƯU Ý trong lúc chờ: .mcp.json đang ở bản git (memory = npx, chết"
    echo "    im lặng trên Node >= 26) và CHƯA có cờ skip-worktree. Cố ý để vậy —"
    echo "    vá lại ngay bây giờ sẽ chặn chính \`git rebase --continue\`."
    return 1
  fi

  setup_mcp "$p"   # vá memory -> dist + set lại cờ S

  lock1="$(git -C "$p" hash-object package-lock.json 2>/dev/null || echo -)"
  if [ "$lock0" != "$lock1" ]; then
    echo "  → package-lock.json đổi — npm install (bỏ bước này thì MCP chết im lặng)"
    npm_install_at "$p" || echo "  ! npm install lỗi ở '$n' — chạy tay"
  fi

  # Worktree cũ chưa từng bootstrap cũng vào nhánh này: slock0 = '-' (chưa có file) đổi thành
  # hash thật sau rebase, nên lần sync đầu sau khi skills-lock.json lên main là tự cài.
  slock1="$(git -C "$p" hash-object skills-lock.json 2>/dev/null || echo -)"
  if [ -f "$p/skills-lock.json" ] && { [ "$slock0" != "$slock1" ] || [ ! -d "$p/.agents/skills" ]; }; then
    echo "  → skills-lock.json đổi (hoặc .agents/ trống) — khôi phục skill"
    skills_install_at "$p" || echo "  ! skills install lỗi ở '$n' — chạy tay"
  fi

  # Cùng cơ chế cho skill ai-devkit. Điều kiện thứ hai bắt ca quan trọng hơn: symlink
  # `.claude/skills/dev-commit` không còn được commit nữa, nên worktree nào thiếu nó là
  # thiếu thật — không đợi `.ai-devkit.json` đổi mới chịu dựng lại.
  adk1="$(git -C "$p" hash-object .ai-devkit.json 2>/dev/null || echo -)"
  if [ -f "$p/.ai-devkit.json" ] && { [ "$adk0" != "$adk1" ] || [ ! -e "$p/.claude/skills/dev-commit" ]; }; then
    echo "  → .ai-devkit.json đổi (hoặc thiếu skill dev-*) — khôi phục skill ai-devkit"
    adk_install_at "$p" || echo "  ! ai-devkit install lỗi ở '$n' — chạy tay"
  fi
}

cmd_sync() {    # đồng bộ mọi worktree với origin/main. Conflict -> DỪNG, không tự resolve (theo CLAUDE.md)
  git -C "$MAIN" fetch origin || return 1
  local i=0 fail=0
  while [ $i -lt ${#NAMES[@]} ]; do
    echo "→ ${NAMES[$i]} (${PATHS[$i]})"
    sync_one "${PATHS[$i]}" "${NAMES[$i]}" || fail=$((fail+1))
    i=$((i+1))
  done
  echo
  if [ "$fail" -gt 0 ]; then
    echo "✗ $fail worktree dừng giữa chừng — xem log ở trên."
    return 1
  fi
  echo "✓ mọi worktree đã khớp origin/main."
}

cmd_kill() {
  local name="${1:?dùng: pinit-agents kill <name>}"
  ai-devkit agent kill "$name" >/dev/null 2>&1 || true
  if tmux kill-session -t "$name" 2>/dev/null; then echo "killed $name"; else echo "'$name' không chạy"; fi
}

cmd_kill_all() {
  printf "Kill tất cả agent (%s)? (y/N) " "$(IFS=' '; echo "${NAMES[*]}")"
  read -r reply
  case "$reply" in [Yy]*) ;; *) echo "huỷ"; return 1 ;; esac
  local i=0
  while [ $i -lt ${#NAMES[@]} ]; do cmd_kill "${NAMES[$i]}"; i=$((i+1)); done
}

# Sửa .mcp.json cho worktree mới: npx chạy bin qua symlink nên guard
# `argv[1] === import.meta.url` trong dist/index.js không khớp (Node >= 26)
# -> server exit 0 im lặng, MCP báo -32000. Trỏ node thẳng vào file thật.
#
# CHỈ vá đúng entry `memory`, KHÔNG ghi đè cả file. Repo đã commit thêm server
# khác vào .mcp.json (agentic-mermaid), mà file thì đang skip-worktree — clobber
# một phát là entry đó bay mất và git không hé một lời, đúng kiểu hỏng im lặng
# đã mất một buổi để tìm ra hồi @ai-devkit/memory.
setup_mcp() {
  local path="$1" entry file tmp
  file="$path/.mcp.json"
  entry="$(npm root -g 2>/dev/null)/ai-devkit/node_modules/@ai-devkit/memory/dist/index.js"
  if [ ! -f "$entry" ]; then
    echo "  ! không thấy @ai-devkit/memory ($entry) — giữ .mcp.json của repo"
    return 0
  fi
  entry="$(realpath "$entry")"   # path còn symlink thì guard lại gãy y hệt

  if ! command -v jq >/dev/null 2>&1; then
    echo "  ! không có jq — không dám sửa .mcp.json. Sửa tay entry memory thành:"
    echo "      \"command\": \"node\", \"args\": [\"$entry\"]"
    return 0
  fi

  tmp="$file.tmp.$$"
  if [ -f "$file" ]; then
    if ! jq --arg e "$entry" '.mcpServers.memory = {command:"node", args:[$e]}' \
         "$file" > "$tmp" 2>/dev/null; then
      rm -f "$tmp"
      echo "  ! .mcp.json không parse được — giữ nguyên, không đụng vào"
      return 1
    fi
  elif ! jq -n --arg e "$entry" '{mcpServers:{memory:{command:"node",args:[$e]}}}' > "$tmp"; then
    rm -f "$tmp"
    echo "  ! không sinh được .mcp.json"
    return 1
  fi
  mv "$tmp" "$file"

  # File nằm trong git — skip-worktree để path riêng của máy không lọt vào commit.
  if git -C "$path" ls-files --error-unmatch .mcp.json >/dev/null 2>&1; then
    git -C "$path" update-index --skip-worktree .mcp.json
    echo "  ✓ .mcp.json: memory -> node (skip-worktree; server khác giữ nguyên)"
  else
    echo "  ✓ .mcp.json: memory -> node (untracked; server khác giữ nguyên)"
  fi
}

cmd_mcp_fix() {  # chạy lại setup_mcp cho mọi worktree (path đổi: nâng Node, đổi npm root...)
  local i=0
  echo "Ghi lại .mcp.json cho mọi worktree:"
  while [ $i -lt ${#NAMES[@]} ]; do
    echo "→ ${NAMES[$i]}"
    setup_mcp "${PATHS[$i]}"
    i=$((i+1))
  done
  echo
  echo "Agent đang chạy phải \`agents new <name>\` để nạp config mới."
}

cmd_create() {   # tạo worktree feature MỚI từ origin/main rồi bật agent luôn
  local name="${1:?dùng: agents create <name> [branch]}"
  local branch="${2:-feat/$name}"
  local path="$BASE/pinit-$name"
  [ "$name" = "main" ] && { echo "✗ 'main' đã là worktree gốc"; return 1; }
  [ -e "$path" ] && { echo "✗ đã tồn tại: $path (dùng: agents new $name)"; return 1; }
  echo "▶ fetch origin (lấy code mới nhất)..."
  git -C "$MAIN" fetch origin || return 1
  echo "▶ tạo worktree $path — branch '$branch' từ origin/main..."
  git -C "$MAIN" worktree add -b "$branch" "$path" origin/main || return 1

  # `worktree add -b <br> ... origin/main` để lại upstream = origin/main, KHÔNG phải
  # origin/<br>. Hệ quả: `git push` trần trên branch này nhắm vào main. Gỡ tracking để
  # lần push đầu buộc phải nói rõ tên: `git push -u origin <br>`.
  git -C "$path" branch --unset-upstream 2>/dev/null || true

  setup_mcp "$path"    # .mcp.json bản node + skip-worktree (trước khi agent chạy)

  # Worktree mới không có node_modules (git không theo dõi thư mục này). Bỏ qua thì
  # agent chạy `npm run lint` là chết với `sh: next: command not found` — mà lint là
  # bước bắt buộc trước commit theo CLAUDE.md, nên coi như agent kẹt ngay từ task đầu.
  echo "▶ npm install (worktree mới chưa có node_modules)..."
  npm_install_at "$path" || echo "  ! npm install lỗi — chạy tay trước khi agent lint"

  # Cùng lý do với node_modules: `.agents/` gitignore nên worktree mới không có renderer
  # archify. Thiếu thì skill `archify` biến mất khỏi danh sách skill của agent.
  echo "▶ skills install (khôi phục archify từ skills-lock.json)..."
  skills_install_at "$path" || echo "  ! skills install lỗi — chạy tay: npx skills experimental_install"

  # 19 skill dev-*/task/tdd/... là symlink TUYỆT ĐỐI vào ~/.ai-devkit/, không commit được
  # (path neo vào $HOME từng máy) nên worktree mới cũng thiếu. Khác archify ở chỗ lệnh này
  # CÓ tự wire .claude/skills/, nên không cần commit symlink — chỉ cần chạy lệnh.
  echo "▶ ai-devkit install (khôi phục skill dev-* từ .ai-devkit.json)..."
  adk_install_at "$path" || echo "  ! ai-devkit install lỗi — chạy tay: npx ai-devkit install"

  # Hook chặn secret nằm ở .githooks/ (thư mục ĐƯỢC track) nên clone mới có sẵn file,
  # chỉ thiếu mỗi config trỏ tới. Config này là cấp repo, mọi worktree dùng chung —
  # đặt lại nhiều lần vô hại, nhưng quên một lần là repo public mất lớp chặn.
  if [ "$(git -C "$path" config core.hooksPath 2>/dev/null)" != ".githooks" ]; then
    git -C "$path" config core.hooksPath .githooks \
      && echo "▶ bật hook chặn secret (core.hooksPath=.githooks)"
  fi

  load_agents          # nạp lại để path_for thấy worktree mới
  start_one "$name"    # bật agent luôn
  echo
  echo "Xong. \`agents open $name\` để vào."
}

cmd_rm() {       # kill agent + gỡ worktree (branch được giữ lại)
  local name="${1:?dùng: agents rm <name>}" path
  [ "$name" = "main" ] && { echo "✗ không gỡ worktree main"; return 1; }
  path="$(path_for "$name")" || { echo "✗ không có worktree tên '$name'"; return 1; }
  cmd_kill "$name"
  if git -C "$MAIN" worktree remove "$path"; then
    echo "  ✓ đã gỡ worktree $path"
    echo "  (branch vẫn còn — xoá khi đã merge: git -C \"$MAIN\" branch -d <branch>)"
  else
    echo "  ✗ worktree còn thay đổi chưa commit. Kiểm tra rồi nếu chắc:"
    echo "    git -C \"$MAIN\" worktree remove --force \"$path\""
  fi
}

# --- dự phòng khi ai-devkit console lag: gọi CLI trực tiếp ---
# Lưu ý: dùng TÊN ai-devkit (vd pinit-glossary-16713); tên tmux 'glossary' thường
# khớp nhờ so trùng một phần (--id glossary). Kiểm bằng `agents ls` nếu không chắc.
cmd_send() {
  local name="${1:?dùng: agents send <name> \"lời nhắn\"}"; shift
  [ $# -gt 0 ] || { echo "thiếu lời nhắn"; return 1; }
  ai-devkit agent send --id "$name" "$*"
}

cmd_detail() {
  local name="${1:?dùng: agents detail <name>}"
  ai-devkit agent detail --id "$name" --tail 20
}

# Session tmux riêng cho console: pane trên = ai-devkit console, pane dưới = shell.
# Pane nhỏ (50/50) + tmux tiết chế redraw -> né lag. Độc lập với mọi agent session.
CONSOLE_SESSION="${PINIT_CONSOLE_SESSION:-console}"   # đổi tên để thử nghiệm, khỏi đụng session thật

# Lệnh của pane trên. Bọc vòng lặp vì `ai-devkit agent console` mà thoát (crash,
# lỡ Ctrl-C, env hỏng) là tmux XOÁ luôn pane — remain-on-exit mặc định off. Pane
# biến mất không một dòng lỗi, lần chạy sau `has-session` vẫn thấy session nên chỉ
# attach vào mỗi shell còn lại: đúng triệu chứng "console không còn chia đôi".
CONSOLE_CMD='while :; do ai-devkit agent console; rc=$?; printf "\n[ai-devkit agent console thoát — mã %s] Enter: chạy lại | Ctrl-C: bỏ pane\n" "$rc"; read -r _ || exit "$rc"; done'

# Pane console tự đánh dấu bằng option @role. Không dựa vào pane_title (chương
# trình chạy trong pane ghi đè được) hay pane index (split đổi số ngay).
console_pane() {
  tmux list-panes -t "$CONSOLE_SESSION" -F '#{pane_id} #{@role}' 2>/dev/null \
    | awk '$2 == "console" { print $1; exit }'
}

console_spawn() {   # đẻ pane console PHÍA TRÊN pane đang có (-b), rồi chia 50/50
  local id
  id="$(tmux split-window -bv -P -F '#{pane_id}' -t "$CONSOLE_SESSION" -c "$BASE" \
        "$(login_cmd "$CONSOLE_CMD")")" || return 1
  tmux set-option -p -t "$id" @role console
  tmux select-layout -t "$CONSOLE_SESSION" even-vertical >/dev/null
}

cmd_console() {
  local s="$CONSOLE_SESSION"
  if ! tmux has-session -t "$s" 2>/dev/null; then
    # Pane GỐC là shell, không phải console: pane gốc chết thì cả session chết theo.
    # Để console làm command của new-session, nó thoát sớm một cái là session bay,
    # `split-window` ngay sau báo "no such session" và `set -e` giết luôn script —
    # người dùng chỉ thấy lệnh im lặng không mở gì.
    tmux new-session -d -s "$s" -c "$BASE"
    console_spawn || echo "  ! không tạo được pane console — session '$s' chỉ có shell"
    echo "+ tạo session '$s' (console trên + shell dưới)"
  elif [ -z "$(console_pane)" ]; then
    console_spawn && echo "↻ pane console đã chết — dựng lại trong session '$s'"
  fi
  tmux select-pane -t "$s:.{bottom}"   # con trỏ về shell để gõ lệnh được ngay
  if [ -n "${TMUX:-}" ]; then tmux switch-client -t "$s"; else tmux attach -t "$s"; fi
}

usage() {
  sed -n '2,/^set /p' "$0" | grep '^#' | sed 's/^# \{0,1\}//'
}

load_agents
case "${1:-}" in
  create|add)   shift; cmd_create "$@" ;;
  up|resume)    cmd_up ;;
  new|recreate) shift; cmd_new "$@" ;;
  open|attach)  shift; cmd_open "$@" ;;
  ls|status)    cmd_ls ;;
  rm|remove)    shift; cmd_rm "$@" ;;
  sync)         cmd_sync ;;
  mcp-fix)      cmd_mcp_fix ;;
  kill)         shift; cmd_kill "$@" ;;
  kill-all)     cmd_kill_all ;;
  send|msg)     shift; cmd_send "$@" ;;
  detail)       shift; cmd_detail "$@" ;;
  console|con)  cmd_console ;;
  ""|-h|--help|help) usage ;;
  *) echo "lệnh lạ: $1"; echo; usage; exit 1 ;;
esac
}
exit
