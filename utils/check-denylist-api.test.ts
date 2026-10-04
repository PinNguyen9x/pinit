import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Test nằm ngoài pages/: Next biến mọi file trong pages/ thành route.
import handler from '@/pages/api/me/check-denylist'

const dir = mkdtempSync(join(tmpdir(), 'pinit-api-'))
mkdirSync(join(dir, 'case-studies'))
writeFileSync(join(dir, 'case-studies/a.md'), '---\ntitle: A\n---\nGặp Acme')
afterAll(() => rmSync(dir, { recursive: true, force: true }))

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

beforeEach(() => vi.stubEnv('PRIVATE_CONTENT_DIR', dir))
afterEach(() => {
  vi.unstubAllEnvs()
  rmSync(join(dir, '.denylist'), { force: true })
})

describe('POST /api/me/check-denylist', () => {
  it('chỉ nhận POST', async () => {
    expect((await call({ slug: 'a' }, 'GET')).status).toBe(405)
  })

  it.each([undefined, '', '../a', 'A', 'a/b', 'a.md', 42])('slug %j → 400', async (slug) => {
    expect((await call({ slug })).status).toBe(400)
  })

  it('case study không tồn tại → 404', async () => {
    expect((await call({ slug: 'khong-co' })).status).toBe(404)
  })

  it('chưa có denylist → báo rõ, không phải clean', async () => {
    const r = await call({ slug: 'a' })
    expect(r.status).toBe(200)
    expect(r.json).toEqual({ status: 'missing-denylist' })
  })

  it('có khớp → danh sách dòng + từ khóa', async () => {
    writeFileSync(join(dir, '.denylist'), 'acme\n')
    const r = await call({ slug: 'a' })
    expect(r.json).toEqual({
      status: 'matches',
      matches: [{ file: 'case-studies/a.md', line: 4, keyword: 'acme' }],
    })
  })
})
