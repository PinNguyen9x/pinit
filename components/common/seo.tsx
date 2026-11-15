import { SeoData } from '@/models'
import Head from 'next/head'
import React from 'react'

export interface SeoProps {
  data: SeoData
}

// Ảnh bìa lưu dạng đường dẫn tương đối (/covers/...) để không phải nhúng tên
// miền vào từng bài. Nhưng og:image và twitter:image bắt buộc URL tuyệt đối —
// crawler của LinkedIn/Twitter/Facebook không có ngữ cảnh trang để tự ghép.
//
// `url` đi qua cùng một hàm, vì lý do y hệt: trang nào tự ghép tên miền thì tên
// miền cũ sống sót ở đó sau khi đổi domain — đã xảy ra một lần với
// pinit-ten.vercel.app. Trang truyền URL tuyệt đối vẫn được giữ nguyên.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nipit.pro'

function absoluteUrl(src?: string) {
  if (!src) return src
  if (/^https?:\/\//.test(src) || src.startsWith('data:')) return src
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`
}

export function Seo({ data }: SeoProps) {
  const { title, description } = data
  const url = absoluteUrl(data.url)
  const thumbnailUrl = absoluteUrl(data.thumbnailUrl)
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={thumbnailUrl} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={thumbnailUrl} />
    </Head>
  )
}
