import { useAuth } from '@/hooks'
import { encodeUrl } from '@/utils'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { styled } from '@mui/system'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaBars, FaBlog, FaBriefcase, FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa'

const gradients = [
  'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  'linear-gradient(45deg, #FF4081 30%, #FF79B0 90%)',
  'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
  // 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
  // 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
]

const StyledAppBar = styled(AppBar)(({ backgroundIndex }: { backgroundIndex: number }) => ({
  background: gradients[backgroundIndex],
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  transition: 'background 0.5s ease-in-out',
}))

const StyledButton = styled(Button)(({ active = false }: { active?: boolean }) => ({
  margin: '0 8px',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
  },
  '&:focus': {
    outline: '2px solid #fff',
    outlineOffset: '2px',
  },
  ...(active && {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottom: '2px solid white',
  }),
}))

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Lobster", cursive',
  fontSize: '2.5rem',
  fontWeight: 800,
  color: '#ffffff',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  marginRight: '16px',
  textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    textShadow: '4px 4px 8px rgba(0,0,0,0.4)',
  },
}))

const navigationItems = [
  { label: 'Home', icon: <FaHome />, path: '/' },
  { label: 'Blog', icon: <FaBlog />, path: '/blog' },
  { label: 'Works', icon: <FaBriefcase />, path: '/works', requireLogin: false },
]

export default function Header() {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null)
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const { profile, logout } = useAuth()
  const router = useRouter()
  const isLoggedIn = !!profile?.username
  const routeList = navigationItems.filter((route) => !route?.requireLogin || isLoggedIn)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % gradients.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleMobileMenuOpen = (event: any) => {
    setMobileMenuAnchor(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null)
  }

  const renderNavigationItems = () => {
    if (isMobile) {
      return (
        <>
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={handleMobileMenuOpen}
            edge="start"
          >
            <FaBars />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
          >
            {routeList.map((item) => (
              <MenuItem key={item.label} aria-label={`Navigate to ${item.label}`}>
                <Link href={item.path} onClick={handleMobileMenuClose}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {item.icon}
                    <Typography>{item.label}</Typography>
                  </Box>
                </Link>
              </MenuItem>
            ))}
            {!isLoggedIn && (
              <MenuItem key="login" aria-label={`Navigate to Login`}>
                <Link
                  href={`/login?back_to=${encodeUrl(router.asPath)}`}
                  onClick={handleMobileMenuClose}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <FaUser />
                    <Typography>Login</Typography>
                  </Box>
                </Link>
              </MenuItem>
            )}

            {isLoggedIn && (
              <MenuItem key="logout" onClick={logout}>
                <Box display="flex" alignItems="center" gap={1}>
                  <FaSignOutAlt />
                  <Typography>Logout</Typography>
                </Box>
              </MenuItem>
            )}
          </Menu>
        </>
      )
    }

    return (
      <>
        {navigationItems.map((item) => (
          <Link key={item.label} href={item.path}>
            <StyledButton
              sx={{ color: '#fff' }}
              startIcon={item.icon}
              active={router.pathname === item.path}
            >
              {item.label}
            </StyledButton>
          </Link>
        ))}
        {!isLoggedIn && (
          <Link href={`/login?back_to=${encodeUrl(router.asPath)}`}>
            <StyledButton key={'login'} sx={{ color: '#fff' }} startIcon={<FaUser />}>
              Login
            </StyledButton>
          </Link>
        )}
        {isLoggedIn && (
          <StyledButton
            key={'logout'}
            sx={{ color: '#fff' }}
            startIcon={<FaSignOutAlt />}
            onClick={logout}
          >
            Logout
          </StyledButton>
        )}
      </>
    )
  }

  return (
    <>
      <StyledAppBar position="static" backgroundIndex={backgroundIndex}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', flex: 1 }}
            onClick={() => router.push('/about')}
          >
            <LogoText variant="h4">Nip</LogoText>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{renderNavigationItems()}</Box>
        </Toolbar>
      </StyledAppBar>
    </>
  )
}
