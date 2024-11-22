import { LoginForm } from '@/components/auth'
import { LoginPayload } from '@/models'
import { decodeUrl, getErrorMessage } from '@/utils'
import { Box, Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks'

export interface LoginPageProps {}

export default function LoginPage(props: LoginPageProps) {
  const router = useRouter()
  const { login } = useAuth({ revalidateOnMount: false })
  async function handleLoginClick(data: LoginPayload) {
    try {
      await login(data)
      const { back_to } = router.query
      const backTo = back_to ? decodeUrl(back_to as string) : '/'
      router.push(backTo)
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    }
  }

  return (
    <Box>
      <Paper elevation={4} sx={{ mx: 'auto', mt: 8, p: 4, textAlign: 'center', maxWidth: '480px' }}>
        <Typography component="h1" variant="h5" mb={3}>
          Login
        </Typography>
        <LoginForm onSubmit={handleLoginClick} />
      </Paper>
    </Box>
  )
}
