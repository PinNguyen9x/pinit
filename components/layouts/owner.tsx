import { useThemeMode } from '@/context/theme-mode'
import { LayoutProps } from '@/models/common'
import { Box, Button, Container, IconButton, Stack } from '@mui/material'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

// Layout riêng cho khu private /me. Không dùng MainLayout: header/footer public
// mang link ra site, còn ở đây chỉ cần điều hướng nội bộ. Site public không
// link vào /me — đừng thêm /me vào header hay footer.
export const OWNER_NAV = [
  { href: '/me/roadmap', label: 'Roadmap' },
  { href: '/me/learn', label: 'Learn' },
  { href: '/me/case-studies', label: 'Case studies' },
  { href: '/me/practice', label: 'Practice' },
]

export function OwnerLayout({ children }: LayoutProps) {
  const router = useRouter()
  const { mode, toggleColorMode } = useThemeMode()

  async function handleLogout() {
    await fetch('/api/me/logout', { method: 'POST' })
    router.replace('/me/login')
  }

  return (
    <Stack minHeight="100vh">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container>
          <Stack direction="row" alignItems="center" spacing={0.5} py={1.5} flexWrap="wrap">
            <Button component={Link} href="/me" color="inherit" sx={{ fontWeight: 700 }}>
              /me
            </Button>
            {OWNER_NAV.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color={router.pathname.startsWith(item.href) ? 'primary' : 'inherit'}
              >
                {item.label}
              </Button>
            ))}
            <Box flexGrow={1} />
            <IconButton onClick={toggleColorMode} aria-label="Đổi giao diện sáng/tối">
              {mode === 'dark' ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>
      <Container component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </Stack>
  )
}
