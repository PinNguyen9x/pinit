import { OwnerLayout } from '@/components/layouts/owner'
import { Breadcrumbs } from '@/components/me/breadcrumbs'
import { ContentErrors } from '@/components/me/content-errors'
import { MarkdownBody } from '@/components/me/markdown-body'
import { QuestionList } from '@/components/me/question-list'
import { TagList } from '@/components/me/tag-list'
import { renderMarkdown } from '@/utils/markdown'
import { requireOwner } from '@/utils/owner-auth'
import { loadTopic } from '@/utils/private-content'
import type { NoteMeta } from '@/utils/private-content-schema'
import { List, ListItemButton, ListItemText, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface TopicPageProps {
  topic: NoteMeta
  html: string
  notes: NoteMeta[]
  errors: string[]
}

export default function TopicPage({ topic, html, notes, errors }: TopicPageProps) {
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
  const { html } = await renderMarkdown(body)
  return { props: { topic, html, notes: result.data.notes, errors: result.errors } }
}
