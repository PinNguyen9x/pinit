import bcrypt from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loginLimiter } from '@/utils/owner-login'
// Test nằm ngoài pages/: Next biến mọi file trong pages/ thành route.
import handler from '@/pages/api/me/login'

const HASH = bcrypt.hashSync('correct horse', 4)

function call(body: object, headers: Record<string, string> = {}) {
  const out = { status: 0, json: undefined as any, headers: {} as Record<string, string> }
  const req = {
    method: 'POST',
    body,
    headers,
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as NextApiRequest
  const res = {
    setHeader: (k: string, v: string) => (out.headers[k.toLowerCase()] = v),
    status(code: number) {
      out.status = code
      return this
    },
    json(data: unknown) {
      out.json = data
      return this
    },
    end() {
      return this
    },
  } as unknown as NextApiResponse
  return handler(req, res).then(() => out)
}

beforeEach(() => {
  vi.stubEnv('OWNER_PASSWORD_HASH', HASH)
  vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
  loginLimiter.reset('127.0.0.1')
})
afterEach(() => vi.unstubAllEnvs())

describe('POST /api/me/login', () => {
  it('trả về next đã kiểm khi hợp lệ', async () => {
    const out = await call({ passphrase: 'correct horse', next: '/me/learn?x=1' })
    expect(out.status).toBe(200)
    expect(out.json.next).toBe('/me/learn?x=1')
  })

  it.each(['//evil.example', '/\\evil.example', 'https://evil.example', undefined])(
    'next %j → /me',
    async (next) => {
      const out = await call({ passphrase: 'correct horse', next })
      expect(out.json.next).toBe('/me')
    }
  )

  it('dev qua http: cookie không có Secure', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const out = await call({ passphrase: 'correct horse' })
    expect(out.headers['set-cookie']).toMatch(/^pinit_owner=[^;]+; /)
    expect(out.headers['set-cookie']).not.toContain('Secure')
  })

  it('dev qua https (sau proxy): cookie có Secure', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const out = await call({ passphrase: 'correct horse' }, { 'x-forwarded-proto': 'https' })
    expect(out.headers['set-cookie']).toContain('Secure')
  })

  it('production: cookie luôn có Secure', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const out = await call({ passphrase: 'correct horse' })
    expect(out.headers['set-cookie']).toContain('Secure')
  })

  it('sai passphrase: không set cookie, không trả next', async () => {
    const out = await call({ passphrase: 'wrong', next: '/me/learn' })
    expect(out.status).toBe(401)
    expect(out.headers['set-cookie']).toBeUndefined()
    expect(out.json.next).toBeUndefined()
  })
})
