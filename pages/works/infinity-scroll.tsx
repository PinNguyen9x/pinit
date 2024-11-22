import { MainLayout } from '@/components/layouts'
import { WorkFilterForm, WorkList } from '@/components/work'
import { useWorkListInfinity } from '@/hooks'
import { ListParams, ListResponse, Work, WorkFilterPayload } from '@/models'
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { useInView } from 'react-intersection-observer'

export interface InfinityScrollProps {}

export default function InfinityScroll(props: InfinityScrollProps) {
  const router = useRouter()

  const filter: Partial<ListParams> = {
    ...router.query,
  }
  const initialFilter: WorkFilterPayload = {
    search: filter.title_like || '',
    selectedTagList: filter.tagList_like?.split('|') || [],
  }
  const { data, isLoading, size, setSize, isValidating } = useWorkListInfinity({
    params: filter,
    enabled: !!router.isReady,
  })

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) setSize((x) => x + 1)
    },
  })

  const workList: Array<Work> =
    data?.reduce((result: Array<Work>, currentPage: ListResponse<Work>) => {
      result.push(...currentPage.data)
      return result
    }, [] as Work[]) || []

  const handleFilterChange = (newFilters: WorkFilterPayload) => {
    router.push(
      {
        query: {
          ...filter,
          title_like: newFilters.search,
          tagList_like: newFilters.tagList_like,
        },
      },
      undefined,
      {
        shallow: true,
      },
    )
  }
  const _totalRows = data?.[0].pagination?._totalRows || 0
  const showLoadMore = _totalRows > workList.length
  const loadingMore = isValidating && workList.length > 0
  return (
    <Box>
      <Container>
        <Typography component="h1" variant="h5" mt={8} mb={4}>
          Work
        </Typography>
        {router.isReady && (
          <WorkFilterForm onSubmit={handleFilterChange} initialFilter={initialFilter} />
        )}
        <WorkList workList={workList} isLoading={isLoading} />
        {showLoadMore && (
          <Fragment>
            {loadingMore ? (
              <Stack alignItems="center" mt={4}>
                <CircularProgress />
              </Stack>
            ) : (
              <Button ref={ref} variant="contained" disabled={loadingMore}>
                Load More {loadingMore && <CircularProgress size={24} />}
              </Button>
            )}
          </Fragment>
        )}
      </Container>
    </Box>
  )
}

export function getStaticProps() {
  return {
    props: {},
  }
}

InfinityScroll.Layout = MainLayout
