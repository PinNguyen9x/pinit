import { Chip, Stack } from '@mui/material'

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {tags.map((t) => (
        <Chip key={t} label={t} size="small" variant="outlined" />
      ))}
    </Stack>
  )
}
