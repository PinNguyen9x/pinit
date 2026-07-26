import { LessonSection } from '@/models/system-design'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { RichText } from './rich-text'
import { useSystemDesignTokens } from './tokens'

export interface LessonSectionViewProps {
  section: LessonSection
}

/** Một khối nội dung trong bài: tiêu đề, các đoạn văn, bảng, sơ đồ, callout. */
export function LessonSectionView({ section }: LessonSectionViewProps) {
  const { accent, line, chipBg, cardBg } = useSystemDesignTokens()

  return (
    <Stack component="section" spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h5" component="h2" fontWeight={700}>
        {section.heading}
      </Typography>

      {section.body.map((paragraph, index) => (
        <Typography key={index} sx={{ lineHeight: 1.8 }}>
          <RichText text={paragraph} />
        </Typography>
      ))}

      {section.table && (
        // Bảng rộng phải cuộn trong khung riêng, không đẩy cả trang scroll ngang.
        <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: line, borderRadius: 2 }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <Box component="thead" sx={{ bgcolor: chipBg }}>
              <Box component="tr">
                {section.table.headers.map((header) => (
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
              {section.table.rows.map((row, rowIndex) => (
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
                      <RichText text={cell} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {section.diagram && (
        <Box
          sx={{
            overflowX: 'auto',
            p: 2,
            bgcolor: cardBg,
            border: '1px solid',
            borderColor: line,
            borderRadius: 2,
            '& .mermaid': { display: 'flex', justifyContent: 'center' },
            '& svg': { maxWidth: '100%', height: 'auto' },
          }}
        >
          {/* useMermaid tìm node .mermaid rồi thay bằng SVG ở phía client. */}
          <Box className="mermaid">{section.diagram}</Box>
        </Box>
      )}

      {section.callout && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            p: 2,
            borderRadius: 2,
            borderLeft: '3px solid',
            borderColor: accent,
            bgcolor: chipBg,
          }}
        >
          <LightbulbOutlinedIcon sx={{ color: accent, mt: '2px' }} fontSize="small" />
          <Typography sx={{ lineHeight: 1.7 }}>
            <RichText text={section.callout} />
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
