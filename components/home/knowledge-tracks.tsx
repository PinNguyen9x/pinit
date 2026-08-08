import { TrackWithCount } from '@/utils/tracks'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'

interface KnowledgeTracksProps {
  tracks: TrackWithCount[]
  totalPosts: number
}

export function KnowledgeTracks({ tracks, totalPosts }: KnowledgeTracksProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  if (tracks.length === 0) return null

  return (
    <Box
      component="section"
      sx={{ py: { xs: 8, md: 12 }, borderTop: `1px solid ${line}` }}
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
              Knowledge
            </Typography>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
              Đọc theo chủ đề
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
                Tất cả {totalPosts} bài
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </Stack>
          </Link>
        </Stack>

        <Grid container spacing={2.5}>
          {tracks.map((track) => (
            <Grid item xs={12} sm={6} key={track.key}>
              <Link
                href={{ pathname: '/blog', query: { tag: track.filterTag } }}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${line}`,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    transition: 'border-color 0.2s, transform 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
                    <Typography
                      component="h3"
                      fontWeight={700}
                      sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, color: 'text.primary' }}
                    >
                      {track.title}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        ml: 'auto',
                        flexShrink: 0,
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {track.count} bài
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, fontSize: '0.875rem' }}
                  >
                    {track.blurb}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
