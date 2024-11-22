import authApi from '@/api/auth-api'
import { StorageKeys } from '@/constants'
import { LoginPayload, UserProfile } from '@/models'
import useSWR, { SWRConfiguration } from 'swr'
// Auth -> protected page
// <Auth>{children}</Auth>
function getUserInfor(): UserProfile | null {
  try {
    return JSON.parse(localStorage.getItem(StorageKeys.USER_INFO) || '')
  } catch (error) {
    return null
  }
}
export function useAuth(options?: Partial<SWRConfiguration>) {
  // profile
  const {
    data: profile,
    error,
    mutate,
  } = useSWR<UserProfile | null>('/profile', {
    dedupingInterval: 60 * 60 * 1000, // 1hr
    revalidateOnFocus: false,
    ...options,
    fallbackData: getUserInfor(),
    onSuccess: (data) => {
      // save user info to local storage
      localStorage.setItem(StorageKeys.USER_INFO, JSON.stringify(data))
    },
    onError: (error) => {
      // failt to getProfile -> logout
      console.log('fetch profile error', error)
      logout()
    },
  })
  console.log({ profile, error })

  const firstLoading = profile === undefined && error === undefined
  // khong su dung try catch o day de cho cho nao su dung thi handle
  async function login(data: LoginPayload) {
    await authApi.login(data)
    await mutate()
  }
  async function logout() {
    await authApi.logout()
    await mutate(null, false)
    localStorage.removeItem(StorageKeys.USER_INFO)
  }
  return { profile, error, login, logout, firstLoading, isLoggedIn: !!profile?.username }
}
