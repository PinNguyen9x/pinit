import { KnowledgeTrack } from '@/constants/tracks'

export interface TrackWithCount extends KnowledgeTrack {
  count: number
}

/**
 * Đếm số bài thuộc mỗi track. Một bài có thể thuộc nhiều track (tag chồng nhau)
 * nên tổng các count có thể lớn hơn tổng số bài — đó là chủ ý, mỗi card nói về
 * track của nó chứ không chia phần.
 *
 * Track không có bài nào bị loại bỏ, để không render card rỗng.
 */
/**
 * Key của các track mà một bài thuộc về — cùng luật khớp tag (không phân biệt
 * hoa thường) với countPostsByTrack, để chip lọc trang chủ lọc ra đúng tập bài
 * mà con số trên chip đếm.
 */
export function trackKeysForTags(tracks: KnowledgeTrack[], tags: string[] | undefined): string[] {
  const tagSet = new Set((tags ?? []).map((t) => t.toLowerCase()))
  return tracks
    .filter((track) => track.tags.some((t) => tagSet.has(t.toLowerCase())))
    .map((track) => track.key)
}

export function countPostsByTrack(
  tracks: KnowledgeTrack[],
  postTagLists: (string[] | undefined)[],
): TrackWithCount[] {
  const normalized = postTagLists.map(
    (tags) => new Set((tags ?? []).map((t) => t.toLowerCase())),
  )

  return tracks
    .map((track) => {
      const keys = track.tags.map((t) => t.toLowerCase())
      const count = normalized.filter((tagSet) => keys.some((k) => tagSet.has(k))).length
      return { ...track, count }
    })
    .filter((track) => track.count > 0)
}
