import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkStateWritable,
  readRoadmapState,
  roadmapStatePath,
  setChecklistItem,
} from './roadmap-state'

const dirs: string[] = []
afterAll(() =>
  dirs.forEach((d) => {
    chmodSync(d, 0o755)
    rmSync(d, { recursive: true, force: true })
  }),
)
afterEach(() => vi.unstubAllEnvs())
const isRoot = process.getuid?.() === 0

function tmp() {
  const d = mkdtempSync(join(tmpdir(), 'pinit-state-'))
  dirs.push(d)
  return d
}

describe('roadmapStatePath', () => {
  it('nằm cạnh practice log — thư mục rw duy nhất, content là :ro', () => {
    vi.stubEnv('PRACTICE_LOG_PATH', '/app/practice-data/practice-log.jsonl')
    expect(roadmapStatePath()).toBe('/app/practice-data/roadmap-state.json')
  })
})

describe('readRoadmapState', () => {
  it('chưa có file → rỗng, không lỗi', async () => {
    expect(await readRoadmapState(join(tmp(), 's.json'))).toEqual({ state: {}, error: null })
  })

  it('JSON hỏng → rỗng + báo lỗi, không ném', async () => {
    const p = join(tmp(), 's.json')
    writeFileSync(p, '{hỏng')
    const r = await readRoadmapState(p)
    expect(r.state).toEqual({})
    expect(r.error).toContain('không phải JSON hợp lệ')
  })

  it('chỉ giữ giá trị true; bỏ cấu trúc lạ (file sửa tay)', async () => {
    const p = join(tmp(), 's.json')
    writeFileSync(p, JSON.stringify({ a: { x: true, y: false, z: 'yes' }, b: [1], c: 'x', d: {} }))
    expect((await readRoadmapState(p)).state).toEqual({ a: { x: true } })
  })
})

describe('setChecklistItem', () => {
  it('tick / bỏ tick; bỏ hết thì xoá luôn milestone khỏi file', async () => {
    const p = join(tmp(), 's.json')
    expect(await setChecklistItem('m', 'a', true, p)).toEqual({ m: { a: true } })
    expect(await setChecklistItem('m', 'b', true, p)).toEqual({ m: { a: true, b: true } })
    expect(await setChecklistItem('m', 'a', false, p)).toEqual({ m: { b: true } })
    expect(await setChecklistItem('m', 'b', false, p)).toEqual({})
    expect(JSON.parse(readFileSync(p, 'utf8'))).toEqual({})
  })

  it('nhiều tick bắn cùng lúc không ghi đè mất nhau (hàng đợi ghi)', async () => {
    const p = join(tmp(), 's.json')
    await Promise.all(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => setChecklistItem('m', id, true, p)),
    )
    expect(Object.keys((await readRoadmapState(p)).state.m).sort()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
  })

  it('ghi xong không để lại file tạm', async () => {
    const d = tmp()
    await setChecklistItem('m', 'a', true, join(d, 's.json'))
    expect(require('fs').readdirSync(d)).toEqual(['s.json'])
  })
})

describe('checkStateWritable', () => {
  it('thư mục ghi được → null', async () => {
    expect(await checkStateWritable(join(tmp(), 's.json'))).toBeNull()
  })

  it.skipIf(isRoot)('thư mục read-only (staging mount :ro) → mã lỗi', async () => {
    const d = tmp()
    chmodSync(d, 0o555)
    expect(await checkStateWritable(join(d, 's.json'))).toBe('EACCES')
  })
})
