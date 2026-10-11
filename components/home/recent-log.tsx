import { LogDay } from '@/utils/home'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
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
                <Box component="li" key={entry.slug} sx={{ '& + &': { mt: { xs: 1.25, md: 1.5 } } }}>
                  <Box
                    component={Link}
                    href={`/blog/${entry.slug}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: { xs: 1.5, md: 2 },
                      color: 'text.primary',
                      borderRadius: '8px',
                      '&:hover .log-title': { color: 'primary.main' },
                      '&:hover .log-thumb': { borderColor: 'var(--color-ink-muted)' },
                      '&:focus-visible': {
                        outline: '2px solid var(--color-accent)',
                        outlineOffset: '4px',
                      },
                    }}
                  >
                    <Thumb src={entry.cover} eager={dayIndex === 0} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        component="span"
                        className="log-title"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                          fontWeight: 500,
                          lineHeight: 1.45,
                          transition: 'color 0.15s',
                        }}
                      >
                        {isNewest ? (
                          <span className="log-marker">{renderTitle(entry.title)}</span>
                        ) : (
                          renderTitle(entry.title)
                        )}
                      </Box>
                      {entry.readingMinutes && (
                        // Chỉ từ md: ở 375px dòng meta này đẩy bài thứ 8 ra khỏi màn hình đầu.
                        <Box
                          component="span"
                          sx={{
                            display: { xs: 'none', md: 'block' },
                            mt: 0.25,
                            fontSize: '0.8125rem',
                            color: 'text.secondary',
                          }}
                        >
                          {entry.readingMinutes} phút đọc
                        </Box>
                      )}
                    </Box>
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

// Ảnh bìa thu nhỏ — ảnh -card có sẵn của từng bài (gradient màu + icon công
// nghệ), nên mỗi dòng mang màu của chính chủ đề bài, không phải màu trang trí.
// Bài không có bìa vẫn giữ ô trống cùng kích thước để cột tiêu đề thẳng hàng.
// alt rỗng: tiêu đề ngay bên cạnh đã nói bài là gì.
function Thumb({ src, eager }: { src: string | null; eager: boolean }) {
  return (
    <Box
      className="log-thumb"
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: { xs: 56, md: 88 },
        aspectRatio: '640 / 416',
        mt: '2px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--color-line)',
        bgcolor: 'var(--color-line)',
        transition: 'border-color 0.15s',
      }}
    >
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes="88px"
          loading={eager ? 'eager' : 'lazy'}
          style={{ objectFit: 'cover' }}
        />
      )}
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

// Đơn vị phải là chuỗi px: trong sx của MUI, số 1 ở width/height nghĩa là 100%.
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const
