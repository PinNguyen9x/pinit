import { safeFetchJson } from '@/utils'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import * as React from 'react'

export interface PostDetailPageProps {
  post: { title?: string; author?: string }
}

export default function PostDetailPage({ post }: PostDetailPageProps) {
  return (
    <div>
      <h1>Post detail page</h1>
      <p>{post?.title}</p>
      <p>{post?.author}</p>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await safeFetchJson<{ data: { id: string }[] }>(
    'https://js-post-api.herokuapp.com/api/posts?_page=1',
  )

  return {
    paths: data?.data?.map((x) => ({ params: { postId: x.id } })) ?? [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<PostDetailPageProps> = async (
  context: GetStaticPropsContext,
) => {
  const postId = context.params?.postId
  const data = await safeFetchJson<{ title?: string; author?: string }>(
    `https://js-post-api.herokuapp.com/api/posts/${postId}`,
  )
  if (!data) {
    return { notFound: true, revalidate: 60 }
  }
  return {
    props: {
      post: data,
    },
    revalidate: 300,
  }
}
