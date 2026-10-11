import { Work } from '@/models'
import { Box, Container, Stack, Typography } from '@mui/material'
import { pageContainerSx } from '@/utils/theme'
import Link from 'next/link'
import { WorkList } from './work-list'

interface FeatureWorkProps {
  isLoading?: boolean
  workList: Work[]
}

export function FeatureWork({ workList, isLoading = false }: FeatureWorkProps) {
  if (!isLoading && workList.length === 0) return null

  return (
    <Box component="section" aria-labelledby="feature-work-heading" sx={{ pt: { xs: 7, md: 10 } }}>
      <Container sx={pageContainerSx}>
        <Stack direction="row" mb={3} justifyContent="space-between" alignItems="baseline" gap={2}>
          <Typography
            id="feature-work-heading"
            component="h2"
            sx={{ fontSize: { xs: '1.3125rem', md: '1.6875rem' }, fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            Dự án
          </Typography>

          <Box
            component={Link}
            href="/works"
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              textDecoration: 'underline',
              textDecorationColor: 'var(--color-line)',
              textUnderlineOffset: '4px',
              '&:hover': { color: 'text.primary', textDecorationColor: 'currentColor' },
              '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
            }}
          >
            Xem tất cả dự án
          </Box>
        </Stack>

        <WorkList workList={workList} isLoading={isLoading} />
      </Container>
    </Box>
  )
}
