import workApi from '@/api-client/work-api'
import { QueryKeys } from '@/constants'
import { Arguments, useSWRConfig } from 'swr'

export function useAddWork() {
  const { mutate } = useSWRConfig()
  async function addWork(payload: FormData) {
    try {
      const newWork = await workApi.add(payload)
      mutate(
        (key: Arguments) => Array.isArray(key) && key.includes(QueryKeys.GET_WORK_LIST),
        undefined,
        {
          revalidate: false,
        },
      )
      return newWork
    } catch (error) {
      throw error
    }
  }
  return addWork
}
