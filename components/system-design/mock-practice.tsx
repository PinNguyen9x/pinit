import { INTERVIEW_STEPS } from '@/constants'
import { MockPrompt } from '@/models/system-design'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { useSystemDesignTokens } from './tokens'

export interface MockPracticeProps {
  prompts: MockPrompt[]
}

/**
 * Khối tự luyện cho buổi 13: khung thời gian đọc thẳng từ INTERVIEW_STEPS
 * (không chép lại) và danh sách đề bài kèm tiêu chí tự chấm.
 */
export function MockPractice({ prompts }: MockPracticeProps) {
  const { accent, line, cardBg, chipBg } = useSystemDesignTokens()

  return (
    <Stack spacing={5} sx={{ mt: 6 }}>
      <Box>
        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 1 }}>
          Khung 45 phút để bấm giờ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chạy đúng thứ tự này. Mỗi bước có checklist riêng để biết mình đã làm đủ chưa.
        </Typography>

        <Stack spacing={1.5}>
          {INTERVIEW_STEPS.map((step) => (
            <Box
              key={step.order}
              sx={{ p: 2, border: '1px solid', borderColor: line, borderRadius: 2, bgcolor: cardBg }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                <Box
                  sx={{
                    minWidth: 28,
                    height: 28,
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
                <Typography fontWeight={700} sx={{ flex: 1 }}>
                  {step.name}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: accent }}>
                  <TimerOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={600}>
                    {step.minutes} phút
                  </Typography>
                </Stack>
              </Stack>

              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                {step.checklist.map((item, index) => (
                  <Stack component="li" key={index} direction="row" spacing={1} alignItems="flex-start">
                    <CheckBoxOutlineBlankIcon sx={{ fontSize: 16, mt: '3px', color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 1 }}>
          Bộ đề tự luyện ({prompts.length} đề)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chọn một đề chưa làm gần đây. Đừng đọc lại bài tương ứng trước khi luyện.
        </Typography>

        <Stack spacing={2}>
          {prompts.map((prompt, index) => (
            <Box
              key={index}
              sx={{ p: 2.5, border: '1px solid', borderColor: line, borderRadius: 2, bgcolor: cardBg }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                <Chip label={`Đề ${index + 1}`} size="small" sx={{ bgcolor: chipBg }} />
                <Typography fontWeight={700} sx={{ flex: 1, lineHeight: 1.5 }}>
                  {prompt.title}
                </Typography>
              </Stack>

              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                Yêu cầu
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, mb: 2, pl: 2.5 }}>
                {prompt.requirements.map((item, i) => (
                  <Typography component="li" variant="body2" key={i} sx={{ lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                ))}
              </Stack>

              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75, color: accent }}>
                Tự chấm sau khi trình bày
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                {prompt.rubric.map((item, i) => (
                  <Stack component="li" key={i} direction="row" spacing={1} alignItems="flex-start">
                    <CheckBoxOutlineBlankIcon sx={{ fontSize: 16, mt: '3px', color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}
