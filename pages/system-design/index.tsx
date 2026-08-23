import { BackgroundFx, Seo } from '@/components/common'
import { MainLayout } from '@/components/layouts/main'
import { LessonCard, RoadmapProgress, useSystemDesignTokens } from '@/components/system-design'
import { LESSONS } from '@/constants/system-design'
import { useLessonProgress } from '@/hooks/use-lesson-progress'
import { NextPageWithLayout } from '@/models'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BoltIcon from '@mui/icons-material/Bolt'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Container, InputBase, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const SystemDesignRoadmap: NextPageWithLayout = () => {
  const [query, setQuery] = useState('')
  const { accent, line, chipBg, cardBg } = useSystemDesignTokens()
  const lessons = useMemo(() => [...LESSONS].sort((a, b) => a.order - b.order), [])
  const slugs = useMemo(() => lessons.map((lesson) => lesson.slug), [lessons])

  const { completedCount, total, percent, hydrated, isCompleted, toggle, reset } =
    useLessonProgress(slugs)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    return lessons.filter((lesson) =>
      [lesson.title, lesson.summary, ...lesson.keywords].some((field) =>
        field.toLowerCase().includes(q),
      ),
    )
  }, [lessons, query])

  return (
    <Box>
      <Seo
        data={{
          title: 'System Design — Lộ trình 13 buổi | Pin Nguyen',
          description:
            'Lộ trình ôn System Design Interview theo 13 buổi: CAP, load balancer, sharding, caching, CDN và các case study TinyURL, YouTube, Uber, Messaging.',
          thumbnailUrl: 'https://pinit-ten.vercel.app/favicon.ico',
          url: 'https://pinit-ten.vercel.app/system-design',
        }}
      />
      <BackgroundFx parallax={false} />

      <Container maxWidth="md" sx={{ '@media (min-width: 900px)': { maxWidth: '1180px' } }}>
        <Box sx={{ textAlign: 'center', pt: { xs: 8, md: 11 }, pb: { xs: 4, md: 4.5 } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.1rem', sm: '2.6rem', md: '3rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
            }}
          >
            System{' '}
            <Box component="span" sx={{ color: accent }}>
              Design
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.75, fontSize: '1rem', lineHeight: 1.7 }}>
            Lộ trình 13 buổi để ôn phỏng vấn thiết kế hệ thống — từ nguyên lý nền tảng đến case
            study thực chiến.
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
            mb: 3,
            border: '1px solid',
            borderColor: line,
            borderRadius: 2,
            bgcolor: cardBg,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary' }} />
          <InputBase
            fullWidth
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm buổi học: sharding, cache, websocket…"
            inputProps={{ 'aria-label': 'Tìm buổi học' }}
          />
        </Stack>

        <RoadmapProgress
          completedCount={completedCount}
          total={total}
          percent={percent}
          hydrated={hydrated}
          onReset={reset}
        />

        <Box
          component={Link}
          href="/system-design/cheat-sheet"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            mb: 3,
            border: '1px solid',
            borderColor: line,
            borderRadius: 2,
            bgcolor: chipBg,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { borderColor: accent },
          }}
        >
          <BoltIcon sx={{ color: accent }} />
          <Box>
            <Typography fontWeight={700}>Cheat sheet ôn gấp</Typography>
            <Typography variant="body2" color="text.secondary">
              Con số cần thuộc, bảng chọn database và khung trả lời — cho hai mươi phút trước giờ
              phỏng vấn.
            </Typography>
          </Box>
        </Box>

        {query.trim() && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filtered.length} / {lessons.length} buổi khớp từ khóa
          </Typography>
        )}

        <Stack spacing={1.5}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">
                Không có buổi nào khớp “{query.trim()}”. Thử xóa bớt từ khóa.
              </Typography>
            </Box>
          ) : (
            filtered.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                lesson={lesson}
                completed={isCompleted(lesson.slug)}
                hydrated={hydrated}
                onToggle={toggle}
              />
            ))
          )}
        </Stack>

        <Box sx={{ py: 8 }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              fontSize: '0.84rem',
              color: 'text.secondary',
              transition: '0.15s',
              '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Về trang chủ
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

SystemDesignRoadmap.Layout = MainLayout

export default SystemDesignRoadmap
