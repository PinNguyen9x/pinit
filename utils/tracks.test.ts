import { describe, expect, it } from 'vitest'
import { KnowledgeTrack } from '../constants/tracks'
import { countPostsByTrack } from './tracks'

const TRACKS: KnowledgeTrack[] = [
  { key: 'a', title: 'A', blurb: '', tags: ['Kafka', 'Redis'] },
  { key: 'b', title: 'B', blurb: '', tags: ['ReactJS'] },
  { key: 'c', title: 'C', blurb: '', tags: ['Rust'] },
]

describe('countPostsByTrack', () => {
  it('đếm bài khớp bất kỳ tag nào của track', () => {
    const result = countPostsByTrack(TRACKS, [['Kafka'], ['Redis', 'Cache'], ['ReactJS']])
    expect(result.find((t) => t.key === 'a')?.count).toBe(2)
    expect(result.find((t) => t.key === 'b')?.count).toBe(1)
  })

  it('không phân biệt hoa thường', () => {
    const result = countPostsByTrack(TRACKS, [['kafka'], ['REACTJS']])
    expect(result.find((t) => t.key === 'a')?.count).toBe(1)
    expect(result.find((t) => t.key === 'b')?.count).toBe(1)
  })

  it('bỏ track không có bài nào để khỏi render card rỗng', () => {
    const result = countPostsByTrack(TRACKS, [['Kafka']])
    expect(result.map((t) => t.key)).toEqual(['a'])
  })

  it('một bài thuộc nhiều track thì được đếm ở cả hai', () => {
    const result = countPostsByTrack(TRACKS, [['Kafka', 'ReactJS']])
    expect(result.find((t) => t.key === 'a')?.count).toBe(1)
    expect(result.find((t) => t.key === 'b')?.count).toBe(1)
  })

  it('chịu được bài thiếu tag', () => {
    expect(() => countPostsByTrack(TRACKS, [undefined, []])).not.toThrow()
    expect(countPostsByTrack(TRACKS, [undefined, []])).toEqual([])
  })
})
