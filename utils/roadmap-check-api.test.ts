import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Test nằm ngoài pages/: Next biến mọi file trong pages/ thành route.
import handler from '@/pages/api/me/roadmap/check'

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
  content = mkdtempSync(join(tmpdir(), 'pinit-check-content-'))
  logDir = mkdtempSync(join(tmpdir(), 'pinit-check-log-'))
  dirs.push(content, logDir)
  mkdirSync(join(content, 'learn'))
  writeFileSync(
    join(content, 'roadmap.yaml'),
    `milestones:
  - id: m1
    title: M1
    lane: ai-platform
    target: "2026-12"
    status: doing
    checklist:
      - { id: a, text: Ý A }
      - { id: b, text: Ý B }
`,
  )
  vi.stubEnv('PRIVATE_CONTENT_DIR', content)
  vi.stubEnv('PRACTICE_LOG_PATH', join(logDir, 'practice-log.jsonl'))
})
afterEach(() => vi.unstubAllEnvs())

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

const state = () => JSON.parse(readFileSync(join(logDir, 'roadmap-state.json'), 'utf8'))

describe('POST /api/me/roadmap/check', () => {
  it('tick rồi bỏ tick, lưu vào roadmap-state.json cạnh practice log', async () => {
    let r = await call({ milestoneId: 'm1', checklistId: 'a', done: true })
    expect(r).toEqual({ status: 200, json: { done: true, checked: ['a'] } })
    r = await call({ milestoneId: 'm1', checklistId: 'b', done: true })
    expect(r.json.checked).toEqual(['a', 'b'])
    expect(state()).toEqual({ m1: { a: true, b: true } })

    r = await call({ milestoneId: 'm1', checklistId: 'a', done: false })
    expect(r.json.checked).toEqual(['b'])
    expect(state()).toEqual({ m1: { b: true } })
  })

  it.each([
    [{ milestoneId: 'm1', checklistId: 'a' }],
    [{ milestoneId: 'm1', checklistId: 'a', done: 'true' }],
    [{ milestoneId: 1, checklistId: 'a', done: true }],
    [null],
  ])('input sai %j → 400', async (body) => {
    expect((await call(body)).status).toBe(400)
  })

  it.each([
    ['milestone không có', { milestoneId: 'nope', checklistId: 'a', done: true }],
    ['checklist không có', { milestoneId: 'm1', checklistId: 'zzz', done: true }],
  ])('%s → 404, không tạo key rác trong state', async (_, body) => {
    expect((await call(body)).status).toBe(404)
    expect(() => state()).toThrow() // file chưa từng được tạo
  })

  it('chỉ nhận POST', async () => {
    expect((await call({}, 'GET')).status).toBe(405)
  })

  it.skipIf(isRoot)('thư mục state read-only (staging) → 503 nêu rõ', async () => {
    chmodSync(logDir, 0o555)
    const r = await call({ milestoneId: 'm1', checklistId: 'a', done: true })
    expect(r.status).toBe(503)
    expect(r.json.code).toBe('roadmap-state-readonly')
    expect(r.json.message).toContain('roadmap-state.json')
  })
})
