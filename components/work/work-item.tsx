import { Work } from '@/models'
import { Box, Chip, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

export interface WorkItemProps {
  work: Work
}

export function WorkItem({ work }: WorkItemProps) {
  return (
    <Link href={`/works/${work.id}/details`} passHref>
      <Stack direction={{ sx: 'column', sm: 'row' }} spacing={2} sx={{ cursor: 'pointer' }}>
        <Box flexShrink={0} sx={{ width: { xs: '100%', sm: '246px' } }}>
          <Image
            src={work.thumbnailUrl}
            alt="thumbnail url"
            width={246}
            height={180}
            layout="responsive"
          />
        </Box>
        <Box>
          <Typography variant="h5">{work.title}</Typography>
          <Stack direction="row" my={2}>
            <Chip
              label={new Date(Number(work.createdAt)).getFullYear()}
              color="secondary"
              size="small"
            />
            <Typography ml={2} color="GrayText">
              {work.tagList.join(', ')}
            </Typography>
          </Stack>
          <Typography>{work.shortDescription}</Typography>
        </Box>
      </Stack>
    </Link>
  )
}
