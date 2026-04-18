import { Post } from '@/models'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'

export interface PostItemProps {
  post: Post
}

export function PostItem({ post }: PostItemProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Stack direction="row" spacing={0.75} mb={2} flexWrap="wrap" useFlexGap>
        {post.tagList.slice(0, 3).map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            sx={{
              fontSize: '0.68rem',
              height: 20,
              bgcolor: isDark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.07)',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.18)',
              fontWeight: 500,
            }}
          />
        ))}
      </Stack>

      <Typography
        variant="h6"
        fontWeight={600}
        mb={1.25}
        sx={{
          fontSize: { xs: '0.95rem', md: '1.05rem' },
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}
      >
        {post.title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        mb={2.5}
        sx={{
          lineHeight: 1.65,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontSize: '0.85rem',
        }}
      >
        {post.description}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={500}
          sx={{ fontSize: '0.75rem' }}
        >
          {format(new Date(post.publishedDate), 'MMM dd, yyyy')}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ color: '#dc2626', cursor: 'default' }}
        >
          <Typography component="span" fontSize="0.8rem" fontWeight={500} color="#dc2626">
            Read more
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 13, color: '#dc2626' }} />
        </Stack>
      </Stack>
    </Box>
  )
}
