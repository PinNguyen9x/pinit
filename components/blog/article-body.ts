import type { SxProps, Theme } from '@mui/material'

/**
 * Style cho HTML do utils/markdown.ts sinh ra. Dùng chung cho bài blog và các
 * trang note ở khu /me, để một chỗ sửa là cả hai đổi theo.
 */
export function articleBodySx(isDark: boolean): SxProps<Theme> {
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return {
    '& h1, & h2, & h3, & h4': {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      mt: '2.25em',
      mb: '0.75em',
      lineHeight: 1.3,
      color: 'text.primary',
      scrollMarginTop: '80px',
    },
    '& h1': { fontSize: { xs: '1.5rem', md: '1.875rem' } },
    '& h2': {
      fontSize: { xs: '1.25rem', md: '1.5rem' },
      borderLeft: '3px solid #16a34a',
      pl: '0.75em',
      mt: '2.5em',
    },
    '& h3': { fontSize: { xs: '1.05rem', md: '1.2rem' } },
    '& h4': { fontSize: '1rem' },
    '& h2 a, & h3 a, & h4 a': {
      color: 'inherit',
      textDecoration: 'none',
      '&:hover': { color: 'primary.main' },
    },
    '& p': {
      lineHeight: 1.9,
      mb: '1.5em',
      fontSize: '1.0625rem',
      color: isDark ? '#c9d1d9' : '#374151',
    },
    '& a:not(h2 a):not(h3 a)': {
      color: 'primary.main',
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
    },
    '& strong': { fontWeight: 700, color: 'text.primary' },
    '& em': { fontStyle: 'italic' },
    '& ul, & ol': { pl: '1.75em', mb: '1.5em' },
    '& li': {
      mb: '0.55em',
      lineHeight: 1.85,
      fontSize: '1.0625rem',
      color: isDark ? '#c9d1d9' : '#374151',
    },
    '& li > ul, & li > ol': { mt: '0.5em', mb: 0 },
    '& blockquote': {
      mx: 0,
      my: '2em',
      pl: 3,
      pr: 2,
      py: 1.25,
      borderLeft: '4px solid #16a34a',
      color: 'text.secondary',
      bgcolor: isDark ? 'rgba(22,163,74,0.07)' : 'rgba(22,163,74,0.05)',
      borderRadius: '0 8px 8px 0',
      '& p': { mb: 0, color: 'inherit', lineHeight: 1.8, fontStyle: 'italic' },
    },
    '& pre': {
      overflow: 'auto',
      mb: '0',
      fontSize: '0.875rem',
      lineHeight: 1.7,
    },
    '& code:not(pre > code)': {
      bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
      px: '0.45em',
      py: '0.2em',
      borderRadius: '5px',
      fontSize: '0.875em',
      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
      color: isDark ? '#e2e8f0' : '#1a202c',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
    },
    '& img': {
      maxWidth: '100%',
      borderRadius: '10px',
      my: 2.5,
      border: `1px solid ${borderColor}`,
      boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
    },
    '& hr': { my: 5, borderColor: 'divider' },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      mb: '1.75em',
      display: 'block',
      overflowX: 'auto',
    },
    '& th': {
      p: '0.75em 1em',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
      textAlign: 'left',
      fontWeight: 700,
      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap',
    },
    '& td': {
      p: '0.75em 1em',
      border: `1px solid ${borderColor}`,
      textAlign: 'left',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    '& tr:nth-of-type(even) td': {
      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
    },
  }
}
