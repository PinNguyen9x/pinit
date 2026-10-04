// Số liệu "tạo động lực" cho trang ôn luyện: chuỗi ngày luyện, nhãn theo điểm.
// Module thuần, không import gì của Node — component dùng trực tiếp.

// Việt Nam UTC+7 cố định, không có giờ mùa hè — cộng thẳng, khỏi phụ thuộc ICU.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000

/** Ngày (YYYY-MM-DD) theo giờ Việt Nam của một mốc ISO. */
export function vnDay(iso: string | number | Date): string {
  return new Date(new Date(iso).getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}

function prevDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Số ngày liên tiếp có ít nhất một lần chấm, tính lùi từ hôm nay. Hôm nay chưa
 * luyện thì chuỗi vẫn giữ nếu hôm qua có — chưa hết ngày thì chưa đứt.
 */
export function practiceStreak(days: string[], today: string): number {
  const set = new Set(days)
  let cursor = set.has(today) ? today : prevDay(today)
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = prevDay(cursor)
  }
  return streak
}

export type ScoreTone = 'success' | 'info' | 'warning' | 'error'

/** Nhãn + màu cho một điểm 0–10 (hoặc điểm trung bình). */
export function scoreBand(score: number): { label: string; tone: ScoreTone } {
  if (score >= 9) return { label: 'Xuất sắc', tone: 'success' }
  if (score >= 7) return { label: 'Vững', tone: 'success' }
  if (score >= 5) return { label: 'Gần rồi', tone: 'warning' }
  return { label: 'Ôn lại notes', tone: 'error' }
}
