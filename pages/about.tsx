// import Header from "@/components/common/Header";
import { AdminLayout } from '@/components/layouts'
import { Box } from '@mui/material'
export interface AboutPageProps {}

export default function AboutPage(props: AboutPageProps) {
  return (
    <Box>
      <h1>About Page</h1>
    </Box>
  )
}

AboutPage.Layout = AdminLayout
