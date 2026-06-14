import { Email, Favorite, GitHub, LinkedIn, KeyboardArrowUp } from '@mui/icons-material'
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { Logo } from './logo'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Works', path: '/works' },
]

const socialLinks = [
  { icon: GitHub, url: 'https://github.com/PinNguyen9x', label: 'GitHub' },
  {
    icon: LinkedIn,
    url: 'https://www.linkedin.com/in/pin-nguyen-69123b16a/',
    label: 'LinkedIn',
  },
  { icon: Email, url: 'mailto:nguyenthanhpin95@gmail.com', label: 'Email' },
]

export function Footer() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const columnLabelSx = {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
    mb: 1.75,
  }

  const linkTextSx = {
    fontSize: '0.825rem',
    color: 'text.secondary',
    cursor: 'pointer',
    transition: 'color 0.15s',
    '&:hover': { color: 'primary.main' },
  }

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        mt: { xs: 8, md: 12 },
        pt: 6,
        pb: 4,
        borderTop: `1px solid ${borderColor}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(22,163,74,0.45) 30%, rgba(16,185,129,0.45) 50%, rgba(52,211,153,0.35) 70%, transparent 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 5, md: 6 }}
          justifyContent="space-between"
          mb={5}
        >
          {/* Brand */}
          <Box maxWidth={{ md: 320 }}>
            <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
              <Logo size={32} />
              <Typography
                fontWeight={800}
                fontSize="1.05rem"
                letterSpacing="-0.02em"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              >
                pin nguyen cute
                <Favorite
                  sx={{
                    fontSize: 16,
                    color: '#ff4d6d',
                    animation: 'heartBeat 1.4s ease-in-out infinite',
                    '@keyframes heartBeat': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '25%': { transform: 'scale(1.2)' },
                      '50%': { transform: 'scale(0.95)' },
                      '75%': { transform: 'scale(1.15)' },
                    },
                  }}
                />
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              lineHeight={1.7}
              fontSize="0.875rem"
              mb={2}
            >
              Full-stack engineer building data platforms and big-data systems — from real-time
              pipelines and scalable APIs to polished user interfaces.
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                display: 'inline-flex',
                px: 1.25,
                py: 0.5,
                borderRadius: '999px',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.35)' : 'rgba(5,150,105,0.35)'}`,
                bgcolor: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(5,150,105,0.06)',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  boxShadow: `0 0 0 3px ${
                    isDark ? 'rgba(52,211,153,0.18)' : 'rgba(5,150,105,0.18)'
                  }`,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: 'secondary.main', fontWeight: 600, fontSize: '0.7rem' }}
              >
                Available for work
              </Typography>
            </Stack>
          </Box>

          {/* Navigate */}
          <Box>
            <Typography sx={columnLabelSx}>Navigate</Typography>
            <Stack spacing={1.25}>
              {navLinks.map(({ label, path }) => (
                <Link key={label} href={path} style={{ textDecoration: 'none' }}>
                  <Typography sx={linkTextSx}>{label}</Typography>
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Connect */}
          <Box>
            <Typography sx={columnLabelSx}>Connect</Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={url}
                  target={url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={label}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    p: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      bgcolor: isDark ? 'rgba(22,163,74,0.08)' : 'rgba(22,163,74,0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 6px 18px -8px rgba(22,163,74,0.5)'
                        : '0 6px 18px -8px rgba(22,163,74,0.35)',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </IconButton>
              ))}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={2}
              fontSize="0.75rem"
            >
              nguyenthanhpin95@gmail.com
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderColor }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          pt={3}
        >
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            © {new Date().getFullYear()} Pin Nguyen. Built with{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Next.js
            </Box>{' '}
            &{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              TypeScript
            </Box>
            .
          </Typography>

          <Button
            onClick={scrollTop}
            size="small"
            endIcon={<KeyboardArrowUp sx={{ fontSize: 16 }} />}
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              transition: 'all 0.15s',
              '&:hover': {
                color: 'primary.main',
                borderColor: 'primary.main',
                bgcolor: 'transparent',
              },
            }}
          >
            Back to top
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}
