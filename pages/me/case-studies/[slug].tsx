import { OwnerLayout } from '@/components/layouts/owner'
import { Breadcrumbs } from '@/components/me/breadcrumbs'
import { ContentErrors } from '@/components/me/content-errors'
import { DenylistCheck } from '@/components/me/denylist-check'
import { MarkdownBody } from '@/components/me/markdown-body'
import { TagList } from '@/components/me/tag-list'
import { VisibilityChip } from '@/components/me/visibility-chip'
import { renderMarkdown } from '@/utils/markdown'
import { requireOwner } from '@/utils/owner-auth'
import { loadCaseStudy } from '@/utils/private-content'
import type { CaseStudyMeta } from '@/utils/private-content-schema'
import { Box, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'

interface CaseStudyPageProps {
  meta: CaseStudyMeta
  html: string
  errors: string[]
}

export default function CaseStudyPage({ meta, html, errors }: CaseStudyPageProps) {
  return (
    <>
      <Head>
        <title>{meta.title}</title>
      </Head>
      <Breadcrumbs
        items={[{ href: '/me/case-studies', label: 'Case studies' }, { label: meta.title }]}
      />
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
        <Typography component="h1" variant="h4">
          {meta.title}
        </Typography>
        <VisibilityChip visibility={meta.visibility} />
      </Stack>
      <Typography color="text.secondary" mb={1}>
        {meta.summary}
        {meta.updated && ` · cập nhật ${meta.updated}`}
      </Typography>
      <TagList tags={meta.tags} />
      <Box my={3}>
        <DenylistCheck slug={meta.slug} />
      </Box>
      <ContentErrors errors={errors} />
      <MarkdownBody html={html} resetKey={meta.slug} />
    </>
  )
}

CaseStudyPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<CaseStudyPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const result = await loadCaseStudy(ctx.params?.slug)
  if (!result?.data) return { notFound: true }
  const { body, ...meta } = result.data
  const { html } = await renderMarkdown(body)
  return { props: { meta, html, errors: result.errors } }
}
