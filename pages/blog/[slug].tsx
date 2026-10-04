import { Seo } from '@/components/common/seo'
import { ReadingProgressBar } from '@/components/blog/reading-progress'
import { TableOfContents, TocItem } from '@/components/blog/table-of-contents'
import { MainLayout } from '@/components/layouts/main'
import { articleBodySx } from '@/components/blog/article-body'
import { useCodeCopyButtons } from '@/hooks/use-code-copy-buttons'
import { Post } from '@/models'
import { getPostList } from '@/utils/posts'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Avatar, Box, Chip, Container, Grid, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import { renderMarkdown } from '@/utils/markdown'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export interface BlogDetailPageProps {
  post: Post
  toc: TocItem[]
  readingTime: number
}

export default function BlogDetailPage({ post, toc, readingTime }: BlogDetailPageProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const publishedDate = post.publishedDate
    ? format(new Date(post.publishedDate), 'MMMM dd, yyyy')
    : ''

  useCodeCopyButtons('article-body', post.slug)

  return (
    <>
      <Seo
        data={{
          title: `${post.title} | Pin Nguyen`,
          description: post.description,
          // Bìa sinh sẵn trong repo, không trỏ ra ảnh stock ngoài mạng.
          // Seo tự ghép tên miền vì og:image cần URL tuyệt đối.
          thumbnailUrl: post?.thumbnailUrl || '/covers/default.png',
          url: `${process.env.HOST_URL}/blog/${post.slug}`,
        }}
      />

      <ReadingProgressBar />

      <Container maxWidth="lg">
        {/* Back link */}
        <Box pt={{ xs: 4, md: 6 }} mb={5}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                display: 'inline-flex',
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'text.primary' },
                transition: 'color 0.15s',
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 15 }} />
              <Typography variant="body2" fontWeight={500} fontSize="0.875rem">
                Back to Blog
              </Typography>
            </Stack>
          </Link>
        </Box>

        <Grid container spacing={{ md: 6 }}>
          {/* ── Article ── */}
          <Grid item xs={12} md={9}>
            {/* Tags */}
            {post.tagList?.length > 0 && (
              <Stack direction="row" spacing={0.75} mb={2.5} flexWrap="wrap" useFlexGap>
                {post.tagList.slice(0, 5).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      fontSize: '0.68rem',
                      height: 20,
                      bgcolor: isDark ? 'rgba(22,163,74,0.1)' : 'rgba(22,163,74,0.07)',
                      color: '#16a34a',
                      border: '1px solid rgba(22,163,74,0.18)',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Title */}
            <Typography
              component="h1"
              fontWeight={800}
              letterSpacing="-0.03em"
              lineHeight={1.2}
              mb={3}
              sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}
            >
              {post.title}
            </Typography>

            {/* Meta row: author + date + reading time */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
              mb={4}
            >
              {post.author?.avatarUrl ? (
                <Avatar
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  sx={{ width: 36, height: 36 }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {post.author?.name?.[0] ?? 'P'}
                </Avatar>
              )}

              <Box>
                {post.author?.name && (
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {post.author.name}
                  </Typography>
                )}
                {post.author?.title && (
                  <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
                    {post.author.title}
                  </Typography>
                )}
              </Box>

              {publishedDate && (
                <>
                  <Box
                    sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }}
                  />
                  <Typography variant="body2" color="text.secondary" fontSize="0.825rem">
                    {publishedDate}
                  </Typography>
                </>
              )}

              {readingTime > 0 && (
                <>
                  <Box
                    sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }}
                  />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" fontSize="0.825rem">
                      {readingTime} min read
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, mb: 5 }} />

            {/* Hero image */}
            {post.thumbnailUrl && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 200, md: 360 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 6,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 100vw, 700px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            )}

            {/* Mobile TOC — the sidebar rail is desktop-only */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <TableOfContents items={toc} variant="collapsible" />
            </Box>

            {/* Article body */}
            <Box
              id="article-body"
              dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
              sx={articleBodySx(isDark)}
            />
            {/* Article footer */}
            <Box
              sx={{
                mt: 6,
                pt: 4,
                pb: { xs: 8, md: 12 },
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {post.author?.avatarUrl ? (
                  <Avatar
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    sx={{ width: 40, height: 40 }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {post.author?.name?.[0] ?? 'P'}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {post.author?.name ?? 'Pin Nguyen'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {publishedDate && (
                      <Typography variant="caption" color="text.secondary">
                        {publishedDate}
                      </Typography>
                    )}
                    {readingTime > 0 && (
                      <>
                        <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        <Stack direction="row" alignItems="center" spacing={0.4}>
                          <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {readingTime} min read
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Link href="/blog" style={{ textDecoration: 'none' }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
                    '&:hover': {
                      color: 'text.primary',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 14 }} />
                  <Typography variant="body2" fontWeight={500} fontSize="0.875rem">
                    Back to Blog
                  </Typography>
                </Stack>
              </Link>
            </Box>
          </Grid>

          {/* ── TOC sidebar (desktop only) ── */}
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableOfContents items={toc} />
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

BlogDetailPage.Layout = MainLayout

export const getStaticPaths: GetStaticPaths = async () => {
  const postList = await getPostList()
  return {
    paths: postList.map((post: Post) => ({ params: { slug: post.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<BlogDetailPageProps> = async (
  context: GetStaticPropsContext,
) => {
  const slug = context.params?.slug
  if (!slug) return { notFound: true }

  const postList = await getPostList()
  const post = postList.find((x: Post) => x.slug === slug)
  if (!post) return { notFound: true }

  const { html: htmlContent, toc } = await renderMarkdown(post.mdContent || '')
  post.htmlContent = htmlContent

  // Reading time: average 200 wpm
  const wordCount = (post.mdContent || '').trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return { props: { post, toc, readingTime } }
}
