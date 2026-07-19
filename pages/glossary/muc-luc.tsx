import { BackgroundFx, Seo } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { GLOSSARY, GlossaryTerm } from '@/constants'
import { NextPageWithLayout } from '@/models'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Container,
  InputBase,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

type CategoryGroup = {
  cat: string
  terms: GlossaryTerm[]
}

const GlossaryIndex: NextPageWithLayout = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const chipBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const cardBg = isDark ? 'rgba(14,18,15,0.5)' : 'rgba(255,255,255,0.65)'

  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl/Cmd + F focuses our search instead of the browser's find bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GLOSSARY
    return GLOSSARY.filter(
      (d) =>
        d.term.toLowerCase().includes(q) ||
        d.short.toLowerCase().includes(q) ||
        d.detail.toLowerCase().includes(q)
    )
  }, [query])

  // Group by category. Terms sorted alphabetically; groups by count desc, then
  // category name alphabetically when counts tie.
  const groups = useMemo<CategoryGroup[]>(() => {
    const map: Record<string, GlossaryTerm[]> = {}
    filtered.forEach((d) => {
      ;(map[d.cat] = map[d.cat] || []).push(d)
    })
    return Object.keys(map)
      .map((cat) => ({
        cat,
        terms: [...map[cat]].sort((a, b) =>
          a.term.localeCompare(b.term, 'en', { sensitivity: 'base' })
        ),
      }))
      .sort(
        (a, b) => b.terms.length - a.terms.length || a.cat.localeCompare(b.cat)
      )
  }, [filtered])

  return (
    <Box>
      <Seo
        data={{
          title: 'Mục lục Thuật ngữ theo nhóm | Pin Nguyen',
          description:
            'Mục lục thuật ngữ phần mềm & AI nhóm theo chủ đề — AI, Messaging, DevOps, Web… Tìm nhanh và nhảy tới phần giải thích chi tiết.',
          thumbnailUrl: 'https://pinit-ten.vercel.app/favicon.ico',
          url: 'https://pinit-ten.vercel.app/glossary/muc-luc',
        }}
      />
      <BackgroundFx parallax={false} />

      <Container
        maxWidth="md"
        sx={{ '@media (min-width: 900px)': { maxWidth: '1180px' } }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', pt: { xs: 8, md: 11 }, pb: { xs: 4, md: 4.5 } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.1rem', sm: '2.6rem', md: '3rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
            }}
          >
            Mục lục{' '}
            <Box component="span" sx={{ color: accent }}>
              theo chủ đề
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 1.75,
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: 620,
              mx: 'auto',
            }}
          >
            Toàn bộ thuật ngữ nhóm theo lĩnh vực. Click để xem giải thích chi tiết.
          </Typography>

          {/* Cross-link to the detailed A-Z page */}
          <Box
            component={Link}
            href="/glossary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              mt: 2,
              fontSize: '0.84rem',
              fontWeight: 600,
              color: accent,
              transition: '0.15s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            Xem chi tiết A–Z <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ maxWidth: 760, mx: 'auto', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              width: '100%',
              px: 2,
              py: 1.5,
              borderRadius: '12px',
              border: `1px solid ${line}`,
              bgcolor: isDark ? 'rgba(14,18,15,0.6)' : 'rgba(0,0,0,0.015)',
              backdropFilter: 'blur(10px)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              '&:focus-within': {
                borderColor: accent,
                boxShadow: `0 0 0 3px ${accent}1f`,
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <InputBase
              inputRef={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ctrl + F để tìm thuật ngữ…"
              sx={{
                flex: 1,
                color: 'text.primary',
                fontSize: '0.95rem',
                '& input::placeholder': { color: 'text.secondary', opacity: 0.8 },
              }}
            />
            {query && (
              <Box
                component="button"
                onClick={() => setQuery('')}
                sx={{
                  border: 'none',
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: theme.palette.primary.contrastText,
                  bgcolor: accent,
                  transition: 'transform 0.12s',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                Clear
              </Box>
            )}
          </Box>
        </Box>

        {/* Count line */}
        <Typography
          align="center"
          sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 4 }}
        >
          Đang hiển thị{' '}
          <Box component="b" sx={{ color: accent }}>
            {filtered.length}
          </Box>{' '}
          / {GLOSSARY.length} thuật ngữ trong{' '}
          <Box component="b" sx={{ color: accent }}>
            {groups.length}
          </Box>{' '}
          nhóm
        </Typography>

        {/* Empty state */}
        {groups.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, mb: 0.75 }}>
              Không tìm thấy thuật ngữ nào
            </Typography>
            <Typography sx={{ fontSize: '0.9rem' }}>
              Thử từ khóa khác.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 2,
              alignItems: 'start',
              pb: 4,
            }}
          >
            {groups.map((g) => (
              <Box
                component="section"
                key={g.cat}
                sx={{
                  p: '18px 20px',
                  borderRadius: '14px',
                  bgcolor: cardBg,
                  border: `1px solid ${line}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Category heading */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    {g.cat}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      px: 1,
                      py: '2px',
                      borderRadius: '999px',
                      color: accent,
                      bgcolor: `${accent}1a`,
                      border: `1px solid ${accent}2e`,
                    }}
                  >
                    {g.terms.length}
                  </Box>
                </Stack>

                {/* Inline term links, separated by a middot */}
                <Box sx={{ lineHeight: 2 }}>
                  {g.terms.map((d, i) => (
                    <Fragment key={d.term}>
                      {i > 0 && (
                        <Box
                          component="span"
                          sx={{ color: 'text.disabled', mx: 0.5 }}
                        >
                          ·
                        </Box>
                      )}
                      <Box
                        component={Link}
                        href={`/glossary#${encodeURIComponent(d.term)}`}
                        title={d.short}
                        sx={{
                          fontSize: '0.88rem',
                          color: 'text.secondary',
                          borderRadius: '4px',
                          transition: 'color 0.15s',
                          '&:hover': { color: accent },
                        }}
                      >
                        {d.term}
                      </Box>
                    </Fragment>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Footer nav */}
        <Box sx={{ pb: 8, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box
            component={Link}
            href="/glossary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              fontSize: '0.84rem',
              color: 'text.secondary',
              transition: '0.15s',
              '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Về trang thuật ngữ A–Z
          </Box>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              fontSize: '0.84rem',
              color: 'text.secondary',
              transition: '0.15s',
              '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Về trang chủ
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

GlossaryIndex.Layout = MainLayout

export default GlossaryIndex
