import { Post } from '@/models'
import { PostItem } from '../post'

export interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  if (!post) return null
  return <PostItem post={post} />
}
