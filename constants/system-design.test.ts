import { describe, expect, it } from 'vitest'
import { LESSONS } from './system-design'
import { LESSON_TRACKS } from '@/models/system-design'

// Ca kiểm thử toàn vẹn cấu trúc dữ liệu 13 buổi.
// Ca kiểm thử về *nội dung* (đủ số từ, có diagram, đủ flashcard) nằm ở
// system-design-content.test.ts — thêm sau khi chốt khuôn mẫu ở M2.

describe('LESSONS — toàn vẹn cấu trúc', () => {
  it('có đúng 13 buổi', () => {
    expect(LESSONS).toHaveLength(13)
  })

  it('order là 1..13, không thiếu, không trùng', () => {
    const orders = LESSONS.map((l) => l.order).sort((a, b) => a - b)
    expect(orders).toEqual(Array.from({ length: 13 }, (_, i) => i + 1))
  })

  it('slug không trùng nhau', () => {
    const slugs = LESSONS.map((l) => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  // Trong Pages Router, pages/system-design/cheat-sheet.tsx được ưu tiên hơn
  // [slug].tsx. Nếu một buổi mang slug này thì trang của nó vĩnh viễn không
  // truy cập được. Xem design decision 6.
  it('không buổi nào mang slug trùng tên file tĩnh cùng thư mục', () => {
    const RESERVED = ['cheat-sheet', 'index']
    const conflict = LESSONS.filter((l) => RESERVED.includes(l.slug))
    expect(conflict.map((l) => l.slug)).toEqual([])
  })

  it('mọi slug là kebab-case', () => {
    const invalid = LESSONS.filter((l) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug))
    expect(invalid.map((l) => l.slug)).toEqual([])
  })

  it('mọi buổi có title và summary không rỗng', () => {
    const invalid = LESSONS.filter((l) => !l.title.trim() || !l.summary.trim())
    expect(invalid.map((l) => l.slug)).toEqual([])
  })

  // Trang cheat-sheet render keyTakeaway của cả 13 buổi — thiếu một dòng là
  // thiếu một buổi trong bản ôn gấp.
  it('mọi buổi có keyTakeaway không rỗng', () => {
    const invalid = LESSONS.filter((l) => !l.keyTakeaway.trim())
    expect(invalid.map((l) => l.slug)).toEqual([])
  })

  it('track thuộc danh sách hợp lệ', () => {
    const invalid = LESSONS.filter((l) => !LESSON_TRACKS.includes(l.track))
    expect(invalid.map((l) => l.slug)).toEqual([])
  })

  it('mọi buổi có ít nhất 1 keyword để search', () => {
    const invalid = LESSONS.filter((l) => l.keywords.length === 0)
    expect(invalid.map((l) => l.slug)).toEqual([])
  })

  it('readingMinutes là số dương', () => {
    const invalid = LESSONS.filter((l) => !Number.isFinite(l.readingMinutes) || l.readingMinutes <= 0)
    expect(invalid.map((l) => l.slug)).toEqual([])
  })
})
