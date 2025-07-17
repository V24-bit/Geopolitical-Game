// --- Costanti biomi ---
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

const MAP_SIZE = 80; // Modifica per la dimensione che desideri

// --- CREA L'OGGETTO NOISE CON UN SEED ---
const simplex = new window.SimplexNoise(Math.random);

// --- GENERA LA MAPPA ---
function generateBiomeMap(size) {
    const map = [];
    const scale = 0.08;      // Più piccolo = biomi grandi (continenti), più grande = dettagli
    const riverScale = 0.3;  // Per fiumi

    for(let y=0; y<size; y++) {
        const row = [];
        for(let x=0; x<size; x++) {
            // Valore di elevazione
            let elevation = simplex.noise2D(x * scale, y * scale);
            elevation = (elevation + 1) / 2; // Normalizza tra 0 e 1

            // Fiumi grandi: curve blu che attraversano la mappa
            let riverNoise = Math.abs(simplex.noise2D(x * riverScale, y * riverScale));
            let isRiver = riverNoise > 0.42 && riverNoise < 0.47 && elevation > 0.30;

            // Laghi: depressioni nella terra
            let isLake = elevation > 0.28 && elevation < 0.36 && Math.abs(simplex.noise2D(x * 0.18, y * 0.18)) > 0.73;

            // Catene montuose: zone alte
            if (elevation > 0.74) {
                row.push(TILE_MOUNTAIN);
            }
            // Colline
            else if (elevation > 0.60) {
                row.push(TILE_HILL);
            }
            // Oceani e mari
            else if (elevation < 0.22) {
                row.push(TILE_OCEAN);
            }
            // Fiumi
            else if (isRiver) {
                row.push(TILE_RIVER);
            }
            // Laghi
            else if (isLake) {
                row.push(TILE_LAKE);
            }
            // Foreste
            else if (simplex.noise2D(x*0.22, y*0.22) > 0.42) {
                row.push(TILE_FOREST);
            }
            // Pianure
            else {
                row.push(TILE_PLAIN);
            }
        }
        map.push(row);
    }
    return map;
}

// --- DISEGNA LA MAPPA ---
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

// --- GENERA E MOSTRA LA MAPPA ---
export function generateAndShowMapOnStart() {
    let map = generateBiomeMap(MAP_SIZE);

    // Inserisci il canvas nel div centrale della UI
    let container = document.querySelector('.main-ui') || document.querySelector('.center-container');
    if (!container) container = document.body;

    let canvas = document.getElementById('game-map');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'game-map';
        canvas.width = container.offsetWidth || 600;
        canvas.height = 320;
        canvas.style.width = "100%";
        canvas.style.height = "320px";
        container.appendChild(canvas);
    } else {
        canvas.width = container.offsetWidth || 600;
        canvas.height = 320;
    }

    drawMapOnCanvas(map, canvas);
}
