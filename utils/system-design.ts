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

export interface TermToken {
  type: 'text' | 'term'
  value: string
}

/** Marker [[Term]] — tên thuật ngữ không được rỗng và không chứa dấu ]. */
const TERM_MARKER_SOURCE = /\[\[([^\]]+?)\]\]/

/**
 * Tách một đoạn văn thành các mảnh text và thuật ngữ.
 * Thuật ngữ viết dưới dạng [[Term]] trong nội dung bài.
 * Marker không đóng hoặc rỗng được giữ nguyên văn, không sinh link.
 *
 * Dùng exec trong vòng lặp thay vì matchAll: tsconfig target là es5 nên
 * duyệt iterator cần downlevelIteration. Regex tạo mới mỗi lần gọi để
 * lastIndex không dính giữa các lần gọi.
 */
export function parseTermMarkers(text: string): TermToken[] {
  const pattern = new RegExp(TERM_MARKER_SOURCE.source, 'g')
  const tokens: TermToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const term = match[1].trim()
    if (!term) continue

    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    tokens.push({ type: 'term', value: term })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return tokens
}

/**
 * Link tới thuật ngữ trong trang từ điển.
 * Bắt buộc encode: thuật ngữ như "Token / JWT" hay "C/C++" sẽ phá route nếu
 * ghép thẳng vào hash.
 */
export function glossaryHref(term: string): string {
  return `/glossary#${encodeURIComponent(term)}`
}
