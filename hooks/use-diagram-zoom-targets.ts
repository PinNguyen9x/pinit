import { useEffect } from 'react'

/** Sơ đồ phóng to được: mọi `figure.diagram` trừ bản dựng hỏng (chỉ có mã nguồn). */
export const ZOOMABLE_DIAGRAM = 'figure.diagram:not(.diagram--failed)'

/**
 * Biến mỗi sơ đồ trong container thành "nút" dùng được bằng bàn phím: tabindex,
 * role, nhãn. Còn việc mở dialog thì container bắt bằng event delegation — click
 * và Enter đi lên tới container nên không cần gắn listener vào từng sơ đồ.
 *
 * Quan sát DOM vì cùng lý do với useCodeCopyButtons: thân bài render bằng
 * `dangerouslySetInnerHTML`, React set lại innerHTML bất chợt (đổi theme…) và
 * quét sạch mọi thuộc tính đã gắn.
 */
export function useDiagramZoomTargets(containerId: string, contentKey?: string) {
  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    // Idempotent: chỉ đụng sơ đồ chưa gắn, để không sinh mutation tự gọi lại.
    const decorate = () => {
      container.querySelectorAll<HTMLElement>(ZOOMABLE_DIAGRAM).forEach((fig) => {
        if (fig.dataset.zoomable === 'true') return
        fig.dataset.zoomable = 'true'
        fig.tabIndex = 0
        fig.setAttribute('role', 'button')
        fig.setAttribute('aria-label', 'Phóng to sơ đồ')
        fig.title = 'Bấm để phóng to'
      })
    }

    decorate()
    const observer = new MutationObserver(decorate)
    observer.observe(container, { childList: true })
    return () => observer.disconnect()
  }, [containerId, contentKey])
}
