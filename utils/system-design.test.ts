import { describe, expect, it } from 'vitest'
import { computeProgressPercent, parseCompletedSlugs, toggleSlug } from './system-design'

const KNOWN = ['buoi-1', 'buoi-2', 'buoi-3']

describe('parseCompletedSlugs', () => {
  it('trả mảng rỗng khi chưa có gì lưu', () => {
    expect(parseCompletedSlugs(null, KNOWN)).toEqual([])
  })

  it('đọc đúng mảng slug đã lưu', () => {
    expect(parseCompletedSlugs('["buoi-1","buoi-3"]', KNOWN)).toEqual(['buoi-1', 'buoi-3'])
  })

  it('bỏ qua giá trị không phải JSON hợp lệ', () => {
    expect(parseCompletedSlugs('không phải json', KNOWN)).toEqual([])
  })

  it('bỏ qua JSON hợp lệ nhưng không phải mảng', () => {
    expect(parseCompletedSlugs('{"buoi-1":true}', KNOWN)).toEqual([])
  })

  it('lọc bỏ phần tử không phải chuỗi', () => {
    expect(parseCompletedSlugs('["buoi-1",42,null,"buoi-2"]', KNOWN)).toEqual(['buoi-1', 'buoi-2'])
  })

  // Buổi bị xóa khỏi lộ trình nhưng slug vẫn nằm trong localStorage của người
  // dùng — nếu không lọc thì percent có thể vượt quá 100.
  it('lọc bỏ slug không còn tồn tại trong lộ trình', () => {
    expect(parseCompletedSlugs('["buoi-1","buoi-da-xoa"]', KNOWN)).toEqual(['buoi-1'])
  })

  it('loại bỏ slug trùng lặp', () => {
    expect(parseCompletedSlugs('["buoi-1","buoi-1"]', KNOWN)).toEqual(['buoi-1'])
  })
})

describe('toggleSlug', () => {
  it('thêm slug chưa có', () => {
    expect(toggleSlug(['buoi-1'], 'buoi-2')).toEqual(['buoi-1', 'buoi-2'])
  })

  it('gỡ slug đã có', () => {
    expect(toggleSlug(['buoi-1', 'buoi-2'], 'buoi-1')).toEqual(['buoi-2'])
  })

  it('không sửa mảng gốc', () => {
    const original = ['buoi-1']
    toggleSlug(original, 'buoi-2')
    expect(original).toEqual(['buoi-1'])
  })
})

describe('computeProgressPercent', () => {
  it('0 buổi hoàn thành là 0%', () => {
    expect(computeProgressPercent(0, 13)).toBe(0)
  })

  it('làm tròn 3/13 thành 23%', () => {
    expect(computeProgressPercent(3, 13)).toBe(23)
  })

  it('hoàn thành hết là 100%', () => {
    expect(computeProgressPercent(13, 13)).toBe(100)
  })

  it('trả 0 khi tổng số buổi là 0, không chia cho 0', () => {
    expect(computeProgressPercent(0, 0)).toBe(0)
  })

  it('chặn trên ở 100% kể cả khi đếm vượt tổng', () => {
    expect(computeProgressPercent(20, 13)).toBe(100)
  })
})
