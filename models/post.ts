export interface Author {
  title: string
  name: string
  avatarUrl: string
  profileUrl: string
}
export interface Post {
  id: string
  title: string
  tagList: string[]
  description: string
  /** `description` viết tay trong frontmatter — khác `description` (excerpt cắt từ thân bài). */
  summary?: string
  publishedDate: string
  slug: string
  author?: Author
  mdContent?: string
  htmlContent?: string
  thumbnailUrl?: string
  readingMinutes?: number
}
