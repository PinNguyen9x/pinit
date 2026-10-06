import { CardStatus, Rating, RATING_LABEL, RATINGS } from '@/utils/flashcard-schedule'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProgressBar } from './progress-ring'

export interface DeckCard {
  index: number
  q: string
  a: string
  source: string
  status: CardStatus
  due: string | null
}

const RATING_COLOR: Record<Rating, 'error' | 'warning' | 'success'> = {
  forgot: 'error',
  fuzzy: 'warning',
  remember: 'success',
}

const STATUS_LABEL: Record<CardStatus, string> = {
  due: 'Đến hạn',
  new: 'Mới',
  later: 'Chưa tới hạn',
}

/**
 * Flashcard từ questions[] của topic. Lượt ôn mặc định = thẻ đến hạn + thẻ mới;
 * hết thì cho ôn thêm cả thẻ chưa tới hạn. Câu hỏi/đáp án là nội dung owner tự
 * viết — vẫn render text thuần (pre-wrap), không qua pipeline markdown.
 */
export function FlashcardDeck({ topic, cards }: { topic: string; cards: DeckCard[] }) {
  const initialQueue = useMemo(() => cards.filter((c) => c.status !== 'later'), [cards])
  const [queue, setQueue] = useState<DeckCard[]>(initialQueue)
  const [pos, setPos] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [tally, setTally] = useState<Record<Rating, number>>({ forgot: 0, fuzzy: 0, remember: 0 })

  const card = queue[pos]
  const done = pos >= queue.length

  const rate = useCallback(
    async (rating: Rating) => {
      if (!card || busy) return
      setBusy(true)
      setError('')
      const res = await fetch('/api/me/flashcard/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, index: card.index, rating }),
      }).catch(() => null)
      setBusy(false)
      if (!res?.ok) {
        const json = await res?.json().catch(() => null)
        setError(
          res?.status === 401
            ? 'Phiên đã hết hạn — đăng nhập lại.'
            : (json?.message ?? 'Không lưu được.'),
        )
        return
      }
      setTally((t) => ({ ...t, [rating]: t[rating] + 1 }))
      setRevealed(false)
      setPos((p) => p + 1)
    },
    [busy, card, topic],
  )

  // Phím tắt trên desktop: Space lộ đáp án, 1/2/3 đánh giá.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done || (e.target as HTMLElement)?.closest('input, textarea')) return
      if (e.key === ' ' && !revealed) {
        e.preventDefault()
        setRevealed(true)
      } else if (revealed && ['1', '2', '3'].includes(e.key)) {
        rate(RATINGS[Number(e.key) - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, rate, revealed])

  if (!cards.length) {
    return <Alert severity="info">Topic này chưa có câu hỏi trong frontmatter (questions[]).</Alert>
  }

  if (!queue.length || done) {
    const reviewed = tally.forgot + tally.fuzzy + tally.remember
    const later = cards.filter((c) => c.status === 'later')
    return (
      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" mb={1}>
          {reviewed ? `Xong ${reviewed} thẻ 🎉` : 'Không có thẻ đến hạn hôm nay ✨'}
        </Typography>
        {reviewed > 0 && (
          <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
            {RATINGS.map((r) => (
              <Chip
                key={r}
                size="small"
                color={RATING_COLOR[r]}
                variant="outlined"
                label={`${RATING_LABEL[r]}: ${tally[r]}`}
              />
            ))}
          </Stack>
        )}
        {later.length > 0 && (
          <Button
            variant="outlined"
            onClick={() => {
              setQueue(later)
              setPos(0)
            }}
          >
            Ôn thêm {later.length} thẻ chưa tới hạn
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
        <Box flexGrow={1}>
          <ProgressBar value={(pos / queue.length) * 100} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {pos + 1}/{queue.length}
        </Typography>
      </Stack>

      <Box
        key={`${card.index}-${pos}`}
        sx={{
          border: 1,
          borderColor: revealed ? 'primary.main' : 'divider',
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          minHeight: { xs: 220, sm: 240 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'border-color 200ms',
          '@keyframes card-in': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'none' },
          },
          animation: 'card-in 220ms ease-out',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label={STATUS_LABEL[card.status]}
            color={card.status === 'due' ? 'warning' : 'default'}
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary" noWrap>
            {card.source}
          </Typography>
        </Stack>
        <Typography
          variant="h6"
          fontWeight={600}
          whiteSpace="pre-wrap"
          sx={{ fontSize: { xs: '1.05rem', sm: '1.2rem' } }}
        >
          {card.q}
        </Typography>

        {revealed ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              '@keyframes reveal': { from: { opacity: 0 }, to: { opacity: 1 } },
              animation: 'reveal 200ms ease-out',
            }}
          >
            <Typography whiteSpace="pre-wrap">{card.a}</Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={() => setRevealed(true)}
            sx={{ mt: 'auto' }}
          >
            Lộ đáp án
          </Button>
        )}

        {revealed && (
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} mt="auto">
            {RATINGS.map((r, i) => (
              <Button
                key={r}
                size="large"
                variant="outlined"
                color={RATING_COLOR[r]}
                disabled={busy}
                onClick={() => rate(r)}
              >
                {RATING_LABEL[r]}
                <Box
                  component="span"
                  sx={{
                    display: { xs: 'none', sm: 'inline' },
                    ml: 0.75,
                    opacity: 0.6,
                    fontSize: '0.75em',
                  }}
                >
                  {i + 1}
                </Box>
              </Button>
            ))}
          </Box>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        display={{ xs: 'none', sm: 'block' }}
        mt={1}
      >
        Space: lộ đáp án · 1/2/3: Quên / Mơ hồ / Nhớ
      </Typography>
    </Box>
  )
}
