// map-generator.js

// Rumore “pseudo-Perlin” semplice
function pseudoNoise(x, y) {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
}

// Dimensione della griglia (più alto = coste più dettagliate)
const MAP_SIZE = 240;

// Tipi di terreno
const TILE_OCEAN    = 0;
const TILE_LAKE     = 1;
const TILE_PLAIN    = 2;
const TILE_FOREST   = 3;
const TILE_HILL     = 4;
const TILE_MOUNTAIN = 5;
const TILE_RIVER    = 6;

// Colori dei biomi
const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_LAKE]:     '#6ec5e3',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0',
  [TILE_RIVER]:    '#3fc2ff'
};

// Genera heightmap multi-octave + maschera continentale
function generateHeightMap(size) {
  const H = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      h += 0.6 * pseudoNoise(x * 0.03, y * 0.03);
      h += 0.3 * pseudoNoise(x * 0.06, y * 0.06);
      h += 0.1 * pseudoNoise(x * 0.12, y * 0.12);
      const nx = (x/size - 0.5) * 2;
      const ny = (y/size - 0.5) * 2;
      const d = Math.sqrt(nx*nx + ny*ny);
      const edge = pseudoNoise(x*0.02+5, y*0.02+5) * 0.2;
      const mask = Math.max(0, 1 - d + edge);
      H[y][x] = h * mask;
    }
  }
  return H;
}

// Estrae il valore al percentile p di un array ordinato
function percentile(sortedArr, p) {
  const idx = Math.floor((sortedArr.length - 1) * p);
  return sortedArr[idx];
}

// Costruisce la mappa di biomi usando percentile per livello del mare
function generateBiomeMap(size) {
  const H = generateHeightMap(size);
  const flat = H.flat().sort((a,b)=>a-b);
  const seaLevel     = percentile(flat, 0.60);
  const lakeLevel    = percentile(flat, 0.62);
  const hillLevel    = percentile(flat, 0.80);
  const mountainLevel= percentile(flat, 0.92);

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

  // Foreste
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === TILE_PLAIN && pseudoNoise(x*0.2, y*0.2) > 0.7) {
        map[y][x] = TILE_FOREST;
      }
    }
  }

  // Fiumi
  for (let f = 0; f < 4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random()*size);
      sy = Math.floor(Math.random()*size);
    } while (![TILE_HILL, TILE_MOUNTAIN].includes(map[sy][sx]));

    let x = sx, y = sy;
    for (let i = 0; i < size * 1.5; i++) {
      if (map[y][x] === TILE_OCEAN) break;
      map[y][x] = TILE_RIVER;
      let best = H[y][x], nx = x, ny = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx>=0&&xx<size&&yy>=0&&yy<size && H[yy][xx] < best) {
            best = H[yy][xx]; nx = xx; ny = yy;
          }
        }
      }
      x = nx; y = ny;
    }
  }

  return map;
}

// Mostra la mappa a schermo intero
window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const canvas = document.getElementById('game-map');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  const tX = canvas.width  / MAP_SIZE;
  const tY = canvas.height / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x * tX, y * tY, tX, tY);
    }
  }
};

// Ridisegna se ridimensioni
window.addEventListener('resize', () => {
  const c = document.getElementById('game-map');
  if (c.style.display === 'block') window.generateAndShowMapOnStart();
});
