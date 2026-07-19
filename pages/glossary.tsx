import { BackgroundFx, Seo } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { GLOSSARY, GlossaryTerm } from '@/constants'
import { NextPageWithLayout } from '@/models'
import { keyframes } from '@emotion/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Collapse,
  Container,
  InputBase,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Highlight the matched query substring inside a piece of text. */
function Highlight({ text, q }: { text: string; q: string }): ReactNode {
  const query = q.trim()
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <Box
        component="mark"
        sx={{
          bgcolor: 'rgba(34,197,94,0.28)',
          color: 'inherit',
          borderRadius: '3px',
          px: '2px',
        }}
      >
        {text.slice(idx, idx + query.length)}
      </Box>
      {text.slice(idx + query.length)}
    </>
  )
}

const Glossary: NextPageWithLayout = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cardBg = isDark ? 'rgba(14,18,15,0.5)' : 'rgba(255,255,255,0.65)'
  const cardBgOpen = isDark ? 'rgba(14,22,16,0.72)' : 'rgba(255,255,255,0.9)'
  const chipBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'

  const flash = useMemo(
    () => keyframes`
      0% { box-shadow: 0 0 0 0 ${theme.palette.primary.main}80; }
      100% { box-shadow: 0 0 0 14px ${theme.palette.primary.main}00; }
    `,
    [theme.palette.primary.main]
  )

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [openTerm, setOpenTerm] = useState<string | null>(null)
  const [flashTerm, setFlashTerm] = useState<string | null>(null)
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

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

  // Categories with counts, "All" first.
  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    GLOSSARY.forEach((d) => {
      counts[d.cat] = (counts[d.cat] || 0) + 1
    })
    const order = ['All', ...Object.keys(counts).sort()]
    return order.map((c) => ({
      name: c,
      count: c === 'All' ? GLOSSARY.length : counts[c],
    }))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GLOSSARY.filter((d) => {
      if (cat !== 'All' && d.cat !== cat) return false
      if (!q) return true
      return (
        d.term.toLowerCase().includes(q) ||
        d.short.toLowerCase().includes(q) ||
        d.detail.toLowerCase().includes(q)
      )
    })
  }, [query, cat])

  // Group filtered terms by first letter, alphabetically.
  const groups = useMemo(() => {
    const g: Record<string, GlossaryTerm[]> = {}
    ;[...filtered]
      .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
      .forEach((d) => {
        const L = d.term[0].toUpperCase()
        ;(g[L] = g[L] || []).push(d)
      })
    return g
  }, [filtered])

  const activeLetters = Object.keys(groups).sort()

  const jumpTo = useCallback((letter: string) => {
    const el = document.getElementById('gl-sec-' + letter)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 110
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  // Jump to a specific term (from a related chip or deep-link) and open it.
  const goToTerm = useCallback((termName: string) => {
    setQuery('')
    setCat('All')
    setOpenTerm(termName)
    const nextHash = '#' + encodeURIComponent(termName)
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search + nextHash
      )
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = cardRefs.current[termName]
        if (!el) return
        const y = el.getBoundingClientRect().top + window.scrollY - 110
        window.scrollTo({ top: y, behavior: 'smooth' })
        setFlashTerm(termName)
        setTimeout(() => setFlashTerm(null), 1000)
      }, 60)
    })
  }, [])

  // Deep-link: read URL hash on mount + react to hashchange (back/forward, paste).
  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.slice(1)
      if (!raw) return
      let decoded: string
      try {
        decoded = decodeURIComponent(raw)
      } catch {
        return
      }
      if (!GLOSSARY.some((x) => x.term === decoded)) return
      goToTerm(decoded)
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [goToTerm])

  const copyLink = useCallback((termName: string) => {
    const url =
      window.location.origin +
      window.location.pathname +
      '#' +
      encodeURIComponent(termName)
    const done = () => {
      setCopiedTerm(termName)
      setTimeout(
        () => setCopiedTerm((cur) => (cur === termName ? null : cur)),
        1500
      )
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(() => {})
    }
  }, [])

  const toggle = (term: string) =>
    setOpenTerm((cur) => (cur === term ? null : term))

  return (
    <Box>
      <Seo
        data={{
          title: 'Thuật ngữ Phần mềm & AI | Pin Nguyen',
          description:
            'Từ điển thuật ngữ phần mềm và AI giải thích bằng tiếng Việt — dễ hiểu, dễ nhớ. Tìm kiếm, lọc theo nhóm và nhảy nhanh theo A-Z.',
          thumbnailUrl: 'https://pinit-ten.vercel.app/favicon.ico',
          url: 'https://pinit-ten.vercel.app/glossary',
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
            Thuật ngữ{' '}
            <Box component="span" sx={{ color: accent }}>
              Phần mềm &amp; AI
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
            Click vào thuật ngữ để xem giải thích chi tiết và các thuật ngữ liên quan.
          </Typography>

          {/* Cross-link to the category index (mục lục) */}
          <Box
            component={Link}
            href="/glossary/muc-luc"
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
            Xem mục lục theo chủ đề <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>

        {/* Search + tools */}
        <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto', mb: 3.5 }}>
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
            {(query || cat !== 'All') && (
              <Box
                component="button"
                onClick={() => {
                  setQuery('')
                  setCat('All')
                }}
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

          {/* Category filters */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
          >
            {categories.map((c) => {
              const on = cat === c.name
              return (
                <Box
                  key={c.name}
                  component="button"
                  onClick={() => setCat(c.name)}
                  sx={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.78rem',
                    fontWeight: on ? 600 : 500,
                    px: 1.75,
                    py: 0.85,
                    borderRadius: '999px',
                    border: `1px solid ${on ? 'transparent' : line}`,
                    color: on ? theme.palette.primary.contrastText : 'text.secondary',
                    bgcolor: on ? accent : chipBg,
                    transition: '0.15s',
                    '&:hover': {
                      color: on ? theme.palette.primary.contrastText : 'text.primary',
                      borderColor: on ? 'transparent' : `${accent}4d`,
                    },
                  }}
                >
                  {c.name === 'All' ? 'Tất cả' : c.name}
                  <Box component="span" sx={{ opacity: 0.7, fontSize: '0.68rem' }}>
                    {c.count}
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Stack>

        {/* Count line */}
        <Typography
          align="center"
          sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.5 }}
        >
          Đang hiển thị{' '}
          <Box component="b" sx={{ color: accent }}>
            {filtered.length}
          </Box>{' '}
          / {GLOSSARY.length} thuật ngữ
        </Typography>

        {/* A-Z jump bar */}
        <Box
          sx={{
            position: 'sticky',
            top: 64,
            zIndex: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            justifyContent: 'center',
            p: 1.25,
            mx: 'auto',
            mb: 4,
            maxWidth: 760,
            borderRadius: '14px',
            border: `1px solid ${line}`,
            bgcolor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {ALPHABET.map((L) => {
            const enabled = activeLetters.includes(L)
            return (
              <Box
                key={L}
                onClick={() => enabled && jumpTo(L)}
                sx={{
                  width: 28,
                  height: 28,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  userSelect: 'none',
                  color: 'text.secondary',
                  cursor: enabled ? 'pointer' : 'default',
                  opacity: enabled ? 1 : 0.25,
                  pointerEvents: enabled ? 'auto' : 'none',
                  transition: '0.12s',
                  '&:hover': {
                    bgcolor: `${accent}1f`,
                    color: 'text.primary',
                  },
                }}
              >
                {L}
              </Box>
            )
          })}
        </Box>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, mb: 0.75 }}>
              Không tìm thấy thuật ngữ nào
            </Typography>
            <Typography sx={{ fontSize: '0.9rem' }}>
              Thử từ khóa khác hoặc đổi category.
            </Typography>
          </Box>
        ) : (
          activeLetters.map((L) => (
            <Box
              component="section"
              id={'gl-sec-' + L}
              key={L}
              sx={{ mb: 5, scrollMarginTop: '120px' }}
            >
              {/* Letter heading */}
              <Stack direction="row" alignItems="center" spacing={1.75} sx={{ mb: 2.25 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '12px',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: accent,
                    bgcolor: `${accent}1a`,
                    border: `1px solid ${accent}2e`,
                  }}
                >
                  {L}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    height: '1px',
                    background: `linear-gradient(90deg, ${accent}40, transparent)`,
                  }}
                />
              </Stack>

              {/* Term grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 1.75,
                  alignItems: 'start',
                }}
              >
                {groups[L].map((d) => {
                  const isOpen = openTerm === d.term
                  const isFlash = flashTerm === d.term
                  return (
                    <Box
                      component="article"
                      key={d.term}
                      ref={(el: HTMLElement | null) => {
                        cardRefs.current[d.term] = el
                      }}
                      onClick={() => toggle(d.term)}
                      sx={{
                        position: 'relative',
                        p: '18px 20px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        bgcolor: isOpen ? cardBgOpen : cardBg,
                        border: `1px solid ${isOpen ? `${accent}73` : line}`,
                        backdropFilter: 'blur(8px)',
                        transition:
                          'border-color 0.2s, transform 0.15s, box-shadow 0.2s, background 0.2s',
                        boxShadow: isOpen
                          ? `0 20px 50px -24px ${accent}80`
                          : 'none',
                        animation: isFlash ? `${flash} 1s ease-out` : 'none',
                        '&:hover': {
                          borderColor: `${accent}47`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 16px 40px -22px ${accent}66`,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        spacing={1.5}
                      >
                        <Typography
                          sx={{
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.3,
                          }}
                        >
                          <Highlight text={d.term} q={query} />
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                          <Box
                            component="span"
                            sx={{
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              px: 1,
                              py: '3px',
                              borderRadius: '6px',
                              color: accent,
                              bgcolor: `${accent}1a`,
                              border: `1px solid ${accent}2e`,
                            }}
                          >
                            {d.cat}
                          </Box>
                          <Box
                            component="button"
                            aria-label={`Copy link to ${d.term}`}
                            title={copiedTerm === d.term ? 'Đã copy!' : 'Copy deep-link'}
                            onClick={(e) => {
                              e.stopPropagation()
                              copyLink(d.term)
                            }}
                            sx={{
                              display: 'grid',
                              placeItems: 'center',
                              width: 24,
                              height: 24,
                              p: 0,
                              border: `1px solid ${line}`,
                              borderRadius: '6px',
                              bgcolor: 'transparent',
                              color:
                                copiedTerm === d.term ? accent : 'text.secondary',
                              cursor: 'pointer',
                              transition: '0.15s',
                              '&:hover': {
                                color: accent,
                                borderColor: `${accent}66`,
                                bgcolor: `${accent}14`,
                              },
                            }}
                          >
                            {copiedTerm === d.term ? (
                              <CheckIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            )}
                          </Box>
                          <ExpandMoreIcon
                            sx={{
                              fontSize: 18,
                              color: isOpen ? accent : 'text.secondary',
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.25s, color 0.2s',
                            }}
                          />
                        </Stack>
                      </Stack>

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: '0.84rem',
                          lineHeight: 1.6,
                          color: 'text.secondary',
                        }}
                      >
                        <Highlight text={d.short} q={query} />
                      </Typography>

                      <Collapse in={isOpen} unmountOnExit>
                        <Box
                          sx={{
                            mt: 1.75,
                            pt: 1.75,
                            borderTop: `1px dashed ${accent}33`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.84rem',
                              lineHeight: 1.7,
                              color: isDark ? '#c2cbd4' : 'text.primary',
                            }}
                          >
                            <Highlight text={d.detail} q={query} />
                          </Typography>

                          {d.related && d.related.length > 0 && (
                            <Box sx={{ mt: 1.75 }}>
                              <Typography
                                sx={{
                                  fontSize: '0.68rem',
                                  letterSpacing: '0.12em',
                                  textTransform: 'uppercase',
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  mb: 1.1,
                                }}
                              >
                                Thuật ngữ liên quan
                              </Typography>
                              <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
                                {d.related.map((r) => {
                                  const exists = GLOSSARY.some((x) => x.term === r)
                                  return (
                                    <Box
                                      key={r}
                                      component="span"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (exists) goToTerm(r)
                                      }}
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        fontSize: '0.72rem',
                                        fontWeight: 500,
                                        px: 1.4,
                                        py: 0.6,
                                        borderRadius: '999px',
                                        border: `1px solid ${line}`,
                                        bgcolor: chipBg,
                                        color: 'text.secondary',
                                        cursor: exists ? 'pointer' : 'default',
                                        opacity: exists ? 1 : 0.55,
                                        transition: '0.15s',
                                        '&:hover': exists
                                          ? {
                                              color: theme.palette.primary.contrastText,
                                              bgcolor: accent,
                                              borderColor: 'transparent',
                                            }
                                          : {},
                                      }}
                                    >
                                      {r}
                                      {exists && <ArrowForwardIcon sx={{ fontSize: 12 }} />}
                                    </Box>
                                  )
                                })}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          ))
        )}

        {/* Back to home */}
        <Box sx={{ pb: 8 }}>
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

Glossary.Layout = MainLayout

export default Glossary
