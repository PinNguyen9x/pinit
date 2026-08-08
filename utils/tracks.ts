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
