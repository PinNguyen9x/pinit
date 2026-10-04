import { OwnerLayout } from '@/components/layouts/owner'
import { PracticeHistory, scoreColor } from '@/components/me/practice-history'
import { requireOwner } from '@/utils/owner-auth'
import type { Grade, PracticeQuestion, PracticeStats } from '@/utils/practice'
import { PRACTICE_REQUESTS_PER_HOUR, readPracticeStats } from '@/utils/practice'
import { practiceModel } from '@/utils/practice-client'
import { listTopics } from '@/utils/private-content'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface PracticePageProps {
  topics: { slug: string; title: string }[]
  stats: Omit<PracticeStats, 'corruptLines'>
  configured: boolean
  model: string
  limitPerHour: number
  statsError: string | null
}

const ERRORS: Record<string, string> = {
  'rate-limited': 'Đã dùng hết lượt gọi model trong giờ này.',
  'bad-model-output': 'Model trả về không đúng định dạng — thử lại.',
  'model-timeout': 'Model không trả lời trong 30 giây — thử lại.',
  'upstream-error': 'Anthropic API báo lỗi — thử lại sau.',
}

async function post<T>(url: string, body: object): Promise<{ data?: T; error?: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)
  if (!res) return { error: 'Không gọi được API.' }
  if (res.status === 401) return { error: 'Phiên đã hết hạn — đăng nhập lại.' }
  const json = await res.json().catch(() => null)
  if (!res.ok) return { error: ERRORS[json?.code] ?? json?.message ?? `Lỗi ${res.status}.` }
  return { data: json as T }
}

// Mọi text do model sinh (câu hỏi, missing, followUp) render bằng Typography
// pre-wrap — React escape sẵn. KHÔNG đưa qua utils/markdown.ts (rehype-raw).
function QuestionCard({ topic, q, index }: { topic: string; q: PracticeQuestion; index: number }) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [grade, setGrade] = useState<Grade | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setError('')
    const { data, error } = await post<Grade>('/api/me/practice/grade', {
      topic,
      question: q.question,
      answer,
    })
    setBusy(false)
    if (error) return setError(error)
    setGrade(data!)
    // Nạp lại getServerSideProps để lịch sử phía dưới có lần chấm vừa rồi.
    router.replace(router.asPath, undefined, { scroll: false })
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography fontWeight={600} whiteSpace="pre-wrap" mb={1.5}>
          {index + 1}. {q.question}
        </Typography>
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Câu trả lời của bạn"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={busy || !!grade}
        />
        {!grade && (
          <Button
            sx={{ mt: 1.5 }}
            variant="contained"
            onClick={submit}
            disabled={busy || !answer.trim()}
          >
            {busy ? 'Đang chấm…' : 'Chấm'}
          </Button>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {error}
          </Alert>
        )}
        {grade && (
          <Stack spacing={1} mt={2}>
            <Chip
              label={`${grade.score}/10`}
              color={scoreColor(grade.score)}
              sx={{ alignSelf: 'flex-start' }}
            />
            {grade.missing.length > 0 && (
              <Box>
                <Typography variant="subtitle2">Còn thiếu</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {grade.missing.map((m) => (
                    <li key={m}>
                      <Typography variant="body2" whiteSpace="pre-wrap">
                        {m}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2">Câu hỏi nối tiếp</Typography>
              <Typography variant="body2" whiteSpace="pre-wrap">
                {grade.followUp}
              </Typography>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default function PracticePage({
  topics,
  stats,
  configured,
  model,
  limitPerHour,
  statsError,
}: PracticePageProps) {
  const [topic, setTopic] = useState(topics[0]?.slug ?? '')
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [notesInfo, setNotesInfo] = useState<{ omitted: string[]; truncated: boolean } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [round, setRound] = useState(0)

  async function generate() {
    setBusy(true)
    setError('')
    const { data, error } = await post<{
      questions: PracticeQuestion[]
      notes: { omitted: string[]; truncated: boolean }
    }>('/api/me/practice/generate', { topic })
    setBusy(false)
    if (error) return setError(error)
    setQuestions(data!.questions)
    setNotesInfo(data!.notes)
    setRound((r) => r + 1)
  }

  return (
    <>
      <Head>
        <title>Practice</title>
      </Head>
      <Typography component="h1" variant="h4" mb={1}>
        Practice
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Model: {model} · tối đa {limitPerHour} lượt gọi/giờ · chỉ notes trong learn/ được gửi đi
      </Typography>

      {!configured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Chưa đặt ANTHROPIC_API_KEY — practice đang tắt.
        </Alert>
      )}
      {!topics.length && <Alert severity="info">Chưa có topic nào trong learn/.</Alert>}

      {topics.length > 0 && (
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <TextField
            select
            size="small"
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            {topics.map((t) => (
              <MenuItem key={t.slug} value={t.slug}>
                {t.title}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={generate} disabled={!configured || busy || !topic}>
            {busy ? 'Đang sinh câu hỏi…' : questions.length ? 'Bộ câu hỏi mới' : 'Sinh 5 câu hỏi'}
          </Button>
        </Stack>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {notesInfo?.truncated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Notes vượt 12.000 ký tự nên đã cắt
          {notesInfo.omitted.length > 0 && ` — không gửi: ${notesInfo.omitted.join(', ')}`}.
        </Alert>
      )}

      <Stack spacing={2} mb={6}>
        {questions.map((q, i) => (
          <QuestionCard key={`${round}-${q.id}`} topic={topic} q={q} index={i} />
        ))}
      </Stack>

      <Typography component="h2" variant="h6" mb={2}>
        Lịch sử
      </Typography>
      {statsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {statsError}
        </Alert>
      )}
      <PracticeHistory byTopic={stats.byTopic} recent={stats.recent} />
    </>
  )
}

PracticePage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<PracticePageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const { data } = await listTopics()
  let stats: PracticeStats = { recent: [], byTopic: [], corruptLines: 0 }
  let statsError: string | null = null
  try {
    stats = await readPracticeStats()
    if (stats.corruptLines)
      statsError = `Bỏ qua ${stats.corruptLines} dòng hỏng trong practice log.`
  } catch (err) {
    statsError = `Không đọc được practice log (${(err as NodeJS.ErrnoException).code ?? 'lỗi'}).`
  }
  return {
    props: {
      topics: data.map((t) => ({ slug: t.slug, title: t.title })),
      stats: { recent: stats.recent, byTopic: stats.byTopic },
      configured: !!process.env.ANTHROPIC_API_KEY,
      model: practiceModel(),
      limitPerHour: PRACTICE_REQUESTS_PER_HOUR,
      statsError,
    },
  }
}
