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
const simplex = new window.SimplexNoise(Math.random);

function generateBiomeMap(size) {
    // ... come già nei tuoi file ...
    // (puoi usare la versione che preferisci delle funzioni, l'importante è che sia quella "giusta")
    // vedi sopra per il codice completo, lo puoi incollare qui dentro!
}

export function drawMapOnCanvas(map, canvas) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,width,height);
    let tX = width / MAP_SIZE;
    let tY = height / MAP_SIZE;
    for(let y=0; y<MAP_SIZE; y++) {
        for(let x=0; x<MAP_SIZE; x++) {
            let color = COLORS[map[y][x]] || "#fff";
            ctx.fillStyle = color;
            ctx.fillRect(x*tX, y*tY, tX, tY);
        }
    }
}

export function generateAndShowMapOnStart() {
    let map = generateBiomeMap(MAP_SIZE);
    let canvas = document.getElementById('game-map');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'game-map';
        document.body.appendChild(canvas);
    }
    // Adatta canvas al body
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    drawMapOnCanvas(map, canvas);
}

window.addEventListener('resize', () => {
    generateAndShowMapOnStart();
});
