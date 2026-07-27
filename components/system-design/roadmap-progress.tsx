import { Box, Stack, Typography } from '@mui/material'
import { useSystemDesignTokens } from './tokens'

export interface RoadmapProgressProps {
  completedCount: number
  total: number
  percent: number
  /** false trước khi đọc xong localStorage — tránh nháy số từ 0 sang giá trị thật. */
  hydrated: boolean
  onReset: () => void
}

export function RoadmapProgress({
  completedCount,
  total,
  percent,
  hydrated,
  onReset,
}: RoadmapProgressProps) {
  const { accent, line, chipBg } = useSystemDesignTokens()

  return (
    <Stack spacing={1} sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          {hydrated ? `Đã ôn ${completedCount}/${total} buổi — ${percent}%` : `${total} buổi`}
        </Typography>

        {hydrated && completedCount > 0 && (
          <Box
            component="button"
            type="button"
            onClick={onReset}
            sx={{
              border: 'none',
              bgcolor: 'transparent',
              color: 'text.secondary',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              p: 0,
              '&:hover': { color: accent },
            }}
          >
            Đặt lại tiến độ
          </Box>
        )}
      </Stack>

      <Box
        role="progressbar"
        aria-label="Tiến độ ôn tập System Design"
        aria-valuenow={hydrated ? percent : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: chipBg,
          border: '1px solid',
          borderColor: line,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${hydrated ? percent : 0}%`,
            height: '100%',
            bgcolor: accent,
            transition: 'width .3s',
          }}
        />
      </Box>
    </Stack>
  )
}
