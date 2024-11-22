import { ListParams, ListResponse, Work } from '../models'
import axiosClient from './axios-client'

const workApi = {
  getAll: (params: Partial<ListParams>): Promise<ListResponse<Work>> => {
    return axiosClient.get('/works', { params })
  },
  get: (id: string): Promise<Work> => {
    return axiosClient.get(`/works/${id}`)
  },
  add: (payload: FormData): Promise<Work> => {
    return axiosClient.post('/works', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update: (payload: FormData): Promise<Work> => {
    return axiosClient.patch(`/works/${payload.get('id')}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default workApi

// browser : localhost:3000/api/works
// Next server : /api/works => proxy to https://js-post-api.herokuapp.com/api/works
// Api server : https://js-post-api.herokuapp.com/api/works
