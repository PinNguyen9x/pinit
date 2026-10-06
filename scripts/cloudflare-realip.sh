#!/usr/bin/env bash
# cloudflare-realip.sh — sinh snippet nginx để $remote_addr là IP THẬT của khách,
# không phải IP của Cloudflare hay của cloudflared.
#
# Dùng (trên VPS):
#   scripts/cloudflare-realip.sh                       # in ra stdout để xem trước
#   sudo scripts/cloudflare-realip.sh -o /etc/nginx/conf.d/cloudflare-realip.conf
#   sudo nginx -t && sudo systemctl reload nginx        # BẮT BUỘC kiểm trước khi reload
#
# Vì sao cần: rate limit đăng nhập /me đếm theo IP, và getClientIp() trong
# utils/owner-auth.ts lấy PHẦN TỬ CUỐI của X-Forwarded-For — phần nginx tự nối vào
# ($proxy_add_x_forwarded_for = $http_x_forwarded_for + $remote_addr). Thiếu snippet
# này thì phần tử cuối là IP của cloudflared (127.0.0.1) hoặc của edge Cloudflare:
# mọi khách dồn vào MỘT bucket, 5 lần sai của bất kỳ ai khoá tất cả. fail2ban cũng
# chỉ thấy một IP nên ban vô nghĩa.
#
# Hai nhóm địa chỉ cần tin, KHÁC NHAU và cần cả hai trong giai đoạn chuyển đổi:
#
#   1. 127.0.0.1 / ::1  — bắt buộc cho TUNNEL. cloudflared chạy cùng máy
#      (network_mode: host), nên kết nối TCP tới nginx đến từ loopback. Dải IP
#      public của Cloudflare KHÔNG BAO GIỜ khớp ở topology này — đây là chỗ dễ
#      làm sai nhất: chép đúng công thức của bản "DNS proxied" vào bản tunnel thì
#      real_ip im lặng không áp dụng, không lỗi, không log, chỉ rate limit sai.
#
#   2. Dải public của Cloudflare — cho traffic còn vào thẳng origin:443 bằng
#      A record proxied, tức giai đoạn TRƯỚC khi đóng 80/443 ở ufw. Sau khi đã
#      đóng cổng thì nhóm này thành vô hại (không còn ai kết nối từ đó).
#
# Tin loopback là an toàn: chỉ process trên chính máy mới kết nối từ 127.0.0.1,
# mà process đó là cloudflared. Tin dải Cloudflare cũng an toàn vì chỉ edge của
# Cloudflare mới có các IP đó.
#
# Exit 0 = đã sinh xong, 1 = lỗi tải/dữ liệu không hợp lệ (KHÔNG ghi file).
set -euo pipefail

V4_URL='https://www.cloudflare.com/ips-v4'
V6_URL='https://www.cloudflare.com/ips-v6'
# Thực tế Cloudflare công bố ~15 dải v4 và ~7 dải v6. Ngưỡng thấp để không vỡ khi
# họ gộp dải, nhưng đủ chặn trường hợp tải về một trang lỗi hay body rỗng.
MIN_V4=5
MIN_V6=3

OUT=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o|--output) OUT="${2:?-o cần đường dẫn}"; shift 2 ;;
    -h|--help)   sed -n '2,/^set /p' "$0" | grep '^#'; exit 0 ;;
    *)           echo "tham số lạ: $1" >&2; exit 2 ;;
  esac
done

fetch() {
  # --fail: HTTP 4xx/5xx thành exit != 0 thay vì ghi trang lỗi vào config nginx.
  curl -fsS --max-time 20 "$1"
}

# Chỉ nhận dòng là CIDR. Đây là lớp chắn quan trọng nhất của script: nginx chỉ có
# MỘT đường vào sau khi đóng cổng, nên một dòng rác trong config là sập toàn site.
only_cidr() {
  grep -Ex '[0-9a-fA-F:.]+/[0-9]{1,3}' || true
}

V4="$(fetch "$V4_URL" | only_cidr)" || { echo "✗ không tải được $V4_URL" >&2; exit 1; }
V6="$(fetch "$V6_URL" | only_cidr)" || { echo "✗ không tải được $V6_URL" >&2; exit 1; }

n4=$(printf '%s\n' "$V4" | grep -c . || true)
n6=$(printf '%s\n' "$V6" | grep -c . || true)
if [ "$n4" -lt "$MIN_V4" ] || [ "$n6" -lt "$MIN_V6" ]; then
  echo "✗ dữ liệu không hợp lệ: $n4 dải v4 (cần ≥$MIN_V4), $n6 dải v6 (cần ≥$MIN_V6)." >&2
  echo "  Không ghi gì cả — config nginx cũ giữ nguyên." >&2
  exit 1
fi

emit() {
  cat <<EOF
# SINH TỰ ĐỘNG bởi scripts/cloudflare-realip.sh — đừng sửa tay.
# Cập nhật: $(date -u '+%Y-%m-%d %H:%M UTC')  ·  nguồn: $V4_URL, $V6_URL
# Dải IP Cloudflare đổi theo thời gian; chạy lại script rồi "nginx -t" + reload.

# cloudflared chạy cùng máy -> kết nối tới nginx đến từ loopback.
# BẮT BUỘC cho tunnel: dải public bên dưới không bao giờ khớp ở topology này.
set_real_ip_from 127.0.0.1;
set_real_ip_from ::1;

# Cho traffic vào thẳng origin:443 qua A record proxied (giai đoạn trước khi
# đóng 80/443 ở ufw). Sau khi đóng cổng thì vô hại.
EOF
  printf '%s\n' "$V4" | sed 's/^/set_real_ip_from /; s/$/;/'
  printf '%s\n' "$V6" | sed 's/^/set_real_ip_from /; s/$/;/'
  cat <<'EOF'

# Cloudflare đặt CF-Connecting-IP = IP thật của khách, và ghi đè nếu client tự
# khai -> không giả được từ ngoài. Cố ý KHÔNG dùng X-Forwarded-For ở đây:
# header đó là danh sách client chèn được, còn CF-Connecting-IP là một IP duy nhất.
real_ip_header CF-Connecting-IP;

# Để tắt: real_ip_recursive chỉ có nghĩa với header dạng danh sách.
real_ip_recursive off;
EOF
}

if [ -n "$OUT" ]; then
  # Ghi qua file tạm rồi mv: không để nginx đọc được file nửa vời nếu script chết.
  TMP="$(mktemp "${OUT}.XXXXXX")"
  trap 'rm -f "$TMP"' EXIT
  emit > "$TMP"
  chmod 644 "$TMP"
  mv "$TMP" "$OUT"
  trap - EXIT
  echo "✓ đã ghi $OUT ($n4 dải v4, $n6 dải v6, + loopback)"
  echo "  Bước tiếp: sudo nginx -t && sudo systemctl reload nginx"
else
  emit
fi
