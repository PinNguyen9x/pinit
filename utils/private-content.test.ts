import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  contentDir,
  checkedCount,
  isSlug,
  laneProgress,
  milestoneProgress,
  monthsUntil,
  listCaseStudies,
  listPosts,
  listTopics,
  loadCaseStudy,
  loadNote,
  loadPost,
  loadRoadmap,
  loadTopic,
  parseCaseStudy,
  parseNote,
  parsePost,
  parseRoadmap,
  splitExcerpt,
} from './private-content'
import type { Milestone, RoadmapState } from './private-content-schema'

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
      topics: ['kubernetes'],
      checklist: [
        expect.objectContaining({ id: 'rate-limit' }),
        expect.objectContaining({ id: 'cost-log' }),
        expect.objectContaining({ id: 'deploy-k8s' }),
      ],
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
    // Sắp theo updated mới nhất trước.
    expect(list.data.map((c) => [c.slug, c.visibility])).toEqual([
      ['public-candidate-example', 'public-candidate'],
      ['example-migration', 'private'],
    ])
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

describe('private-content.example — posts', () => {
  beforeEach(() => vi.stubEnv('PRIVATE_CONTENT_DIR', EXAMPLE))

  it('bài mẫu hợp lệ, không lỗi schema', async () => {
    const r = await listPosts()
    expect(r.errors).toEqual([])
    expect(r.data).toEqual([
      expect.objectContaining({
        slug: 'vi-du-bai-viet',
        visibility: 'private',
        author: 'Pin Nguyen',
      }),
    ])
  })

  it('excerpt là phần trước truncate, không phải cả bài', async () => {
    const p = await loadPost('vi-du-bai-viet')
    expect(p?.errors).toEqual([])
    expect(p?.data?.excerpt).toContain('Đoạn này là excerpt')
    expect(p?.data?.excerpt).not.toContain('Frontmatter')
    expect(p?.data?.body).toContain('Frontmatter')
  })

  it('slug sai định dạng hoặc không có → null, không ném', async () => {
    expect(await loadPost('../../etc/passwd')).toBeNull()
    expect(await loadPost('Khong-Hop-Le')).toBeNull()
    expect(await loadPost('khong-ton-tai')).toBeNull()
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
    expect(r.data?.questions).toEqual([{ q: 'Một', a: 'Hai', id: null }])
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

describe('parseNote — id câu hỏi', () => {
  const note = (qs: string) => `---\ntitle: T\nquestions:\n${qs}---\n`

  it('nhận id hợp lệ; không có id → null', () => {
    const r = parseNote(
      note('  - { id: pod-vs-container, q: Q1, a: A1 }\n  - { q: Q2, a: A2 }\n'),
      'n',
      'f.md',
    )
    expect(r.errors).toEqual([])
    expect(r.data!.questions.map((q) => q.id)).toEqual(['pod-vs-container', null])
  })

  it.each([
    ['bắt đầu bằng số (trùng key theo vị trí)', '3'],
    ['chữ hoa', 'Pod'],
    ['có dấu cách', 'pod container'],
    ['có dấu', 'câu-1'],
  ])('id %s → bỏ id, giữ câu hỏi, báo lỗi', (_, id) => {
    const r = parseNote(note(`  - { id: "${id}", q: Q, a: A }\n`), 'n', 'f.md')
    expect(r.data!.questions).toEqual([{ q: 'Q', a: 'A', id: null }])
    expect(r.errors[0]).toContain('phải bắt đầu bằng chữ cái')
  })

  it('id trùng trong cùng note → câu sau mất id', () => {
    const r = parseNote(
      note('  - { id: x, q: Q1, a: A1 }\n  - { id: x, q: Q2, a: A2 }\n'),
      'n',
      'f.md',
    )
    expect(r.data!.questions.map((q) => q.id)).toEqual(['x', null])
    expect(r.errors).toEqual(['f.md: questions[1] id "x" trùng'])
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

describe('splitExcerpt', () => {
  it('cắt ở <!-- truncate -->', () => {
    expect(splitExcerpt('Mở đầu.\n\n<!-- truncate -->\n\nThân bài.')).toBe('Mở đầu.')
  })

  it('chấp cả <!--truncate--> không khoảng trắng', () => {
    expect(splitExcerpt('Mở đầu.\n<!--truncate-->\nThân.')).toBe('Mở đầu.')
  })

  it('không có separator → đoạn văn đầu, không phải cả bài', () => {
    expect(splitExcerpt('Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba.')).toBe('Đoạn một.')
  })

  it('rỗng → rỗng, không ném', () => {
    expect(splitExcerpt('')).toBe('')
  })
})

describe('parsePost', () => {
  const ok = "---\ntitle: T\ntags: [a]\ndate: '2026-01-02T00:00:00Z'\n---\nThân."

  it('thiếu visibility → private (mặc định an toàn)', () => {
    expect(parsePost(ok, 's', 'f.md').data?.visibility).toBe('private')
  })

  it('slug lấy từ tên file, KHÔNG từ frontmatter', () => {
    const raw = "---\nslug: khai-trong-frontmatter\ntitle: T\ntags: [a]\ndate: '2026-01-02T00:00:00Z'\n---\n"
    expect(parsePost(raw, 'ten-file', 'f.md').data?.slug).toBe('ten-file')
  })

  it('author và image tuỳ chọn → null khi thiếu', () => {
    const d = parsePost(ok, 's', 'f.md').data
    expect(d?.author).toBeNull()
    expect(d?.image).toBeNull()
  })

  it('thiếu date → lỗi', () => {
    const r = parsePost('---\ntitle: T\ntags: [a]\n---\n', 's', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toContain('date')
  })

  it('date không parse được → lỗi', () => {
    const r = parsePost('---\ntitle: T\ntags: [a]\ndate: hom-qua\n---\n', 's', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toContain('date')
  })

  it('visibility lạ → lỗi', () => {
    const raw = "---\ntitle: T\ntags: [a]\ndate: '2026-01-02T00:00:00Z'\nvisibility: public\n---\n"
    const r = parsePost(raw, 's', 'f.md')
    expect(r.data).toBeNull()
    expect(r.errors[0]).toContain('visibility')
  })

  it('body giữ CẢ excerpt — trang chi tiết hiện đủ bài', () => {
    const raw = "---\ntitle: T\ntags: [a]\ndate: '2026-01-02T00:00:00Z'\n---\nMở.\n\n<!-- truncate -->\n\nThân."
    const d = parsePost(raw, 's', 'f.md').data
    expect(d?.excerpt).toBe('Mở.')
    expect(d?.body).toContain('Mở.')
    expect(d?.body).toContain('Thân.')
  })
})

describe('tiến độ roadmap', () => {
  const m = (
    status: string,
    checklist: string[] = [],
    id = Math.random().toString(36),
  ): Milestone =>
    ({
      id,
      title: id,
      lane: 'ai-platform',
      target: '2026-12',
      status,
      notes: null,
      links: [],
      topics: [],
      checklist: checklist.map((c) => ({ id: c, text: c })),
    }) as Milestone

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

  // Lỗi cũ: thanh đầy xanh khi 0/8 là chuyện màu nền; ở đây chốt con số phải là 0.
  it('0 milestone xong, 0 tick → 0%', () => {
    const items = Array.from({ length: 8 }, () => m('todo', ['a', 'b']))
    expect(laneProgress(items, {})).toEqual({ done: 0, total: 8, percent: 0 })
  })

  it('milestone chưa done đóng góp theo tỉ lệ checklist đã tick', () => {
    const a = m('done', [], 'a')
    const b = m('doing', ['x', 'y', 'z', 'w'], 'b')
    const c = m('todo', [], 'c') // không checklist → 0
    const state: RoadmapState = { b: { x: true, y: true } }
    // (1 + 2/4 + 0) / 3 = 50%
    expect(laneProgress([a, b, c], state)).toEqual({ done: 1, total: 3, percent: 50 })
    expect(milestoneProgress(b, state)).toBe(0.5)
  })

  it('milestone done = 100% dù checklist chưa tick hết', () => {
    expect(milestoneProgress(m('done', ['x']), {})).toBe(1)
  })

  it('tick của mục đã xoá khỏi yaml không được tính', () => {
    const b = m('doing', ['x'], 'b')
    expect(checkedCount(b, { b: { x: true, 'da-xoa': true } })).toBe(1)
    expect(milestoneProgress(b, { b: { x: true, 'da-xoa': true } })).toBe(1)
  })

  it.each([
    ['2026-12', '2026-10', 2],
    ['2027-01', '2026-12', 1],
    ['2026-10', '2026-10', 0],
    ['2026-08', '2026-10', -2],
  ])('monthsUntil(%s, now=%s) = %i', (target, now, n) => {
    expect(monthsUntil(target, now)).toBe(n)
  })
})

describe('parseRoadmap — topics và checklist', () => {
  const base = 'id: a, title: A, lane: degree, target: "2026-01", status: todo'

  it('đọc topics + checklist; mặc định rỗng khi không khai', () => {
    const r = parseRoadmap(`
milestones:
  - { ${base}, topics: [kubernetes, kafka, kubernetes], checklist: [{ id: x, text: Ý X }] }
  - { id: b, title: B, lane: degree, target: "2026-02", status: todo }
`)
    expect(r.errors).toEqual([])
    expect(r.data[0]).toMatchObject({
      topics: ['kubernetes', 'kafka'],
      checklist: [{ id: 'x', text: 'Ý X' }],
    })
    expect(r.data[1]).toMatchObject({ topics: [], checklist: [] })
  })

  it('mục con hỏng bị bỏ kèm lỗi, milestone vẫn giữ', () => {
    const r = parseRoadmap(`
milestones:
  - ${'{'} ${base}, topics: [ok, "../etc", Hoa], checklist: [{ id: x, text: X }, { id: x, text: trùng }, { id: "có dấu", text: Y }, { text: thiếu id }] }
`)
    expect(r.data).toHaveLength(1)
    expect(r.data[0].topics).toEqual(['ok'])
    expect(r.data[0].checklist.map((c) => c.id)).toEqual(['x'])
    expect(r.errors).toHaveLength(5)
    expect(r.errors.join('\n')).toMatch(/topic "\.\.\/etc"/)
    expect(r.errors.join('\n')).toMatch(/checklist\[1\] id "x" trùng/)
  })

  it('topics/checklist sai kiểu → bỏ cả milestone như các trường bắt buộc khác', () => {
    const r = parseRoadmap(`
milestones:
  - { ${base}, topics: kubernetes }
  - { id: b, title: B, lane: degree, target: "2026-02", status: todo, checklist: "x" }
`)
    expect(r.data).toEqual([])
    expect(r.errors[0]).toContain('topics phải là mảng slug')
    expect(r.errors[1]).toContain('checklist phải là mảng')
  })
})

describe('loadRoadmap — topic phải tồn tại trong learn/', () => {
  it('topic không có → bỏ khỏi milestone, báo lỗi file:lý do', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'pinit-roadmap-'))
    mkdirSync(join(dir, 'learn/k8s'), { recursive: true })
    writeFileSync(join(dir, 'learn/k8s/index.md'), '---\ntitle: K8s\n---\n')
    // Thư mục có nhưng thiếu index.md → không phải topic hợp lệ.
    mkdirSync(join(dir, 'learn/rong'), { recursive: true })
    writeFileSync(
      join(dir, 'roadmap.yaml'),
      'milestones:\n  - { id: a, title: A, lane: degree, target: "2026-01", status: todo, topics: [k8s, kafka, rong] }\n',
    )
    vi.stubEnv('PRIVATE_CONTENT_DIR', dir)
    const r = await loadRoadmap()
    expect(r!.data[0].topics).toEqual(['k8s'])
    expect(r!.errors).toEqual([
      'roadmap.yaml: milestone a: topic "kafka", "rong" không có trong learn/',
    ])
    rmSync(dir, { recursive: true, force: true })
  })
})
