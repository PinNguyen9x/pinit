import { NoDataFound } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { WorkDetailSkeleton } from '@/components/work'
import { useAuth, useRenderTagIcon } from '@/hooks'
import { Work } from '@/models'
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Tooltip,
  Typography,
  Zoom,
  useTheme,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { MdArrowForward, MdCheckCircle, MdEdit, MdLaunch } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'
import sanitizeHtml from 'sanitize-html'

export interface WorkDetailsProps {
  work: Work
}

interface LayerCardProps {
  title: string
  items: string[]
  index: number
  isLast: boolean
}

function LayerCard({ title, items, index, isLast }: LayerCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 2.5, md: 3 },
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'border-color 0.2s, background-color 0.2s',
        '&:hover': {
          borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {title}
        </Typography>
      </Stack>
      <Stack spacing={0.75} pl={0.5}>
        {items.map((item) => (
          <Stack key={item} direction="row" alignItems="center" spacing={1.25}>
            <MdCheckCircle size={16} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {!isLast && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: -18,
            transform: 'translateX(-50%) rotate(90deg)',
            color: theme.palette.primary.main,
            display: 'flex',
          }}
        >
          <MdArrowForward size={20} />
        </Box>
      )}
    </Box>
  )
}

export default function WorkDetails({ work }: WorkDetailsProps) {
  const [hoveredTag, setHoveredTag] = useState<number | null>(null)
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const techStack = useRenderTagIcon(work?.tagList || [])

  if (router.isFallback) return <WorkDetailSkeleton />
  if (!work) return <NoDataFound />

  const layers = [
    { title: 'Frontend Layer', items: work.frontEndTagList || [] },
    { title: 'API Layer', items: work.backEndTagList || [] },
    { title: 'Data Layer', items: work.dbTagList || [] },
  ].filter((l) => Array.isArray(l.items) && l.items.length > 0)

  const sectionHeading = {
    position: 'relative',
    pl: 1.5,
    fontWeight: 700,
    fontSize: { xs: '1.15rem', md: '1.3rem' },
    mb: 3,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '0.15em',
      bottom: '0.15em',
      width: '3px',
      bgcolor: 'primary.main',
      borderRadius: '2px',
    },
  } as const

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 12 } }}>
      <Box mb={4}>
        <Link href="/works" style={{ textDecoration: 'none' }}>
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
              Back to Works
            </Typography>
          </Stack>
        </Link>
      </Box>

      <Typography
        component="h1"
        fontWeight={800}
        letterSpacing="-0.03em"
        lineHeight={1.2}
        mb={2}
        sx={{ fontSize: { xs: '1.85rem', md: '2.5rem' } }}
      >
        {work.title}
      </Typography>

      <Box
        sx={{
          color: 'text.secondary',
          fontSize: '1.0625rem',
          lineHeight: 1.8,
          mb: 6,
          '& strong': { color: 'text.primary', fontWeight: 700 },
          '& em': { color: 'text.primary' },
          '& p': { m: 0, mb: '1em' },
        }}
        dangerouslySetInnerHTML={{ __html: work.fullDescription }}
      />

      {layers.length > 0 && (
        <Box mb={6}>
          <Typography component="h2" sx={sectionHeading}>
            Architecture Flow
          </Typography>
          <Stack spacing={{ xs: 4, md: 4.5 }}>
            {layers.map((layer, i) => (
              <LayerCard
                key={layer.title}
                title={layer.title}
                items={layer.items}
                index={i}
                isLast={i === layers.length - 1}
              />
            ))}
          </Stack>
        </Box>
      )}

      {techStack.length > 0 && (
        <Box mb={6}>
          <Typography component="h2" sx={sectionHeading}>
            Technical Stack
          </Typography>
          <Grid container spacing={1.25}>
            {techStack.map((tech, index) => {
              const hovered = hoveredTag === index
              return (
                <Grid item key={tech.name}>
                  <Tooltip title={tech.name} TransitionComponent={Zoom} arrow placement="top">
                    <Box
                      onMouseEnter={() => setHoveredTag(index)}
                      onMouseLeave={() => setHoveredTag(null)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: '999px',
                        bgcolor: hovered
                          ? isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.05)'
                          : 'transparent',
                        color: hovered ? tech.color : 'text.primary',
                        border: `1px solid ${hovered ? tech.color : theme.palette.divider}`,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${tech.name} technology`}
                    >
                      {tech.icon}
                      <Typography variant="body2" fontWeight={500} fontSize="0.825rem">
                        {tech.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          pt: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
          rowGap: 1.5,
        }}
      >
        {work?.linkDemo && (
          <Button
            component="a"
            href={work.linkDemo}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<MdLaunch />}
            sx={{ borderRadius: '8px', px: 2.5, py: 1, fontWeight: 600, textTransform: 'none' }}
            aria-label="View project demo"
          >
            View Demo
          </Button>
        )}

        {work?.linkSource && (
          <Button
            component="a"
            href={work.linkSource}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<FaGithub />}
            sx={{
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              },
            }}
            aria-label="View source code on GitHub"
          >
            Source Code
          </Button>
        )}

        {isLoggedIn && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<MdEdit />}
            onClick={() => router.push(`/works/${work.id}`)}
            sx={{ borderRadius: '8px', px: 2.5, py: 1, fontWeight: 600, textTransform: 'none' }}
            aria-label="Edit project details"
          >
            Edit Project
          </Button>
        )}
      </Stack>
    </Container>
  )
}

WorkDetails.Layout = MainLayout

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('\nGET STATIC PATHS')
  const response = await fetch(
    `${process.env.API_URL ?? 'https://json-server-blog.vercel.app'}/api/works?_page=1&_limit=10`,
  )
  const data = await response.json()

  return {
    paths: data.data.map((work: Work) => ({ params: { workId: work.id } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<WorkDetailsProps> = async (
  context: GetStaticPropsContext,
) => {
  const workId = context.params?.workId
  console.log('\nGET STATIC PROPS', context.params?.workId)
  const response = await fetch(
    `${process.env.API_URL ?? 'https://json-server-blog.vercel.app'}/api/works/${workId}`,
  )
  const data = await response.json()
  data.fullDescription = sanitizeHtml(data.fullDescription, {
    allowedAttributes: {
      span: ['style', 'class'],
    },
  })
  return {
    props: {
      work: data,
    },
  }
}
