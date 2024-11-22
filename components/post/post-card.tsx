import { Post } from '@/models'
import { Card } from '@mui/material'
import { PostItem } from '../post'

export interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  if (!post) return null
  return (
    <Card>
      <PostItem post={post} />
    </Card>
  )
}
