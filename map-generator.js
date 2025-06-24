// --- Simplex Noise (corretto, nessun bug di permutazione) ---
function Simplex(seed = 0) {
  this.grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];
  this.p = [];
  for (let i = 0; i < 256; i++) this.p[i] = i;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    let j = Math.floor((seed / 233280) * (i + 1));
    [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
  }
  this.perm = [];
  for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
}
Simplex.prototype.dot = function(g, x, y) { return g[0]*x + g[1]*y; };
Simplex.prototype.noise = function(xin, yin) {
  let n0 = 0, n1 = 0, n2 = 0;
  let F2 = 0.5 * (Math.sqrt(3) - 1);
  let G2 = (3 - Math.sqrt(3)) / 6;
  let s = (xin + yin) * F2;
  let i = Math.floor(xin + s);
  let j = Math.floor(yin + s);
  let t = (i + j) * G2;
  let X0 = i - t;
  let Y0 = j - t;
  let x0 = xin - X0;
  let y0 = yin - Y0;
  let i1, j1;
  if (x0 > y0) { i1 = 1; j1 = 0; }
  else { i1 = 0; j1 = 1; }
  let x1 = x0 - i1 + G2;
  let y1 = y0 - j1 + G2;
  let x2 = x0 - 1 + 2 * G2;
  let y2 = y0 - 1 + 2 * G2;
  let ii = i & 255;
  let jj = j & 255;
  let gi0 = this.perm[(ii + this.perm[jj]) & 255] % 12;
  let gi1 = this.perm[(ii + i1 + this.perm[(jj + j1) & 255]) & 255] % 12;
  let gi2 = this.perm[(ii + 1 + this.perm[(jj + 1) & 255]) & 255] % 12;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
  }
  return 70 * (n0 + n1 + n2);
};

// --- CARICA L'IMMAGINE ONDA ---
const waveAnim = new window.Image();
waveAnim.src = "assets/animations/wave01.png";

// --- BIOMI ---
const TILE_OCEAN   = 0;
const TILE_LAKE    = 1;
const TILE_PLAIN   = 2;
const TILE_FOREST  = 3;
const TILE_HILL    = 4;
const TILE_MOUNTAIN= 5;
const TILE_RIVER   = 6;

const COLORS = {
  [TILE_OCEAN]:    '#3b77b7',
  [TILE_LAKE]:     '#6ec5e3',
  [TILE_PLAIN]:    '#b6e36c',
  [TILE_FOREST]:   '#2c7d36',
  [TILE_HILL]:     '#d2b48c',
  [TILE_MOUNTAIN]: '#e0e0e0',
  [TILE_RIVER]:    '#3fc2ff'
};

const MAP_SIZE = 800;

// --- Onde pixelart leggere (spot) ---
let pixelWaves = [];

function spawnWaves(map, now) {
  // Ogni 1.3 secondi circa, genera nuove onde in punti casuali su mare/lago/fiume
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
    // onde solo se visibili, per performance
    if (w.x >= startX && w.x < endX && w.y >= startY && w.y < endY)
      waveMap.set(w.y + "," + w.x, w);
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      let type = map[y][x];
      let color = COLORS[type];

      // Se c'è un'onda qui, disegna la tua PNG animazione
      let key = y + "," + x;
      if (waveMap.has(key)) {
        // Usa la PNG solo se è caricata correttamente
        if (waveAnim.complete && waveAnim.naturalWidth > 0) {
          // Puoi regolare tX*2/tY*2 per la dimensione dell'onda
          ctx.drawImage(
            waveAnim,
            x * tX,
            y * tY,
            tX * 2,
            tY * 2
          );
        }
        continue; // non disegnare il mare/fiume sotto
      }

      ctx.fillStyle = color;
      ctx.fillRect(x * tX, y * tY, tX + 1, tY + 1);
    }
  }
  ctx.restore();
}

// --- GENERATORE MAPPA PROCEDURALE ---
function generateMap() {
  const simplex = new Simplex(Math.floor(Math.random()*100000));
  let height = Array.from({length: MAP_SIZE}, ()=>Array(MAP_SIZE));
  let biome  = Array.from({length: MAP_SIZE}, ()=>Array(MAP_SIZE));
  for (let y=0; y<MAP_SIZE; y++) for (let x=0; x<MAP_SIZE; x++) {
    let nx = (x/MAP_SIZE-0.5)*2, ny = (y/MAP_SIZE-0.5)*2;
    let dist = Math.sqrt(nx*nx + ny*ny);
    let e = 
      1.1 * simplex.noise(x/48, y/48) +
      0.5 * simplex.noise(x/18+50, y/18+50) +
      0.25* simplex.noise(x/8-100, y/8-100);
    e = e / (1.1 + 0.5 + 0.25);
    e = e - dist*0.7;
    height[y][x] = e;
  }
  for (let y=0; y<MAP_SIZE; y++) for (let x=0; x<MAP_SIZE; x++) {
    let e = height[y][x];
    if (e < -0.13) biome[y][x]=TILE_OCEAN;
    else if (e < -0.07) biome[y][x]=TILE_LAKE;
    else if (e < 0.12) biome[y][x]=TILE_PLAIN;
    else if (e < 0.18) biome[y][x]=TILE_FOREST;
    else if (e < 0.28) biome[y][x]=TILE_HILL;
    else biome[y][x]=TILE_MOUNTAIN;
  }
  for (let y=2; y<MAP_SIZE-2; y++) for (let x=2; x<MAP_SIZE-2; x++) {
    if (biome[y][x]===TILE_PLAIN && Math.random()<0.16) biome[y][x]=TILE_FOREST;
  }
  let riverMap = Array.from({length: MAP_SIZE}, ()=>Array(MAP_SIZE).fill(false));
  for (let i=0; i<8; i++) {
    let found = false, rx, ry, tries=0;
    while(!found && tries<200) {
      rx = Math.floor(MAP_SIZE/2 + (Math.random()-0.5)*MAP_SIZE*0.4);
      ry = Math.floor(MAP_SIZE/2 + (Math.random()-0.5)*MAP_SIZE*0.4);
      if (biome[ry][rx]===TILE_MOUNTAIN) found=true;
      tries++;
    }
    if (!found) continue;
    let len = 0, maxLen = 110, x=rx, y=ry;
    while (len<maxLen) {
      riverMap[y][x] = true;
      if (biome[y][x]===TILE_LAKE || biome[y][x]===TILE_OCEAN) break;
      let minE = height[y][x], nx=x, ny=y;
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
        if (dx===0 && dy===0) continue;
        let xx=x+dx, yy=y+dy;
        if (xx<0||yy<0||xx>=MAP_SIZE||yy>=MAP_SIZE) continue;
        if (height[yy][xx]<minE) { minE=height[yy][xx]; nx=xx; ny=yy; }
      }
      if (nx===x && ny===y) break;
      x=nx; y=ny; len++;
    }
  }
  for (let y=0; y<MAP_SIZE; y++) for (let x=0; x<MAP_SIZE; x++) {
    if (riverMap[y][x] && biome[y][x]!==TILE_OCEAN && biome[y][x]!==TILE_LAKE)
      biome[y][x]=TILE_RIVER;
  }
  return biome;
}

// --- Funzione principale aggiornata ---
export function generateAndShowMapOnStart(canvasId = 'game-map') {
  const mainUI = document.querySelector('.main-ui');
  if (mainUI) mainUI.style.display = 'none';
  document.body.classList.add('full-map');
  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    document.body.appendChild(canvas);
  }
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '1111';
  canvas.style.margin = '0';
  canvas.style.borderRadius = '0';
  canvas.style.boxShadow = 'none';
  canvas.style.background = '#232336';

  // --- ZOOM INIZIALE RAVVICINATO (+ centratura automatica) ---
  let zoom = 2; // Modifica qui il livello di zoom iniziale (es. 3 o 4 per più vicino)
  let offsetX = -(MAP_SIZE * (zoom - 1) / 2) * (window.innerWidth / MAP_SIZE);
  let offsetY = -(MAP_SIZE * (zoom - 1) / 2) * (window.innerHeight / MAP_SIZE);

  let minZoom = 0.5, maxZoom = 6, zoomStep = 0.2;
  let isDragging = false, dragStartX = 0, dragStartY = 0, lastOffsetX = 0, lastOffsetY = 0;

  let map = generateMap();

  function animate() {
    let now = performance.now();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spawnWaves(map, now);
    drawMapOnCanvas(map, canvas, zoom, offsetX, offsetY, now);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Ricalcola offset per mantenere centratura dopo resize
    offsetX = -(MAP_SIZE * (zoom - 1) / 2) * (window.innerWidth / MAP_SIZE);
    offsetY = -(MAP_SIZE * (zoom - 1) / 2) * (window.innerHeight / MAP_SIZE);
  });

  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    let prevZoom = zoom;
    if (e.deltaY < 0) {
      zoom = Math.min(maxZoom, zoom + zoomStep);
    } else {
      zoom = Math.max(minZoom, zoom - zoomStep);
    }
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offsetX) / prevZoom;
    const my = (e.clientY - rect.top - offsetY) / prevZoom;
    offsetX -= (zoom - prevZoom) * mx;
    offsetY -= (zoom - prevZoom) * my;
  });

  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    lastOffsetX = offsetX;
    lastOffsetY = offsetY;
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    offsetX = lastOffsetX + (e.clientX - dragStartX);
    offsetY = lastOffsetY + (e.clientY - dragStartY);
  });
  window.addEventListener('mouseup', function() {
    isDragging = false;
  });

  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  if (zoomInBtn) zoomInBtn.onclick = () => { zoom = Math.min(maxZoom, zoom + zoomStep); };
  if (zoomOutBtn) zoomOutBtn.onclick = () => { zoom = Math.max(minZoom, zoom - zoomStep); };

  animate();
}
