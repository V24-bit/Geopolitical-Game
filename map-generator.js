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
    return (Math.sin((x + seed) * 12.9898 + (y + seed) * 78.233) * 43758.5453 * scale) % 1;
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

    for (let r = 0; r < 5; r++) {
        let x = Math.floor(Math.random() * size);
        let y = 0;
        for (let i = 0; i < size; i++) {
            if (x >= 0 && x < size && y >= 0 && y < size) {
                if (map[y][x] !== TILE_OCEAN) {
                    map[y][x] = TILE_RIVER;
                }
            }
            y += 1;
            x += Math.floor(Math.random() * 3) - 1;
        }
    }

    return map;
}

export function drawMapOnCanvas(map, canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const tX = width / MAP_SIZE;
    const tY = height / MAP_SIZE;

    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            ctx.fillStyle = COLORS[map[y][x]] || "#fff";
            ctx.fillRect(x * tX, y * tY, tX, tY);
        }
    }
}

export function generateAndShowMapOnStart() {
    const map = generateBiomeMap(MAP_SIZE);
    const container = document.querySelector('.main-ui');
    let canvas = document.getElementById('game-map');

    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'game-map';
        container.appendChild(canvas);
    }

    // Dimensioni dinamiche e responsive
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "0";
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    drawMapOnCanvas(map, canvas);
}

window.addEventListener('resize', () => {
    const canvas = document.getElementById('game-map');
    if (canvas) {
        generateAndShowMapOnStart();
    }
});
