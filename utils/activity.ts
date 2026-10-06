// Gom dữ liệu cho cockpit /me và trang /me/learn. CHỈ CHẠY Ở SERVER.
// Logic tính toán nằm ở ./activity-insights (thuần, có test); file này chỉ đọc
// file và ghép lại để hai trang dùng chung một nguồn số liệu.
import {
  averageBetween,
  countByDay,
  daysUntilTargetEnd,
  HeatCell,
  heatmapWeeks,
  pickToday,
  TodayItem,
  TopicActivity,
  trend,
  upcomingMilestones,
} from './activity-insights'
import { countByStatus } from './flashcard-schedule'
import { readFlashcardDays, readFlashcardState, topicCards } from './flashcards'
import { readPracticeStats } from './practice'
import { practiceStreak, vnDay } from './practice-insights'
import { listTopics, loadRoadmap } from './private-content'
import { readRoadmapState } from './roadmap-state'

/** Số lần chấm gần nhất dùng để xếp trạng thái topic (yếu/ổn/vững). */
export const RECENT_WINDOW = 5

export interface TopicSummaryWithActivity extends TopicActivity {
  tags: string[]
  noteCount: number
  lastDay: string | null
  cards: { total: number; due: number; new: number }
}

export async function loadTopicActivity(today = vnDay(Date.now())) {
  const [topics, stats, cardState] = await Promise.all([
    listTopics(),
    // Log hỏng không đáng làm sập trang — coi như chưa luyện.
    readPracticeStats().catch(() => null),
    readFlashcardState(),
  ])
  const scored = stats?.scored ?? []

  const items: TopicSummaryWithActivity[] = []
  for (const t of topics.data) {
    const mine = scored.filter((e) => e.topic === t.slug)
    const recent = mine.slice(-RECENT_WINDOW)
    const cards = (await topicCards(t.slug)) ?? []
    const counts = countByStatus(
      cards.map((c) => c.key),
      cardState,
      today,
    )
    items.push({
      slug: t.slug,
      title: t.title,
      tags: t.tags,
      noteCount: t.noteCount,
      count: mine.length,
      recentAverage: recent.length
        ? Math.round((recent.reduce((a, e) => a + e.score, 0) / recent.length) * 10) / 10
        : null,
      lastDay: mine.length ? vnDay(mine[mine.length - 1].ts) : null,
      cards: { total: cards.length, due: counts.due, new: counts.new },
    })
  }
  return { topics: items, errors: topics.errors, scored, today }
}

export interface Cockpit {
  today: string
  streak: number
  heatmap: HeatCell[][]
  activeToday: number
  avg7: number | null
  prev7: number | null
  trend: 'up' | 'down' | 'flat' | null
  todayItems: TodayItem[]
  countdown: { id: string; title: string; target: string; status: string; daysLeft: number }[]
  dueCards: number
  topicsCount: number
}

export async function loadCockpit(now = Date.now()): Promise<Cockpit> {
  const today = vnDay(now)
  const [{ topics, scored }, roadmap, roadmapState, flashDays] = await Promise.all([
    loadTopicActivity(today),
    loadRoadmap(),
    readRoadmapState(),
    readFlashcardDays(),
  ])

  // Một "lần luyện" = một lần chấm practice hoặc một lần tự đánh giá flashcard.
  const days = [...scored.map((e) => vnDay(e.ts)), ...flashDays]
  const counts = countByDay(days)
  const entries = scored.map((e) => ({ day: vnDay(e.ts), score: e.score }))
  const avg7 = averageBetween(entries, today, 0, 6)
  const prev7 = averageBetween(entries, today, 7, 13)
  const milestones = roadmap?.data ?? []

  return {
    today,
    streak: practiceStreak(Object.keys(counts), today),
    heatmap: heatmapWeeks(counts, today, 12),
    activeToday: counts[today] ?? 0,
    avg7,
    prev7,
    trend: trend(avg7, prev7),
    todayItems: pickToday(milestones, roadmapState.state, topics),
    countdown: upcomingMilestones(milestones, 2).map((m) => ({
      id: m.id,
      title: m.title,
      target: m.target,
      status: m.status,
      daysLeft: daysUntilTargetEnd(m.target, today),
    })),
    dueCards: topics.reduce((n, t) => n + t.cards.due, 0),
    topicsCount: topics.length,
  }
}
