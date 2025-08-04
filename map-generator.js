// map-generator.js

// simple pseudo-Perlin noise
function pseudoNoise(x, y) {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
}

const MAP_SIZE = 240;

const TILE_OCEAN    = 0;
const TILE_LAKE     = 1;
const TILE_PLAIN    = 2;
const TILE_FOREST   = 3;
const TILE_HILL     = 4;
const TILE_MOUNTAIN = 5;
const TILE_RIVER    = 6;

const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_LAKE]:     '#6ec5e3',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0',
  [TILE_RIVER]:    '#3fc2ff'
};

function generateHeightMap(size) {
  const H = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      h += 0.5 * pseudoNoise(x * 0.03, y * 0.03);
      h += 0.3 * pseudoNoise(x * 0.06, y * 0.06);
      h += 0.2 * pseudoNoise(x * 0.12, y * 0.12);
      const nx = (x/size - 0.5) * 2;
      const ny = (y/size - 0.5) * 2;
      const d2 = nx*nx + ny*ny;
      const edge = pseudoNoise(x*0.02+7, y*0.02+7) * 0.4 - 0.2;
      const mask = Math.max(0, 1 - d2 + edge);
      H[y][x] = h * mask;
    }
  }
  return H;
}

function percentile(sortedArr, p) {
  const idx = Math.floor((sortedArr.length - 1) * p);
  return sortedArr[idx];
}

function generateBiomeMap(size) {
  const H = generateHeightMap(size);
  const flat = H.flat().sort((a,b) => a - b);

  const seaLevel      = percentile(flat, 0.60);
  const lakeLevel     = percentile(flat, 0.62);
  const hillLevel     = percentile(flat, 0.80);
  const mountainLevel = percentile(flat, 0.92);

  const map = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const h = H[y][x];
      if      (h < seaLevel)            map[y][x] = TILE_OCEAN;
      else if (h < lakeLevel)           map[y][x] = TILE_LAKE;
      else if (h >= mountainLevel)      map[y][x] = TILE_MOUNTAIN;
      else if (h >= hillLevel)          map[y][x] = TILE_HILL;
      else                               map[y][x] = TILE_PLAIN;
    }
  }

  // internal lakes
  for (let i = 0; i < 6; i++) {
    const lx = Math.floor(Math.random() * size);
    const ly = Math.floor(Math.random() * size);
    const lr = 2 + Math.floor(Math.random() * 3);
    for (let dy = -lr; dy <= lr; dy++) {
      for (let dx = -lr; dx <= lr; dx++) {
        const xx = lx + dx, yy = ly + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size && map[yy][xx] !== TILE_OCEAN) {
          map[yy][xx] = TILE_LAKE;
        }
      }
    }
  }

  // forests
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === TILE_PLAIN && pseudoNoise(x*0.2, y*0.2) > 0.7) {
        map[y][x] = TILE_FOREST;
      }
    }
  }

  // major rivers
  for (let f = 0; f < 4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random() * size);
      sy = Math.floor(Math.random() * size);
    } while (![TILE_HILL, TILE_MOUNTAIN].includes(map[sy][sx]));

    let x = sx, y = sy;
    for (let i = 0; i < size * 1.5; i++) {
      if (map[y][x] === TILE_OCEAN) break;
      map[y][x] = TILE_RIVER;
      let best = H[y][x], nx = x, ny = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx>=0 && xx<size && yy>=0 && yy<size && H[yy][xx] < best) {
            best = H[yy][xx]; nx = xx; ny = yy;
          }
        }
      }
      x = nx; y = ny;
    }
  }

  return map;
}

window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const c = document.getElementById('game-map');
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  c.style.display = 'block';
  const ctx = c.getContext('2d');
  const tX = c.width / MAP_SIZE, tY = c.height / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x * tX, y * tY, tX, tY);
    }
  }
};

window.addEventListener('resize', () => {
  const c = document.getElementById('game-map');
  if (c.style.display === 'block') window.generateAndShowMapOnStart();
});
