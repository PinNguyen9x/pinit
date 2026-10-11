import { describe, expect, it } from 'vitest'
import type { Post } from '@/models'
import { groupRecentPosts } from './home'

const post = (slug: string, publishedDate: string): Post => ({
  id: slug,
  slug,
  title: `Bài ${slug}`,
  tagList: [],
  description: '',
  publishedDate,
})

describe('groupRecentPosts', () => {
  it('gom bài cùng ngày theo giờ Việt Nam, giữ thứ tự mới → cũ', () => {
    const days = groupRecentPosts(
      [
        post('a', '2026-08-30T16:00:00Z'), // 23:00 ngày 30/08 giờ VN
        post('b', '2026-08-30T09:00:00Z'),
        post('c', '2026-08-29T18:00:00Z'), // 01:00 ngày 30/08 giờ VN — vẫn cùng ngày
        post('d', '2026-08-29T09:00:00Z'),
      ],
      8,
    )
    expect(days.map((d) => d.label)).toEqual(['Chủ Nhật, 30/08', 'Thứ Bảy, 29/08'])
    expect(days[0].entries.map((e) => e.slug)).toEqual(['a', 'b', 'c'])
  })

  it('cắt đúng limit và bỏ bài thiếu slug', () => {
    const days = groupRecentPosts(
      [post('', '2026-08-30T09:00:00Z'), post('a', '2026-08-29T09:00:00Z'), post('b', '2026-08-28T09:00:00Z')],
      1,
    )
    expect(days).toHaveLength(1)
    expect(days[0].entries).toEqual([{ slug: 'a', title: 'Bài a', cover: null, readingMinutes: null }])
  })

  it('thêm năm khi khác năm của bài mới nhất', () => {
    const days = groupRecentPosts(
      [post('a', '2026-01-02T09:00:00Z'), post('b', '2025-12-30T09:00:00Z')],
      8,
    )
    expect(days[0].label).toBe('Thứ Sáu, 02/01')
    expect(days[1].label).toBe('Thứ Ba, 30/12/2025')
  })

  it('bỏ qua bài có ngày không hợp lệ thay vì ném RangeError', () => {
    const days = groupRecentPosts(
      [post('sai', '30/08/2026'), post('rong', ''), post('a', '2026-08-29T09:00:00Z')],
      8,
    )
    expect(days).toHaveLength(1)
    expect(days[0].entries.map((e) => e.slug)).toEqual(['a'])
  })

  it('trỏ ảnh bìa sang bản -card và giữ thời gian đọc', () => {
    const [day] = groupRecentPosts(
      [{ ...post('a', '2026-08-29T09:00:00Z'), thumbnailUrl: '/covers/blog/a.png', readingMinutes: 9 }],
      8,
    )
    expect(day.entries[0]).toMatchObject({ cover: '/covers/blog/a-card.png', readingMinutes: 9 })
  })

  it('không có bài thì trả mảng rỗng', () => {
    expect(groupRecentPosts([], 8)).toEqual([])
  })
})
