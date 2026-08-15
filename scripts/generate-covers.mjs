/**
 * Sinh ảnh bìa cho bài blog và project — HAI khổ cho hai mục đích khác nhau.
 *
 *  - `<slug>.png`      1200x630, nhiều chữ  -> og:image / twitter:image khi chia sẻ link
 *  - `<slug>-card.png` 640x416,  một chữ to -> thumbnail trong card trên site
 *
 * Vì sao phải tách: khung ảnh trong card là 200x130 (1.54:1) với object-fit
 * cover, còn ảnh OG là 1.90:1 — trình duyệt cắt hai bên nên lề trái của ảnh OG
 * mất chữ ("pinit" thành "init"). Mà kể cả không cắt thì tiêu đề 62px trong ảnh
 * 1200px hiện ở khung 200px chỉ còn ~10px, không ai đọc được. Ảnh khổ OG không
 * dùng làm thumbnail nhỏ được.
 *
 * Bảng màu và kiểu gradient lấy từ scripts/gen_thumbnails.py của chủ site.
 * Font: máy này không có Inter/JetBrains Mono nên dùng Helvetica Neue + Menlo
 * (đã kiểm bằng cách render thử — các font kia rơi về fallback).
 *
 * Chạy: node scripts/generate-covers.mjs [--works]
 */
import { createHash } from 'crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = join(ROOT, 'blog')
const OUT_DIR = join(ROOT, 'public', 'covers')

const OG = { w: 1200, h: 630 }
const CARD = { w: 640, h: 416 } // 1.538:1, khớp khung card 200x130

const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif'
const MONO = 'Menlo, DejaVu Sans Mono, monospace'

/** glow ở góc trên-trái, base ở góc dưới-phải. */
const THEMES = [
  { key: 'crimson', glow: [150, 32, 62], base: [46, 10, 22], label: [245, 130, 150] },
  { key: 'indigo', glow: [72, 70, 190], base: [24, 22, 66], label: [150, 150, 250] },
  { key: 'violet', glow: [88, 70, 210], base: [28, 22, 76], label: [165, 150, 252] },
  { key: 'green', glow: [22, 105, 66], base: [8, 34, 24], label: [110, 225, 160] },
  { key: 'teal', glow: [22, 110, 118], base: [8, 36, 40], label: [110, 222, 230] },
  { key: 'blue', glow: [30, 92, 150], base: [10, 30, 52], label: [120, 190, 245] },
  { key: 'orange', glow: [150, 78, 26], base: [48, 26, 10], label: [245, 165, 90] },
  { key: 'olive', glow: [92, 105, 30], base: [30, 36, 12], label: [205, 220, 110] },
  { key: 'forest', glow: [36, 92, 40], base: [12, 30, 14], label: [120, 225, 130] },
]

const hex = ([r, g, b]) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

function pickTheme(seed) {
  return THEMES[createHash('sha256').update(seed).digest()[0] % THEMES.length]
}

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** librsvg không có font emoji — để lại sẽ ra ô vuông rỗng. */
const stripEmoji = (s) =>
  s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Nền: chuyển màu chéo từ glow (góc trên-trái) sang base, theo đúng đường cong
 * t = min(1, d*1.25)^1.4 của script gốc — tính sẵn từng chặng rồi phát ra stop
 * để librsvg khỏi phải nội suy khác đi.
 */
function background(theme, w, h) {
  const stops = [0, 0.25, 0.45, 0.65, 0.85, 1]
    .map((d) => {
      const t = Math.min(1, d * 1.25) ** 1.4
      return `<stop offset="${d * 100}%" stop-color="${hex(lerp(theme.glow, theme.base, t))}"/>`
    })
    .join('')

  return `
    <defs>
      <radialGradient id="bg" cx="0" cy="0" r="1.15">${stops}</radialGradient>
      <linearGradient id="vig" x1="0" y1="0.62" x2="0" y2="1">
        <stop offset="0%" stop-color="#050508" stop-opacity="0"/>
        <stop offset="100%" stop-color="#050508" stop-opacity="0.55"/>
      </linearGradient>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M60 0 L0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#grid)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>`
}

/** SVG <text> không tự xuống dòng — phải tự ngắt theo ước lượng bề rộng. */
function wrap(text, maxChars, maxLines) {
  const lines = []
  let cur = ''
  for (const word of text.split(/\s+/)) {
    const next = cur ? `${cur} ${word}` : word
    if (next.length > maxChars && cur) {
      if (lines.length === maxLines - 1) break
      lines.push(cur)
      cur = word
    } else {
      cur = next
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  const shown = lines.join(' ')
  if (shown.length < text.length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[,.\s]+$/, '') + '…'
  }
  return lines
}

function ogSvg({ title, kicker, footerRight, seed }) {
  const theme = pickTheme(seed)
  const { w, h } = OG
  const clean = stripEmoji(title)
  const size = clean.length > 78 ? 46 : clean.length > 46 ? 54 : 62
  const lines = wrap(clean, Math.floor((w - 144) / (size * 0.5)), 4)
  const lineH = Math.round(size * 1.28)

  const tspans = lines
    .map((l, i) => `<tspan x="72" y="${190 + i * lineH}">${escapeXml(l)}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(theme, w, h)}
  <text x="72" y="88" font-family="${MONO}" font-size="26" letter-spacing="2"
        fill="${hex(theme.label)}">${escapeXml(kicker.toUpperCase())}</text>
  <text font-family="${SANS}" font-size="${size}" font-weight="700" fill="#ffffff">${tspans}</text>
  <text x="72" y="${h - 62}" font-family="${MONO}" font-size="24" fill="#dcdce1">nipit.pro</text>
  <text x="${w - 72}" y="${h - 62}" text-anchor="end" font-family="${MONO}" font-size="24"
        fill="#bebec6">${escapeXml(footerRight)}</text>
</svg>`
}

/**
 * Ảnh card: chỉ MỘT chữ lớn, không có chữ nhỏ nào. Ở khung 200x130 thì chữ nhỏ
 * biến thành vệt mờ, còn một từ lớn vẫn đọc được. Tiêu đề đầy đủ đã nằm ngay
 * cạnh card dưới dạng HTML nên không cần lặp lại trong ảnh.
 */
function cardSvg({ word, seed }) {
  const theme = pickTheme(seed)
  const { w, h } = CARD
  const clean = stripEmoji(word)
  const size = clean.length > 22 ? 44 : clean.length > 14 ? 54 : clean.length > 8 ? 70 : 88
  // 0.58 chứ không phải 0.52: Helvetica Neue Bold rộng hơn ước lượng ban đầu,
  // để 0.52 thì chữ chạm sát mép. Lề 72 mỗi bên cho chắc.
  const lines = wrap(clean, Math.floor((w - 144) / (size * 0.58)), 2)
  const lineH = Math.round(size * 1.16)
  const top = h / 2 - ((lines.length - 1) * lineH) / 2 + size * 0.34

  // Canh giữa cả hai chiều: khung card đổi tỷ lệ theo breakpoint (200x130 ở
  // desktop, 100%x160 ở mobile) nên object-fit cover cắt mỗi nơi một kiểu.
  // Chữ nằm giữa thì cắt đằng nào cũng còn.
  const tspans = lines
    .map((l, i) => `<tspan x="${w / 2}" y="${top + i * lineH}">${escapeXml(l)}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(theme, w, h)}
  <text text-anchor="middle" font-family="${SANS}" font-size="${size}" font-weight="700"
        fill="#ffffff" letter-spacing="-1">${tspans}</text>
</svg>`
}

async function render(svg, outPath) {
  // palette 128 màu: ~165KB xuống ~95KB mà mắt thường không thấy khác (đã so
  // trực tiếp). Ảnh chỉ có gradient phẳng và chữ nên không bị banding.
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, colours: 128 }).toFile(outPath)
}

function parseFrontmatter(raw) {
  const m = /^---([\s\S]*?)---/.exec(raw)
  const fm = m ? m[1] : ''
  const get = (k) => {
    const r = new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(fm)
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : ''
  }
  const tagsRaw = /^tags:\s*\[(.*?)\]/ms.exec(fm)
  const tags = tagsRaw
    ? tagsRaw[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    : []
  return { get, tags, body: m ? raw.slice(m[0].length) : raw }
}

async function generateBlogCovers() {
  const dir = join(OUT_DIR, 'blog')
  mkdirSync(dir, { recursive: true })
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  let done = 0

  for (const file of files) {
    const { get, tags, body } = parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'))
    const slug = get('slug')
    if (!slug) {
      console.warn(`  bỏ qua ${file}: không có slug`)
      continue
    }
    const minutes = Math.max(1, Math.round(body.trim().split(/\s+/).length / 200))
    await render(
      ogSvg({
        title: get('title'),
        kicker: tags.slice(0, 3).join(' · ') || 'Blog',
        footerRight: `${minutes} min read`,
        seed: slug,
      }),
      join(dir, `${slug}.png`),
    )
    // Chữ lớn trên card = tag chính, vì tiêu đề đã hiện ngay cạnh card.
    await render(cardSvg({ word: tags[0] || 'Blog', seed: slug }), join(dir, `${slug}-card.png`))
    done++
  }

  await render(
    ogSvg({ title: 'Pin Nguyen', kicker: 'Blog', footerRight: 'nipit.pro', seed: 'default' }),
    join(OUT_DIR, 'default.png'),
  )
  await render(cardSvg({ word: 'nipit', seed: 'default' }), join(OUT_DIR, 'default-card.png'))

  console.log(`blog: ${done}/${files.length} bài × 2 khổ -> public/covers/blog/ (+ default)`)
}

async function generateWorkCovers() {
  const dir = join(OUT_DIR, 'works')
  mkdirSync(dir, { recursive: true })
  const base = process.env.API_URL ?? 'https://json-server-blog.vercel.app'
  const json = await (await fetch(`${base}/api/works?_page=1&_limit=100`)).json()
  const works = Array.isArray(json) ? json : (json.data ?? [])

  for (const work of works) {
    const slug = work.slug || work.id
    await render(
      ogSvg({
        title: work.title ?? '',
        kicker: (work.tagList ?? []).slice(0, 3).join(' · ') || 'Project',
        footerRight: work.status === 'published' ? 'case study' : 'experiment',
        seed: slug,
      }),
      join(dir, `${slug}.png`),
    )
    // Project thì tên riêng nhận diện tốt hơn tag chung chung.
    await render(cardSvg({ word: work.title ?? slug, seed: slug }), join(dir, `${slug}-card.png`))
  }
  console.log(`works: ${works.length} project × 2 khổ -> public/covers/works/`)
}

if (!existsSync(BLOG_DIR)) throw new Error(`không thấy thư mục blog: ${BLOG_DIR}`)
if (process.argv.slice(2).includes('--works')) await generateWorkCovers()
else await generateBlogCovers()
