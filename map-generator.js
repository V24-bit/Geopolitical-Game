// map-generator.js

// Tipi di terreno
const TILE_OCEAN    = 0;
const TILE_LAKE     = 1;
const TILE_PLAIN    = 2;
const TILE_FOREST   = 3;
const TILE_HILL     = 4;
const TILE_MOUNTAIN = 5;
const TILE_RIVER    = 6;

// Palette di colori
const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_LAKE]:     '#6ec5e3',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0',
  [TILE_RIVER]:    '#3fc2ff'
};

const MAP_SIZE = 240;

// Rumore “pseudo-Perlin” semplice
function pseudoNoise(x, y) {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
}

// Heightmap multi-octave
function heightAt(x, y) {
  let h = 0;
  h += 0.6 * pseudoNoise(x * 0.05, y * 0.05);
  h += 0.3 * pseudoNoise(x * 0.1,  y * 0.1);
  h += 0.1 * pseudoNoise(x * 0.2,  y * 0.2);
  return h;
}

// Genera la mappa di biomi
function generateBiomeMap(size) {
  const map = Array.from({ length: size }, () => Array(size).fill(0));

  // Soglie
  const seaLevel = 0.35;
  const lakeLevel = 0.38;
  const hillLevel = 0.6;
  const mountainLevel = 0.8;

  // Prima classificazione base
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const h = heightAt(x, y);
      if (h < seaLevel)        map[y][x] = TILE_OCEAN;
      else if (h < lakeLevel)  map[y][x] = TILE_LAKE;
      else if (h >= mountainLevel) map[y][x] = TILE_MOUNTAIN;
      else if (h >= hillLevel) map[y][x] = TILE_HILL;
      else                     map[y][x] = TILE_PLAIN;
    }
  }

  // Foreste in pianura
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === TILE_PLAIN && pseudoNoise(x*0.3, y*0.3) > 0.7) {
        map[y][x] = TILE_FOREST;
      }
    }
  }

  // Fiumi: 4 sorgenti casuali in collina
  for (let f = 0; f < 4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random() * size);
      sy = Math.floor(Math.random() * size);
    } while (map[sy][sx] !== TILE_HILL && map[sy][sx] !== TILE_MOUNTAIN);

    let x = sx, y = sy;
    for (let i = 0; i < size * 1.5; i++) {
      if (map[y][x] === TILE_OCEAN) break;
      map[y][x] = TILE_RIVER;
      // passo successivo: sceglie vicino con minor height
      let bestH = heightAt(x, y), nx = x, ny = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
            const hh = heightAt(xx, yy);
            if (hh < bestH) {
              bestH = hh; nx = xx; ny = yy;
            }
          }
        }
      }
      x = nx; y = ny;
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

// Ridisegna on resize
window.addEventListener('resize', () => {
  const c = document.getElementById('game-map');
  if (c.style.display === 'block') window.generateAndShowMapOnStart();
});
