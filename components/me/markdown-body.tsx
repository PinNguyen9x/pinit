import { articleBodySx } from '@/components/blog/article-body'
import { useCodeCopyButtons } from '@/hooks/use-code-copy-buttons'
import { useDiagramZoomTargets, ZOOMABLE_DIAGRAM } from '@/hooks/use-diagram-zoom-targets'
import { Box, useTheme } from '@mui/material'
import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { DiagramZoomDialog } from './diagram-zoom-dialog'

/**
 * HTML từ utils/markdown.ts — cùng pipeline và cùng style với bài blog. Mermaid
 * đã thành SVG ở server, nên trang không tải renderer nào. Raw HTML trong
 * markdown được giữ nguyên (rehype-raw): content do chính owner viết.
 *
 * Bấm (hoặc Enter/Space) vào sơ đồ để mở toàn màn hình: sơ đồ trong thân bài bị
 * co theo chiều rộng cột chữ, sơ đồ ngang rộng gần như không đọc được.
 */
export function MarkdownBody({ html, resetKey }: { html: string; resetKey: string }) {
  const bodySx = articleBodySx(useTheme().palette.mode === 'dark')
  const [zoom, setZoom] = useState<{ svg: string; index: number } | null>(null)
  useCodeCopyButtons('me-article-body', resetKey)
  useDiagramZoomTargets('me-article-body', resetKey)

  // Event delegation: sơ đồ nằm trong innerHTML do React set lại bất chợt, gắn
  // listener vào từng sơ đồ sẽ mất; listener ở container thì không.
  function figures() {
    return Array.from(
      document.getElementById('me-article-body')?.querySelectorAll<HTMLElement>(ZOOMABLE_DIAGRAM) ??
        [],
    )
  }

  function openFrom(target: EventTarget) {
    const fig = (target as Element).closest?.<HTMLElement>(ZOOMABLE_DIAGRAM)
    const svg = fig?.querySelector('svg')
    if (fig && svg) setZoom({ svg: svg.outerHTML, index: figures().indexOf(fig) })
  }

  // Trả focus về đúng sơ đồ vừa mở. Tìm lại theo thứ tự chứ không giữ tham chiếu
  // node: innerHTML có thể đã bị set lại trong lúc dialog mở, node cũ đã lìa cây.
  function close() {
    const index = zoom?.index ?? -1
    setZoom(null)
    requestAnimationFrame(() => figures()[index]?.focus())
  }

  return (
    <>
      <Box
        id="me-article-body"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e: MouseEvent) => openFrom(e.target)}
        onKeyDown={(e: KeyboardEvent) => {
          if (
            (e.key === 'Enter' || e.key === ' ') &&
            (e.target as Element).matches?.(ZOOMABLE_DIAGRAM)
          ) {
            e.preventDefault()
            openFrom(e.target)
          }
        }}
        sx={[
          // SxProps có thể đã là mảng — trải ra thay vì lồng (mẫu gộp sx của MUI).
          ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
          {
            [`& ${ZOOMABLE_DIAGRAM}`]: { cursor: 'zoom-in' },
            [`& ${ZOOMABLE_DIAGRAM}:focus-visible`]: {
              outline: '2px solid var(--diagram-accent)',
              outlineOffset: 2,
            },
          },
        ]}
      />
      <DiagramZoomDialog svg={zoom?.svg ?? null} onClose={close} disableRestoreFocus />
    </>
  )
}
