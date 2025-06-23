// --- Simplex Noise base (adattato, compatto, no dipendenze esterne) ---
function Simplex(seed = 0) {
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
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

// --- MAPPA ---
const TILE_WATER = 0;
const TILE_PLAIN = 1;
const TILE_MOUNTAIN = 2;

const COLORS = {
  [TILE_WATER]: '#3896e2',
  [TILE_PLAIN]: '#19cf86',
  [TILE_MOUNTAIN]: '#888888'
};

const MAP_SIZE = 250;

// --- Genera mappa con continenti e montagne ---
function generateContinentMap() {
  const simplex = new Simplex(Math.floor(Math.random()*10000));
  const map = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill(TILE_WATER));
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      // Normalizza coordinate tra -1 e 1 (per “continente centrale”)
      let nx = (x / MAP_SIZE - 0.5) * 2;
      let ny = (y / MAP_SIZE - 0.5) * 2;
      // Distanza dal centro, serve a “circondare” di oceano
      let dist = Math.sqrt(nx*nx + ny*ny);
      // Rumore perlin/simplex scalato, più “zoom” = isole più piccole
      let n = simplex.noise(x/60, y/60) * 0.6 + simplex.noise(x/20+100, y/20+100) * 0.3;
      // Formula “continente”: più negativo = più acqua ai bordi
      let value = n - dist*1.1;
      if (value < -0.07) map[y][x] = TILE_WATER;
      else if (value < 0.25) map[y][x] = TILE_PLAIN;
      else map[y][x] = TILE_MOUNTAIN;
    }
  }
  return map;
}

// --- Sfumatura coste (bordo sabbia) ---
function smoothCoast(map) {
  for (let y = 1; y < MAP_SIZE-1; y++) {
    for (let x = 1; x < MAP_SIZE-1; x++) {
      if (
        map[y][x] === TILE_WATER &&
        ([map[y-1][x], map[y+1][x], map[y][x-1], map[y][x+1]].includes(TILE_PLAIN))
      ) {
        map[y][x] = 3; // Tipo 3 = sabbia (colore dopo)
      }
    }
  }
}
COLORS[3] = '#ffe28a';

// --- Disegna la mappa su canvas ---
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

// --- Funzione principale da chiamare su "Start Game" ---
export function generateAndShowMapOnStart(canvasId = 'game-map') {
  if (document.body.requestFullscreen) document.body.requestFullscreen();
  const mainUI = document.querySelector('.main-ui');
  if (mainUI) mainUI.style.display = 'none';

  let map = generateContinentMap();
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
