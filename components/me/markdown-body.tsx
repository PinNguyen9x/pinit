import { articleBodySx } from '@/components/blog/article-body'
import { useCodeCopyButtons } from '@/hooks/use-code-copy-buttons'
import { Box, useTheme } from '@mui/material'

/**
 * HTML từ utils/markdown.ts — cùng pipeline và cùng style với bài blog. Mermaid
 * đã thành SVG ở server, nên trang không tải renderer nào. Raw HTML trong
 * markdown được giữ nguyên (rehype-raw): content do chính owner viết.
 */
export function MarkdownBody({ html, resetKey }: { html: string; resetKey: string }) {
  const isDark = useTheme().palette.mode === 'dark'
  useCodeCopyButtons('me-article-body', resetKey)
  return (
    <Box
      id="me-article-body"
      dangerouslySetInnerHTML={{ __html: html }}
      sx={articleBodySx(isDark)}
    />
  )
}
