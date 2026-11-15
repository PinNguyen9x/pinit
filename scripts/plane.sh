#!/usr/bin/env bash
#
# plane — đường lui khi MCP `plane` không lên, gọi thẳng REST API.
#
#   plane.sh list <module> [state ...]   việc của một module (mặc định Todo + In Progress)
#   plane.sh show <item>                 chi tiết một work item
#   plane.sh state <item> <state>        đổi state
#   plane.sh comment <item> [html]       thêm comment (không có html thì đọc stdin)
#
# <module> và <state> nhận tên trong bảng dưới, hoặc UUID thô. <item> là UUID —
# lấy từ cột thứ ba của `list`, không phải số PINIT-N hiện trên web.
#
#   PLANE_API_KEY=...  plane.sh list glossary
#   plane.sh state 3069b779-... "In Review"
#   plane.sh comment 3069b779-... '<p>Xong, commit <code>abc1234</code></p>'
#   plane.sh state <item> Done --dry-run      # in request ra, không gửi
#
set -euo pipefail
{

# Bảng ID chép từ CLAUDE.md, KHÔNG tra động: tool `module` và `project` của MCP
# bị deny có chủ đích, nên script cũng không đi cửa sau bằng REST. Có module mới
# thì thêm vào đây cùng lúc với CLAUDE.md — hai chỗ lệch nhau là lỗi im lặng,
# query trả rỗng y hệt "hết việc".
PROJECT_ID='3471d6c1-0c05-417e-8211-03f47ad5f648'

module_id() {
  case "$1" in
    glossary)          echo '9e2260db-6d52-4ded-8b94-52a18758106b' ;;
    research-planed)   echo '4d198c44-ed66-4606-b8cf-76d5ce86e7ba' ;;
    tmux-terminal-git) echo '4135fd88-de22-4a9a-a431-add12a5ed40e' ;;
    cloudflare)        echo '67fc16f7-e191-4909-b1f7-1dccdcd5b14e' ;;
    ui-ux|UI/UX)       echo '328e8253-807b-4c54-bc96-eaf04ec0657f' ;;
    *-*-*-*-*)         echo "$1" ;;
    *) die "không biết module '$1' — thêm vào bảng trong script + CLAUDE.md, hoặc truyền UUID" ;;
  esac
}

state_id() {
  case "$1" in
    Todo|todo)               echo 'd6f14d6c-c832-4003-8c26-4d94f14330ba' ;;
    'In Progress'|progress)  echo '632c35fa-4945-4e2e-8723-2f3b58c8bff0' ;;
    'In Review'|review)      echo '6f9b66cb-d44a-4f33-8af3-69581d8d90f0' ;;
    Blocked|blocked)         echo 'c94c0d6a-039e-418d-bff9-a4227de07135' ;;
    Done|done)               echo '4aa41fc6-5879-45c9-a3ef-cd0163d4ce88' ;;
    *-*-*-*-*)               echo "$1" ;;
    *) die "không biết state '$1' (Todo|In Progress|In Review|Blocked|Done)" ;;
  esac
}

state_name() {
  case "$1" in
    d6f14d6c-c832-4003-8c26-4d94f14330ba) echo 'Todo' ;;
    632c35fa-4945-4e2e-8723-2f3b58c8bff0) echo 'In Progress' ;;
    6f9b66cb-d44a-4f33-8af3-69581d8d90f0) echo 'In Review' ;;
    c94c0d6a-039e-418d-bff9-a4227de07135) echo 'Blocked' ;;
    4aa41fc6-5879-45c9-a3ef-cd0163d4ce88) echo 'Done' ;;
    *) echo "${1:0:8}…" ;;
  esac
}

die() { echo "plane: $*" >&2; exit 1; }

usage() { sed -n '3,/^set /p' "$0" | grep '^#' | sed 's/^# \{0,1\}//'; }

BASE_URL="${PLANE_BASE_URL:-https://api.plane.so}"
SLUG="${PLANE_WORKSPACE_SLUG:-pin}"
API="$BASE_URL/api/v1/workspaces/$SLUG/projects/$PROJECT_ID"
DRY_RUN=0

# Gọi API, tách status khỏi body. Phân biệt ba kiểu hỏng hay gặp — chúng trả
# cùng một mã nhưng cách chữa khác hẳn nhau:
#   403 + body HTML       -> WAF Cloudflare chặn *nội dung* (hay dính ở comment)
#   403 + body JSON token -> PLANE_API_KEY rỗng hoặc chưa expand
#   404                   -> sai project/module/item id, KHÔNG phải sai quyền
api() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-sS -m 30 -w '\n%{http_code}' -X "$method"
    -H "X-API-Key: $PLANE_API_KEY" -H 'Content-Type: application/json')
  [ -n "$body" ] && args+=(-d "$body")

  if [ "$DRY_RUN" = 1 ]; then
    echo "DRY RUN  $method $API$path" >&2
    [ -n "$body" ] && echo "$body" >&2
    return 0
  fi

  local out status payload
  out="$(curl "${args[@]}" "$API$path")"
  status="${out##*$'\n'}"
  payload="${out%$'\n'*}"

  case "$status" in
    2*) printf '%s' "$payload" ;;
    403)
      # Ba loại 403 khác nhau hoàn toàn về cách chữa — đọc body mới biết là loại nào.
      if [ "${payload:0:1}" = '<' ]; then
        die "403 kèm trang HTML = WAF chặn NỘI DUNG, không phải lỗi token. Đổi câu chữ (comment có path/lệnh hay dính) rồi gửi lại."
      fi
      case "$payload" in
        *'token is not valid'*|*'API token'*)
          die "403 token không hợp lệ — PLANE_API_KEY chưa expand (server nhận nguyên chuỗi \${PLANE_API_KEY}).
Kiểm: [ -n \"\$PLANE_API_KEY\" ] && echo \${#PLANE_API_KEY}" ;;
        *permission*)
          die "403 không có quyền xem tài nguyên này: $(printf '%s' "$payload" | head -c 160)
Token vẫn tốt (lệnh khác chạy được) — thường là id trong bảng đã cũ hoặc module thuộc project khác." ;;
        *) die "403: $(printf '%s' "$payload" | head -c 200)" ;;
      esac
      ;;
    404) die "404 — sai id (project/module/item), không phải thiếu quyền: $method $path" ;;
    *)   die "HTTP $status: $(printf '%s' "$payload" | head -c 300)" ;;
  esac
}

need_arg() { [ -n "${1:-}" ] || die "thiếu tham số — xem 'plane.sh' không tham số để đọc cú pháp"; }

cmd_list() {
  local module="${1:-}"; need_arg "$module"; shift || true
  local wanted=("$@")
  [ ${#wanted[@]} -eq 0 ] && wanted=('Todo' 'In Progress')

  local ids=()
  local s
  for s in "${wanted[@]}"; do ids+=("$(state_id "$s")"); done

  local json
  json="$(api GET "/modules/$(module_id "$module")/module-issues/?per_page=100")"

  # Lọc state phía client: endpoint module-issues không nhận filter state, mà
  # lọc sai thì kết quả rỗng trông y hệt "hết việc" — tự lọc thì nhìn thấy cả
  # tổng số để đối chiếu.
  local filter
  filter="$(printf '%s\n' "${ids[@]}" | jq -R . | jq -sc .)"
  printf '%s' "$json" | jq -r --argjson want "$filter" '
    (.results // []) as $all
    | ($all | map(select(.state as $s | $want | index($s)))) as $hit
    | ($hit[] | "\(.sequence_id)\t\(.state)\t\(.id)\t\(.name)"),
      "— \($hit | length)/\($all | length) item khớp state —"
  ' | while IFS=$'\t' read -r seq st id name; do
    if [ -z "${name:-}" ]; then echo "$seq"; else
      printf 'PINIT-%-4s %-12s %s  %s\n' "$seq" "$(state_name "$st")" "$id" "$name"
    fi
  done
}

cmd_show() {
  local item="${1:-}"; need_arg "$item"
  api GET "/issues/$item/" | jq -r '
    "PINIT-\(.sequence_id)  \(.name)\nstate: \(.state)\ncreated: \(.created_at)\n\n\(.description_stripped // "(không có mô tả)")"'
}

cmd_state() {
  local item="${1:-}" want="${2:-}"
  need_arg "$item"; need_arg "$want"
  api PATCH "/issues/$item/" "$(jq -nc --arg s "$(state_id "$want")" '{state:$s}')" \
    | jq -r 'if .id then "PINIT-\(.sequence_id) -> state \(.state)" else . end'
}

cmd_comment() {
  local item="${1:-}"; need_arg "$item"
  local html="${2:-}"
  [ -n "$html" ] || html="$(cat)"
  [ -n "$html" ] || die "comment rỗng"

  # Plane hiện nguyên tag nếu nhận HTML đã escape — xem memory
  # plane-html-fields-raw. Bắt tại đây vì lỗi này chỉ lộ ra khi mở web lên xem.
  case "$html" in
    *'&lt;'*) die "comment chứa '&lt;' — gửi tag thô (<p>…</p>), đừng escape" ;;
  esac

  api POST "/issues/$item/comments/" "$(jq -nc --arg h "$html" '{comment_html:$h}')" \
    | jq -r 'if .id then "comment \(.id) đã tạo" else . end'
}

main() {
  local args=()
  local a
  for a in "$@"; do
    case "$a" in
      --dry-run) DRY_RUN=1 ;;
      -h|--help) usage; return 0 ;;
      *) args+=("$a") ;;
    esac
  done
  set -- "${args[@]:-}"

  [ -n "${1:-}" ] || { usage; return 0; }
  command -v jq > /dev/null || die 'cần jq (brew install jq)'
  [ -n "${PLANE_API_KEY:-}" ] || die 'PLANE_API_KEY rỗng — mở shell có đọc ~/.zshrc'

  local cmd="$1"; shift
  case "$cmd" in
    list)    cmd_list "$@" ;;
    show)    cmd_show "$@" ;;
    state)   cmd_state "$@" ;;
    comment) cmd_comment "$@" ;;
    *) die "lệnh lạ '$cmd' — list|show|state|comment" ;;
  esac
}

main "$@"

}
