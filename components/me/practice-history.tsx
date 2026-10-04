import type { PracticeStats } from '@/utils/practice'
import {
  Alert,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

type Props = Pick<PracticeStats, 'byTopic'> & Partial<Pick<PracticeStats, 'recent'>>

export function scoreColor(score: number): 'success' | 'warning' | 'error' {
  return score >= 8 ? 'success' : score >= 5 ? 'warning' : 'error'
}

/** Điểm trung bình theo topic (+ 20 lần chấm gần nhất nếu truyền `recent`). */
export function PracticeHistory({ byTopic, recent }: Props) {
  if (!byTopic.length) {
    return <Alert severity="info">Chưa có lần luyện nào được chấm.</Alert>
  }
  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap" mb={recent ? 3 : 0}>
        {byTopic.map((t) => (
          <Chip
            key={t.topic}
            variant="outlined"
            label={`${t.topic}: ${t.average}/10 · ${t.count} lần`}
            color={scoreColor(t.average)}
          />
        ))}
      </Box>
      {recent && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thời điểm</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Câu hỏi</TableCell>
                <TableCell align="right">Điểm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.map((e) => (
                <TableRow key={`${e.ts}-${e.question}`}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {e.ts.slice(0, 16).replace('T', ' ')}
                  </TableCell>
                  <TableCell>{e.topic}</TableCell>
                  {/* Câu hỏi do model sinh: text thuần, React tự escape. */}
                  <TableCell>
                    <Typography variant="body2" whiteSpace="pre-wrap">
                      {e.question}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{e.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  )
}
