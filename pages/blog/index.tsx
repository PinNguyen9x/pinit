import { MainLayout } from '@/components/layouts'
import {
  BlogFilters,
  BlogGridCard,
  BlogHero,
  BlogMiniCard,
} from '@/components/post'
import { Post } from '@/models'
import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useMemo, useState } from 'react'
import { getPostList } from '../../utils/posts'

export interface BlogPageProps {
  posts: Post[]
}

function BlogPageIntro({ totalCount }: { totalCount: number }) {
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
          {'// the journal'}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' },
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            pb: '0.08em',
            mb: 1.75,
          }}
        >
          Notes from the engineering bench.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: 460 }}
        >
          Long-form essays on React, TypeScript, infra, and the boring real-world things that ship
          products.
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
          {totalCount} {totalCount === 1 ? 'essay' : 'essays'}
        </Box>
        <Box sx={{ opacity: 0.7 }}>updated regularly</Box>
      </Stack>
    </Box>
  )
}

export default function BlogPage({ posts }: BlogPageProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('All')

  const tagBuckets = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) {
      for (const t of p.tagList ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const matchesTag = activeTag === 'All' || (p.tagList ?? []).includes(activeTag)
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.tagList ?? []).some((t) => t.toLowerCase().includes(q))
      return matchesTag && matchesQuery
    })
  }, [posts, query, activeTag])

  const isFiltering = query.trim() !== '' || activeTag !== 'All'

  const featured = !isFiltering ? filtered[0] : undefined
  const editorsPicks = !isFiltering ? filtered.slice(1, 4) : []
  const remaining = !isFiltering ? filtered.slice(4) : filtered

  return (
    <Box>
      <Container maxWidth="md" sx={{ '@media (min-width: 900px)': { maxWidth: '1180px' } }}>
        <BlogPageIntro totalCount={posts.length} />

        <BlogFilters
          query={query}
          onQueryChange={setQuery}
          tags={tagBuckets}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          totalCount={posts.length}
        />

        {filtered.length === 0 && (
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
              No essays match.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Try a different tag or search term.
            </Typography>
          </Box>
        )}

        {featured && (
          <Grid container spacing={3} sx={{ mb: { xs: 5, md: 7 } }}>
            <Grid item xs={12} md={7}>
              <BlogHero post={featured} />
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
                  Editor&apos;s picks
                </Typography>
                {editorsPicks.map((p) => (
                  <BlogMiniCard key={p.id} post={p} />
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
                {isFiltering ? `Results · ${filtered.length}` : 'All essays'}
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
                {remaining.length} {remaining.length === 1 ? 'essay' : 'essays'}
              </Typography>
            </Stack>
            <Grid container spacing={3} sx={{ pb: { xs: 8, md: 12 } }}>
              {remaining.map((post) => (
                <Grid key={post.id} item xs={12} sm={6} md={4}>
                  <BlogGridCard post={post} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  )
}

BlogPage.Layout = MainLayout

export const getStaticProps: GetStaticProps<BlogPageProps> = async (
  _context: GetStaticPropsContext,
) => {
  const postList = await getPostList()
  // strip mdContent — not needed on the list page
  const lean: Post[] = postList.map((p) => ({ ...p, mdContent: '', htmlContent: '' }))
  return {
    props: {
      posts: lean,
    },
  }
}
