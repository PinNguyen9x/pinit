import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cfAccessProblem,
  getCfAccessConfig,
  readAccessToken,
  verifyAccessJwt,
} from './cf-access'

const AUD = 'a'.repeat(64)

// jose v6 trả CryptoKey của Web Crypto, không còn type KeyLike như v4/v5.
let privateKey: CryptoKey
let publicJwk: JWK

beforeEach(async () => {
  const pair = await generateKeyPair('RS256')
  privateKey = pair.privateKey
  publicJwk = await exportJWK(pair.publicKey)
  publicJwk.alg = 'RS256'
  publicJwk.kid = 'test-kid'
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

/**
 * Mỗi test dùng team domain RIÊNG: createRemoteJWKSet được cache theo team domain
 * trong module scope, trùng tên thì test sau nhận key của test trước.
 */
function stubJwks(keys: JWK[] = [publicJwk]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ keys }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })),
  )
}

function sign(opts: { iss: string; aud?: string; expSeconds?: number } ) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid: 'test-kid' })
    .setIssuer(opts.iss)
    .setAudience(opts.aud ?? AUD)
    .setIssuedAt()
    .setExpirationTime(`${opts.expSeconds ?? 3600}s`)
    .sign(privateKey)
}

describe('getCfAccessConfig', () => {
  it('rỗng cả hai biến → null (lớp Access tắt, local/staging không bị khoá)', () => {
    expect(getCfAccessConfig()).toBeNull()
  })

  it('chỉ một biến → null, không bật nửa vời', () => {
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', 'pinit.cloudflareaccess.com')
    expect(getCfAccessConfig()).toBeNull()
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', '')
    vi.stubEnv('CF_ACCESS_AUD', AUD)
    expect(getCfAccessConfig()).toBeNull()
  })

  it('đủ hai biến → bật', () => {
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', 'pinit.cloudflareaccess.com')
    vi.stubEnv('CF_ACCESS_AUD', AUD)
    expect(getCfAccessConfig()).toEqual({ teamDomain: 'pinit.cloudflareaccess.com', aud: AUD })
  })

  it.each([
    ['https://pinit.cloudflareaccess.com', 'dán cả scheme'],
    ['pinit.cloudflareaccess.com/', 'dấu / cuối'],
    ['  https://pinit.cloudflareaccess.com/  ', 'cả hai + khoảng trắng'],
  ])('chuẩn hoá team domain: %s (%s)', (raw) => {
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', raw)
    vi.stubEnv('CF_ACCESS_AUD', AUD)
    expect(getCfAccessConfig()?.teamDomain).toBe('pinit.cloudflareaccess.com')
  })
})

describe('cfAccessProblem', () => {
  it('tắt hẳn → không cảnh báo gì', () => {
    expect(cfAccessProblem()).toBeNull()
  })

  it('bật hẳn → không cảnh báo gì', () => {
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', 'pinit.cloudflareaccess.com')
    vi.stubEnv('CF_ACCESS_AUD', AUD)
    expect(cfAccessProblem()).toBeNull()
  })

  it('thiếu AUD → cảnh báo lớp Access bị bỏ qua', () => {
    vi.stubEnv('CF_ACCESS_TEAM_DOMAIN', 'pinit.cloudflareaccess.com')
    expect(cfAccessProblem()).toMatch(/CF_ACCESS_AUD rỗng/)
  })

  it('thiếu team domain → cảnh báo lớp Access bị bỏ qua', () => {
    vi.stubEnv('CF_ACCESS_AUD', AUD)
    expect(cfAccessProblem()).toMatch(/CF_ACCESS_TEAM_DOMAIN rỗng/)
  })
})

describe('readAccessToken', () => {
  it('ưu tiên header', () => {
    expect(readAccessToken('from-header', 'from-cookie')).toBe('from-header')
  })
  it('không có header thì lấy cookie', () => {
    expect(readAccessToken(null, 'from-cookie')).toBe('from-cookie')
  })
  it('không có gì → undefined', () => {
    expect(readAccessToken(null, undefined)).toBeUndefined()
    expect(readAccessToken('   ', '')).toBeUndefined()
  })
})

describe('verifyAccessJwt', () => {
  it('JWT đúng chữ ký + iss + aud → true', async () => {
    const teamDomain = 'ok.cloudflareaccess.com'
    stubJwks()
    const token = await sign({ iss: `https://${teamDomain}` })
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(true)
  })

  it('aud của app KHÁC → false (JWT cùng team không được qua)', async () => {
    const teamDomain = 'aud.cloudflareaccess.com'
    stubJwks()
    const token = await sign({ iss: `https://${teamDomain}`, aud: 'b'.repeat(64) })
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(false)
  })

  it('iss của team KHÁC → false', async () => {
    const teamDomain = 'iss.cloudflareaccess.com'
    stubJwks()
    const token = await sign({ iss: 'https://ke-khac.cloudflareaccess.com' })
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(false)
  })

  it('JWT hết hạn → false', async () => {
    const teamDomain = 'exp.cloudflareaccess.com'
    stubJwks()
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: 'test-kid' })
      .setIssuer(`https://${teamDomain}`)
      .setAudience(AUD)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(privateKey)
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(false)
  })

  it('chữ ký của key lạ → false', async () => {
    const teamDomain = 'sig.cloudflareaccess.com'
    // JWKS trả key của một cặp khoá khác -> chữ ký không khớp.
    const other = await generateKeyPair('RS256')
    const otherJwk = await exportJWK(other.publicKey)
    otherJwk.alg = 'RS256'
    otherJwk.kid = 'test-kid'
    stubJwks([otherJwk])
    const token = await sign({ iss: `https://${teamDomain}` })
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(false)
  })

  it('token rác → false, không ném', async () => {
    const teamDomain = 'junk.cloudflareaccess.com'
    stubJwks()
    expect(await verifyAccessJwt('not-a-jwt', { teamDomain, aud: AUD })).toBe(false)
  })

  it('JWKS không lấy được → false (fail closed, không mở cửa)', async () => {
    const teamDomain = 'down.cloudflareaccess.com'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })))
    const token = await sign({ iss: `https://${teamDomain}` })
    expect(await verifyAccessJwt(token, { teamDomain, aud: AUD })).toBe(false)
  })
})
