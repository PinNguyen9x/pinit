import { getClientIp, safeNextPath } from '@/utils/owner-auth'
import { isSecureRequest, ownerCookieHeader } from '@/utils/owner-cookie'
import { attemptLogin } from '@/utils/owner-login'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ip = getClientIp(req.headers['x-forwarded-for'], req.socket.remoteAddress)
  const result = await attemptLogin(req.body?.passphrase, ip)

  switch (result.status) {
    case 200:
      res.setHeader('Set-Cookie', ownerCookieHeader(result.token, isSecureRequest(req)))
      // Server quyết định đích chuyển hướng — client chỉ đi theo `next` đã kiểm.
      return res.status(200).json({ message: 'ok', next: safeNextPath(req.body?.next) })
    case 429:
      res.setHeader('Retry-After', String(result.retryAfter))
      return res.status(429).json({ message: 'Too many attempts' })
    case 401:
      return res.status(401).json({ message: 'Invalid passphrase' })
    default:
      return res.status(404).end()
  }
}
