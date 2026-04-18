import { Box, keyframes } from '@mui/material'
import Image from 'next/image'

const twinkle = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(0.85) rotate(0deg); }
  50%      { opacity: 1;    transform: scale(1.2)  rotate(90deg); }
`

const twinkleSlow = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.75); }
  50%      { opacity: 0.9;  transform: scale(1.05); }
`

const spinRing = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

interface LogoProps {
  size?: number
}

/**
 * Anime-style brand mark — avatar in a rotating fire-gradient ring with
 * twinkling sparkles, matching the blog author icon.
 */
export function Logo({ size = 36 }: LogoProps) {
  const ringWidth = 2
  const innerSize = size - ringWidth * 2

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        cursor: 'pointer',
        transition: 'transform 0.25s ease',
        '&:hover': { transform: 'scale(1.06) rotate(-2deg)' },
        '&:hover .logo-glow': { opacity: 1 },
      }}
      aria-label="pin nguyen cute"
      role="img"
    >
      {/* Soft glow aura on hover */}
      <Box
        className="logo-glow"
        sx={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(220,38,38,0.55) 0%, rgba(249,115,22,0.22) 55%, transparent 75%)',
          filter: 'blur(10px)',
          opacity: 0.35,
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Rotating fire-gradient ring */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #dc2626, #f97316, #fbbf24, #34d399, #dc2626)',
          animation: `${spinRing} 10s linear infinite`,
          zIndex: 1,
        }}
      />

      {/* Avatar disc */}
      <Box
        sx={{
          position: 'absolute',
          top: ringWidth,
          left: ringWidth,
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          backgroundColor: '#000',
        }}
      >
        <Image
          src="/images/goku-ui.png"
          alt="Pin Nguyen"
          width={innerSize * 2}
          height={innerSize * 2}
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

      {/* Twinkling sparkle — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: size * 0.32,
          height: size * 0.32,
          animation: `${twinkle} 2.4s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <svg viewBox="0 0 20 20" fill="#ffd875">
          <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" />
        </svg>
      </Box>

      {/* Tiny sparkle — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          width: size * 0.2,
          height: size * 0.2,
          animation: `${twinkleSlow} 3.2s ease-in-out infinite 1s`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <svg viewBox="0 0 20 20" fill="#34d399">
          <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" />
        </svg>
      </Box>
    </Box>
  )
}
