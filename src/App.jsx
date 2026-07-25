import { useState, useEffect, useRef } from 'react'
import tracksImg from './assets/tracks_96x96.png'
import trainAnimationImg from './assets/train_animation_by_elinthind_dm991ho.png'
import './App.css'

const TILE_SIZE = 96
const GRID_SIZE = 3

// Directions: 0=N, 1=E, 2=S, 3=W
const DIRECTIONS = { N: 0, E: 1, S: 2, W: 3 }
const DIR_NAMES = ['N', 'E', 'S', 'W']
const DIR_VECTORS = [
  { x: 0, y: -1 },  // N
  { x: 1, y: 0 },   // E
  { x: 0, y: 1 },   // S
  { x: -1, y: 0 }   // W
]

// Tile types: which directions have exits
// Format: [N, E, S, W] = [top, right, bottom, left]
const TILE_TYPES = {
  'N-S': [1, 0, 1, 0],
  'E-W': [0, 1, 0, 1],
  'N-E': [1, 1, 0, 0],
  'E-S': [0, 1, 1, 0],
  'S-W': [0, 0, 1, 1],
  'W-N': [1, 0, 0, 1],
  'N-E-S': [1, 1, 1, 0],
  'E-S-W': [0, 1, 1, 1],
  'S-W-N': [1, 0, 1, 1],
  'W-N-E': [1, 1, 0, 1],
  'N-E-S-W': [1, 1, 1, 1]
}

// Tile sprite positions in the image (row, col)
const TILE_SPRITES = {
  'N-S': { row: 1, col: 2 },
  'E-W': { row: 2, col: 3 },
  'N-E': { row: 0, col: 2 },
  'E-S': { row: 1, col: 2 },
  'S-W': { row: 2, col: 0 },
  'W-N': { row: 0, col: 1 },
  'N-E-S': { row: 1, col: 0 },
  'E-S-W': { row: 1, col: 3 },
  'S-W-N': { row: 2, col: 1 },
  'W-N-E': { row: 0, col: 3 },
  'N-E-S-W': { row: 2, col: 2 }
}

function getTileForTransition(currentDir, nextDir) {
  const dirs = [currentDir, nextDir].sort()
  const key = DIR_NAMES[dirs[0]] + '-' + DIR_NAMES[dirs[1]]

  // Find tile with both exits
  for (const [tileType, exits] of Object.entries(TILE_TYPES)) {
    const hasCurrentExit = exits[(currentDir + 2) % 4] === 1 // Opposite direction (entry)
    const hasNextExit = exits[nextDir] === 1

    if (hasCurrentExit && hasNextExit) {
      // Check if this is the best match (not too many extra exits)
      const exitCount = exits.reduce((a, b) => a + b, 0)
      if (exitCount === 2) return tileType
    }
  }

  return 'N-S'
}

function GameCanvas({ grid, trainPos, trainDir, stations }) {
  const canvasRef = useRef(null)
  const tracksRef = useRef(null)
  const trainRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !tracksRef.current || !trainRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    const offsetX = (canvas.width - GRID_SIZE * TILE_SIZE) / 2
    const offsetY = (canvas.height - GRID_SIZE * TILE_SIZE) / 2

    // Draw tiles
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = offsetX + col * TILE_SIZE
        const y = offsetY + row * TILE_SIZE

        const tileId = `${col},${row}`
        if (grid[tileId]) {
          const sprite = TILE_SPRITES[grid[tileId].type]
          ctx.drawImage(
            tracksRef.current,
            sprite.col * TILE_SIZE, sprite.row * TILE_SIZE, TILE_SIZE, TILE_SIZE,
            x, y, TILE_SIZE, TILE_SIZE
          )

          // Draw station indicator if it's a station
          if (stations.some(s => s.x === col && s.y === row)) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)'
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
          }
        }
      }
    }

    // Draw train
    const trainX = offsetX + trainPos.x * TILE_SIZE + TILE_SIZE / 2
    const trainY = offsetY + trainPos.y * TILE_SIZE + TILE_SIZE / 2

    ctx.save()
    ctx.translate(trainX, trainY)
    ctx.rotate((trainDir * Math.PI) / 2)
    ctx.drawImage(trainRef.current, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE)
    ctx.restore()
  }, [grid, trainPos, trainDir, stations])

  return (
    <>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{ border: '2px solid #555', marginBottom: '20px' }}
      />
      <img ref={tracksRef} src={tracksImg} style={{ display: 'none' }} />
      <img ref={trainRef} src={trainAnimationImg} style={{ display: 'none' }} />
    </>
  )
}

function App() {
  const [grid, setGrid] = useState({
    '1,3': { type: 'N-S' }  // Starting tile below the grid
  })
  const [trainPos, setTrainPos] = useState({ x: 1, y: 3 })
  const [trainDir, setTrainDir] = useState(DIRECTIONS.N)
  const [nextDir, setNextDir] = useState(null)
  const [gameState, setGameState] = useState('playing') // playing, won, lost
  const [stations] = useState([
    { x: 0, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 2 }
  ])
  const [visitedStations, setVisitedStations] = useState(new Set())

  // Handle keyboard input
  useEffect(() => {
    function handleKeyPress(e) {
      if (gameState !== 'playing') return

      if (e.key === 'ArrowLeft') {
        setNextDir((trainDir + 3) % 4)
      } else if (e.key === 'ArrowRight') {
        setNextDir((trainDir + 1) % 4)
      } else if (e.key === 'ArrowUp') {
        setNextDir((trainDir + 3) % 4)
      } else if (e.key === 'ArrowDown') {
        setNextDir((trainDir + 1) % 4)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [trainDir, gameState])

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState !== 'playing') return

      setTrainPos(prev => {
        const newPos = {
          x: prev.x + DIR_VECTORS[trainDir].x,
          y: prev.y + DIR_VECTORS[trainDir].y
        }

        const tileId = `${newPos.x},${newPos.y}`
        const isInGrid = newPos.x >= 0 && newPos.x < GRID_SIZE && newPos.y >= 0 && newPos.y < GRID_SIZE
        const isStartingTile = newPos.x === 1 && newPos.y === 3

        // Check if train is on a valid tile
        if (isInGrid || isStartingTile) {
          // Verify tile exists and has proper exit
          if (grid[tileId]) {
            const exits = TILE_TYPES[grid[tileId].type]
            const entryDir = (trainDir + 2) % 4
            if (!exits[entryDir]) {
              setGameState('lost')
              return prev
            }
          } else if (isInGrid) {
            // Need to add a tile to the grid
            const moveDir = nextDir !== null ? nextDir : trainDir
            const newTileType = getTileForTransition(trainDir, moveDir)

            setGrid(g => ({
              ...g,
              [tileId]: { type: newTileType }
            }))

            if (nextDir !== null) {
              setTrainDir(nextDir)
              setNextDir(null)
            }
          }

          // Check if station visited
          const station = stations.find(s => s.x === newPos.x && s.y === newPos.y)
          if (station) {
            setVisitedStations(v => new Set([...v, `${station.x},${station.y}`]))
          }
        } else {
          // Train exited the playing area
          if (visitedStations.size === stations.length) {
            setGameState('won')
          } else {
            setGameState('lost')
          }
          return prev
        }

        return newPos
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [grid, trainDir, nextDir, gameState, stations, visitedStations])

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Train Tile Game</h1>
      <GameCanvas grid={grid} trainPos={trainPos} trainDir={trainDir} stations={stations} />

      <div style={{ marginBottom: '20px' }}>
        <p>Stations visited: {visitedStations.size} / {stations.length}</p>
        {gameState === 'won' && <h2 style={{ color: 'green' }}>You Won!</h2>}
        {gameState === 'lost' && <h2 style={{ color: 'red' }}>Game Over - Derailed!</h2>}
      </div>

      <div style={{ marginTop: '20px', color: '#aaa' }}>
        <p>Use arrow keys to change direction</p>
        <p>Guide the train through all stations!</p>
      </div>
    </div>
  )
}

export default App
