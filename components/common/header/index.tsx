import { ThemeColorModeContext } from '@/context/theme-mode'
import { useAuth } from '@/hooks/use-auth'
import { encodeUrl } from '@/utils'
import { Logo } from '../logo'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Drawer, IconButton, List, ListItemButton, Toolbar } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

// Không có mục "Trang chủ": tên trang ở góc trái đã là link về trang chủ.
const navItems = [
  { label: 'Bài viết', path: '/blog' },
  { label: 'Thuật ngữ', path: '/glossary' },
  { label: 'System design', path: '/system-design' },
  { label: 'Dự án', path: '/works' },
  { label: 'Giới thiệu', path: '/about' },
]

const focusRing = {
  '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
}

export default function Header() {
  const { profile, logout } = useAuth()
  const router = useRouter()
  const isLoggedIn = !!profile?.username
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleColorMode, mode } = useContext(ThemeColorModeContext)
  const isDark = mode === 'dark'
  const loginHref = `/login?back_to=${encodeUrl(router.asPath)}`

  const isActive = (path: string) => router.pathname.startsWith(path)

  // Mục đang mở: chữ đậm + gạch dưới xanh — xanh ở đây là "trạng thái", đúng
  // một trong ba vai trò được phép của màu nhấn.
  const navLinkSx = (active: boolean) => ({
    display: 'inline-flex',
    px: 1.25,
    py: 0.75,
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'text.primary' : 'text.secondary',
    textDecoration: active ? 'underline' : 'none',
    textDecorationColor: 'var(--color-accent)',
    textDecorationThickness: '2px',
    textUnderlineOffset: '6px',
    cursor: 'pointer',
    transition: 'color 0.15s',
    '&:hover': { color: 'text.primary' },
    ...focusRing,
  })

  const drawerItemSx = (active: boolean) => ({
    mx: 1,
    mb: 0.5,
    py: 1,
    borderRadius: '6px',
    fontSize: '0.9375rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'text.primary' : 'text.secondary',
    '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'var(--color-line)' },
  })

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
          backgroundImage: 'none',
          borderBottom: '1px solid var(--color-line)',
          color: 'text.primary',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '900px',
            mx: 'auto',
            width: '100%',
            px: { xs: 2, md: 3 },
            minHeight: { xs: 56, md: 64 },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'text.primary',
              ...focusRing,
            }}
          >
            <Logo size={32} />
            Sổ tay của Pin
          </Box>

          <Box flexGrow={1} />

          <Box
            component="nav"
            aria-label="Điều hướng chính"
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
          >
            {navItems.map((item) => (
              <Box
                key={item.path}
                component={Link}
                href={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                sx={navLinkSx(isActive(item.path))}
              >
                {item.label}
              </Box>
            ))}
            {!isLoggedIn ? (
              <Box component={Link} href={loginHref} sx={navLinkSx(false)}>
                Đăng nhập
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  ml: 1,
                  pl: 1.25,
                  borderLeft: '1px solid var(--color-line)',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    maxWidth: 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile?.username}
                </Box>
                <Box component="button" type="button" onClick={logout} sx={buttonReset(navLinkSx(false))}>
                  Đăng xuất
                </Box>
              </Box>
            )}
          </Box>

          <IconButton
            onClick={toggleColorMode}
            size="small"
            aria-label={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'text.primary' }, ...focusRing }}
          >
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <IconButton
            size="small"
            aria-label="Mở menu"
            sx={{ ml: 0.5, display: { xs: 'flex', md: 'none' }, color: 'text.secondary', ...focusRing }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: 'var(--color-surface)',
            backgroundImage: 'none',
            borderLeft: '1px solid var(--color-line)',
          },
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <List component="nav" aria-label="Điều hướng chính" sx={{ py: 0 }}>
          {[{ label: 'Trang chủ', path: '/' }, ...navItems].map((item) => {
            const active = item.path === '/' ? router.pathname === '/' : isActive(item.path)
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                href={item.path}
                selected={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
                sx={drawerItemSx(active)}
              >
                {item.label}
              </ListItemButton>
            )
          })}
          <Box sx={{ my: 1, mx: 2, borderTop: '1px solid var(--color-line)' }} />
          {!isLoggedIn ? (
            <ListItemButton
              component={Link}
              href={loginHref}
              onClick={() => setMobileOpen(false)}
              sx={drawerItemSx(false)}
            >
              Đăng nhập
            </ListItemButton>
          ) : (
            <>
              <Box sx={{ mx: 2, mb: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>
                {profile?.username}
              </Box>
              <ListItemButton
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                sx={drawerItemSx(false)}
              >
                Đăng xuất
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
    </>
  )
}

function buttonReset<T extends object>(sx: T) {
  // Reset đứng TRƯỚC: `font` là shorthand, đặt sau sẽ đè mất fontSize/fontWeight của sx.
  return { border: 0, background: 'none', font: 'inherit', ...sx }
}
