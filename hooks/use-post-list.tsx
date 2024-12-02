import postApi from '@/api-client/post-api'
import { QueryKeys } from '@/constants'
import { ListParams } from '@/models'
import useSWR, { SWRConfiguration } from 'swr'
export interface UsePostListProps {
  params: Partial<ListParams>
  options?: SWRConfiguration
  enabled?: boolean
}
export function usePostList({ enabled = true, params, options }: UsePostListProps) {
  return useSWR(enabled ? [QueryKeys.GET_POST_LIST, params] : null, () => postApi.getAll(params), {
    dedupingInterval: 30 * 1000, // 30s
    keepPreviousData: true,
    fallbackData: {
      data: [],
      pagination: {
        _page: 1,
        _limit: 10,
        _totalRows: 0,
      },
    },
    ...options,
  })
}
