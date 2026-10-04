// Cookie phiên của owner cho khu /me — dạng `<exp>.<nonce>.<sig>`, sig là
// HMAC-SHA256 trên `<exp>.<nonce>` ký bằng SESSION_SECRET.
//
// Chỉ dùng Web Crypto + btoa/atob: file này được middleware import, mà
// middleware chạy trên edge runtime — không có `crypto` hay `Buffer` của Node.
//
// Không lưu gì phía server: một owner, không cần thu hồi từng phiên. Muốn đá
// mọi phiên ra thì xoay SESSION_SECRET.

export const OWNER_COOKIE = 'pinit_owner'
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(bin, (c) => c.charCodeAt(0))
  } catch {
    return null
  }
}

function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signSession(secret: string, now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)))
  const payload = `${exp}.${nonce}`
  const sig = await crypto.subtle.sign('HMAC', await importKey(secret), encoder.encode(payload))
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`
}

export async function verifySession(
  token: string | undefined,
  secret: string,
  now = Date.now()
): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [exp, nonce, sig] = parts
  if (!/^\d{1,12}$/.test(exp) || Number(exp) * 1000 <= now) return false

  const sigBytes = fromBase64Url(sig)
  if (!sigBytes) return false
  // subtle.verify so sánh constant-time — đừng tự ký lại rồi so chuỗi bằng ===.
  return crypto.subtle.verify(
    'HMAC',
    await importKey(secret),
    sigBytes,
    encoder.encode(`${exp}.${nonce}`)
  )
}
