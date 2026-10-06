import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Test nằm ngoài pages/: Next biến mọi file trong pages/ thành route.
import handler from '@/pages/api/me/flashcard/rate'
import { topicCards } from './flashcards'

const isRoot = process.getuid?.() === 0
const dirs: string[] = []
afterAll(() =>
  dirs.forEach((d) => {
    chmodSync(d, 0o755)
    rmSync(d, { recursive: true, force: true })
  }),
)

let content: string
let logDir: string
beforeEach(() => {
  content = mkdtempSync(join(tmpdir(), 'pinit-fc-content-'))
  logDir = mkdtempSync(join(tmpdir(), 'pinit-fc-log-'))
  dirs.push(content, logDir)
  mkdirSync(join(content, 'learn/k8s'), { recursive: true })
  writeFileSync(
    join(content, 'learn/k8s/index.md'),
    '---\ntitle: K8s\nquestions:\n  - { q: "Q0", a: "A0" }\n  - { q: "Q1", a: "A1" }\n---\n',
  )
  writeFileSync(
    join(content, 'learn/k8s/net.md'),
    '---\ntitle: Net\nquestions:\n  - { q: "Q2", a: "A2" }\n---\n',
  )
  vi.stubEnv('PRIVATE_CONTENT_DIR', content)
  vi.stubEnv('PRACTICE_LOG_PATH', join(logDir, 'practice-log.jsonl'))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

function call(body: unknown, method = 'POST') {
  const out = { status: 0, json: undefined as any }
  const req = { method, body, headers: {} } as unknown as NextApiRequest
  const res = {
    setHeader: () => res,
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

const readJson = (f: string) => JSON.parse(readFileSync(join(logDir, f), 'utf8'))
const readLog = () =>
  readFileSync(join(logDir, 'flashcard-log.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l))

describe('topicCards', () => {
  it('index.md trước rồi tới note; key <topic>/<index>', async () => {
    const cards = await topicCards('k8s')
    expect(cards!.map((c) => [c.key, c.q, c.source])).toEqual([
      ['k8s/0', 'Q0', 'K8s'],
      ['k8s/1', 'Q1', 'K8s'],
      ['k8s/2', 'Q2', 'Net'],
    ])
  })
})

describe('topicCards — key theo id', () => {
  it('có id → <topic>/<id>; không id → <topic>/<index>; id trùng giữa note → câu sau về index', async () => {
    writeFileSync(
      join(content, 'learn/k8s/index.md'),
      '---\ntitle: K8s\nquestions:\n  - { id: pod, q: "Q0", a: "A0" }\n  - { q: "Q1", a: "A1" }\n---\n',
    )
    writeFileSync(
      join(content, 'learn/k8s/net.md'),
      '---\ntitle: Net\nquestions:\n  - { id: pod, q: "Q2", a: "A2" }\n---\n',
    )
    expect((await topicCards('k8s'))!.map((c) => c.key)).toEqual(['k8s/pod', 'k8s/1', 'k8s/2'])
    const { loadTopic } = await import('./private-content')
    expect((await loadTopic('k8s'))!.errors).toEqual([
      'learn/k8s/net.md: id câu hỏi "pod" đã dùng ở index.md',
    ])
  })

  it('chèn câu mới vào giữa không làm đổi key của câu có id', async () => {
    writeFileSync(
      join(content, 'learn/k8s/net.md'),
      '---\ntitle: Net\nquestions:\n  - { id: svc, q: "Q2", a: "A2" }\n---\n',
    )
    const before = (await topicCards('k8s'))!.find((c) => c.q === 'Q2')!.key
    writeFileSync(
      join(content, 'learn/k8s/index.md'),
      '---\ntitle: K8s\nquestions:\n  - { q: "Q0", a: "A0" }\n  - { q: "MỚI", a: "x" }\n  - { q: "Q1", a: "A1" }\n---\n',
    )
    expect((await topicCards('k8s'))!.find((c) => c.q === 'Q2')!.key).toBe(before)
    expect(before).toBe('k8s/svc')
  })

  it('rate ghi state theo key id', async () => {
    writeFileSync(
      join(content, 'learn/k8s/net.md'),
      '---\ntitle: Net\nquestions:\n  - { id: svc, q: "Q2", a: "A2" }\n---\n',
    )
    expect((await call({ topic: 'k8s', index: 2, rating: 'fuzzy' })).status).toBe(200)
    expect(Object.keys(readJson('flashcard-state.json'))).toEqual(['k8s/svc'])
  })
})

describe('POST /api/me/flashcard/rate', () => {
  it('ghi lịch vào flashcard-state.json và một dòng vào flashcard-log.jsonl', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-06T03:00:00Z')) // 10:00 giờ VN
    let r = await call({ topic: 'k8s', index: 2, rating: 'remember' })
    expect(r).toEqual({ status: 200, json: { last: '2026-10-06', interval: 7, due: '2026-10-13' } })
    r = await call({ topic: 'k8s', index: 2, rating: 'remember' })
    expect(r.json.interval).toBe(14)
    await call({ topic: 'k8s', index: 0, rating: 'forgot' })

    expect(readJson('flashcard-state.json')).toEqual({
      'k8s/2': { last: '2026-10-06', interval: 14, due: '2026-10-20' },
      'k8s/0': { last: '2026-10-06', interval: 1, due: '2026-10-07' },
    })
    expect(readLog().map((e) => [e.card, e.rating])).toEqual([
      ['k8s/2', 'remember'],
      ['k8s/2', 'remember'],
      ['k8s/0', 'forgot'],
    ])
  })

  it.each([
    [{ topic: 'k8s', index: 0 }],
    [{ topic: 'k8s', index: 0, rating: 'easy' }],
    [{ topic: 'k8s', index: '0', rating: 'remember' }],
    [{ topic: '../k8s', index: 0, rating: 'remember' }],
    [null],
  ])('input sai %j → 400', async (body) => {
    expect((await call(body)).status).toBe(400)
  })

  it.each([
    ['topic không có', { topic: 'khong-co', index: 0, rating: 'remember' }],
    ['index vượt số thẻ', { topic: 'k8s', index: 3, rating: 'remember' }],
  ])('%s → 404, không tạo file', async (_, body) => {
    expect((await call(body)).status).toBe(404)
    expect(() => readJson('flashcard-state.json')).toThrow()
  })

  it('chỉ nhận POST', async () => {
    expect((await call({}, 'GET')).status).toBe(405)
  })

  it.skipIf(isRoot)('thư mục read-only (staging) → 503 nêu rõ', async () => {
    chmodSync(logDir, 0o555)
    const r = await call({ topic: 'k8s', index: 0, rating: 'remember' })
    expect(r.status).toBe(503)
    expect(r.json.code).toBe('flashcard-state-readonly')
  })
})
