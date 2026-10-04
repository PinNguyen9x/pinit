import axios, { AxiosError } from 'axios'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    // Chỉ in khi chạy dev: body lỗi từ API có thể chứa thông tin không nên để
    // lộ trong console của người dùng cuối. Nơi gọi vẫn nhận nguyên body qua
    // reject nên không mất khả năng xử lý.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api] request failed', error.response?.data)
    }
    return Promise.reject(error.response?.data)
  },
)

export default axiosClient
