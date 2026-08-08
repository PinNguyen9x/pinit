export interface RelatedPost {
  slug: string
  title: string
  readingMinutes: number
  matchedTags: string[]
}

interface PostLike {
  slug?: string
  title?: string
  tagList?: string[]
  readingMinutes?: number
}

/**
 * Bài blog liên quan tới một project: khớp theo tag, nhiều tag trùng thì xếp
 * trước. Không có bài nào khớp thì trả mảng rỗng để trang ẩn hẳn mục này —
 * thà không có còn hơn gợi ý sai.
 *
 * Chỉ trả đúng field cần render: mdContent của 30 bài mà lọt vào props sẽ
 * phình __NEXT_DATA__ lên hàng trăm KB.
 */
export function findRelatedPosts(
  workTags: string[] | undefined,
  posts: PostLike[],
  limit = 3,
): RelatedPost[] {
  const wanted = new Set((workTags ?? []).map((t) => t.toLowerCase()))
  if (wanted.size === 0) return []

  return posts
    .map((post) => ({
      post,
      matchedTags: (post.tagList ?? []).filter((t) => wanted.has(t.toLowerCase())),
    }))
    .filter((entry) => entry.matchedTags.length > 0 && entry.post.slug && entry.post.title)
    .sort((a, b) => b.matchedTags.length - a.matchedTags.length)
    .slice(0, limit)
    .map((entry) => ({
      slug: entry.post.slug as string,
      title: entry.post.title as string,
      readingMinutes: entry.post.readingMinutes ?? 1,
      matchedTags: entry.matchedTags,
    }))
}
