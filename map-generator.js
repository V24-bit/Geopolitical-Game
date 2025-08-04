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

const MAP_SIZE = 80;

function pseudoNoise(x, y, scale = 1) {
  const seed = 12345;
  return Math.abs(
    Math.sin((x + seed)*12.9898 + (y + seed)*78.233) * 43758.5453 % 1
  );
}

function generateBiomeMap(size) {
  const map = [];
  const scale = 0.1;
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const val = pseudoNoise(x * scale, y * scale);
      if (val < 0.3) row.push(TILE_OCEAN);
      else if (val < 0.35) row.push(TILE_LAKE);
      else if (val < 0.5) row.push(TILE_PLAIN);
      else if (val < 0.65) row.push(TILE_FOREST);
      else if (val < 0.8) row.push(TILE_HILL);
      else row.push(TILE_MOUNTAIN);
    }
    map.push(row);
  }
  // Aggiungi fiumi
  for (let r = 0; r < 5; r++) {
    let x = Math.floor(Math.random() * size), y = 0;
    for (let i = 0; i < size; i++) {
      if (x>=0&&x<size&&y>=0&&y<size&&map[y][x]!==TILE_OCEAN) {
        map[y][x] = TILE_RIVER;
      }
      y++; x += Math.floor(Math.random()*3)-1;
    }
  }
  return map;
}

window.drawMapOnCanvas = function(map, canvas) {
  const ctx = canvas.getContext('2d');
  const tX = canvas.width / MAP_SIZE, tY = canvas.height / MAP_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      ctx.fillStyle = COLORS[map[y][x]] || "#000";
      ctx.fillRect(x*tX, y*tY, tX, tY);
    }
  }
};

window.generateAndShowMapOnStart = function() {
  const map = generateBiomeMap(MAP_SIZE);
  const canvas = document.getElementById('game-map');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  window.drawMapOnCanvas(map, canvas);
};

window.addEventListener('resize', function() {
  const canvas = document.getElementById('game-map');
  if (canvas.style.display === 'block') {
    window.generateAndShowMapOnStart();
  }
});
