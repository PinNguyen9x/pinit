import axiosClient from '@/api/axios-client'
import { Auth } from '@/components/common'
import { EmptyLayout } from '@/components/layouts'
import { ThemeColorModeContext } from '@/context/theme-mode'
import { createEmotionCache } from '@/utils'
import { getTheme } from '@/utils/theme'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SWRConfig } from 'swr'
import { AppPropsWithLayout } from '../models'
import '../styles/globals.css'
import '../styles/prism.css'

const clientSideEmotionCache = createEmotionCache()

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: AppPropsWithLayout & { emotionCache?: any }) {
  const Layout = Component.Layout ?? EmptyLayout
  const [mode, setMode] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
    if (saved === 'light' || saved === 'dark') setMode(saved)
  }, [])

  const colorModeContext = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark'
          localStorage.setItem('theme-mode', next)
          return next
        })
      },
      mode,
    }),
    [mode]
  )

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <CacheProvider value={emotionCache}>
      <ThemeColorModeContext.Provider value={colorModeContext}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={mode === 'dark' ? 'dark' : 'light'}
          />
          <SWRConfig
            value={{ fetcher: (url) => axiosClient.get(url), shouldRetryOnError: false }}
          >
            <Layout>
              <Auth requireLogin={Component.requireLogin ?? false}>
                <Component {...pageProps} />
              </Auth>
            </Layout>
          </SWRConfig>
        </ThemeProvider>
      </ThemeColorModeContext.Provider>
    </CacheProvider>
  )
}

export default MyApp
