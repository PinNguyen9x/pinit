import { describe, expect, it } from 'vitest'
import { findRelatedPosts } from './related-posts'

const POSTS = [
  { slug: 'a', title: 'Kafka A–Z', tagList: ['Kafka', 'Architecture'], readingMinutes: 12 },
  { slug: 'b', title: 'Docker CI', tagList: ['Docker', 'CI/CD'], readingMinutes: 5 },
  { slug: 'c', title: 'Kafka + Docker', tagList: ['Kafka', 'Docker'], readingMinutes: 8 },
]

// Sát với dữ liệu thật: bài Kafka mang thêm tag stack chung chung nên khớp
// với mọi project backend dù nội dung không liên quan.
const KAFKA_OVER_TAGGED = {
  slug: 'kafka-kb',
  title: 'Apache Kafka Complete Knowledge Base',
  tagList: ['Kafka', 'Architecture', 'NodeJS', 'Docker', 'TypeScript'],
  readingMinutes: 25,
}

describe('findRelatedPosts', () => {
  it('trả bài có tag trùng', () => {
    const result = findRelatedPosts(['Kafka'], POSTS)
    expect(result.map((p) => p.slug).sort()).toEqual(['a', 'c'])
  })

  it('bài trùng nhiều tag xếp trước', () => {
    const result = findRelatedPosts(['Kafka', 'Docker'], POSTS)
    expect(result[0].slug).toBe('c')
    expect(result[0].matchedTags).toEqual(['Kafka', 'Docker'])
  })

  it('không phân biệt hoa thường', () => {
    expect(findRelatedPosts(['kafka'], POSTS).map((p) => p.slug)).toContain('a')
  })

  it('work không có tag thì trả rỗng, không đoán bừa', () => {
    expect(findRelatedPosts(undefined, POSTS)).toEqual([])
    expect(findRelatedPosts([], POSTS)).toEqual([])
  })

  it('không tag nào khớp thì trả rỗng để trang ẩn mục này', () => {
    expect(findRelatedPosts(['Rust'], POSTS)).toEqual([])
  })

  it('trùng mỗi tag stack thì không tính là liên quan', () => {
    // Project backend kiểu Json-Server: chung NodeJS + Docker + TypeScript với
    // bài Kafka, nhưng nội dung không dính gì nhau.
    const work = ['NodeJS', 'ExpressJS', 'JWT', 'Docker', 'TypeScript']
    expect(findRelatedPosts(work, [KAFKA_OVER_TAGGED])).toEqual([])
  })

  it('vẫn nhận bài khi có tag chủ đề trùng, dù kèm tag stack', () => {
    // Project pinit: trùng CI/CD (chủ đề) nên bài CI/CD được nhận.
    const work = ['NextJS', 'TypeScript', 'Docker', 'CI/CD', 'Jenkins']
    expect(findRelatedPosts(work, POSTS).map((p) => p.slug)).toEqual(['b'])
  })

  it('project về Kafka vẫn thấy bài Kafka — tag chủ đề vẫn tính', () => {
    expect(findRelatedPosts(['Kafka', 'Docker'], [KAFKA_OVER_TAGGED])).toHaveLength(1)
  })

  it('giới hạn số bài trả về', () => {
    expect(findRelatedPosts(['Kafka', 'Docker'], POSTS, 1)).toHaveLength(1)
  })

  it('bỏ bài thiếu slug hoặc title', () => {
    const broken = [{ title: 'không slug', tagList: ['Kafka'] }, { slug: 'x', tagList: ['Kafka'] }]
    expect(findRelatedPosts(['Kafka'], broken)).toEqual([])
  })

  it('chỉ trả field cần render, không kèm nội dung bài', () => {
    const withBody = [{ ...POSTS[0], mdContent: 'x'.repeat(50_000) }]
    expect(Object.keys(findRelatedPosts(['Kafka'], withBody)[0]).sort()).toEqual([
      'matchedTags',
      'readingMinutes',
      'slug',
      'title',
    ])
  })
})
