import { Post } from '@/models'
import { Box, CardContent, Divider, Stack, Typography } from '@mui/material'
import { format } from 'date-fns'
import * as React from 'react'

export interface PostItemProps {
  post: Post
}

export function PostItem({ post }: PostItemProps) {
  return (
    <Box>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          {post.title}
        </Typography>
        <Stack direction="row" my={2}>
          <Typography variant="body1">
            {format(new Date(post.publishedDate), 'dd MMM yyyy')}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Typography variant="body1">{post.tagList.join(', ')}</Typography>
        </Stack>
        <Typography variant="body2">{post.description}</Typography>
      </CardContent>
    </Box>
  )
}
