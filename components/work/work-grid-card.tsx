import { Work, WorkStatus } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'

export interface WorkGridCardProps {
  work: Work
}

function getWorkHref(work: Work) {
  return work.status === WorkStatus.PUBLISHED && work.slug
    ? `/works/${work.id}/${work.slug}`
    : `/works/${work.id}/details`
}

export function WorkGridCard({ work }: WorkGridCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cover = work.thumbnailUrl
  const year = work.createdAt ? new Date(Number(work.createdAt)).getFullYear() : undefined

  return (
    <Link
      href={getWorkHref(work)}
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
            borderColor: isDark ? 'rgba(74,222,128,0.35)' : 'rgba(22,163,74,0.32)',
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
            {work.tagList?.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.62rem',
                  height: 20,
                  bgcolor: isDark ? 'rgba(74,222,128,0.08)' : 'rgba(22,163,74,0.06)',
                  color: accent,
                  border: `1px solid ${
                    isDark ? 'rgba(74,222,128,0.32)' : 'rgba(22,163,74,0.28)'
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
            {work.title}
          </Typography>

          {work.shortDescription && (
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
                '& span': { fontStyle: 'normal !important', fontWeight: 'inherit !important' },
              }}
              dangerouslySetInnerHTML={{ __html: work.shortDescription }}
            />
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
                  <Box component="span">Live demo</Box>
                </>
              )}
            </Stack>
            <Stack
              className="read-cta"
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: accent, transition: 'gap 0.2s' }}
            >
              <Typography component="span" fontSize="0.78rem" fontWeight={600} color={accent}>
                View
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 13, color: accent }} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Link>
  )
}
