import React, { useState } from 'react'
import { Box, Button, Typography, Grid, styled } from '@mui/material'
import chalkBoard from '@/images/chalk-board-bg.png'
import Image from 'next/image'

const TURN = {
  CROSS: 'cross',
  CIRCLE: 'circle',
}

const GAME_STATUS = {
  PLAYING: 'PLAYING',
  ENDED: 'ENDED',
  X_WIN: 'X_WIN',
  O_WIN: 'O_WIN',
}

const checkGameStatus = (cellValues: string[]) => {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (cellValues[a] && cellValues[a] === cellValues[b] && cellValues[a] === cellValues[c]) {
      return {
        status: cellValues[a] === 'X' ? GAME_STATUS.X_WIN : GAME_STATUS.O_WIN,
        winPositions: pattern,
      }
    }
  }

  return cellValues.includes('') ? { status: GAME_STATUS.PLAYING } : { status: GAME_STATUS.ENDED }
}

const GameContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.common.white,
  position: 'relative',
}))

const Cell = styled(Box)<{ isWin?: boolean; cellValue?: string }>(({ isWin, cellValue }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
  height: 50,
  border: '1px solid rgba(255, 255, 255, 0.5)',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: cellValue === 'X' ? '#ff6f61' : cellValue === 'O' ? '#4caf50' : 'inherit',
  backgroundColor: isWin ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}))

const Board = styled(Grid)({
  width: 150,
  marginTop: '4px',
})

const OverlayContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '4px',
  textAlign: 'center',
})

const ChalkBoard = styled(Box)({
  position: 'relative',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '550px',
  '& > img': {
    width: '100%',
  },
})

export function TicTacToe() {
  const [currentTurn, setCurrentTurn] = useState(TURN.CROSS)
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING)
  const [cellValues, setCellValues] = useState<string[]>(Array(9).fill(''))
  const [winPositions, setWinPositions] = useState<number[] | null>(null)

  const handleCellClick = (index: number) => {
    if (cellValues[index] || gameStatus !== GAME_STATUS.PLAYING) return

    const newCellValues = [...cellValues]
    newCellValues[index] = currentTurn === TURN.CROSS ? 'X' : 'O'
    setCellValues(newCellValues)

    const game = checkGameStatus(newCellValues)
    if (game.status === GAME_STATUS.X_WIN || game.status === GAME_STATUS.O_WIN) {
      setGameStatus(game.status)
      setWinPositions(game.winPositions || [])
    } else if (game.status === GAME_STATUS.ENDED) {
      setGameStatus(GAME_STATUS.ENDED)
    }

    setCurrentTurn(currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS)
  }

  const handleReset = () => {
    setCellValues(Array(9).fill(''))
    setCurrentTurn(TURN.CROSS)
    setGameStatus(GAME_STATUS.PLAYING)
    setWinPositions(null)
  }

  return (
    <GameContainer>
      <ChalkBoard>
        <Image src={chalkBoard} alt="chalkboard" />
        <OverlayContent>
          <Typography variant="h5" gutterBottom>
            Tic Tac Toe
          </Typography>
          <Typography variant="subtitle1">Status: {gameStatus}</Typography>
          <Typography variant="subtitle2">
            Turn: {currentTurn === TURN.CROSS ? 'X' : 'O'}
          </Typography>

          <Board container spacing={0}>
            {cellValues.map((value, index) => (
              <Grid item xs={4} key={index}>
                <Cell
                  onClick={() => handleCellClick(index)}
                  isWin={winPositions?.includes(index)}
                  cellValue={value}
                >
                  {value}
                </Cell>
              </Grid>
            ))}
          </Board>

          {gameStatus !== GAME_STATUS.PLAYING && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReset}
              sx={{ marginTop: 2 }}
            >
              Replay
            </Button>
          )}
        </OverlayContent>
      </ChalkBoard>
    </GameContainer>
  )
}
