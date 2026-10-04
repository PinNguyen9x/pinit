import { Box, Typography } from '@mui/material'

/**
 * Vòng tiến độ SVG thuần — không thêm thư viện chart. Phần nền là màu trung tính
 * (`divider`), không phải biến thể nhạt của màu chính: ở dark mode, nền xanh đậm
 * trông y như thanh đã đầy (đúng lỗi LinearProgress từng gặp ở 0/8).
 */
export function ProgressRing({
  value,
  size = 56,
  thickness = 6,
  color = 'primary.main',
  label,
}: {
  value: number // 0..100
  size?: number
  thickness?: number
  color?: string
  label?: string
}) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" width={size} height={size} sx={{ transform: 'rotate(-90deg)' }}>
        <Box
          component="circle"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          sx={{ stroke: (t) => t.palette.divider }}
        />
        <Box
          component="circle"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          sx={{
            stroke: color,
            transition: 'stroke-dashoffset 600ms ease-out',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            // 0% thì không vẽ nét: linecap tròn sẽ để lại một chấm màu.
            opacity: v === 0 ? 0 : 1,
          }}
        />
      </Box>
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
      >
        {label ?? `${Math.round(v)}%`}
      </Typography>
    </Box>
  )
}

/** Thanh ngang cùng nguyên tắc: nền trung tính, phần đã làm mới có màu. */
export function ProgressBar({ value, color = 'primary.main' }: { value: number; color?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'divider', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: `${v}%`,
          bgcolor: color,
          borderRadius: 3,
          transition: 'width 600ms ease-out',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      />
    </Box>
  )
}
