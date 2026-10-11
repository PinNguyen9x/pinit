import { LoginDialog } from '@/components/auth'
import { CvViewerDialog } from '@/components/cv'
import { useAuth } from '@/hooks/use-auth'
import { useCvDownload } from '@/hooks/use-cv-download'
import { getErrorMessage } from '@/utils'
import { Box, Container, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { toast } from 'react-toastify'

// Social link chỉ đặt ở đây — hero cũ từng có một bản, URL hardcode hai nơi nên dễ lệch.
const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/PinNguyen9x' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/pin-nguyen-69123b16a/' },
  { label: 'Email', url: 'mailto:nguyenthanhpin95@gmail.com' },
]

const linkSx = {
  fontSize: '0.875rem',
  color: 'text.secondary',
  textDecoration: 'underline',
  textDecorationColor: 'var(--color-line)',
  textUnderlineOffset: '4px',
  transition: 'color 0.15s, text-decoration-color 0.15s',
  '&:hover': { color: 'text.primary', textDecorationColor: 'currentColor' },
  '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
  '&:disabled': { opacity: 0.6, cursor: 'progress' },
}

const buttonLinkSx = { ...linkSx, p: 0, border: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }

export function Footer() {
  const { isLoggedIn } = useAuth()
  const { download, isDownloading } = useCvDownload()
  const [loginOpen, setLoginOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  // Việc cần làm tiếp sau khi đăng nhập thành công từ một link CV.
  const [pendingAction, setPendingAction] = useState<'download' | 'view' | null>(null)

  const triggerDownload = async () => {
    try {
      await download()
      toast.success('Đã tải CV')
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Không tải được CV, thử lại sau')
    }
  }

  const requireLogin = (action: 'download' | 'view') => {
    if (isLoggedIn) {
      if (action === 'view') setViewerOpen(true)
      else triggerDownload()
      return
    }
    setPendingAction(action)
    setLoginOpen(true)
  }

  const handleLoginSuccess = () => {
    if (pendingAction === 'view') setViewerOpen(true)
    else if (pendingAction === 'download') triggerDownload()
    setPendingAction(null)
  }

  return (
    <Box
      component="footer"
      sx={{ mt: { xs: 8, md: 12 }, py: { xs: 4, md: 5 }, borderTop: '1px solid var(--color-line)' }}
    >
      <Container>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'baseline' }}
          spacing={{ xs: 2, sm: 4 }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            © {new Date().getFullYear()} Pin Nguyen
          </Typography>

          <Stack direction="row" flexWrap="wrap" columnGap={2.5} rowGap={1} component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {socialLinks.map(({ label, url }) => (
              <li key={label}>
                <Box
                  component="a"
                  href={url}
                  target={url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  sx={linkSx}
                >
                  {label}
                </Box>
              </li>
            ))}
            <li>
              <Box component="button" type="button" onClick={() => requireLogin('view')} sx={buttonLinkSx}>
                Xem CV
              </Box>
            </li>
            <li>
              <Box
                component="button"
                type="button"
                onClick={() => requireLogin('download')}
                disabled={isDownloading}
                sx={buttonLinkSx}
              >
                {isDownloading ? 'Đang chuẩn bị CV…' : 'Tải CV'}
              </Box>
            </li>
          </Stack>
        </Stack>
      </Container>

      <LoginDialog
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false)
          setPendingAction(null)
        }}
        onSuccess={handleLoginSuccess}
        title={pendingAction === 'view' ? 'Đăng nhập để xem CV' : 'Đăng nhập để tải CV'}
        description="CV chỉ mở cho người đã đăng nhập."
      />
      <CvViewerDialog open={viewerOpen} onClose={() => setViewerOpen(false)} />
    </Box>
  )
}
