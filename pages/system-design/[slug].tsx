import { BackgroundFx, Seo } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import {
  FlashcardDeck,
  LessonSectionView,
  MockPractice,
  useSystemDesignTokens,
} from '@/components/system-design'
import { LESSONS } from '@/constants/system-design'
import { useLessonProgress } from '@/hooks'
import { Lesson } from '@/models/system-design'
import { renderDiagram } from '@/utils/diagram'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'

export interface LessonPageProps {
  lesson: Lesson
  prev: Pick<Lesson, 'slug' | 'title'> | null
  next: Pick<Lesson, 'slug' | 'title'> | null
}

export default function LessonPage({ lesson, prev, next }: LessonPageProps) {
  const { accent, line, chipBg } = useSystemDesignTokens()
  const { isCompleted, toggle, hydrated } = useLessonProgress()

  const completed = hydrated && isCompleted(lesson.slug)

  return (
    <Box>
      <Seo
        data={{
          title: `${lesson.title} | System Design | Pin Nguyen`,
          description: lesson.summary,
          thumbnailUrl: 'https://pinit-ten.vercel.app/favicon.ico',
          url: `https://pinit-ten.vercel.app/system-design/${lesson.slug}`,
        }}
      />
      <BackgroundFx parallax={false} />

      <Container maxWidth="md">
        <Box sx={{ pt: { xs: 6, md: 9 } }}>
          <Box
            component={Link}
            href="/system-design"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              fontSize: '0.84rem',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Lộ trình 13 buổi
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip label={`Buổi ${lesson.order}`} size="small" sx={{ bgcolor: chipBg }} />
            <Chip label={lesson.track} size="small" sx={{ bgcolor: chipBg }} />
            <Typography variant="caption" color="text.secondary">
              {lesson.readingMinutes} phút đọc
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              mt: 2,
              fontWeight: 800,
              fontSize: { xs: '1.9rem', md: '2.4rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {lesson.title}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
            {lesson.summary}
          </Typography>
        </Box>

        <Box sx={{ mt: 6 }}>
          {lesson.sections.length === 0 ? (
            <Box
              sx={{
                p: 3,
                border: '1px dashed',
                borderColor: line,
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography color="text.secondary">
                Nội dung buổi này đang được biên soạn.
              </Typography>
            </Box>
          ) : (
            lesson.sections.map((section, index) => (
              <LessonSectionView key={index} section={section} />
            ))
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            mt: 5,
            p: 2,
            borderRadius: 2,
            borderLeft: '3px solid',
            borderColor: accent,
            bgcolor: chipBg,
          }}
        >
          <Typography sx={{ lineHeight: 1.7 }}>
            <strong>Chốt lại:</strong> {lesson.keyTakeaway}
          </Typography>
        </Stack>

        {/* Buổi tự luyện: khung thời gian và bộ đề, thay cho một bài giảng. */}
        {lesson.mockPrompts && <MockPractice prompts={lesson.mockPrompts} />}

        <FlashcardDeck cards={lesson.flashcards} />

        <Box sx={{ mt: 6 }}>
          <Button
            variant={completed ? 'contained' : 'outlined'}
            startIcon={completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
            onClick={() => toggle(lesson.slug)}
            aria-pressed={completed}
          >
            {completed ? 'Đã ôn xong buổi này' : 'Đánh dấu đã ôn xong'}
          </Button>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 5, pb: 8 }}
          justifyContent="space-between"
        >
          {prev ? (
            <Box
              component={Link}
              href={`/system-design/${prev.slug}`}
              sx={{
                flex: 1,
                p: 2,
                border: '1px solid',
                borderColor: line,
                borderRadius: 2,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { borderColor: accent },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <ArrowBackIcon sx={{ fontSize: 12 }} /> Buổi trước
              </Typography>
              <Typography fontWeight={600} sx={{ lineHeight: 1.5 }}>
                {prev.title}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}

          {next ? (
            <Box
              component={Link}
              href={`/system-design/${next.slug}`}
              sx={{
                flex: 1,
                p: 2,
                border: '1px solid',
                borderColor: line,
                borderRadius: 2,
                textDecoration: 'none',
                color: 'inherit',
                textAlign: { sm: 'right' },
                '&:hover': { borderColor: accent },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Buổi sau <ArrowForwardIcon sx={{ fontSize: 12 }} />
              </Typography>
              <Typography fontWeight={600} sx={{ lineHeight: 1.5 }}>
                {next.title}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
        </Stack>
      </Container>
    </Box>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LESSONS.map((lesson) => ({ params: { slug: lesson.slug } })),
  // Slug lạ trả 404 thay vì dựng trang rỗng.
  fallback: false,
})

export const getStaticProps: GetStaticProps<LessonPageProps> = async ({ params }) => {
  const ordered = [...LESSONS].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((lesson) => lesson.slug === params?.slug)
  if (index === -1) return { notFound: true }

  const toNav = (lesson?: Lesson) => (lesson ? { slug: lesson.slug, title: lesson.title } : null)

  // Dựng sơ đồ ở đây chứ không trong constants/system-design.ts: file constants
  // bị component phía client import, kéo renderer vào là kéo cả 575 KB gzip
  // xuống trình duyệt.
  const lesson = ordered[index]
  const withDiagrams: Lesson = {
    ...lesson,
    sections: lesson.sections.map((section) =>
      section.diagram ? { ...section, diagramSvg: renderDiagram(section.diagram) } : section,
    ),
  }

  return {
    props: {
      lesson: withDiagrams,
      prev: toNav(ordered[index - 1]),
      next: toNav(ordered[index + 1]),
    },
  }
}

LessonPage.Layout = MainLayout
