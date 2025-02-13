import { LayoutProps } from '@/models/common'
import { Box, IconButton, Stack } from '@mui/material'
import dynamic from 'next/dynamic'
import { Footer } from '../common/footer'
import { ZaloIcon } from '../social'
const Header = dynamic(() => import('../common/header'), { ssr: false })

export function MainLayout({ children }: LayoutProps) {
  return (
    <Stack minHeight={'100vh'}>
      <Header />
      <Box flexGrow={1} component="main">
        {children}
      </Box>
      <Footer />
      <IconButton
        href="https://zalo.me/Nip"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          zIndex: 1000,
          backgroundColor: '#0068ff',
          width: 50,
          height: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#0053cc',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
          '& svg': {
            color: '#fff',
          },
        }}
      >
        <ZaloIcon />
      </IconButton>
    </Stack>
  )
}
