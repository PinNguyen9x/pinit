import { useWorkList } from '@/hooks'
import { ListParams } from '@/models'
import { Box, Container, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { WorkList } from './work-list'
export function FeatureWork() {
  const router = useRouter()

  const filter: Partial<ListParams> = {
    _page: 1,
    _limit: 3,
    ...router.query,
  }
  const { data, isLoading } = useWorkList({
    params: filter,
    enabled: !!router.isReady,
  })
  return (
    <Box component="section" pt={2} pb={4}>
      <Container>
        <Typography variant="h5" mb={4}>
          Feature Works
        </Typography>
        <WorkList workList={data.data || []} isLoading={isLoading} />
      </Container>
    </Box>
  )
}
