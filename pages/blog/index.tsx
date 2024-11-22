import { MainLayout } from '@/components/layouts'
import { PostItem } from '@/components/post'
import { Box, Container, Divider } from '@mui/material'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import Link from 'next/link'
import { getPostList } from '../../utils/posts'

export interface BlogPageProps {
  posts: any[]
}

export default function BlogPage({ posts }: BlogPageProps) {
  return (
    <Box>
      <Container>
        <h1>Blogs</h1>
        <Box component="ul" sx={{ p: 0, listStyle: 'none' }}>
          {posts.map((x) => (
            <li key={x.id}>
              <Link href={`/blog/${x.slug}`}>
                <a>
                  <PostItem post={x} />
                </a>
                <Divider sx={{ my: 3 }} />
              </Link>
            </li>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
BlogPage.Layout = MainLayout

export const getStaticProps: GetStaticProps<BlogPageProps> = async (
  context: GetStaticPropsContext,
) => {
  // server-side code
  // build -times
  // const response = await fetch('https://js-post-api.herokuapp.com/api/posts?_page=1')
  // const data = await response.json()
  // convert mardown file into list of javascript object
  const postList = await getPostList()
  return {
    props: {
      posts: postList,
    },
  }
}
