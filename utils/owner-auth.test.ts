import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClientIp, getOwnerConfig, safeNextPath } from './owner-auth'

afterEach(() => vi.unstubAllEnvs())

describe('getOwnerConfig', () => {
  it('tắt khi thiếu một trong hai biến, hoặc secret quá ngắn', () => {
    vi.stubEnv('OWNER_PASSWORD_HASH', '$2b$...')
    vi.stubEnv('SESSION_SECRET', '')
    expect(getOwnerConfig()).toBeNull()
    vi.stubEnv('SESSION_SECRET', 'short')
    expect(getOwnerConfig()).toBeNull()
    vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
    expect(getOwnerConfig()).not.toBeNull()
    vi.stubEnv('OWNER_PASSWORD_HASH', '')
    expect(getOwnerConfig()).toBeNull()
  })
})

describe('getClientIp', () => {
  it('bỏ qua X-Forwarded-For khi không bật TRUST_PROXY', () => {
    expect(getClientIp('192.168.6.6', '10.0.0.1', false)).toBe('10.0.0.1')
  })

  it('lấy phần tử cuối — phần nginx nối vào, không phải phần client tự khai', () => {
    expect(getClientIp('192.168.6.6, 10.9.9.9', '172.18.0.1', true)).toBe('10.9.9.9')
    expect(getClientIp(['10.1.1.1', '10.2.2.2'], '172.18.0.1', true)).toBe('10.2.2.2')
  })

  it('rơi về địa chỉ socket khi không có header', () => {
    expect(getClientIp(undefined, '172.18.0.1', true)).toBe('172.18.0.1')
  })
})

describe('safeNextPath', () => {
  it.each(['/', '/me', '/me/roadmap', '/me/learn/k8s?x=1', '/blog/post#h', '/me/login'])(
    'giữ path nội bộ %s',
    (p) => {
      expect(safeNextPath(p)).toBe(p)
    }
  )

  it.each([
    undefined,
    null,
    42,
    ['/me'],
    '',
    'me',
    'https://evil.example',
    'javascript:alert(1)',
    '//evil.example',
    '///evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
  ])('đổi %j thành /me', (p) => {
    expect(safeNextPath(p)).toBe('/me')
  })
})
