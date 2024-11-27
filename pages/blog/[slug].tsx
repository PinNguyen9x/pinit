import { Seo } from '@/components/common'
import { Post } from '@/models'
import { getPostList } from '@/utils/posts'
import { Container } from '@mui/material'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkToc from 'remark-toc'
import { unified } from 'unified'

export interface BlogDetailPageProps {
  post: Post
}

export default function BlogDetailPage({ post }: BlogDetailPageProps) {
  return (
    <Container>
      <Seo
        data={{
          title: `${post.title} | Pin Nguyen`,
          description: post.description,
          thumbnailUrl:
            post?.thumbnailUrl ||
            'https://images.unsplash.com/photo-1549923746-c502d488b3ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80',
          url: `${process.env.HOST_URL}/blog/${post.slug}`,
        }}
      />
      <h1>Post detail page</h1>
      <p>{post.title}</p>
      <p>{post.author?.name}</p>
      <div dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }} />
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // server-side code
  // build -times
  const postList = await getPostList()

  return {
    paths: postList.map((post: Post) => ({ params: { slug: post.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<BlogDetailPageProps> = async (
  context: GetStaticPropsContext,
) => {
  const slug = context.params?.slug
  if (!slug)
    return {
      notFound: true,
    }
  // server-side code
  // build -times
  const postList = await getPostList()
  const post = postList.find((x: Post) => x.slug === slug)
  if (!post) return { notFound: true }
  // convert from markdown to html

  // parse md to html
  const file = await unified()
    .use(remarkParse)
    .use(remarkToc, { heading: 'agenda.*' })
    .use(require('remark-prism'), { theme: 'material-palenight' })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeDocument, { title: 'Blog details page' })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(post.mdContent || '')
  post.htmlContent = file.toString()
  return {
    props: {
      post,
    },
  }
}
