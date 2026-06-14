import { Work } from '@/models'
import { Stack } from '@mui/material'
import { Fragment } from 'react'
import { NoDataFound } from '../common'
import { WorkItem } from './work-item'
import { WorkSkeleton } from './work-skeleton'

export interface WorkListProps {
  workList: Work[]
  isLoading?: boolean
}

export function WorkList({ workList, isLoading }: WorkListProps) {
  if (isLoading)
    return (
      <Stack spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Fragment key={index}>
            <WorkSkeleton />
          </Fragment>
        ))}
      </Stack>
    )
  if (workList.length === 0) return <NoDataFound />
  return (
    <Stack spacing={2}>
      {workList.map((work) => (
        <WorkItem key={work.id} work={work} />
      ))}
    </Stack>
  )
}
