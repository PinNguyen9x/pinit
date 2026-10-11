import { FeaturedPost as FeaturedPostData } from '@/utils/home'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

interface FeaturedPostProps {
  post: FeaturedPostData
}

/**
 * Bài mới nhất, cỡ lớn — điểm nhấn của trang chủ. Vệt xanh `log-marker` dưới
 * tiêu đề (globals.css) quét một lần lúc tải trang: animation duy nhất của trang.
 *
 * Cả thẻ là một link; hover chỉ đổi màu viền và làm đậm gạch chân "Đọc bài",
 * không nhấc thẻ, không phóng ảnh.
 */
export function FeaturedPost({ post }: FeaturedPostProps) {
  const meta = [post.trackTitle, post.dayLabel, post.readingMinutes && `${post.readingMinutes} phút đọc`].filter(
    Boolean,
  ) as string[]

  return (
    <Box
      component={Link}
      href={`/blog/${post.slug}`}
      aria-labelledby="featured-post-title"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(0, 1fr)' },
        overflow: 'hidden',
        color: 'inherit',
        bgcolor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: '16px',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'var(--color-ink-muted)' },
        '&:hover .featured-cta': { textDecorationThickness: '2px' },
        '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '3px' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          // Mobile: ảnh dẹt để thẻ không chiếm hết màn hình đầu — 375×812 vẫn
          // thấy được vài bài trong danh sách bên dưới.
          aspectRatio: { xs: '16 / 7', md: 'auto' },
          minHeight: { md: 300 },
          bgcolor: 'var(--color-line)',
          borderRight: { md: '1px solid var(--color-line)' },
          borderBottom: { xs: '1px solid var(--color-line)', md: 'none' },
        }}
      >
        {post.cover && (
          <Image
            src={post.cover}
            alt=""
            fill
            priority
            sizes="(min-width: 900px) 640px, 100vw"
            style={{ objectFit: 'cover' }}
          />
        )}
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 1.75 } }}>
        <Typography component="p" sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {meta.join(', ')}
        </Typography>
        <Typography
          id="featured-post-title"
          component="h2"
          sx={{
            fontSize: { xs: '1.3125rem', md: '1.6875rem' },
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            textWrap: 'balance',
          }}
        >
          <span className="log-marker">{post.title}</span>
        </Typography>
        {post.summary && (
          <Typography
            sx={{
              fontSize: { xs: '0.9375rem', md: '1rem' },
              lineHeight: 1.65,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: { xs: 2, md: 4 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.summary}
          </Typography>
        )}
        <Box
          component="span"
          className="featured-cta"
          sx={{
            mt: 'auto',
            pt: 0.5,
            alignSelf: 'flex-start',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'primary.main',
            textDecoration: 'underline',
            textDecorationThickness: '1px',
            textUnderlineOffset: '3px',
          }}
        >
          Đọc bài
        </Box>
      </Box>
    </Box>
  )
}
