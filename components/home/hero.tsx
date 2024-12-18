import avatar from '@/images/avatar.png'
import { Box, Button, Container, Stack, styled, Typography } from '@mui/material'
import Image from 'next/image'

const HighlightedText = styled('span')(({ theme }) => ({
  // color: theme.palette.primary.main,
  fontWeight: 600,
}))

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
              I am a full-stack developer with a passion for building scalable, high-performance
              applications. With expertise in{' '}
              <HighlightedText sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                ReactJs , NextJS
              </HighlightedText>{' '}
              and{' '}
              <HighlightedText sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                TypeScript
              </HighlightedText>{' '}
              for <HighlightedText sx={{ fontWeight: 700 }}>Frontend</HighlightedText> development,
              along with{' '}
              <HighlightedText sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                NodeJS ,
              </HighlightedText>
              <HighlightedText sx={{ fontWeight: 700, fontStyle: 'italic' }}>C# </HighlightedText>
              and{' '}
              <HighlightedText sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                Python{' '}
              </HighlightedText>{' '}
              for <HighlightedText sx={{ fontWeight: 700 }}>Backend</HighlightedText> , I specialize
              in creating seamless, robust solutions that power modern web applications. Whether it
              is crafting dynamic UIs, optimizing APIs, or working with data-driven architectures, I
              thrive on pushing the boundaries of what technology can achieve. Let’s build the
              future, one line of code at a time.
            </Typography>
            <Button variant="contained" size="large">
              Download Resume
            </Button>
          </Box>
          <Box
            sx={{
              minWidth: '240px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '-5px 13px',
              color: 'secondary.light',
            }}
          >
            <Image src={avatar} alt="avatar" layout="intrinsic" />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
