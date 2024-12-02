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

const ColorBlock = styled(Paper)(
  ({ isFlipped, isMatched }: { isFlipped?: boolean; isMatched?: boolean }) => ({
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
    cursor: isMatched ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
    opacity: isMatched ? 0.8 : 1,
    '&:hover': {
      transform: isMatched ? 'none' : 'scale(1.05)',
    },
  }),
)

export const GameColorMatching = () => {
  const [colors, setColors] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<any[]>([])
  const [matchedPairs, setMatchedPairs] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStatus, setGameStatus] = useState('ready')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

  const shuffleColors = useCallback(() => {
    return [...colorPairs].sort(() => Math.random() - 0.5)
  }, [])

  const resetGame = useCallback(() => {
    setColors(shuffleColors())
    setFlippedCards([])
    setMatchedPairs([])
    setTimeLeft(30)
    setGameStatus('playing')
    setBackgroundColor('#ffffff')
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
        setBackgroundColor(colors[firstIndex])
      }
      setTimeout(() => setFlippedCards([]), 1000)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Game Color Matching
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Test your memory and color matching skills in this exciting game!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: backgroundColor,
              transition: 'background-color 0.5s ease',
            }}
          >
            <Box
              sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h6" component="div">
                <FaClock /> Time: {timeLeft}s
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={resetGame}
                startIcon={<FaRedo />}
              >
                Play Again
              </Button>
            </Box>

            <Grid container spacing={2}>
              {colors.map((color, index) => (
                <Grid item xs={3} key={index}>
                  <ColorBlock
                    elevation={2}
                    onClick={() => handleCardClick(index)}
                    isFlipped={!!flippedCards.includes(index)}
                    isMatched={matchedPairs.includes(color)}
                    sx={{
                      bgcolor:
                        flippedCards.includes(index) || matchedPairs.includes(color)
                          ? color
                          : '#ddd',
                    }}
                    role="button"
                    aria-label={`Color card ${index + 1}`}
                  />
                </Grid>
              ))}
            </Grid>

            {gameStatus !== 'playing' && (
              <Fade in>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  {gameStatus === 'win' ? (
                    <Typography variant="h4" color="success.main">
                      <FaTrophy /> You Win!
                    </Typography>
                  ) : gameStatus === 'gameOver' ? (
                    <Typography variant="h4" color="error.main">
                      <FaExclamationTriangle /> Game Over
                    </Typography>
                  ) : null}
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technologies Used
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="React.js" secondary="Frontend Library" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Material-UI" secondary="UI Components" />
              </ListItem>
              <ListItem>
                <ListItemText primary="CSS3" secondary="Animations & Styling" />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Game Rules
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Find all matched colors in 30 seconds" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Background changes with each match" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Match all pairs to win" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
