// Logic thuần cho tiến độ học System Design. Tách khỏi hook để test được mà
// không cần jsdom — xem docs/ai/testing/2026-07-26-feature-system-design.md

/**
 * Đọc danh sách slug đã hoàn thành từ giá trị thô trong localStorage.
 * Chịu được mọi loại rác: null, JSON hỏng, không phải mảng, phần tử sai kiểu,
 * slug của buổi đã bị xóa khỏi lộ trình.
 */
export function parseCompletedSlugs(raw: string | null, knownSlugs: string[]): string[] {
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  const known = new Set(knownSlugs)
  const seen = new Set<string>()

  return parsed.filter((item): item is string => {
    if (typeof item !== 'string' || !known.has(item) || seen.has(item)) return false
    seen.add(item)
    return true
  })
}

/** Bật/tắt một slug, trả về mảng mới (không sửa mảng gốc). */
export function toggleSlug(current: string[], slug: string): string[] {
  return current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]
}

/** Phần trăm hoàn thành, làm tròn về số nguyên 0..100. */
export function computeProgressPercent(completedCount: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((completedCount / total) * 100))
}
