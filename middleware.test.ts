import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { middleware } from './middleware'
import { OWNER_COOKIE, signSession } from './utils/owner-session'

const SECRET = 's'.repeat(32)

function req(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'https://nipit.pro'), {
    headers: cookie ? { cookie: `${OWNER_COOKIE}=${cookie}` } : {},
  })
}

beforeEach(() => {
  vi.stubEnv('OWNER_PASSWORD_HASH', '$2b$12$6cUN0FGunfzqrq/hVycpSO.EXidPdqQ.de6xpp/4HO6zeqrn4ZNvq')
  vi.stubEnv('SESSION_SECRET', SECRET)
})
afterEach(() => vi.unstubAllEnvs())

describe('middleware /me', () => {
  it('feature tắt → 404 cho mọi route, kể cả login', async () => {
    vi.stubEnv('SESSION_SECRET', '')
    for (const p of ['/me', '/me/login', '/api/me/login']) {
      expect((await middleware(req(p))).status).toBe(404)
    }
  })

  it.each(['/me/login', '/api/me/login', '/api/me/logout'])(
    'cho qua %s khi chưa đăng nhập',
    async (p) => {
      const res = await middleware(req(p))
      expect(res.headers.get('x-middleware-next')).toBe('1')
    },
  )

  it('chưa đăng nhập → redirect về login kèm next', async () => {
    const res = await middleware(req('/me/learn/k8s?tab=q'))
    expect(res.status).toBe(307)
    const loc = new URL(res.headers.get('location')!)
    expect(loc.pathname).toBe('/me/login')
    expect(loc.searchParams.get('next')).toBe('/me/learn/k8s?tab=q')
  })

  it('API chưa đăng nhập → 401 thay vì redirect', async () => {
    expect((await middleware(req('/api/me/practice'))).status).toBe(401)
    expect((await middleware(req('/api/me/check-denylist'))).status).toBe(401)
  })

  it('cookie hợp lệ → cho qua', async () => {
    const res = await middleware(req('/me', await signSession(SECRET)))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('cookie hết hạn hoặc bị sửa → redirect', async () => {
    const expired = await signSession(SECRET, Date.now() - 8 * 24 * 3600 * 1000)
    expect((await middleware(req('/me', expired))).status).toBe(307)
    const forged = (await signSession(SECRET)).replace(/^\d+/, '9999999999')
    expect((await middleware(req('/me', forged))).status).toBe(307)
  })

  it('mọi phản hồi đều mang X-Robots-Tag', async () => {
    for (const r of [req('/me'), req('/me/login'), req('/api/me/x')]) {
      expect((await middleware(r)).headers.get('x-robots-tag')).toBe('noindex, nofollow')
    }
  })
})
