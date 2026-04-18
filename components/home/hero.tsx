import avatar from '@/images/avatar.png'
import { Box, Button, Container, keyframes, Stack, Typography, useTheme } from '@mui/material'
import Image from 'next/image'

const techStack = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Go', 'Java', 'Python']

const floatY = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
`

const spin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.08); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.75) rotate(0deg); }
  50%      { opacity: 1;    transform: scale(1.15) rotate(90deg); }
`

const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const sparklePositions = [
  { top: '12%', left: '8%', size: 14, delay: '0s', duration: '3.2s' },
  { top: '22%', right: '18%', size: 10, delay: '0.6s', duration: '2.6s' },
  { bottom: '18%', left: '14%', size: 12, delay: '1.1s', duration: '3.8s' },
  { bottom: '28%', right: '9%', size: 9, delay: '0.3s', duration: '2.9s' },
  { top: '48%', left: '46%', size: 8, delay: '1.6s', duration: '3.4s' },
] as const

function Sparkle({
  top,
  left,
  right,
  bottom,
  size,
  delay,
  duration,
  color,
}: {
  top?: string
  left?: string
  right?: string
  bottom?: string
  size: number
  delay: string
  duration: string
  color: string
}) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        animation: `${twinkle} ${duration} ease-in-out ${delay} infinite`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg viewBox="0 0 20 20" fill={color}>
        <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" />
      </svg>
    </Box>
  )
}

export function HeroSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const sparkleColor = isDark ? 'rgba(252,165,165,0.9)' : 'rgba(220,38,38,0.55)'

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 10, md: 16 },
        pb: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(220,38,38,0.18) 0%, transparent 70%), radial-gradient(ellipse 55% 35% at 85% 30%, rgba(5,150,105,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(220,38,38,0.09) 0%, transparent 70%), radial-gradient(ellipse 55% 35% at 85% 30%, rgba(5,150,105,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {sparklePositions.map((p, i) => (
        <Sparkle key={i} {...p} color={sparkleColor} />
      ))}

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          spacing={{ xs: 6, md: 8 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box maxWidth={{ md: '540px' }} sx={{ animation: `${fadeUp} 0.7s ease-out both` }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  boxShadow: '0 0 0 4px rgba(220,38,38,0.18)',
                  animation: `${pulseGlow} 2.2s ease-in-out infinite`,
                },
              }}
            >
              Full-Stack Developer · Available for work
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.4rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                mb: 3,
                background: isDark
                  ? 'linear-gradient(110deg, #ffffff 0%, #b4d1ff 35%, #ffffff 55%, #b4d1ff 75%, #ffffff 100%)'
                  : 'linear-gradient(110deg, #000 0%, #dc2626 35%, #000 55%, #dc2626 75%, #000 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: `${gradientShift} 8s ease infinite`,
              }}
            >
              Hi, I&apos;m Pin Nguyen
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: 'text.secondary',
                lineHeight: 1.75,
                mb: 4,
                animation: `${fadeUp} 0.9s ease-out 0.1s both`,
              }}
            >
              Full-stack engineer focused on building data platforms and big-data systems. From
              real-time pipelines and scalable APIs to polished user interfaces — crafting
              reliable, production-grade products end to end.
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              mb={4}
              sx={{ animation: `${fadeUp} 1s ease-out 0.2s both` }}
            >
              {techStack.map((tech, i) => (
                <Box
                  key={tech}
                  sx={{
                    position: 'relative',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    fontSize: '0.775rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    letterSpacing: '0.01em',
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    animation: `${fadeUp} 0.6s ease-out ${0.3 + i * 0.05}s both`,
                    '&:hover': {
                      color: isDark ? '#ffffff' : '#dc2626',
                      borderColor: 'rgba(220,38,38,0.55)',
                      bgcolor: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 6px 20px -8px rgba(220,38,38,0.6)'
                        : '0 6px 20px -8px rgba(220,38,38,0.35)',
                    },
                  }}
                >
                  {tech}
                </Box>
              ))}
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{ animation: `${fadeUp} 1.1s ease-out 0.35s both` }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#000000' : '#ffffff',
                  fontWeight: 600,
                  px: 3,
                  py: 1.25,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)',
                    transform: 'translateX(-120%)',
                    transition: 'transform 0.6s ease',
                  },
                  '&:hover': {
                    bgcolor: isDark ? '#e5e5e5' : '#333333',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 12px 32px -8px rgba(255,255,255,0.25)'
                      : '0 12px 32px -8px rgba(0,0,0,0.35)',
                    '&::before': { transform: 'translateX(120%)' },
                  },
                }}
              >
                Download Resume
              </Button>
              <Button
                component="a"
                href="/blog"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 3,
                  py: 1.25,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: isDark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.04)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Read Blog
              </Button>
            </Stack>
          </Box>

          {/* Avatar with rotating gradient ring + float animation */}
          <Box
            sx={{
              flexShrink: 0,
              position: 'relative',
              width: { xs: 180, md: 220 },
              height: { xs: 180, md: 220 },
              animation: `${floatY} 5s ease-in-out infinite`,
            }}
          >
            {/* Rotating gradient ring */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 0deg, #dc2626, #f97316, #fbbf24, #34d399, #dc2626)',
                animation: `${spin} 14s linear infinite`,
                filter: 'blur(2px)',
                opacity: isDark ? 0.6 : 0.45,
                zIndex: 0,
              }}
            />
            {/* Soft pulse halo */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                background: isDark
                  ? 'radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 60%)'
                  : 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 60%)',
                filter: 'blur(16px)',
                animation: `${pulseGlow} 3.6s ease-in-out infinite`,
                zIndex: 0,
              }}
            />
            {/* Avatar disc */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${isDark ? '#0a0a0a' : '#ffffff'}`,
                boxShadow: isDark
                  ? '0 0 0 1px rgba(255,255,255,0.1), 0 24px 48px rgba(0,0,0,0.55)'
                  : '0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.18)',
              }}
            >
              <Image
                src={avatar}
                alt="Pin Nguyen"
                width={220}
                height={220}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                priority
              />
            </Box>

            {/* Accent sparkle near avatar */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: -8,
                right: -4,
                width: 20,
                height: 20,
                zIndex: 2,
                animation: `${twinkle} 2.2s ease-in-out infinite`,
                pointerEvents: 'none',
              }}
            >
              <svg viewBox="0 0 20 20" fill="#ffd875">
                <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" />
              </svg>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
