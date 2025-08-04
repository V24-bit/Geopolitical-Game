// map-generator.js

// Rumore “pseudo-Perlin” semplice
function pseudoNoise(x, y) {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
}

// Risoluzione griglia
const MAP_SIZE = 240;

// Tipi di terreno
const TILE_OCEAN    = 0;
const TILE_PLAIN    = 1;
const TILE_FOREST   = 2;
const TILE_HILL     = 3;
const TILE_MOUNTAIN = 4;

// Palette colori
const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0'
};

// 1) Genera heightmap multi-octave + maschera soft
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

// 2) Percentile helper
function percentile(sortedArr, p) {
  const idx = Math.floor((sortedArr.length - 1) * p);
  return sortedArr[idx];
}

// 3) Costruisci biomi e isole
function generateBiomeMap(size) {
  const H = generateHeightMap(size);
  const flat = H.flat().sort((a,b)=>a-b);

  // vattene il 60% in oceano
  const seaLevel = percentile(flat, 0.60);

  // classificazione base (solo oceano vs terra)
  const map = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      map[y][x] = (H[y][x] < seaLevel ? TILE_OCEAN : TILE_PLAIN);
    }
  }

  // 4) Aggiungi isole: 30 centri casuali
  for (let i = 0; i < 30; i++) {
    const cx = Math.floor(Math.random() * size);
    const cy = Math.floor(Math.random() * size);
    const r  = 2 + Math.floor(Math.random() * 4); // raggio 2–5
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
          if (dx*dx + dy*dy <= r*r) {
            map[yy][xx] = TILE_PLAIN;
          }
        }
      }
    }
  }

  // 5) Planure → colline/montagne/foreste
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] !== TILE_OCEAN) {
        const h = H[y][x];
        if      (h > 0.75) map[y][x] = TILE_MOUNTAIN;
        else if (h > 0.50) map[y][x] = TILE_HILL;
        else if (pseudoNoise(x*0.2, y*0.2) > 0.7) map[y][x] = TILE_FOREST;
        else map[y][x] = TILE_PLAIN;
      }
    }
  }

  return map;
}

// 6) Disegna full-screen
window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const c = document.getElementById('game-map');
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  c.style.display = 'block';
  const ctx = c.getContext('2d');
  const tX = c.width  / MAP_SIZE;
  const tY = c.height / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x*tX, y*tY, tX, tY);
    }
  }
};
window.addEventListener('resize', () => {
  const c = document.getElementById('game-map');
  if (c.style.display === 'block') window.generateAndShowMapOnStart();
});
