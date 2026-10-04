// Cấu hình + helper dùng chung cho khu /me. Không import gì của Node: middleware
// (edge runtime) cũng gọi vào đây.
import type { GetServerSidePropsContext } from 'next'
import { OWNER_COOKIE, verifySession } from './owner-session'

export interface OwnerConfig {
  passwordHash: string
  sessionSecret: string
}

// Secret ngắn thì HMAC chỉ mạnh bằng độ dài secret — coi như chưa cấu hình.
const MIN_SECRET_LENGTH = 32

// $2a/$2b/$2y, cost 2 chữ số, 53 ký tự salt+hash. Hash chứa `$` mà Docker
// Compose diễn giải `$` trong env_file nếu giá trị không bọc nháy đơn — hash bị
// cắt thì không passphrase nào khớp, triệu chứng chỉ là "login mãi không được".
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/

/** Vì sao khu /me tắt — null = cấu hình hợp lệ. Dùng cho log lúc khởi động. */
export function ownerConfigProblem(): string | null {
  const passwordHash = process.env.OWNER_PASSWORD_HASH
  const sessionSecret = process.env.SESSION_SECRET
  if (!passwordHash || !sessionSecret) return 'OWNER_PASSWORD_HASH hoặc SESSION_SECRET chưa đặt'
  if (sessionSecret.length < MIN_SECRET_LENGTH)
    return `SESSION_SECRET ngắn hơn ${MIN_SECRET_LENGTH} ký tự`
  if (!BCRYPT_RE.test(passwordHash)) {
    return `OWNER_PASSWORD_HASH không phải hash bcrypt đầy đủ (dài ${passwordHash.length}, cần 60) — trong env_file của Docker Compose phải bọc nháy đơn: OWNER_PASSWORD_HASH='$2b$12$...'`
  }
  return null
}

/**
 * null = khu /me tắt (mọi route trả 404). Đọc thẳng `process.env.X` chứ không
 * qua biến trung gian: bundler của middleware chỉ nhận ra dạng truy cập này.
 */
export function getOwnerConfig(): OwnerConfig | null {
  if (ownerConfigProblem()) return null
  return {
    passwordHash: process.env.OWNER_PASSWORD_HASH!,
    sessionSecret: process.env.SESSION_SECRET!,
  }
}

/**
 * IP để rate limit. Chỉ tin X-Forwarded-For khi TRUST_PROXY=1 (prod, sau nginx
 * cùng máy) — staging mở thẳng cổng 3001 nên ai cũng tự đặt header được.
 * Lấy phần tử CUỐI: nginx `$proxy_add_x_forwarded_for` nối IP thật vào cuối,
 * các phần tử phía trước là do client tự khai.
 */
export function getClientIp(
  forwardedFor: string | string[] | undefined,
  remoteAddress: string | undefined,
  trustProxy = process.env.TRUST_PROXY === '1',
): string {
  if (trustProxy && forwardedFor) {
    const raw = Array.isArray(forwardedFor) ? forwardedFor.join(',') : forwardedFor
    const last = raw.split(',').pop()?.trim()
    if (last) return last
  }
  return remoteAddress ?? 'unknown'
}

/**
 * Chỉ nhận path nội bộ — chặn open redirect qua `?next=`. `//host` và `/\host`
 * trình duyệt đều hiểu là URL tới host khác. Ký tự điều khiển cũng loại: trình
 * duyệt xoá tab/xuống dòng trong URL, nên `/\t/evil.com` thành `//evil.com`.
 */
export function safeNextPath(next: unknown): string {
  if (
    typeof next !== 'string' ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.startsWith('/\\') ||
    /[\u0000-\u001f\u007f]/.test(next)
  ) {
    return '/me'
  }
  return next
}

/**
 * Kiểm lại phiên trong getServerSideProps. Middleware đã chặn trước, đây là
 * lớp thứ hai phòng khi matcher bị sửa sai — trang private không được phép
 * render chỉ vì một dòng config.
 */
export async function requireOwner(ctx: GetServerSidePropsContext) {
  const config = getOwnerConfig()
  if (!config) return { notFound: true as const }
  const ok = await verifySession(ctx.req.cookies[OWNER_COOKIE], config.sessionSecret)
  if (ok) return null
  return {
    redirect: {
      destination: `/me/login?next=${encodeURIComponent(ctx.resolvedUrl)}`,
      permanent: false,
    },
  }
}
