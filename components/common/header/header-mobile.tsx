import React from 'react'
import { Box } from '@mui/material'
export interface HedarMobileProps {}
export function HeaderMobile(props: HedarMobileProps) {
  return <Box display={{ xs: 'block', md: 'none' }}>Header Mobile</Box>
}
