import { Work, WorkStatus } from '@/models'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

export interface WorkItemProps {
  work: Work
}

export function WorkItem({ work }: WorkItemProps) {
  const { id, status = WorkStatus.DRAFT, slug } = work || {}
  const href = status === WorkStatus.PUBLISHED ? `/works/${id}/${slug}` : `/works/${id}/details`
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          p: 2.5,
          borderRadius: 2,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
            transform: 'translateY(-2px)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
            '& .arrow-icon': { transform: 'translate(2px, -2px)' },
          },
        }}
      >
        {/* Thumbnail */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 200 },
            height: { xs: 160, sm: 130 },
            borderRadius: 1.5,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <Image
            src={work.thumbnailUrl}
            alt={work.title}
            fill
            sizes="(max-width: 600px) 100vw, 200px"
            style={{ objectFit: 'cover' }}
          />
        </Box>

        {/* Content */}
        <Box flex={1} minWidth={0} display="flex" flexDirection="column" justifyContent="center">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {work.title}
            </Typography>
            <ArrowOutwardIcon
              className="arrow-icon"
              sx={{
                fontSize: 16,
                color: 'text.secondary',
                flexShrink: 0,
                ml: 1,
                mt: 0.25,
                transition: 'transform 0.15s',
              }}
            />
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.75} mb={1.5} useFlexGap>
            <Chip
              label={new Date(Number(work.createdAt)).getFullYear()}
              size="small"
              sx={{
                fontSize: '0.68rem',
                height: 20,
                bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                fontWeight: 600,
              }}
            />
            {work.tagList.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  height: 20,
                  bgcolor: isDark ? 'rgba(22,163,74,0.1)' : 'rgba(22,163,74,0.07)',
                  color: '#16a34a',
                  border: '1px solid rgba(22,163,74,0.18)',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.825rem',
            }}
            dangerouslySetInnerHTML={{ __html: work.shortDescription }}
          />
        </Box>
      </Box>
    </Link>
  )
}
