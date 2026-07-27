import { Flashcard as FlashcardModel } from '@/models/system-design'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Box, Collapse, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { RichText } from './rich-text'
import { useSystemDesignTokens } from './tokens'

interface FlashcardProps {
  card: FlashcardModel
  /** Mở theo lệnh "lật tất cả" của deck. */
  forceOpen: boolean
}

/**
 * Thẻ tự kiểm tra. Mặc định chỉ hiện câu hỏi — tự trả lời trong đầu trước rồi
 * mới lật, nếu thấy đáp án ngay thì mất tác dụng ôn tập.
 */
function Flashcard({ card, forceOpen }: FlashcardProps) {
  const [open, setOpen] = useState(false)
  const { line, cardBg, cardBgHover, accent, chipBg } = useSystemDesignTokens()
  const expanded = open || forceOpen

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setOpen((prev) => !prev)
        }
      }}
      sx={{
        cursor: 'pointer',
        p: 2,
        border: '1px solid',
        borderColor: line,
        borderRadius: 2,
        bgcolor: expanded ? cardBgHover : cardBg,
        transition: 'background-color .2s',
        '&:hover': { bgcolor: cardBgHover },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Typography sx={{ flex: 1, fontWeight: 600, lineHeight: 1.6 }}>{card.question}</Typography>
        <ExpandMoreIcon
          sx={{
            color: accent,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }}
        />
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Typography sx={{ mt: 2, lineHeight: 1.8 }}>
          <RichText text={card.answer} />
        </Typography>

        {card.pitfall && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: chipBg }}>
            <WarningAmberOutlinedIcon fontSize="small" sx={{ color: 'warning.main', mt: '2px' }} />
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Bẫy thường gặp:</strong> <RichText text={card.pitfall} />
            </Typography>
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}

export interface FlashcardDeckProps {
  cards: FlashcardModel[]
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [showAll, setShowAll] = useState(false)
  const { accent } = useSystemDesignTokens()

  if (cards.length === 0) return null

  return (
    <Stack spacing={2} sx={{ mt: 6 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h5" component="h2" fontWeight={700}>
          Tự kiểm tra ({cards.length} câu)
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          sx={{
            border: 'none',
            bgcolor: 'transparent',
            color: accent,
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'inherit',
            p: 0,
          }}
        >
          {showAll ? 'Ẩn tất cả đáp án' : 'Lật tất cả'}
        </Box>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Tự trả lời thành tiếng trước khi lật thẻ — nghĩ trong đầu luôn thấy trôi chảy hơn lúc phải
        nói ra.
      </Typography>

      {cards.map((card, index) => (
        <Flashcard key={index} card={card} forceOpen={showAll} />
      ))}
    </Stack>
  )
}
