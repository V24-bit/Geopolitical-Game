const TILE_WATER = 0;
const TILE_PLAIN = 1;
const TILE_MOUNTAIN = 2;

const COLORS = {
  [TILE_WATER]: '#3896e2',
  [TILE_PLAIN]: '#19cf86',
  [TILE_MOUNTAIN]: '#444444'
};

const MAP_SIZE = 250;
const MIN_WATER_BORDER = 2;
const MAX_WATER_BORDER = 35;
const INITIAL_MOUNTAINS = 10;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera bordo acqua variabile
function generateWaterBorderMap() {
  const map = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill(TILE_PLAIN));
  const borderTop = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const borderBottom = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const borderLeft = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const borderRight = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (
        y < borderTop[x] ||
        y >= MAP_SIZE - borderBottom[x] ||
        x < borderLeft[y] ||
        x >= MAP_SIZE - borderRight[y]
      ) {
        map[y][x] = TILE_WATER;
      }
    }
  }
  return map;
}

// Laghi/strisce d'acqua interne
function addInternalWater(map, count = 22) {
  for (let i = 0; i < count; i++) {
    const lakeSize = randomInt(2, 30);
    const isHorizontal = Math.random() < 0.5;
    if (isHorizontal) {
      const y = randomInt(MAX_WATER_BORDER, MAP_SIZE - MAX_WATER_BORDER - 1);
      const xStart = randomInt(MAX_WATER_BORDER, MAP_SIZE - lakeSize - MAX_WATER_BORDER - 1);
      for (let dx = 0; dx < lakeSize; dx++) {
        map[y][xStart + dx] = TILE_WATER;
      }
    } else {
      const x = randomInt(MAX_WATER_BORDER, MAP_SIZE - MAX_WATER_BORDER - 1);
      const yStart = randomInt(MAX_WATER_BORDER, MAP_SIZE - lakeSize - MAX_WATER_BORDER - 1);
      for (let dy = 0; dy < lakeSize; dy++) {
        map[yStart + dy][x] = TILE_WATER;
      }
    }
  }
}

// Isole di pianura
function addPlainsIslands(map, count = 10) {
  for (let i = 0; i < count; i++) {
    const radius = randomInt(3, 9);
    const cx = randomInt(MAX_WATER_BORDER + radius, MAP_SIZE - MAX_WATER_BORDER - radius - 1);
    const cy = randomInt(MAX_WATER_BORDER + radius, MAP_SIZE - MAX_WATER_BORDER - radius - 1);
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x*x + y*y <= radius*radius) {
          const nx = cx + x, ny = cy + y;
          if (
            nx >= 0 && nx < MAP_SIZE &&
            ny >= 0 && ny < MAP_SIZE &&
            map[ny][nx] === TILE_WATER
          ) {
            map[ny][nx] = TILE_PLAIN;
          }
        }
      }
    }
  }
}

// Controlla se una cella tocca solo pianure
function onlyTouchingPlains(map, x, y) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (
      nx >= 0 && nx < MAP_SIZE &&
      ny >= 0 && ny < MAP_SIZE
    ) {
      if (map[ny][nx] !== TILE_PLAIN) return false;
    }
  }
  return true;
}

// Montagne iniziali
function placeInitialMountains(map) {
  let placed = 0;
  const positions = [];
  let attempts = 0;
  while (placed < INITIAL_MOUNTAINS && attempts < 10000) {
    const x = randomInt(MAX_WATER_BORDER, MAP_SIZE - MAX_WATER_BORDER - 1);
    const y = randomInt(MAX_WATER_BORDER, MAP_SIZE - MAX_WATER_BORDER - 1);
    if (
      map[y][x] === TILE_PLAIN &&
      onlyTouchingPlains(map, x, y)
    ) {
      map[y][x] = TILE_MOUNTAIN;
      positions.push({x, y, generated: false});
      placed++;
    }
    attempts++;
  }
  return positions;
}

// Propagazione montagne
function propagateMountains(map, initialMountains) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  let queue = [...initialMountains];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (cell.generated) continue;
    if (Math.random() < 0.5) {
      const shuffledDirs = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffledDirs) {
        const nx = cell.x + dx, ny = cell.y + dy;
        if (
          nx >= 0 && nx < MAP_SIZE &&
          ny >= 0 && ny < MAP_SIZE &&
          map[ny][nx] === TILE_PLAIN &&
          onlyTouchingPlains(map, nx, ny)
        ) {
          map[ny][nx] = TILE_MOUNTAIN;
          queue.push({x: nx, y: ny, generated: false});
          break;
        }
      }
    }
    cell.generated = true;
  }
}

// Disegna la mappa su canvas a schermo intero
function drawMapOnCanvas(map, canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const tileSizeX = canvas.width / MAP_SIZE;
  const tileSizeY = canvas.height / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x * tileSizeX, y * tileSizeY, tileSizeX, tileSizeY);
    }
  }
}

// Funzione principale da chiamare su "Start Game"
export function generateAndShowMapOnStart(canvasId = 'game-map') {
  // Chiedi schermo intero
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  }
  // Nascondi UI principale
  const mainUI = document.querySelector('.main-ui');
  if (mainUI) mainUI.style.display = 'none';

  let map = generateWaterBorderMap();
  addInternalWater(map, 22);
  addPlainsIslands(map, 10);
  const initialMountains = placeInitialMountains(map);
  propagateMountains(map, initialMountains);

  // Trova o crea canvas
  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 1111;
    document.body.appendChild(canvas);
  }
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawMapOnCanvas(map, canvas);

  // Ridisegna su resize
  window.onresize = () => drawMapOnCanvas(map, canvas);
}
