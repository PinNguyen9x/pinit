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
    // Do some thing with response error
    console.log('interceptor: ', error.response?.data)
    return Promise.reject(error.response?.data)
  },
)

export default axiosClient
