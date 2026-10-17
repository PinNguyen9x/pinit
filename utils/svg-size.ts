// Kích thước SVG mermaid dựng sẵn (utils/diagram.ts) — logic thuần cho dialog phóng to sơ đồ.

/** Phóng tối đa: gấp 3 cỡ thật. */
export const MAX_ZOOM = 3

/** Chiều rộng gốc của SVG từ thuộc tính width, hoặc viewBox. Không đọc được → null. */
export function svgNaturalWidth(svg: string): number | null {
  const tag = svg.match(/<svg\b[^>]*>/)?.[0] ?? ''
  const width = Number(tag.match(/\swidth="([\d.]+)"/)?.[1])
  if (width > 0) return width
  const box = tag
    .match(/\sviewBox="([^"]*)"/)?.[1]
    .trim()
    .split(/[\s,]+/)
  const vbWidth = Number(box?.[2])
  return box?.length === 4 && vbWidth > 0 ? vbWidth : null
}

/**
 * Kẹp mức zoom (1 = cỡ thật) vào [min(fit, 1), MAX_ZOOM], làm tròn 2 chữ số.
 * `fit` = mức để sơ đồ vừa khít chiều rộng màn hình; không cho nhỏ hơn mức đó
 * (hoặc nhỏ hơn cỡ thật, với sơ đồ vốn đã hẹp hơn màn hình).
 */
export function clampZoom(zoom: number, fit: number): number {
  const z = Math.min(MAX_ZOOM, Math.max(Math.min(fit, 1), zoom))
  return Math.round(z * 100) / 100
}
