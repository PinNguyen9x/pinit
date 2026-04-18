import { MainLayout } from '@/components/layouts'
import { PostItem } from '@/components/post'
import { Post } from '@/models'
import { Box, Container, Stack, Typography, useTheme } from '@mui/material'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import Link from 'next/link'
import { getPostList } from '../../utils/posts'

export interface BlogPageProps {
  posts: Post[]
}

function BlogPageHeader() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      pt={{ xs: 6, md: 10 }}
      pb={5}
      sx={{
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        mb: 5,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          letterSpacing: '0.1em',
          fontSize: '0.68rem',
          display: 'block',
          mb: 1,
        }}
      >
        Writing
      </Typography>
      <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" mb={1.5}>
        Blog
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
        Thoughts on software development, web technologies, and engineering.
      </Typography>
    </Box>
  )
}

export default function BlogPage({ posts }: BlogPageProps) {
  return (
    <Box>
      <Container maxWidth="md">
        <BlogPageHeader />
        <Stack spacing={2} pb={10}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <PostItem post={post} />
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}

BlogPage.Layout = MainLayout

export const getStaticProps: GetStaticProps<BlogPageProps> = async (
  _context: GetStaticPropsContext,
) => {
  const postList = await getPostList()
  return {
    props: {
      posts: postList,
    },
  }
}
