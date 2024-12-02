import { ListParams, ListResponse, Post, Work } from '../models'
import axiosClient from './axios-client'

const postApi = {
  getAll: (params: Partial<ListParams>): Promise<ListResponse<Post>> => {
    return axiosClient.get('/posts', { params })
  },
  get: (id: string): Promise<Post> => {
    return axiosClient.get(`/posts/${id}`)
  },
  add: (payload: FormData): Promise<Post> => {
    return axiosClient.post('/posts', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update: (payload: FormData): Promise<Post> => {
    return axiosClient.patch(`/posts/${payload.get('id')}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default postApi

// browser : localhost:3000/api/posts
// Next server : /api/posts => proxy to https://js-post-api.herokuapp.com/api/posts
// Api server : https://js-post-api.herokuapp.com/api/posts
