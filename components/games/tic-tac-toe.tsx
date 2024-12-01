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
import { useEffect, useState } from 'react'
import { FaClock, FaExclamationTriangle, FaRedo, FaTrophy } from 'react-icons/fa'

const GameCell = styled(Paper)(({ isWinning }: { isWinning?: boolean }) => ({
  width: '100%',
  paddingBottom: '100%',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isWinning ? '#4caf50' : '#fff',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}))

const CellContent = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
})

const StyledListItem = styled(ListItem)({
  backgroundColor: '#f5f5f5',
  marginBottom: '8px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
})

const RuleTitle = styled(Typography)({
  color: '#1976d2',
  fontWeight: 600,
})

const RuleDetail = styled(Typography)({
  color: '#666',
  fontSize: '0.9rem',
})

const GomeTicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes game
  const [gameStatus, setGameStatus] = useState('playing')

  const calculateWinner = (squares: any) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Tic Tac Toe Game
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Challenge your strategic thinking in this classic game!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h6" component="div">
                <FaClock /> Time: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={resetGame}
                startIcon={<FaRedo />}
              >
                New Game
              </Button>
            </Box>

            <Grid container spacing={1} sx={{ maxWidth: 400, mx: 'auto' }}>
              {board.map((cell, index) => (
                <Grid item xs={4} key={index}>
                  <GameCell
                    elevation={2}
                    onClick={() => handleClick(index)}
                    isWinning={winningLine.includes(index)}
                    sx={{ cursor: cell ? 'default' : 'pointer' }}
                  >
                    <CellContent>{cell}</CellContent>
                  </GameCell>
                </Grid>
              ))}
            </Grid>

            {gameStatus !== 'playing' && (
              <Fade in>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  {gameStatus === 'win' ? (
                    <Typography variant="h4" color="success.main">
                      <FaTrophy /> Player {winner} Wins!
                    </Typography>
                  ) : gameStatus === 'draw' ? (
                    <Typography variant="h4" color="info.main">
                      {`It's a Draw!`}
                    </Typography>
                  ) : gameStatus === 'gameOver' ? (
                    <Typography variant="h4" color="error.main">
                      <FaExclamationTriangle /> Time is Up!
                    </Typography>
                  ) : null}
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#1976d2', borderBottom: '2px solid #1976d2', pb: 1 }}
            >
              Technologies Used
            </Typography>
            <List>
              <StyledListItem>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      React.js
                    </Typography>
                  }
                  secondary="Frontend Framework"
                />
              </StyledListItem>
              <StyledListItem>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Material-UI
                    </Typography>
                  }
                  secondary="UI Components"
                />
              </StyledListItem>
              <StyledListItem>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      TypeScript
                    </Typography>
                  }
                  secondary="Type Safety"
                />
              </StyledListItem>
            </List>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#1976d2', borderBottom: '2px solid #1976d2', pb: 1, mt: 3 }}
            >
              Game Rules
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary={<RuleTitle variant="subtitle1">Take Turns</RuleTitle>}
                  secondary={
                    <RuleDetail>Players alternate placing X and O on the board</RuleDetail>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={<RuleTitle variant="subtitle1">Winning Strategy</RuleTitle>}
                  secondary={
                    <RuleDetail>
                      Align three of your symbols horizontally, vertically, or diagonally to win
                    </RuleDetail>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={<RuleTitle variant="subtitle1">Time Limit</RuleTitle>}
                  secondary={
                    <RuleDetail>Complete the game within the 5-minute time limit</RuleDetail>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default GomeTicTacToe
