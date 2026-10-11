import avatar from '@/images/avatar.png'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'

// Một câu: tôi là ai, trang này có gì. Avatar thu nhỏ để màn hình đầu ở 375px
// dành cho bài viết — trước đây avatar 180px chiếm gần nửa màn.
export function Intro() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, md: 2 } }}>
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 40, md: 56 },
          height: { xs: 40, md: 56 },
          mt: { xs: 0.25, md: 0 },
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid var(--color-line)',
        }}
      >
        <Image
          src={avatar}
          alt="Ảnh Pin Nguyen"
          width={56}
          height={56}
          priority
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </Box>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '1.1875rem', md: '1.6875rem' },
          fontWeight: 600,
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          maxWidth: '34ch',
          color: 'text.primary',
        }}
      >
        Mình là Pin, kỹ sư full-stack, viết về những gì học được khi làm thật với AI agent, DevOps, Kafka và frontend.
      </Typography>
    </Box>
  )
}
