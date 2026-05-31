import { ThemeColorModeContext } from '@/context/theme-mode'
import { useAuth } from '@/hooks'
import { encodeUrl } from '@/utils'
import { Logo } from '../logo'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Glossary', path: '/glossary' },
  { label: 'Works', path: '/works' },
]

export default function Header() {
  const { profile, logout } = useAuth()
  const router = useRouter()
  const isLoggedIn = !!profile?.username
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleColorMode, mode } = useContext(ThemeColorModeContext)
  const isDark = mode === 'dark'

  const isActive = (path: string) =>
    path === '/' ? router.pathname === '/' : router.pathname.startsWith(path)

  const navLinkSx = (active: boolean) => ({
    display: 'inline-flex',
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? (isDark ? '#ffffff' : '#000000') : isDark ? '#888888' : '#666666',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'color 0.15s, background-color 0.15s',
    '&:hover': {
      color: isDark ? '#ffffff' : '#000000',
      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
  })

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          color: isDark ? '#ededed' : '#111111',
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
          <Link
            href="/about"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
            aria-label="About me"
          >
            <Logo size={36} />
          </Link>

          <Box flexGrow={1} />

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.path} style={{ textDecoration: 'none' }}>
                <Box component="span" sx={navLinkSx(isActive(item.path))}>
                  {item.label}
                </Box>
              </Link>
            ))}
            {!isLoggedIn ? (
              <Link
                href={`/login?back_to=${encodeUrl(router.asPath)}`}
                style={{ textDecoration: 'none' }}
              >
                <Box component="span" sx={navLinkSx(false)}>
                  Login
                </Box>
              </Link>
            ) : (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: 1,
                  pl: 1.5,
                  borderLeft: `1px solid ${
                    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                  }`,
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '999px',
                    border: `1px solid ${
                      isDark ? 'rgba(74,222,128,0.32)' : 'rgba(22,163,74,0.28)'
                    }`,
                    bgcolor: isDark ? 'rgba(22,163,74,0.10)' : 'rgba(22,163,74,0.06)',
                    color: 'primary.main',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    maxWidth: 180,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile?.username}
                  </Box>
                </Box>
                <Box component="span" onClick={logout} sx={navLinkSx(false)}>
                  Logout
                </Box>
              </Box>
            )}
          </Box>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleColorMode}
            size="small"
            aria-label="Toggle theme"
            sx={{
              ml: 1,
              color: isDark ? '#888888' : '#666666',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#ffffff' : '#000000',
              },
            }}
          >
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          {/* Mobile Menu Button */}
          <IconButton
            size="small"
            aria-label="Open menu"
            sx={{
              ml: 0.5,
              display: { xs: 'flex', md: 'none' },
              color: isDark ? '#888888' : '#666666',
            }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 240,
            bgcolor: isDark ? '#0a0a0a' : '#ffffff',
            borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700} fontSize="0.9rem" color={isDark ? '#ededed' : '#111111'}>
            Navigation
          </Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
        <List sx={{ py: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <ListItemButton
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path)
                    ? isDark
                      ? '#ffffff'
                      : '#000000'
                    : isDark
                    ? '#888888'
                    : '#666666',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {item.label}
              </ListItemButton>
            </Link>
          ))}
          <Divider
            sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          />
          {!isLoggedIn ? (
            <Link
              href={`/login?back_to=${encodeUrl(router.asPath)}`}
              onClick={() => setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <ListItemButton
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  py: 1,
                  color: isDark ? '#888888' : '#666666',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                Login
              </ListItemButton>
            </Link>
          ) : (
            <>
              <Box
                sx={{
                  mx: 2,
                  mb: 1,
                  px: 1.25,
                  py: 0.75,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: '999px',
                  border: `1px solid ${
                    isDark ? 'rgba(74,222,128,0.32)' : 'rgba(22,163,74,0.28)'
                  }`,
                  bgcolor: isDark ? 'rgba(22,163,74,0.10)' : 'rgba(22,163,74,0.06)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  maxWidth: 'fit-content',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                  }}
                />
                {profile?.username}
              </Box>
              <ListItemButton
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  py: 1,
                  color: isDark ? '#888888' : '#666666',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                Logout
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
    </>
  )
}
