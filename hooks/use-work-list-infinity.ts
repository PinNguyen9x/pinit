import axiosClient from '@/api-client/axios-client'
import { ListParams, ListResponse, Work } from '@/models'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import qs from 'qs'
export interface UseWorkListInfinityProps {
  params: Partial<ListParams>
  options?: SWRInfiniteConfiguration
  enabled?: boolean
}
export function useWorkListInfinity({ enabled = true, params, options }: UseWorkListInfinityProps) {
  return useSWRInfinite<ListResponse<Work>>(
    (index: number, previousData: ListResponse<Work>) => {
      const page = index + 1
      const query = {
        ...params,
        _page: page,
        _limit: 5,
      }
      if (previousData) {
        const { _totalRows, _limit } = previousData.pagination || {
          _limit: 5,
          _totalRows: 0,
        }
        const totalPage = Math.ceil(_totalRows / _limit)

        if (page > totalPage) {
          return null
        }
      }
      return `/works?${qs.stringify(query)}`
    },
    (url) => axiosClient.get(url),
    {
      dedupingInterval: 30 * 1000, // 30s
      keepPreviousData: true,
      revalidateFirstPage: false,
      ...options,
    },
  )
}
