import { RATINGS, Rating } from '@/utils/flashcard-schedule'
import { flashcardStatePath, rateCard, topicCards } from '@/utils/flashcards'
import { isSlug } from '@/utils/private-content-schema'
import { checkStateWritable } from '@/utils/roadmap-state'
import type { NextApiRequest, NextApiResponse } from 'next'

// POST { topic, index, rating } → { last, interval, due }. Sau middleware /me.
// Chỉ nhận thẻ có thật — client không tự đẻ key rác vào state.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ code: 'method-not-allowed' })
  }
  const { topic, index, rating } = req.body ?? {}
  if (
    !isSlug(topic) ||
    !Number.isInteger(index) ||
    !(RATINGS as readonly string[]).includes(rating)
  ) {
    return res.status(400).json({ code: 'invalid-input' })
  }
  const cards = await topicCards(topic)
  const card = cards?.[index]
  if (!card) return res.status(404).json({ code: 'card-not-found' })

  const blocked = await checkStateWritable(flashcardStatePath())
  if (blocked) {
    return res.status(503).json({
      code: 'flashcard-state-readonly',
      message: `Không ghi được ${flashcardStatePath()} (${blocked}) — thư mục practice log phải mount rw.`,
    })
  }
  res.status(200).json(await rateCard(card.key, rating as Rating))
}
