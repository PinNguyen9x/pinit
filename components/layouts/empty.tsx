import { LayoutProps } from '@/models/common'
import { ChildProcess } from 'child_process'
import * as React from 'react'

export function EmptyLayout({ children }: LayoutProps) {
  return <>{children}</>
}
