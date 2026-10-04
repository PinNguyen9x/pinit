// Gọi Anthropic cho /me/practice. Tách khỏi ./practice.ts để test mock được
// đúng một chỗ. CHỈ CHẠY Ở SERVER — key nằm trong env, không bao giờ ra client.
import Anthropic from '@anthropic-ai/sdk'

/** Rẻ nhất trong các model hiện hành — đổi bằng env PRACTICE_MODEL. */
export const DEFAULT_PRACTICE_MODEL = 'claude-haiku-4-5'

export function practiceModel(): string {
  return process.env.PRACTICE_MODEL || DEFAULT_PRACTICE_MODEL
}

let client: Anthropic | null = null

/** null = chưa đặt ANTHROPIC_API_KEY → practice tắt, API trả 503 rõ ràng. */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  // maxRetries 0: SDK mặc định retry 2 lần, và timeout cũng được retry — để
  // nguyên thì 30s thành 90s. Một lần, 30s, hỏng thì người dùng tự bấm lại.
  client ??= new Anthropic({ timeout: 30_000, maxRetries: 0 })
  return client
}

export type JsonCallResult = { ok: true; text: string } | { ok: false; reason: string }

/**
 * Một lượt gọi có ép JSON theo schema (structured outputs). Chỉ trả text khi
 * model kết thúc bình thường — refusal hay bị cắt vì max_tokens đều là lỗi,
 * vì JSON dở dang parse ra cũng là rác.
 */
export async function callJson(
  anthropic: Anthropic,
  opts: { system: string; user: string; schema: Record<string, unknown>; maxTokens: number },
): Promise<JsonCallResult> {
  const res = await anthropic.messages.create({
    model: practiceModel(),
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
    output_config: { format: { type: 'json_schema', schema: opts.schema } },
  })
  if (res.stop_reason !== 'end_turn') return { ok: false, reason: `stop_reason=${res.stop_reason}` }
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return { ok: true, text }
}
