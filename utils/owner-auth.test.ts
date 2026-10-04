import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClientIp, getOwnerConfig, ownerConfigProblem, safeNextPath } from './owner-auth'

afterEach(() => vi.unstubAllEnvs())

const HASH = '$2b$12$6cUN0FGunfzqrq/hVycpSO.EXidPdqQ.de6xpp/4HO6zeqrn4ZNvq'

describe('getOwnerConfig', () => {
  it('tắt khi thiếu một trong hai biến, hoặc secret quá ngắn', () => {
    vi.stubEnv('OWNER_PASSWORD_HASH', HASH)
    vi.stubEnv('SESSION_SECRET', '')
    expect(getOwnerConfig()).toBeNull()
    vi.stubEnv('SESSION_SECRET', 'short')
    expect(getOwnerConfig()).toBeNull()
    expect(ownerConfigProblem()).toContain('SESSION_SECRET ngắn')
    vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
    expect(getOwnerConfig()).not.toBeNull()
    expect(ownerConfigProblem()).toBeNull()
    vi.stubEnv('OWNER_PASSWORD_HASH', '')
    expect(getOwnerConfig()).toBeNull()
  })

  // Đo trên Docker Compose 2.31: env_file viết không nháy HOẶC nháy kép thì
  // `$<chữ cái>...` bị hiểu là biến → hash `$2b$04$TNZ...` tới container thành
  // `$2b$04`, chỉ kèm một warning. Salt bcrypt mở đầu bằng chữ cái ~80% lần.
  it.each([
    ['bị Compose cắt', '$2b$04'],
    ['cụt đuôi', HASH.slice(0, 50)],
    ['thừa ký tự', HASH + 'x'],
    ['thuật toán khác', HASH.replace('$2b$', '$5$')],
  ])('hash %s → tắt và log nguyên nhân', (_, hash) => {
    vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
    vi.stubEnv('OWNER_PASSWORD_HASH', hash)
    expect(getOwnerConfig()).toBeNull()
    expect(ownerConfigProblem()).toContain('nháy đơn')
  })

  it.each(['$2a$', '$2y$'])('nhận biến thể %s', (prefix) => {
    vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
    vi.stubEnv('OWNER_PASSWORD_HASH', HASH.replace('$2b$', prefix))
    expect(getOwnerConfig()).not.toBeNull()
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
    },
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
