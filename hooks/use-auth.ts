import { StorageKeys } from '@/constants/storage-key'
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
  //
  // authApi nạp động: Header gọi useAuth trên MỌI trang, nên import tĩnh sẽ kéo
  // axios (và buffer/base64-js, qs) vào chunk mà cả site phải tải — chỉ để phục
  // vụ hai hành động người dùng hiếm khi chạm. Việc đọc profile đã đi qua
  // fetcher fetch() khai báo ở pages/_app.
  async function login(data: LoginPayload) {
    const { default: authApi } = await import('@/api/auth-api')
    await authApi.login(data)
    await mutate()
  }
  async function logout() {
    const { default: authApi } = await import('@/api/auth-api')
    await authApi.logout()
    await mutate(null, false)
    localStorage.removeItem(StorageKeys.USER_INFO)
  }
  return { profile, error, login, logout, firstLoading, isLoggedIn: !!profile?.username }
}
