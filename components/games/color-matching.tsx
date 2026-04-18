import { Work } from '@/models'
import {
  Box,
  Button,
  Container,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  styled,
  Typography,
  useTheme,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { FaClock, FaExclamationTriangle, FaRedo, FaTrophy } from 'react-icons/fa'

export interface WorkDetailsProps {
  work: Work
}

const colorPairs = [
  '#FF5733',
  '#FF5733',
  '#33FF57',
  '#33FF57',
  '#3357FF',
  '#3357FF',
  '#FF33F6',
  '#FF33F6',
  '#33FFF6',
  '#33FFF6',
  '#F6FF33',
  '#F6FF33',
]

const ColorBlock = styled(Paper, {
  shouldForwardProp: (p) => p !== 'isFlipped' && p !== 'isMatched',
})<{ isFlipped?: boolean; isMatched?: boolean }>(({ isFlipped, isMatched }) => ({
  width: '100%',
  paddingBottom: '100%',
  position: 'relative',
  cursor: isMatched ? 'default' : 'pointer',
  transition: 'all 0.3s ease',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
  opacity: isMatched ? 0.85 : 1,
  boxShadow: 'none',
  '&:hover': {
    transform: isMatched ? 'none' : 'scale(1.04)',
  },
}))

export const GameColorMatching = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [colors, setColors] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<any[]>([])
  const [matchedPairs, setMatchedPairs] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStatus, setGameStatus] = useState('ready')

  const shuffleColors = useCallback(() => {
    return [...colorPairs].sort(() => Math.random() - 0.5)
  }, [])

  const resetGame = useCallback(() => {
    setColors(shuffleColors())
    setFlippedCards([])
    setMatchedPairs([])
    setTimeLeft(30)
    setGameStatus('playing')
  }, [shuffleColors])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    let timer: any
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setGameStatus('gameOver')
    }
    return () => clearInterval(timer)
  }, [timeLeft, gameStatus])

  useEffect(() => {
    if (matchedPairs.length === colorPairs.length / 2) {
      setGameStatus('win')
    }
  }, [matchedPairs])

  const handleCardClick = (index: number) => {
    if (
      gameStatus !== 'playing' ||
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      matchedPairs.includes(colors[index])
    ) {
      return
    }

    const newFlippedCards = [...flippedCards, index]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards
      if (colors[firstIndex] === colors[secondIndex]) {
        setMatchedPairs([...matchedPairs, colors[firstIndex]])
      }
      setTimeout(() => setFlippedCards([]), 1000)
    }
  }

  const panelSx = {
    p: 3,
    borderRadius: 2,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
  }

  const ruleItemSx = {
    mb: 1,
    px: 2,
    py: 1.25,
    borderRadius: '10px',
    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'background-color 0.15s, border-color 0.15s',
    '&:hover': {
      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)',
      borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
    },
  }

  const sectionHeading = {
    color: 'primary.main',
    fontWeight: 700,
    fontSize: '0.95rem',
    pb: 1,
    mb: 2,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  }

  const hiddenCardColor = isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          component="h1"
          fontWeight={800}
          letterSpacing="-0.03em"
          sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 1 }}
        >
          Color Matching Game
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your memory and color matching skills in this exciting game!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={panelSx}>
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaClock color={theme.palette.text.secondary} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Time: {timeLeft}s
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={resetGame}
                startIcon={<FaRedo />}
                disableElevation
              >
                Play Again
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {colors.map((color, index) => {
                const revealed =
                  flippedCards.includes(index) || matchedPairs.includes(color)
                return (
                  <Grid item xs={3} key={index}>
                    <ColorBlock
                      onClick={() => handleCardClick(index)}
                      isFlipped={!!flippedCards.includes(index)}
                      isMatched={matchedPairs.includes(color)}
                      sx={{
                        bgcolor: revealed ? color : hiddenCardColor,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      role="button"
                      aria-label={`Color card ${index + 1}`}
                    />
                  </Grid>
                )
              })}
            </Grid>

            {gameStatus !== 'playing' && (
              <Fade in>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  {gameStatus === 'win' ? (
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="success.main"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                    >
                      <FaTrophy /> You Win!
                    </Typography>
                  ) : gameStatus === 'gameOver' ? (
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="error.main"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                    >
                      <FaExclamationTriangle /> Game Over
                    </Typography>
                  ) : null}
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={panelSx}>
            <Typography sx={sectionHeading}>Technologies Used</Typography>
            <List disablePadding sx={{ mb: 3 }}>
              {[
                { name: 'React.js', desc: 'Frontend Library' },
                { name: 'Material-UI', desc: 'UI Components' },
                { name: 'CSS3', desc: 'Animations & Styling' },
              ].map((t) => (
                <ListItem key={t.name} disableGutters sx={ruleItemSx}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {t.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {t.desc}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Typography sx={sectionHeading}>Game Rules</Typography>
            <List disablePadding>
              {[
                'Find all matched colors in 30 seconds',
                'Flip two cards at a time to find pairs',
                'Match all pairs to win',
              ].map((rule) => (
                <ListItem key={rule} disableGutters sx={ruleItemSx}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem' }}>
                        {rule}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
