import { scoreBand } from '@/utils/practice-insights'
import {
  Milestone,
  MilestoneStatus,
  milestoneProgress,
  monthsUntil,
} from '@/utils/private-content-schema'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MdExpandMore, MdOutlineMenuBook, MdPlayArrow } from 'react-icons/md'
import { ProgressBar } from './progress-ring'

export interface TopicInfo {
  title: string
  average: number | null // điểm practice trung bình, null = chưa luyện
  count: number
}

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  todo: 'Chưa bắt đầu',
  doing: 'Đang làm',
  done: 'Xong',
  dropped: 'Đã bỏ',
}

function DeadlineChip({ m, now }: { m: Milestone; now: string }) {
  if (m.status === 'done' || m.status === 'dropped') {
    return (
      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
        {m.target}
      </Typography>
    )
  }
  const n = monthsUntil(m.target, now)
  const [label, color] =
    n < 0
      ? [`Quá hạn ${-n} tháng`, 'error' as const]
      : n === 0
        ? ['Tháng này', 'warning' as const]
        : [`Còn ${n} tháng`, n <= 2 ? ('warning' as const) : ('default' as const)]
  return <Chip size="small" variant="outlined" color={color} label={`${m.target} · ${label}`} />
}

export function MilestoneCard({
  m,
  initialChecked,
  topics,
  now,
  accent,
}: {
  m: Milestone
  initialChecked: string[]
  topics: Record<string, TopicInfo>
  now: string // YYYY-MM, tính ở server để không lệch khi hydrate
  accent: string
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked))
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState('')
  const hasDetails = !!(m.notes || m.links.length || m.checklist.length || m.topics.length)
  const [open, setOpen] = useState(m.status === 'doing')

  // Link từ /me/learn/[topic] trỏ về #<id>: mở sẵn đúng milestone đó.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#${m.id}`) setOpen(true)
  }, [m.id])

  const progress = milestoneProgress(m, {
    [m.id]: Object.fromEntries(Array.from(checked, (id) => [id, true as const])),
  })

  async function toggle(id: string, done: boolean) {
    setPending(id)
    setError('')
    const next = new Set(checked)
    if (done) next.add(id)
    else next.delete(id)
    setChecked(next) // lạc quan — hỏng thì trả lại
    const res = await fetch('/api/me/roadmap/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId: m.id, checklistId: id, done }),
    }).catch(() => null)
    setPending(null)
    if (!res?.ok) {
      setChecked(checked)
      const json = await res?.json().catch(() => null)
      setError(
        res?.status === 401
          ? 'Phiên đã hết hạn — đăng nhập lại.'
          : (json?.message ?? 'Không lưu được.'),
      )
    }
  }

  const dropped = m.status === 'dropped'
  return (
    <Box
      id={m.id}
      sx={{
        scrollMarginTop: 96,
        border: 1,
        borderColor: 'divider',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 2,
        p: 2,
        opacity: dropped ? 0.55 : 1,
        transition: 'border-color 150ms, background-color 150ms',
        '&:target': { bgcolor: 'action.hover' },
        '&:hover': { borderColor: accent },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          label={STATUS_LABEL[m.status]}
          color={m.status === 'done' ? 'success' : m.status === 'doing' ? 'primary' : 'default'}
          variant={m.status === 'todo' || dropped ? 'outlined' : 'filled'}
        />
        <Typography
          fontWeight={600}
          sx={{ flexGrow: 1, minWidth: 200, textDecoration: dropped ? 'line-through' : 'none' }}
        >
          {m.title}
        </Typography>
        <DeadlineChip m={m} now={now} />
        {hasDetails && (
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Thu gọn' : 'Mở rộng'}
            aria-expanded={open}
            sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
          >
            <MdExpandMore />
          </IconButton>
        )}
      </Stack>

      {m.checklist.length > 0 && m.status !== 'done' && (
        <Stack direction="row" alignItems="center" spacing={1.5} mt={1.5}>
          <Box flexGrow={1}>
            <ProgressBar value={progress * 100} color={accent} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {checked.size}/{m.checklist.length} ý
          </Typography>
        </Stack>
      )}

      <Collapse in={open} unmountOnExit>
        <Box mt={2}>
          {m.notes && (
            <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap" mb={1.5}>
              {m.notes}
            </Typography>
          )}

          {m.checklist.length > 0 && (
            <Box mb={1.5}>
              <Typography variant="overline" color="text.secondary">
                Cần nắm / giải được
              </Typography>
              <Stack>
                {m.checklist.map((c) => (
                  <FormControlLabel
                    key={c.id}
                    disabled={pending === c.id || dropped}
                    control={
                      <Checkbox
                        size="small"
                        checked={checked.has(c.id)}
                        onChange={(e) => toggle(c.id, e.target.checked)}
                        sx={{ '&.Mui-checked': { color: accent } }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: checked.has(c.id) ? 'line-through' : 'none',
                          color: checked.has(c.id) ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {c.text}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {m.topics.length > 0 && (
            <Box mb={1.5}>
              <Typography variant="overline" color="text.secondary">
                Topic ôn luyện
              </Typography>
              <Stack spacing={1} mt={0.5}>
                {m.topics.map((slug) => {
                  const t = topics[slug]
                  const band = t?.average != null ? scoreBand(t.average) : null
                  return (
                    <Stack
                      key={slug}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover' }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                        {t?.title ?? slug}
                      </Typography>
                      {band ? (
                        <Chip
                          size="small"
                          color={band.tone}
                          variant="outlined"
                          label={`${t!.average}/10 · ${t!.count} lần`}
                        />
                      ) : (
                        <Chip size="small" variant="outlined" label="Chưa luyện" />
                      )}
                      <Button
                        size="small"
                        component={Link}
                        href={`/me/learn/${slug}`}
                        startIcon={<MdOutlineMenuBook />}
                        color="inherit"
                      >
                        Notes
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        component={Link}
                        href={`/me/practice?topic=${slug}`}
                        startIcon={<MdPlayArrow />}
                      >
                        Luyện {t?.title ?? slug}
                      </Button>
                    </Stack>
                  )
                })}
              </Stack>
            </Box>
          )}

          {m.links.length > 0 && (
            <Stack component="ul" sx={{ m: 0, pl: 2.5 }}>
              {m.links.map((href) => (
                <li key={href}>
                  <MuiLink href={href} target="_blank" rel="noopener noreferrer" variant="body2">
                    {href}
                  </MuiLink>
                </li>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
