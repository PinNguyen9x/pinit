// Thông báo lỗi của /me/practice cho người dùng. Module thuần, không import gì
// của Node — trang practice (code chạy ở trình duyệt) import trực tiếp.

const MESSAGES: Record<string, string> = {
  'rate-limited': 'Đã dùng hết lượt gọi model trong giờ này.',
  'bad-model-output': 'Model trả về không đúng định dạng — thử lại.',
  'model-timeout': 'Model không trả lời trong 30 giây — thử lại.',
}

// Gợi ý theo status của Anthropic — chỉ những ca đã gặp hoặc chắc chắn gặp.
const UPSTREAM_HINTS: Record<number, string> = {
  400: 'kiểm credit/billing trong Claude Console hoặc PRACTICE_MODEL',
  401: 'kiểm ANTHROPIC_API_KEY trong .env.private',
  403: 'key không có quyền trên workspace/model này',
  404: 'model không khả dụng — đổi PRACTICE_MODEL',
  429: 'bị giới hạn tốc độ — thử lại sau ít phút',
  529: 'Anthropic đang quá tải — thử lại sau',
}

/**
 * Lỗi upstream hiện mã + type của Anthropic (vd `401 authentication_error`) —
 * KHÔNG hiện message thô: message do bên ngoài viết, server cũng không gửi nó về.
 */
export function describePracticeError(json: unknown, httpStatus: number): string {
  const { code, status, type, message } = (json ?? {}) as Record<string, unknown>
  if (code === 'upstream-error') {
    const s = typeof status === 'number' ? status : null
    const t = typeof type === 'string' && /^[a-z_]{1,64}$/.test(type) ? type : null
    const label = [s, t].filter(Boolean).join(' ')
    const hint = s !== null ? UPSTREAM_HINTS[s] : undefined
    return `Anthropic API báo lỗi${label ? ` ${label}` : ''}${hint ? ` — ${hint}.` : ' — thử lại sau.'}`
  }
  if (typeof code === 'string' && MESSAGES[code]) return MESSAGES[code]
  // Các message còn lại do chính server mình viết (invalid-input, practice-log-readonly...).
  if (typeof message === 'string') return message
  return `Lỗi ${httpStatus}.`
}
