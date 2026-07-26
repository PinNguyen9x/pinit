import { describe, expect, it } from 'vitest'
import { GLOSSARY } from './glossary'
import { LESSONS } from './system-design'
import { parseTermMarkers } from '@/utils/system-design'

// Chuẩn nội dung cho một buổi đã biên soạn xong. Danh sách SLUGS_DA_VIET mở
// rộng dần theo milestone; tới M6 phải chứa đủ buổi 1-12.
const SLUGS_DA_VIET = ['nguyen-ly-cap-microservices']

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

describe('cross-link sang glossary', () => {
  const glossaryTerms = new Set(GLOSSARY.map((entry) => entry.term))

  /** Mọi chuỗi văn bản có thể chứa marker [[Term]] trong các buổi đã viết. */
  const allText = written.flatMap((lesson) =>
    lesson.sections.flatMap((section) => [
      ...section.body,
      section.callout ?? '',
      ...(section.table?.rows.flat() ?? []),
      ...lesson.flashcards.flatMap((card) => [card.answer, card.pitfall ?? '']),
    ]),
  )

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

  it('mọi relatedTerms trỏ tới thuật ngữ có thật trong glossary', () => {
    const missing = written.flatMap((lesson) =>
      (lesson.relatedTerms ?? []).filter((term) => !glossaryTerms.has(term)),
    )
    expect(Array.from(new Set(missing))).toEqual([])
  })
})
