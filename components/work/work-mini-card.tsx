import { Work, WorkStatus } from '@/models'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'

export interface WorkMiniCardProps {
  work: Work
}

function getWorkHref(work: Work) {
  return work.status === WorkStatus.PUBLISHED && work.slug
    ? `/works/${work.id}/${work.slug}`
    : `/works/${work.id}/details`
}

export function WorkMiniCard({ work }: WorkMiniCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cover = work.thumbnailUrl
  const firstTag = work.tagList?.[0]
  const year = work.createdAt ? new Date(Number(work.createdAt)).getFullYear() : undefined

  return (
    <Link
      href={getWorkHref(work)}
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
            borderColor: isDark ? 'rgba(74,222,128,0.35)' : 'rgba(22,163,74,0.32)',
            bgcolor: isDark ? 'rgba(74,222,128,0.05)' : 'rgba(22,163,74,0.03)',
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
            {work.title}
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
            {year && <Box component="span">{year}</Box>}
            {work.linkDemo && (
              <>
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
                <Box component="span">Live</Box>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Link>
  )
}
