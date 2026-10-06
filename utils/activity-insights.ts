// Số liệu cho cockpit /me — logic thuần, client dùng được. Ngày là chuỗi
// YYYY-MM-DD theo giờ VN (xem vnDay trong ./practice-insights).
import { addDays } from './flashcard-schedule'
import type { Milestone, RoadmapState } from './private-content-schema'
import { checkedCount } from './private-content-schema'

export function countByDay(days: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const d of days) out[d] = (out[d] ?? 0) + 1
  return out
}

/** 0 = không luyện; 1..4 đậm dần. Ngưỡng cố định để màu không nhảy theo tuần. */
export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

export interface HeatCell {
  day: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  future: boolean
}

/** Thứ trong tuần kiểu ISO: Thứ 2 = 0 … Chủ nhật = 6. */
function isoWeekday(day: string): number {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7
}

/**
 * Lưới `weeks` cột × 7 hàng (Thứ 2 → CN), cột cuối là tuần chứa hôm nay. Ô sau
 * hôm nay đánh dấu `future` để vẽ mờ thay vì tính là "không luyện".
 */
export function heatmapWeeks(
  counts: Record<string, number>,
  today: string,
  weeks = 12,
): HeatCell[][] {
  const start = addDays(today, -isoWeekday(today) - (weeks - 1) * 7)
  const cols: HeatCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = []
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d)
      const count = counts[day] ?? 0
      col.push({ day, count, level: heatLevel(count), future: day > today })
    }
    cols.push(col)
  }
  return cols
}

export interface ScoredEntry {
  day: string
  score: number
}

/** Trung bình điểm trong [today − to, today − from] (đếm ngược, gồm cả hai đầu); null nếu trống. */
export function averageBetween(entries: ScoredEntry[], today: string, from: number, to: number) {
  const lo = addDays(today, -to)
  const hi = addDays(today, -from)
  const xs = entries.filter((e) => e.day >= lo && e.day <= hi).map((e) => e.score)
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null
}

export function trend(
  current: number | null,
  previous: number | null,
): 'up' | 'down' | 'flat' | null {
  if (current == null || previous == null) return null
  if (Math.abs(current - previous) < 0.3) return 'flat'
  return current > previous ? 'up' : 'down'
}

export type TopicStatusKey = 'new' | 'weak' | 'ok' | 'strong'

/** Theo trung bình các lần chấm gần nhất: < 6 yếu, 6–8 ổn, > 8 vững. */
export function topicStatus(recentAverage: number | null): { key: TopicStatusKey; label: string } {
  if (recentAverage == null) return { key: 'new', label: 'Chưa luyện' }
  if (recentAverage < 6) return { key: 'weak', label: 'Yếu' }
  if (recentAverage <= 8) return { key: 'ok', label: 'Ổn' }
  return { key: 'strong', label: 'Vững' }
}

/** Số ngày tới hết tháng target (YYYY-MM); âm = đã qua. */
export function daysUntilTargetEnd(target: string, today: string): number {
  const [y, m] = target.split('-').map(Number)
  const end = new Date(Date.UTC(y, m, 0)) // ngày 0 của tháng sau = ngày cuối tháng này
  const now = new Date(`${today}T00:00:00Z`)
  return Math.round((end.getTime() - now.getTime()) / 86_400_000)
}

export function upcomingMilestones(milestones: Milestone[], n = 2): Milestone[] {
  return milestones
    .filter((m) => m.status === 'todo' || m.status === 'doing')
    .sort((a, b) => a.target.localeCompare(b.target) || (a.status === 'doing' ? -1 : 1))
    .slice(0, n)
}

export interface TopicActivity {
  slug: string
  title: string
  count: number
  recentAverage: number | null
}

export type TodayItem =
  | { kind: 'milestone'; id: string; title: string; target: string; left: number }
  | { kind: 'weak-topic'; slug: string; title: string; average: number }
  | { kind: 'new-topic'; slug: string; title: string }

/**
 * Khối "Hôm nay" — tối đa 3 việc, mỗi loại một: milestone đang làm/sắp tới có
 * target gần nhất còn checklist dở; topic đã luyện có điểm thấp nhất; một topic
 * chưa luyện bao giờ.
 */
export function pickToday(
  milestones: Milestone[],
  state: RoadmapState,
  topics: TopicActivity[],
): TodayItem[] {
  const items: TodayItem[] = []
  const m = milestones
    .filter(
      (x) =>
        (x.status === 'doing' || x.status === 'todo') &&
        checkedCount(x, state) < x.checklist.length,
    )
    .sort((a, b) => a.target.localeCompare(b.target) || (a.status === 'doing' ? -1 : 1))[0]
  if (m) {
    items.push({
      kind: 'milestone',
      id: m.id,
      title: m.title,
      target: m.target,
      left: m.checklist.length - checkedCount(m, state),
    })
  }
  // Chỉ gợi ý luyện lại khi topic chưa "Vững" — gợi ý ôn một topic 10/10 là nhiễu.
  const weak = topics
    .filter((t) => t.recentAverage != null && topicStatus(t.recentAverage).key !== 'strong')
    .sort((a, b) => a.recentAverage! - b.recentAverage!)[0]
  if (weak)
    items.push({
      kind: 'weak-topic',
      slug: weak.slug,
      title: weak.title,
      average: weak.recentAverage!,
    })
  const fresh = topics.find((t) => t.count === 0)
  if (fresh) items.push({ kind: 'new-topic', slug: fresh.slug, title: fresh.title })
  return items
}
