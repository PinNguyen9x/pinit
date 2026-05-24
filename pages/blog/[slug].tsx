import { Seo } from '@/components/common'
import { ReadingProgressBar } from '@/components/blog/reading-progress'
import { TableOfContents, TocItem } from '@/components/blog/table-of-contents'
import { MainLayout } from '@/components/layouts'
import { Post } from '@/models'
import { getPostList } from '@/utils/posts'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Avatar, Box, Chip, Container, Grid, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkToc from 'remark-toc'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

// remark-prism emits text nodes with pre-escaped HTML entities (e.g. "&gt;").
// Rehype later escapes the `&`, producing "&amp;gt;" in the output, which the
// browser renders as literal "&gt;". Decode the entities so stringify re-escapes cleanly.
function rehypeDecodePrismEntities() {
  const decode = (s: string) =>
    s.replace(/&(amp|lt|gt|quot|#39|apos|#x27);/g, (_, e) => {
      const map: Record<string, string> = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#39': "'",
        apos: "'",
        '#x27': "'",
      }
      return map[e] ?? _
    })
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'code' && node.tagName !== 'pre') return
      visit(node, 'text', (t: any) => {
        if (typeof t.value === 'string') t.value = decode(t.value)
      })
    })
  }
}

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

  useEffect(() => {
    const articleBody = document.getElementById('article-body')
    if (!articleBody) return
    const preBlocks = articleBody.querySelectorAll<HTMLPreElement>('pre[class*="language-"]')
    preBlocks.forEach((pre) => {
      if (pre.parentElement?.dataset.codeWrapper === 'true') return
      const wrapper = document.createElement('div')
      wrapper.dataset.codeWrapper = 'true'
      wrapper.className = 'code-block-wrapper'
      pre.parentNode?.insertBefore(wrapper, pre)
      wrapper.appendChild(pre)

      const langMatch = pre.className.match(/language-(\w+)/)
      if (langMatch && langMatch[1] !== 'none') {
        const label = document.createElement('span')
        label.className = 'code-lang-label'
        label.textContent = langMatch[1]
        wrapper.appendChild(label)
      }

      const btn = document.createElement('button')
      btn.className = 'code-copy-btn'
      btn.textContent = 'Copy'
      wrapper.appendChild(btn)

      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')
        if (!code) return
        navigator.clipboard.writeText(code.innerText).then(() => {
          btn.textContent = 'Copied!'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = 'Copy'
            btn.classList.remove('copied')
          }, 2000)
        })
      })
    })
  }, [post.htmlContent])

  return (
    <>
      <Seo
        data={{
          title: `${post.title} | Pin Nguyen`,
          description: post.description,
          thumbnailUrl:
            post?.thumbnailUrl ||
            'https://images.unsplash.com/photo-1549923746-c502d488b3ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
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
          <Grid item xs={12} md={8}>
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

            {/* Article body */}
            <Box
              id="article-body"
              dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
              sx={{
                '& h1, & h2, & h3, & h4': {
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mt: '2.25em',
                  mb: '0.75em',
                  lineHeight: 1.3,
                  color: 'text.primary',
                  scrollMarginTop: '80px',
                },
                '& h1': { fontSize: { xs: '1.5rem', md: '1.875rem' } },
                '& h2': {
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  borderLeft: '3px solid #16a34a',
                  pl: '0.75em',
                  mt: '2.5em',
                },
                '& h3': { fontSize: { xs: '1.05rem', md: '1.2rem' } },
                '& h4': { fontSize: '1rem' },
                '& h2 a, & h3 a, & h4 a': {
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                },
                '& p': {
                  lineHeight: 1.9,
                  mb: '1.5em',
                  fontSize: '1.0625rem',
                  color: isDark ? '#c9d1d9' : '#374151',
                },
                '& a:not(h2 a):not(h3 a)': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                },
                '& strong': { fontWeight: 700, color: 'text.primary' },
                '& em': { fontStyle: 'italic' },
                '& ul, & ol': { pl: '1.75em', mb: '1.5em' },
                '& li': {
                  mb: '0.55em',
                  lineHeight: 1.85,
                  fontSize: '1.0625rem',
                  color: isDark ? '#c9d1d9' : '#374151',
                },
                '& li > ul, & li > ol': { mt: '0.5em', mb: 0 },
                '& blockquote': {
                  mx: 0,
                  my: '2em',
                  pl: 3,
                  pr: 2,
                  py: 1.25,
                  borderLeft: '4px solid #16a34a',
                  color: 'text.secondary',
                  bgcolor: isDark ? 'rgba(22,163,74,0.07)' : 'rgba(22,163,74,0.05)',
                  borderRadius: '0 8px 8px 0',
                  '& p': { mb: 0, color: 'inherit', lineHeight: 1.8, fontStyle: 'italic' },
                },
                '& pre': {
                  overflow: 'auto',
                  mb: '0',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                },
                '& code:not(pre > code)': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
                  px: '0.45em',
                  py: '0.2em',
                  borderRadius: '5px',
                  fontSize: '0.875em',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                  color: isDark ? '#e2e8f0' : '#1a202c',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                },
                '& img': {
                  maxWidth: '100%',
                  borderRadius: '10px',
                  my: 2.5,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                },
                '& hr': { my: 5, borderColor: 'divider' },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  mb: '1.75em',
                  display: 'block',
                  overflowX: 'auto',
                },
                '& th': {
                  p: '0.75em 1em',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  textAlign: 'left',
                  fontWeight: 700,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                },
                '& td': {
                  p: '0.75em 1em',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                },
                '& tr:nth-of-type(even) td': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                },
              }}
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
          <Grid item md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
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

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, { heading: 'agenda.*' })
    .use(require('remark-prism'))
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDecodePrismEntities)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(post.mdContent || '')

  const htmlContent = file.toString()
  post.htmlContent = htmlContent

  // Extract TOC from generated HTML (headings h2–h4 with slug IDs)
  const toc: TocItem[] = []
  const tocPattern = /<h([2-4])\s[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[2-4]>/g
  let match
  while ((match = tocPattern.exec(htmlContent)) !== null) {
    toc.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '').trim(),
    })
  }

  // Reading time: average 200 wpm
  const wordCount = (post.mdContent || '').trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return { props: { post, toc, readingTime } }
}
