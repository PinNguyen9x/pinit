import Anthropic from '@anthropic-ai/sdk'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Test nằm ngoài pages/: Next biến mọi file trong pages/ thành route.
import generate from '@/pages/api/me/practice/generate'
import grade from '@/pages/api/me/practice/grade'
import { PRACTICE_LIMIT_KEY, PRACTICE_REQUESTS_PER_HOUR, practiceLimiter } from './practice'

// Client giả: chỉ thay getAnthropic, callJson thật vẫn chạy (stop_reason, ghép text...).
const create = vi.fn()
vi.mock('./practice-client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./practice-client')>()
  return {
    ...mod,
    getAnthropic: () => (process.env.ANTHROPIC_API_KEY ? { messages: { create } } : null),
  }
})

const CANARY = 'CANARY-KHONG-DUOC-GUI-LEN-MODEL'
const isRoot = process.getuid?.() === 0
const dirs: string[] = []
afterAll(() => {
  for (const d of dirs) {
    chmodSync(d, 0o755)
    rmSync(d, { recursive: true, force: true })
  }
})

function contentFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'pinit-practice-api-'))
  dirs.push(dir)
  const files: Record<string, string> = {
    'learn/k8s/index.md': '---\ntitle: K8s\n---\nPod là đơn vị lập lịch nhỏ nhất.',
    'case-studies/secret.md': `---\ntitle: S\nsummary: S\n---\n${CANARY}`,
    'roadmap.yaml': `# ${CANARY}`,
    '.denylist': CANARY,
  }
  for (const [p, t] of Object.entries(files)) {
    mkdirSync(join(dir, p, '..'), { recursive: true })
    writeFileSync(join(dir, p), t)
  }
  return dir
}

function call(handler: typeof generate, body: unknown, method = 'POST') {
  const out = { status: 0, json: undefined as any, headers: {} as Record<string, string> }
  const req = { method, body, headers: {} } as unknown as NextApiRequest
  const res = {
    setHeader(k: string, v: string) {
      out.headers[k.toLowerCase()] = v
      return this
    },
    status(code: number) {
      out.status = code
      return this
    },
    json(data: unknown) {
      out.json = data
      return this
    },
  } as unknown as NextApiResponse
  return handler(req, res).then(() => out)
}

function modelReturns(json: unknown, stop_reason = 'end_turn') {
  create.mockResolvedValueOnce({
    stop_reason,
    content: [{ type: 'text', text: typeof json === 'string' ? json : JSON.stringify(json) }],
  })
}

const FIVE = { questions: [1, 2, 3, 4, 5].map((i) => ({ question: `Câu ${i}?` })) }
const GRADE = {
  score: 6,
  missing: ['Nêu vai trò của scheduler'],
  followUp: 'Pod khác Deployment thế nào?',
}
const GRADE_BODY = { topic: 'k8s', question: 'Pod là gì?', answer: 'Là container.' }

let dir: string
beforeEach(() => {
  dir = contentFixture()
  vi.stubEnv('PRIVATE_CONTENT_DIR', dir)
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
  vi.stubEnv('PRACTICE_MODEL', '')
  practiceLimiter.reset(PRACTICE_LIMIT_KEY)
  create.mockReset()
})
afterEach(() => vi.unstubAllEnvs())

const logLines = () =>
  readFileSync(join(dir, 'practice-log.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l))

describe('POST /api/me/practice/generate', () => {
  it('trả 5 câu, gửi đúng model mặc định + schema, chỉ notes của learn/', async () => {
    modelReturns(FIVE)
    const r = await call(generate, { topic: 'k8s' })
    expect(r.status).toBe(200)
    expect(r.json.questions.map((q: any) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])

    const params = create.mock.calls[0][0]
    expect(params.model).toBe('claude-haiku-4-5')
    expect(params.output_config.format.type).toBe('json_schema')
    const sent = JSON.stringify(params)
    expect(sent).toContain('Pod là đơn vị lập lịch nhỏ nhất.')
    expect(sent).not.toContain(CANARY)
  })

  it('PRACTICE_MODEL đổi được model', async () => {
    vi.stubEnv('PRACTICE_MODEL', 'claude-sonnet-5')
    modelReturns(FIVE)
    await call(generate, { topic: 'k8s' })
    expect(create.mock.calls[0][0].model).toBe('claude-sonnet-5')
  })

  it('chưa có practice-log.jsonl → tạo mới, mỗi câu một dòng chưa chấm', async () => {
    modelReturns(FIVE)
    await call(generate, { topic: 'k8s' })
    const lines = logLines()
    expect(lines).toHaveLength(5)
    expect(lines[0]).toMatchObject({ topic: 'k8s', question: 'Câu 1?', answer: null, score: null })
  })

  it.each([
    ['JSON hỏng', '{"questions": ['],
    ['text thô', 'Đây là 5 câu hỏi...'],
    ['sai số câu', { questions: [{ question: 'a' }] }],
  ])('%s → 502, không trả text thô', async (_, out) => {
    modelReturns(out)
    const r = await call(generate, { topic: 'k8s' })
    expect(r.status).toBe(502)
    expect(r.json).toMatchObject({ code: 'bad-model-output' })
    expect(JSON.stringify(r.json)).not.toContain('Đây là')
  })

  it.each(['refusal', 'max_tokens'])('stop_reason %s → 502', async (stop) => {
    modelReturns(FIVE, stop)
    expect((await call(generate, { topic: 'k8s' })).status).toBe(502)
  })

  it('timeout → 504, lỗi API → 502', async () => {
    create.mockRejectedValueOnce(new Anthropic.APIConnectionTimeoutError())
    expect((await call(generate, { topic: 'k8s' })).status).toBe(504)
    create.mockRejectedValueOnce(
      new Anthropic.APIError(500, { type: 'error' }, 'boom', new Headers()),
    )
    const r = await call(generate, { topic: 'k8s' })
    expect(r.status).toBe(502)
    expect(r.json).toMatchObject({ code: 'upstream-error', status: 500, type: null })
    // Status + type của Anthropic đi về client; message thô thì không.
    create.mockRejectedValueOnce(
      new Anthropic.APIError(
        401,
        { type: 'error', error: { type: 'authentication_error', message: 'API key is invalid.' } },
        'API key is invalid.',
        new Headers(),
        'authentication_error',
      ),
    )
    const auth = await call(generate, { topic: 'k8s' })
    expect(auth.json).toEqual({ code: 'upstream-error', status: 401, type: 'authentication_error' })
    expect(JSON.stringify(auth.json)).not.toContain('invalid.')
  })

  it.each([
    ['topic sai', { topic: '../case-studies' }, 400],
    ['topic không có', { topic: 'khong-co' }, 404],
  ])('%s → %i, không gọi model, không ăn quota', async (_, body, code) => {
    expect((await call(generate, body)).status).toBe(code)
    expect(create).not.toHaveBeenCalled()
    expect(practiceLimiter.retryAfter(PRACTICE_LIMIT_KEY)).toBe(0)
  })

  it('thiếu ANTHROPIC_API_KEY → 503 rõ ràng', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    const r = await call(generate, { topic: 'k8s' })
    expect(r.status).toBe(503)
    expect(r.json.code).toBe('practice-not-configured')
  })

  it('chỉ nhận POST', async () => {
    expect((await call(generate, { topic: 'k8s' }, 'GET')).status).toBe(405)
  })
})

describe('POST /api/me/practice/grade', () => {
  it('trả điểm + missing + followUp, ghi log đầy đủ', async () => {
    modelReturns(GRADE)
    const r = await call(grade, GRADE_BODY)
    expect(r.status).toBe(200)
    expect(r.json).toEqual(GRADE)
    expect(logLines()[0]).toMatchObject({
      topic: 'k8s',
      question: 'Pod là gì?',
      answer: 'Là container.',
      score: 6,
      feedback: { missing: GRADE.missing, followUp: GRADE.followUp },
    })
    const sent = JSON.stringify(create.mock.calls[0][0])
    expect(sent).toContain('<answer>')
    expect(sent).not.toContain(CANARY)
  })

  it.each([
    ['score 11', { ...GRADE, score: 11 }],
    ['JSON hỏng', '{"score": 6, "missing": ['],
  ])('%s → 502, không ghi log', async (_, out) => {
    modelReturns(out)
    expect((await call(grade, GRADE_BODY)).status).toBe(502)
    expect(() => logLines()).toThrow() // file chưa từng được tạo
  })

  it.each([
    ['thiếu answer', { ...GRADE_BODY, answer: '' }],
    ['answer quá dài', { ...GRADE_BODY, answer: 'x'.repeat(5_001) }],
    ['question không phải chuỗi', { ...GRADE_BODY, question: 42 }],
  ])('%s → 400, không ăn quota', async (_, body) => {
    expect((await call(grade, body)).status).toBe(400)
    expect(create).not.toHaveBeenCalled()
    expect(practiceLimiter.retryAfter(PRACTICE_LIMIT_KEY)).toBe(0)
  })
})

describe('rate limit chung 40 request/giờ', () => {
  it('request thứ 41 (generate + grade cộng dồn) → 429, không gọi model', async () => {
    expect(PRACTICE_REQUESTS_PER_HOUR).toBe(40)
    for (let i = 0; i < 20; i++) {
      modelReturns(FIVE)
      expect((await call(generate, { topic: 'k8s' })).status).toBe(200)
      modelReturns(GRADE)
      expect((await call(grade, GRADE_BODY)).status).toBe(200)
    }
    create.mockClear()
    const r = await call(grade, GRADE_BODY)
    expect(r.status).toBe(429)
    expect(Number(r.headers['retry-after'])).toBeGreaterThan(0)
    expect(create).not.toHaveBeenCalled()
  })
})

describe('log read-only', () => {
  it.skipIf(isRoot)('thư mục content read-only → 503 nêu rõ, KHÔNG gọi model', async () => {
    chmodSync(dir, 0o555)
    const r = await call(generate, { topic: 'k8s' })
    expect(r.status).toBe(503)
    expect(r.json.code).toBe('practice-log-readonly')
    expect(r.json.message).toContain('PRACTICE_LOG_PATH')
    expect(r.json.message).toContain(join(dir, 'practice-log.jsonl'))
    expect(create).not.toHaveBeenCalled()
  })

  it('PRACTICE_LOG_PATH trỏ ra thư mục ghi được → chạy bình thường', async () => {
    const logDir = mkdtempSync(join(tmpdir(), 'pinit-practice-log-'))
    dirs.push(logDir)
    vi.stubEnv('PRACTICE_LOG_PATH', join(logDir, 'log.jsonl'))
    if (!isRoot) chmodSync(dir, 0o555)
    modelReturns(GRADE)
    expect((await call(grade, GRADE_BODY)).status).toBe(200)
    expect(readFileSync(join(logDir, 'log.jsonl'), 'utf8')).toContain('"score":6')
  })
})
