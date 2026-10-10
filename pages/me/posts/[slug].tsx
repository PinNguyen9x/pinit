import { OwnerLayout } from '@/components/layouts/owner'
import { Breadcrumbs } from '@/components/me/breadcrumbs'
import { ContentErrors } from '@/components/me/content-errors'
import { MarkdownBody } from '@/components/me/markdown-body'
import { TagList } from '@/components/me/tag-list'
import { VisibilityChip } from '@/components/me/visibility-chip'
import { renderMarkdown } from '@/utils/markdown'
import { requireOwner } from '@/utils/owner-auth'
import { loadPost } from '@/utils/private-content'
import type { PostMeta } from '@/utils/private-content-schema'
import { Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'

interface PostPageProps {
  meta: PostMeta
  html: string
  errors: string[]
}

export default function PostPage({ meta, html, errors }: PostPageProps) {
  const date = new Date(meta.date)
  const shown = Number.isNaN(date.getTime()) ? meta.date : date.toISOString().slice(0, 10)
  return (
    <>
      <Head>
        <title>{meta.title}</title>
      </Head>
      <Breadcrumbs items={[{ href: '/me/posts', label: 'Bài viết' }, { label: meta.title }]} />
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
        <Typography component="h1" variant="h4">
          {meta.title}
        </Typography>
        <VisibilityChip visibility={meta.visibility} />
      </Stack>
      <Typography color="text.secondary" mb={1}>
        {shown}
        {meta.author && ` · ${meta.author}`}
      </Typography>
      <TagList tags={meta.tags} />
      <ContentErrors errors={errors} />
      {/* Cùng pipeline với blog public: mermaid đã thành SVG ở server, prism đã
          tô màu, nút copy code do MarkdownBody gắn. Không tải renderer nào ở client. */}
      <MarkdownBody html={html} resetKey={meta.slug} />
    </>
  )
}

PostPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<PostPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const result = await loadPost(ctx.params?.slug)
  if (!result?.data) return { notFound: true }
  const { body, ...meta } = result.data
  const { html } = await renderMarkdown(body)
  return { props: { meta, html, errors: result.errors } }
}
