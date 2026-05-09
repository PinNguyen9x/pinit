import { Post } from '@/models'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import Link from 'next/link'

export interface BlogMiniCardProps {
  post: Post
}

export function BlogMiniCard({ post }: BlogMiniCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cover = post.thumbnailUrl
  const firstTag = post.tagList?.[0]

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <Box
        component="article"
        sx={{
          display: 'grid',
          gridTemplateColumns: '92px 1fr',
          gap: 1.75,
          alignItems: 'center',
          p: 1.5,
          borderRadius: '10px',
          border: `1px solid ${line}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          transition: 'border-color 0.2s, background 0.2s',
          '&:hover': {
            borderColor: isDark ? 'rgba(248,113,113,0.35)' : 'rgba(220,38,38,0.32)',
            bgcolor: isDark ? 'rgba(248,113,113,0.05)' : 'rgba(220,38,38,0.03)',
          },
        }}
      >
        <Box
          sx={{
            width: 92,
            height: 70,
            borderRadius: '6px',
            overflow: 'hidden',
            border: `1px solid ${line}`,
            background: cover
              ? undefined
              : `repeating-linear-gradient(45deg, ${
                  isDark ? '#141417' : '#f5f5f5'
                } 0 6px, ${isDark ? '#0e0e10' : '#ececec'} 6px 12px)`,
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          {firstTag && (
            <Chip
              label={firstTag}
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: 18,
                mb: 0.75,
                bgcolor: 'transparent',
                color: 'text.secondary',
                border: `1px solid ${line}`,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                letterSpacing: '0.04em',
              }}
            />
          )}
          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.2,
              mb: 0.75,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: '0.65rem',
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
        </Box>
      </Box>
    </Link>
  )
}
