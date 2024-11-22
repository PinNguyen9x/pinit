import { EmotionCache } from '@emotion/react'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import { ReactElement } from 'react'

export interface LayoutProps {
  children: React.ReactNode
}
export type NextPageWithLayout = NextPage & {
  Layout?: (page: LayoutProps) => ReactElement
  requireLogin?: boolean
}

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  emotionCache?: EmotionCache
}
