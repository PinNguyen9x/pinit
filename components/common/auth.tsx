import { useAuth } from '@/hooks/use-auth'
import { encodeUrl } from '@/utils'
import { Backdrop, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

export interface AuthProps {
  children: React.ReactNode
  requireLogin?: boolean
}

export function Auth({ children, requireLogin = false }: AuthProps) {
  const { profile, firstLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!requireLogin || !router) return
    if (!firstLoading && !profile?.username) {
      if (!requireLogin || !router.isReady) return
      const currentPath = router.asPath
      router.replace(`/login?back_to=${encodeUrl(currentPath)}`)
    }
  }, [firstLoading, profile, requireLogin, router])

  if (requireLogin && !profile?.username)
    return (
      <Backdrop sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }} open>
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  return <div>{children}</div>
}
