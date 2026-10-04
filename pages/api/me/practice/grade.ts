import {
  appendLog,
  GRADE_SCHEMA,
  GRADE_SYSTEM,
  gradeUserMessage,
  MAX_ANSWER_CHARS,
  MAX_QUESTION_CHARS,
  parseGrade,
} from '@/utils/practice'
import { badModelOutput, handleModelError, preparePractice } from '@/utils/practice-api'
import { callJson } from '@/utils/practice-client'
import type { NextApiRequest, NextApiResponse } from 'next'

function text(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null
}

// POST { topic, question, answer } → { score, missing, followUp }. Sau middleware /me.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiểm input trước preparePractice để request hỏng không ăn quota.
  if (req.method === 'POST') {
    const question = text(req.body?.question, MAX_QUESTION_CHARS)
    const answer = text(req.body?.answer, MAX_ANSWER_CHARS)
    if (!question || !answer) {
      return res.status(400).json({
        code: 'invalid-input',
        message: `Cần question (≤ ${MAX_QUESTION_CHARS} ký tự) và answer (≤ ${MAX_ANSWER_CHARS} ký tự).`,
      })
    }
  }
  const ready = await preparePractice(req, res)
  if (!ready) return
  const { anthropic, ctx } = ready
  const question = req.body.question.trim()
  const answer = req.body.answer.trim()

  let result
  try {
    result = await callJson(anthropic, {
      system: GRADE_SYSTEM,
      user: gradeUserMessage(ctx, question, answer),
      schema: GRADE_SCHEMA,
      maxTokens: 2_000,
    })
  } catch (err) {
    return handleModelError(res, err)
  }
  if (!result.ok) return badModelOutput(res, result.reason)
  const grade = parseGrade(result.text)
  if (!grade) return badModelOutput(res, 'grade: sai schema')

  await appendLog([
    {
      ts: new Date().toISOString(),
      topic: ctx.topic.slug,
      question,
      answer,
      score: grade.score,
      feedback: { missing: grade.missing, followUp: grade.followUp },
    },
  ])
  res.status(200).json(grade)
}
