import type { Visibility } from '@/utils/private-content-schema'
import { Chip } from '@mui/material'

// public-candidate nổi bật hơn: đó là những bài sắp ra ngoài, cần chạy denylist.
export function VisibilityChip({ visibility }: { visibility: Visibility }) {
  return visibility === 'public-candidate' ? (
    <Chip label="public-candidate" size="small" color="warning" />
  ) : (
    <Chip label="private" size="small" variant="outlined" />
  )
}
