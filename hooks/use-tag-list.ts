import tagApi from '@/api-client/tag-api'
import { QueryKeys } from '@/constants'
import { ListParams } from '@/models'
import useSWR, { SWRConfiguration } from 'swr'
export interface UseTagListProps {
  params?: Partial<ListParams>
  options?: SWRConfiguration
}
export function useTagList({
  params = {
    _page: 1,
    _limit: 30,
  },
  options,
}: UseTagListProps) {
  return useSWR([QueryKeys.GET_TAG_LIST, params], () => tagApi.getAll(params), {
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
