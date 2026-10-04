import { OwnerLayout } from '@/components/layouts/owner'
import { Breadcrumbs } from '@/components/me/breadcrumbs'
import { ContentErrors } from '@/components/me/content-errors'
import { MarkdownBody } from '@/components/me/markdown-body'
import { QuestionList } from '@/components/me/question-list'
import { TagList } from '@/components/me/tag-list'
import { renderMarkdown } from '@/utils/markdown'
import { requireOwner } from '@/utils/owner-auth'
import { loadNote, loadTopic } from '@/utils/private-content'
import type { NoteMeta } from '@/utils/private-content-schema'
import { Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'

interface NotePageProps {
  topic: { slug: string; title: string }
  note: NoteMeta
  html: string
  errors: string[]
}

export default function NotePage({ topic, note, html, errors }: NotePageProps) {
  return (
    <>
      <Head>
        <title>{note.title}</title>
      </Head>
      <Breadcrumbs
        items={[
          { href: '/me/learn', label: 'Learn' },
          { href: `/me/learn/${topic.slug}`, label: topic.title },
          { label: note.title },
        ]}
      />
      <Typography component="h1" variant="h4" mb={1}>
        {note.title}
      </Typography>
      {note.updated && (
        <Typography variant="body2" color="text.secondary" mb={1}>
          Cập nhật {note.updated}
        </Typography>
      )}
      <TagList tags={note.tags} />
      <ContentErrors errors={errors} />
      <MarkdownBody html={html} resetKey={`${topic.slug}/${note.slug}`} />
      <QuestionList questions={note.questions} />
    </>
  )
}

NotePage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<NotePageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const [topic, result] = await Promise.all([
    loadTopic(ctx.params?.topic),
    loadNote(ctx.params?.topic, ctx.params?.note),
  ])
  if (!topic || !result) return { notFound: true }
  const { body, ...note } = result.data
  const { html } = await renderMarkdown(body)
  return {
    props: {
      topic: { slug: topic.data.index.slug, title: topic.data.index.title },
      note,
      html,
      errors: result.errors,
    },
  }
}
