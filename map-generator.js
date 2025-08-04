// Mini Simplex Noise - versione compatta
function SimplexNoise(seed = Math.random()) {
  const grad3 = [
    [1,1], [-1,1], [1,-1], [-1,-1],
    [1,0], [-1,0], [1,0], [-1,0],
    [0,1], [0,-1], [0,1], [0,-1]
  ];

  const p = [];
  for (let i = 0; i < 256; i++) {
    p[i] = Math.floor(seed * 256);
  }

  const perm = new Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }

  function dot(g, x, y) {
    return g[0]*x + g[1]*y;
  }

  this.noise2D = function(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    let n0, n1, n2;

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
    let gi0 = perm[ii + perm[jj]] % 12;
    let gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
    let gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 < 0) n0 = 0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 < 0) n1 = 0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 < 0) n2 = 0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  };
}

// Costanti per i tipi di tile
const TILE_TYPES = {
  OCEAN: 0,
  COAST: 1,
  PLAINS: 2,
  HILLS: 3,
  MOUNTAINS: 4,
  FOREST: 5
};

// Colori corretti per ogni tipo di tile
const TILE_COLORS = {
  [TILE_TYPES.OCEAN]: { r: 0, g: 105, b: 148 },      // Blu oceano
  [TILE_TYPES.COAST]: { r: 240, g: 240, b: 170 },    // Beige costa
  [TILE_TYPES.PLAINS]: { r: 144, g: 238, b: 144 },   // Verde chiaro pianure
  [TILE_TYPES.HILLS]: { r: 255, g: 255, b: 0 },      // Giallo colline
  [TILE_TYPES.MOUNTAINS]: { r: 64, g: 64, b: 64 },   // Nero-grigio montagne
  [TILE_TYPES.FOREST]: { r: 0, g: 100, b: 0 }        // Verde scuro foreste
};

class TileMapGenerator {
  constructor(gridWidth = 480, gridHeight = 480, seed = Math.random()) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.simplex = new SimplexNoise(seed);
    this.map = new Array(gridHeight);

    // Inizializza con oceano - più efficiente
    for (let y = 0; y < gridHeight; y++) {
      this.map[y] = new Array(gridWidth).fill(TILE_TYPES.OCEAN);
    }
  }

  // Genera la mappa completa - ottimizzata
  generateMap() {
    console.log("Generando mappa...");

    // Genera terre emerse usando noise direttamente
    this.generateLandmasses();

    // Applica biomi
    this.generateBiomes();

    // Genera coste
    this.generateCoasts();

    console.log("Mappa generata!");
    return this.map;
  }

  // Genera terre emerse usando noise - molto più efficiente
  generateLandmasses() {
    const scale = 0.02; // Scala del noise per continenti
    const threshold = 0.1; // Soglia per la terra

    // Genera 3-4 centri continentali
    const continentCenters = [];
    for (let i = 0; i < 4; i++) {
      continentCenters.push({
        x: Math.random() * this.gridWidth,
        y: Math.random() * this.gridHeight,
        strength: 0.3 + Math.random() * 0.4
      });
    }

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        // Combina noise generale con influenza dei centri continentali
        let noiseValue = (this.simplex.noise2D(x * scale, y * scale) + 1) / 2;

        // Aggiungi influenza dei centri continentali
        let continentInfluence = 0;
        for (const center of continentCenters) {
          const distance = Math.sqrt(
            Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
          );
          const maxDistance = Math.min(this.gridWidth, this.gridHeight) * 0.4;
          if (distance < maxDistance) {
            continentInfluence += center.strength * (1 - distance / maxDistance);
          }
        }

        // Combina noise e influenza continentale
        const finalValue = noiseValue * 0.6 + continentInfluence * 0.4;

        if (finalValue > threshold) {
          this.map[y][x] = TILE_TYPES.PLAINS;
        }
      }
    }
  }

  // Genera biomi - ottimizzato
  generateBiomes() {
    const mountainScale = 0.05;
    const forestScale = 0.08;
    const hillScale = 0.06;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.map[y][x] === TILE_TYPES.PLAINS) {
          // Calcola valori noise per diversi biomi
          const mountainNoise = (this.simplex.noise2D(x * mountainScale, y * mountainScale) + 1) / 2;
          const forestNoise = (this.simplex.noise2D(x * forestScale + 100, y * forestScale + 100) + 1) / 2;
          const hillNoise = (this.simplex.noise2D(x * hillScale + 200, y * hillScale + 200) + 1) / 2;

          // Priorità: Montagne > Foreste > Colline > Pianure
          if (mountainNoise > 0.75) {
            this.map[y][x] = TILE_TYPES.MOUNTAINS;
          } else if (forestNoise > 0.6) {
            this.map[y][x] = TILE_TYPES.FOREST;
          } else if (hillNoise > 0.65) {
            this.map[y][x] = TILE_TYPES.HILLS;
          }
          // Altrimenti rimane PLAINS
        }
      }
    }
  }

  // Genera le coste - ottimizzato
  generateCoasts() {
    const coastMap = [];
    for (let y = 0; y < this.gridHeight; y++) {
      coastMap[y] = [...this.map[y]];
    }

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.map[y][x] !== TILE_TYPES.OCEAN) {
          // Controlla se è adiacente all'oceano
          let isCoast = false;

          // Controlla i 4 vicini principali
          const neighbors = [
            {x: x-1, y}, {x: x+1, y}, {x, y: y-1}, {x, y: y+1}
          ];

          for (const neighbor of neighbors) {
            if (neighbor.x >= 0 && neighbor.x < this.gridWidth && 
                neighbor.y >= 0 && neighbor.y < this.gridHeight) {
              if (this.map[neighbor.y][neighbor.x] === TILE_TYPES.OCEAN) {
                isCoast = true;
                break;
              }
            }
          }

          if (isCoast) {
            coastMap[y][x] = TILE_TYPES.COAST;
          }
        }
      }
    }

    this.map = coastMap;
  }
}

// Funzione principale per disegnare la mappa - ottimizzata
function drawTileMapOnCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = 1200;
  const height = canvas.height = 800;

  console.log("Iniziando generazione mappa...");
  const startTime = performance.now();

  // Crea un nuovo generatore
  const generator = new TileMapGenerator(480, 480, Math.random());
  const tileMap = generator.generateMap();

  const endTime = performance.now();
  console.log(`Mappa generata in ${(endTime - startTime).toFixed(2)}ms`);

  const tileWidth = width / generator.gridWidth;
  const tileHeight = height / generator.gridHeight;

  // Disegna ogni tile - senza bordi per performance
  for (let y = 0; y < generator.gridHeight; y++) {
    for (let x = 0; x < generator.gridWidth; x++) {
      const tileType = tileMap[y][x];
      const color = TILE_COLORS[tileType];

      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.fillRect(
        x * tileWidth, 
        y * tileHeight, 
        tileWidth, 
        tileHeight
      );
    }
  }

  console.log("Mappa disegnata!");
}

// Espone la funzione al main.js
window.generateAndShowMapOnStart = () => {
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  drawTileMapOnCanvas(canvas);
};