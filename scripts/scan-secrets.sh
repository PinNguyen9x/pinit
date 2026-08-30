#!/usr/bin/env bash
# scan-secrets.sh — dò secret trong MỘT KHOẢNG DIFF bất kỳ.
#
# Đây là NƠI DUY NHẤT định nghĩa danh sách mẫu. Hai chỗ gọi nó:
#   .githooks/pre-commit              -> scripts/scan-secrets.sh --cached
#   .github/workflows/secret-scan.yml -> scripts/scan-secrets.sh "origin/$BASE...HEAD"
# Chép mẫu ra chỗ thứ hai là chắc chắn lệch — xem PINIT-17/19, đã dính hai lần giữa
# CLAUDE.md và pinit-agents.sh.
#
# Dùng:
#   scripts/scan-secrets.sh --cached            # phần đang stage
#   scripts/scan-secrets.sh origin/main...HEAD  # một dải commit
#
# Exit 0 = sạch, 1 = có phát hiện (đã in ra stderr).
#
# Viết cho bash 3.2 (macOS mặc định) — không dùng mapfile/declare -A.
set -euo pipefail

[ "$#" -ge 1 ] || { echo "dùng: $0 --cached | <git-diff-range>" >&2; exit 2; }
RANGE="$1"

# Loại trừ chính hai file định nghĩa/mang mẫu, nếu không chúng tự khớp chính mình.
EXCLUDE='^(\.githooks/|scripts/scan-secrets\.sh$)'

# Mẫu secret có cấu trúc rõ. Cố ý KHÔNG bắt thứ mơ hồ ("password", "/Users/<tên>"):
# báo nhầm nhiều thì người ta quen tay --no-verify và lớp chặn thành vô dụng.
SECRET_RE='plane_api_[0-9a-f]{16,}'
SECRET_RE+='|gh[pousr]_[A-Za-z0-9]{20,}'
SECRET_RE+='|sk-ant-[A-Za-z0-9_-]{20,}'
SECRET_RE+='|sk-[A-Za-z0-9]{32,}'
SECRET_RE+='|AKIA[0-9A-Z]{16}'
SECRET_RE+='|-----BEGIN [A-Z ]*PRIVATE KEY-----'

# IPv4 public. Dải nội bộ được phép — blog có 192.168.1.104 hợp lệ, chặn là báo nhầm.
IP_RE='(^|[^0-9.])((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])([^0-9.]|$)'
IP_SKIP='(^|[^0-9.])(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|255\.255\.255\.255)'

FILELIST="$(mktemp)"
trap 'rm -f "$FILELIST"' EXIT
git diff "$RANGE" --name-only --diff-filter=ACM 2>/dev/null \
  | grep -vE "$EXCLUDE" > "$FILELIST" || true
[ -s "$FILELIST" ] || exit 0

hits=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  # -U0: chỉ dòng đổi, bỏ context (context là dòng cũ, không thuộc thay đổi này).
  # awk bám @@ để suy ra số dòng thật trong file mới.
  while IFS=$'\t' read -r lineno content; do
    [ -n "${content:-}" ] || continue
    kind=""
    if printf '%s' "$content" | grep -qE "$SECRET_RE"; then
      kind="secret"
    elif printf '%s' "$content" | grep -qE "$IP_RE" \
      && ! printf '%s' "$content" | grep -qE "$IP_SKIP"; then
      kind="IP public"
    fi
    [ -n "$kind" ] || continue
    printf '  %s:%s\n    %s: %s\n' \
      "$f" "$lineno" "$kind" "$(printf '%s' "$content" | cut -c1-100)" >&2
    hits=$((hits + 1))
  done < <(git diff "$RANGE" -U0 -- "$f" | awk '
    /^@@/  { match($0, /\+[0-9]+/); n = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }
    /^\+\+\+/ { next }
    /^\+/  { print n "\t" substr($0, 2); n++ }
  ')
done < "$FILELIST"

[ "$hits" -eq 0 ] && exit 0

cat >&2 <<'MSG'

✗ phát hiện chuỗi giống secret (xem trên).

Repo này là PUBLIC. Đã push là coi như lộ — xoá commit sau đó không cứu được, vì
GitHub vẫn giữ object và người khác có thể đã fetch. Phải revoke/xoay key.

Nếu là secret thật:
  1. Bỏ khỏi file, dùng biến môi trường hoặc file đã gitignore
  2. Nếu key từng bị push -> revoke ngay, đừng chỉ xoá dòng
MSG
exit 1
