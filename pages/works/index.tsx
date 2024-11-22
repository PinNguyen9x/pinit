import { MainLayout } from '@/components/layouts'
import { WorkFilterForm, WorkList } from '@/components/work'
import { useAuth, useWorkList } from '@/hooks'
import { ListParams, WorkFilterPayload } from '@/models'
import { Box, Button, Container, Pagination, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'

export interface WorksPageProps {}

export default function WorksPage(props: WorksPageProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  const filter: Partial<ListParams> = {
    _page: 1,
    _limit: 10,
    ...router.query,
  }
  const initialFilter: WorkFilterPayload = {
    search: filter.title_like || '',
    selectedTagList: filter.tagList_like?.split('|') || [],
  }
  const { data, isLoading } = useWorkList({
    params: filter,
    enabled: !!router.isReady,
  })

  const { _page, _totalRows, _limit } = data?.pagination || {}
  const totalPage = !!_totalRows ? Math.ceil(_totalRows / _limit) : 0

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    router.push({ query: { ...filter, _page: value } }, undefined, { shallow: true })
  }

  const handleFilterChange = (newFilters: WorkFilterPayload) => {
    router.push(
      {
        query: {
          ...filter,
          _page: 1,
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
  if (!router.isReady) return null

  return (
    <Box>
      <Container>
        <Stack mb={4} mt={8} direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h1" variant="h5" mt={8} mb={4}>
            Work
          </Typography>
          {isLoggedIn && (
            <Button variant="contained" onClick={() => router.push('/works/add')}>
              Add work
            </Button>
          )}
        </Stack>

        {router.isReady && (
          <WorkFilterForm onSubmit={handleFilterChange} initialFilter={initialFilter} />
        )}
        <WorkList workList={data?.data || []} isLoading={isLoading} />
        {totalPage > 1 && (
          <Stack alignItems="center">
            <Pagination count={totalPage} page={_page} onChange={handlePageChange} />
          </Stack>
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

WorksPage.Layout = MainLayout
