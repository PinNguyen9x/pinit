import { Box, Container, Grid, Paper, Skeleton } from '@mui/material'
export const GameSkeleton = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Skeleton variant="text" height={80} width="60%" sx={{ mx: 'auto' }} />
      <Skeleton variant="text" height={40} width="40%" sx={{ mx: 'auto' }} />
    </Box>

    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box
            sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Skeleton variant="text" width={120} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </Box>

          <Grid container spacing={1} sx={{ maxWidth: 400, mx: 'auto' }}>
            {Array(9)
              .fill(null)
              .map((_, index) => (
                <Grid item xs={4} key={index}>
                  <Skeleton variant="rectangular" sx={{ paddingTop: '100%' }} />
                </Grid>
              ))}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Skeleton variant="text" height={40} />
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}

          <Skeleton variant="text" height={40} sx={{ mt: 3 }} />
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Skeleton variant="text" />
              </Box>
            ))}
        </Paper>
      </Grid>
    </Grid>
  </Container>
)
