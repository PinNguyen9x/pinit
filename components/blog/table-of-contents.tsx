import { Box, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { pickActiveHeadingId } from './toc-active-heading'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
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
function useActiveHeading(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

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
  }, [items])

  return activeId
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const activeId = useActiveHeading(items)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      <Box
        component="nav"
        aria-label="Table of contents"
        sx={{
          borderLeft: '1px solid',
          borderColor: 'divider',
          pl: 0,
        }}
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
    </Box>
  )
}
