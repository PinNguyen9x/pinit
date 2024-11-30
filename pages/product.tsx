import { Box, Typography, Button, Link } from '@mui/material'
import Image from 'next/image'
import avatar from '@/images/avatar.png'

export default function ProductPage() {
  return (
    <Box
      sx={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Tiêu đề */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}
      >
        Giới thiệu Phần mềm
      </Typography>

      {/* Mô tả */}
      <Typography
        variant="body1"
        sx={{ fontSize: '16px', marginBottom: '20px', lineHeight: '1.6' }}
      >
        Phần mềm của chúng tôi cung cấp các tính năng tiên tiến giúp bạn quản lý công việc hiệu quả,
        tối ưu hóa quy trình và tăng cường trải nghiệm người dùng. Giao diện thân thiện và hiệu suất
        cao.
      </Typography>

      {/* Hình ảnh */}
      <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
        <Image
          src={avatar}
          alt="Phần mềm"
          width={500}
          height={300}
          style={{ borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        />
      </Box>

      {/* Link GitHub */}
      <Box sx={{ marginBottom: '10px' }}>
        <Link
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener"
          underline="hover"
          sx={{
            fontStyle: 'italic',
            color: 'blue',
            '&:hover': { textDecoration: 'underline', color: 'darkblue' },
          }}
        >
          Link Source Code (GitHub)
        </Link>
      </Box>

      {/* Link Demo */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          href="https://your-demo-link.com"
          target="_blank"
          sx={{
            textTransform: 'none',
            padding: '10px 20px',
          }}
        >
          Xem Demo
        </Button>
      </Box>
    </Box>
  )
}
