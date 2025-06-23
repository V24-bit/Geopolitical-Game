// map-generator.js

const TILE_WATER = 0;
const TILE_PLAIN = 1;
const TILE_MOUNTAIN = 2;

const COLORS = {
  [TILE_WATER]: '#3896e2',
  [TILE_PLAIN]: '#19cf86',
  [TILE_MOUNTAIN]: '#666666'
};

const MAP_SIZE = 250;
const MIN_WATER_BORDER = 2;
const MAX_WATER_BORDER = 35;
const INITIAL_MOUNTAINS = 10;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Genera bordo acqua variabile
function generateWaterBorderMap() {
  const map = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill(TILE_PLAIN));

  // Prepara per ogni lato un array di profondità random
  const topBorder = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const bottomBorder = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const leftBorder = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));
  const rightBorder = Array.from({length: MAP_SIZE}, () => randomInt(MIN_WATER_BORDER, MAX_WATER_BORDER));

  // Applica bordo acqua
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (
        y < topBorder[x] ||
        y >= MAP_SIZE - bottomBorder[x] ||
        x < leftBorder[y] ||
        x >= MAP_SIZE - rightBorder[y]
      ) {
        map[y][x] = TILE_WATER;
      }
    }
  }
  return map;
}

// 2. Aggiungi laghi/strisce d'acqua interne
function addInternalWater(map, count = 20) {
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

// 3. Genera isole di pianura
function addPlainsIslands(map, count = 8) {
  for (let i = 0; i < count; i++) {
    const islandRadius = randomInt(3, 10);
    const cx = randomInt(MAX_WATER_BORDER + islandRadius, MAP_SIZE - MAX_WATER_BORDER - islandRadius - 1);
    const cy = randomInt(MAX_WATER_BORDER + islandRadius, MAP_SIZE - MAX_WATER_BORDER - islandRadius - 1);
    for (let y = -islandRadius; y <= islandRadius; y++) {
      for (let x = -islandRadius; x <= islandRadius; x++) {
        if (x * x + y * y <= islandRadius * islandRadius) {
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

// 4. Check se una cella è solo confinante con pianure
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

// 5. Generazione montagne iniziali
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

// 6. Propagazione montagne
function propagateMountains(map, initialMountains) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  let queue = [...initialMountains];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (cell.generated) continue; // Solo una generazione per tile
    if (Math.random() < 0.5) {
      // Prova a propagare in una direzione casuale solo su pianura
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
          break; // Solo uno per cella
        }
      }
    }
    cell.generated = true;
  }
}

// 7. Disegna la mappa su canvas a schermo intero
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

// 8. Funzione principale che puoi chiamare su start game
export function generateAndShowMapOnStart(canvasId = 'game-map') {
  // Nascondi altri elementi UI se serve
  document.body.requestFullscreen?.();

  let map = generateWaterBorderMap();
  addInternalWater(map, 20);
  addPlainsIslands(map, 8);
  const initialMountains = placeInitialMountains(map);
  propagateMountains(map, initialMountains);

  // Mostra canvas e disegna
  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 1000;
    document.body.appendChild(canvas);
  }
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawMapOnCanvas(map, canvas);

  // Redraw on resize
  window.onresize = () => drawMapOnCanvas(map, canvas);
}
