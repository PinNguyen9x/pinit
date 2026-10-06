// Lịch ôn flashcard — logic thuần, client dùng được. Đọc/ghi file ở ./flashcards.ts.
//
// Cố ý đơn giản hơn SM-2: chỉ bốn mức 1/3/7/14 ngày. Mục tiêu là ôn đều tay trên
// điện thoại, không phải tối ưu trí nhớ tới từng ngày.

export const RATINGS = ['forgot', 'fuzzy', 'remember'] as const
export type Rating = (typeof RATINGS)[number]

export const RATING_LABEL: Record<Rating, string> = {
  forgot: 'Quên',
  fuzzy: 'Mơ hồ',
  remember: 'Nhớ',
}

export interface CardState {
  last: string // YYYY-MM-DD (giờ VN) lần ôn gần nhất
  interval: number // ngày
  due: string // YYYY-MM-DD
}

/**
 * Key `<topic>/<id>` khi câu hỏi có id, không thì `<topic>/<index>` — index theo
 * thứ tự thẻ của topic (xem topicCards). id luôn bắt đầu bằng chữ cái nên hai
 * dạng không bao giờ trùng nhau.
 */
export type FlashcardState = Record<string, CardState>

export function cardKey(topic: string, idOrIndex: string | number): string {
  return `${topic}/${idOrIndex}`
}

/** Quên → 1, Mơ hồ → 3, Nhớ → 7 (hoặc 14 nếu đã nhớ ở mức ≥ 7). */
export function nextInterval(rating: Rating, prev?: number): number {
  if (rating === 'forgot') return 1
  if (rating === 'fuzzy') return 3
  return prev != null && prev >= 7 ? 14 : 7
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function schedule(rating: Rating, prev: CardState | undefined, today: string): CardState {
  const interval = nextInterval(rating, prev?.interval)
  return { last: today, interval, due: addDays(today, interval) }
}

export type CardStatus = 'due' | 'new' | 'later'

export function cardStatus(state: CardState | undefined, today: string): CardStatus {
  if (!state) return 'new'
  return state.due <= today ? 'due' : 'later'
}

/** Đến hạn (quá hạn lâu nhất trước) → thẻ mới → chưa tới hạn (sắp tới trước). */
export function orderCards<T extends { key: string }>(
  cards: T[],
  state: FlashcardState,
  today: string,
): T[] {
  const rank: Record<CardStatus, number> = { due: 0, new: 1, later: 2 }
  return [...cards].sort((a, b) => {
    const sa = cardStatus(state[a.key], today)
    const sb = cardStatus(state[b.key], today)
    if (sa !== sb) return rank[sa] - rank[sb]
    const da = state[a.key]?.due ?? ''
    const db = state[b.key]?.due ?? ''
    return da.localeCompare(db) // giữ thứ tự gốc khi bằng nhau (sort ổn định)
  })
}

export function countByStatus(keys: string[], state: FlashcardState, today: string) {
  const out: Record<CardStatus, number> = { due: 0, new: 0, later: 0 }
  for (const k of keys) out[cardStatus(state[k], today)]++
  return out
}
