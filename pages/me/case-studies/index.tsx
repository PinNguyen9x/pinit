import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { TagList } from '@/components/me/tag-list'
import { VisibilityChip } from '@/components/me/visibility-chip'
import { requireOwner } from '@/utils/owner-auth'
import { listCaseStudies } from '@/utils/private-content'
import type { CaseStudyMeta } from '@/utils/private-content-schema'
import { Alert, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface CaseStudiesPageProps {
  items: CaseStudyMeta[]
  errors: string[]
}

export default function CaseStudiesPage({ items, errors }: CaseStudiesPageProps) {
  return (
    <>
      <Head>
        <title>Case studies</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Case studies
      </Typography>
      <ContentErrors errors={errors} />
      {!items.length && !errors.length && (
        <Alert severity="info">Chưa có case study nào trong case-studies/.</Alert>
      )}
      <Stack spacing={2}>
        {items.map((cs) => (
          <Card key={cs.slug} variant="outlined">
            <CardActionArea component={Link} href={`/me/case-studies/${cs.slug}`}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {cs.title}
                  </Typography>
                  <VisibilityChip visibility={cs.visibility} />
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {cs.summary}
                  {cs.updated && ` · ${cs.updated}`}
                </Typography>
                <TagList tags={cs.tags} />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </>
  )
}

CaseStudiesPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<CaseStudiesPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const { data, errors } = await listCaseStudies()
  return { props: { items: data, errors } }
}
