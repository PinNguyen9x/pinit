import { useState } from 'react'

export interface UseCvDownloadResult {
  download: () => Promise<void>
  isDownloading: boolean
}

// Triggers the browser file save dialog with the PDF blob returned by the
// protected backend endpoint. The Bearer token travels server-side via the
// httpOnly cookie → proxy headers, so the blob arrives over the same origin.
export function useCvDownload(): UseCvDownloadResult {
  const [isDownloading, setIsDownloading] = useState(false)

  async function download() {
    setIsDownloading(true)
    try {
      // cvApi nạp động, cùng lý do authApi trong use-auth: Footer gọi hook này
      // trên MỌI trang, import tĩnh sẽ kéo axios vào bundle cả site.
      const { default: cvApi } = await import('@/api-client/cv-api')
      const blob = await cvApi.download()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'CV_Nguyen_Thanh_Pin.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return { download, isDownloading }
}
