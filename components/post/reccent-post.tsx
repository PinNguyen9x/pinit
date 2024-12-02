import { Post } from '@/models'
import { Container, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import { NoDataFound } from '../common'
import { PostList } from './post-list'

const ViewAllButton = dynamic(
  () => import('../common/view-all-button').then((mod) => mod.ViewAllButton),
  { ssr: false },
)
interface RecentPostProps {
  isLoading?: boolean
  postList: Post[]
}
export function RecentPost({ isLoading = false, postList }: RecentPostProps) {
  if (!isLoading && postList.length === 0) return <NoDataFound />

  return (
    <Box component="section" bgcolor="secondary.light" pt={2} pb={4}>
      <Container>
        <Stack
          direction="row"
          mb={2}
          justifyContent={{ xs: 'center', md: 'space-between' }}
          alignItems="center"
        >
          <Typography variant="h5">Recent Posts</Typography>

          <ViewAllButton />
        </Stack>

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={3}
          sx={{
            '& > div': {
              width: {
                xs: '100%',
                md: '50%',
              },
            },
          }}
        >
          <PostList postList={postList} isLoading={isLoading} />
        </Stack>
      </Container>
    </Box>
  )
}
