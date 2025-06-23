// --- Simplex Noise base ---
function Simplex(seed = 0) {
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  this.p = [];
  for (let i = 0; i < 256; i++) this.p[i] = Math.floor(seed = (seed * 9301 + 49297) % 233280) / 233280 * 256;
  this.perm = [];
  for(let i=0; i<512; i++) this.perm[i]=this.p[i & 255];
}
Simplex.prototype.dot = function(g, x, y) { return g[0]*x + g[1]*y; }
Simplex.prototype.noise = function xinyn(xin, yin) {
  let n0=0, n1=0, n2=0, F2=0.5*(Math.sqrt(3)-1), G2=(3-Math.sqrt(3))/6;
  let s=(xin+yin)*F2, i=Math.floor(xin+s), j=Math.floor(yin+s);
  let t=(i+j)*G2, X0=i-t, Y0=j-t, x0=xin-X0, y0=yin-Y0;
  let i1, j1; if(x0>y0){i1=1;j1=0;} else{ i1=0;j1=1;}
  let x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
  let ii=i&255, jj=j&255;
  let gi0=this.perm[ii+this.perm[jj]]%12, gi1=this.perm[ii+i1+this.perm[jj+j1]]%12, gi2=this.perm[ii+1+this.perm[jj+1]]%12;
  let t0=0.5-x0*x0-y0*y0; if(t0>=0){ t0*=t0; n0=t0*t0*this.dot(this.grad3[gi0],x0,y0);}
  let t1=0.5-x1*x1-y1*y1; if(t1>=0){ t1*=t1; n1=t1*t1*this.dot(this.grad3[gi1],x1,y1);}
  let t2=0.5-x2*x2-y2*y2; if(t2>=0){ t2*=t2; n2=t2*t2*this.dot(this.grad3[gi2],x2,y2);}
  return 70*(n0+n1+n2);
}

// --- Definizione biomi ---
const BIOME_OCEAN = 0;
const BIOME_SAND  = 1;
const BIOME_GRASS = 2;
const BIOME_FOREST = 3;
const BIOME_HILL  = 4;
const BIOME_MOUNTAIN = 5;
const BIOME_SNOW = 6;

const COLORS = {
  [BIOME_OCEAN]:    '#2d59a2',
  [BIOME_SAND]:     '#ffe28a',
  [BIOME_GRASS]:    '#67b347',
  [BIOME_FOREST]:   '#267823',
  [BIOME_HILL]:     '#b3a377',
  [BIOME_MOUNTAIN]: '#888888',
  [BIOME_SNOW]:     '#ffffff',
};

const MAP_SIZE = 250;

// --- Genera mappa con biomi realistici ---
function generateBeautifulMap() {
  const simplex = new Simplex(Math.floor(Math.random()*100000));
  let map = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill(BIOME_OCEAN));
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      // Normalizza coordinate tra -1 e 1 (continente centrale)
      let nx = (x / MAP_SIZE - 0.5) * 2;
      let ny = (y / MAP_SIZE - 0.5) * 2;
      let dist = Math.sqrt(nx*nx + ny*ny);

      // Heightmap con diverse scale per dettagli grandi/piccoli
      let e =
        1.10 * simplex.noise(x/80, y/80) +
        0.50 * simplex.noise(x/32, y/32) +
        0.25 * simplex.noise(x/12 + 100, y/12 + 100);
      e = e / (1.10 + 0.50 + 0.25);

      // Continente: penalizza lontano dal centro (oceano)
      e = e - dist*1.07;

      // Bioma in base all'altitudine (e un po' di random per le foreste)
      if (e < -0.09) map[y][x] = BIOME_OCEAN;
      else if (e < 0.00) map[y][x] = BIOME_SAND;
      else if (e < 0.15) map[y][x] = (simplex.noise(x/16+200, y/16+200) > 0.23 ? BIOME_FOREST : BIOME_GRASS);
      else if (e < 0.28) map[y][x] = BIOME_HILL;
      else if (e < 0.40) map[y][x] = BIOME_MOUNTAIN;
      else map[y][x] = BIOME_SNOW;
    }
  }
  return map;
}

// --- Sfumatura coste: sabbia tra prato e mare ---
function smoothCoast(map) {
  for (let y = 1; y < MAP_SIZE-1; y++) {
    for (let x = 1; x < MAP_SIZE-1; x++) {
      if (
        map[y][x] === BIOME_GRASS &&
        ([map[y-1][x], map[y+1][x], map[y][x-1], map[y][x+1]].includes(BIOME_OCEAN))
      ) {
        map[y][x] = BIOME_SAND;
      }
    }
  }
}

// --- Disegna mappa su canvas ---
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

// --- Funzione principale ---
export function generateAndShowMapOnStart(canvasId = 'game-map') {
  if (document.body.requestFullscreen) document.body.requestFullscreen();
  const mainUI = document.querySelector('.main-ui');
  if (mainUI) mainUI.style.display = 'none';

  let map = generateBeautifulMap();
  smoothCoast(map);

  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 1111;
    document.body.appendChild(canvas);
  }
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawMapOnCanvas(map, canvas);

  window.onresize = () => drawMapOnCanvas(map, canvas);
}
