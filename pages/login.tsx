import { LoginForm } from '@/components/auth'
import { MainLayout } from '@/components/layouts'
import { useAuth } from '@/hooks'
import { LoginPayload } from '@/models'
import { decodeUrl, getErrorMessage } from '@/utils'
import { Box, Container, Stack, Typography, useTheme } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { MdArrowBack } from 'react-icons/md'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const router = useRouter()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { login, isLoggedIn, firstLoading } = useAuth({ revalidateOnMount: false })

  const backTo = router.query.back_to ? decodeUrl(router.query.back_to as string) : '/'

  // If the user is already signed in, send them back to where they came from
  // instead of re-prompting for credentials.
  useEffect(() => {
    if (!firstLoading && isLoggedIn) {
      router.replace(backTo)
    }
  }, [firstLoading, isLoggedIn, backTo, router])

  async function handleLoginClick(data: LoginPayload) {
    try {
      await login(data)
      toast.success('Welcome back!')
      router.push(backTo)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(220,38,38,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 70%, rgba(5,150,105,0.10) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(220,38,38,0.09) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 70%, rgba(5,150,105,0.05) 0%, transparent 70%)',
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
          maskImage: 'radial-gradient(ellipse 50% 50% at 50% 30%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 30%, black, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box mb={3}>
          <Link href={backTo} style={{ textDecoration: 'none' }}>
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                display: 'inline-flex',
                color: 'text.secondary',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.15s',
              }}
            >
              <MdArrowBack size={15} />
              <span>Back</span>
            </Stack>
          </Link>
        </Box>

        <Box
          sx={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
            borderRadius: '16px',
            bgcolor: isDark ? '#0d0d10' : '#ffffff',
            p: { xs: 3, sm: 5 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.7) 50%, transparent 100%)',
            },
          }}
        >
          <Stack spacing={1} alignItems="center" textAlign="center" mb={4}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: isDark ? 'rgba(220,38,38,0.10)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${
                  isDark ? 'rgba(248,113,113,0.32)' : 'rgba(220,38,38,0.28)'
                }`,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Box>
            <Typography
              component="h1"
              fontWeight={700}
              fontSize={{ xs: '1.5rem', sm: '1.875rem' }}
              letterSpacing="-0.02em"
              color="text.primary"
            >
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access protected content like the CV download.
            </Typography>
          </Stack>

          <LoginForm onSubmit={handleLoginClick} />

          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            color="text.secondary"
            mt={3}
            sx={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}
          >
            username ≥ 4 chars · password ≥ 6 chars
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

LoginPage.Layout = MainLayout
