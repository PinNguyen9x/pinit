import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ListAltIcon from '@mui/icons-material/ListAlt'
import { Box, Collapse, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { pickActiveHeadingId } from './toc-active-heading'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
  /** Renders as a tap-to-open panel above the article instead of a sticky rail. */
  variant?: 'sidebar' | 'collapsible'
}

/** Scroll to a heading and put its id in the URL, so the reader can copy a deep link. */
function goToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
}

/**
 * Tracks which heading the reader is currently on.
 *
 * Measures positions on scroll rather than using IntersectionObserver, whose
 * "is a heading inside a narrow band near the top of the screen" model has no
 * answer while the reader is in the middle of a section taller than that band.
 */
function useActiveHeading(items: TocItem[], enabled: boolean) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!enabled || items.length === 0) return

    const headings = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    let frame = 0
    const measure = () => {
      frame = 0
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActiveId(
        pickActiveHeadingId(
          headings.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top })),
          atBottom,
        ),
      )
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items, enabled])

  return activeId
}

export function TableOfContents({ items, variant = 'sidebar' }: TableOfContentsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  // Both variants stay mounted at every breakpoint — only one is ever on screen,
  // so the hidden one shouldn't be measuring headings on every scroll frame.
  const activeId = useActiveHeading(items, variant === 'sidebar' || open)

  // Long posts overflow the rail, so the highlighted entry can sit out of sight.
  // Nudge the rail's own scroll — never scrollIntoView, which would drag the page
  // along with it.
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !activeId) return
    const link = Array.from(container.querySelectorAll<HTMLElement>('[data-toc-id]')).find(
      (el) => el.dataset.tocId === activeId,
    )
    if (!link) return

    const rail = container.getBoundingClientRect()
    const entry = link.getBoundingClientRect()
    const margin = 16
    if (entry.top < rail.top) container.scrollTop -= rail.top - entry.top + margin
    else if (entry.bottom > rail.bottom) container.scrollTop += entry.bottom - rail.bottom + margin
  }, [activeId])

  if (items.length === 0) return null

  const links = (
    <Box
      component="nav"
      aria-label="Table of contents"
      sx={{ borderLeft: '1px solid', borderColor: 'divider' }}
    >
      {items.map(({ id, text, level }) => (
        <Box
          key={id}
          component="a"
          href={`#${id}`}
          data-toc-id={id}
          aria-current={activeId === id ? 'location' : undefined}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            goToHeading(id)
            if (variant === 'collapsible') setOpen(false)
          }}
          sx={{
            display: 'block',
            py: '0.35em',
            pl: level === 2 ? 1.5 : level === 3 ? 3 : 4,
            pr: 1,
            fontSize: level === 2 ? '0.8rem' : '0.75rem',
            fontWeight: activeId === id ? 600 : 400,
            color: activeId === id ? 'primary.main' : 'text.secondary',
            textDecoration: 'none',
            borderLeft: '2px solid',
            borderColor: activeId === id ? 'primary.main' : 'transparent',
            ml: '-1px',
            lineHeight: 1.5,
            transition: 'color 0.15s, border-color 0.15s',
            '&:hover': {
              color: 'text.primary',
              borderColor: activeId === id ? 'primary.main' : 'text.disabled',
            },
            cursor: 'pointer',
          }}
        >
          {text}
        </Box>
      ))}
    </Box>
  )

  // Mobile: the rail is hidden, so without this a 16-section post has no
  // navigation at all — you can only scroll.
  if (variant === 'collapsible') {
    return (
      <Box
        sx={{
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            px: 2,
            py: 1.5,
            border: 'none',
            bgcolor: 'transparent',
            color: 'text.primary',
            font: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <ListAltIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          <Typography variant="body2" fontWeight={600} flexGrow={1}>
            Nội dung bài viết
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {items.length} mục
          </Typography>
          <ExpandMoreIcon
            sx={{
              fontSize: 20,
              color: 'text.disabled',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </Box>
        <Collapse in={open}>
          <Box sx={{ px: 2, pb: 2, maxHeight: '50vh', overflowY: 'auto' }}>{links}</Box>
        </Collapse>
      </Box>
    )
  }

  return (
    <Box
      ref={scrollRef}
      sx={{
        position: 'sticky',
        top: 100,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        // The rail scrolls on its own, but its scrollbar sits right next to the
        // window's and reads as a second page scrollbar. Keep the gutter (so the
        // list never reflows) and only paint the thumb while the pointer is here.
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': { scrollbarColor: 'rgba(128,128,128,0.4) transparent' },
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
          borderRadius: 3,
          transition: 'background-color 0.2s',
        },
        '&:hover::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(128,128,128,0.4)' },
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        letterSpacing="0.1em"
        textTransform="uppercase"
        color="text.disabled"
        display="block"
        mb={2}
        sx={{ fontSize: '0.65rem' }}
      >
        On this page
      </Typography>
      {links}
    </Box>
  )
}
