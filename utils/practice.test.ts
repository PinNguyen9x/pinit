import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendLog,
  buildNotesContext,
  checkLogWritable,
  NOTES_CHAR_LIMIT,
  parseGenerated,
  parseGrade,
  practiceLogPath,
  readPracticeStats,
} from './practice'

const CANARY = 'CANARY-KHONG-DUOC-GUI-LEN-MODEL'
const dirs: string[] = []
afterAll(() => {
  for (const d of dirs) {
    chmodSync(d, 0o755)
    rmSync(d, { recursive: true, force: true })
  }
})
afterEach(() => vi.unstubAllEnvs())

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'pinit-practice-'))
  dirs.push(dir)
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

const note = (title: string, updated: string | null, body: string) =>
  `---\ntitle: ${title}\n${updated ? `updated: ${updated}\n` : ''}---\n${body}`

// root bỏ qua quyền file → không giả lập được read-only bằng chmod.
const isRoot = process.getuid?.() === 0

describe('buildNotesContext', () => {
  const dir = fixture({
    'learn/k8s/index.md': note('K8s', null, 'Tổng quan topic.'),
    'learn/k8s/old.md': note('Cũ', '2026-01-01', 'Note cũ.'),
    'learn/k8s/new.md': note('Mới', '2026-09-01', 'Note mới.'),
    'learn/k8s/nodate.md': note('Không ngày', null, 'Note không ngày.'),
    'learn/other/index.md': note('Other', null, `topic khác ${CANARY}`),
    'case-studies/secret.md': `---\ntitle: S\nsummary: S\n---\n${CANARY}`,
    'roadmap.yaml': `milestones: [] # ${CANARY}`,
    '.denylist': CANARY,
  })

  it('chỉ lấy learn/<topic>/ — case-studies, roadmap, .denylist, topic khác không lọt', async () => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', dir)
    const ctx = await buildNotesContext('k8s')
    expect(ctx!.text).not.toContain(CANARY)
    expect(ctx!.included.every((p) => p.startsWith('learn/k8s/'))).toBe(true)
  })

  it('index.md trước, rồi note theo updated mới nhất, không ngày xếp cuối', async () => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', dir)
    const ctx = await buildNotesContext('k8s')
    expect(ctx!.included).toEqual([
      'learn/k8s/index.md',
      'learn/k8s/new.md',
      'learn/k8s/old.md',
      'learn/k8s/nodate.md',
    ])
    expect(ctx!.truncated).toBe(false)
  })

  it('vượt 12k ký tự → dừng ở note làm tràn, báo omitted + truncated', async () => {
    const big = 'x'.repeat(7_000)
    vi.stubEnv(
      'PRIVATE_CONTENT_DIR',
      fixture({
        'learn/t/index.md': note('T', null, 'mở đầu'),
        'learn/t/a.md': note('A', '2026-09-02', big),
        'learn/t/b.md': note('B', '2026-09-01', big),
        'learn/t/c.md': note('C', '2026-08-01', 'nhỏ'),
      }),
    )
    const ctx = await buildNotesContext('t')
    expect(ctx!.text.length).toBeLessThanOrEqual(NOTES_CHAR_LIMIT)
    expect(ctx!.included).toEqual(['learn/t/index.md', 'learn/t/a.md'])
    // Dừng ở note đầu tiên làm tràn — c nhỏ nhưng cũng không chen vào sau b.
    expect(ctx!.omitted).toEqual(['learn/t/b.md', 'learn/t/c.md'])
    expect(ctx!.truncated).toBe(true)
  })

  it('index.md một mình dài quá giới hạn → cắt cứng', async () => {
    vi.stubEnv(
      'PRIVATE_CONTENT_DIR',
      fixture({ 'learn/t/index.md': note('T', null, 'y'.repeat(20_000)) }),
    )
    const ctx = await buildNotesContext('t')
    expect(ctx!.text.length).toBe(NOTES_CHAR_LIMIT)
    expect(ctx!.truncated).toBe(true)
  })

  it.each(['../case-studies', 'khong-co', 'K8s'])('topic %s → null', async (t) => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', dir)
    expect(await buildNotesContext(t)).toBeNull()
  })
})

describe('parseGenerated', () => {
  const five = (q = 'Câu?') => JSON.stringify({ questions: Array(5).fill({ question: q }) })

  it('đúng 5 câu → gán id q1..q5', () => {
    expect(parseGenerated(five())?.map((q) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])
  })

  it.each([
    ['không phải JSON', 'Đây là 5 câu hỏi: ...'],
    ['JSON cụt', '{"questions": [{"question": "a"'],
    ['4 câu', JSON.stringify({ questions: Array(4).fill({ question: 'a' }) })],
    ['câu rỗng', five('   ')],
    ['câu quá dài', five('x'.repeat(1_001))],
    ['sai kiểu', JSON.stringify({ questions: 'abc' })],
  ])('%s → null', (_, text) => {
    expect(parseGenerated(text)).toBeNull()
  })
})

describe('parseGrade', () => {
  const g = (o: object) => JSON.stringify({ score: 7, missing: ['a'], followUp: 'Tại sao?', ...o })

  it('hợp lệ', () => {
    expect(parseGrade(g({ missing: [' a ', ''] }))).toEqual({
      score: 7,
      missing: ['a'],
      followUp: 'Tại sao?',
    })
  })

  it.each([
    ['score > 10', g({ score: 11 })],
    ['score âm', g({ score: -1 })],
    ['score lẻ', g({ score: 7.5 })],
    ['score chuỗi', g({ score: '7' })],
    ['missing không phải mảng', g({ missing: 'a' })],
    ['followUp rỗng', g({ followUp: ' ' })],
    ['không phải JSON', 'Điểm: 7/10'],
  ])('%s → null', (_, text) => {
    expect(parseGrade(text)).toBeNull()
  })
})

describe('practice-log.jsonl', () => {
  it('mặc định nằm trong PRIVATE_CONTENT_DIR, đè được bằng PRACTICE_LOG_PATH', () => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', '/c')
    expect(practiceLogPath()).toBe('/c/practice-log.jsonl')
    vi.stubEnv('PRACTICE_LOG_PATH', '/data/log.jsonl')
    expect(practiceLogPath()).toBe('/data/log.jsonl')
  })

  it('chưa có file → ghi được, appendLog tạo mới', async () => {
    const path = join(fixture({}), 'practice-log.jsonl')
    expect(await checkLogWritable(path)).toEqual({ ok: true })
    await appendLog(
      [{ ts: 't', topic: 'k8s', question: 'q', answer: null, score: null, feedback: null }],
      path,
    )
    expect(readFileSync(path, 'utf8')).toBe(
      '{"ts":"t","topic":"k8s","question":"q","answer":null,"score":null,"feedback":null}\n',
    )
  })

  it.skipIf(isRoot)('thư mục read-only, file chưa có → không ghi được, có mã lỗi', async () => {
    const dir = fixture({})
    chmodSync(dir, 0o555)
    const r = await checkLogWritable(join(dir, 'practice-log.jsonl'))
    expect(r).toMatchObject({ ok: false, code: 'EACCES' })
  })

  it.skipIf(isRoot)('file read-only → không ghi được', async () => {
    const dir = fixture({ 'practice-log.jsonl': '' })
    chmodSync(join(dir, 'practice-log.jsonl'), 0o444)
    const r = await checkLogWritable(join(dir, 'practice-log.jsonl'))
    expect(r).toMatchObject({ ok: false, code: 'EACCES' })
  })

  it('thư mục không tồn tại → không ghi được', async () => {
    const r = await checkLogWritable(join(tmpdir(), 'pinit-khong-co-' + Date.now(), 'log.jsonl'))
    expect(r).toMatchObject({ ok: false, code: 'ENOENT' })
  })
})

describe('readPracticeStats', () => {
  it('chưa có file → rỗng', async () => {
    expect(await readPracticeStats(join(fixture({}), 'x.jsonl'))).toEqual({
      recent: [],
      byTopic: [],
      corruptLines: 0,
    })
  })

  it('chỉ tính dòng đã chấm, mới nhất trước, tối đa 20, bỏ dòng hỏng', async () => {
    const lines = [
      ...Array.from({ length: 22 }, (_, i) =>
        JSON.stringify({
          ts: `2026-10-04T00:${String(i).padStart(2, '0')}:00Z`,
          topic: i % 2 ? 'a' : 'b',
          question: `q${i}`,
          answer: 'x',
          score: i % 2 ? 8 : 5,
          feedback: null,
        }),
      ),
      JSON.stringify({ ts: 'z', topic: 'a', question: 'chưa chấm', answer: null, score: null }),
      '{dòng hỏng',
      '',
    ]
    const path = join(fixture({}), 'log.jsonl')
    writeFileSync(path, lines.join('\n'))
    const s = await readPracticeStats(path)
    expect(s.recent).toHaveLength(20)
    expect(s.recent[0].question).toBe('q21')
    expect(s.recent.every((e) => e.score !== null)).toBe(true)
    expect(s.byTopic).toEqual([
      { topic: 'a', count: 11, average: 8 },
      { topic: 'b', count: 11, average: 5 },
    ])
    expect(s.corruptLines).toBe(1)
  })
})
