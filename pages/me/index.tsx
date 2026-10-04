import { OWNER_NAV, OwnerLayout } from '@/components/layouts/owner'
import { PracticeHistory } from '@/components/me/practice-history'
import { requireOwner } from '@/utils/owner-auth'
import type { PracticeStats } from '@/utils/practice'
import { readPracticeStats } from '@/utils/practice'
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface DashboardProps {
  byTopic: PracticeStats['byTopic']
}

export default function OwnerDashboardPage({ byTopic }: DashboardProps) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Dashboard
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={5}>
        {OWNER_NAV.map((item) => (
          <Card key={item.href} variant="outlined">
            <CardActionArea component={Link} href={item.href}>
              <CardContent>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.href}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      <Typography component="h2" variant="h6" mb={2}>
        Điểm practice trung bình
      </Typography>
      <PracticeHistory byTopic={byTopic} />
    </>
  )
}

OwnerDashboardPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  // Log hỏng/không đọc được không đáng làm sập dashboard — trang practice mới báo lỗi chi tiết.
  const byTopic = await readPracticeStats()
    .then((s) => s.byTopic)
    .catch(() => [])
  return { props: { byTopic } }
}
