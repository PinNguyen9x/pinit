import { LoginPayload } from '../models'
import axiosClient from './axios-client'

const authApi = {
  login: (payload: LoginPayload) => {
    return axiosClient.post('/login', payload)
  },
  getProfile: () => {
    return axiosClient.get('/profile')
  },
  logout: () => {
    return axiosClient.post('/logout')
  },
}

export default authApi
