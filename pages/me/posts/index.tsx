import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { TagList } from '@/components/me/tag-list'
import { VisibilityChip } from '@/components/me/visibility-chip'
import { requireOwner } from '@/utils/owner-auth'
import { listPosts } from '@/utils/private-content'
import type { PostMeta } from '@/utils/private-content-schema'
import { Alert, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface PostsPageProps {
  items: PostMeta[]
  errors: string[]
}

/** Ngày hiện cho người đọc. Giữ ISO trong frontmatter, chỉ đổi lúc render. */
function showDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10)
}

export default function PostsPage({ items, errors }: PostsPageProps) {
  return (
    <>
      <Head>
        <title>Bài viết</title>
      </Head>
      <Typography component="h1" variant="h4" mb={1}>
        Bài viết
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Blog riêng, không có trong site public. Bài nào gắn{' '}
        <i>public-candidate</i> là ứng viên đưa lên <code>blog/</code> sau này.
      </Typography>
      <ContentErrors errors={errors} />
      {!items.length && !errors.length && (
        <Alert severity="info">Chưa có bài nào trong posts/.</Alert>
      )}
      <Stack spacing={2}>
        {items.map((p) => (
          <Card key={p.slug} variant="outlined">
            <CardActionArea component={Link} href={`/me/posts/${p.slug}`}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {p.title}
                  </Typography>
                  <VisibilityChip visibility={p.visibility} />
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {showDate(p.date)}
                  {p.author && ` · ${p.author}`}
                </Typography>
                {p.excerpt && (
                  <Typography variant="body2" mb={1}>
                    {p.excerpt}
                  </Typography>
                )}
                <TagList tags={p.tags} />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </>
  )
}

PostsPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<PostsPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const { data, errors } = await listPosts()
  return { props: { items: data, errors } }
}
