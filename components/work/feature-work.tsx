import { Work } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Container, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'
import { WorkList } from './work-list'

interface FeatureWorkProps {
  isLoading?: boolean
  workList: Work[]
}

export function FeatureWork({ workList, isLoading = false }: FeatureWorkProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <Container>
        <Stack direction="row" mb={5} justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                fontSize: '0.68rem',
                display: 'block',
                mb: 0.75,
              }}
            >
              Portfolio
            </Typography>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
              Featured Works
            </Typography>
          </Box>

          <Link href="/works" style={{ textDecoration: 'none' }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
                transition: 'color 0.15s',
                cursor: 'pointer',
              }}
            >
              <Typography variant="body2" fontWeight={500} component="span" fontSize="0.85rem">
                View all
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </Stack>
          </Link>
        </Stack>

        <WorkList workList={workList || []} isLoading={isLoading} />
      </Container>
    </Box>
  )
}
