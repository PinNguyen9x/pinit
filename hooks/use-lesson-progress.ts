import { LESSONS, StorageKeys } from '@/constants'
import { computeProgressPercent, parseCompletedSlugs, toggleSlug } from '@/utils/system-design'
import { useCallback, useEffect, useMemo, useState } from 'react'

const KEY = StorageKeys.SYSTEM_DESIGN_PROGRESS

/**
 * Tiến độ ôn tập lưu ở localStorage.
 *
 * KHÔNG đọc localStorage trong thân render — server render ra 0% còn client
 * render ra giá trị thật sẽ gây hydration mismatch. State khởi tạo rỗng,
 * useEffect đọc rồi set, và UI chỉ hiện số khi `hydrated` là true.
 *
 * Lưu slug thay vì index để chèn thêm buổi vào giữa lộ trình không làm lệch
 * tiến độ đã tick.
 */
export function useLessonProgress() {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  const knownSlugs = useMemo(() => LESSONS.map((lesson) => lesson.slug), [])

  useEffect(() => {
    try {
      setCompletedSlugs(parseCompletedSlugs(window.localStorage.getItem(KEY), knownSlugs))
    } catch {
      // localStorage bị chặn (private mode, cấu hình trình duyệt) — coi như
      // chưa ôn buổi nào, phần đọc nội dung vẫn dùng được bình thường.
    }
    setHydrated(true)
  }, [knownSlugs])

  const persist = useCallback((next: string[]) => {
    setCompletedSlugs(next)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // Hết quota hoặc bị chặn ghi — giữ nguyên state trong phiên này để UI
      // vẫn phản hồi, chỉ mất tính bền vững sau khi reload.
    }
  }, [])

  const toggle = useCallback(
    (slug: string) => persist(toggleSlug(completedSlugs, slug)),
    [completedSlugs, persist],
  )

  const reset = useCallback(() => persist([]), [persist])

  const completed = useMemo(() => new Set(completedSlugs), [completedSlugs])

  const isCompleted = useCallback((slug: string) => completed.has(slug), [completed])

  const percent = computeProgressPercent(completedSlugs.length, LESSONS.length)

  return {
    completed,
    completedCount: completedSlugs.length,
    total: LESSONS.length,
    hydrated,
    isCompleted,
    toggle,
    reset,
    percent,
  }
}
