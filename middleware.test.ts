import { SignJWT, exportJWK, generateKeyPair } from 'jose'
import { NextRequest } from 'next/server'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { middleware } from './middleware'
import { CF_ACCESS_COOKIE, CF_ACCESS_HEADER } from './utils/cf-access'
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

// Lớp Cloudflare Access đứng TRƯỚC lớp passphrase. Hai lớp độc lập: qua được
// Access vẫn phải có cookie phiên, và ngược lại.
describe('middleware /me + Cloudflare Access', () => {
  const TEAM = 'mw.cloudflareaccess.com'
  const AUD = 'c'.repeat(64)
  let sign: (iss?: string) => Promise<string>
  let jwk: Awaited<ReturnType<typeof exportJWK>>

  // Cặp khoá sinh MỘT lần cho cả describe, không phải mỗi test: createRemoteJWKSet
  // được cache theo team domain ở module scope và jose giữ key trong đó, nên khoá
  // mới ở test sau sẽ không khớp JWKS đã cache -> mọi JWT hợp lệ bị 403.
  beforeAll(async () => {
    const pair = await generateKeyPair('RS256')
    jwk = await exportJWK(pair.publicKey)
    jwk.alg = 'RS256'
    jwk.kid = 'mw-kid'
    sign = (iss = `https://${TEAM}`) =>
      new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', kid: 'mw-kid' })
        .setIssuer(iss)
        .setAudience(AUD)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(pair.privateKey)
  })

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ keys: [jwk] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })),
    )
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', TEAM)
    vi.stubEnv('CF_ACCESS_AUD', AUD)
  })
  afterEach(() => vi.unstubAllGlobals())

  function cfReq(path: string, opts: { jwt?: string; cookie?: string } = {}) {
    const headers: Record<string, string> = {}
    if (opts.jwt) headers[CF_ACCESS_HEADER] = opts.jwt
    if (opts.cookie) headers.cookie = `${OWNER_COOKIE}=${opts.cookie}`
    return new NextRequest(new URL(path, 'https://nipit.pro'), { headers })
  }

  it.each(['/me', '/me/login', '/api/me/login', '/api/me/practice'])(
    'không có JWT → 403 cho %s, kể cả path public',
    async (p) => {
      expect((await middleware(cfReq(p))).status).toBe(403)
    },
  )

  it('JWT sai chữ ký/iss → 403', async () => {
    const wrongIss = await sign('https://ke-khac.cloudflareaccess.com')
    expect((await middleware(cfReq('/me', { jwt: wrongIss }))).status).toBe(403)
    expect((await middleware(cfReq('/me', { jwt: 'rac' }))).status).toBe(403)
  })

  it('JWT đọc được từ cookie CF_Authorization, không chỉ header', async () => {
    const jwt = await sign()
    const req = new NextRequest(new URL('/me/login', 'https://nipit.pro'), {
      headers: { cookie: `${CF_ACCESS_COOKIE}=${jwt}` },
    })
    expect((await middleware(req)).headers.get('x-middleware-next')).toBe('1')
  })

  it('JWT hợp lệ nhưng CHƯA đăng nhập → vẫn redirect về login (hai lớp độc lập)', async () => {
    const res = await middleware(cfReq('/me/roadmap', { jwt: await sign() }))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/me/login')
  })

  it('JWT hợp lệ + cookie phiên hợp lệ → cho qua', async () => {
    const res = await middleware(cfReq('/me', { jwt: await sign(), cookie: await signSession(SECRET) }))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('403 cũng mang X-Robots-Tag', async () => {
    expect((await middleware(cfReq('/me'))).headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it('feature /me tắt thì 404 thắng 403 — không tiết lộ là có lớp Access', async () => {
    vi.stubEnv('SESSION_SECRET', '')
    expect((await middleware(cfReq('/me'))).status).toBe(404)
  })
})
