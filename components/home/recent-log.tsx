import { LogEntry, groupByDay } from '@/utils/home'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { TopicLink } from './topic-nav'

// Số bài hiện ra sau khi lọc. Vốn `entries` lớn hơn (xem pages/index.tsx) để
// chủ đề ít bài vẫn có đủ bài mà lọc.
const VISIBLE = 8

interface RecentLogProps {
  entries: LogEntry[]
  /** Track để làm chip lọc; `count` là tổng số bài của track trên cả blog. */
  tracks: TopicLink[]
  totalPosts: number
}

/**
 * Các bài kế sau bài nổi bật, nhóm theo ngày đăng thật, lọc được theo chủ đề.
 * Ngày đã được format ở server (utils/home.ts); ở đây chỉ lọc rồi gom lại.
 */
export function RecentLog({ entries, tracks, totalPosts }: RecentLogProps) {
  const [active, setActive] = useState<string | null>(null)
  const activeTrack = tracks.find((t) => t.key === active) ?? null
  const filtered = active ? entries.filter((e) => e.trackKeys.includes(active)) : entries
  const days = groupByDay(filtered.slice(0, VISIBLE))
  if (entries.length === 0) return null

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
      <Typography
        id="recent-log-heading"
        component="h2"
        sx={{ fontSize: { xs: '1.0625rem', md: '1.3125rem' }, fontWeight: 600, mb: { xs: 1.5, md: 2 } }}
      >
        Bài viết gần đây
      </Typography>

      {tracks.length > 0 && (
        <Box
          role="group"
          aria-label="Lọc theo chủ đề"
          sx={{
            display: 'flex',
            gap: 1,
            mb: { xs: 2, md: 2.5 },
            // Mobile: một hàng cuộn ngang bên trong khối, không xuống ba dòng
            // chip đẩy danh sách bài ra khỏi màn hình đầu. Trang thì không cuộn ngang.
            flexWrap: { xs: 'nowrap', md: 'wrap' },
            overflowX: { xs: 'auto', md: 'visible' },
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Chip label="Tất cả" count={totalPosts} on={active === null} onClick={() => setActive(null)} />
          {tracks.map((track) => (
            <Chip
              key={track.key}
              label={track.title}
              count={track.count}
              on={active === track.key}
              onClick={() => setActive(track.key)}
            />
          ))}
        </Box>
      )}

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
            {day.entries.map((entry) => {
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
                        {renderTitle(entry.title)}
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
        href={activeTrack ? activeTrack.href : '/blog'}
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
        {activeTrack ? `Xem tất cả ${activeTrack.count} bài ${activeTrack.title}` : `Đọc tất cả ${totalPosts} bài`}
      </Box>
    </Box>
  )
}

// Chip lọc: bật thì nền đảo màu chữ (ink trên nền tối), không dùng xanh —
// xanh dành cho link. aria-pressed để trình đọc màn hình biết chip nào đang bật.
function Chip({ label, count, on, onClick }: { label: string; count: number; on: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={on}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        borderRadius: '999px',
        border: '1px solid',
        borderColor: on ? 'var(--color-ink)' : 'var(--color-line)',
        bgcolor: on ? 'var(--color-ink)' : 'transparent',
        color: on ? 'var(--color-bg)' : 'text.secondary',
        transition: 'border-color 0.15s, color 0.15s',
        '&:hover': on ? {} : { borderColor: 'var(--color-ink-muted)', color: 'text.primary' },
        '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
      }}
    >
      {label}
      <Box component="span" sx={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', opacity: 0.7 }}>
        {count}
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
