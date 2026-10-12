import { checkContentFile, isCheckKind } from '@/utils/denylist'
import { isSlug } from '@/utils/private-content-schema'
import type { NextApiRequest, NextApiResponse } from 'next'

// Nằm sau middleware /me (không thuộc PUBLIC_PATHS): thiếu cookie là 401 trước
// khi tới đây. Chỉ đọc file trên disk của server, không gửi gì ra ngoài.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const slug = req.body?.slug
  if (!isSlug(slug)) return res.status(400).json({ message: 'Invalid slug' })
  // Thiếu kind = case study: nút cũ chỉ gửi { slug }.
  const kind = req.body?.kind ?? 'case-study'
  if (!isCheckKind(kind)) return res.status(400).json({ message: 'Invalid kind' })

  const result = await checkContentFile(kind, slug)
  if (result.status === 'not-found') return res.status(404).json(result)
  return res.status(200).json(result)
}
