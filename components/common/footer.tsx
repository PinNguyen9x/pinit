import { useAuth } from '@/hooks/use-auth'
import { useCvDownload } from '@/hooks/use-cv-download'
import { getErrorMessage } from '@/utils'
import { pageContainerSx } from '@/utils/theme'
import { Logo } from './logo'
import { NAV_ITEMS } from './nav-items'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { Box, Container, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'

// Footer nằm trên MỌI trang của MainLayout. Import thẳng hai dialog thì
// react-hook-form + yup + LoginForm vào bundle mọi trang (~95 kB first-load JS,
// đo bằng next build) dù gần như không ai bấm CV. Nạp động + chỉ render khi mở
// để phần đó chỉ tải lúc người dùng bấm. Import thẳng file, không qua barrel.
const LoginDialog = dynamic(
  () => import('@/components/auth/login-dialog').then((mod) => mod.LoginDialog),
  { ssr: false },
)
const CvViewerDialog = dynamic(
  () => import('@/components/cv/cv-viewer-dialog').then((mod) => mod.CvViewerDialog),
  { ssr: false },
)

const EMAIL = 'nguyenthanhpin95@gmail.com'

// Social link chỉ đặt ở đây — hero cũ từng có một bản, URL hardcode hai nơi nên dễ lệch.
const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/PinNguyen9x', Icon: GitHubIcon },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/pin-nguyen-69123b16a/', Icon: LinkedInIcon },
  { label: 'Email', url: `mailto:${EMAIL}`, Icon: EmailOutlinedIcon },
]

const focusRing = {
  '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '2px' },
}

const linkSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  fontSize: '0.9375rem',
  color: 'text.secondary',
  borderRadius: '4px',
  transition: 'color 0.15s',
  '&:hover': { color: 'text.primary' },
  ...focusRing,
}

// Hai nút CV: viền mảnh dạng viên thuốc — đủ rõ là nút bấm (mở dialog) chứ
// không phải link sang trang khác, mà không thêm mảng màu nào.
const pillSx = {
  px: 1.75,
  py: 0.75,
  fontSize: '0.875rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  color: 'text.primary',
  bgcolor: 'transparent',
  border: '1px solid var(--color-line)',
  borderRadius: '999px',
  cursor: 'pointer',
  transition: 'border-color 0.15s',
  '&:hover': { borderColor: 'var(--color-ink-muted)' },
  '&:disabled': { opacity: 0.6, cursor: 'progress' },
  ...focusRing,
}

const columnTitleSx = { fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1.5 }
const listSx = { listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }

export function Footer() {
  const { isLoggedIn } = useAuth()
  const { download, isDownloading } = useCvDownload()
  const [loginOpen, setLoginOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  // Việc cần làm tiếp sau khi đăng nhập thành công từ một link CV.
  const [pendingAction, setPendingAction] = useState<'download' | 'view' | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  // Clipboard API có thể không có (http, trình duyệt cũ) hoặc bị từ chối quyền —
  // khi đó báo rõ để người dùng tự chép, không im lặng như đã chép được.
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

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
      sx={{
        mt: { xs: 8, md: 12 },
        // Lớp nổi (surface) như khối bài mới: footer thành một dải riêng, có
        // chiều sâu bằng hai lớp nền chứ không bằng đường kẻ hay glow.
        bgcolor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-line)',
      }}
    >
      <Container sx={{ ...pageContainerSx, pt: { xs: 5, md: 7 }, pb: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'grid',
            // Mobile: giới thiệu chiếm hết hàng đầu, hai cột link nằm cạnh nhau
            // để footer không thành một cột dài năm khúc.
            gridTemplateColumns: { xs: '1fr 1fr', md: 'minmax(0, 1.6fr) 1fr 1fr' },
            columnGap: { xs: 3, md: 6 },
            rowGap: 4,
          }}
        >
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <Logo size={40} />
              <Typography sx={{ fontWeight: 600, fontSize: '1.0625rem' }}>Pin Nguyen</Typography>
            </Box>
            <Typography
              sx={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'text.secondary', maxWidth: '40ch', mb: 1.5 }}
            >
              Có câu hỏi về bài viết hay muốn trao đổi? Cứ nhắn mình.
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={copyEmail}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                maxWidth: '100%',
                mb: 1.5,
                py: 0.5,
                pl: 1.75,
                pr: 0.5,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                color: 'text.primary',
                bgcolor: 'var(--color-bg)',
                border: '1px solid var(--color-line)',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                '&:hover': { borderColor: 'var(--color-ink-muted)' },
                ...focusRing,
              }}
            >
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {EMAIL}
              </Box>
              {/* aria-live: trình đọc màn hình đọc "Đã chép" sau khi bấm. */}
              <Box
                component="span"
                aria-live="polite"
                sx={{
                  flexShrink: 0,
                  px: 1.25,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  borderRadius: '999px',
                  bgcolor: copyState === 'copied' ? 'primary.main' : 'var(--color-line)',
                  color: copyState === 'copied' ? 'primary.contrastText' : 'text.secondary',
                }}
              >
                {/* Nhãn lỗi phải ngắn: dài thì đẩy email bị cắt "…", đúng lúc người dùng cần tự chép nó. */}
                {copyState === 'copied' ? 'Đã chép' : copyState === 'failed' ? 'Hãy tự chép' : 'Sao chép'}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box component="button" type="button" onClick={() => requireLogin('view')} sx={pillSx}>
                Xem CV
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => requireLogin('download')}
                disabled={isDownloading}
                sx={pillSx}
              >
                {isDownloading ? 'Đang chuẩn bị CV…' : 'Tải CV'}
              </Box>
            </Box>
          </Box>

          <Box component="nav" aria-labelledby="footer-nav-heading">
            <Typography id="footer-nav-heading" component="h2" sx={columnTitleSx}>
              Đọc
            </Typography>
            <Box component="ul" sx={listSx}>
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Box component={Link} href={item.path} sx={linkSx}>
                    {item.label}
                  </Box>
                </li>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography component="h2" sx={columnTitleSx}>
              Liên hệ
            </Typography>
            <Box component="ul" sx={listSx}>
              {socialLinks.map(({ label, url, Icon }) => (
                <li key={label}>
                  <Box
                    component="a"
                    href={url}
                    target={url.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    sx={linkSx}
                  >
                    <Icon aria-hidden sx={{ fontSize: 18 }} />
                    {label}
                  </Box>
                </li>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            pt: 3,
            borderTop: '1px solid var(--color-line)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 1,
            fontSize: '0.8125rem',
            color: 'text.secondary',
          }}
        >
          <span>© {new Date().getFullYear()} Pin Nguyen</span>
          <span>Dựng bằng Next.js, chạy bằng Docker trên một VPS.</span>
          <Box
            component="button"
            type="button"
            onClick={scrollToTop}
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'auto' },
              p: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'text.secondary',
              bgcolor: 'transparent',
              border: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'var(--color-line)',
              textUnderlineOffset: '4px',
              '&:hover': { color: 'text.primary', textDecorationColor: 'currentColor' },
              ...focusRing,
            }}
          >
            Lên đầu trang
          </Box>
        </Box>
      </Container>

      {loginOpen && (
        <LoginDialog
          open
          onClose={() => {
            setLoginOpen(false)
            setPendingAction(null)
          }}
          onSuccess={handleLoginSuccess}
          title={pendingAction === 'view' ? 'Đăng nhập để xem CV' : 'Đăng nhập để tải CV'}
          description="CV chỉ mở cho người đã đăng nhập."
        />
      )}
      {viewerOpen && <CvViewerDialog open onClose={() => setViewerOpen(false)} />}
    </Box>
  )
}
