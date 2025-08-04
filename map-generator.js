// map-generator.js

// Assicurati che SimplexNoise sia stato caricato prima (vedi index.html):
// <script src="https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/simplex-noise.min.js"></script>

// Crea l’istanza usando window.SimplexNoise
const simplex = new window.SimplexNoise();

// Tipi di terreno
const TILE_OCEAN    = 0;
const TILE_LAKE     = 1;
const TILE_PLAIN    = 2;
const TILE_FOREST   = 3;
const TILE_HILL     = 4;
const TILE_MOUNTAIN = 5;
const TILE_RIVER    = 6;

// Colori associati
const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_LAKE]:     '#6ec5e3',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0',
  [TILE_RIVER]:    '#3fc2ff'
};

const MAP_SIZE = 120;  // Dimensione della griglia

// Parametri per multi-octave noise
const OCTAVES = [
  { freq: 0.04, amp: 1.0 },
  { freq: 0.08, amp: 0.5 },
  { freq: 0.16, amp: 0.25 }
];

// Funzione di noise combinata
function multiNoise(x, y) {
  let sum = 0, norm = 0;
  for (let o of OCTAVES) {
    sum += o.amp * simplex.noise2D(x * o.freq, y * o.freq);
    norm += o.amp;
  }
  return sum / norm;  // Valore in [-1,1]
}

// Maschera continentale per formare continenti e isole
function continentMask(x, y, size) {
  let nx = (x/size - 0.5) * 2;
  let ny = (y/size - 0.5) * 2;
  let d = Math.sqrt(nx*nx + ny*ny);       // distanza dal centro
  let edgeNoise = simplex.noise2D(x * 0.02 + 10, y * 0.02 + 10) * 0.2;
  return Math.max(0, 1 - d + edgeNoise);
}

// Genera la mappa dei biomi (heightmap + classificazione)
function generateBiomeMap(size) {
  // Preparazione heightmap
  const height = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = (multiNoise(x, y) + 1) / 2;    // da [–1,1] a [0,1]
      let m = continentMask(x, y, size);
      height[y][x] = n * m;
    }
  }

  // Soglie per tipi
  const seaLevel = 0.3;
  const lakeLevel = 0.33;
  const hillLevel = 0.6;
  const mountainLevel = 0.8;

  // Classificazione iniziale
  const map = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      let h = height[y][x];
      if (h < seaLevel) row.push(TILE_OCEAN);
      else if (h < lakeLevel) row.push(TILE_LAKE);
      else if (h >= mountainLevel) row.push(TILE_MOUNTAIN);
      else if (h >= hillLevel) row.push(TILE_HILL);
      else row.push(TILE_PLAIN);
    }
    map.push(row);
  }

  // Aggiungi foreste su pianure
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === TILE_PLAIN) {
        if (simplex.noise2D(x * 0.1 + 5, y * 0.1 + 5) > 0.4) {
          map[y][x] = TILE_FOREST;
        }
      }
    }
  }

  // Genera 4 fiumi
  for (let f = 0; f < 4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random() * size);
      sy = Math.floor(Math.random() * size);
    } while (height[sy][sx] < hillLevel);

    let [x, y] = [sx, sy];
    for (let i = 0; i < size * 1.5; i++) {
      map[y][x] = TILE_RIVER;
      // Trova il vicino più basso
      let minH = height[y][x], nx = x, ny = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          let xx = x + dx, yy = y + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
            if (height[yy][xx] < minH) {
              minH = height[yy][xx];
              nx = xx; ny = yy;
            }
          }
        }
      }
      if (map[ny][nx] === TILE_OCEAN) break;
      [x, y] = [nx, ny];
    }
  }

  return map;
}

// Funzione globale per disegnare e mostrare la mappa
window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const canvas = document.getElementById('game-map');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  const tX = canvas.width / MAP_SIZE;
  const tY = canvas.height / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x * tX, y * tY, tX, tY);
    }
  }
};

// Ridisegna in caso di resize
window.addEventListener('resize', () => {
  const canvas = document.getElementById('game-map');
  if (canvas.style.display === 'block') {
    window.generateAndShowMapOnStart();
  }
});
