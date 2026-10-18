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
    <Box component="nav" aria-label="Chủ đề và mục khác">
      {/* Mobile đã có chip lọc chủ đề ngay trên danh sách bài (recent-log.tsx),
          lặp lại ở đây chỉ dài trang — nên track chỉ hiện từ md. */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', mb: 1.5 }}>
          Chủ đề
        </Typography>
        <TopicList items={tracks} withBars />
      </Box>
      {extras.length > 0 && (
        <Box sx={{ mt: { md: 2 }, pt: { md: 2 }, borderTop: { md: '1px solid var(--color-line)' } }}>
          <Typography
            component="h2"
            sx={{ display: { md: 'none' }, fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
          >
            Khám phá thêm
          </Typography>
          <TopicList items={extras} />
        </Box>
      )}
    </Box>
  )
}

// withBars: thanh mảnh dưới mỗi track, dài theo số bài so với track nhiều bài
// nhất — đọc nhanh blog nặng về chủ đề nào. Thanh tĩnh, mỗi track một màu
// (--track-<key>, globals.css) nhưng không dùng xanh lá: đây là dữ liệu, không
// phải link hay trạng thái.
function TopicList({ items, withBars = false }: { items: TopicLink[]; withBars?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.count))
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
          {withBars && (
            <Box aria-hidden sx={{ height: 3, mb: 0.75, borderRadius: 2, bgcolor: 'var(--color-line)' }}>
              <Box
                sx={{
                  width: `${(item.count / max) * 100}%`,
                  height: '100%',
                  borderRadius: 2,
                  // Màu riêng của track (globals.css); key lạ thì rơi về màu chữ phụ.
                  bgcolor: `var(--track-${item.key}, var(--color-ink-muted))`,
                }}
              />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
