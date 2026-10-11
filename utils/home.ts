import { KnowledgeTrack } from '@/constants/tracks'
import { Post } from '@/models'
import { cardImageUrl } from './cover-image'
import { trackKeysForTags } from './tracks'

export interface LogEntry {
  slug: string
  title: string
  /** Bản `-card` của ảnh bìa (640×416) — null khi bài không có bìa. */
  cover: string | null
  readingMinutes: number | null
  /** Key các track bài thuộc về — chip lọc trên trang chủ lọc theo đây. */
  trackKeys: string[]
  /** Khoá ngày YYYY-MM-DD theo giờ Việt Nam. */
  dayKey: string
  /** Ví dụ "Chủ Nhật, 30/08". Thêm năm khi khác năm của bài mới nhất. */
  dayLabel: string
}

export interface LogDay {
  key: string
  label: string
  entries: LogEntry[]
}

export interface FeaturedPost {
  slug: string
  title: string
  /** `description` trong frontmatter; rỗng nếu bài không viết. */
  summary: string
  /**
   * Bản `-card` của ảnh bìa, như ảnh thu nhỏ trong danh sách. Không dùng bản OG
   * 1200×630: bản đó in sẵn tag chữ hoa và "N min read" tiếng Anh lên ảnh,
   * trùng với dòng meta ngay bên cạnh.
   */
  cover: string | null
  readingMinutes: number | null
  dayLabel: string
  /** Tên track đầu tiên bài thuộc về, null nếu không khớp track nào. */
  trackTitle: string | null
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

// Ngày sai trong frontmatter (vd. `date: 30/08/2026`) cho ra Invalid Date, và
// Intl.DateTimeFormat.format ném RangeError với nó — một bài gõ sai ngày sẽ
// làm getStaticProps trang chủ fail, kéo cả build fail. Bỏ qua bài đó.
function isListable(post: Post) {
  return Boolean(post.slug) && !Number.isNaN(Date.parse(post.publishedDate))
}

function dayLabelOf(date: Date, newestYear: string) {
  const year = yearFormat.format(date)
  return labelFormat.format(date) + (year === newestYear ? '' : `/${year}`)
}

/**
 * Chia danh sách bài thành bài nổi bật (mới nhất) và tối đa `limit` bài kế
 * tiếp, đã định dạng ngày sẵn.
 *
 * Chạy trong getStaticProps chứ không ở client: định dạng ngày phụ thuộc múi
 * giờ, để client tự format thì máy ở múi giờ khác sẽ lệch ngày so với HTML
 * server và React báo hydration mismatch. Client chỉ lọc rồi gom lại bằng
 * groupByDay, không đụng tới Intl. `postList` phải đã sort mới → cũ
 * (getPostList làm sẵn).
 */
export function buildHomeFeed(
  postList: Post[],
  tracks: KnowledgeTrack[],
  limit: number,
): { featured: FeaturedPost | null; entries: LogEntry[] } {
  const listable = postList.filter(isListable)
  if (listable.length === 0) return { featured: null, entries: [] }

  const newestYear = yearFormat.format(new Date(listable[0].publishedDate))
  const [first, ...rest] = listable
  const firstTrackKey = trackKeysForTags(tracks, first.tagList)[0]

  const featured: FeaturedPost = {
    slug: first.slug,
    title: first.title,
    summary: first.summary || '',
    // null chứ không undefined: props của getStaticProps phải serialize được JSON.
    cover: cardImageUrl(first.thumbnailUrl) || null,
    readingMinutes: first.readingMinutes ?? null,
    dayLabel: dayLabelOf(new Date(first.publishedDate), newestYear),
    trackTitle: tracks.find((t) => t.key === firstTrackKey)?.title ?? null,
  }

  const entries = rest.slice(0, limit).map((post): LogEntry => {
    const date = new Date(post.publishedDate)
    return {
      slug: post.slug,
      title: post.title,
      cover: cardImageUrl(post.thumbnailUrl) || null,
      readingMinutes: post.readingMinutes ?? null,
      trackKeys: trackKeysForTags(tracks, post.tagList),
      dayKey: dayKeyFormat.format(date),
      dayLabel: dayLabelOf(date, newestYear),
    }
  })

  return { featured, entries }
}

/** Gom các bài liên tiếp cùng ngày. Thuần, không Intl — chạy được ở client. */
export function groupByDay(entries: LogEntry[]): LogDay[] {
  const days: LogDay[] = []
  for (const entry of entries) {
    const last = days[days.length - 1]
    if (last && last.key === entry.dayKey) last.entries.push(entry)
    else days.push({ key: entry.dayKey, label: entry.dayLabel, entries: [entry] })
  }
  return days
}

/**
 * Chọn `size` thuật ngữ cho ô "Thuật ngữ ngẫu nhiên", xoay theo ngày: cùng một
 * ngày (giờ Việt Nam) ra cùng một bộ, qua ngày đổi bộ — trang chủ ISR 60s nên
 * tự đổi mà không cần deploy. Chọn ở server để HTML server và client khớp
 * nhau (random ở client sẽ lệch hydration).
 */
export function pickTermSample<T extends { term: string; short: string }>(
  glossary: T[],
  size: number,
  now: Date,
): { term: string; short: string }[] {
  const usable = glossary.filter((t) => t.short)
  if (usable.length === 0) return []
  const day = Number(dayKeyFormat.format(now).replace(/-/g, ''))
  // Bước nhảy là số nguyên tố không chia hết độ dài danh sách (nên nguyên tố
  // cùng nhau với nó): đi hết một vòng mới lặp, và rải khắp glossary thay vì 12
  // từ liền nhau theo bảng chữ cái.
  const step = [7, 11, 13, 17, 19, 23].find((p) => usable.length % p !== 0) ?? 1
  const start = day % usable.length
  return Array.from({ length: Math.min(size, usable.length) }, (_, i) => {
    const t = usable[(start + i * step) % usable.length]
    return { term: t.term, short: t.short }
  })
}
