import { describe, expect, it } from 'vitest'
import { describePracticeError } from './practice-errors'

describe('describePracticeError', () => {
  it('401 authentication_error → mã + type + gợi ý kiểm key', () => {
    const msg = describePracticeError(
      { code: 'upstream-error', status: 401, type: 'authentication_error' },
      502,
    )
    expect(msg).toBe(
      'Anthropic API báo lỗi 401 authentication_error — kiểm ANTHROPIC_API_KEY trong .env.private.',
    )
  })

  it('không bao giờ hiện message thô của Anthropic, kể cả nếu lỡ có trong JSON', () => {
    const msg = describePracticeError(
      {
        code: 'upstream-error',
        status: 400,
        type: 'invalid_request_error',
        message: 'RAW <b>text</b>',
      },
      502,
    )
    expect(msg).toContain('400 invalid_request_error')
    expect(msg).not.toContain('RAW')
  })

  it('type lạ (không phải snake_case) bị bỏ, status lạ → gợi ý chung', () => {
    expect(
      describePracticeError({ code: 'upstream-error', status: 500, type: '<script>' }, 502),
    ).toBe('Anthropic API báo lỗi 500 — thử lại sau.')
    expect(describePracticeError({ code: 'upstream-error' }, 502)).toBe(
      'Anthropic API báo lỗi — thử lại sau.',
    )
  })

  it('mã lỗi của app → câu cố định; còn lại → message do server viết; cuối cùng → HTTP status', () => {
    expect(describePracticeError({ code: 'rate-limited' }, 429)).toContain('hết lượt')
    expect(
      describePracticeError({ code: 'practice-log-readonly', message: 'Không ghi được log' }, 503),
    ).toBe('Không ghi được log')
    expect(describePracticeError(null, 500)).toBe('Lỗi 500.')
  })
})
