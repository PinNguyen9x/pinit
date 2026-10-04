import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { TagList } from '@/components/me/tag-list'
import { requireOwner } from '@/utils/owner-auth'
import { listTopics } from '@/utils/private-content'
import type { TopicSummary } from '@/utils/private-content-schema'
import { Alert, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface LearnPageProps {
  topics: TopicSummary[]
  errors: string[]
}

export default function LearnPage({ topics, errors }: LearnPageProps) {
  return (
    <>
      <Head>
        <title>Learn</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Learn
      </Typography>
      <ContentErrors errors={errors} />
      {!topics.length && !errors.length && (
        <Alert severity="info">Chưa có topic nào trong learn/.</Alert>
      )}
      <Stack spacing={2}>
        {topics.map((t) => (
          <Card key={t.slug} variant="outlined">
            <CardActionArea component={Link} href={`/me/learn/${t.slug}`}>
              <CardContent>
                <Typography variant="h6">{t.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {t.noteCount} note · {t.questions.length} câu hỏi ở tổng quan
                  {t.updated && ` · cập nhật ${t.updated}`}
                </Typography>
                <TagList tags={t.tags} />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </>
  )
}

LearnPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<LearnPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const { data, errors } = await listTopics()
  return { props: { topics: data, errors } }
}
