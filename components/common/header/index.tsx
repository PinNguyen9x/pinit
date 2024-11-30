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
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FaBars, FaBlog, FaBriefcase, FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa'

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
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

const navigationItems = [
  { label: 'Home', icon: <FaHome />, path: '/' },
  { label: 'Blog', icon: <FaBlog />, path: '/blog' },
  { label: 'Works', icon: <FaBriefcase />, path: '/works', requireLogin: false },
]

export default function Header() {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null)
  const { profile, logout } = useAuth()
  const router = useRouter()
  const isLoggedIn = !!profile?.username
  const routeList = navigationItems.filter((route) => !route?.requireLogin || isLoggedIn)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
                <Link href={item.path}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {item.icon}
                    <Typography>{item.label}</Typography>
                  </Box>
                </Link>
              </MenuItem>
            ))}
            {!isLoggedIn && (
              <MenuItem key="login" aria-label={`Navigate to Login`}>
                <Link href={`/login?back_to=${encodeUrl(router.asPath)}`}>
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
          <Link href={`/login?back_to=${encodeUrl(router.asPath)}`}>
            <StyledButton key={'logout'} sx={{ color: '#fff' }} startIcon={<FaSignOutAlt />}>
              Logout
            </StyledButton>
          </Link>
        )}
      </>
    )
  }

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {renderNavigationItems()}
        </Toolbar>
      </StyledAppBar>
    </>
  )
}
