import { describe, expect, it } from 'vitest'
import { clampZoom, MAX_ZOOM, svgNaturalWidth } from './svg-size'

describe('svgNaturalWidth', () => {
  it('ưu tiên thuộc tính width của thẻ <svg> gốc', () => {
    expect(
      svgNaturalWidth(
        '<svg xmlns="http://www.w3.org/2000/svg" width="2109.262" height="510.295" viewBox="0 0 2109.262 510.295"><g/></svg>',
      ),
    ).toBe(2109.262)
  })

  it('không có width → lấy chiều rộng trong viewBox (kể cả cách bằng dấu phẩy)', () => {
    expect(svgNaturalWidth('<svg viewBox="0 0 800 300"></svg>')).toBe(800)
    expect(svgNaturalWidth('<svg viewBox="-10,-10,640,200"></svg>')).toBe(640)
  })

  it('không đọc width của phần tử con hay thuộc tính stroke-width', () => {
    expect(
      svgNaturalWidth('<svg stroke-width="2" viewBox="0 0 24 24"><rect width="999"/></svg>'),
    ).toBe(24)
  })

  it('không xác định được → null', () => {
    expect(svgNaturalWidth('<svg><g/></svg>')).toBeNull()
    expect(svgNaturalWidth('<svg width="100%"></svg>')).toBeNull()
    expect(svgNaturalWidth('<svg viewBox="0 0 0 10"></svg>')).toBeNull()
    expect(svgNaturalWidth('không phải svg')).toBeNull()
  })
})

describe('clampZoom', () => {
  it('sơ đồ rộng hơn màn hình (fit < 1): xuống tối thiểu tới fit, lên tối đa MAX_ZOOM', () => {
    expect(clampZoom(0.1, 0.17)).toBe(0.17)
    expect(clampZoom(10, 0.17)).toBe(MAX_ZOOM)
    expect(clampZoom(1.25, 0.17)).toBe(1.25)
  })

  it('sơ đồ hẹp hơn màn hình (fit > 1): không nhỏ hơn cỡ thật', () => {
    expect(clampZoom(0.5, 1.6)).toBe(1)
    expect(clampZoom(1.6, 1.6)).toBe(1.6)
  })

  it('làm tròn 2 chữ số để nhãn % không nhảy lẻ', () => {
    expect(clampZoom(1.23456, 0.5)).toBe(1.23)
  })
})
