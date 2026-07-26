import { Lesson } from '@/models/system-design'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useSystemDesignTokens } from './tokens'

export interface LessonCardProps {
  lesson: Lesson
  completed: boolean
  /** false trước khi đọc xong localStorage — chưa hiện trạng thái tick. */
  hydrated: boolean
  onToggle: (slug: string) => void
}

export function LessonCard({ lesson, completed, hydrated, onToggle }: LessonCardProps) {
  const { accent, line, cardBg, cardBgHover, chipBg } = useSystemDesignTokens()

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: completed && hydrated ? accent : line,
        borderRadius: 2,
        bgcolor: cardBg,
        transition: 'background-color .2s, border-color .2s',
        '&:hover': { bgcolor: cardBgHover },
      }}
    >
      <Box
        sx={{
          minWidth: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: chipBg,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {lesson.order}
      </Box>

      <Box
        component={Link}
        href={`/system-design/${lesson.slug}`}
        sx={{ flex: 1, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
      >
        <Typography fontWeight={700} sx={{ lineHeight: 1.5 }}>
          {lesson.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
          {lesson.summary}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
          <Chip label={lesson.track} size="small" sx={{ bgcolor: chipBg }} />
          <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
            <ScheduleIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{lesson.readingMinutes} phút</Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Nằm trong card nhưng ngoài thẻ Link — click tick không được điều hướng. */}
      <IconButton
        aria-label={
          completed
            ? `Bỏ đánh dấu đã ôn xong buổi ${lesson.order}`
            : `Đánh dấu đã ôn xong buổi ${lesson.order}`
        }
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggle(lesson.slug)
        }}
        sx={{ color: completed && hydrated ? accent : 'text.disabled' }}
      >
        {completed && hydrated ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
      </IconButton>
    </Stack>
  )
}
