import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase, Stack, useTheme } from '@mui/material'

export interface WorkFiltersProps {
  query: string
  onQueryChange: (q: string) => void
  tags: { name: string; count: number }[]
  activeTag: string
  onTagChange: (tag: string) => void
  totalCount: number
}

export function WorkFilters({
  query,
  onQueryChange,
  tags,
  activeTag,
  onTagChange,
  totalCount,
}: WorkFiltersProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main
  const line = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const allTags = [{ name: 'All', count: totalCount }, ...tags]

  return (
    <Stack spacing={2.5} sx={{ mb: { xs: 4, md: 5 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: 420,
          width: '100%',
          px: 1.75,
          py: 1.25,
          borderRadius: '10px',
          border: `1px solid ${line}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          transition: 'border-color 0.2s',
          '&:focus-within': { borderColor: accent },
        }}
      >
        <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <InputBase
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${totalCount} projects…`}
          sx={{
            flex: 1,
            color: 'text.primary',
            fontSize: '0.88rem',
            '& input::placeholder': { color: 'text.secondary', opacity: 0.7 },
          }}
        />
        <Box
          component="kbd"
          sx={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: '0.65rem',
            color: 'text.secondary',
            border: `1px solid ${line}`,
            px: 0.65,
            py: 0.25,
            borderRadius: '4px',
            display: { xs: 'none', sm: 'inline-block' },
          }}
        >
          ⌘K
        </Box>
      </Box>

      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {allTags.map((tag) => {
          const on = activeTag === tag.name
          return (
            <Box
              key={tag.name}
              component="button"
              onClick={() => onTagChange(tag.name)}
              sx={{
                appearance: 'none',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color: on ? '#fff' : 'text.secondary',
                bgcolor: on ? accent : 'transparent',
                border: `1px solid ${on ? accent : line}`,
                px: 1.5,
                py: 0.85,
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.15s',
                '&:hover': {
                  borderColor: on ? accent : isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                  color: on ? '#fff' : 'text.primary',
                },
              }}
            >
              <Box component="span">{tag.name}</Box>
              <Box
                component="span"
                sx={{
                  fontSize: '0.6rem',
                  color: on ? 'rgba(255,255,255,0.75)' : 'text.secondary',
                  opacity: on ? 1 : 0.7,
                }}
              >
                {tag.count}
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}
