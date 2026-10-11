import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'

export interface TermSample {
  term: string
  short: string
}

interface TermCardProps {
  /** Bộ thuật ngữ server chọn sẵn (pickTermSample) — thứ tự cố định để HTML server khớp client. */
  terms: TermSample[]
}

/**
 * Một thuật ngữ trong glossary kèm định nghĩa một dòng; "Từ khác" đổi sang
 * thuật ngữ kế tiếp trong bộ. Link dẫn tới đúng thẻ ở /glossary nhờ deep-link
 * `#<term>` mà trang đó đã hỗ trợ.
 */
export function TermCard({ terms }: TermCardProps) {
  const [index, setIndex] = useState(0)
  if (terms.length === 0) return null
  const current = terms[index % terms.length]

  return (
    <Box
      component="section"
      aria-labelledby="term-card-heading"
      sx={{
        p: 2.5,
        bgcolor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: '12px',
      }}
    >
      <Typography id="term-card-heading" component="h2" sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
        Thuật ngữ ngẫu nhiên
      </Typography>

      {/* aria-live: trình đọc màn hình đọc lại thuật ngữ mới sau khi bấm "Từ khác". */}
      <Box aria-live="polite" sx={{ mt: 1, mb: 2 }}>
        <Typography component="p" sx={{ fontSize: '1.3125rem', fontWeight: 600, lineHeight: 1.3, mb: 0.75 }}>
          {current.term}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'text.secondary' }}>{current.short}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Box
          component={Link}
          href={`/glossary#${encodeURIComponent(current.term)}`}
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'primary.main',
            textDecoration: 'underline',
            textDecorationThickness: '1px',
            textUnderlineOffset: '3px',
            '&:hover': { textDecorationThickness: '2px' },
            '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
          }}
        >
          Xem giải thích
        </Box>
        {terms.length > 1 && (
          <Box
            component="button"
            type="button"
            onClick={() => setIndex((i) => (i + 1) % terms.length)}
            sx={{
              px: 1.5,
              py: 0.5,
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              color: 'text.secondary',
              bgcolor: 'transparent',
              border: '1px solid var(--color-line)',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
              '&:hover': { borderColor: 'var(--color-ink-muted)', color: 'text.primary' },
              '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
            }}
          >
            Từ khác
          </Box>
        )}
      </Box>
    </Box>
  )
}
