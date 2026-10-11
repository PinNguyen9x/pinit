import { Box } from '@mui/material'
import Image from 'next/image'

interface LogoProps {
  size?: number
}

/**
 * Dấu nhận diện — avatar anime trong vòng tròn viền mảnh. Trước đây có vòng
 * gradient quay và hai ngôi sao lấp lánh vô hạn; đã bỏ vì logo nằm trên MỌI
 * trang, chuyển động liên tục ở đó kéo mắt khỏi nội dung.
 */
export function Logo({ size = 36 }: LogoProps) {
  return (
    <Box
      role="img"
      aria-label="Pin Nguyen"
      sx={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid var(--color-line)',
        bgcolor: 'var(--color-surface)',
      }}
    >
      <Image
        src="/images/goku-ui.png"
        alt=""
        width={size * 2}
        height={size * 2}
        style={{
          objectFit: 'cover',
          objectPosition: 'center 22%',
          width: '100%',
          height: '100%',
          transform: 'scale(1.4)',
          transformOrigin: 'center 30%',
        }}
        priority
      />
    </Box>
  )
}
