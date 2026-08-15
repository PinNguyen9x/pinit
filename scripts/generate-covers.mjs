/**
 * Sinh ảnh bìa 1200x630 cho bài blog và project.
 *
 * Vì sao tự sinh thay vì lấy ảnh stock: ảnh Unsplash cũ vừa không liên quan nội
 * dung, vừa bắt mọi lượt xem gọi ra mạng ngoài (next.config đang để
 * `unoptimized: true` nên không có cache trung gian). Bìa sinh từ chính tiêu đề
 * và tag thì luôn khớp bài, cùng một ngôn ngữ thiết kế, và nằm trong repo.
 *
 * Xuất PNG chứ không phải SVG vì `thumbnailUrl` được dùng cho og:image và
 * twitter:image (components/common/seo.tsx) — phần lớn mạng xã hội không đọc SVG.
 *
 * Chạy: node scripts/generate-covers.mjs [--works]
 */
import { createHash } from 'crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = join(ROOT, 'blog')
const OUT_DIR = join(ROOT, 'public', 'covers')

const W = 1200
const H = 630

/**
 * Bảng màu: giữ nền tối chung của site, chỉ đổi màu nhấn để mỗi bài một vẻ mà
 * không lạc khỏi bộ nhận diện. Hue chọn tay thay vì rải đều 360 độ — rải đều sẽ
 * rơi vào vùng nâu/đỏ đục trông bẩn trên nền tối.
 */
const ACCENTS = [
  { name: 'emerald', a: '#34d399', b: '#065f46' },
  { name: 'lime', a: '#a3e635', b: '#3f6212' },
  { name: 'teal', a: '#2dd4bf', b: '#115e59' },
  { name: 'sky', a: '#38bdf8', b: '#075985' },
  { name: 'indigo', a: '#818cf8', b: '#3730a3' },
  { name: 'amber', a: '#fbbf24', b: '#78350f' },
  { name: 'rose', a: '#fb7185', b: '#881337' },
]

function pickAccent(seed) {
  const hash = createHash('sha256').update(seed).digest()
  return ACCENTS[hash[0] % ACCENTS.length]
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** librsvg không có font emoji — để lại sẽ ra ô vuông rỗng. */
function stripEmoji(s) {
  return s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * SVG <text> không tự xuống dòng, phải tự ngắt. Ước lượng bề rộng theo số ký tự:
 * dấu tiếng Việt nằm trên/dưới chữ nên gần như không làm chữ rộng thêm.
 */
function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxChars && cur) {
      lines.push(cur)
      cur = w
      if (lines.length === maxLines) break
    } else {
      cur = next
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur)
  if (lines.length === maxLines) {
    const used = lines.join(' ').length
    if (used < text.length) lines[maxLines - 1] = lines[maxLines - 1].replace(/[,.\s]+$/, '') + '…'
  }
  return lines
}

function buildSvg({ title, kicker, footerRight, seed }) {
  const accent = pickAccent(seed)
  const clean = stripEmoji(title)
  const size = clean.length > 78 ? 46 : clean.length > 46 ? 54 : 62
  const maxChars = Math.floor((W - 200) / (size * 0.5))
  const lines = wrap(clean, maxChars, 3)
  const lineH = Math.round(size * 1.28)
  const blockTop = 300 - ((lines.length - 1) * lineH) / 2

  const tspans = lines
    .map((l, i) => `<tspan x="80" y="${blockTop + i * lineH}">${escapeXml(l)}</tspan>`)
    .join('')

  // Lưới mờ: lặp lại motif nền của hero, giữ ảnh không bị phẳng lì.
  const grid = `<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0 L0 0 0 48" fill="none" stroke="${accent.a}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07080a"/>
      <stop offset="100%" stop-color="${accent.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.12" cy="0.1" r="0.75">
      <stop offset="0%" stop-color="${accent.a}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${accent.a}" stop-opacity="0"/>
    </radialGradient>
    ${grid}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="8" height="${H}" fill="${accent.a}"/>
  <text x="80" y="120" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="24"
        letter-spacing="3" fill="${accent.a}">${escapeXml(kicker.toUpperCase())}</text>
  <text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${size}"
        font-weight="700" fill="#ffffff">${tspans}</text>
  <line x1="80" y1="516" x2="${W - 80}" y2="516" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="80" y="562" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="22"
        fill="#ffffff" fill-opacity="0.72">nipit.pro</text>
  <text x="${W - 80}" y="562" text-anchor="end" font-family="Menlo, DejaVu Sans Mono, monospace"
        font-size="22" fill="#ffffff" fill-opacity="0.55">${escapeXml(footerRight)}</text>
</svg>`
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
    ? tagsRaw[1]
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : []
  return { fm, get, tags, body: m ? raw.slice(m[0].length) : raw }
}

async function render(svg, outPath) {
  // palette 128 màu: 165KB -> 95KB mỗi ảnh mà mắt thường không thấy khác (đã so
  // trực tiếp). Ảnh chỉ có gradient phẳng và chữ nên không bị banding.
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, colours: 128 })
    .toFile(outPath)
}

async function generateBlogCovers() {
  const dir = join(OUT_DIR, 'blog')
  mkdirSync(dir, { recursive: true })
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  let done = 0

  for (const file of files) {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf8')
    const { get, tags, body } = parseFrontmatter(raw)
    const slug = get('slug')
    if (!slug) {
      console.warn(`  bỏ qua ${file}: không có slug`)
      continue
    }
    const words = body.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.round(words / 200))
    const svg = buildSvg({
      title: get('title'),
      kicker: tags.slice(0, 3).join(' · ') || 'Blog',
      footerRight: `${minutes} min read`,
      seed: slug,
    })
    await render(svg, join(dir, `${slug}.png`))
    done++
  }
  // Bìa dự phòng cho bài chưa kịp sinh ảnh riêng — pages/blog/[slug].tsx dùng
  // làm fallback thay vì trỏ ra ảnh stock ngoài mạng.
  await render(
    buildSvg({
      title: 'Pin Nguyen',
      kicker: 'Blog',
      footerRight: 'nipit.pro',
      seed: 'default',
    }),
    join(OUT_DIR, 'default.png'),
  )

  console.log(`blog: ${done}/${files.length} ảnh -> public/covers/blog/ (+ default.png)`)
}

async function generateWorkCovers() {
  const dir = join(OUT_DIR, 'works')
  mkdirSync(dir, { recursive: true })
  const base = process.env.API_URL ?? 'https://json-server-blog.vercel.app'
  const res = await fetch(`${base}/api/works?_page=1&_limit=100`)
  const json = await res.json()
  const works = Array.isArray(json) ? json : (json.data ?? [])
  let done = 0

  for (const work of works) {
    const slug = work.slug || work.id
    const svg = buildSvg({
      title: work.title ?? '',
      kicker: (work.tagList ?? []).slice(0, 3).join(' · ') || 'Project',
      footerRight: work.status === 'published' ? 'case study' : 'experiment',
      seed: slug,
    })
    await render(svg, join(dir, `${slug}.png`))
    done++
  }
  console.log(`works: ${done} ảnh -> public/covers/works/`)
  console.log('  (nhớ trỏ thumbnailUrl trong db.json sang /covers/works/<slug>.png)')
}

const args = process.argv.slice(2)
if (!existsSync(BLOG_DIR)) throw new Error(`không thấy thư mục blog: ${BLOG_DIR}`)
if (args.includes('--works')) await generateWorkCovers()
else await generateBlogCovers()
