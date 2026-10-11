import { Work } from '@/models'
import { cardImageUrl, getWorkHref, plainText } from '@/utils'
import { Box, Stack, Typography } from '@mui/material'
import Link from 'next/link'

export interface WorkGridCardProps {
  work: Work
}

/**
 * Thẻ dự án dạng dọc — dùng ở trang chủ (lưới 3 cột) và /works.
 *
 * Màu lấy từ token (--color-*, utils/theme.ts) thay cho xanh #16a34a cũ; tag
 * là nhãn trung tính chứ không xanh, vì xanh chỉ dành cho link, điểm nhấn và
 * trạng thái. Không nhấc thẻ khi hover — chỉ đổi màu viền và gạch chân dòng
 * "Xem chi tiết", đủ báo thẻ bấm được mà không kéo mắt.
 */
export function WorkGridCard({ work }: WorkGridCardProps) {
  const cover = cardImageUrl(work.thumbnailUrl)

  return (
    <Box
      component={Link}
      href={getWorkHref(work)}
      sx={{
        display: 'block',
        height: '100%',
        color: 'inherit',
        borderRadius: '12px',
        '&:hover article': { borderColor: 'var(--color-ink-muted)' },
        '&:hover .work-cta': { textDecorationThickness: '2px' },
        '&:focus-visible': { outline: '2px solid var(--color-accent)', outlineOffset: '3px' },
      }}
    >
      <Box
        component="article"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '12px',
          border: '1px solid var(--color-line)',
          bgcolor: 'var(--color-surface)',
          transition: 'border-color 0.15s',
        }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderBottom: '1px solid var(--color-line)',
            backgroundColor: 'var(--color-line)',
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
          {work.tagList?.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {work.tagList.slice(0, 3).map((tag) => (
                <Box
                  key={tag}
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    color: 'text.secondary',
                    border: '1px solid var(--color-line)',
                    borderRadius: '999px',
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Stack>
          )}

          <Typography
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '1.0625rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              m: 0,
            }}
          >
            {work.title}
          </Typography>

          {work.shortDescription && (
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                m: 0,
              }}
            >
              {plainText(work.shortDescription)}
            </Typography>
          )}

          <Box
            component="span"
            className="work-cta"
            sx={{
              mt: 'auto',
              pt: 0.5,
              alignSelf: 'flex-start',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'primary.main',
              textDecoration: 'underline',
              textDecorationThickness: '1px',
              textUnderlineOffset: '3px',
            }}
          >
            Xem chi tiết
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
