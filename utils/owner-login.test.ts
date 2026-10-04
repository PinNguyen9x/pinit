import bcrypt from 'bcryptjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attemptLogin, loginLimiter } from './owner-login'
import { verifySession } from './owner-session'

const SECRET = 's'.repeat(32)
// cost 4 cho test nhanh; prod dùng hash do owner tự sinh.
const HASH = bcrypt.hashSync('correct horse', 4)

beforeEach(() => {
  vi.stubEnv('OWNER_PASSWORD_HASH', HASH)
  vi.stubEnv('SESSION_SECRET', SECRET)
  loginLimiter.reset('ip')
})
afterEach(() => vi.unstubAllEnvs())

describe('attemptLogin', () => {
  it('đúng passphrase → token hợp lệ', async () => {
    const r = await attemptLogin('correct horse', 'ip')
    expect(r.status).toBe(200)
    if (r.status === 200) expect(await verifySession(r.token, SECRET)).toBe(true)
  })

  it.each(['wrong', '', undefined, 42])('sai/thiếu passphrase (%s) → 401', async (p) => {
    expect((await attemptLogin(p, 'ip')).status).toBe(401)
  })

  it('lần sai thứ 6 bị chặn 429 kể cả khi đúng passphrase', async () => {
    for (let i = 0; i < 5; i++) expect((await attemptLogin('wrong', 'ip')).status).toBe(401)
    const r = await attemptLogin('correct horse', 'ip')
    expect(r.status).toBe(429)
  })

  it('đăng nhập đúng xoá bộ đếm lần sai', async () => {
    for (let i = 0; i < 4; i++) await attemptLogin('wrong', 'ip')
    await attemptLogin('correct horse', 'ip')
    for (let i = 0; i < 4; i++) await attemptLogin('wrong', 'ip')
    expect((await attemptLogin('correct horse', 'ip')).status).toBe(200)
  })

  it('feature tắt → 404 nhưng vẫn chạy bcrypt', async () => {
    vi.stubEnv('SESSION_SECRET', '')
    const spy = vi.spyOn(bcrypt, 'compare')
    expect((await attemptLogin('correct horse', 'ip')).status).toBe(404)
    expect(spy).toHaveBeenCalledOnce()
    spy.mockRestore()
  })
})
