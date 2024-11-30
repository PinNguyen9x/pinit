import { Box, Button, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: '25px',
  border: 0,
  color: 'white',
  padding: '12px 24px',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  transition: 'all 0.3s ease-in-out',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  minWidth: '150px',
  '&:hover': {
    background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '10px 20px',
    minWidth: '120px',
  },
}))

export const ViewAllButton = () => {
  const loading = false
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Link passHref href="/blog">
        <StyledButton aria-label="View all items" endIcon={!loading && <FiArrowRight />}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'View All'}
        </StyledButton>
      </Link>
    </Box>
  )
}
