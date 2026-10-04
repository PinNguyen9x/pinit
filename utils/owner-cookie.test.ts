import { describe, expect, it } from 'vitest'
import { ownerCookieHeader, shouldUseSecureCookie } from './owner-cookie'

describe('shouldUseSecureCookie', () => {
  it('bật ở production', () => {
    expect(shouldUseSecureCookie('production', undefined)).toBe(true)
  })

  it('tắt ở dev/test qua http — login local được', () => {
    expect(shouldUseSecureCookie('development', undefined)).toBe(false)
    expect(shouldUseSecureCookie('test', 'http')).toBe(false)
  })

  it('bật khi request là https, kể cả ngoài production', () => {
    expect(shouldUseSecureCookie('development', 'https')).toBe(true)
    expect(shouldUseSecureCookie('development', 'https, http')).toBe(true)
    expect(shouldUseSecureCookie('development', ['https'])).toBe(true)
    expect(shouldUseSecureCookie('development', undefined, true)).toBe(true)
  })
})

describe('ownerCookieHeader', () => {
  it('cookie đăng nhập: httpOnly, Lax, 7 ngày', () => {
    const h = ownerCookieHeader('tok', true)
    expect(h).toBe('pinit_owner=tok; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure')
  })

  it('không gắn Secure khi secure=false', () => {
    expect(ownerCookieHeader('tok', false)).not.toContain('Secure')
  })

  it('logout xoá cookie bằng Max-Age=0', () => {
    expect(ownerCookieHeader(null, false)).toBe(
      'pinit_owner=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    )
  })
})
