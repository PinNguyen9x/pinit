import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material'
import Link from 'next/link'

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <MuiBreadcrumbs sx={{ mb: 2, fontSize: '0.875rem' }}>
      {items.map((item) =>
        item.href ? (
          <MuiLink
            key={item.label}
            component={Link}
            href={item.href}
            color="inherit"
            underline="hover"
          >
            {item.label}
          </MuiLink>
        ) : (
          <Typography key={item.label} color="text.primary" fontSize="inherit">
            {item.label}
          </Typography>
        ),
      )}
    </MuiBreadcrumbs>
  )
}
