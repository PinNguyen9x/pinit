import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'

export interface PostDetailPageProps {
  post: any
}

export default function PostDetailPage({ post }: PostDetailPageProps) {
  const router = useRouter()
  return (
    <div>
      <h1>Post detail page</h1>
      <p>{post.title}</p>
      <p>{post.author}</p>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('\nGET STATIC PATHS')

  // server-side code
  // build -times
  const response = await fetch('https://js-post-api.herokuapp.com/api/posts?_page=1')
  const data = await response.json()

  return {
    paths: data.data.map((x: any) => ({ params: { postId: x.id } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<PostDetailPageProps> = async (
  context: GetStaticPropsContext,
) => {
  const postId = context.params?.postId
  console.log('\nGET STATIC PROPS', context.params?.postId)
  // server-side code
  // build -times
  const response = await fetch(`https://js-post-api.herokuapp.com/api/posts/${postId}`)
  const data = await response.json()
  console.log('data', data)
  return {
    props: {
      post: data,
    },
  }
}
