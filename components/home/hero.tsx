import avatar from '@/images/avatar.png'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import Image from 'next/image'

export function HeroSection() {
  return (
    <Box component={'section'} pt={{ xs: 4, md: 7 }} pb={{ xs: 7, md: 9 }}>
      <Container>
        <Stack
          spacing={8}
          direction={{ xs: 'column-reverse', md: 'row' }}
          alignItems={{ xs: 'center', md: 'flex-start' }}
          textAlign={{ xs: 'center', md: 'left' }}
        >
          <Box>
            <Typography component="h1" variant="h3" fontWeight={'bold'} mb={{ xs: 3.5, md: 5 }}>
              Hi, I am Pin Nguyen,
              <br />
              Software Developer
            </Typography>
            <Typography mb={5}>
              A passionate Software Developer with a strong background in creating efficient,
              scalable, and user-friendly applications. I specialize in [mention your expertise,
              e.g., frontend development with React and TypeScript] and enjoy building solutions
              that make a difference. Through this blog, I aim to share my journey, insights into
              software development, and tips that I’ve picked up along the way. Whether you’re a
              fellow developer or just curious about tech, I hope you find something valuable here.
            </Typography>
            <Button variant="contained" size="large">
              Download Resume
            </Button>
          </Box>
          <Box
            sx={{
              minWidth: '240px',
              boxShadow: '-5px 13px',
              color: 'secondary.light',
              borderRadius: '50%',
            }}
          >
            <Image src={avatar} layout="responsive" alt="avatar" />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
