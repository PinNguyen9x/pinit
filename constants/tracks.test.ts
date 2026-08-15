import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { countPostsByTrack } from '../utils/tracks'
import { KNOWLEDGE_TRACKS } from './tracks'

/**
 * Chặn tái phát một lỗi đã ship: card Knowledge Tracks ở trang chủ đếm theo CẢ
 * CỤM tag của track, nhưng link lại lọc blog theo MỘT tag lẻ (`filterTag`).
 * Kết quả: card ghi "14 bài", bấm vào chỉ ra 11 — sai ở 4/5 track.
 *
 * Không công cụ nào bắt được: cả hai phía đều chạy đúng phần việc của mình,
 * chỉ khi so hai con số với nhau mới lộ. Nay `/blog?track=<key>` lọc bằng đúng
 * cụm `tags` mà card dùng để đếm, nên hai số bằng nhau theo thiết kế.
 */

const BLOG_DIR = join(__dirname, '..', 'blog')

function readPostTags(): string[][] {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(BLOG_DIR, f), 'utf8')
      const fm = /^---([\s\S]*?)---/.exec(raw)?.[1] ?? ''
      const tags = /^tags:\s*\[(.*?)\]/m.exec(fm)?.[1] ?? ''
      return tags
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    })
}

describe('KNOWLEDGE_TRACKS khớp với dữ liệu blog thật', () => {
  const postTags = readPostTags()

  it('không track nào rỗng — card rỗng là dấu hiệu tag viết sai', () => {
    const counted = countPostsByTrack(KNOWLEDGE_TRACKS, postTags)
    expect(counted.map((t) => t.key).sort()).toEqual(KNOWLEDGE_TRACKS.map((t) => t.key).sort())
  })

  it('mỗi tag khai trong track phải tồn tại ở ít nhất một bài', () => {
    const real = new Set(postTags.flat().map((t) => t.toLowerCase()))
    const orphan = KNOWLEDGE_TRACKS.flatMap((track) =>
      track.tags.filter((t) => !real.has(t.toLowerCase())).map((t) => `${track.key}:${t}`),
    )
    expect(orphan).toEqual([])
  })

  it('key của track là duy nhất — /blog?track= tra theo key', () => {
    const keys = KNOWLEDGE_TRACKS.map((t) => t.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('số trên card bằng số bài lọc ra khi bấm vào track', () => {
    const counted = countPostsByTrack(KNOWLEDGE_TRACKS, postTags)
    for (const track of counted) {
      // Đúng phép lọc mà pages/blog/index.tsx thực hiện cho ?track=<key>.
      const wanted = new Set(track.tags.map((t) => t.toLowerCase()))
      const filtered = postTags.filter((tags) => tags.some((t) => wanted.has(t.toLowerCase())))
      expect(filtered.length, `track "${track.key}"`).toBe(track.count)
    }
  })
})
