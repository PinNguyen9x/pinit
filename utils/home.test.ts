import { describe, expect, it } from 'vitest'
import type { KnowledgeTrack } from '@/constants/tracks'
import type { Post } from '@/models'
import { buildHomeFeed, groupByDay } from './home'

const post = (slug: string, publishedDate: string, extra: Partial<Post> = {}): Post => ({
  id: slug,
  slug,
  title: `Bài ${slug}`,
  tagList: [],
  description: '',
  publishedDate,
  ...extra,
})

const TRACKS: KnowledgeTrack[] = [
  { key: 'git', title: 'Terminal & Git', blurb: '', tags: ['Git'] },
  { key: 'ai', title: 'AI & Claude Code', blurb: '', tags: ['AI', 'Claude'] },
]

describe('buildHomeFeed', () => {
  it('lấy bài mới nhất làm bài nổi bật, phần còn lại thành danh sách', () => {
    const { featured, entries } = buildHomeFeed(
      [
        post('a', '2026-08-30T16:00:00Z', {
          summary: 'Tóm tắt viết tay',
          thumbnailUrl: '/covers/blog/a.png',
          readingMinutes: 8,
          tagList: ['git', 'Claude'],
        }),
        post('b', '2026-08-30T09:00:00Z'),
      ],
      TRACKS,
      8,
    )
    expect(featured).toEqual({
      slug: 'a',
      title: 'Bài a',
      summary: 'Tóm tắt viết tay',
      cover: '/covers/blog/a-card.png',
      readingMinutes: 8,
      dayLabel: 'Chủ Nhật, 30/08',
      trackTitle: 'Terminal & Git', // track đầu tiên khớp, không phân biệt hoa thường
    })
    expect(entries.map((e) => e.slug)).toEqual(['b'])
  })

  it('gắn track key, ảnh -card và ngày theo giờ Việt Nam cho từng bài', () => {
    const { entries } = buildHomeFeed(
      [
        post('new', '2026-09-01T09:00:00Z'),
        post('c', '2026-08-29T18:00:00Z', {
          // 01:00 ngày 30/08 giờ VN
          thumbnailUrl: '/covers/blog/c.png',
          readingMinutes: 9,
          tagList: ['AI', 'Git'],
        }),
      ],
      TRACKS,
      8,
    )
    expect(entries[0]).toEqual({
      slug: 'c',
      title: 'Bài c',
      cover: '/covers/blog/c-card.png',
      readingMinutes: 9,
      trackKeys: ['git', 'ai'],
      dayKey: '2026-08-30',
      dayLabel: 'Chủ Nhật, 30/08',
    })
  })

  it('cắt danh sách đúng limit, không tính bài nổi bật', () => {
    const { entries } = buildHomeFeed(
      ['a', 'b', 'c', 'd'].map((s, i) => post(s, `2026-08-2${9 - i}T09:00:00Z`)),
      TRACKS,
      2,
    )
    expect(entries.map((e) => e.slug)).toEqual(['b', 'c'])
  })

  it('bỏ qua bài thiếu slug hoặc ngày không hợp lệ thay vì ném RangeError', () => {
    const { featured, entries } = buildHomeFeed(
      [post('sai', '30/08/2026'), post('', '2026-08-30T09:00:00Z'), post('a', '2026-08-29T09:00:00Z')],
      TRACKS,
      8,
    )
    expect(featured?.slug).toBe('a')
    expect(entries).toEqual([])
  })

  it('thêm năm vào nhãn ngày khi khác năm của bài mới nhất', () => {
    const { featured, entries } = buildHomeFeed(
      [post('a', '2026-01-02T09:00:00Z'), post('b', '2025-12-30T09:00:00Z')],
      TRACKS,
      8,
    )
    expect(featured?.dayLabel).toBe('Thứ Sáu, 02/01')
    expect(entries[0].dayLabel).toBe('Thứ Ba, 30/12/2025')
  })

  it('không có bài thì không có bài nổi bật', () => {
    expect(buildHomeFeed([], TRACKS, 8)).toEqual({ featured: null, entries: [] })
  })
})

describe('groupByDay', () => {
  it('gom bài liên tiếp cùng ngày, giữ thứ tự', () => {
    const { entries } = buildHomeFeed(
      [
        post('new', '2026-09-01T09:00:00Z'),
        post('a', '2026-08-30T16:00:00Z'),
        post('b', '2026-08-30T09:00:00Z'),
        post('c', '2026-08-29T09:00:00Z'),
      ],
      TRACKS,
      8,
    )
    const days = groupByDay(entries)
    expect(days.map((d) => d.label)).toEqual(['Chủ Nhật, 30/08', 'Thứ Bảy, 29/08'])
    expect(days[0].entries.map((e) => e.slug)).toEqual(['a', 'b'])
  })

  it('sau khi lọc vẫn gom đúng các bài còn lại', () => {
    const { entries } = buildHomeFeed(
      [
        post('new', '2026-09-01T09:00:00Z'),
        post('a', '2026-08-30T16:00:00Z', { tagList: ['Git'] }),
        post('b', '2026-08-30T09:00:00Z'),
        post('c', '2026-08-29T09:00:00Z', { tagList: ['Git'] }),
      ],
      TRACKS,
      8,
    )
    const days = groupByDay(entries.filter((e) => e.trackKeys.includes('git')))
    expect(days.map((d) => d.entries.map((e) => e.slug))).toEqual([['a'], ['c']])
  })
})
