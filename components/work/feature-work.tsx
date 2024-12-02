import { useWorkList } from '@/hooks'
import { ListParams, Work } from '@/models'
import { Box, Container, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { WorkList } from './work-list'
interface FeatureWorkProps {
  isLoading?: boolean
  workList: Work[]
}
export function FeatureWork({ workList }: FeatureWorkProps) {
  return (
    <Box component="section" pt={2} pb={4}>
      <Container>
        <Typography variant="h5" mb={4}>
          Feature Works
        </Typography>
        <WorkList workList={workList || []} isLoading={false} />
      </Container>
    </Box>
  )
}
