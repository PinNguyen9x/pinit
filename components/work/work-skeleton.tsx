import { Box, Skeleton, Stack, Typography } from '@mui/material'

export function WorkSkeleton() {
  return (
    <Stack direction={{ sx: 'column', sm: 'row' }} spacing={2}>
      <Box flexShrink={0} sx={{ width: { xs: '100%', sm: '246px' } }}>
        <Skeleton variant="rectangular" width={246} height={180} />
      </Box>
      <Box flexGrow={1}>
        <Typography variant="h5">
          <Skeleton />
        </Typography>
        <Stack alignItems="center" direction="row" my={2}>
          <Skeleton variant="rectangular" width={50} height={24} />
          <Typography ml={2} color="GrayText" flexGrow={1}>
            <Skeleton />
          </Typography>
        </Stack>
        <Typography>
          <Skeleton />
          <Skeleton />
          <Skeleton width="40%" />
        </Typography>
      </Box>
    </Stack>
  )
}
