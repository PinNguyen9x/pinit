import { Work } from '@/models'
import { Box, Divider } from '@mui/material'
import { Fragment } from 'react'
import { WorkItem } from './work-item'
import { WorkSkeleton } from './work-skeleton'

export interface WorkListProps {
  workList: Work[]
  isLoading?: boolean
}

export function WorkList({ workList, isLoading }: WorkListProps) {
  if (isLoading)
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, index) => (
          <Fragment key={index}>
            <WorkSkeleton />
            <Divider sx={{ my: 3 }} />
          </Fragment>
        ))}
      </Box>
    )
  if (workList.length === 0) return <p>No data</p>
  return (
    <Box>
      {workList.map((work) => (
        <Fragment key={work.id}>
          <WorkItem work={work} />
          <Divider sx={{ my: 3 }} />
        </Fragment>
      ))}
    </Box>
  )
}
