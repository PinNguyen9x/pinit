import { OwnerLayout } from '@/components/layouts/owner'
import { PracticeHistory } from '@/components/me/practice-history'
import { ProgressBar, ProgressRing } from '@/components/me/progress-ring'
import { requireOwner } from '@/utils/owner-auth'
import type { Grade, PracticeQuestion, PracticeStats } from '@/utils/practice'
import { PRACTICE_REQUESTS_PER_HOUR, readPracticeStats } from '@/utils/practice'
import { anthropicKeyProblem, practiceModel } from '@/utils/practice-client'
import { describePracticeError } from '@/utils/practice-errors'
import { practiceStreak, scoreBand, ScoreTone, vnDay } from '@/utils/practice-insights'
import { listTopics } from '@/utils/private-content'
import { isSlug } from '@/utils/private-content-schema'
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
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { MdAutorenew, MdOutlineMenuBook } from 'react-icons/md'

interface PracticePageProps {
  topics: { slug: string; title: string }[]
  initialTopic: string
  stats: Pick<PracticeStats, 'recent' | 'byTopic'>
  streak: number
  todayCount: number
  configured: boolean
  keyProblem: string | null
  model: string
  limitPerHour: number
  statsError: string | null
}

const TONE_COLOR: Record<ScoreTone, string> = {
  success: 'success.main',
  info: 'info.main',
  warning: 'warning.main',
  error: 'error.main',
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
  if (!res.ok) return { error: describePracticeError(json, res.status) }
  return { data: json as T }
}

function ScoreBadge({ score }: { score: number }) {
  const band = scoreBand(score)
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: 3,
          borderColor: TONE_COLOR[band.tone],
          fontWeight: 800,
          fontSize: '1.25rem',
          // Điểm "bật" lên một nhịp — đủ để thấy, không đủ để phiền.
          '@keyframes score-pop': {
            '0%': { transform: 'scale(0.6)', opacity: 0 },
            '70%': { transform: 'scale(1.1)', opacity: 1 },
            '100%': { transform: 'scale(1)' },
          },
          animation: 'score-pop 420ms ease-out',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {score}
      </Box>
      <Box>
        <Typography fontWeight={700} color={TONE_COLOR[band.tone]}>
          {band.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          trên thang 10
        </Typography>
      </Box>
    </Stack>
  )
}

// Mọi text do model sinh (câu hỏi, missing, followUp) render bằng Typography
// pre-wrap — React escape sẵn. KHÔNG đưa qua utils/markdown.ts (rehype-raw).
function QuestionCard({
  topic,
  q,
  index,
  total,
  onGraded,
}: {
  topic: string
  q: PracticeQuestion
  index: number
  total: number
  onGraded: (score: number) => void
}) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [grade, setGrade] = useState<Grade | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (busy || grade || !answer.trim()) return
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
    onGraded(data!.score)
    // Nạp lại getServerSideProps để lịch sử/chuỗi ngày có lần chấm vừa rồi.
    router.replace(router.asPath, undefined, { scroll: false })
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: grade ? TONE_COLOR[scoreBand(grade.score).tone] : 'divider',
        transition: 'border-color 300ms',
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Câu {index + 1}/{total}
        </Typography>
        <Typography fontWeight={600} whiteSpace="pre-wrap" mb={1.5}>
          {q.question}
        </Typography>
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Trả lời như đang phỏng vấn — ý chính trước, rồi đánh đổi."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={busy || !!grade}
        />
        {!grade && (
          <Stack direction="row" alignItems="center" spacing={1.5} mt={1.5}>
            <Button variant="contained" onClick={submit} disabled={busy || !answer.trim()}>
              {busy ? 'Đang chấm…' : 'Chấm'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              ⌘/Ctrl + Enter
            </Typography>
          </Stack>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {error}
          </Alert>
        )}
        {grade && (
          <Stack spacing={1.5} mt={2}>
            <ScoreBadge score={grade.score} />
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
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2">Câu hỏi nối tiếp</Typography>
              <Typography variant="body2" whiteSpace="pre-wrap">
                {grade.followUp}
              </Typography>
            </Box>
            {grade.score < 5 && (
              <Button
                size="small"
                component={Link}
                href={`/me/learn/${topic}`}
                startIcon={<MdOutlineMenuBook />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Đọc lại notes của topic này
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

function SessionSummary({
  scores,
  total,
  topic,
  onAgain,
  busy,
}: {
  scores: number[]
  total: number
  topic: string
  onAgain: () => void
  busy: boolean
}) {
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
  const band = scoreBand(avg)
  const message =
    avg >= 9
      ? 'Phong độ phỏng vấn thật. Chuyển sang topic khó hơn đi.'
      : avg >= 7
        ? 'Nắm chắc phần lớn. Đọc lại các ý "còn thiếu" rồi làm thêm một bộ.'
        : avg >= 5
          ? 'Đã có khung. Ôn lại notes, tập trả lời có cấu trúc: định nghĩa → cơ chế → đánh đổi.'
          : 'Notes chưa ngấm — đọc lại một lượt rồi quay lại, lần sau sẽ khác.'
  return (
    <Card variant="outlined" sx={{ borderColor: TONE_COLOR[band.tone], borderWidth: 2 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
          <ProgressRing
            value={avg * 10}
            size={88}
            thickness={8}
            color={TONE_COLOR[band.tone]}
            label={`${avg}`}
          />
          <Box flexGrow={1}>
            <Typography variant="h6">
              Xong {total}/{total} câu · {band.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              {message}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                startIcon={<MdAutorenew />}
                onClick={onAgain}
                disabled={busy}
              >
                Bộ câu hỏi mới
              </Button>
              <Button
                component={Link}
                href={`/me/learn/${topic}`}
                startIcon={<MdOutlineMenuBook />}
              >
                Đọc notes
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function PracticePage({
  topics,
  initialTopic,
  stats,
  streak,
  todayCount,
  configured,
  keyProblem,
  model,
  limitPerHour,
  statsError,
}: PracticePageProps) {
  const [topic, setTopic] = useState(initialTopic)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notesInfo, setNotesInfo] = useState<{ omitted: string[]; truncated: boolean } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [round, setRound] = useState(0)

  const topicTitle = topics.find((t) => t.slug === topic)?.title ?? topic
  const topicStat = stats.byTopic.find((t) => t.topic === topic)
  const graded = Object.values(scores)

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
    setScores({})
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
      {keyProblem && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {keyProblem}.
        </Alert>
      )}
      {!topics.length && <Alert severity="info">Chưa có topic nào trong learn/.</Alert>}

      {topics.length > 0 && (
        <>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(3, 1fr)' }}
            gap={1.5}
            mb={3}
          >
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                CHUỖI LUYỆN
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {streak ? `🔥 ${streak} ngày` : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {todayCount
                  ? `hôm nay đã chấm ${todayCount} câu`
                  : 'chấm 1 câu hôm nay để giữ chuỗi'}
              </Typography>
            </Box>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {topicTitle.toUpperCase()}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {topicStat ? `${topicStat.average}/10` : 'Chưa luyện'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topicStat
                  ? `${topicStat.count} lần chấm · ${scoreBand(topicStat.average).label}`
                  : 'bộ đầu tiên sẽ đặt mốc'}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                gridColumn: { xs: '1 / -1', md: 'auto' },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                LƯỢT NÀY
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {questions.length ? `${graded.length}/${questions.length}` : '—'}
              </Typography>
              <Box mt={1}>
                <ProgressBar
                  value={questions.length ? (graded.length / questions.length) * 100 : 0}
                />
              </Box>
            </Box>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
            mb={3}
          >
            <TextField
              select
              size="small"
              label="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={busy}
              sx={{ minWidth: 220 }}
            >
              {topics.map((t) => (
                <MenuItem key={t.slug} value={t.slug}>
                  {t.title}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={generate} disabled={!configured || busy || !topic}>
              {busy ? 'Đang soạn câu hỏi…' : questions.length ? 'Bộ câu hỏi mới' : 'Sinh 5 câu hỏi'}
            </Button>
          </Stack>
        </>
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
          <QuestionCard
            key={`${round}-${q.id}`}
            topic={topic}
            q={q}
            index={i}
            total={questions.length}
            onGraded={(score) => setScores((s) => ({ ...s, [q.id]: score }))}
          />
        ))}
        {questions.length > 0 && graded.length === questions.length && (
          <SessionSummary
            scores={graded}
            total={questions.length}
            topic={topic}
            onAgain={generate}
            busy={busy}
          />
        )}
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
  let stats: PracticeStats = { recent: [], byTopic: [], activeDays: [], corruptLines: 0 }
  let statsError: string | null = null
  try {
    stats = await readPracticeStats()
    if (stats.corruptLines)
      statsError = `Bỏ qua ${stats.corruptLines} dòng hỏng trong practice log.`
  } catch (err) {
    statsError = `Không đọc được practice log (${(err as NodeJS.ErrnoException).code ?? 'lỗi'}).`
  }

  const topics = data.map((t) => ({ slug: t.slug, title: t.title }))
  // ?topic=<slug> từ nút "Luyện" ở roadmap — slug lạ thì rơi về topic đầu.
  const wanted = ctx.query.topic
  const initialTopic =
    isSlug(wanted) && topics.some((t) => t.slug === wanted) ? wanted : (topics[0]?.slug ?? '')
  const today = vnDay(Date.now())

  return {
    props: {
      topics,
      initialTopic,
      stats: { recent: stats.recent, byTopic: stats.byTopic },
      streak: practiceStreak(stats.activeDays, today),
      todayCount: stats.recent.filter((e) => vnDay(e.ts) === today).length,
      configured: !!process.env.ANTHROPIC_API_KEY,
      keyProblem: anthropicKeyProblem(),
      model: practiceModel(),
      limitPerHour: PRACTICE_REQUESTS_PER_HOUR,
      statsError,
    },
  }
}
