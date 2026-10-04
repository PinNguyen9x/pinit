import { describe, expect, it } from 'vitest'
import { SESSION_TTL_SECONDS, signSession, verifySession } from './owner-session'

const SECRET = 'x'.repeat(32)
const NOW = Date.UTC(2026, 9, 4)

describe('owner session cookie', () => {
  it('chấp nhận cookie vừa ký', async () => {
    const token = await signSession(SECRET, NOW)
    expect(token.split('.')).toHaveLength(3)
    expect(await verifySession(token, SECRET, NOW)).toBe(true)
  })

  it('mỗi lần ký ra nonce khác nhau', async () => {
    expect(await signSession(SECRET, NOW)).not.toBe(await signSession(SECRET, NOW))
  })

  it('còn hạn tới sát 7 ngày, hết hạn đúng mốc', async () => {
    const token = await signSession(SECRET, NOW)
    const ttl = SESSION_TTL_SECONDS * 1000
    expect(await verifySession(token, SECRET, NOW + ttl - 1000)).toBe(true)
    expect(await verifySession(token, SECRET, NOW + ttl)).toBe(false)
  })

  it('từ chối cookie ký bằng secret khác', async () => {
    const token = await signSession('y'.repeat(32), NOW)
    expect(await verifySession(token, SECRET, NOW)).toBe(false)
  })

  it('từ chối khi sửa exp để kéo dài phiên', async () => {
    const [exp, nonce, sig] = (await signSession(SECRET, NOW)).split('.')
    const forged = `${Number(exp) + 86400}.${nonce}.${sig}`
    expect(await verifySession(forged, SECRET, NOW)).toBe(false)
  })

  it('từ chối khi sửa nonce hoặc chữ ký', async () => {
    const [exp, nonce, sig] = (await signSession(SECRET, NOW)).split('.')
    const flip = (s: string) => (s[0] === 'A' ? 'B' : 'A') + s.slice(1)
    expect(await verifySession(`${exp}.${flip(nonce)}.${sig}`, SECRET, NOW)).toBe(false)
    expect(await verifySession(`${exp}.${nonce}.${flip(sig)}`, SECRET, NOW)).toBe(false)
  })

  it.each([undefined, '', 'abc', 'a.b', 'a.b.c.d', 'NaN.x.y', '1e99.x.y', '99999999999.x.!!'])(
    'từ chối cookie dị dạng %s',
    async (token) => {
      expect(await verifySession(token, SECRET, NOW)).toBe(false)
    }
  )
})
