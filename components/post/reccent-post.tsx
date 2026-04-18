import { Post } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Container, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'
import { NoDataFound } from '../common'
import { PostList } from './post-list'

interface RecentPostProps {
  isLoading?: boolean
  postList: Post[]
}

export function RecentPost({ isLoading = false, postList }: RecentPostProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  if (!isLoading && postList.length === 0) return <NoDataFound />

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
              Writing
            </Typography>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
              Recent Posts
            </Typography>
          </Box>

          <Link href="/blog" style={{ textDecoration: 'none' }}>
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{ '& > div': { width: { xs: '100%', md: '50%' } } }}
        >
          <PostList postList={postList} isLoading={isLoading} />
        </Stack>
      </Container>
    </Box>
  )
}
