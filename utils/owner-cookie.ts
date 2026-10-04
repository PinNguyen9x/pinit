import type { IncomingMessage } from 'http'
import type { TLSSocket } from 'tls'
import { OWNER_COOKIE, SESSION_TTL_SECONDS } from './owner-session'

/**
 * Secure khi chạy production hoặc request đến qua https. Dev local trên
 * http://localhost phải tắt: Safari không lưu cookie Secure trên http, kể cả
 * localhost. Header x-forwarded-proto do client tự đặt được, nhưng giả nó chỉ
 * làm cookie *chặt hơn* — không có hướng tấn công.
 */
export function shouldUseSecureCookie(
  nodeEnv: string | undefined,
  forwardedProto: string | string[] | undefined,
  encrypted = false
): boolean {
  if (nodeEnv === 'production' || encrypted) return true
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto
  return proto?.split(',')[0].trim() === 'https'
}

// Ghép Set-Cookie bằng tay thay vì dùng lib `cookies` như /api/login: lib đó
// ném lỗi khi set cookie Secure trên kết nối HTTP — mà sau nginx thì kết nối
// tới Node luôn là HTTP. Path=/ vì cả /me lẫn /api/me đều cần cookie.
export function ownerCookieHeader(token: string | null, secure: boolean): string {
  const attrs = [
    `${OWNER_COOKIE}=${token ?? ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${token ? SESSION_TTL_SECONDS : 0}`,
  ]
  if (secure) attrs.push('Secure')
  return attrs.join('; ')
}

export function isSecureRequest(req: IncomingMessage): boolean {
  return shouldUseSecureCookie(
    process.env.NODE_ENV,
    req.headers['x-forwarded-proto'],
    (req.socket as TLSSocket).encrypted === true
  )
}
