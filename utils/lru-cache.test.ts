import { describe, expect, it } from 'vitest'
import { createLruCache } from './lru-cache'

describe('createLruCache', () => {
  it('đuổi entry ít dùng gần đây nhất khi vượt giới hạn', () => {
    const c = createLruCache<number>(2)
    c.set('a', 1)
    c.set('b', 2)
    c.get('a') // a thành mới nhất → b là cũ nhất
    c.set('c', 3)
    expect(c.get('b')).toBeUndefined()
    expect(c.get('a')).toBe(1)
    expect(c.get('c')).toBe(3)
    expect(c.size).toBe(2)
  })

  it('set lại key cũ không làm tăng size', () => {
    const c = createLruCache<number>(2)
    c.set('a', 1)
    c.set('a', 2)
    expect(c.size).toBe(1)
    expect(c.get('a')).toBe(2)
  })
})
