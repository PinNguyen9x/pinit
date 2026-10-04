// Schema của content private khu /me: hằng số, type và logic thuần.
//
// File này KHÔNG được import gì của Node — component của trang dùng LANES,
// laneProgress... nên nó nằm trong bundle client. Loader đọc disk ở
// ./private-content.ts.

export const LANES = ['ai-platform', 'data-platform', 'degree', 'english', 'interview'] as const
export const MILESTONE_STATUSES = ['todo', 'doing', 'done', 'dropped'] as const
export const VISIBILITIES = ['private', 'public-candidate'] as const

export type Lane = (typeof LANES)[number]
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number]
export type Visibility = (typeof VISIBILITIES)[number]

export interface Milestone {
  id: string
  title: string
  lane: Lane
  target: string // YYYY-MM
  status: MilestoneStatus
  notes: string | null
  links: string[]
  topics: string[] // slug trong learn/ — loader đã bỏ slug không tồn tại
  checklist: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  text: string
}

/**
 * Trạng thái tick checklist — KHÔNG nằm trong roadmap.yaml (content mount :ro),
 * mà trong roadmap-state.json cạnh practice log. Chỉ lưu mục đã tick.
 */
export type RoadmapState = Record<string, Record<string, true>>

export interface Question {
  q: string
  a: string
}

export interface NoteMeta {
  slug: string
  title: string
  tags: string[]
  questions: Question[]
  updated: string | null // YYYY-MM-DD
}

export interface Note extends NoteMeta {
  body: string
}

export interface TopicSummary extends NoteMeta {
  noteCount: number
}

export interface CaseStudyMeta {
  slug: string
  title: string
  summary: string
  tags: string[]
  visibility: Visibility
  updated: string | null
}

export interface CaseStudy extends CaseStudyMeta {
  body: string
}

/** Giá trị kèm lỗi schema gặp trên đường đọc. */
export interface WithErrors<T> {
  data: T
  errors: string[]
}

// Tên thư mục/file thành URL — đồng thời là hàng rào path traversal: slug đã
// qua regex này thì không thể chứa `/`, `..` hay ký tự lạ.
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/

export function isSlug(s: unknown): s is string {
  return typeof s === 'string' && SLUG_RE.test(s)
}

/** Tiến độ lane = done / (tổng − dropped). Mục đã bỏ không kéo phần trăm xuống. */
/** Số mục checklist đã tick — chỉ đếm id còn tồn tại trong yaml (state cũ có thể thừa). */
export function checkedCount(m: Milestone, state: RoadmapState = {}): number {
  const ticked = state[m.id] ?? {}
  return m.checklist.filter((c) => ticked[c.id]).length
}

/** 0..1 — done là 1; chưa done thì bằng tỉ lệ checklist đã tick (không có checklist → 0). */
export function milestoneProgress(m: Milestone, state: RoadmapState = {}): number {
  if (m.status === 'done') return 1
  if (!m.checklist.length) return 0
  return checkedCount(m, state) / m.checklist.length
}

/**
 * Tiến độ lane = (milestone done + tỉ lệ checklist của milestone chưa done) / tổng.
 * Mục dropped không tính vào mẫu số — bỏ việc không được kéo phần trăm xuống.
 */
export function laneProgress(items: Milestone[], state: RoadmapState = {}) {
  const active = items.filter((m) => m.status !== 'dropped')
  const done = active.filter((m) => m.status === 'done').length
  const sum = active.reduce((acc, m) => acc + milestoneProgress(m, state), 0)
  return { done, total: active.length, percent: active.length ? (sum / active.length) * 100 : 0 }
}

/** Số tháng từ `now` (YYYY-MM) tới `target` (YYYY-MM); âm = quá hạn. */
export function monthsUntil(target: string, now: string): number {
  const [ty, tm] = target.split('-').map(Number)
  const [ny, nm] = now.split('-').map(Number)
  return (ty - ny) * 12 + (tm - nm)
}
