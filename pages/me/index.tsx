import { OWNER_NAV, OwnerLayout } from '@/components/layouts/owner'
import { requireOwner } from '@/utils/owner-auth'
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

export default function OwnerDashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Dashboard
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
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
    </>
  )
}

OwnerDashboardPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  (await requireOwner(ctx)) ?? { props: {} }
