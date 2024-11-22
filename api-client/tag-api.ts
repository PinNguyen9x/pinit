import { ListParams, ListResponse, Work } from '../models'
import axiosClient from './axios-client'

const tagApi = {
  getAll: (params: Partial<ListParams>): Promise<ListResponse<string>> => {
    return axiosClient.get('/tags', { params })
  },
}

export default tagApi

// browser : localhost:3000/api/works
// Next server : /api/works => proxy to https://js-post-api.herokuapp.com/api/works
// Api server : https://js-post-api.herokuapp.com/api/works
