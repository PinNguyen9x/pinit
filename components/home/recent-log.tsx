import { LogDay } from '@/utils/home'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'

interface RecentLogProps {
  days: LogDay[]
  totalPosts: number
}

/**
 * Khối nhật ký — điểm nhấn duy nhất của trang chủ: các bài mới nhất nhóm theo
 * ngày đăng thật, bài mới nhất có vệt xanh (class `log-marker`, xem globals.css).
 */
export function RecentLog({ days, totalPosts }: RecentLogProps) {
  if (days.length === 0) return null

  return (
    <Box
      component="section"
      aria-labelledby="recent-log-heading"
      sx={{
        bgcolor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: '12px',
        px: { xs: 2, md: 3 },
        py: { xs: 1.75, md: 2.5 },
      }}
    >
      <Typography id="recent-log-heading" component="h2" sx={visuallyHidden}>
        Bài mới
      </Typography>

      {days.map((day, dayIndex) => (
        <Box key={day.key} sx={{ mt: dayIndex === 0 ? 0 : { xs: 1.75, md: 2.25 } }}>
          <Typography
            component="h3"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
              mb: 0.75,
            }}
          >
            {day.label}
          </Typography>

          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {day.entries.map((entry, entryIndex) => {
              const isNewest = dayIndex === 0 && entryIndex === 0
              return (
                <Box component="li" key={entry.slug} sx={{ '& + &': { mt: 1.25 } }}>
                  <Box
                    component={Link}
                    href={`/blog/${entry.slug}`}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                      fontWeight: 500,
                      lineHeight: 1.45,
                      color: 'text.primary',
                      borderRadius: '2px',
                      transition: 'color 0.15s',
                      '&:hover': { color: 'primary.main' },
                      '&:focus-visible': {
                        outline: '2px solid var(--color-accent)',
                        outlineOffset: '3px',
                      },
                    }}
                  >
                    {isNewest ? (
                      <span className="log-marker">{renderTitle(entry.title)}</span>
                    ) : (
                      renderTitle(entry.title)
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      ))}

      <Box
        component={Link}
        href="/blog"
        sx={{
          display: 'inline-block',
          mt: { xs: 2, md: 2.5 },
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationThickness: '1px',
          '&:hover': { textDecorationThickness: '2px' },
          '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '3px' },
        }}
      >
        Đọc tất cả {totalPosts} bài
      </Box>
    </Box>
  )
}

// Tiêu đề trong frontmatter có thể chứa `code` (vd. "script `agents`") — hiện
// thành <code> thay vì in nguyên dấu backtick.
function renderTitle(title: string) {
  return title.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <Box
        component="code"
        key={i}
        sx={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: '0.9em',
          px: 0.5,
          borderRadius: '4px',
          bgcolor: 'var(--color-line)',
        }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  )
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const
