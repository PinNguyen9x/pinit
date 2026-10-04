import { isSecureRequest, ownerCookieHeader } from '@/utils/owner-cookie'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  res.setHeader('Set-Cookie', ownerCookieHeader(null, isSecureRequest(req)))
  res.status(200).json({ message: 'ok' })
}
