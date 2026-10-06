import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { STATUS_COLOR, TopicCard } from '@/components/me/topic-card'
import type { TopicSummaryWithActivity } from '@/utils/activity'
import { loadTopicActivity } from '@/utils/activity'
import { topicStatus, TopicStatusKey } from '@/utils/activity-insights'
import { requireOwner } from '@/utils/owner-auth'
import { Alert, Box, Chip, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'

interface LearnPageProps {
  topics: TopicSummaryWithActivity[]
  errors: string[]
}

const STATUS_ORDER: TopicStatusKey[] = ['weak', 'new', 'ok', 'strong']
const STATUS_NAME: Record<TopicStatusKey, string> = {
  weak: 'Yếu',
  new: 'Chưa luyện',
  ok: 'Ổn',
  strong: 'Vững',
}

/** Cần chú ý nhất lên đầu: nhiều thẻ đến hạn, rồi yếu → chưa luyện → ổn → vững. */
function sortTopics(topics: TopicSummaryWithActivity[]) {
  const rank = (t: TopicSummaryWithActivity) =>
    STATUS_ORDER.indexOf(topicStatus(t.recentAverage).key)
  return [...topics].sort(
    (a, b) =>
      b.cards.due - a.cards.due || rank(a) - rank(b) || a.title.localeCompare(b.title, 'vi'),
  )
}

export default function LearnPage({ topics, errors }: LearnPageProps) {
  const counts = Object.fromEntries(STATUS_ORDER.map((k) => [k, 0])) as Record<
    TopicStatusKey,
    number
  >
  for (const t of topics) counts[topicStatus(t.recentAverage).key]++
  const due = topics.reduce((n, t) => n + t.cards.due, 0)

  return (
    <>
      <Head>
        <title>Learn</title>
      </Head>
      <Typography component="h1" variant="h4" mb={1.5}>
        Learn
      </Typography>
      {topics.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
          {due > 0 && <Chip color="warning" label={`${due} thẻ đến hạn`} />}
          {STATUS_ORDER.filter((k) => counts[k]).map((k) => (
            <Chip
              key={k}
              variant="outlined"
              label={`${STATUS_NAME[k]}: ${counts[k]}`}
              sx={{ borderColor: STATUS_COLOR[k] }}
            />
          ))}
        </Stack>
      )}
      <ContentErrors errors={errors} />
      {!topics.length && !errors.length && (
        <Alert severity="info">Chưa có topic nào trong learn/.</Alert>
      )}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
        {sortTopics(topics).map((t) => (
          <TopicCard key={t.slug} t={t} />
        ))}
      </Box>
    </>
  )
}

LearnPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<LearnPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const { topics, errors } = await loadTopicActivity()
  return { props: { topics, errors } }
}
