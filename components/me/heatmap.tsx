import type { HeatCell } from '@/utils/activity-insights'
import { Box, Stack, Typography } from '@mui/material'

const WEEKDAYS = ['T2', '', 'T4', '', 'T6', '', 'CN']

/**
 * Heatmap 12 tuần kiểu "contribution graph". Cột = tuần, hàng = thứ. Trên màn
 * hẹp thì cuộn ngang (và cuộn sẵn về cuối để thấy tuần hiện tại) thay vì co ô
 * nhỏ tới mức không bấm được.
 */
export function Heatmap({ weeks }: { weeks: HeatCell[][] }) {
  return (
    <Box>
      <Box
        ref={(el: HTMLDivElement | null) => {
          if (el) el.scrollLeft = el.scrollWidth
        }}
        sx={{ overflowX: 'auto', pb: 1 }}
      >
        <Box
          sx={{
            display: 'grid',
            // Ô 14–26px: đủ bấm trên điện thoại, không phình thành mảng lớn trên desktop.
            gridTemplateColumns: `auto repeat(${weeks.length}, minmax(14px, 26px))`,
            gap: '4px',
            // Rộng đúng bằng nội dung: không thì cột nhãn `auto` hút hết bề ngang dư
            // khi ô đã chạm trần 26px, đẩy nhãn và ô ra hai mép.
            width: 'max-content',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '4px', pr: 0.5 }}>
            {WEEKDAYS.map((d, i) => (
              <Typography
                key={i}
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 10, display: 'flex', alignItems: 'center' }}
              >
                {d}
              </Typography>
            ))}
          </Box>
          {weeks.map((col) => (
            <Box
              key={col[0].day}
              sx={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '4px' }}
            >
              {col.map((c) => (
                <Box
                  key={c.day}
                  title={c.future ? c.day : `${c.day}: ${c.count} lần luyện`}
                  aria-label={c.future ? undefined : `${c.day}: ${c.count} lần luyện`}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    minWidth: 14,
                    borderRadius: '3px',
                    bgcolor: `var(--heat-${c.level})`,
                    opacity: c.future ? 0.25 : 1,
                    outline: (t) => `1px solid ${t.palette.divider}`,
                    outlineOffset: -1,
                  }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary" mr={0.5}>
          Ít
        </Typography>
        {[0, 1, 2, 3, 4].map((l) => (
          <Box
            key={l}
            sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: `var(--heat-${l})` }}
          />
        ))}
        <Typography variant="caption" color="text.secondary" ml={0.5}>
          Nhiều
        </Typography>
      </Stack>
    </Box>
  )
}
