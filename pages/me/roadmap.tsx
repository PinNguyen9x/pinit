import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { LANE_META, LANE_ORDER } from '@/components/me/lane-meta'
import { MilestoneCard, TopicInfo } from '@/components/me/milestone-card'
import { ProgressRing } from '@/components/me/progress-ring'
import { requireOwner } from '@/utils/owner-auth'
import { readPracticeStats } from '@/utils/practice'
import { practiceStreak, vnDay } from '@/utils/practice-insights'
import { listTopics, loadRoadmap } from '@/utils/private-content'
import {
  checkedCount,
  Lane,
  laneProgress,
  Milestone,
  monthsUntil,
  RoadmapState,
} from '@/utils/private-content-schema'
import { readRoadmapState } from '@/utils/roadmap-state'
import { Alert, Box, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface RoadmapPageProps {
  milestones: Milestone[]
  state: RoadmapState
  topics: Record<string, TopicInfo>
  errors: string[]
  missing: boolean
  now: string // YYYY-MM theo giờ VN, tính ở server để không lệch khi hydrate
  streak: number
}

function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} mt={0.5} noWrap>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {sub}
        </Typography>
      )}
    </Box>
  )
}

function LaneSection({
  lane,
  items,
  state,
  topics,
  now,
}: {
  lane: Lane
  items: Milestone[]
  state: RoadmapState
  topics: Record<string, TopicInfo>
  now: string
}) {
  const meta = LANE_META[lane]
  const { done, total, percent } = laneProgress(items, state)
  return (
    <Box component="section" mb={6}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <ProgressRing value={percent} color={meta.color} />
        <Box flexGrow={1}>
          <Typography component="h2" variant="h6">
            {meta.icon} {meta.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {done}/{total} milestone xong · {Math.round(percent)}% tính cả checklist
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={1.5}>
        {items.map((m) => (
          <MilestoneCard
            key={m.id}
            m={m}
            initialChecked={Object.keys(state[m.id] ?? {})}
            topics={topics}
            now={now}
            accent={meta.color}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default function RoadmapPage({
  milestones,
  state,
  topics,
  errors,
  missing,
  now,
  streak,
}: RoadmapPageProps) {
  const overall = laneProgress(milestones, state)
  const checklistTotal = milestones.reduce((n, m) => n + m.checklist.length, 0)
  const checklistDone = milestones.reduce((n, m) => n + checkedCount(m, state), 0)
  const next = milestones
    .filter((m) => m.status === 'todo' || m.status === 'doing')
    .sort((a, b) => a.target.localeCompare(b.target))[0]
  const nextIn = next ? monthsUntil(next.target, now) : null

  return (
    <>
      <Head>
        <title>Roadmap</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Roadmap
      </Typography>
      {missing && <Alert severity="info">Chưa có roadmap.yaml trong PRIVATE_CONTENT_DIR.</Alert>}
      <ContentErrors errors={errors} />

      {milestones.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }}
          gap={1.5}
          mb={5}
        >
          <StatTile
            label="Tổng tiến độ"
            value={`${Math.round(overall.percent)}%`}
            sub={`${overall.done}/${overall.total} milestone xong`}
          />
          <StatTile
            label="Checklist"
            value={`${checklistDone}/${checklistTotal}`}
            sub={checklistTotal ? 'ý đã nắm' : 'chưa có checklist'}
          />
          <StatTile
            label="Chuỗi luyện"
            value={streak ? `🔥 ${streak} ngày` : '—'}
            sub={streak ? 'liên tiếp có chấm điểm' : 'luyện hôm nay để bắt đầu'}
          />
          <StatTile
            label="Mốc kế tiếp"
            value={
              next ? (
                <Link href={`#${next.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {next.target}
                </Link>
              ) : (
                '—'
              )
            }
            sub={
              next
                ? `${nextIn! < 0 ? 'quá hạn' : nextIn === 0 ? 'tháng này' : `còn ${nextIn} tháng`} · ${next.title}`
                : 'không còn mục nào'
            }
          />
        </Box>
      )}

      {LANE_ORDER.map((lane) => {
        const items = milestones.filter((m) => m.lane === lane)
        return items.length ? (
          <LaneSection
            key={lane}
            lane={lane}
            items={items}
            state={state}
            topics={topics}
            now={now}
          />
        ) : null
      })}
    </>
  )
}

RoadmapPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<RoadmapPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied

  const [roadmap, stateResult, learn, stats] = await Promise.all([
    loadRoadmap(),
    readRoadmapState(),
    listTopics(),
    // Log hỏng không đáng làm sập roadmap — thiếu điểm thì hiện "Chưa luyện".
    readPracticeStats().catch(() => null),
  ])

  const scores = new Map(stats?.byTopic.map((t) => [t.topic, t]) ?? [])
  const topics: Record<string, TopicInfo> = {}
  for (const t of learn.data) {
    const s = scores.get(t.slug)
    topics[t.slug] = { title: t.title, average: s?.average ?? null, count: s?.count ?? 0 }
  }

  const today = vnDay(Date.now())
  const errors = [...(roadmap?.errors ?? [])]
  if (stateResult.error) errors.push(stateResult.error)

  return {
    props: {
      milestones: roadmap?.data ?? [],
      state: stateResult.state,
      topics,
      errors,
      missing: roadmap == null,
      now: today.slice(0, 7),
      streak: practiceStreak(stats?.activeDays ?? [], today),
    },
  }
}
