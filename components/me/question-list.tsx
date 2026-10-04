import type { Question } from '@/utils/private-content-schema'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

/** Câu hỏi ôn tập: đóng sẵn để tự trả lời trong đầu trước khi mở đáp án. */
export function QuestionList({ questions }: { questions: Question[] }) {
  if (!questions.length) return null
  return (
    <>
      <Typography component="h2" variant="h6" mt={6} mb={2}>
        Câu hỏi ôn tập ({questions.length})
      </Typography>
      {questions.map((item, i) => (
        <Accordion key={i} disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" whiteSpace="pre-wrap">
              {item.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}
