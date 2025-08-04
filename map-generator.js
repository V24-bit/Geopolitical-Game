
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

// Colori per ogni tipo di tile
const TILE_COLORS = {
  [TILE_TYPES.OCEAN]: { r: 0, g: 105, b: 148 },
  [TILE_TYPES.COAST]: { r: 240, g: 240, b: 170 },
  [TILE_TYPES.PLAINS]: { r: 124, g: 200, b: 83 },
  [TILE_TYPES.HILLS]: { r: 156, g: 142, b: 90 },
  [TILE_TYPES.MOUNTAINS]: { r: 120, g: 120, b: 120 },
  [TILE_TYPES.FOREST]: { r: 34, g: 139, b: 34 }
};

class TileMapGenerator {
  constructor(gridWidth = 24, gridHeight = 20, seed = Math.random()) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.totalTiles = gridWidth * gridHeight;
    this.simplex = new SimplexNoise(seed);
    this.map = [];
    this.seed = seed;
    
    // Inizializza la griglia
    for (let y = 0; y < gridHeight; y++) {
      this.map[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        this.map[y][x] = TILE_TYPES.OCEAN;
      }
    }
  }

  // Genera la mappa completa
  generateMap() {
    // Step 1: Genera i continenti principali
    this.generateContinents();
    
    // Step 2: Genera arcipelaghi e isole
    this.generateArchipelagos();
    
    // Step 3: Applica le regole di coerenza
    this.applyCoherenceRules();
    
    // Step 4: Genera i biomi terrestri
    this.generateBiomes();
    
    // Step 5: Genera le coste
    this.generateCoasts();
    
    return this.map;
  }

  // Genera i continenti principali
  generateContinents() {
    const numContinents = 2 + Math.floor(Math.random() * 2); // 2-3 continenti
    
    for (let i = 0; i < numContinents; i++) {
      const centerX = Math.floor(Math.random() * this.gridWidth);
      const centerY = Math.floor(Math.random() * this.gridHeight);
      const size = 40 + Math.floor(Math.random() * 60); // 40-100 tile
      
      this.createLandmass(centerX, centerY, size, 0.6);
    }
  }

  // Genera arcipelaghi e isole più piccole
  generateArchipelagos() {
    const numArchipelagos = 3 + Math.floor(Math.random() * 4); // 3-6 arcipelaghi
    
    for (let i = 0; i < numArchipelagos; i++) {
      const centerX = Math.floor(Math.random() * this.gridWidth);
      const centerY = Math.floor(Math.random() * this.gridHeight);
      const size = 15 + Math.floor(Math.random() * 25); // 15-40 tile
      
      this.createLandmass(centerX, centerY, size, 0.4);
    }
  }

  // Crea una massa di terra centrata in (centerX, centerY)
  createLandmass(centerX, centerY, targetSize, density) {
    const visited = new Set();
    const toProcess = [{ x: centerX, y: centerY, distance: 0 }];
    let tilesCreated = 0;
    
    while (toProcess.length > 0 && tilesCreated < targetSize) {
      const current = toProcess.shift();
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key) || !this.isValidCoord(current.x, current.y)) {
        continue;
      }
      
      visited.add(key);
      
      // Calcola la probabilità basata su rumore e distanza
      const noiseValue = (this.simplex.noise2D(current.x * 0.3, current.y * 0.3) + 1) / 2;
      const distanceFactor = Math.max(0, 1 - current.distance / 8);
      const probability = noiseValue * distanceFactor * density;
      
      if (Math.random() < probability) {
        this.map[current.y][current.x] = TILE_TYPES.PLAINS;
        tilesCreated++;
        
        // Aggiungi i vicini alla coda
        const neighbors = this.getNeighbors(current.x, current.y);
        for (const neighbor of neighbors) {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (!visited.has(neighborKey)) {
            toProcess.push({ 
              x: neighbor.x, 
              y: neighbor.y, 
              distance: current.distance + 1 
            });
          }
        }
      }
    }
  }

  // Applica regole di coerenza (es. isole troppo piccole)
  applyCoherenceRules() {
    // Trova tutte le isole e rimuovi quelle troppo piccole
    const islands = this.findIslands();
    
    for (const island of islands) {
      if (island.tiles.length < 15) {
        // Rimuovi isole troppo piccole
        for (const tile of island.tiles) {
          this.map[tile.y][tile.x] = TILE_TYPES.OCEAN;
        }
      }
    }
  }

  // Trova tutte le isole separate
  findIslands() {
    const visited = new Set();
    const islands = [];
    
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.map[y][x] !== TILE_TYPES.OCEAN && !visited.has(`${x},${y}`)) {
          const island = this.floodFillIsland(x, y, visited);
          if (island.length > 0) {
            islands.push({ tiles: island });
          }
        }
      }
    }
    
    return islands;
  }

  // Flood fill per trovare tutti i tile di un'isola
  floodFillIsland(startX, startY, visited) {
    const island = [];
    const toProcess = [{ x: startX, y: startY }];
    
    while (toProcess.length > 0) {
      const current = toProcess.pop();
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key) || !this.isValidCoord(current.x, current.y) || 
          this.map[current.y][current.x] === TILE_TYPES.OCEAN) {
        continue;
      }
      
      visited.add(key);
      island.push(current);
      
      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        toProcess.push(neighbor);
      }
    }
    
    return island;
  }

  // Genera i biomi terrestri
  generateBiomes() {
    const islands = this.findIslands();
    
    for (const island of islands) {
      if (island.tiles.length >= 15) {
        this.generateBiomesForIsland(island.tiles);
      }
    }
  }

  // Genera biomi per una specifica isola
  generateBiomesForIsland(islandTiles) {
    // Trova il centro dell'isola
    const centerX = islandTiles.reduce((sum, tile) => sum + tile.x, 0) / islandTiles.length;
    const centerY = islandTiles.reduce((sum, tile) => sum + tile.y, 0) / islandTiles.length;
    
    // Genera montagne centrali se l'isola è abbastanza grande
    if (islandTiles.length > 30) {
      this.createMountainRange(centerX, centerY, islandTiles);
    }
    
    // Genera foreste e colline
    for (const tile of islandTiles) {
      if (this.map[tile.y][tile.x] === TILE_TYPES.PLAINS) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(tile.x - centerX, 2) + Math.pow(tile.y - centerY, 2)
        );
        const maxDistance = Math.sqrt(islandTiles.length) / 2;
        const centerFactor = 1 - (distanceFromCenter / maxDistance);
        
        const noiseValue = (this.simplex.noise2D(tile.x * 0.4, tile.y * 0.4) + 1) / 2;
        
        // Probabilità di foresta
        if (noiseValue > 0.6 && Math.random() < 0.4) {
          this.map[tile.y][tile.x] = TILE_TYPES.FOREST;
        }
        // Probabilità di colline
        else if (centerFactor > 0.3 && noiseValue > 0.4 && Math.random() < 0.3) {
          this.map[tile.y][tile.x] = TILE_TYPES.HILLS;
        }
      }
    }
  }

  // Crea una catena montuosa
  createMountainRange(centerX, centerY, islandTiles) {
    const mountainCenters = [];
    const numPeaks = 1 + Math.floor(Math.random() * 3); // 1-3 picchi
    
    for (let i = 0; i < numPeaks; i++) {
      const angle = (i / numPeaks) * Math.PI * 2;
      const distance = 2 + Math.random() * 3;
      const peakX = Math.round(centerX + Math.cos(angle) * distance);
      const peakY = Math.round(centerY + Math.sin(angle) * distance);
      
      if (this.isValidCoord(peakX, peakY) && 
          this.map[peakY][peakX] !== TILE_TYPES.OCEAN) {
        mountainCenters.push({ x: peakX, y: peakY });
      }
    }
    
    // Crea montagne intorno ai picchi
    for (const peak of mountainCenters) {
      const mountainSize = 3 + Math.floor(Math.random() * 4); // 3-6 tile
      this.createMountainCluster(peak.x, peak.y, mountainSize, islandTiles);
    }
  }

  // Crea un cluster di montagne
  createMountainCluster(centerX, centerY, size, islandTiles) {
    const visited = new Set();
    const toProcess = [{ x: centerX, y: centerY, distance: 0 }];
    let mountainsCreated = 0;
    
    while (toProcess.length > 0 && mountainsCreated < size) {
      const current = toProcess.shift();
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key) || !this.isValidCoord(current.x, current.y) ||
          this.map[current.y][current.x] === TILE_TYPES.OCEAN) {
        continue;
      }
      
      visited.add(key);
      
      const distanceFactor = Math.max(0, 1 - current.distance / 3);
      if (Math.random() < distanceFactor * 0.8) {
        this.map[current.y][current.x] = TILE_TYPES.MOUNTAINS;
        mountainsCreated++;
        
        const neighbors = this.getNeighbors(current.x, current.y);
        for (const neighbor of neighbors) {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (!visited.has(neighborKey)) {
            toProcess.push({ 
              x: neighbor.x, 
              y: neighbor.y, 
              distance: current.distance + 1 
            });
          }
        }
      }
    }
  }

  // Genera le coste
  generateCoasts() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.map[y][x] !== TILE_TYPES.OCEAN) {
          // Controlla se è adiacente all'oceano
          const neighbors = this.getNeighbors(x, y);
          for (const neighbor of neighbors) {
            if (this.isValidCoord(neighbor.x, neighbor.y) &&
                this.map[neighbor.y][neighbor.x] === TILE_TYPES.OCEAN) {
              this.map[y][x] = TILE_TYPES.COAST;
              break;
            }
          }
        }
      }
    }
  }

  // Ottieni i vicini di un tile
  getNeighbors(x, y) {
    return [
      { x: x - 1, y: y },     // sinistra
      { x: x + 1, y: y },     // destra
      { x: x, y: y - 1 },     // sopra
      { x: x, y: y + 1 },     // sotto
    ];
  }

  // Controlla se le coordinate sono valide
  isValidCoord(x, y) {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }
}

// Funzione principale per disegnare la mappa
function drawTileMapOnCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = 1200;
  const height = canvas.height = 800;

  // Crea un nuovo generatore con seed casuale per varietà
  const generator = new TileMapGenerator(24, 20, Math.random());
  const tileMap = generator.generateMap();

  const tileWidth = width / generator.gridWidth;
  const tileHeight = height / generator.gridHeight;

  // Disegna ogni tile
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

      // Aggiungi un leggero bordo per visualizzare meglio i tile
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(
        x * tileWidth, 
        y * tileHeight, 
        tileWidth, 
        tileHeight
      );
    }
  }
}

// Espone la funzione al main.js
window.generateAndShowMapOnStart = () => {
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  drawTileMapOnCanvas(canvas);
};
