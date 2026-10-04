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

/**
 * null = khu /me tắt (mọi route trả 404). Đọc thẳng `process.env.X` chứ không
 * qua biến trung gian: bundler của middleware chỉ nhận ra dạng truy cập này.
 */
export function getOwnerConfig(): OwnerConfig | null {
  const passwordHash = process.env.OWNER_PASSWORD_HASH
  const sessionSecret = process.env.SESSION_SECRET
  if (!passwordHash || !sessionSecret || sessionSecret.length < MIN_SECRET_LENGTH) return null
  return { passwordHash, sessionSecret }
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
  trustProxy = process.env.TRUST_PROXY === '1'
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
