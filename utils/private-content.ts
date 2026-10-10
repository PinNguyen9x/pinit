// Đọc content private của khu /me từ PRIVATE_CONTENT_DIR.
//
// CHỈ CHẠY Ở SERVER, VÀ CHỈ LÚC REQUEST (getServerSideProps). Repo và image đều
// public: content thật nằm trên disk của VPS (bind-mount read-only), không bao
// giờ được đọc lúc build — gọi file này từ getStaticProps là bake nó vào HTML.
//
// File sai schema không làm sập trang: entry hỏng bị bỏ qua và lỗi được trả về
// trong `errors` để trang hiện ra, owner biết vì sao một mục biến mất.
import { readdir, readFile } from 'fs/promises'
import matter from 'gray-matter'
import { load as loadYaml } from 'js-yaml'
import { join, resolve } from 'path'
import {
  CaseStudy,
  CaseStudyMeta,
  ChecklistItem,
  isQuestionId,
  isSlug,
  LANES,
  Milestone,
  MILESTONE_STATUSES,
  Note,
  NoteMeta,
  Post,
  PostMeta,
  Question,
  TopicSummary,
  VISIBILITIES,
  WithErrors,
} from './private-content-schema'

// Re-export cho code phía server import một chỗ. Component (code chạy ở trình
// duyệt) phải import thẳng từ './private-content-schema' — import file này là
// kéo fs/gray-matter/js-yaml vào bundle client và build gãy.
export * from './private-content-schema'

export function contentDir(): string {
  return resolve(process.env.PRIVATE_CONTENT_DIR || 'private-content')
}

// ---------- helpers ----------

function isMissing(err: unknown) {
  const code = (err as NodeJS.ErrnoException)?.code
  return code === 'ENOENT' || code === 'ENOTDIR'
}

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch (err) {
    if (isMissing(err)) return null
    throw err
  }
}

async function listDir(path: string): Promise<{ name: string; isDir: boolean }[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true })
    return entries
      .filter((e) => !e.name.startsWith('.'))
      .map((e) => ({ name: e.name, isDir: e.isDirectory() }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    if (isMissing(err)) return []
    throw err
  }
}

function nonEmptyString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function stringArray(v: unknown): string[] | null {
  if (v == null) return []
  if (!Array.isArray(v)) return null
  const out = v.map((x) => (typeof x === 'number' ? String(x) : x))
  return out.every((x) => typeof x === 'string') ? (out as string[]) : null
}

/**
 * YAML tự hiểu `2026-09-20` (không nháy) thành Date — mà Date không qua được
 * getServerSideProps (Next chỉ serialize JSON). Chuẩn hoá về chuỗi ngay ở đây.
 */
function normalizeDate(v: unknown, precision: 'day' | 'month'): string | null {
  const len = precision === 'day' ? 10 : 7
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, len)
  if (typeof v !== 'string') return null
  const re = precision === 'day' ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-(0[1-9]|1[0-2])$/
  return re.test(v.trim()) ? v.trim() : null
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null
}

function parseFrontmatter(raw: string, file: string, errors: string[]) {
  try {
    // Truyền options (dù rỗng) để tắt cache của gray-matter: nó cache theo nội
    // dung file, mà content ở đây đọc mỗi request và sửa liên tục → cache chỉ phình.
    const { data, content } = matter(raw, {})
    return { data: data as Record<string, unknown>, content }
  } catch (err) {
    errors.push(`${file}: frontmatter không phải YAML hợp lệ (${(err as Error).message})`)
    return null
  }
}

// ---------- roadmap ----------

export function parseRoadmap(raw: string, file = 'roadmap.yaml'): WithErrors<Milestone[]> {
  const errors: string[] = []
  let doc: unknown
  try {
    doc = loadYaml(raw)
  } catch (err) {
    return { data: [], errors: [`${file}: YAML không hợp lệ (${(err as Error).message})`] }
  }
  const list = (doc as { milestones?: unknown } | null)?.milestones
  if (!Array.isArray(list)) {
    return { data: [], errors: [`${file}: thiếu mảng \`milestones\``] }
  }

  const seen = new Set<string>()
  const milestones: Milestone[] = []
  list.forEach((m: any, i) => {
    const where = `${file}: milestones[${i}]${typeof m?.id === 'string' ? ` (${m.id})` : ''}`
    const problems: string[] = []
    const id = nonEmptyString(m?.id)
    const title = nonEmptyString(m?.title)
    const lane = oneOf(m?.lane, LANES)
    const status = oneOf(m?.status, MILESTONE_STATUSES)
    const target = normalizeDate(m?.target, 'month')
    const links = stringArray(m?.links)

    if (!id) problems.push('thiếu id')
    else if (seen.has(id)) problems.push('id trùng')
    if (!title) problems.push('thiếu title')
    if (!lane) problems.push(`lane phải là một trong ${LANES.join(' | ')}`)
    if (!status) problems.push(`status phải là một trong ${MILESTONE_STATUSES.join(' | ')}`)
    if (!target) problems.push('target phải có dạng YYYY-MM')
    // Chỉ http(s): link được render thành <a href>, `javascript:` là XSS.
    if (!links || links.some((l) => !/^https?:\/\//i.test(l))) {
      problems.push('links phải là mảng URL http(s)')
    }
    if (m?.notes != null && typeof m.notes !== 'string') problems.push('notes phải là chuỗi')
    const topics = stringArray(m?.topics)
    if (!topics) problems.push('topics phải là mảng slug')
    if (m?.checklist != null && !Array.isArray(m.checklist)) {
      problems.push('checklist phải là mảng { id, text }')
    }

    if (problems.length) {
      errors.push(`${where}: ${problems.join(', ')}`)
      return
    }
    seen.add(id!)

    // Mục con hỏng không làm mất cả milestone — bỏ mục đó, báo lỗi, giữ phần còn lại.
    const validTopics: string[] = []
    for (const t of topics!) {
      if (!isSlug(t)) errors.push(`${where}: topic "${t}" không phải slug hợp lệ (a-z 0-9 - _)`)
      else if (!validTopics.includes(t)) validTopics.push(t)
    }
    const checklist: ChecklistItem[] = []
    ;((m.checklist as any[]) ?? []).forEach((c, j) => {
      const cid = nonEmptyString(c?.id)
      const text = nonEmptyString(c?.text)
      if (!cid || !isSlug(cid) || !text) {
        errors.push(`${where}: checklist[${j}] cần id (slug) và text`)
      } else if (checklist.some((x) => x.id === cid)) {
        errors.push(`${where}: checklist[${j}] id "${cid}" trùng`)
      } else {
        checklist.push({ id: cid, text })
      }
    })

    milestones.push({
      id: id!,
      title: title!,
      lane: lane!,
      target: target!,
      status: status!,
      notes: nonEmptyString(m.notes),
      links: links!,
      topics: validTopics,
      checklist,
    })
  })
  milestones.sort((a, b) => a.target.localeCompare(b.target))
  return { data: milestones, errors }
}

/**
 * null = chưa có roadmap.yaml. Topic phải tồn tại (là topic hợp lệ trong learn/,
 * có index.md) — sai thì bỏ khỏi milestone và báo lỗi như mọi lỗi schema khác.
 */
export async function loadRoadmap(): Promise<WithErrors<Milestone[]> | null> {
  const raw = await readOptional(join(contentDir(), 'roadmap.yaml'))
  if (raw == null) return null
  const parsed = parseRoadmap(raw)
  if (!parsed.data.some((m) => m.topics.length)) return parsed

  const known = new Set((await listTopics()).data.map((t) => t.slug))
  for (const m of parsed.data) {
    const missing = m.topics.filter((t) => !known.has(t))
    if (!missing.length) continue
    parsed.errors.push(
      `roadmap.yaml: milestone ${m.id}: topic ${missing.map((t) => `"${t}"`).join(', ')} không có trong learn/`,
    )
    m.topics = m.topics.filter((t) => known.has(t))
  }
  return parsed
}

// ---------- learn ----------

export function parseNote(raw: string, slug: string, file: string): WithErrors<Note | null> {
  const errors: string[] = []
  const fm = parseFrontmatter(raw, file, errors)
  if (!fm) return { data: null, errors }
  const { data, content } = fm

  const problems: string[] = []
  const title = nonEmptyString(data.title)
  const tags = stringArray(data.tags)
  if (!title) problems.push('thiếu title')
  if (!tags) problems.push('tags phải là mảng chuỗi')

  const questions: Question[] = []
  if (data.questions != null && !Array.isArray(data.questions)) {
    problems.push('questions phải là mảng { q, a }')
  } else {
    ;((data.questions as any[]) ?? []).forEach((item, i) => {
      const q = nonEmptyString(item?.q)
      const a = nonEmptyString(item?.a)
      // Một câu hỏng không đáng làm mất cả note — bỏ câu đó, giữ phần còn lại.
      if (!q || !a) {
        errors.push(`${file}: questions[${i}] thiếu q hoặc a`)
        return
      }
      // id sai/trùng không bỏ câu hỏi — chỉ bỏ id, flashcard quay về key theo vị trí.
      let id: string | null = null
      if (item?.id != null) {
        if (!isQuestionId(item.id)) {
          errors.push(
            `${file}: questions[${i}] id "${item.id}" phải bắt đầu bằng chữ cái, chỉ gồm a-z 0-9 - _`,
          )
        } else if (questions.some((x) => x.id === item.id)) {
          errors.push(`${file}: questions[${i}] id "${item.id}" trùng`)
        } else {
          id = item.id
        }
      }
      questions.push({ q, a, id })
    })
  }
  if (data.updated != null && !normalizeDate(data.updated, 'day')) {
    problems.push('updated phải có dạng YYYY-MM-DD')
  }

  if (problems.length) {
    errors.push(`${file}: ${problems.join(', ')}`)
    return { data: null, errors }
  }
  return {
    data: {
      slug,
      title: title!,
      tags: tags!,
      questions,
      updated: normalizeDate(data.updated, 'day'),
      body: content,
    },
    errors,
  }
}

function toMeta({ body: _body, ...meta }: Note): NoteMeta {
  return meta
}

async function readNote(topic: string, slug: string): Promise<WithErrors<Note | null> | null> {
  const name = slug === 'index' ? 'index.md' : `${slug}.md`
  const raw = await readOptional(join(contentDir(), 'learn', topic, name))
  return raw == null ? null : parseNote(raw, slug, `learn/${topic}/${name}`)
}

async function listNoteSlugs(topic: string, errors: string[]): Promise<string[]> {
  const slugs: string[] = []
  for (const e of await listDir(join(contentDir(), 'learn', topic))) {
    if (e.isDir || !e.name.endsWith('.md') || e.name === 'index.md') continue
    const slug = e.name.slice(0, -3)
    if (isSlug(slug)) slugs.push(slug)
    else errors.push(`learn/${topic}/${e.name}: tên file chỉ được chứa a-z 0-9 - _`)
  }
  return slugs
}

export async function listTopics(): Promise<WithErrors<TopicSummary[]>> {
  const errors: string[] = []
  const topics: TopicSummary[] = []
  for (const e of await listDir(join(contentDir(), 'learn'))) {
    if (!e.isDir) continue
    if (!isSlug(e.name)) {
      errors.push(`learn/${e.name}/: tên thư mục chỉ được chứa a-z 0-9 - _`)
      continue
    }
    const index = await readNote(e.name, 'index')
    if (!index) {
      errors.push(`learn/${e.name}/: thiếu index.md`)
      continue
    }
    errors.push(...index.errors)
    if (!index.data) continue
    const noteCount = (await listNoteSlugs(e.name, [])).length
    topics.push({ ...toMeta(index.data), slug: e.name, noteCount })
  }
  topics.sort((a, b) => a.title.localeCompare(b.title, 'vi'))
  return { data: topics, errors }
}

/** null = topic không tồn tại (hoặc slug không hợp lệ) → trang trả 404. */
export async function loadTopic(
  topic: unknown,
): Promise<WithErrors<{ index: Note; notes: NoteMeta[] }> | null> {
  if (!isSlug(topic)) return null
  const index = await readNote(topic, 'index')
  if (!index?.data) return null

  const errors = [...index.errors]
  const notes: NoteMeta[] = []
  for (const slug of await listNoteSlugs(topic, errors)) {
    const note = await readNote(topic, slug)
    if (!note) continue
    errors.push(...note.errors)
    if (note.data) notes.push(toMeta(note.data))
  }
  notes.sort((a, b) => a.title.localeCompare(b.title, 'vi'))

  // id câu hỏi là khoá flashcard theo topic → phải duy nhất trên mọi note của topic.
  const seen = new Map<string, string>()
  for (const n of [{ ...index.data, slug: 'index' }, ...notes]) {
    for (const q of n.questions) {
      if (!q.id) continue
      const first = seen.get(q.id)
      if (first)
        errors.push(`learn/${topic}/${n.slug}.md: id câu hỏi "${q.id}" đã dùng ở ${first}.md`)
      else seen.set(q.id, n.slug)
    }
  }
  return { data: { index: { ...index.data, slug: topic }, notes }, errors }
}

export async function loadNote(topic: unknown, note: unknown): Promise<WithErrors<Note> | null> {
  // `index` là tổng quan topic, đã hiện ở /me/learn/[topic] — không cho trùng URL.
  if (!isSlug(topic) || !isSlug(note) || note === 'index') return null
  const result = await readNote(topic, note)
  if (!result?.data) return null
  return { data: result.data, errors: result.errors }
}

// ---------- case studies ----------

export function parseCaseStudy(
  raw: string,
  slug: string,
  file: string,
): WithErrors<CaseStudy | null> {
  const errors: string[] = []
  const fm = parseFrontmatter(raw, file, errors)
  if (!fm) return { data: null, errors }
  const { data, content } = fm

  const problems: string[] = []
  const title = nonEmptyString(data.title)
  const summary = nonEmptyString(data.summary)
  const tags = stringArray(data.tags)
  // Thiếu visibility thì coi là private — mặc định an toàn, không tự thành ứng viên public.
  const visibility = data.visibility == null ? 'private' : oneOf(data.visibility, VISIBILITIES)
  if (!title) problems.push('thiếu title')
  if (!summary) problems.push('thiếu summary')
  if (!tags) problems.push('tags phải là mảng chuỗi')
  if (!visibility) problems.push(`visibility phải là một trong ${VISIBILITIES.join(' | ')}`)
  if (data.updated != null && !normalizeDate(data.updated, 'day')) {
    problems.push('updated phải có dạng YYYY-MM-DD')
  }

  if (problems.length) {
    errors.push(`${file}: ${problems.join(', ')}`)
    return { data: null, errors }
  }
  return {
    data: {
      slug,
      title: title!,
      summary: summary!,
      tags: tags!,
      visibility: visibility!,
      updated: normalizeDate(data.updated, 'day'),
      body: content,
    },
    errors,
  }
}

/** Tách excerpt: phần trước `<!-- truncate -->`. Chấp cả `<!--truncate-->`. */
const TRUNCATE_RE = /<!--\s*truncate\s*-->/

export function splitExcerpt(content: string): string {
  const parts = content.split(TRUNCATE_RE)
  // Không có separator thì lấy đoạn văn đầu tiên — đủ cho trang list, không phải
  // cả bài. Cố ý không cắt theo số ký tự: cắt giữa câu đọc rất tệ.
  const head = parts.length > 1 ? parts[0] : (content.trim().split(/\n{2,}/)[0] ?? '')
  return head.trim()
}

/**
 * Bài blog private. Frontmatter tương thích blog public — xem PostMeta.
 *
 * `slug` lấy từ **tên file**, không từ frontmatter: tên file là thứ quyết định URL,
 * nên để frontmatter tự khai `slug` khác tên file là mời gọi hai nguồn sự thật.
 * Blog public khai `slug` trong frontmatter, nên khi `git mv` sang `blog/` thì nhớ
 * thêm lại dòng đó cho khớp tên file.
 */
export function parsePost(raw: string, slug: string, file: string): WithErrors<Post | null> {
  const errors: string[] = []
  const fm = parseFrontmatter(raw, file, errors)
  if (!fm) return { data: null, errors }
  const { data, content } = fm

  const problems: string[] = []
  const title = nonEmptyString(data.title)
  const tags = stringArray(data.tags)
  const date = nonEmptyString(data.date)
  // Thiếu visibility thì coi là private — mặc định an toàn, giống case-studies.
  const visibility = data.visibility == null ? 'private' : oneOf(data.visibility, VISIBILITIES)
  if (!title) problems.push('thiếu title')
  if (!tags) problems.push('tags phải là mảng chuỗi')
  if (!date) problems.push('thiếu date')
  else if (Number.isNaN(Date.parse(date))) problems.push('date không phải thời điểm hợp lệ')
  if (!visibility) problems.push(`visibility phải là một trong ${VISIBILITIES.join(' | ')}`)

  if (problems.length) {
    errors.push(`${file}: ${problems.join(', ')}`)
    return { data: null, errors }
  }
  return {
    data: {
      slug,
      title: title!,
      author: nonEmptyString(data.author),
      tags: tags!,
      date: date!,
      image: nonEmptyString(data.image),
      visibility: visibility!,
      excerpt: splitExcerpt(content),
      body: content,
    },
    errors,
  }
}

export async function listPosts(): Promise<WithErrors<PostMeta[]>> {
  const errors: string[] = []
  const items: PostMeta[] = []
  for (const e of await listDir(join(contentDir(), 'posts'))) {
    if (e.isDir || !e.name.endsWith('.md')) continue
    const slug = e.name.slice(0, -3)
    if (!isSlug(slug)) {
      errors.push(`posts/${e.name}: tên file chỉ được chứa a-z 0-9 - _`)
      continue
    }
    const post = await loadPost(slug)
    if (!post) continue
    errors.push(...post.errors)
    if (post.data) {
      const { body: _body, ...meta } = post.data
      items.push(meta)
    }
  }
  // Mới nhất lên đầu, theo date của frontmatter chứ không theo mtime của file.
  items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  return { data: items, errors }
}

export async function loadPost(slug: unknown): Promise<WithErrors<Post | null> | null> {
  if (!isSlug(slug)) return null
  const file = `posts/${slug}.md`
  const raw = await readOptional(join(contentDir(), file))
  return raw == null ? null : parsePost(raw, slug, file)
}

export async function listCaseStudies(): Promise<WithErrors<CaseStudyMeta[]>> {
  const errors: string[] = []
  const items: CaseStudyMeta[] = []
  for (const e of await listDir(join(contentDir(), 'case-studies'))) {
    if (e.isDir || !e.name.endsWith('.md')) continue
    const slug = e.name.slice(0, -3)
    if (!isSlug(slug)) {
      errors.push(`case-studies/${e.name}: tên file chỉ được chứa a-z 0-9 - _`)
      continue
    }
    const cs = await loadCaseStudy(slug)
    if (!cs) continue
    errors.push(...cs.errors)
    if (cs.data) {
      const { body: _body, ...meta } = cs.data
      items.push(meta)
    }
  }
  items.sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''))
  return { data: items, errors }
}

export async function loadCaseStudy(slug: unknown): Promise<WithErrors<CaseStudy | null> | null> {
  if (!isSlug(slug)) return null
  const file = `case-studies/${slug}.md`
  const raw = await readOptional(join(contentDir(), file))
  return raw == null ? null : parseCaseStudy(raw, slug, file)
}
