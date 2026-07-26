import { StorageKeys } from '@/constants/storage-key'
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
 *
 * QUAN TRỌNG: hook này nhận danh sách slug qua tham số thay vì tự import
 * LESSONS, và import StorageKeys từ module cụ thể chứ không qua barrel
 * `@/constants`. Lý do: hook nằm trong chuỗi import của `_app` (qua
 * `@/components/common` → header → `@/hooks`), nên mọi thứ nó chạm tới sẽ bị
 * gộp vào bundle dùng chung của TOÀN BỘ site. Import LESSONS ở đây từng kéo
 * nội dung 13 buổi vào mọi trang, kể cả trang chủ và blog.
 *
 * @param knownSlugs Bỏ trống khi chỉ cần đọc/ghi một slug cụ thể (trang chi
 * tiết). Truyền vào khi cần lọc slug mồ côi và tính phần trăm (trang lộ trình).
 */
export function useLessonProgress(knownSlugs?: string[]) {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Chuỗi hóa để dependency ổn định kể cả khi phía gọi tạo mảng mới mỗi render.
  const slugKey = knownSlugs?.join('|') ?? ''

  useEffect(() => {
    const slugs = slugKey ? slugKey.split('|') : undefined
    try {
      setCompletedSlugs(parseCompletedSlugs(window.localStorage.getItem(KEY), slugs))
    } catch {
      // localStorage bị chặn (private mode, cấu hình trình duyệt) — coi như
      // chưa ôn buổi nào, phần đọc nội dung vẫn dùng được bình thường.
    }
    setHydrated(true)
  }, [slugKey])

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

  const total = knownSlugs?.length ?? 0
  const percent = computeProgressPercent(completedSlugs.length, total)

  return {
    completed,
    completedCount: completedSlugs.length,
    total,
    hydrated,
    isCompleted,
    toggle,
    reset,
    percent,
  }
}
