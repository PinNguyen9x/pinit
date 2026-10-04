import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  contentDir,
  isSlug,
  laneProgress,
  listCaseStudies,
  listTopics,
  loadCaseStudy,
  loadNote,
  loadRoadmap,
  loadTopic,
  parseCaseStudy,
  parseNote,
  parseRoadmap,
} from './private-content'

// Bộ mẫu trong repo là fixture chính: test xanh nghĩa là private-content.example/
// khớp schema — tài liệu không lệch khỏi code.
const EXAMPLE = resolve(__dirname, '../private-content.example')

afterEach(() => vi.unstubAllEnvs())

describe('contentDir', () => {
  it('mặc định ./private-content, đè được bằng env', () => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', '')
    expect(contentDir()).toBe(resolve('private-content'))
    vi.stubEnv('PRIVATE_CONTENT_DIR', EXAMPLE)
    expect(contentDir()).toBe(EXAMPLE)
  })
})

describe('isSlug — hàng rào path traversal', () => {
  it.each(['kubernetes', 'k8s-basics', 'note_1'])('nhận %s', (s) => expect(isSlug(s)).toBe(true))
  it.each(['', '..', '../etc', 'a/b', 'a\\b', '.hidden', 'Upper', 'có-dấu', undefined, ['a']])(
    'từ chối %j',
    (s) => expect(isSlug(s)).toBe(false),
  )
})

describe('private-content.example', () => {
  beforeEach(() => vi.stubEnv('PRIVATE_CONTENT_DIR', EXAMPLE))

  it('roadmap hợp lệ, sắp theo target', async () => {
    const r = await loadRoadmap()
    expect(r?.errors).toEqual([])
    expect(r?.data.map((m) => m.target)).toEqual([...r!.data.map((m) => m.target)].sort())
    expect(r?.data.find((m) => m.id === 'llm-gateway')).toMatchObject({
      lane: 'ai-platform',
      status: 'doing',
      links: ['https://example.com/llm-gateway-notes'],
    })
  })

  it('learn: topic, note và câu hỏi', async () => {
    const topics = await listTopics()
    expect(topics.errors).toEqual([])
    expect(topics.data).toEqual([
      expect.objectContaining({ slug: 'kubernetes', title: 'Kubernetes', noteCount: 1 }),
    ])

    const topic = await loadTopic('kubernetes')
    expect(topic?.errors).toEqual([])
    expect(topic?.data.index.body).toContain('```mermaid')
    expect(topic?.data.notes.map((n) => n.slug)).toEqual(['scheduling'])

    const note = await loadNote('kubernetes', 'scheduling')
    expect(note?.data.questions).toHaveLength(2)
    // YAML không nháy `2026-09-21` là Date — phải về chuỗi để qua được getServerSideProps.
    expect(note?.data.updated).toBe('2026-09-21')
    expect(() => JSON.stringify(note)).not.toThrow()
  })

  it('case study hợp lệ', async () => {
    const list = await listCaseStudies()
    expect(list.errors).toEqual([])
    expect(list.data[0]).toMatchObject({ slug: 'example-migration', visibility: 'private' })
    expect((await loadCaseStudy('example-migration'))?.data?.body).toContain('## Bối cảnh')
  })

  it.each([
    ['../kubernetes', 'scheduling'],
    ['kubernetes', '../../roadmap'],
    ['kubernetes', 'index'],
    ['kubernetes', 'khong-ton-tai'],
    // Cùng regex slug với case study: hoa, dấu chấm, đuôi .md đều bị từ chối.
    ['Kubernetes', 'scheduling'],
    ['kubernetes', 'Scheduling'],
    ['kubernetes', 'scheduling.md'],
    ['k8s.io', 'scheduling'],
    ['khong-ton-tai', 'x'],
  ])('loadNote(%s, %s) → null', async (t, n) => {
    expect(await loadNote(t, n)).toBeNull()
  })

  it('loadTopic/loadCaseStudy với slug lạ → null', async () => {
    expect(await loadTopic('..')).toBeNull()
    expect(await loadCaseStudy('../roadmap')).toBeNull()
  })
})

describe('thư mục content trống hoặc không tồn tại', () => {
  it('không ném lỗi, trả rỗng', async () => {
    vi.stubEnv('PRIVATE_CONTENT_DIR', join(tmpdir(), 'pinit-khong-ton-tai-' + Date.now()))
    expect(await loadRoadmap()).toBeNull()
    expect(await listTopics()).toEqual({ data: [], errors: [] })
    expect(await listCaseStudies()).toEqual({ data: [], errors: [] })
    expect(await loadTopic('kubernetes')).toBeNull()
  })
})

describe('báo lỗi schema thay vì sập', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pinit-content-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('topic thiếu index.md, tên thư mục/file sai', async () => {
    mkdirSync(join(dir, 'learn/no-index'), { recursive: true })
    mkdirSync(join(dir, 'learn/Bad Name'), { recursive: true })
    mkdirSync(join(dir, 'learn/ok'), { recursive: true })
    writeFileSync(join(dir, 'learn/ok/index.md'), '---\ntitle: OK\n---\n')
    writeFileSync(join(dir, 'learn/ok/Bad File.md'), '---\ntitle: X\n---\n')
    vi.stubEnv('PRIVATE_CONTENT_DIR', dir)

    const topics = await listTopics()
    expect(topics.data.map((t) => t.slug)).toEqual(['ok'])
    expect(topics.errors).toEqual([
      expect.stringContaining('learn/Bad Name/'),
      expect.stringContaining('learn/no-index/: thiếu index.md'),
    ])
    expect((await loadTopic('ok'))?.errors).toEqual([
      expect.stringContaining('learn/ok/Bad File.md'),
    ])
  })
})

describe('parseRoadmap', () => {
  it('bỏ milestone hỏng, giữ cái lành, liệt kê lý do', () => {
    const r = parseRoadmap(`
milestones:
  - { id: a, title: A, lane: degree, target: "2026-01", status: todo }
  - { id: a, title: Trùng, lane: degree, target: "2026-02", status: todo }
  - { id: b, title: B, lane: nope, target: "2026-13", status: later }
  - { id: c, title: C, lane: english, target: "2026-03", status: done, links: ["javascript:alert(1)"] }
  - { id: d, title: D, lane: interview, target: 2026-04-01, status: doing, notes: "  ghi chú  " }
`)
    expect(r.data.map((m) => m.id)).toEqual(['a', 'd'])
    expect(r.data[1]).toMatchObject({ target: '2026-04', notes: 'ghi chú', links: [] })
    expect(r.errors).toHaveLength(3)
    expect(r.errors[0]).toContain('id trùng')
    expect(r.errors[1]).toMatch(/lane .*status .*target/)
    expect(r.errors[2]).toContain('links phải là mảng URL http(s)')
  })

  it.each([
    ['YAML hỏng', 'milestones: [', 'YAML không hợp lệ'],
    ['thiếu milestones', 'foo: 1', 'thiếu mảng'],
    ['file rỗng', '', 'thiếu mảng'],
  ])('%s', (_, raw, msg) => {
    const r = parseRoadmap(raw)
    expect(r.data).toEqual([])
    expect(r.errors[0]).toContain(msg)
  })
})

describe('parseNote', () => {
  it('bỏ câu hỏi thiếu a nhưng giữ note', () => {
    const r = parseNote(
      '---\ntitle: T\nquestions:\n  - q: Một\n    a: Hai\n  - q: Thiếu a\n---\nbody',
      'n',
      'f.md',
    )
    expect(r.data?.questions).toEqual([{ q: 'Một', a: 'Hai' }])
    expect(r.errors).toEqual(['f.md: questions[1] thiếu q hoặc a'])
  })

  it('thiếu title / tags sai kiểu / updated sai → bỏ note', () => {
    const r = parseNote('---\ntags: k8s\nupdated: hôm qua\n---\n', 'n', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toMatch(/thiếu title.*tags.*updated/)
  })

  it('frontmatter YAML hỏng → lỗi, không ném', () => {
    const r = parseNote('---\ntitle: [\n---\n', 'n', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toContain('frontmatter không phải YAML hợp lệ')
  })
})

describe('parseCaseStudy', () => {
  it('thiếu visibility → private (mặc định an toàn)', () => {
    const r = parseCaseStudy('---\ntitle: T\nsummary: S\n---\n', 's', 'f.md')
    expect(r.data?.visibility).toBe('private')
  })

  it('visibility lạ → lỗi', () => {
    const r = parseCaseStudy('---\ntitle: T\nsummary: S\nvisibility: public\n---\n', 's', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toContain('visibility')
  })
})

describe('laneProgress', () => {
  const m = (status: string) => ({ status }) as never
  it('dropped không tính vào mẫu số', () => {
    expect(laneProgress([m('done'), m('doing'), m('dropped')])).toEqual({
      done: 1,
      total: 2,
      percent: 50,
    })
  })
  it('lane toàn dropped → 0%, không chia cho 0', () => {
    expect(laneProgress([m('dropped')])).toEqual({ done: 0, total: 0, percent: 0 })
  })
})
