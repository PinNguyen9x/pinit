import { Box, Typography } from '@mui/material'
import Link from 'next/link'

export interface TopicLink {
  key: string
  title: string
  count: number
  href: string | { pathname: string; query: Record<string, string> }
}

interface TopicNavProps {
  tracks: TopicLink[]
  /** Glossary và system design — nhóm riêng vì không phải track của blog. */
  extras: TopicLink[]
}

/**
 * Điều hướng phụ. Một markup, hai dáng: dưới md là chip xuống dòng tự nhiên
 * (không cuộn ngang), từ md là cột bên phải dạng mục lục "tên ... số".
 * Số đếm đứng cạnh từng chủ đề — chỗ duy nhất nó giúp người đọc chọn bài.
 */
export function TopicNav({ tracks, extras }: TopicNavProps) {
  if (tracks.length === 0 && extras.length === 0) return null

  return (
    <Box component="nav" aria-labelledby="topic-nav-heading">
      <Typography
        id="topic-nav-heading"
        component="h2"
        sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', mb: { xs: 1, md: 1.5 } }}
      >
        Chủ đề
      </Typography>
      <TopicList items={tracks} />
      {extras.length > 0 && (
        <Box sx={{ mt: { xs: 1, md: 2 }, pt: { md: 2 }, borderTop: { md: '1px solid var(--color-line)' } }}>
          <TopicList items={extras} />
        </Box>
      )}
    </Box>
  )
}

function TopicList({ items }: { items: TopicLink[] }) {
  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        flexDirection: { md: 'column' },
        // md: hàng mục lục sát nhau, không còn khoảng cách kiểu chip
        rowGap: { md: 0.25 },
      }}
    >
      {items.map((item) => (
        <Box component="li" key={item.key}>
          <Box
            component={Link}
            href={item.href}
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1,
              fontSize: '0.875rem',
              lineHeight: 1.4,
              color: 'text.primary',
              transition: 'color 0.15s, border-color 0.15s',
              // xs: chip
              px: { xs: 1.5, md: 0 },
              py: { xs: 0.75, md: 0.625 },
              border: { xs: '1px solid var(--color-line)', md: 'none' },
              borderRadius: { xs: '999px', md: '2px' },
              '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
              '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
            }}
          >
            <span>{item.title}</span>
            <Box
              component="span"
              sx={{
                ml: { md: 'auto' },
                color: 'text.secondary',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.8125rem',
              }}
            >
              {item.count}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
