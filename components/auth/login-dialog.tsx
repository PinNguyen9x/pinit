import { useAuth } from '@/hooks'
import { LoginPayload } from '@/models'
import { getErrorMessage } from '@/utils'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { LoginForm } from './login-form'

export interface LoginDialogProps {
  open: boolean
  onClose: () => void
  // Called once login succeeds. Use this to resume the action the user was
  // trying to perform when they hit the auth wall (e.g. download CV).
  onSuccess?: () => void
  title?: string
  description?: string
}

export function LoginDialog({
  open,
  onClose,
  onSuccess,
  title = 'Sign in to continue',
  description = 'You need to be signed in to perform this action.',
}: LoginDialogProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { login } = useAuth({ revalidateOnMount: false })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: LoginPayload) => {
    setSubmitting(true)
    try {
      await login(data)
      toast.success('Welcome back!')
      onClose()
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#0d0d10' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
          borderRadius: { xs: 0, sm: '16px' },
          backgroundImage: isDark
            ? 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(220,38,38,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 70%)',
        },
      }}
      aria-labelledby="login-dialog-title"
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, pb: 0 }}>
        <IconButton
          aria-label="Close"
          size="small"
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 1, px: { xs: 3, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
        <Stack spacing={1} mb={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDark ? 'rgba(220,38,38,0.10)' : 'rgba(220,38,38,0.08)',
              border: `1px solid ${isDark ? 'rgba(248,113,113,0.32)' : 'rgba(220,38,38,0.28)'}`,
              color: 'primary.main',
              mb: 0.5,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Box>
          <Typography
            id="login-dialog-title"
            component="h2"
            fontWeight={700}
            fontSize="1.25rem"
            letterSpacing="-0.02em"
            color="text.primary"
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
            {description}
          </Typography>
        </Stack>
        <LoginForm onSubmit={handleSubmit} />
        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          color="text.secondary"
          mt={2.5}
        >
          Username ≥ 4 characters · password ≥ 6 characters.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
