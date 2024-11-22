import { Box, Link as MuiLink } from '@mui/material'
import Link from 'next/link'

export interface ViewAllLinkProps {}

export default function ViewAllLink(props: ViewAllLinkProps) {
  return (
    <Box>
      <Link passHref href="/blog">
        <MuiLink
          sx={{
            display: { xs: 'none', md: 'inline' },
          }}
        >
          View all
        </MuiLink>
      </Link>
    </Box>
  )
}
