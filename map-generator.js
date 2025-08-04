// map-generator.js

// Biomi
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

const MAP_SIZE = 120;   // aumenta per più dettaglio

// parametri noise
const OCTAVES = [
  {freq: 0.04, amp: 1.0},
  {freq: 0.08, amp: 0.5},
  {freq: 0.16, amp: 0.25}
];

function multiNoise(x, y) {
  let sum = 0, norm = 0;
  for (let o of OCTAVES) {
    sum += o.amp * simplex.noise2D(x * o.freq, y * o.freq);
    norm += o.amp;
  }
  return sum / norm;  // in [-1,1]
}

// maschera continentale (più terre al centro)
function continentMask(x, y, size) {
  let nx = (x/size - 0.5)*2;
  let ny = (y/size - 0.5)*2;
  let d = Math.sqrt(nx*nx + ny*ny); // 0 centro, >1 bordi
  // disturbo noise per insenature
  let edge = simplex.noise2D(x*0.02+10, y*0.02+10) * 0.2;
  return Math.max(0, 1 - d + edge);
}

function generateBiomeMap(size) {
  const map = [];
  // prima heightmap
  const height = Array.from({length:size}, () => Array(size).fill(0));
  for (let y=0; y<size; y++) {
    for (let x=0; x<size; x++) {
      // noise + mask
      let n = multiNoise(x,y)*0.5 + 0.5;    // [0,1]
      let m = continentMask(x,y,size);
      height[y][x] = n * m;
    }
  }
  // soglie
  const seaLevel = 0.3, lakeLevel = 0.33;
  const hillLevel = 0.6, mountainLevel = 0.8;
  // classificazione
  for (let y=0; y<size; y++) {
    const row = [];
    for (let x=0; x<size; x++) {
      let h = height[y][x];
      if (h < seaLevel) row.push(TILE_OCEAN);
      else if (h < lakeLevel) row.push(TILE_LAKE);
      else if (h >= mountainLevel) row.push(TILE_MOUNTAIN);
      else if (h >= hillLevel) row.push(TILE_HILL);
      else row.push(TILE_PLAIN);
    }
    map.push(row);
  }
  // foreste noise
  for (let y=0; y<size; y++) {
    for (let x=0; x<size; x++) {
      if (map[y][x] === TILE_PLAIN) {
        if (simplex.noise2D(x*0.1+5, y*0.1+5) > 0.4) map[y][x] = TILE_FOREST;
      }
    }
  }
  // fiumi: 4 sorgenti su alture
  for (let f=0; f<4; f++) {
    let sx, sy;
    do {
      sx = Math.floor(Math.random()*size);
      sy = Math.floor(Math.random()*size);
    } while (height[sy][sx] < hillLevel);
    let [x,y] = [sx, sy];
    for (let len=0; len< size*1.5; len++) {
      map[y][x] = TILE_RIVER;
      // step verso il vicino con min height
      let best = height[y][x], nx=x, ny=y;
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
        let xx=x+dx, yy=y+dy;
        if (xx>=0&&xx<size&&yy>=0&&yy<size) {
          if (height[yy][xx] < best) {
            best = height[yy][xx];
            nx=xx; ny=yy;
          }
        }
      }
      if (map[ny][nx] === TILE_OCEAN) break;
      [x,y] = [nx,ny];
    }
  }
  return map;
}

// disegno e show
window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const canvas = document.getElementById('game-map');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const tX = canvas.width / MAP_SIZE, tY = canvas.height / MAP_SIZE;
  for (let y=0; y<MAP_SIZE; y++) {
    for (let x=0; x<MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]];
      ctx.fillRect(x*tX, y*tY, tX, tY);
    }
  }
};

window.addEventListener('resize', () => {
  if (document.getElementById('game-map').style.display === 'block')
    window.generateAndShowMapOnStart();
});
