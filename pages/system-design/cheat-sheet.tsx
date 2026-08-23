import { BackgroundFx } from '@/components/common/background-fx'
import { Seo } from '@/components/common/seo'
import { MainLayout } from '@/components/layouts/main'
import { useSystemDesignTokens } from '@/components/system-design'
import { CHEAT_SHEET_TABLES, INTERVIEW_STEPS, LESSONS } from '@/constants/system-design'
import { NextPageWithLayout } from '@/models'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { Box, Container, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useMemo } from 'react'

const CheatSheet: NextPageWithLayout = () => {
  const { accent, line, cardBg, chipBg } = useSystemDesignTokens()

  const takeaways = useMemo(() => [...LESSONS].sort((a, b) => a.order - b.order), [])
  const totalMinutes = INTERVIEW_STEPS.reduce((sum, step) => sum + step.minutes, 0)

  return (
    <Box>
      <Seo
        data={{
          title: 'Cheat sheet System Design — ôn 20 phút trước phỏng vấn | Pin Nguyen',
          description:
            'Bản ôn gấp: con số cần thuộc, bảng chọn database, khung 45 phút trả lời phỏng vấn và một dòng chốt cho mỗi buổi trong lộ trình 13 buổi.',
          thumbnailUrl: 'https://pinit-ten.vercel.app/favicon.ico',
          url: 'https://pinit-ten.vercel.app/system-design/cheat-sheet',
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

          <Typography
            component="h1"
            sx={{
              mt: 3,
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.6rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Cheat{' '}
            <Box component="span" sx={{ color: accent }}>
              sheet
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
            Bản ôn gấp cho hai mươi phút trước giờ phỏng vấn. Không giải thích, chỉ những thứ cần
            nạp lại.
          </Typography>
        </Box>

        {/* Khung thời gian đọc thẳng từ INTERVIEW_STEPS, không chép lại. */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight={700}>
            Khung trả lời {totalMinutes} phút
          </Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {INTERVIEW_STEPS.map((step) => (
              <Stack
                key={step.order}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: line,
                  borderRadius: 2,
                  bgcolor: cardBg,
                }}
              >
                <Box
                  sx={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: chipBg,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {step.order}
                </Box>
                <Typography fontWeight={600} sx={{ flex: 1 }}>
                  {step.name}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: accent }}>
                  <TimerOutlinedIcon sx={{ fontSize: 15 }} />
                  <Typography variant="caption" fontWeight={600}>
                    {step.minutes}&apos;
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>

        {CHEAT_SHEET_TABLES.map((table) => (
          <Box key={table.title} sx={{ mt: 6 }}>
            <Typography variant="h5" component="h2" fontWeight={700}>
              {table.title}
            </Typography>
            {table.hint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {table.hint}
              </Typography>
            )}
            <Box
              sx={{
                mt: 2,
                overflowX: 'auto',
                border: '1px solid',
                borderColor: line,
                borderRadius: 2,
              }}
            >
              <Box
                component="table"
                sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}
              >
                <Box component="thead" sx={{ bgcolor: chipBg }}>
                  <Box component="tr">
                    {table.headers.map((header) => (
                      <Box
                        key={header}
                        component="th"
                        sx={{
                          textAlign: 'left',
                          p: 1.5,
                          fontWeight: 700,
                          fontSize: 14,
                          borderBottom: '1px solid',
                          borderColor: line,
                        }}
                      >
                        {header}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {table.rows.map((row, rowIndex) => (
                    <Box component="tr" key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <Box
                          key={cellIndex}
                          component="td"
                          sx={{
                            p: 1.5,
                            fontSize: 14,
                            verticalAlign: 'top',
                            borderBottom: '1px solid',
                            borderColor: line,
                          }}
                        >
                          {cell}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight={700}>
            Một dòng chốt cho mỗi buổi
          </Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {takeaways.map((lesson) => (
              <Box
                component={Link}
                href={`/system-design/${lesson.slug}`}
                key={lesson.slug}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.75,
                  border: '1px solid',
                  borderColor: line,
                  borderRadius: 2,
                  bgcolor: cardBg,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { borderColor: accent },
                }}
              >
                <Box
                  sx={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: chipBg,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {lesson.order}
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {lesson.keyTakeaway}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ py: 8 }}>
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
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Về lộ trình
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

CheatSheet.Layout = MainLayout

export default CheatSheet
