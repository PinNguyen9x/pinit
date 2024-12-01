import { Box, Grid, Paper, Skeleton } from '@mui/material'
import { styled } from '@mui/system'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  margin: '2rem 0',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}))

const ArchitectureBox = styled(Box)(({ theme }) => ({
  padding: '2rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  marginBottom: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
}))

export const WorkDetailSkeleton = () => (
  <StyledPaper elevation={0}>
    <Skeleton variant="text" width="60%" height={80} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="100%" height={60} sx={{ mb: 4 }} />

    <ArchitectureBox>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={120} sx={{ borderRadius: '10px' }} />
        ))}
      </Box>
    </ArchitectureBox>

    <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item key={item}>
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: '20px' }} />
        </Grid>
      ))}
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          variant="rectangular"
          width={150}
          height={50}
          sx={{ borderRadius: '25px' }}
        />
      ))}
    </Box>
  </StyledPaper>
)
