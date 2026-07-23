# Train Tile Game

A puzzle game where players guide a train through a dynamically generated grid by choosing tile placements. The goal is to visit all stations on the level before the train exits the grid.

## Game Mechanics

### Core Loop
- **Train Movement**: Train moves one tile per second in its current direction
- **Tile Placement**: As the train enters a new tile in the grid, a tile is automatically placed
- **Direction Changes**: Player presses arrow keys to change the train's direction before entering the next tile
- **Station Visiting**: Train must visit all stations to win
- **Derailing**: If the train enters a tile without a track exit in its direction, it derails (lose)

### Tile System
- Each tile is 96×96 pixels
- Tiles have exits in different directions: N (north), E (east), S (south), W (west)
- Tiles are defined by their exit configuration:
  - `N-S`: vertical straight track
  - `E-W`: horizontal straight track
  - `N-E`, `E-S`, `S-W`, `W-N`: corner tiles
  - `N-E-S`, `E-S-W`, `S-W-N`, `W-N-E`: T-junctions
  - `N-E-S-W`: 4-way intersection

### Input
- **Arrow Keys**: Change direction before train enters next tile
  - Left: turn left (counterclockwise)
  - Right: turn right (clockwise)
  - Up: continue north / turn left from other directions
  - Down: turn right

### Level Design (Level 1)
- Grid: 3×3
- Starting tile: position (1, 3) below the grid
- Train starts heading north
- Stations: (0,0), (2,1), (1,2)
- Win: Visit all 3 stations, then exit the grid

## Project Structure

```
src/
├── App.jsx          # Main game component with logic
├── App.css          # Game styling
└── assets/
    ├── tracks_96x96.png              # Tile sprite sheet
    ├── train_animation_by_elinthind_dm991ho.png  # Train sprite
    └── train_tiles_by_elinthind_dm98ynm.png      # Static train (unused)
```

## Development Notes

### Key State Variables
- `grid`: Object mapping "x,y" coordinates to tile types
- `trainPos`: Current train position {x, y}
- `trainDir`: Current direction (0=N, 1=E, 2=S, 3=W)
- `nextDir`: Player's input direction (null if none)
- `gameState`: "playing", "won", or "lost"
- `visitedStations`: Set of visited station coordinates

### Game Loop
- Runs every 1000ms (1 second)
- Moves train one tile in current direction
- Checks for valid tile existence/placement
- Detects station visits and win/loss conditions

### Tile Sprite Mapping
Tiles are stored in a sprite sheet. The `TILE_SPRITES` object maps tile types to their position in the image (row, col).

### To Run
```bash
npm install
npm run dev
```
Server runs on `http://localhost:5173`

## Future Features
- Multiple levels with different grid sizes and station layouts
- Difficulty modes (time pressure, limited tiles)
- Score/stat tracking
- Animations for train movement and tile placement
- Sound effects
