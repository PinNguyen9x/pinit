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
 * Tag mô tả stack chứ không mô tả chủ đề. Dùng chung Docker hay TypeScript
 * không có nghĩa hai thứ liên quan nhau: bài "Apache Kafka Complete Knowledge
 * Base" gắn [NodeJS, Docker, TypeScript] nên khớp với mọi project backend,
 * trong khi nội dung chẳng dính gì tới chúng.
 *
 * Chấm điểm theo độ hiếm của tag không cứu được: NodeJS chỉ có 2 bài mà cả
 * hai đều là bài Kafka, nên nó luôn thắng. Phải phân biệt theo loại tag.
 */
const STACK_ONLY_TAGS = new Set(
  ['TypeScript', 'JavaScript', 'NodeJS', 'Docker', 'Web', 'React', 'ReactJS'].map((t) =>
    t.toLowerCase(),
  ),
)

/**
 * Bài blog liên quan tới một project: khớp theo tag, nhiều tag trùng thì xếp
 * trước. Không có bài nào khớp thì trả mảng rỗng để trang ẩn hẳn mục này —
 * thà không có còn hơn gợi ý sai.
 *
 * Phải trùng ít nhất một tag CHỦ ĐỀ; trùng mỗi tag stack thì không tính là
 * liên quan.
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
    .filter(
      (entry) =>
        entry.matchedTags.some((t) => !STACK_ONLY_TAGS.has(t.toLowerCase())) &&
        entry.post.slug &&
        entry.post.title,
    )
    .sort((a, b) => b.matchedTags.length - a.matchedTags.length)
    .slice(0, limit)
    .map((entry) => ({
      slug: entry.post.slug as string,
      title: entry.post.title as string,
      readingMinutes: entry.post.readingMinutes ?? 1,
      matchedTags: entry.matchedTags,
    }))
}
