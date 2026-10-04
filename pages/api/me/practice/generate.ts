import {
  appendLog,
  GENERATE_SCHEMA,
  GENERATE_SYSTEM,
  generateUserMessage,
  parseGenerated,
} from '@/utils/practice'
import { badModelOutput, handleModelError, preparePractice } from '@/utils/practice-api'
import { callJson } from '@/utils/practice-client'
import type { NextApiRequest, NextApiResponse } from 'next'

// POST { topic } → { questions: [{ id, question }], notes }. Sau middleware /me.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ready = await preparePractice(req, res)
  if (!ready) return
  const { anthropic, ctx } = ready

  let result
  try {
    result = await callJson(anthropic, {
      system: GENERATE_SYSTEM,
      user: generateUserMessage(ctx),
      schema: GENERATE_SCHEMA,
      maxTokens: 2_000,
    })
  } catch (err) {
    return handleModelError(res, err)
  }
  if (!result.ok) return badModelOutput(res, result.reason)
  const questions = parseGenerated(result.text)
  if (!questions) return badModelOutput(res, 'generate: sai schema')

  const ts = new Date().toISOString()
  await appendLog(
    questions.map((q) => ({
      ts,
      topic: ctx.topic.slug,
      question: q.question,
      answer: null,
      score: null,
      feedback: null,
    })),
  )
  res.status(200).json({
    questions,
    notes: { included: ctx.included, omitted: ctx.omitted, truncated: ctx.truncated },
  })
}
