// Kiểu dữ liệu cho trang học System Design Interview (lộ trình 13 buổi).
// Xem docs/ai/design/2026-07-26-feature-system-design.md

/** Nhóm buổi học — dùng để tô màu và gom nhóm ở trang lộ trình. */
export const LESSON_TRACKS = [
  'Nền tảng',
  'Kiến thức lõi',
  'Framework',
  'Case study',
  'Luyện tập',
] as const

export type LessonTrack = (typeof LESSON_TRACKS)[number]

/** Bảng so sánh / đánh đổi trong bài. */
export interface LessonTable {
  headers: string[]
  rows: string[][]
}

/** Một khối nội dung trong bài. */
export interface LessonSection {
  heading: string
  /**
   * Các đoạn văn tiếng Việt. Thuật ngữ bọc trong [[Term]] sẽ được render
   * thành link sang /glossary#Term.
   */
  body: string[]
  table?: LessonTable
  /** Mã mermaid; render client-side qua use-mermaid. */
  diagram?: string
  /** Ý cần nhớ, hiện dưới dạng callout. */
  callout?: string
}

/** Thẻ tự kiểm tra: câu hỏi phỏng vấn + gợi ý trả lời. */
export interface Flashcard {
  question: string
  answer: string
  /** Bẫy thường gặp khi trả lời câu này. */
  pitfall?: string
}

export interface Lesson {
  /** Số thứ tự buổi 1..13 — quyết định thứ tự hiển thị. */
  order: number
  /**
   * Slug URL, kebab-case. KHÔNG được trùng tên file tĩnh cùng thư mục
   * (`cheat-sheet`, `index`) vì Pages Router ưu tiên file tĩnh hơn [slug].
   */
  slug: string
  title: string
  /** Một câu mô tả cho trang lộ trình. */
  summary: string
  track: LessonTrack
  /** Từ khóa phục vụ search ở trang lộ trình. */
  keywords: string[]
  /** Ước lượng thời gian ôn, phút. */
  readingMinutes: number
  sections: LessonSection[]
  flashcards: Flashcard[]
  /** Một dòng chốt, dùng lại ở trang cheat-sheet. */
  keyTakeaway: string
  /** Thuật ngữ liên quan, link sang /glossary#term. */
  relatedTerms?: string[]
  /**
   * Có mục này thì trang chi tiết render thêm khối tự luyện mock interview:
   * khung thời gian từ INTERVIEW_STEPS và danh sách đề bài kèm tiêu chí chấm.
   */
  mockPrompts?: MockPrompt[]
}

/** Một bước trong khung trả lời phỏng vấn 45 phút. */
export interface InterviewStep {
  order: number
  name: string
  /** Số phút nên dành cho bước này. */
  minutes: number
  checklist: string[]
}

/** Đề bài tự luyện mock interview. */
export interface MockPrompt {
  title: string
  requirements: string[]
  /** Tiêu chí tự chấm sau khi trình bày. */
  rubric: string[]
}

/** Bảng tra nhanh trên trang cheat sheet. */
export interface CheatSheetTable {
  title: string
  /** Một câu giải thích khi nào dùng bảng này. */
  hint?: string
  headers: string[]
  rows: string[][]
}
