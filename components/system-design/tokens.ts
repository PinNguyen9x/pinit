import { useTheme } from '@mui/material'

/**
 * Token màu dùng chung cho các component System Design.
 * Bám theo bảng màu đang dùng ở pages/glossary.tsx để hai trang học nhìn
 * cùng một hệ.
 */
export function useSystemDesignTokens() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return {
    isDark,
    accent: theme.palette.primary.main,
    line: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    cardBg: isDark ? 'rgba(14,18,15,0.5)' : 'rgba(255,255,255,0.65)',
    cardBgHover: isDark ? 'rgba(14,22,16,0.72)' : 'rgba(255,255,255,0.9)',
    chipBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  }
}
