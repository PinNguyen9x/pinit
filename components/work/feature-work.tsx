import { Work } from '@/models'
import { Box, Container, Typography } from '@mui/material'
import { WorkList } from './work-list'
interface FeatureWorkProps {
  workList: Work[]
}
export function FeatureWork({ workList }: FeatureWorkProps) {
  return (
    <Box component="section" pt={2} pb={4}>
      <Container>
        <Typography variant="h5" mb={4}>
          Feature Works
        </Typography>
        <WorkList workList={workList} />
      </Container>
    </Box>
  )
}
