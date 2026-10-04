// Trạng thái tick checklist của roadmap. CHỈ CHẠY Ở SERVER.
//
// Không nằm trong roadmap.yaml: thư mục content mount `:ro` và được cập nhật
// bằng `git pull` — app không được ghi vào đó. File này nằm cạnh practice log
// (thư mục rw duy nhất của container), nên đi theo PRACTICE_LOG_PATH.
import { constants } from 'fs'
import { access, mkdir, readFile, rename, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { practiceLogPath } from './practice'
import type { RoadmapState } from './private-content-schema'

export function roadmapStatePath(): string {
  return join(dirname(practiceLogPath()), 'roadmap-state.json')
}

/** Chỉ giữ cấu trúc hợp lệ `{ milestone: { item: true } }` — file sửa tay hỏng không làm sập trang. */
function sanitize(raw: unknown): RoadmapState {
  const state: RoadmapState = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state
  for (const [mid, items] of Object.entries(raw as Record<string, unknown>)) {
    if (!items || typeof items !== 'object' || Array.isArray(items)) continue
    for (const [cid, v] of Object.entries(items as Record<string, unknown>)) {
      if (v === true) (state[mid] ??= {})[cid] = true
    }
  }
  return state
}

export async function readRoadmapState(
  path = roadmapStatePath(),
): Promise<{ state: RoadmapState; error: string | null }> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return { state: {}, error: null }
    return { state: {}, error: `Không đọc được roadmap-state.json (${code ?? 'lỗi'})` }
  }
  try {
    return { state: sanitize(JSON.parse(raw)), error: null }
  } catch {
    return {
      state: {},
      error: 'roadmap-state.json không phải JSON hợp lệ — tick sẽ ghi đè file này',
    }
  }
}

export async function checkStateWritable(path = roadmapStatePath()): Promise<string | null> {
  for (const target of [path, dirname(path)]) {
    try {
      await access(target, constants.W_OK)
      return null
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code ?? 'UNKNOWN'
      if (code !== 'ENOENT' || target !== path) return code
    }
  }
  return null
}

// Hàng đợi ghi: hai cú tick liên tiếp (đọc → sửa → ghi) chạy chồng nhau thì
// cú sau ghi đè mất cú trước. Một process, một owner — mutex trong RAM là đủ.
let queue: Promise<unknown> = Promise.resolve()

export function setChecklistItem(
  milestoneId: string,
  checklistId: string,
  done: boolean,
  path = roadmapStatePath(),
): Promise<RoadmapState> {
  const run = queue.then(async () => {
    const { state } = await readRoadmapState(path)
    if (done) {
      ;(state[milestoneId] ??= {})[checklistId] = true
    } else if (state[milestoneId]) {
      delete state[milestoneId][checklistId]
      if (!Object.keys(state[milestoneId]).length) delete state[milestoneId]
    }
    // Ghi file tạm rồi rename: tắt điện giữa chừng không để lại JSON cụt.
    await mkdir(dirname(path), { recursive: true })
    const tmp = `${path}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8')
    await rename(tmp, path)
    return state
  })
  queue = run.catch(() => undefined)
  return run
}
