/**
 * Sinh bộ favicon từ MỘT nguồn vector duy nhất: `public/favicon.svg`.
 *
 *  - `favicon.ico`          16+32+48, cho tab trình duyệt cũ và bookmark Windows
 *  - `apple-touch-icon.png` 180x180,  iOS "Add to Home Screen"
 *  - `icon-192.png`         192x192,  manifest PWA
 *  - `icon-512.png`         512x512,  manifest PWA + splash Android
 *
 * Vì sao vẫn giữ `.ico` khi đã có SVG: Safari và các bản Edge/Firefox cũ không
 * nhận `rel="icon"` kiểu `image/svg+xml`, rơi về `/favicon.ico` mặc định. Thiếu
 * file này thì tab hiện icon trắng chứ không báo lỗi gì — hỏng kiểu khó thấy.
 *
 * Bản cho iOS phải bỏ bo góc (`rx`): iOS tự bo và mask theo khuôn của nó, để
 * góc trong suốt thì bốn góc ăn nền đen, nhìn như icon bị viền.
 *
 * ICO dựng tay vì sharp không xuất được định dạng này, và nhúng PNG thay vì BMP
 * — mọi trình duyệt hiện hành đều đọc được, đổi lại file nhẹ hơn nhiều.
 *
 * Chạy: node scripts/generate-favicon.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = join(ROOT, 'public')
const SOURCE = join(PUBLIC_DIR, 'favicon.svg')

const ICO_SIZES = [16, 32, 48]

// SVG gốc 64x64; density 900 ≈ render ở 800px rồi thu nhỏ, đủ mịn cho 512.
const DENSITY = 900

function render(svg, size) {
  return sharp(Buffer.from(svg), { density: DENSITY })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** Gói nhiều PNG vuông thành một file .ico (ICONDIR + ICONDIRENTRY + payload). */
function buildIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type 1 = icon
  header.writeUInt16LE(entries.length, 4)

  const dir = Buffer.alloc(16 * entries.length)
  let offset = header.length + dir.length

  entries.forEach(({ size, data }, i) => {
    const at = i * 16
    // 256 ghi là 0 theo spec; bộ của ta tối đa 48 nên không chạm ngưỡng đó.
    dir.writeUInt8(size >= 256 ? 0 : size, at)
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1)
    dir.writeUInt8(0, at + 2) // số màu bảng palette, 0 với ảnh true-color
    dir.writeUInt8(0, at + 3) // reserved
    dir.writeUInt16LE(1, at + 4) // color planes
    dir.writeUInt16LE(32, at + 6) // bits per pixel
    dir.writeUInt32LE(data.length, at + 8)
    dir.writeUInt32LE(offset, at + 12)
    offset += data.length
  })

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)])
}

const svg = readFileSync(SOURCE, 'utf8')

// Bản vuông cho iOS — xem ghi chú đầu file.
const squareSvg = svg.replace(/ rx="\d+(\.\d+)?"/, '')
if (squareSvg === svg) {
  throw new Error('Không tìm thấy thuộc tính rx trong favicon.svg — kiểm lại nguồn trước khi sinh')
}

const icoEntries = []
for (const size of ICO_SIZES) {
  icoEntries.push({ size, data: await render(svg, size) })
}
writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), buildIco(icoEntries))
console.log(`favicon.ico        ${ICO_SIZES.join('+')}`)

for (const [name, size, source] of [
  ['apple-touch-icon.png', 180, squareSvg],
  ['icon-192.png', 192, svg],
  ['icon-512.png', 512, svg],
]) {
  writeFileSync(join(PUBLIC_DIR, name), await render(source, size))
  console.log(`${name.padEnd(22)}${size}x${size}`)
}
