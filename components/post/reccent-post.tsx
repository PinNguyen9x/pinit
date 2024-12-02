import { ListParams, Post } from '@/models'
import { Container, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { PostCard } from './post-card'
import { usePostList } from '@/hooks/use-post-list'
import { Fragment } from 'react'
import { NoDataFound } from '../common'
import { PostList } from './post-list'

const ViewAllButton = dynamic(
  () => import('../common/view-all-button').then((mod) => mod.ViewAllButton),
  { ssr: false },
)
interface RecentPostProps {}
export function RecentPost() {
  const router = useRouter()

  const filter: Partial<ListParams> = {
    _page: 1,
    _limit: 2,
    ...router.query,
  }
  const { data, isLoading } = usePostList({
    params: filter,
    enabled: !!router.isReady,
  })
  const postList: Post[] = data?.data || []

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
