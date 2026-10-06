// Flashcard theo topic: lấy thẻ từ questions[] trong notes, lưu lịch ôn. CHỈ CHẠY Ở SERVER.
//
// Hai file cạnh practice log (thư mục rw duy nhất — content là :ro):
//   flashcard-state.json  { "<topic>/<index>": { last, interval, due } } — lịch hiện tại
//   flashcard-log.jsonl   một dòng mỗi lần tự đánh giá — lịch sử cho streak/heatmap.
// State chỉ giữ lần ôn CUỐI của mỗi thẻ; tính chuỗi ngày từ state thì ôn lại một
// thẻ là xoá mất ngày ôn trước của nó. Nên lịch sử phải nằm ở log riêng.
import { appendFile, mkdir, readFile, rename, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { cardKey, FlashcardState, Rating, schedule } from './flashcard-schedule'
import { practiceLogPath } from './practice'
import { vnDay } from './practice-insights'
import { loadNote, loadTopic } from './private-content'
import type { Question } from './private-content-schema'

export function flashcardStatePath(): string {
  return join(dirname(practiceLogPath()), 'flashcard-state.json')
}

export function flashcardLogPath(): string {
  return join(dirname(practiceLogPath()), 'flashcard-log.jsonl')
}

export interface Flashcard {
  key: string
  index: number
  q: string
  a: string
  source: string // tiêu đề note chứa câu hỏi
}

/**
 * Thẻ của topic: câu hỏi trong index.md trước, rồi tới từng note theo thứ tự
 * loader trả về. Key là `<topic>/<id>` khi câu hỏi có id — ổn định dù thêm/xoá
 * câu khác. Không có id thì dùng vị trí trong danh sách này: chèn câu vào giữa
 * hay đổi tên note (đổi thứ tự) sẽ xáo lịch ôn của các thẻ phía sau.
 */
export async function topicCards(topic: unknown): Promise<Flashcard[] | null> {
  const loaded = await loadTopic(topic)
  if (!loaded) return null
  const { index, notes } = loaded.data
  const groups: { source: string; questions: Question[] }[] = [
    { source: index.title, questions: index.questions },
  ]
  for (const n of notes) {
    const note = await loadNote(index.slug, n.slug)
    if (note) groups.push({ source: note.data.title, questions: note.data.questions })
  }
  const cards: Flashcard[] = []
  const usedIds = new Set<string>()
  for (const g of groups) {
    for (const q of g.questions) {
      const i = cards.length
      // id trùng giữa hai note: loadTopic đã báo lỗi; thẻ sau quay về key theo vị trí.
      const id = q.id && !usedIds.has(q.id) ? q.id : null
      if (id) usedIds.add(id)
      cards.push({ key: cardKey(index.slug, id ?? i), index: i, q: q.q, a: q.a, source: g.source })
    }
  }
  return cards
}

function sanitize(raw: unknown): FlashcardState {
  const out: FlashcardState = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  const day = /^\d{4}-\d{2}-\d{2}$/
  for (const [k, v] of Object.entries(raw as Record<string, any>)) {
    if (
      v &&
      day.test(v.last) &&
      day.test(v.due) &&
      Number.isInteger(v.interval) &&
      v.interval > 0
    ) {
      out[k] = { last: v.last, interval: v.interval, due: v.due }
    }
  }
  return out
}

export async function readFlashcardState(path = flashcardStatePath()): Promise<FlashcardState> {
  try {
    return sanitize(JSON.parse(await readFile(path, 'utf8')))
  } catch {
    return {} // chưa có file / hỏng → bắt đầu lại, không làm sập trang
  }
}

/** Ngày (giờ VN) của mọi lần tự đánh giá — mỗi phần tử một lần. */
export async function readFlashcardDays(path = flashcardLogPath()): Promise<string[]> {
  let raw = ''
  try {
    raw = await readFile(path, 'utf8')
  } catch {
    return []
  }
  const days: string[] = []
  for (const line of raw.split('\n')) {
    try {
      const e = JSON.parse(line)
      if (typeof e?.ts === 'string') days.push(vnDay(e.ts))
    } catch {
      // dòng hỏng/trống: bỏ qua
    }
  }
  return days
}

let queue: Promise<unknown> = Promise.resolve()

/** Ghi lịch mới cho một thẻ (atomic, tuần tự) và append một dòng log. */
export function rateCard(key: string, rating: Rating, now = new Date()) {
  const run = queue.then(async () => {
    const statePath = flashcardStatePath()
    const state = await readFlashcardState(statePath)
    const next = schedule(rating, state[key], vnDay(now))
    state[key] = next
    await mkdir(dirname(statePath), { recursive: true })
    const tmp = `${statePath}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8')
    await rename(tmp, statePath)
    await appendFile(
      flashcardLogPath(),
      JSON.stringify({ ts: now.toISOString(), card: key, rating }) + '\n',
      'utf8',
    )
    return next
  })
  queue = run.catch(() => undefined)
  return run
}
