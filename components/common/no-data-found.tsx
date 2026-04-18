import { Box, Button, Container, Typography, useTheme } from '@mui/material'
import { useState } from 'react'

export const NoDataFound = () => {
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          py: 6,
          textAlign: 'center',
        }}
        role="alert"
        aria-live="polite"
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            fontSize: '1.5rem',
          }}
        >
          📭
        </Box>

        <Typography variant="h6" fontWeight={600} mb={1} letterSpacing="-0.01em">
          Nothing here yet
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
          maxWidth={280}
          lineHeight={1.65}
        >
          No data matching your criteria. Try adjusting your search or filters.
        </Typography>

        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={isLoading}
          size="small"
          sx={{
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.8rem',
            px: 2,
            '&:hover': {
              borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            },
          }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
    </Container>
  )
}
