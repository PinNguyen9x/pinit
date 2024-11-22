import type { NextApiRequest, NextApiResponse } from 'next'
import Cookies from 'cookies'

type Data = {
  message: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'Method not allowed' })
  }
  const cookies = new Cookies(req, res)
  cookies.set('access_token')
  res.status(200).json({ message: 'logout successfully' })
}
