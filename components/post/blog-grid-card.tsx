import { Post } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import Link from 'next/link'

export interface BlogGridCardProps {
  post: Post
}

export function BlogGridCard({ post }: BlogGridCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cover = post.thumbnailUrl

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
    >
      <Box
        component="article"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '14px',
          border: `1px solid ${line}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          transition: 'border-color 0.2s, transform 0.2s',
          '&:hover': {
            borderColor: isDark ? 'rgba(248,113,113,0.35)' : 'rgba(220,38,38,0.32)',
            transform: 'translateY(-3px)',
          },
          '&:hover .read-cta': { gap: 1 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderBottom: `1px solid ${line}`,
            background: cover
              ? undefined
              : `repeating-linear-gradient(45deg, ${
                  isDark ? '#141417' : '#f5f5f5'
                } 0 8px, ${isDark ? '#0e0e10' : '#ececec'} 8px 16px)`,
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {post.tagList?.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.62rem',
                  height: 20,
                  bgcolor: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,38,38,0.06)',
                  color: accent,
                  border: `1px solid ${
                    isDark ? 'rgba(248,113,113,0.32)' : 'rgba(220,38,38,0.28)'
                  }`,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>

          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.15rem',
              lineHeight: 1.22,
              letterSpacing: '-0.005em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              m: 0,
            }}
          >
            {post.title}
          </Typography>

          {post.description && (
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.83rem',
                lineHeight: 1.55,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                m: 0,
              }}
            >
              {post.description}
            </Typography>
          )}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 'auto', pt: 1 }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '0.66rem',
                color: 'text.secondary',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Box component="span">{format(new Date(post.publishedDate), 'MMM dd')}</Box>
              <Box
                component="span"
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: 'text.secondary',
                  opacity: 0.5,
                }}
              />
              <Box component="span">{post.readingMinutes ?? 1} min</Box>
            </Stack>
            <Stack
              className="read-cta"
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: accent, transition: 'gap 0.2s' }}
            >
              <Typography component="span" fontSize="0.78rem" fontWeight={600} color={accent}>
                Read
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 13, color: accent }} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Link>
  )
}
