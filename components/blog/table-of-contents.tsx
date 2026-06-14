import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <Box sx={{ position: 'sticky', top: 100, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
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
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
              '&:hover': { color: 'text.primary', borderColor: activeId === id ? 'primary.main' : 'text.disabled' },
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
