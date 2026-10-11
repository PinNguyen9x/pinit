import { Post } from '@/models'

export interface LogEntry {
  slug: string
  title: string
}

export interface LogDay {
  /** Khoá ngày YYYY-MM-DD theo giờ Việt Nam — dùng làm React key. */
  key: string
  /** Ví dụ "Chủ Nhật, 30/08". Thêm năm khi khác năm của bài mới nhất. */
  label: string
  entries: LogEntry[]
}

const TIME_ZONE = 'Asia/Ho_Chi_Minh'
const dayKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })
const yearFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric' })
const labelFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
})

/**
 * Gom `limit` bài mới nhất thành các ngày cho khối nhật ký trang chủ.
 *
 * Chạy trong getStaticProps chứ không ở client: định dạng ngày phụ thuộc múi
 * giờ, để client tự format thì máy ở múi giờ khác sẽ lệch ngày so với HTML
 * server và React báo hydration mismatch. `postList` phải đã sort mới → cũ
 * (getPostList làm sẵn).
 */
export function groupRecentPosts(postList: Post[], limit: number): LogDay[] {
  // Ngày sai trong frontmatter (vd. `date: 30/08/2026`) cho ra Invalid Date, và
  // Intl.DateTimeFormat.format ném RangeError với nó — một bài gõ sai ngày sẽ
  // làm getStaticProps trang chủ fail, kéo cả build fail. Bỏ qua bài đó.
  const recent = postList
    .filter((post) => post.slug && !Number.isNaN(Date.parse(post.publishedDate)))
    .slice(0, limit)
  if (recent.length === 0) return []

  const newestYear = yearFormat.format(new Date(recent[0].publishedDate))
  const days: LogDay[] = []

  for (const post of recent) {
    const date = new Date(post.publishedDate)
    const key = dayKeyFormat.format(date)
    let day = days[days.length - 1]
    if (!day || day.key !== key) {
      const year = yearFormat.format(date)
      const label = labelFormat.format(date) + (year === newestYear ? '' : `/${year}`)
      day = { key, label, entries: [] }
      days.push(day)
    }
    day.entries.push({ slug: post.slug, title: post.title })
  }

  return days
}
