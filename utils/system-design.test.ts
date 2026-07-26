import { describe, expect, it } from 'vitest'
import {
  computeProgressPercent,
  glossaryHref,
  parseCompletedSlugs,
  parseTermMarkers,
  toggleSlug,
} from './system-design'

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

describe('parseTermMarkers', () => {
  it('trả nguyên văn khi không có marker', () => {
    expect(parseTermMarkers('Không có thuật ngữ nào.')).toEqual([
      { type: 'text', value: 'Không có thuật ngữ nào.' },
    ])
  })

  it('tách đúng 3 phần khi marker nằm giữa câu', () => {
    expect(parseTermMarkers('Dùng [[Redis]] để cache.')).toEqual([
      { type: 'text', value: 'Dùng ' },
      { type: 'term', value: 'Redis' },
      { type: 'text', value: ' để cache.' },
    ])
  })

  it('tách đúng khi có nhiều marker', () => {
    expect(parseTermMarkers('[[CAP]] và [[Sharding]] khác nhau')).toEqual([
      { type: 'term', value: 'CAP' },
      { type: 'text', value: ' và ' },
      { type: 'term', value: 'Sharding' },
      { type: 'text', value: ' khác nhau' },
    ])
  })

  it('không sinh đoạn text rỗng khi marker ở đầu và cuối', () => {
    expect(parseTermMarkers('[[CDN]]')).toEqual([{ type: 'term', value: 'CDN' }])
  })

  it('render nguyên văn khi marker không đóng', () => {
    expect(parseTermMarkers('Thiếu dấu đóng [[Redis')).toEqual([
      { type: 'text', value: 'Thiếu dấu đóng [[Redis' },
    ])
  })

  it('không sinh link rỗng với marker rỗng', () => {
    expect(parseTermMarkers('Trống [[]] ở giữa')).toEqual([
      { type: 'text', value: 'Trống [[]] ở giữa' },
    ])
  })

  it('cắt khoảng trắng thừa quanh tên thuật ngữ', () => {
    expect(parseTermMarkers('[[  Redis  ]]')).toEqual([{ type: 'term', value: 'Redis' }])
  })
})

describe('glossaryHref', () => {
  it('tạo href cơ bản', () => {
    expect(glossaryHref('Redis')).toBe('/glossary#Redis')
  })

  // Thuật ngữ có dấu / sẽ phá route nếu không encode — lỗi đã gặp ở feature
  // glossary-index.
  it('encode thuật ngữ chứa dấu gạch chéo và khoảng trắng', () => {
    expect(glossaryHref('Token / JWT')).toBe('/glossary#Token%20%2F%20JWT')
  })

  it('encode thuật ngữ chứa ký tự đặc biệt', () => {
    expect(glossaryHref('C/C++')).toBe('/glossary#C%2FC%2B%2B')
  })
})
