import { topicStatus, TopicStatusKey } from '@/utils/activity-insights'
import type { TopicSummaryWithActivity } from '@/utils/activity'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { MdPlayArrow, MdStyle } from 'react-icons/md'
import { TagList } from './tag-list'

export const STATUS_COLOR: Record<TopicStatusKey, string> = {
  new: 'divider',
  weak: 'error.main',
  ok: 'warning.main',
  strong: 'success.main',
}

/** Card một topic trên /me/learn — viền trái + nhãn theo trạng thái practice gần nhất. */
export function TopicCard({ t }: { t: TopicSummaryWithActivity }) {
  const status = topicStatus(t.recentAverage)
  const color = STATUS_COLOR[status.key]
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderLeft: 4,
        borderLeftColor: color,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'transform 150ms, box-shadow 150ms',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
        '@media (prefers-reduced-motion: reduce)': { '&:hover': { transform: 'none' } },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Typography
          component={Link}
          href={`/me/learn/${t.slug}`}
          variant="h6"
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {t.title}
        </Typography>
        <Chip
          size="small"
          label={t.recentAverage != null ? `${status.label} · ${t.recentAverage}` : status.label}
          variant="outlined"
          sx={{
            borderColor: color,
            color: status.key === 'new' ? 'text.secondary' : color,
            fontWeight: 600,
          }}
        />
      </Stack>
      <TagList tags={t.tags} />
      <Typography variant="body2" color="text.secondary">
        {t.noteCount + 1} note ·{' '}
        {t.count ? `${t.count} lần luyện · cuối ${t.lastDay}` : 'chưa luyện'}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mt="auto">
        <Button
          size="small"
          variant="contained"
          component={Link}
          href={`/me/practice?topic=${t.slug}`}
          startIcon={<MdPlayArrow />}
        >
          Luyện
        </Button>
        <Button
          size="small"
          component={Link}
          href={`/me/learn/${t.slug}#flashcards`}
          startIcon={<MdStyle />}
          color={t.cards.due ? 'warning' : 'inherit'}
        >
          {t.cards.due
            ? `${t.cards.due} thẻ đến hạn`
            : t.cards.new
              ? `${t.cards.new} thẻ mới`
              : 'Flashcard'}
        </Button>
      </Stack>
    </Box>
  )
}
