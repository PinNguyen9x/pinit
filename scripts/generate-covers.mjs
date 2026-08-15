/**
 * Sinh ảnh bìa cho bài blog và project — HAI khổ cho hai mục đích khác nhau.
 *
 *  - `<slug>.png`      1200x630, icon + tag + footer -> og:image khi chia sẻ link
 *  - `<slug>-card.png` 640x416,  CHỈ icon           -> thumbnail trong card
 *
 * Vì sao ảnh card không có chữ: khung card là 200x130, chữ ở đó co lại thành
 * vệt mờ. Tiêu đề và tag đã hiện ngay cạnh card dưới dạng HTML rồi, nhét thêm
 * vào ảnh chỉ làm giao diện dày chữ. Icon canh giữa thì đọc được ở mọi cỡ và
 * cắt kiểu gì cũng còn.
 *
 * Icon lấy path SVG từ gói `simple-icons` rồi nhúng thẳng vào SVG đang dựng —
 * không cần cairosvg hay bước rasterize riêng như bản Python.
 *
 * Bảng màu, gradient chéo, vòng tròn chấm và glow lấy từ gen_thumbnails_v2.py
 * của chủ site. Font: máy này không có Inter/JetBrains Mono nên dùng
 * Helvetica Neue + Menlo (đã render thử để kiểm).
 *
 * Chạy: node scripts/generate-covers.mjs [--works]
 */
import { createHash } from 'crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import sharp from 'sharp'
import * as simpleIcons from 'simple-icons'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = join(ROOT, 'blog')
const OUT_DIR = join(ROOT, 'public', 'covers')

const OG = { w: 1200, h: 630 }
const CARD = { w: 640, h: 416 } // 1.538:1, khớp khung card 200x130

const MONO = 'Menlo, DejaVu Sans Mono, monospace'

const THEMES = [
  { glow: [150, 32, 62], base: [46, 10, 22], label: [245, 130, 150] },
  { glow: [72, 70, 190], base: [24, 22, 66], label: [150, 150, 250] },
  { glow: [88, 70, 210], base: [28, 22, 76], label: [165, 150, 252] },
  { glow: [22, 105, 66], base: [8, 34, 24], label: [110, 225, 160] },
  { glow: [22, 110, 118], base: [8, 36, 40], label: [110, 222, 230] },
  { glow: [30, 92, 150], base: [10, 30, 52], label: [120, 190, 245] },
  { glow: [150, 78, 26], base: [48, 26, 10], label: [245, 165, 90] },
  { glow: [92, 105, 30], base: [30, 36, 12], label: [205, 220, 110] },
  { glow: [36, 92, 40], base: [12, 30, 14], label: [120, 225, 130] },
]

/**
 * Tag -> icon trong simple-icons. Xét theo THỨ TỰ tag của bài nên tag đầu tiên
 * có icon sẽ thắng; vì vậy tag đặc trưng nên đứng trước tag chung trong frontmatter.
 * Tag không có ở đây (Workflow, Productivity, Architecture...) sẽ rơi xuống
 * glyph mặc định.
 */
const TAG_ICON = {
  Docker: 'docker', 'Docker Compose': 'docker', Kafka: 'apachekafka',
  'Kafka Connect': 'apachekafka', Messaging: 'apachekafka', Redis: 'redis',
  ReactJS: 'react', React: 'react', NextJS: 'nextdotjs', NodeJS: 'nodedotjs',
  TypeScript: 'typescript', JavaScript: 'javascript', Git: 'git',
  'Version Control': 'git', tmux: 'tmux', Terminal: 'gnubash', CLI: 'gnubash',
  Jenkins: 'jenkins', Claude: 'claude', 'claude-code': 'claude', ArgoCD: 'argo',
  GitOps: 'argo', Kubernetes: 'kubernetes', MongoDB: 'mongodb',
  ExpressJS: 'express', Python: 'python', 'Stable Diffusion': 'python',
  Vite: 'vite', TailwindCSS: 'tailwindcss', Redux: 'redux', Firebase: 'firebase',
  'React Query': 'reactquery', Jest: 'jest', 'React Testing Library': 'testinglibrary',
  JWT: 'jsonwebtokens', ghcr: 'github', Gradio: 'gradio', Database: 'postgresql',
  'Micro Frontends': 'webpack', 'Module Federation': 'webpack',
}

const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const pickTheme = (seed) => THEMES[createHash('sha256').update(seed).digest()[0] % THEMES.length]

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function iconPath(tags = []) {
  for (const tag of tags) {
    const slug = TAG_ICON[tag]
    if (!slug) continue
    const icon = simpleIcons[`si${slug[0].toUpperCase()}${slug.slice(1)}`]
    if (icon) return icon.path
  }
  return null
}

/** Nền: chuyển màu chéo glow -> base theo đường cong t = min(1, d*1.25)^1.4 của bản gốc. */
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
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="26"/>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#grid)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>`
}

/** Vòng tròn mảnh + chấm quanh icon, lấy từ draw_ring của bản Python. */
function ring(cx, cy, r, color) {
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 + 0.5
    return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="4" fill="${color}" fill-opacity="0.66"/>`
  }).join('')
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-opacity="0.24" stroke-width="2"/>${dots}`
}

/**
 * Icon: path của simple-icons vẽ trong khung 24x24 nên phải scale. Vẽ hai lần —
 * bản mờ phía sau tạo quầng sáng, bản trắng đè lên.
 */
function iconMark(path, cx, cy, size, glowColor) {
  const g = (s, fill, extra = '') =>
    `<g transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" ${extra}><path d="${path}" fill="${fill}"/></g>`
  return `${g(size * 1.25, glowColor, 'filter="url(#glow)" opacity="0.75"')}${g(size, '#ffffff')}`
}

/** Glyph mặc định khi không tag nào có icon: mạng node — trung tính, hợp mọi chủ đề. */
function fallbackMark(cx, cy, size, color) {
  const r = size * 0.42
  const nodes = Array.from({ length: 4 }, (_, i) => {
    const a = (i * Math.PI) / 2 + Math.PI / 4
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
  const lines = nodes
    .map(([x, y]) => `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-opacity="0.55" stroke-width="${size * 0.022}"/>`)
    .join('')
  const outer = nodes
    .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size * 0.115}" fill="${color}" fill-opacity="0.9"/>`)
    .join('')
  return `${lines}${outer}<circle cx="${cx}" cy="${cy}" r="${size * 0.17}" fill="#ffffff"/>`
}

function mark(tags, cx, cy, size, theme) {
  const path = iconPath(tags)
  return path
    ? iconMark(path, cx, cy, size, hex(theme.label))
    : fallbackMark(cx, cy, size, hex(theme.label))
}

function ogSvg({ tags, kicker, footerRight, seed }) {
  const theme = pickTheme(seed)
  const { w, h } = OG
  const cx = w / 2
  const cy = h / 2 + 14

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(theme, w, h)}
  ${ring(cx, cy, 225, hex(theme.label))}
  ${mark(tags, cx, cy, 250, theme)}
  <text x="72" y="82" font-family="${MONO}" font-size="26" letter-spacing="2"
        fill="${hex(theme.label)}">${escapeXml(kicker.toUpperCase())}</text>
  <text x="72" y="${h - 56}" font-family="${MONO}" font-size="24" fill="#e1e1e6">nipit.pro</text>
  <text x="${w - 72}" y="${h - 56}" text-anchor="end" font-family="${MONO}" font-size="24"
        fill="#c3c3ca">${escapeXml(footerRight)}</text>
</svg>`
}

/** Card: chỉ icon, không một chữ nào. */
function cardSvg({ tags, seed }) {
  const theme = pickTheme(seed)
  const { w, h } = CARD
  const cx = w / 2
  const cy = h / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(theme, w, h)}
  ${ring(cx, cy, 148, hex(theme.label))}
  ${mark(tags, cx, cy, 168, theme)}
</svg>`
}

async function render(svg, outPath) {
  // palette 128 màu: giảm hơn 40% dung lượng mà mắt thường không thấy khác.
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, colours: 128 })
    .toFile(outPath)
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
  const noIcon = []

  for (const file of files) {
    const { get, tags, body } = parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'))
    const slug = get('slug')
    if (!slug) {
      console.warn(`  bỏ qua ${file}: không có slug`)
      continue
    }
    if (!iconPath(tags)) noIcon.push(slug)
    const minutes = Math.max(1, Math.round(body.trim().split(/\s+/).length / 200))
    await render(
      ogSvg({
        tags,
        kicker: tags.slice(0, 3).join(' · ') || 'Blog',
        footerRight: `${minutes} min read`,
        seed: slug,
      }),
      join(dir, `${slug}.png`),
    )
    await render(cardSvg({ tags, seed: slug }), join(dir, `${slug}-card.png`))
    done++
  }

  await render(
    ogSvg({ tags: [], kicker: 'Blog', footerRight: 'nipit.pro', seed: 'default' }),
    join(OUT_DIR, 'default.png'),
  )
  await render(cardSvg({ tags: [], seed: 'default' }), join(OUT_DIR, 'default-card.png'))

  console.log(`blog: ${done}/${files.length} bài × 2 khổ -> public/covers/blog/ (+ default)`)
  if (noIcon.length) console.log(`  dùng glyph mặc định (${noIcon.length}): ${noIcon.join(', ')}`)
}

async function generateWorkCovers() {
  const dir = join(OUT_DIR, 'works')
  mkdirSync(dir, { recursive: true })
  const base = process.env.API_URL ?? 'https://json-server-blog.vercel.app'
  const json = await (await fetch(`${base}/api/works?_page=1&_limit=100`)).json()
  const works = Array.isArray(json) ? json : (json.data ?? [])
  const noIcon = []

  for (const work of works) {
    const slug = work.slug || work.id
    const tags = work.tagList ?? []
    if (!iconPath(tags)) noIcon.push(slug)
    await render(
      ogSvg({
        tags,
        kicker: tags.slice(0, 3).join(' · ') || 'Project',
        footerRight: work.status === 'published' ? 'case study' : 'experiment',
        seed: slug,
      }),
      join(dir, `${slug}.png`),
    )
    await render(cardSvg({ tags, seed: slug }), join(dir, `${slug}-card.png`))
  }
  console.log(`works: ${works.length} project × 2 khổ -> public/covers/works/`)
  if (noIcon.length) console.log(`  dùng glyph mặc định (${noIcon.length}): ${noIcon.join(', ')}`)
}

if (!existsSync(BLOG_DIR)) throw new Error(`không thấy thư mục blog: ${BLOG_DIR}`)
if (process.argv.slice(2).includes('--works')) await generateWorkCovers()
else await generateBlogCovers()
