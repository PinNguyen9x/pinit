// Stub thay Anthropic API cho `npm run verify`.
//
// Vì sao chặn ở tầng này chứ không mock trong code: `@anthropic-ai/sdk` đọc
// ANTHROPIC_BASE_URL, nên trỏ biến đó về đây là chặn được mọi lời gọi ra ngoài
// mà KHÔNG phải sửa một dòng code production. Đường đi được kiểm là đường thật:
// route API thật, `callJson` thật, `parseGenerated`/`parseGrade` thật — chỉ có
// phía bên kia dây mạng là giả.
//
// Phân biệt generate với grade bằng `output_config.format.schema.required`, chứ
// không bằng nội dung prompt: prompt là văn bản tiếng Việt sẽ được sửa, schema
// là hợp đồng. Sửa lời văn trong GENERATE_SYSTEM không được làm stub hỏng.
import { createServer } from 'node:http'

// Phải khớp QUESTION_COUNT trong utils/practice.ts — `parseGenerated` trả null
// nếu số câu hỏi khác, và lúc đó API trả 502 chứ không phải 200.
const QUESTION_COUNT = 5

let callCount = 0

/** Thân `messages.create` mà SDK mong đợi, đủ cho `callJson` đọc được. */
function messageResponse(jsonText) {
  return {
    id: 'msg_verify_mock',
    type: 'message',
    role: 'assistant',
    model: 'claude-haiku-4-5',
    content: [{ type: 'text', text: jsonText }],
    // `callJson` coi mọi stop_reason khác 'end_turn' là lỗi — refusal hay bị cắt
    // vì max_tokens đều cho JSON dở dang.
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 0, output_tokens: 0 },
  }
}

function payloadFor(body) {
  const required = body?.output_config?.format?.schema?.required ?? []

  if (required.includes('questions')) {
    return JSON.stringify({
      questions: Array.from({ length: QUESTION_COUNT }, (_, i) => ({
        question: `[mock] Câu hỏi kiểm thử số ${i + 1}?`,
      })),
    })
  }

  if (required.includes('score')) {
    // score nằm trong 0..10 và followUp không rỗng, nếu không `parseGrade` trả
    // null. Giá trị cố định để hai lần chạy liên tiếp cho cùng kết quả.
    return JSON.stringify({
      score: 7,
      missing: ['[mock] một điểm còn thiếu'],
      followUp: '[mock] câu hỏi đào sâu',
    })
  }

  return null
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/__mock/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true, calls: callCount }))
    return
  }

  let raw = ''
  req.on('data', (chunk) => {
    raw += chunk
  })
  req.on('end', () => {
    if (req.method !== 'POST' || !req.url.startsWith('/v1/messages')) {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: 'error', error: { type: 'not_found_error' } }))
      return
    }

    let body
    try {
      body = JSON.parse(raw || '{}')
    } catch {
      body = {}
    }

    const payload = payloadFor(body)
    if (!payload) {
      // Schema lạ = code production đã thêm một lời gọi model mà stub chưa biết.
      // Trả lỗi rõ thay vì đoán: im lặng trả JSON sai làm API thật trả 502 và
      // người đọc kết quả verify sẽ đi tìm bug ở chỗ không có bug.
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          type: 'error',
          error: {
            type: 'invalid_request_error',
            message:
              'anthropic-mock: không nhận ra schema được yêu cầu. Có lời gọi model mới trong code — thêm nhánh vào payloadFor().',
          },
        }),
      )
      return
    }

    callCount += 1
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(messageResponse(payload)))
  })
})

const port = Number(process.argv[2] || 4319)
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`[anthropic-mock] 127.0.0.1:${port}\n`)
})

// Để `index.mjs` tắt được bằng SIGTERM mà không để cổng treo.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
