import axiosClient from './axios-client'

export interface CvInfo {
  filename: string
  sizeBytes: number
  updatedAt: number
}

const cvApi = {
  info: (): Promise<CvInfo> => {
    return axiosClient.get('/cv/info')
  },
  // Returns the PDF as a Blob. The axios response interceptor unwraps `data`,
  // and with responseType=blob we get the raw Blob back.
  download: async (): Promise<Blob> => {
    return axiosClient.get('/cv/download', { responseType: 'blob' })
  },
}

export default cvApi
