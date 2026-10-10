// Denylist cho content private: chặn tên nội bộ (công ty, khách hàng, dự án...)
// lọt ra khi sau này promote một note/case study lên blog public.
//
// Dùng chung cho `npm run check:denylist` (scripts/check-denylist.ts) và
// POST /api/me/check-denylist. CHỈ CHẠY Ở SERVER.
//
// So chuỗi thuần, không regex: từ khóa kiểu `c++` hay `a.b*` phải khớp đúng
// nghĩa đen chứ không thành pattern (hay ném lỗi cú pháp).
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { contentDir } from './private-content'

export const DENYLIST_FILE = '.denylist'
/** Từ khóa ngắn chừng này dễ khớp nhầm giữa từ — chỉ cảnh báo, không chặn. */
export const SHORT_KEYWORD_MAX = 3

export interface DenylistMatch {
  file: string // đường dẫn tương đối so với thư mục content
  line: number // tính từ 1
  keyword: string
}

/**
 * `missing`/`empty` là lỗi cấu hình, KHÔNG phải pass: chưa có từ khóa nào thì
 * "không khớp gì" là vô nghĩa — đúng loại xanh giả mà denylist sinh ra để chặn.
 */
export type DenylistState =
  { status: 'ok'; keywords: string[] } | { status: 'missing' } | { status: 'empty' }

// File soạn trên macOS có thể lưu chữ có dấu ở dạng tách (NFD): "ệ" thành
// "e" + hai dấu kết hợp. Nhìn giống hệt, nhưng so chuỗi thô sẽ trượt im lặng.
function fold(s: string): string {
  return s.normalize('NFC').toLowerCase()
}

/** Mỗi dòng một từ khóa; bỏ dòng trống và dòng bắt đầu bằng `#`. */
export function parseDenylist(raw: string): string[] {
  const seen = new Set<string>()
  const keywords: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const kw = line.normalize('NFC').trim()
    if (!kw || kw.startsWith('#') || seen.has(fold(kw))) continue
    seen.add(fold(kw))
    keywords.push(kw)
  }
  return keywords
}

export function shortKeywords(keywords: string[]): string[] {
  // Đếm theo code point, không theo UTF-16 unit.
  return keywords.filter((k) => Array.from(k).length <= SHORT_KEYWORD_MAX)
}

export async function loadDenylist(dir = contentDir()): Promise<DenylistState> {
  let raw: string
  try {
    raw = await readFile(join(dir, DENYLIST_FILE), 'utf8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { status: 'missing' }
    throw err
  }
  const keywords = parseDenylist(raw)
  return keywords.length ? { status: 'ok', keywords } : { status: 'empty' }
}

export function scanText(text: string, keywords: string[], file: string): DenylistMatch[] {
  const folded = keywords.map((k) => ({ keyword: k, needle: fold(k) }))
  const matches: DenylistMatch[] = []
  text.split(/\r?\n/).forEach((line, i) => {
    const hay = fold(line)
    for (const { keyword, needle } of folded) {
      if (hay.includes(needle)) matches.push({ file, line: i + 1, keyword })
    }
  })
  return matches
}

async function walkMarkdown(dir: string, rel: string, out: string[]) {
  let entries
  try {
    entries = await readdir(join(dir, rel), { withFileTypes: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return
    throw err
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith('.')) continue
    const path = `${rel}/${e.name}`
    if (e.isDirectory()) await walkMarkdown(dir, path, out)
    else if (e.isFile() && e.name.endsWith('.md')) out.push(path)
  }
}

/**
 * roadmap.yaml + mọi .md dưới learn/, case-studies/ và posts/ (đệ quy).
 *
 * ⚠️ **Thêm content type mới thì phải thêm vào đây.** Quên là loại content đó
 * lách hẳn hàng rào tên nội bộ — và lách im lặng, vì script vẫn exit 0.
 */
export async function listScanTargets(dir = contentDir()): Promise<string[]> {
  const files: string[] = []
  try {
    await readFile(join(dir, 'roadmap.yaml'))
    files.push('roadmap.yaml')
  } catch {
    // không có roadmap thì thôi
  }
  await walkMarkdown(dir, 'learn', files)
  await walkMarkdown(dir, 'case-studies', files)
  await walkMarkdown(dir, 'posts', files)
  return files
}

export async function scanFiles(
  files: string[],
  keywords: string[],
  dir = contentDir(),
): Promise<DenylistMatch[]> {
  const matches: DenylistMatch[] = []
  for (const file of files) {
    matches.push(...scanText(await readFile(join(dir, file), 'utf8'), keywords, file))
  }
  return matches
}

export type CaseStudyCheck =
  | { status: 'not-found' }
  | { status: 'missing-denylist' | 'empty-denylist' }
  | { status: 'clean' | 'matches'; matches: DenylistMatch[] }

/** Kiểm một case study — nút "Kiểm denylist" trên trang chi tiết. */
export async function checkCaseStudy(slug: string, dir = contentDir()): Promise<CaseStudyCheck> {
  const file = `case-studies/${slug}.md`
  let text: string
  try {
    text = await readFile(join(dir, file), 'utf8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { status: 'not-found' }
    throw err
  }
  const denylist = await loadDenylist(dir)
  if (denylist.status === 'missing') return { status: 'missing-denylist' }
  if (denylist.status === 'empty') return { status: 'empty-denylist' }
  const matches = scanText(text, denylist.keywords, file)
  return { status: matches.length ? 'matches' : 'clean', matches }
}
