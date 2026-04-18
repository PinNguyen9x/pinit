import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export function getTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'

  let t = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#f87171' : '#dc2626',
        light: isDark ? '#fca5a5' : '#ef4444',
        dark: isDark ? '#ef4444' : '#991b1b',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#34d399' : '#059669',
        light: isDark ? '#6ee7b7' : '#10b981',
        dark: isDark ? '#10b981' : '#047857',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#000000' : '#ffffff',
        paper: isDark ? '#0a0a0a' : '#fafafa',
      },
      text: {
        primary: isDark ? '#ededed' : '#111111',
        secondary: isDark ? '#888888' : '#666666',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Heebo", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.04em' },
      h2: { fontWeight: 700, letterSpacing: '-0.03em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiContainer: {
        styleOverrides: {
          maxWidthSm: {
            maxWidth: '680px',
            '@media (min-width: 600px)': { maxWidth: '680px' },
          },
          maxWidthMd: {
            maxWidth: '900px',
            '@media (min-width: 900px)': { maxWidth: '900px' },
          },
        },
        defaultProps: { maxWidth: 'md' },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            fontSize: '0.72rem',
            borderRadius: '6px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'inherit',
            '&:hover': { color: isDark ? '#f87171' : '#dc2626' },
          },
        },
        defaultProps: { underline: 'none' },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: '8px' },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        },
      },
    },
  })

  t = responsiveFontSizes(t)
  return t
}

// Default export kept for _document.tsx
export const theme = getTheme('dark')
