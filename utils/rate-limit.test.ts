import { describe, expect, it } from 'vitest'
import { createRateLimiter } from './rate-limit'

const WINDOW = 15 * 60 * 1000

describe('createRateLimiter', () => {
  it('chặn sau 5 lần sai trong cửa sổ, mở lại khi hết cửa sổ', () => {
    const rl = createRateLimiter({ max: 5, windowMs: WINDOW })
    for (let i = 0; i < 4; i++) rl.recordFailure('192.168.1.4', 0)
    expect(rl.retryAfter('192.168.1.4', 0)).toBe(0)
    rl.recordFailure('192.168.1.4', 0)
    expect(rl.retryAfter('192.168.1.4', 1000)).toBe(WINDOW / 1000 - 1)
    expect(rl.retryAfter('192.168.1.4', WINDOW)).toBe(0)
  })

  it('đếm riêng từng IP', () => {
    const rl = createRateLimiter({ max: 5, windowMs: WINDOW })
    for (let i = 0; i < 5; i++) rl.recordFailure('a', 0)
    expect(rl.retryAfter('a', 0)).toBeGreaterThan(0)
    expect(rl.retryAfter('b', 0)).toBe(0)
  })

  it('lần sai sau khi cửa sổ cũ hết hạn bắt đầu đếm lại từ 1', () => {
    const rl = createRateLimiter({ max: 5, windowMs: WINDOW })
    for (let i = 0; i < 5; i++) rl.recordFailure('a', 0)
    rl.recordFailure('a', WINDOW + 1)
    expect(rl.retryAfter('a', WINDOW + 1)).toBe(0)
  })

  it('reset xoá bộ đếm', () => {
    const rl = createRateLimiter({ max: 5, windowMs: WINDOW })
    for (let i = 0; i < 5; i++) rl.recordFailure('a', 0)
    rl.reset('a')
    expect(rl.retryAfter('a', 0)).toBe(0)
  })
})
