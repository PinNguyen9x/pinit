import { Post } from '@/models'
import { Container, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import { PostCard } from './post-card'

const ViewAllLink = dynamic(() => import('../common/view-all-link'), { ssr: false })
interface RecentPostProps {
  postList: Post[]
}
export function RecentPost({ postList }: RecentPostProps) {
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

          <ViewAllLink />
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
          {postList.map((post) => (
            <Box key={post.id}>
              <PostCard post={post} />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
