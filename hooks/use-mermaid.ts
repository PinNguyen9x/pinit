import { RefObject, useEffect } from 'react'

/**
 * Render mọi node `.mermaid` bên trong container thành SVG.
 *
 * Tách từ pattern đang chạy ở pages/blog/[slug].tsx và
 * pages/works/[workId]/details.tsx. mermaid chỉ chạy được ở browser và khá
 * nặng nên phải dynamic import — giữ nó ra khỏi bundle của trang lộ trình.
 *
 * Khác hai chỗ cũ ở hai điểm:
 *   - securityLevel 'strict' thay vì 'loose': diagram do repo kiểm soát và
 *     không cần click handler, không có lý do nới lỏng.
 *   - Lưu lại mã nguồn gốc để render lại được khi đổi theme sáng/tối.
 *     mermaid.run() bỏ qua node đã có data-processed, nên nếu không khôi phục
 *     text gốc thì đổi theme sẽ không vẽ lại.
 */
export function useMermaid(containerRef: RefObject<HTMLElement | null>, isDark: boolean) {
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    const nodes = Array.from(container.querySelectorAll<HTMLElement>('.mermaid'))
    if (nodes.length === 0) return

    nodes.forEach((node) => {
      if (node.dataset.mermaidSrc === undefined) {
        node.dataset.mermaidSrc = node.textContent ?? ''
      } else {
        // Lần chạy lại (đổi theme): trả node về mã nguồn để mermaid vẽ lại.
        node.textContent = node.dataset.mermaidSrc
        delete node.dataset.processed
      }
      node.removeAttribute('data-processed')
    })

    import('mermaid' as any).then((mod: any) => {
      if (cancelled) return
      const mermaid = mod.default
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'strict',
      })
      mermaid
        .run({ nodes })
        .catch((err: any) => console.error('Mermaid render error:', err))
    })

    return () => {
      cancelled = true
    }
  }, [containerRef, isDark])
}
