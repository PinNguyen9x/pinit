import { OwnerLayout } from '@/components/layouts/owner'
import { Breadcrumbs } from '@/components/me/breadcrumbs'
import { ContentErrors } from '@/components/me/content-errors'
import { MarkdownBody } from '@/components/me/markdown-body'
import { QuestionList } from '@/components/me/question-list'
import { TagList } from '@/components/me/tag-list'
import { renderMarkdown } from '@/utils/markdown'
import { requireOwner } from '@/utils/owner-auth'
import { loadRoadmap, loadTopic } from '@/utils/private-content'
import type { NoteMeta } from '@/utils/private-content-schema'
import { LANE_META } from '@/components/me/lane-meta'
import type { Lane } from '@/utils/private-content-schema'
import {
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { MdPlayArrow } from 'react-icons/md'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface TopicPageProps {
  topic: NoteMeta
  html: string
  notes: NoteMeta[]
  milestones: { id: string; title: string; lane: Lane; target: string; status: string }[]
  errors: string[]
}

export default function TopicPage({ topic, html, notes, milestones, errors }: TopicPageProps) {
  return (
    <>
      <Head>
        <title>{topic.title}</title>
      </Head>
      <Breadcrumbs items={[{ href: '/me/learn', label: 'Learn' }, { label: topic.title }]} />
      <Typography component="h1" variant="h4" mb={1}>
        {topic.title}
      </Typography>
      <TagList tags={topic.tags} />
      <Button
        variant="contained"
        size="small"
        component={Link}
        href={`/me/practice?topic=${topic.slug}`}
        startIcon={<MdPlayArrow />}
        sx={{ mt: 2 }}
      >
        Luyện topic này
      </Button>

      {milestones.length > 0 && (
        <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Thuộc milestone
          </Typography>
          <Stack spacing={1} mt={0.5}>
            {milestones.map((m) => (
              <Stack
                key={m.id}
                direction="row"
                spacing={1}
                alignItems="center"
                component={Link}
                // Neo đúng milestone — trang roadmap tự mở rộng thẻ có id trùng hash.
                href={`/me/roadmap#${m.id}`}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  p: 1,
                  borderRadius: 1.5,
                  borderLeft: `3px solid ${LANE_META[m.lane].color}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                  {LANE_META[m.lane].icon} {m.title}
                </Typography>
                <Chip size="small" variant="outlined" label={`${m.target} · ${m.status}`} />
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
      <ContentErrors errors={errors} />
      <MarkdownBody html={html} resetKey={topic.slug} />

      {notes.length > 0 && (
        <>
          <Typography component="h2" variant="h6" mt={6} mb={1}>
            Notes ({notes.length})
          </Typography>
          <List disablePadding>
            {notes.map((n) => (
              <ListItemButton
                key={n.slug}
                component={Link}
                href={`/me/learn/${topic.slug}/${n.slug}`}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={[`${n.questions.length} câu hỏi`, n.updated]
                    .filter(Boolean)
                    .join(' · ')}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      <QuestionList questions={topic.questions} />
    </>
  )
}

TopicPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<TopicPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const result = await loadTopic(ctx.params?.topic)
  if (!result) return { notFound: true }
  const { body, ...topic } = result.data.index
  const [{ html }, roadmap] = await Promise.all([renderMarkdown(body), loadRoadmap()])
  const milestones = (roadmap?.data ?? [])
    .filter((m) => m.topics.includes(topic.slug))
    .map(({ id, title, lane, target, status }) => ({ id, title, lane, target, status }))
  return { props: { topic, html, notes: result.data.notes, milestones, errors: result.errors } }
}
