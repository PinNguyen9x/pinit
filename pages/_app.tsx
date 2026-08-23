// Import thẳng './empty', không qua barrel '@/components/layouts': barrel
// re-export cả './admin', mà AdminLayout dùng useAuth + Auth — đủ để kéo
// axios trở lại chunk dùng chung dù _app không hề đụng tới nó.
import { EmptyLayout } from '@/components/layouts/empty'
import { ThemeColorModeContext } from '@/context/theme-mode'
import { createEmotionCache } from '@/utils'
import { getTheme } from '@/utils/theme'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SWRConfig } from 'swr'
import { AppPropsWithLayout } from '../models'
import '../styles/globals.css'
import '../styles/prism.css'

/**
 * Đúng một trang cần đăng nhập (`works/[workId]`). Import tĩnh `Auth` ở đây kéo
 * theo use-auth → auth-api → axios vào chunk `_app` mà 22/22 route đều tải:
 * riêng axios cùng buffer/base64-js và qs là ~89 kB chưa nén, chỉ để phục vụ
 * một trang. Tải động, và chỉ bọc khi trang thật sự khai báo requireLogin.
 */
const Auth = dynamic(() => import('@/components/common/auth').then((m) => m.Auth))

/**
 * Chỉ `use-auth` (key '/profile') và demo StudentDetail dựa vào fetcher chung —
 * mọi hook còn lại tự truyền fetcher qua api-client. Dùng fetch của trình duyệt
 * để axios không phải nằm trong bundle dùng chung; interceptor của axiosClient
 * chỉ bóc `response.data` và ném `error.response.data`, tái hiện lại ở đây.
 */
async function fetcher(url: string) {
  const response = await fetch(`/api${url}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw data ?? new Error(response.statusText)
  return data
}

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

  // Sơ đồ mermaid được dựng sẵn thành SVG lúc build và tô màu bằng biến CSS,
  // nên chúng cần biết theme qua DOM chứ không qua React. Gắn lên <html> để
  // bảng --diagram-* trong globals.css đổi theo, không phải vẽ lại sơ đồ.
  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

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
          <SWRConfig value={{ fetcher, shouldRetryOnError: false }}>
            <Layout>
              {Component.requireLogin ? (
                <Auth requireLogin>
                  <Component {...pageProps} />
                </Auth>
              ) : (
                // Giữ nguyên thẻ bọc mà Auth vẫn render, để DOM không đổi.
                <div>
                  <Component {...pageProps} />
                </div>
              )}
            </Layout>
          </SWRConfig>
        </ThemeProvider>
      </ThemeColorModeContext.Provider>
    </CacheProvider>
  )
}

export default MyApp
