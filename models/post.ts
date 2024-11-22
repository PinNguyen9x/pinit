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
  publishedDate: string
  slug: string
  author?: Author
  mdContent?: string
  htmlContent?: string
  thumbnailUrl?: string
}
