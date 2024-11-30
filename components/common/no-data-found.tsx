import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Container, keyframes } from '@mui/material'
import { styled } from '@mui/system'
import { FaSearch, FaRedo } from 'react-icons/fa'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: theme.spacing(3),
  background: 'linear-gradient(145deg, #f5f5f5 0%, #ffffff 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.3s ease',
  },
}))

const IconWrapper = styled(Box)({
  position: 'relative',
  marginBottom: '24px',
})

const SearchIcon = styled(FaSearch)({
  fontSize: '64px',
  color: '#9e9e9e',
  opacity: 0.7,
})

const StrikeThrough = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '4px',
  background: '#9e9e9e',
  top: '50%',
  left: 0,
  transform: 'rotate(-45deg)',
  opacity: 0.7,
})

const ActionButton = styled(Button)({
  marginTop: '24px',
  padding: '12px 32px',
  borderRadius: '50px',
  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
  },
})

export const NoDataFound = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Add your actual refresh logic here
    } catch (err) {
      setError('Failed to refresh. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Add any initialization logic here
  }, [])

  return (
    <StyledContainer maxWidth="sm" role="alert" aria-live="polite">
      <IconWrapper>
        <SearchIcon aria-hidden="true" />
        <StrikeThrough aria-hidden="true" />
      </IconWrapper>

      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: '#424242',
          textAlign: 'center',
        }}
      >
        No Data Found
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#757575',
          textAlign: 'center',
          maxWidth: '400px',
          mb: 3,
        }}
      >
        {` We couldn't find any data matching your criteria. Try adjusting your search or filters.`}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }} role="alert">
          {error}
        </Typography>
      )}

      <ActionButton
        variant="contained"
        startIcon={<FaRedo />}
        onClick={handleRefresh}
        disabled={isLoading}
        aria-label="Refresh data"
      >
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </ActionButton>
    </StyledContainer>
  )
}
