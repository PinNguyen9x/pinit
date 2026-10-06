import { describe, expect, it } from 'vitest'
import {
  averageBetween,
  countByDay,
  daysUntilTargetEnd,
  heatLevel,
  heatmapWeeks,
  pickToday,
  topicStatus,
  trend,
  upcomingMilestones,
} from './activity-insights'
import type { Milestone } from './private-content-schema'

const TODAY = '2026-10-06' // Thứ 3

describe('heatmap', () => {
  it('12 cột × 7 hàng, hàng đầu là Thứ 2, cột cuối chứa hôm nay', () => {
    const w = heatmapWeeks({}, TODAY, 12)
    expect(w).toHaveLength(12)
    expect(w.every((c) => c.length === 7)).toBe(true)
    expect(w[11][0].day).toBe('2026-10-05') // Thứ 2 tuần này
    expect(w[11][1].day).toBe(TODAY)
    expect(w[0][0].day).toBe('2026-07-20') // lùi 11 tuần
  })

  it('đếm theo ngày, ngày tương lai đánh dấu future', () => {
    const counts = countByDay(['2026-10-05', '2026-10-05', '2026-10-06'])
    const last = heatmapWeeks(counts, TODAY)[11]
    expect(last[0]).toMatchObject({ count: 2, level: 2, future: false })
    expect(last[1]).toMatchObject({ count: 1, level: 1, future: false })
    expect(last[2]).toMatchObject({ count: 0, level: 0, future: true })
  })

  it.each([
    [0, 0],
    [1, 1],
    [3, 2],
    [6, 3],
    [7, 4],
    [40, 4],
  ])('heatLevel(%i) = %i', (n, level) => expect(heatLevel(n)).toBe(level))
})

describe('trung bình 7 ngày và xu hướng', () => {
  const e = (day: string, score: number) => ({ day, score })
  const entries = [
    e('2026-09-25', 4), // 11 ngày trước → kỳ trước
    e('2026-09-29', 6), // 7 ngày trước → kỳ trước
    e('2026-09-30', 8), // 6 ngày trước → kỳ này
    e('2026-10-06', 9),
  ]

  it('kỳ này = 0..6 ngày trước, kỳ trước = 7..13 ngày trước', () => {
    expect(averageBetween(entries, TODAY, 0, 6)).toBe(8.5)
    expect(averageBetween(entries, TODAY, 7, 13)).toBe(5)
    expect(averageBetween([], TODAY, 0, 6)).toBeNull()
  })

  it('trend: lệch < 0.3 là đi ngang; thiếu dữ liệu là null', () => {
    expect(trend(8.5, 5)).toBe('up')
    expect(trend(5, 8.5)).toBe('down')
    expect(trend(7, 7.2)).toBe('flat')
    expect(trend(7, null)).toBeNull()
  })
})

describe('topicStatus', () => {
  it.each([
    [null, 'new'],
    [5.9, 'weak'],
    [6, 'ok'],
    [8, 'ok'],
    [8.1, 'strong'],
  ] as const)('%s → %s', (avg, key) => expect(topicStatus(avg).key).toBe(key))
})

describe('đếm ngược và khối Hôm nay', () => {
  const m = (id: string, target: string, status: string, checklist = ['a', 'b']): Milestone =>
    ({
      id,
      title: id,
      lane: 'ai-platform',
      target,
      status,
      notes: null,
      links: [],
      topics: [],
      checklist: checklist.map((c) => ({ id: c, text: c })),
    }) as Milestone

  it('daysUntilTargetEnd tính tới ngày cuối tháng target; âm = trễ', () => {
    expect(daysUntilTargetEnd('2026-10', TODAY)).toBe(25)
    expect(daysUntilTargetEnd('2026-11', TODAY)).toBe(55)
    expect(daysUntilTargetEnd('2026-09', TODAY)).toBe(-6)
  })

  it('upcomingMilestones bỏ done/dropped, lấy 2 mục gần nhất', () => {
    const list = [
      m('xa', '2027-06', 'todo'),
      m('xong', '2026-01', 'done'),
      m('gan', '2026-11', 'todo'),
      m('vua', '2026-12', 'doing'),
    ]
    expect(upcomingMilestones(list).map((x) => x.id)).toEqual(['gan', 'vua'])
  })

  it('pickToday: tối đa 3 mục, mỗi loại một, có link được', () => {
    const milestones = [
      m('het-checklist', '2026-10', 'doing', ['a']),
      m('con-viec', '2026-11', 'todo'),
    ]
    const state = { 'het-checklist': { a: true as const } }
    const topics = [
      { slug: 'k8s', title: 'K8s', count: 5, recentAverage: 7.5 },
      { slug: 'rag', title: 'RAG', count: 3, recentAverage: 4.2 },
      { slug: 'eval', title: 'Eval', count: 0, recentAverage: null },
      { slug: 'cka', title: 'CKA', count: 0, recentAverage: null },
    ]
    expect(pickToday(milestones, state, topics)).toEqual([
      { kind: 'milestone', id: 'con-viec', title: 'con-viec', target: '2026-11', left: 2 },
      { kind: 'weak-topic', slug: 'rag', title: 'RAG', average: 4.2 },
      { kind: 'new-topic', slug: 'eval', title: 'Eval' },
    ])
  })

  // Từng gặp trên screenshot: "Topic yếu nhất: Kubernetes — trung bình 10/10".
  it('pickToday không gợi ý luyện lại topic đã Vững (> 8)', () => {
    const topics = [
      { slug: 'k8s', title: 'K8s', count: 9, recentAverage: 10 },
      { slug: 'rag', title: 'RAG', count: 4, recentAverage: 8.4 },
    ]
    expect(pickToday([], {}, topics).map((i) => i.kind)).toEqual([])
    expect(
      pickToday([], {}, [...topics, { slug: 'eval', title: 'Eval', count: 2, recentAverage: 7 }]),
    ).toEqual([{ kind: 'weak-topic', slug: 'eval', title: 'Eval', average: 7 }])
  })

  it('pickToday rỗng khi không còn gì để gợi ý', () => {
    expect(pickToday([], {}, [])).toEqual([])
  })
})
