import { Post } from '@/models'
import { Container, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import { PostCard } from './post-card'

const ViewAllLink = dynamic(() => import('../common/view-all-link'), { ssr: false })

export function RecentPost() {
  const postList: Post[] = [
    {
      id: '1',
      slug: '',
      title: 'Practical Micro Frontends: Building Scalable UIs',
      publishedDate: '2024-06-15T03:00:00Z',
      tagList: ['Design', 'Pattern'],
      description: `This post explores how to implement micro frontends by breaking down monolithic UIs into smaller, manageable pieces. Using tools like React, Webpack, and Module Federation, you'll learn how to create scalable, maintainable front-end applications that enhance team collaboration and project flexibility.`,
    },
    {
      id: '2',
      slug: '',
      title: 'Large Language Model (LLM) & Chatbox',
      publishedDate: '2024-06-16T03:00:00Z',
      tagList: ['AI', 'Mechine Learning'],
      description:
        'This is a model that provides a general introduction to AI chatbots, large language models (LLMs), how to apply them in the workplace, essential knowledge about AI and prompts, their advantages and disadvantages, key terms related to LLMs, and tools that help enhance productivity for developers.',
    },
  ]

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
