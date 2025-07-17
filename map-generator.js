// === CONFIGURAZIONE SPRITESHEET ONDA ===
const waveAnim = new window.Image();
waveAnim.src = "assets/animations/wave01.png";
const WAVE_FRAMES = 18;
const WAVE_FPS = 17;
const WAVE_FRAME_WIDTH = 32;
const WAVE_FRAME_HEIGHT = 32;

// --- BIOMI ---
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

const MAP_SIZE = 80; // Più piccolo per UI; puoi aumentare se vuoi

let pixelWaves = [];

export function spawnWaves(map, now) {
  if (!spawnWaves.lastSpawn || now - spawnWaves.lastSpawn > 1300) {
    spawnWaves.lastSpawn = now;
    for (let i = 0; i < 3; i++) {
      let tries = 0, found = false, x, y;
      while (!found && tries < 40) {
        x = Math.floor(Math.random() * MAP_SIZE);
        y = Math.floor(Math.random() * MAP_SIZE);
        let type = map[y][x];
        if (type === TILE_OCEAN || type === TILE_LAKE || type === TILE_RIVER) found = true;
        tries++;
      }
      if (found) {
        pixelWaves.push({
          x, y,
          type: map[y][x],
          startTime: now,
          duration: 800 + Math.random() * 800
        });
      }
    }
  }
  pixelWaves = pixelWaves.filter(w => now - w.startTime < w.duration);
}

// Rumore semplice per biomi
function pseudoNoise(x, y, seed = 0) {
  return Math.abs(Math.sin(x * 0.037 + y * 0.011 + seed) * 43758.5453) % 1;
}

function generateBiomeMap(size) {
  const map = [];
  const seed = Math.random() * 1000;
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const nx = x / size - 0.5, ny = y / size - 0.5;
      let elevation = (
        pseudoNoise(x * 0.6, y * 0.6, seed) * 0.55 +
        pseudoNoise(x * 0.15, y * 0.18, seed + 5) * 0.35 +
        pseudoNoise(x * 0.02, y * 0.02, seed + 11) * 0.10
      );

      // Oceano ai bordi
      if (Math.abs(nx) > 0.48 || Math.abs(ny) > 0.48) {
        row.push(TILE_OCEAN);
        continue;
      }
      // Fiume centrale
      if (Math.abs(nx) < 0.04) {
        row.push(TILE_RIVER);
        continue;
      }
      // Laghi sparsi
      if (pseudoNoise(x * 2.2, y * 2.2, seed + 8) > 0.97 && elevation > 0.30 && elevation < 0.60) {
        row.push(TILE_LAKE); continue;
      }
      // Montagne
      if (elevation > 0.80) { row.push(TILE_MOUNTAIN); }
      // Colline
      else if (elevation > 0.65) { row.push(TILE_HILL); }
      // Foreste
      else if (pseudoNoise(x * 1.3, y * 1.3, seed + 23) > 0.73) { row.push(TILE_FOREST); }
      else { row.push(TILE_PLAIN); }
    }
    map.push(row);
  }
  return map;
}

export function drawMapOnCanvas(map, canvas, zoom = 1, offsetX = 0, offsetY = 0, now = 0) {
  let width = canvas.width;
  let height = canvas.height;
  let ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(offsetX, offsetY);
  ctx.scale(zoom, zoom);

  let tX = width / MAP_SIZE;
  let tY = height / MAP_SIZE;

  let startX = 0, endX = MAP_SIZE;
  let startY = 0, endY = MAP_SIZE;

  let waveMap = new Map();
  for (const w of pixelWaves) {
    if (w.x >= startX && w.x < endX && w.y >= startY && w.y < endY)
      waveMap.set(w.y + "," + w.x, w);
  }
  let frameIdx = 0;
  if (waveAnim.complete && waveAnim.naturalWidth > 0) {
    frameIdx = Math.floor((now / (1000 / WAVE_FPS)) % WAVE_FRAMES);
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      let type = map[y][x];
      let color = COLORS[type];
      let key = y + "," + x;
      if (waveMap.has(key) && waveAnim.complete && waveAnim.naturalWidth > 0) {
        ctx.drawImage(
          waveAnim,
          frameIdx * WAVE_FRAME_WIDTH, 0,
          WAVE_FRAME_WIDTH, WAVE_FRAME_HEIGHT,
          x * tX, y * tY, tX * 2, tY * 2
        );
        continue;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x * tX, y * tY, tX + 1, tY + 1);
    }
  }
  ctx.restore();
}

// Mostra la mappa SOLO nel div centrale
export function generateAndShowMapOnStart() {
    let map = generateBiomeMap(MAP_SIZE);

    // Cerca il container centrale per la UI
    let container = document.querySelector('.main-ui') || document.querySelector('.center-container');
    if (!container) container = document.body;

    let canvas = document.getElementById('game-map');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'game-map';
        canvas.style.width = "100%";
        canvas.style.height = "320px"; // Puoi cambiare l'altezza
        canvas.width = container.offsetWidth;
        canvas.height = 320; // Puoi cambiare qui l'altezza
        container.appendChild(canvas);
    } else {
        canvas.width = container.offsetWidth;
        canvas.height = 320;
        canvas.style.width = "100%";
        canvas.style.height = "320px";
    }

    drawMapOnCanvas(map, canvas, 1, 0, 0, Date.now());
}
