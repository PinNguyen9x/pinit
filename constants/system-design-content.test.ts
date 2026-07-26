import { describe, expect, it } from 'vitest'
import { GLOSSARY } from './glossary'
import { INTERVIEW_STEPS, LESSONS } from './system-design'
import { parseTermMarkers } from '@/utils/system-design'

// Chuẩn nội dung cho một buổi đã biên soạn xong. Danh sách SLUGS_DA_VIET mở
// rộng dần theo milestone; tới M6 phải chứa đủ buổi 1-12.
const SLUGS_DA_VIET = [
  'nguyen-ly-cap-microservices',
  'load-balancer-va-database',
  'networking-he-phan-tan',
  'caching-message-queue-monitoring',
  'cdn-blobstore-search-logging',
  'framework-tra-loi-phong-van',
  'case-study-tinyurl',
  'case-study-youtube',
  'case-study-social-media',
  'case-study-typeahead',
  'case-study-taxi-booking',
]

const MIN_WORDS = 800
const MIN_SECTIONS = 3
const MIN_FLASHCARDS = 4

const written = LESSONS.filter((lesson) => SLUGS_DA_VIET.includes(lesson.slug))

function countWords(lesson: (typeof LESSONS)[number]): number {
  const text = lesson.sections
    .flatMap((section) => [
      section.heading,
      ...section.body,
      section.callout ?? '',
      ...(section.table?.rows.flat() ?? []),
    ])
    .join(' ')
  return text.split(/\s+/).filter(Boolean).length
}

describe('nội dung các buổi đã biên soạn', () => {
  it('mọi slug trong SLUGS_DA_VIET đều tồn tại trong LESSONS', () => {
    expect(written.map((l) => l.slug).sort()).toEqual([...SLUGS_DA_VIET].sort())
  })

  it.each(SLUGS_DA_VIET)(`%s — có ít nhất ${MIN_SECTIONS} khối nội dung`, (slug) => {
    const lesson = written.find((l) => l.slug === slug)!
    expect(lesson.sections.length).toBeGreaterThanOrEqual(MIN_SECTIONS)
  })

  it.each(SLUGS_DA_VIET)(`%s — dài ít nhất ${MIN_WORDS} từ`, (slug) => {
    const lesson = written.find((l) => l.slug === slug)!
    expect(countWords(lesson)).toBeGreaterThanOrEqual(MIN_WORDS)
  })

  it.each(SLUGS_DA_VIET)('%s — có ít nhất 1 sơ đồ mermaid', (slug) => {
    const lesson = written.find((l) => l.slug === slug)!
    expect(lesson.sections.filter((s) => s.diagram).length).toBeGreaterThanOrEqual(1)
  })

  it.each(SLUGS_DA_VIET)(`%s — có ít nhất ${MIN_FLASHCARDS} flashcard`, (slug) => {
    const lesson = written.find((l) => l.slug === slug)!
    expect(lesson.flashcards.length).toBeGreaterThanOrEqual(MIN_FLASHCARDS)
  })

  it.each(SLUGS_DA_VIET)('%s — flashcard nào cũng có câu hỏi và đáp án', (slug) => {
    const lesson = written.find((l) => l.slug === slug)!
    const invalid = lesson.flashcards.filter((c) => !c.question.trim() || !c.answer.trim())
    expect(invalid).toEqual([])
  })
})

// INTERVIEW_STEPS được trang cheat-sheet và buổi 13 dùng lại. Bảng khung thời
// gian in trong buổi 6 phải khớp với nó, nếu không người học sẽ thấy hai bản
// khác nhau của cùng một khung.
describe('INTERVIEW_STEPS', () => {
  it('order là 1..n, không thiếu, không trùng', () => {
    const orders = INTERVIEW_STEPS.map((s) => s.order).sort((a, b) => a - b)
    expect(orders).toEqual(INTERVIEW_STEPS.map((_, i) => i + 1))
  })

  it('tổng thời gian đúng 45 phút của một buổi phỏng vấn', () => {
    expect(INTERVIEW_STEPS.reduce((sum, s) => sum + s.minutes, 0)).toBe(45)
  })

  it('mỗi bước có tên và ít nhất một mục checklist', () => {
    const invalid = INTERVIEW_STEPS.filter((s) => !s.name.trim() || s.checklist.length === 0)
    expect(invalid.map((s) => s.name)).toEqual([])
  })

  it('bảng khung thời gian in trong buổi 6 khớp với INTERVIEW_STEPS', () => {
    const lesson = LESSONS.find((l) => l.slug === 'framework-tra-loi-phong-van')!
    const table = lesson.sections.map((s) => s.table).find((t) => t?.headers[0] === 'Bước')
    expect(table).toBeDefined()
    expect(table!.rows.map((row) => row[1])).toEqual(INTERVIEW_STEPS.map((s) => s.name))
    expect(table!.rows.map((row) => row[2])).toEqual(
      INTERVIEW_STEPS.map((s) => `${s.minutes} phút`),
    )
  })
})

/** Mọi chuỗi văn bản người đọc nhìn thấy, trong các buổi đã viết. */
const allText = written.flatMap((lesson) => [
  ...lesson.sections.flatMap((section) => [
    section.heading,
    ...section.body,
    section.callout ?? '',
    ...(section.table?.headers ?? []),
    ...(section.table?.rows.flat() ?? []),
  ]),
  ...lesson.flashcards.flatMap((card) => [card.question, card.answer, card.pitfall ?? '']),
])

// RichText chỉ parse marker [[Term]], KHÔNG parse markdown. Viết **đậm** hay
// _nghiêng_ sẽ hiển thị nguyên ký tự cho người đọc.
describe('không lẫn cú pháp markdown vào nội dung', () => {
  it.each([
    ['in đậm kiểu **', /\*\*/],
    ['in nghiêng hoặc đậm kiểu __', /__/],
    ['code inline kiểu `', /`/],
  ])('không có %s', (_label, pattern) => {
    const offenders = allText
      .filter((text) => pattern.test(text))
      .map((text) => text.slice(0, 60))
    expect(offenders).toEqual([])
  })
})

describe('cross-link sang glossary', () => {
  const glossaryTerms = new Set(GLOSSARY.map((entry) => entry.term))

  const markers = allText.flatMap((text) =>
    parseTermMarkers(text)
      .filter((token) => token.type === 'term')
      .map((token) => token.value),
  )

  it('có marker [[Term]] trong nội dung', () => {
    expect(markers.length).toBeGreaterThan(0)
  })

  // Marker trỏ tới thuật ngữ không tồn tại vẫn dẫn về /glossary (không 404),
  // nhưng người đọc sẽ không thấy định nghĩa nào — coi như lỗi nội dung.
  it('mọi marker trỏ tới thuật ngữ có thật trong glossary', () => {
    const missing = Array.from(new Set(markers.filter((term) => !glossaryTerms.has(term))))
    expect(missing).toEqual([])
  })

  // Kiểm toàn bộ 13 buổi chứ không chỉ buổi đã viết nội dung: relatedTerms là
  // metadata, khai báo sẵn từ M1 nên sai được ngay cả khi bài còn rỗng.
  it('mọi relatedTerms của MỌI buổi trỏ tới thuật ngữ có thật trong glossary', () => {
    const missing = LESSONS.flatMap((lesson) =>
      (lesson.relatedTerms ?? []).filter((term) => !glossaryTerms.has(term)),
    )
    expect(Array.from(new Set(missing))).toEqual([])
  })
})
