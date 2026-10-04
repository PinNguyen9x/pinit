import { safeNextPath } from '@/utils/owner-auth'
import { Alert, Box, Button, Container, Stack, TextField, Typography } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

const MESSAGES: Record<number, string> = {
  401: 'Sai passphrase.',
  429: 'Sai quá nhiều lần — thử lại sau ít phút.',
}

export default function OwnerLoginPage() {
  const router = useRouter()
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/me/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase, next: safeNextPath(router.query.next) }),
    }).catch(() => null)
    setSubmitting(false)

    if (res?.ok) {
      // Kiểm cả hai đầu: trang lọc query trước khi gửi, server lọc lại trước khi trả.
      const data = await res.json().catch(() => null)
      router.replace(safeNextPath(data?.next))
      return
    }
    setPassphrase('')
    setError((res && MESSAGES[res.status]) ?? 'Không đăng nhập được.')
  }

  return (
    <Container maxWidth="sm">
      <Head>
        <title>Sign in</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: { xs: 10, md: 16 } }}>
        <Stack spacing={2} sx={{ maxWidth: 360, mx: 'auto' }}>
          <Typography component="h1" variant="h5">
            Owner
          </Typography>
          <TextField
            type="password"
            label="Passphrase"
            autoComplete="current-password"
            autoFocus
            fullWidth
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={submitting || !passphrase}>
            Sign in
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}
