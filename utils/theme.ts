import { createTheme, responsiveFontSizes } from '@mui/material/styles'

/**
 * Bảng màu gốc — nguồn DUY NHẤT. MUI palette đọc hex từ đây (cần hex thật vì
 * alpha()/darken() không tính được trên var()), còn CSS thuần đọc qua biến
 * --color-* mà MuiCssBaseline bên dưới đổ lên :root theo mode hiện tại.
 *
 * Dark là mặc định: nền nâu-đen ấm thay cho #000 phẳng, chiều sâu đến từ hai
 * lớp (bg → surface), không từ glow. Xanh lá chỉ cho link, điểm nhấn, trạng thái.
 */
export const PALETTE = {
  dark: {
    bg: '#16130F', // cà phê đêm — nền trang
    surface: '#1F1B16', // mặt giấy — lớp nổi (khối nhật ký, header khi cuộn)
    line: '#2E2922', // viền 1px, phân cách
    ink: '#ECE6DA', // chữ chính
    inkMuted: '#A39B8C', // ngày, meta, mô tả
    accent: '#7BD88F', // xanh lá
  },
  light: {
    bg: '#FFFCF5',
    surface: '#FFFFFF',
    line: '#E8DFCC',
    ink: '#2A2620',
    inkMuted: '#6B655A',
    accent: '#1F7A3D',
  },
} as const

export function getTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  const c = PALETTE[mode]

  let t = createTheme({
    palette: {
      mode,
      primary: {
        main: c.accent,
        light: isDark ? '#A3E6B0' : '#2E9450',
        dark: isDark ? '#5BBF71' : '#17602F',
        contrastText: isDark ? c.bg : '#ffffff',
      },
      secondary: {
        main: c.accent,
        contrastText: isDark ? c.bg : '#ffffff',
      },
      background: {
        default: c.bg,
        paper: c.surface,
      },
      text: {
        primary: c.ink,
        secondary: c.inkMuted,
      },
      divider: c.line,
    },
    typography: {
      // Be Vietnam Pro: thiết kế riêng cho dấu tiếng Việt — dấu chồng (ẫ, Ứ, ự)
      // không lệch, không rơi sang font fallback. Inter giữ lại làm fallback.
      fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
      // Thang 1.25: 15 / 17 / 21 / 27 / 34 / 42px. Tracking âm nhẹ thôi — siết
      // -0.04em như trước làm dấu của hai chữ cạnh nhau chạm vào nhau.
      body1: { fontSize: '1.0625rem', lineHeight: 1.65 },
      body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
      h1: { fontWeight: 700, letterSpacing: '-0.015em' },
      h2: { fontWeight: 700, letterSpacing: '-0.015em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            '--color-bg': c.bg,
            '--color-surface': c.surface,
            '--color-line': c.line,
            '--color-ink': c.ink,
            '--color-ink-muted': c.inkMuted,
            '--color-accent': c.accent,
          },
        },
      },
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
            border: `1px solid ${c.line}`,
            boxShadow: 'none',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'inherit',
            '&:hover': { color: c.accent },
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
            borderColor: c.line,
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
