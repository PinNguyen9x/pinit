import { Post } from '@/models'
import { Box } from '@mui/material'
import { Fragment } from 'react'
import { NoDataFound } from '../common'
import { PostCard } from './post-card'
import { PostItemSkeleton } from './post-skeleton'

export interface PostListProps {
  postList: Post[]
  isLoading?: boolean
}

export function PostList({ postList, isLoading }: PostListProps) {
  if (isLoading)
    return (
      <>
        {Array.from({ length: 2 }).map((_, index) => (
          <Box key={index}>
            <PostItemSkeleton />
          </Box>
        ))}
      </>
    )
  if (postList.length === 0) return <NoDataFound />
  return (
    <>
      {postList.map((post) => (
        <Box key={post.id}>
          <PostCard post={post} />
        </Box>
      ))}
    </>
  )
}
