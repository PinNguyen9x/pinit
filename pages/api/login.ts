// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import httpProxy, { ProxyResCallback } from 'http-proxy'
import Cookies from 'cookies'

type Data = {
  message: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const proxy = httpProxy.createProxyServer()

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'Method not allowed' })
  }
  return new Promise((resolve) => {
    // don't send cookies to API server
    req.headers.cookie = ''
    const handleLoginResponse: ProxyResCallback = (proxyResponse, req, res) => {
      let body = ''
      proxyResponse.on('data', (chunk) => {
        body += chunk
      })
      proxyResponse.on('end', () => {
        try {
          const { access_token, expiredAt } = JSON.parse(body)
          const isSuccess =
            proxyResponse.statusCode &&
            proxyResponse.statusCode >= 200 &&
            proxyResponse.statusCode < 300
          if (!isSuccess) {
            ;(res as NextApiResponse<Data>)
              .status(proxyResponse.statusCode || 500)
              .json({ message: body })
            return resolve(true)
          }
          // convert token to cookies
          const cookies = Cookies(req, res, {
            secure: process.env.NODE_ENV !== 'development',
          })
          cookies.set('access_token', access_token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(expiredAt),
          })
          ;(res as NextApiResponse<Data>).status(200).json({ message: 'login successfully' }) // OK
        } catch (error) {
          ;(res as NextApiResponse<Data>).status(500).json({ message: 'something went wrong' })
        }
      })

      resolve(true)
    }
    proxy.once('proxyRes', handleLoginResponse)
    proxy.web(req, res, {
      target: process.env.API_URL ?? 'https://json-server-blog.vercel.app',
      changeOrigin: true,
      selfHandleResponse: true,
    })
  })
}
