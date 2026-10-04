import { afterEach, describe, expect, it, vi } from 'vitest'
import { anthropicKeyProblem } from './practice-client'

afterEach(() => vi.unstubAllEnvs())

const REAL_LOOKING = 'sk-ant-api03-' + 'x'.repeat(90)

describe('anthropicKeyProblem', () => {
  it('chưa đặt key → không phải lỗi (practice tắt có chủ đích)', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    expect(anthropicKeyProblem()).toBeNull()
  })

  it('key có dạng thật → null', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', REAL_LOOKING)
    expect(anthropicKeyProblem()).toBeNull()
  })

  // Ca thật trên prod 2026-10-04: dán nguyên chuỗi giữ chỗ từ hướng dẫn.
  it.each([
    ['chuỗi giữ chỗ', 'sk-ant-...'],
    ['sai prefix', 'sk-' + 'x'.repeat(100)],
    ['dính nháy', `'${REAL_LOOKING}'`],
    ['cụt', REAL_LOOKING.slice(0, 30)],
  ])('%s → mô tả vấn đề, không lộ giá trị key', (_, key) => {
    vi.stubEnv('ANTHROPIC_API_KEY', key)
    const problem = anthropicKeyProblem()
    expect(problem).toContain(`dài ${key.length} ký tự`)
    expect(problem).not.toContain(key)
  })
})
