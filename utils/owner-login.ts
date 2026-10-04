// Logic đăng nhập owner, tách khỏi API route để test được không cần HTTP.
// CHỈ CHẠY Ở NODE (bcryptjs) — đừng import từ middleware.
import bcrypt from 'bcryptjs'
import { getOwnerConfig } from './owner-auth'
import { signSession } from './owner-session'
import { createRateLimiter } from './rate-limit'

export const loginLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

// Hash của một chuỗi ngẫu nhiên, cost 12. Dùng khi OWNER_PASSWORD_HASH thiếu
// hoặc hỏng để bcrypt vẫn tốn đúng chừng ấy thời gian — thời gian phản hồi
// không tiết lộ feature đang bật hay tắt.
const DUMMY_HASH = '$2b$12$6cUN0FGunfzqrq/hVycpSO.EXidPdqQ.de6xpp/4HO6zeqrn4ZNvq'

export type LoginResult =
  | { status: 200; token: string }
  | { status: 401 }
  | { status: 404 }
  | { status: 429; retryAfter: number }

export async function attemptLogin(
  passphrase: unknown,
  ip: string,
  now = Date.now()
): Promise<LoginResult> {
  const retryAfter = loginLimiter.retryAfter(ip, now)
  if (retryAfter > 0) return { status: 429, retryAfter }

  const config = getOwnerConfig()
  const input = typeof passphrase === 'string' ? passphrase : ''
  // bcrypt chỉ đọc 72 byte đầu; cắt bớt để chuỗi khổng lồ không ăn CPU.
  const ok = await bcrypt
    .compare(input.slice(0, 256), config?.passwordHash ?? DUMMY_HASH)
    .catch(() => false)

  if (!config) return { status: 404 }
  if (!ok || input.length === 0) {
    loginLimiter.recordFailure(ip, now)
    return { status: 401 }
  }
  loginLimiter.reset(ip)
  return { status: 200, token: await signSession(config.sessionSecret, now) }
}
