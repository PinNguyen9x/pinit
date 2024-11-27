import React, { useState, useEffect } from 'react'
import { Button, Grid, Typography, Box } from '@mui/material'

const GAME_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED',
}

const PAIRS_COUNT = 6

// Utility function to generate random color pairs
const getRandomColors = (pairs: number): string[] => {
  const colors = Array.from({ length: pairs }, () => `hsl(${Math.random() * 360}, 100%, 75%)`)
  return [...colors, ...colors].sort(() => Math.random() - 0.5)
}

export function ColorMatching() {
  const [gameState, setGameState] = useState(GAME_STATUS.NOT_STARTED) // Default: NOT_STARTED
  const [selections, setSelections] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [timer, setTimer] = useState(30)

  // Generate random colors on game start
  useEffect(() => {
    setColors(getRandomColors(PAIRS_COUNT))
  }, [])

  // Timer logic
  useEffect(() => {
    if (timer > 0 && gameState === GAME_STATUS.PLAYING) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    }
    if (timer === 0) {
      setGameState(GAME_STATUS.FINISHED)
    }
  }, [timer, gameState])

  // Handle square click
  const handleColorClick = (index: number) => {
    if (matched.includes(index) || selections.includes(index)) return

    setSelections((prev) => {
      const newSelections = [...prev, index]

      if (newSelections.length === 2) {
        const [firstIndex, secondIndex] = newSelections

        if (colors[firstIndex] === colors[secondIndex]) {
          // Match found
          setMatched((prevMatched) => [...prevMatched, firstIndex, secondIndex])
        }

        // Reset selections after a short delay
        setTimeout(() => setSelections([]), 500)
      }

      return newSelections
    })
  }

  // Check if game is won (only if timer > 0)
  useEffect(() => {
    if (matched.length === colors.length && timer > 0) {
      setGameState(GAME_STATUS.FINISHED)
    }
  }, [matched, colors, timer])

  // Start game
  const handleStartGame = () => {
    setGameState(GAME_STATUS.PLAYING)
  }

  // Reset game
  const handlePlayAgain = () => {
    setGameState(GAME_STATUS.NOT_STARTED)
    setSelections([])
    setMatched([])
    setColors(getRandomColors(PAIRS_COUNT))
    setTimer(30)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: matched.length === colors.length ? 'lightgreen' : '#f0f0f0',
        padding: '1rem',
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Memory Game
      </Typography>

      {gameState === GAME_STATUS.NOT_STARTED && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartGame}
          sx={{ marginBottom: '1rem' }}
        >
          Play
        </Button>
      )}

      {gameState === GAME_STATUS.PLAYING && (
        <>
          <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
            Time Remaining: {timer}s
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: '400px' }}>
            {colors.map((color, index) => (
              <Grid item xs={3} key={index}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    backgroundColor:
                      matched.includes(index) || selections.includes(index) ? color : '#ccc',
                    borderRadius: '8px',
                    cursor: matched.includes(index) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease',
                  }}
                  onClick={() => handleColorClick(index)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {gameState === GAME_STATUS.FINISHED && (
        <>
          <Typography
            variant="h5"
            sx={{
              marginTop: '1rem',
              color: matched.length === colors.length && timer > 0 ? 'green' : 'red',
            }}
          >
            {matched.length === colors.length && timer > 0 ? 'You Win 😍' : 'Game Over 😢'}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayAgain}
            sx={{ marginTop: '1rem' }}
          >
            Play Again
          </Button>
        </>
      )}
    </Box>
  )
}
