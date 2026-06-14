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
import { useEffect, useState } from 'react'
import { FaClock, FaExclamationTriangle, FaRedo, FaTrophy } from 'react-icons/fa'

const GameCell = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isWinning',
})<{ isWinning?: boolean }>(({ theme, isWinning }) => {
  const isDark = theme.palette.mode === 'dark'
  return {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    backgroundColor: isWinning
      ? theme.palette.primary.main
      : isDark
      ? 'rgba(255,255,255,0.04)'
      : '#ffffff',
    border: `1px solid ${isWinning ? theme.palette.primary.main : theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': {
      transform: 'scale(1.03)',
      backgroundColor: isWinning
        ? theme.palette.primary.main
        : isDark
        ? 'rgba(255,255,255,0.07)'
        : '#f7f7f7',
    },
  }
})

const CellContent = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.25rem',
  fontWeight: 700,
})

export const GomeTicTacToe = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(300)
  const [gameStatus, setGameStatus] = useState('playing')

  const calculateWinner = (squares: any) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(lines[i])
        return squares[a]
      }
    }
    return null
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setWinningLine([])
    setTimeLeft(300)
    setGameStatus('playing')
  }

  useEffect(() => {
    let timer: NodeJS.Timer
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setGameStatus('gameOver')
    }
    return () => clearInterval(timer as unknown as number)
  }, [timeLeft, gameStatus])

  const handleClick = (index: number) => {
    if (board[index] || winner || gameStatus !== 'playing') return

    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)

    const newWinner = calculateWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      setGameStatus('win')
    } else if (newBoard.every((cell) => cell !== null)) {
      setGameStatus('draw')
    } else {
      setIsXNext(!isXNext)
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

  const cellSymbolColor = (cell: string | null, isWin: boolean) => {
    if (isWin) return '#ffffff'
    if (cell === 'X') return theme.palette.primary.main
    if (cell === 'O') return isDark ? '#ff7a7a' : '#d32f2f'
    return 'text.primary'
  }

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          component="h1"
          fontWeight={800}
          letterSpacing="-0.03em"
          sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 1 }}
        >
          Tic Tac Toe Game
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Challenge your strategic thinking in this classic game!
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
                  Time: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={resetGame}
                startIcon={<FaRedo />}
                disableElevation
              >
                New Game
              </Button>
            </Box>

            <Grid container spacing={1.25} sx={{ maxWidth: 420, mx: 'auto' }}>
              {board.map((cell, index) => {
                const isWin = winningLine.includes(index)
                return (
                  <Grid item xs={4} key={index}>
                    <GameCell
                      onClick={() => handleClick(index)}
                      isWinning={isWin}
                      sx={{ cursor: cell ? 'default' : 'pointer' }}
                    >
                      <CellContent sx={{ color: cellSymbolColor(cell, isWin) }}>
                        {cell}
                      </CellContent>
                    </GameCell>
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
                      <FaTrophy /> Player {winner} Wins!
                    </Typography>
                  ) : gameStatus === 'draw' ? (
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {`It's a Draw!`}
                    </Typography>
                  ) : gameStatus === 'gameOver' ? (
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="error.main"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                    >
                      <FaExclamationTriangle /> Time is Up!
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
                { name: 'React.js', desc: 'Frontend Framework' },
                { name: 'Material-UI', desc: 'UI Components' },
                { name: 'TypeScript', desc: 'Type Safety' },
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
                {
                  title: 'Take Turns',
                  detail: 'Players alternate placing X and O on the board',
                },
                {
                  title: 'Winning Strategy',
                  detail:
                    'Align three of your symbols horizontally, vertically, or diagonally to win',
                },
                {
                  title: 'Time Limit',
                  detail: 'Complete the game within the 5-minute time limit',
                },
              ].map((r) => (
                <ListItem key={r.title} disableGutters sx={ruleItemSx}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="primary.main"
                        sx={{ fontSize: '0.95rem' }}
                      >
                        {r.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {r.detail}
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
