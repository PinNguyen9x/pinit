import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCockpit, loadTopicActivity } from './activity'

const dirs: string[] = []
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })))
afterEach(() => vi.unstubAllEnvs())

// "Bây giờ" = 2026-10-06 10:00 giờ VN.
const NOW = Date.parse('2026-10-06T03:00:00Z')
const at = (day: string, hour = 3) => `${day}T${String(hour).padStart(2, '0')}:00:00Z`

let logDir: string
beforeEach(() => {
  const content = mkdtempSync(join(tmpdir(), 'pinit-act-content-'))
  logDir = mkdtempSync(join(tmpdir(), 'pinit-act-log-'))
  dirs.push(content, logDir)
  for (const [slug, title] of [
    ['k8s', 'K8s'],
    ['rag', 'RAG'],
    ['eval', 'Eval'],
  ]) {
    mkdirSync(join(content, 'learn', slug), { recursive: true })
    writeFileSync(
      join(content, 'learn', slug, 'index.md'),
      `---\ntitle: ${title}\nquestions:\n  - { q: "Q", a: "A" }\n  - { q: "Q2", a: "A2" }\n---\n`,
    )
  }
  writeFileSync(
    join(content, 'roadmap.yaml'),
    `milestones:
  - { id: m1, title: M1, lane: ai-platform, target: "2026-11", status: doing, checklist: [{ id: a, text: A }] }
  - { id: m2, title: M2, lane: interview, target: "2026-12", status: todo }
  - { id: m3, title: M3, lane: degree, target: "2027-06", status: todo }
`,
  )
  const practice = [
    // kỳ trước (7–13 ngày trước): k8s 6
    { ts: at('2026-09-29'), topic: 'k8s', score: 6 },
    // kỳ này: k8s 8, rag 4 — có dòng chưa chấm (score null) không được tính
    { ts: at('2026-10-04'), topic: 'k8s', score: 8 },
    { ts: at('2026-10-05'), topic: 'rag', score: 4 },
    { ts: at('2026-10-05'), topic: 'rag', score: null },
  ].map((e) => JSON.stringify({ question: 'q', answer: 'a', feedback: null, ...e }))
  writeFileSync(join(logDir, 'practice-log.jsonl'), practice.join('\n') + '\n')
  // Flashcard hôm nay và hôm qua (17:30 UTC ngày 05 = 00:30 VN ngày 06).
  const flash = [
    { ts: at('2026-10-05', 17), card: 'k8s/0', rating: 'remember' },
    { ts: at('2026-10-03'), card: 'k8s/1', rating: 'fuzzy' },
  ]
  writeFileSync(
    join(logDir, 'flashcard-log.jsonl'),
    flash.map((e) => JSON.stringify(e)).join('\n') + '\n',
  )
  writeFileSync(
    join(logDir, 'flashcard-state.json'),
    JSON.stringify({
      'k8s/0': { last: '2026-10-06', interval: 7, due: '2026-10-13' },
      'k8s/1': { last: '2026-10-03', interval: 3, due: '2026-10-06' },
    }),
  )
  vi.stubEnv('PRIVATE_CONTENT_DIR', content)
  vi.stubEnv('PRACTICE_LOG_PATH', join(logDir, 'practice-log.jsonl'))
})

describe('loadTopicActivity', () => {
  it('số lần, trung bình gần nhất, ngày cuối, thẻ đến hạn theo topic', async () => {
    const { topics } = await loadTopicActivity('2026-10-06')
    const by = Object.fromEntries(topics.map((t) => [t.slug, t]))
    expect(by.k8s).toMatchObject({
      count: 2,
      recentAverage: 7,
      lastDay: '2026-10-04',
      cards: { total: 2, due: 1, new: 0 },
    })
    expect(by.rag).toMatchObject({ count: 1, recentAverage: 4, cards: { due: 0, new: 2 } })
    expect(by.eval).toMatchObject({ count: 0, recentAverage: null, lastDay: null })
  })
})

describe('loadCockpit', () => {
  it('streak gộp practice + flashcard theo ngày giờ VN', async () => {
    const c = await loadCockpit(NOW)
    // 06 (flashcard 00:30 VN), 05 (rag), 04 (k8s), 03 (flashcard) → 4 ngày; 02 trống.
    expect(c.streak).toBe(4)
    expect(c.activeToday).toBe(1)
  })

  it('heatmap đếm cả hai nguồn; trung bình 7 ngày so với kỳ trước', async () => {
    const c = await loadCockpit(NOW)
    const cells = Object.fromEntries(c.heatmap.flat().map((x) => [x.day, x.count]))
    expect(cells['2026-10-05']).toBe(1) // rag đã chấm; dòng score null không tính
    expect(cells['2026-10-03']).toBe(1)
    expect([c.avg7, c.prev7, c.trend]).toEqual([6, 6, 'flat'])
  })

  it('Hôm nay, đếm ngược 2 milestone, tổng thẻ đến hạn', async () => {
    const c = await loadCockpit(NOW)
    expect(c.todayItems.map((i) => i.kind)).toEqual(['milestone', 'weak-topic', 'new-topic'])
    expect(c.todayItems[0]).toMatchObject({ id: 'm1', left: 1 })
    expect(c.todayItems[1]).toMatchObject({ slug: 'rag' })
    expect(c.countdown.map((m) => [m.id, m.daysLeft])).toEqual([
      ['m1', 55],
      ['m2', 86],
    ])
    expect(c.dueCards).toBe(1)
  })
})
