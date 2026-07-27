import { glossaryHref } from '@/utils/system-design'
import { Box } from '@mui/material'
import Link from 'next/link'
import { useSystemDesignTokens } from './tokens'

export interface TermLinkProps {
  term: string
}

/**
 * Thuật ngữ trong bài, dẫn sang định nghĩa ở trang từ điển.
 * Thuật ngữ chưa có trong glossary vẫn dẫn về /glossary (không 404) — trang
 * đó tự bỏ qua hash lạ.
 */
export function TermLink({ term }: TermLinkProps) {
  const { accent } = useSystemDesignTokens()

  return (
    <Box
      component={Link}
      href={glossaryHref(term)}
      sx={{
        color: accent,
        textDecoration: 'none',
        borderBottom: '1px dashed',
        borderColor: 'currentColor',
        '&:hover': { borderBottomStyle: 'solid' },
      }}
    >
      {term}
    </Box>
  )
}
