import { Post } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import Link from 'next/link'

export interface BlogHeroProps {
  post: Post
}

export function BlogHero({ post }: BlogHeroProps) {
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
          p: { xs: 2.5, md: 2.75 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.25,
          borderRadius: '14px',
          border: `1px solid ${line}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          transition: 'border-color 0.2s, transform 0.2s',
          '&:hover': {
            borderColor: isDark ? 'rgba(74,222,128,0.35)' : 'rgba(22,163,74,0.35)',
            transform: 'translateY(-2px)',
          },
          '&:hover .read-cta': { gap: 1 },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            icon={<StarIcon sx={{ fontSize: 12, color: '#fff !important' }} />}
            label="Featured"
            size="small"
            sx={{
              bgcolor: accent,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.68rem',
              height: 24,
              borderRadius: '6px',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              letterSpacing: '0.06em',
              '& .MuiChip-icon': { ml: 0.75 },
            }}
          />
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {'// pick of the month'}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '10px',
            overflow: 'hidden',
            border: `1px solid ${line}`,
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

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {post.tagList?.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                fontSize: '0.66rem',
                height: 22,
                bgcolor: isDark ? 'rgba(74,222,128,0.08)' : 'rgba(22,163,74,0.06)',
                color: accent,
                border: `1px solid ${isDark ? 'rgba(74,222,128,0.35)' : 'rgba(22,163,74,0.32)'}`,
                fontWeight: 500,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                letterSpacing: '0.04em',
              }}
            />
          ))}
        </Stack>

        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: { xs: '1.6rem', md: '2rem', lg: '2.15rem' },
            lineHeight: 1.08,
            letterSpacing: '-0.015em',
            m: 0,
          }}
        >
          {post.title}
        </Typography>

        {post.description && (
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
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
          sx={{ mt: 'auto', pt: 1.5, borderTop: `1px dashed ${line}` }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: '0.7rem',
              color: 'text.secondary',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <Box component="span">{format(new Date(post.publishedDate), 'MMM dd, yyyy')}</Box>
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
            <Box component="span">{post.readingMinutes ?? 1} min read</Box>
          </Stack>
          <Stack
            className="read-cta"
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: accent, transition: 'gap 0.2s' }}
          >
            <Typography component="span" fontSize="0.85rem" fontWeight={600} color={accent}>
              Read essay
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 15, color: accent }} />
          </Stack>
        </Stack>
      </Box>
    </Link>
  )
}
