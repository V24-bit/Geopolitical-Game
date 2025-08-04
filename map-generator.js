// map-generator.js

// ────── SEMPLICE IMPLEMENTAZIONE DI SIMPLEX NOISE ──────
// Basata su code di Stefan Gustavson (public domain)

class SimplexNoise {
  constructor(r) {
    if (!r) r = Math.random;
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = i;
    for (let i = 0; i < 255; i++) {
      const rIdx = i + ~~(r() * (256 - i));
      [this.p[i], this.p[rIdx]] = [this.p[rIdx], this.p[i]];
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }
  noise2D(xin, yin) {
    const perm = this.perm;
    const grad3 = [ [1,1],[-1,1],[1,-1],[-1,-1],
                    [1,0],[-1,0],[1,0],[-1,0],
                    [0,1],[0,-1],[0,1],[0,-1] ];
    const F2 = 0.5*(Math.sqrt(3.0)-1.0);
    const G2 = (3.0-Math.sqrt(3.0))/6.0;
    let n0=0, n1=0, n2=0;
    const s = (xin+yin)*F2;
    const i = Math.floor(xin+s), j = Math.floor(yin+s);
    const t = (i+j)*G2;
    const X0 = i-t, Y0 = j-t;
    const x0 = xin-X0, y0 = yin-Y0;
    let i1, j1;
    if (x0>y0) { i1=1; j1=0; } else { i1=0; j1=1; }
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0*G2, y2 = y0 - 1.0 + 2.0*G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = perm[ii+perm[jj]] % 12;
    const gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    const gi2 = perm[ii+1+perm[jj+1]] % 12;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0>=0) {
      t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0);
    }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1>=0) {
      t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1);
    }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2>=0) {
      t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }
}

// ────── FINE SIMPLEX NOISE ──────

// Crea l’istanza
const simplex = new SimplexNoise();

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

const MAP_SIZE = 120;

// Parametri per multi-octave noise
const OCTAVES = [
  { freq: 0.04, amp: 1.0 },
  { freq: 0.08, amp: 0.5 },
  { freq: 0.16, amp: 0.25 }
];

function multiNoise(x, y) {
  let sum = 0, norm = 0;
  for (let o of OCTAVES) {
    sum += o.amp * simplex.noise2D(x * o.freq, y * o.freq);
    norm += o.amp;
  }
  return sum / norm;
}

function continentMask(x, y, size) {
  let nx = (x/size - 0.5) * 2;
  let ny = (y/size - 0.5) * 2;
  let d = Math.sqrt(nx*nx + ny*ny);
  let edgeNoise = simplex.noise2D(x * 0.02 + 10, y * 0.02 + 10) * 0.2;
  return Math.max(0, 1 - d + edgeNoise);
}

function generateBiomeMap(size) {
  const height = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = (multiNoise(x, y)+1)/2;
      let m = continentMask(x, y, size);
      height[y][x] = n * m;
    }
  }
  const seaLevel = 0.3, lakeLevel = 0.33, hillLevel = 0.6, mountainLevel = 0.8;
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
  // Foreste
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === TILE_PLAIN &&
          simplex.noise2D(x * 0.1 + 5, y * 0.1 + 5) > 0.4) {
        map[y][x] = TILE_FOREST;
      }
    }
  }
  // Fiumi
  for (let f = 0; f < 4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random() * size);
      sy = Math.floor(Math.random() * size);
    } while (height[sy][sx] < hillLevel);
    let x = sx, y = sy;
    for (let i = 0; i < size * 1.5; i++) {
      map[y][x] = TILE_RIVER;
      let minH = height[y][x], nx = x, ny = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          let xx = x + dx, yy = y + dy;
          if (xx>=0&&xx<size&&yy>=0&&yy<size&&height[yy][xx]<minH) {
            minH = height[yy][xx];
            nx = xx; ny = yy;
          }
        }
      }
      if (map[ny][nx] === TILE_OCEAN) break;
      x = nx; y = ny;
    }
  }
  return map;
}

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
      ctx.fillRect(x*tX, y*tY, tX, tY);
    }
  }
};

window.addEventListener('resize', () => {
  const canvas = document.getElementById('game-map');
  if (canvas.style.display === 'block') window.generateAndShowMapOnStart();
});
