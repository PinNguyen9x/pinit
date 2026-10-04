import { Alert, AlertTitle, Box } from '@mui/material'

/**
 * Lỗi schema của content private. Hiện thẳng lên trang thay vì nuốt im lặng:
 * một milestone sai lane mà chỉ biến mất thì owner sẽ không bao giờ biết vì sao.
 */
export function ContentErrors({ errors }: { errors: string[] }) {
  if (!errors.length) return null
  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <AlertTitle>{errors.length} lỗi trong content — các mục này bị bỏ qua</AlertTitle>
      <Box component="ul" sx={{ m: 0, pl: 2.5, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </Box>
    </Alert>
  )
}
