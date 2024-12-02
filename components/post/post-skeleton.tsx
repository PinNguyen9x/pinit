import { Box, Card, CardContent, Divider, Skeleton, Stack, Typography } from '@mui/material'

export function PostItemSkeleton() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          <Skeleton width="80%" />
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2} my={2}>
          <Skeleton variant="text" width="40%" />
          <Divider orientation="vertical" flexItem />
          <Skeleton variant="text" width="40%" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <Skeleton width="100%" />
          <Skeleton width="90%" />
          <Skeleton width="85%" />
        </Typography>
      </CardContent>
    </Card>
  )
}
