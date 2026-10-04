#!/usr/bin/env bash
# check-image-private.sh — chặn image chứa content private của khu /me.
#
# Repo và image đều PUBLIC. Content thật chỉ được nằm trên disk VPS (bind-mount
# :ro lúc chạy); .dockerignore + outputFileTracingExcludes đã loại nó khỏi build,
# script này là lớp kiểm cuối: đọc danh sách file THẬT trong image chứ không tin
# cấu hình. Gọi từ .github/workflows/deploy.yml giữa bước build và bước push.
#
# Dùng:
#   scripts/check-image-private.sh <image>          # kiểm image đã build (cần docker)
#   scripts/check-image-private.sh --listing <file> # kiểm danh sách đường dẫn (test, không cần docker)
#
# Exit 0 = sạch, 1 = có file cấm (in ra stderr), 2 = dùng sai / docker lỗi.
#
# Viết cho bash 3.2 (macOS mặc định) — không dùng mapfile/declare -A.
set -euo pipefail

# Thư mục private-content (KHÔNG khớp private-content.example), .denylist, log practice.
FORBIDDEN_RE='(^|/)private-content(/|$)|(^|/)\.denylist$|\.jsonl$'

usage() {
  echo "dùng: $0 <image> | --listing <file>" >&2
  exit 2
}

check_listing() {
  local hits
  hits=$(grep -E "$FORBIDDEN_RE" "$1" || true)
  if [ -n "$hits" ]; then
    echo "✗ image chứa file của khu private — KHÔNG được push:" >&2
    printf '%s\n' "$hits" | sed 's/^/  /' >&2
    exit 1
  fi
  echo "✓ image sạch: $(wc -l <"$1" | tr -d ' ') đường dẫn, không có private-content / .denylist / *.jsonl" >&2
}

[ "$#" -ge 1 ] || usage

if [ "$1" = "--listing" ]; then
  [ "$#" -eq 2 ] && [ -f "$2" ] || usage
  check_listing "$2"
  exit 0
fi

IMAGE="$1"
LISTING=$(mktemp)
CID=""
cleanup() {
  rm -f "$LISTING"
  [ -z "$CID" ] || docker rm "$CID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# docker create không chạy gì trong image — chỉ cần filesystem để export.
CID=$(docker create "$IMAGE") || { echo "✗ không tạo được container từ $IMAGE" >&2; exit 2; }
docker export "$CID" | tar -t >"$LISTING" || { echo "✗ không đọc được filesystem của $IMAGE" >&2; exit 2; }
[ -s "$LISTING" ] || { echo "✗ danh sách file rỗng — không kiểm được, không coi là pass" >&2; exit 2; }
check_listing "$LISTING"
