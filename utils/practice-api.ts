// Phần chung của POST /api/me/practice/{generate,grade}: các bước chặn trước
// khi tốn tiền gọi model, và ánh xạ lỗi của SDK sang mã HTTP.
import Anthropic from '@anthropic-ai/sdk'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildNotesContext,
  checkLogWritable,
  NotesContext,
  PRACTICE_LIMIT_KEY,
  practiceLimiter,
} from './practice'
import { getAnthropic } from './practice-client'
import { isSlug } from './private-content-schema'

/**
 * Thứ tự cố ý: lỗi do request (400/404) và lỗi cấu hình (503) không được ăn
 * quota; quota kiểm cuối cùng, ngay trước khi gọi model. Trả null = đã trả lời.
 */
export async function preparePractice(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<{ anthropic: Anthropic; ctx: NotesContext } | null> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ code: 'method-not-allowed' })
    return null
  }
  const topic = req.body?.topic
  if (!isSlug(topic)) {
    res.status(400).json({ code: 'invalid-topic' })
    return null
  }
  const anthropic = getAnthropic()
  if (!anthropic) {
    res.status(503).json({
      code: 'practice-not-configured',
      message: 'Chưa đặt ANTHROPIC_API_KEY — practice đang tắt.',
    })
    return null
  }
  const ctx = await buildNotesContext(topic)
  if (!ctx) {
    res.status(404).json({ code: 'topic-not-found' })
    return null
  }
  const log = await checkLogWritable()
  if (!log.ok) {
    res.status(503).json({
      code: 'practice-log-readonly',
      message: `Không ghi được practice log (${log.code}): ${log.path}. Thư mục content mount read-only thì đặt PRACTICE_LOG_PATH vào một thư mục ghi được.`,
    })
    return null
  }
  const retryAfter = practiceLimiter.retryAfter(PRACTICE_LIMIT_KEY)
  if (retryAfter > 0) {
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ code: 'rate-limited', retryAfter })
    return null
  }
  practiceLimiter.hit(PRACTICE_LIMIT_KEY)
  return { anthropic, ctx }
}

export function badModelOutput(res: NextApiResponse, reason: string) {
  // Không kèm text thô của model: đó là thứ không tin được, và client chỉ cần biết là hỏng.
  console.warn(`[practice] output model không dùng được: ${reason}`)
  res
    .status(502)
    .json({ code: 'bad-model-output', message: 'Model trả về không đúng định dạng — thử lại.' })
}

/** Lỗi khi gọi model → mã HTTP. Lỗi khác (bug của mình) ném tiếp thành 500. */
export function handleModelError(res: NextApiResponse, err: unknown) {
  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    return res
      .status(504)
      .json({ code: 'model-timeout', message: 'Model không trả lời trong 30 giây.' })
  }
  if (err instanceof Anthropic.APIError) {
    console.warn(`[practice] Anthropic API lỗi ${err.status}: ${err.message}`)
    // status + type (vd 401 authentication_error) đủ để chẩn đoán từ UI; message
    // thô của Anthropic chỉ nằm trong log server, không gửi về client.
    return res
      .status(502)
      .json({ code: 'upstream-error', status: err.status ?? null, type: err.type ?? null })
  }
  throw err
}
