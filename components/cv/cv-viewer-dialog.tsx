import { useCvDownload } from '@/hooks'
import { getErrorMessage } from '@/utils'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { MdDownload, MdOpenInNew } from 'react-icons/md'
import { toast } from 'react-toastify'

export interface CvViewerDialogProps {
  open: boolean
  onClose: () => void
}

// The PDF is served by the same-origin Next.js proxy, which converts the
// httpOnly access_token cookie into a Bearer header for the backend. So a
// plain <iframe src="/api/cv/view"> is enough — no JS-side auth plumbing.
const CV_SRC = '/api/cv/view'

export function CvViewerDialog({ open, onClose }: CvViewerDialogProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const { download, isDownloading } = useCvDownload()
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Reset the loading state every time the dialog reopens so the spinner
  // shows again instead of flashing the previous (cached) PDF unannounced.
  useEffect(() => {
    if (open) setIframeLoaded(false)
  }, [open])

  const handleDownload = async () => {
    try {
      await download()
      toast.success('CV downloaded')
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to download CV')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 'min(960px, 92vw)' },
          height: { xs: '100%', md: 'min(880px, 92vh)' },
          m: { xs: 0, md: 2 },
          bgcolor: isDark ? '#0d0d10' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
          borderRadius: { xs: 0, md: '16px' },
          overflow: 'hidden',
        },
      }}
      aria-labelledby="cv-viewer-title"
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          borderBottom: `1px solid ${
            isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
          }`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(220,38,38,0.10)' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${
              isDark ? 'rgba(248,113,113,0.32)' : 'rgba(220,38,38,0.28)'
            }`,
            color: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            id="cv-viewer-title"
            component="h2"
            fontWeight={700}
            fontSize="0.95rem"
            letterSpacing="-0.01em"
            color="text.primary"
            sx={{ lineHeight: 1.2 }}
          >
            CV · Nguyen Thanh Pin
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}
          >
            application/pdf · inline preview
          </Typography>
        </Box>

        <Button
          component="a"
          href={CV_SRC}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="text"
          startIcon={<MdOpenInNew size={14} />}
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.8rem',
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
          }}
        >
          New tab
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="small"
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress color="inherit" size="0.9em" />
            ) : (
              <MdDownload size={14} />
            )
          }
          sx={{
            bgcolor: isDark ? '#ffffff' : '#000000',
            color: isDark ? '#000000' : '#ffffff',
            fontWeight: 600,
            fontSize: '0.8rem',
            px: 1.75,
            '&:hover': {
              bgcolor: isDark ? '#e5e5e5' : '#333333',
            },
            '&.Mui-disabled': {
              bgcolor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              color: isDark ? '#000000' : '#ffffff',
            },
          }}
        >
          {isDownloading ? 'Preparing…' : 'Download'}
        </Button>
        <IconButton
          aria-label="Close"
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ position: 'relative', flex: 1, bgcolor: isDark ? '#08080a' : '#f3f3f5' }}>
        {!iframeLoaded && (
          <Stack
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{
              position: 'absolute',
              inset: 0,
              color: 'text.secondary',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <CircularProgress size={28} color="primary" />
            <Typography
              variant="caption"
              sx={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}
            >
              loading PDF…
            </Typography>
          </Stack>
        )}
        {open && (
          <Box
            component="iframe"
            src={CV_SRC}
            title="CV preview"
            onLoad={() => setIframeLoaded(true)}
            sx={{
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
            }}
          />
        )}
      </Box>
    </Dialog>
  )
}
