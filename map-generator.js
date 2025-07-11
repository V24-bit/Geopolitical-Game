// --- Simplex Noise (resta invariato, lascia la tua implementazione qui) ---

// === CONFIGURAZIONE SPRITESHEET ONDA ===
const waveAnim = new window.Image();
waveAnim.src = "assets/animations/wave01.png";
const WAVE_FRAMES = 18;       // Numero di frame
const WAVE_FPS = 17;          // Velocità animazione (come in Piskel)
const WAVE_FRAME_WIDTH = 32;  // Larghezza frame in px
const WAVE_FRAME_HEIGHT = 32; // Altezza frame in px

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

const MAP_SIZE = 750;

// --- Onde pixelart leggere (spot) ---
let pixelWaves = [];

// Genera nuove onde in punti casuali su acqua
function spawnWaves(map, now) {
  if (!spawnWaves.lastSpawn || now - spawnWaves.lastSpawn > 1300) {
    spawnWaves.lastSpawn = now;
    for (let i = 0; i < 8; i++) {
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
          duration: 800 + Math.random() * 800 // ms
        });
      }
    }
  }
  // Rimuovi onde vecchie
  pixelWaves = pixelWaves.filter(w => now - w.startTime < w.duration);
}

// Disegna la mappa e le onde animate
function drawMapOnCanvas(map, canvas, zoom = 1, offsetX = 0, offsetY = 0, now = 0) {
  let width = canvas.width;
  let height = canvas.height;
  let ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
  ctx.clearRect(0, 0, width, height);
  ctx.translate(offsetX, offsetY);
  ctx.scale(zoom, zoom);

  let tX = width / MAP_SIZE;
  let tY = height / MAP_SIZE;

  let startX = Math.max(0, Math.floor(-offsetX / (tX * zoom)));
  let endX = Math.min(MAP_SIZE, Math.ceil((width - offsetX) / (tX * zoom)));
  let startY = Math.max(0, Math.floor(-offsetY / (tY * zoom)));
  let endY = Math.min(MAP_SIZE, Math.ceil((height - offsetY) / (tY * zoom)));

  // Prepara una mappa di onde attive
  let waveMap = new Map();
  for (const w of pixelWaves) {
    if (w.x >= startX && w.x < endX && w.y >= startY && w.y < endY)
      waveMap.set(w.y + "," + w.x, w);
  }

  // Calcola il frame corrente dell'animazione onda
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
          x * tX, y * tY, tX * 2, tY * 2 // cambia a tX, tY se le vuoi più piccole
        );
        continue;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x * tX, y * tY, tX + 1, tY + 1);
    }
  }
  ctx.restore();
}

// Le altre funzioni (generazione mappa, export, ecc.) rimangono come nel tuo file originale!
// Se vuoi puoi semplicemente incollare solo la parte sopra, lasciando tutto il resto invariato.

export { spawnWaves, drawMapOnCanvas /*, altre funzioni se necessario */ };
