import { MainLayout } from '@/components/layouts'
import {
  WorkFilters,
  WorkGridCard,
  WorkHero,
  WorkMiniCard,
  WorkSkeleton,
} from '@/components/work'
import { useAuth, useWorkList } from '@/hooks'
import { Work } from '@/models'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Container, Grid, Stack, Typography, useTheme } from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

function WorksPageIntro({ totalCount }: { totalCount: number }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <Box
      sx={{
        pt: { xs: 6, md: 9 },
        pb: { xs: 4, md: 5 },
        mb: { xs: 4, md: 5 },
        borderBottom: `1px solid ${line}`,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        justifyContent: 'space-between',
        gap: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 560 }}>
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: accent,
            mb: 1.5,
          }}
        >
          {'// the studio'}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' },
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            mb: 1.75,
          }}
        >
          Selected work, shipped end-to-end.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: 460 }}
        >
          A small gallery of projects — games, AI experiments, full-stack apps. Every one
          shipped, every one with code you can read.
        </Typography>
      </Box>
      <Stack
        spacing={1}
        sx={{
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: '0.72rem',
          color: 'text.secondary',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <Box>
          {totalCount} {totalCount === 1 ? 'project' : 'projects'}
        </Box>
        <Box sx={{ opacity: 0.7 }}>updated regularly</Box>
      </Stack>
    </Box>
  )
}

export default function WorksPage() {
  const router = useRouter()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const { isLoggedIn } = useAuth()

  // Fetch a single big page and filter client-side — matches the blog page UX
  // (instant filter feedback, no round-trip per keystroke). 100 is generous
  // for a personal portfolio; bump if needed.
  const { data, isLoading } = useWorkList({
    params: { _page: 1, _limit: 100 },
  })
  const works: Work[] = data?.data ?? []

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('All')

  const sorted = useMemo(
    () =>
      [...works].sort(
        (a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      ),
    [works]
  )

  const tagBuckets = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of sorted) {
      for (const t of w.tagList ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [sorted])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter((w) => {
      const matchesTag = activeTag === 'All' || (w.tagList ?? []).includes(activeTag)
      const matchesQuery =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (w.shortDescription ?? '').toLowerCase().includes(q) ||
        (w.tagList ?? []).some((t) => t.toLowerCase().includes(q))
      return matchesTag && matchesQuery
    })
  }, [sorted, query, activeTag])

  const isFiltering = query.trim() !== '' || activeTag !== 'All'
  const featured = !isFiltering ? filtered[0] : undefined
  const editorsPicks = !isFiltering ? filtered.slice(1, 4) : []
  const remaining = !isFiltering ? filtered.slice(4) : filtered

  return (
    <Box>
      <Container maxWidth="md" sx={{ '@media (min-width: 900px)': { maxWidth: '1180px' } }}>
        <WorksPageIntro totalCount={works.length} />

        {isLoggedIn && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => router.push('/works/add')}
            >
              Add work
            </Button>
          </Stack>
        )}

        <WorkFilters
          query={query}
          onQueryChange={setQuery}
          tags={tagBuckets}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          totalCount={works.length}
        />

        {isLoading && works.length === 0 && (
          <Grid container spacing={3} sx={{ pb: { xs: 8, md: 12 } }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <WorkSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && filtered.length === 0 && (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              border: `1px dashed ${line}`,
              borderRadius: '14px',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '1.4rem',
                fontWeight: 600,
                mb: 1,
              }}
            >
              No projects match.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Try a different tag or search term.
            </Typography>
          </Box>
        )}

        {featured && (
          <Grid container spacing={3} sx={{ mb: { xs: 5, md: 7 } }}>
            <Grid item xs={12} md={7}>
              <WorkHero work={featured} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: 0.25,
                  }}
                >
                  Notable picks
                </Typography>
                {editorsPicks.map((w) => (
                  <WorkMiniCard key={w.id} work={w} />
                ))}
              </Stack>
            </Grid>
          </Grid>
        )}

        {remaining.length > 0 && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
              sx={{ mb: 2.5 }}
            >
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                {isFiltering ? `Results · ${filtered.length}` : 'All projects'}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  opacity: 0.7,
                }}
              >
                {remaining.length} {remaining.length === 1 ? 'project' : 'projects'}
              </Typography>
            </Stack>
            <Grid container spacing={3} sx={{ pb: { xs: 8, md: 12 } }}>
              {remaining.map((work) => (
                <Grid key={work.id} item xs={12} sm={6} md={4}>
                  <WorkGridCard work={work} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  )
}

WorksPage.Layout = MainLayout

export function getStaticProps() {
  return { props: {} }
}
