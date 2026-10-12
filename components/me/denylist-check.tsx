import type { CheckKind, ContentCheck } from '@/utils/denylist'
import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material'
import { useState } from 'react'

type State =
  | { kind: 'idle' | 'loading' }
  | { kind: 'done'; result: ContentCheck }
  | { kind: 'error'; message: string }

const NOT_FOUND: Record<CheckKind, string> = {
  'case-study': 'Không tìm thấy case study.',
  post: 'Không tìm thấy bài viết.',
}

/** Nút chạy denylist cho một case study hoặc bài viết qua POST /api/me/check-denylist. */
export function DenylistCheck({ kind, slug }: { kind: CheckKind; slug: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function run() {
    setState({ kind: 'loading' })
    const res = await fetch('/api/me/check-denylist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, slug }),
    }).catch(() => null)
    if (!res) return setState({ kind: 'error', message: 'Không gọi được API.' })
    if (res.status === 401)
      return setState({ kind: 'error', message: 'Phiên đã hết hạn — đăng nhập lại.' })
    if (!res.ok) return setState({ kind: 'error', message: `Lỗi ${res.status}.` })
    setState({ kind: 'done', result: await res.json() })
  }

  return (
    <Stack spacing={1.5} alignItems="flex-start">
      <Button variant="outlined" size="small" onClick={run} disabled={state.kind === 'loading'}>
        {state.kind === 'loading' ? 'Đang kiểm…' : 'Kiểm denylist'}
      </Button>
      {state.kind === 'error' && <Alert severity="error">{state.message}</Alert>}
      {state.kind === 'done' && <Result kind={kind} result={state.result} />}
    </Stack>
  )
}

function Result({ kind, result }: { kind: CheckKind; result: ContentCheck }) {
  switch (result.status) {
    case 'clean':
      return <Alert severity="success">Sạch — không khớp từ khóa nào trong denylist.</Alert>
    case 'matches':
      return (
        <Alert severity="error" sx={{ width: '100%' }}>
          <AlertTitle>{result.matches.length} chỗ khớp denylist</AlertTitle>
          <Box
            component="ul"
            sx={{ m: 0, pl: 2.5, fontFamily: 'monospace', fontSize: '0.8125rem' }}
          >
            {result.matches.map((m) => (
              <li key={`${m.line}:${m.keyword}`}>
                dòng {m.line}: {m.keyword}
              </li>
            ))}
          </Box>
        </Alert>
      )
    // Chưa cấu hình KHÔNG phải pass — hiện cảnh báo, không hiện màu xanh.
    case 'missing-denylist':
      return (
        <Alert severity="warning">
          Chưa có denylist (.denylist trong PRIVATE_CONTENT_DIR) — chưa kiểm được.
        </Alert>
      )
    case 'empty-denylist':
      return <Alert severity="warning">Denylist rỗng — chưa kiểm được.</Alert>
    default:
      return <Alert severity="error">{NOT_FOUND[kind]}</Alert>
  }
}
