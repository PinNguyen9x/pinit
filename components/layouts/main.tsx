import { LayoutProps } from '@/models/common'
import { Box, Stack } from '@mui/material'
import dynamic from 'next/dynamic'
import { Footer } from '../common/footer'
const Header = dynamic(() => import('../common/header'), { ssr: false })

export function MainLayout({ children }: LayoutProps) {
  return (
    <Stack minHeight={'100vh'}>
      <Header />
      <Box flexGrow={1} component="main">
        {children}
      </Box>
      <Footer />
    </Stack>
  )
}
