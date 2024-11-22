import axiosClient from '@/api/axios-client'
import { EmptyLayout } from '@/components/layouts'
import { createEmotionCache, theme } from '@/utils'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SWRConfig } from 'swr'
import { AppPropsWithLayout } from '../models'
import '../styles/globals.css'
import '../styles/prism.css'
import { Auth } from '@/components/common'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const Layout = Component.Layout ?? EmptyLayout

  return (
    <CacheProvider value={clientSideEmotionCache}>
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
          theme="colored"
        />
        <SWRConfig value={{ fetcher: (url) => axiosClient.get(url), shouldRetryOnError: false }}>
          <Layout>
            <Auth requireLogin={Component.requireLogin ?? false}>
              <Component {...pageProps} />
            </Auth>
          </Layout>
        </SWRConfig>
      </ThemeProvider>
    </CacheProvider>
  )
}
export default MyApp
