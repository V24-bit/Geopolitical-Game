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
  [TILE_TYPES.OCEAN]: { r: 30, g: 90, b: 150 },      // Blu oceano profondo
  [TILE_TYPES.COAST]: { r: 240, g: 220, b: 130 },    // Sabbia costa
  [TILE_TYPES.PLAINS]: { r: 144, g: 238, b: 144 },   // Verde chiaro pianure
  [TILE_TYPES.HILLS]: { r: 255, g: 215, b: 0 },      // Giallo colline
  [TILE_TYPES.MOUNTAINS]: { r: 64, g: 64, b: 64 },   // Grigio scuro montagne
  [TILE_TYPES.FOREST]: { r: 34, g: 139, b: 34 }      // Verde scuro foreste
};

// === SISTEMA COORDINATE ESAGONALI ===
class HexCoordinates {
  constructor(q, r, s = null) {
    this.q = q; // Colonna
    this.r = r; // Riga
    this.s = s !== null ? s : -q - r; // Terza coordinata (cube coordinate)
    
    // Verifica che q + r + s = 0 (proprietà delle coordinate cube)
    if (Math.abs(this.q + this.r + this.s) > 0.001) {
      throw new Error(`Coordinate esagonali non valide: q=${q}, r=${r}, s=${this.s}`);
    }
  }

  // Converte coordinate axial (q,r) in pixel
  toPixel(hexSize) {
    const x = hexSize * (3/2 * this.q);
    const y = hexSize * (Math.sqrt(3)/2 * this.q + Math.sqrt(3) * this.r);
    return { x, y };
  }

  // Converte pixel in coordinate axial
  static fromPixel(x, y, hexSize) {
    const q = (2/3 * x) / hexSize;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
    return HexCoordinates.round(q, r);
  }

  // Arrotonda coordinate frazionarie alle coordinate esagonali più vicine
  static round(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const q_diff = Math.abs(rq - q);
    const r_diff = Math.abs(rr - r);
    const s_diff = Math.abs(rs - s);

    if (q_diff > r_diff && q_diff > s_diff) {
      rq = -rr - rs;
    } else if (r_diff > s_diff) {
      rr = -rq - rs;
    } else {
      rs = -rq - rr;
    }

    return new HexCoordinates(rq, rr, rs);
  }

  // Distanza tra due esagoni
  distance(other) {
    return (Math.abs(this.q - other.q) + Math.abs(this.q + this.r - other.q - other.r) + Math.abs(this.r - other.r)) / 2;
  }

  // Ottieni i 6 vicini di un esagono
  getNeighbors() {
    const directions = [
      [1, 0], [1, -1], [0, -1],
      [-1, 0], [-1, 1], [0, 1]
    ];
    
    return directions.map(([dq, dr]) => 
      new HexCoordinates(this.q + dq, this.r + dr)
    );
  }

  // Chiave unica per l'esagono (per Map/Set)
  toString() {
    return `${this.q},${this.r}`;
  }

  equals(other) {
    return this.q === other.q && this.r === other.r;
  }
}

// === TILE ESAGONALE ===
class HexTile {
  constructor(coordinates, type = TILE_TYPES.OCEAN) {
    this.coordinates = coordinates;
    this.type = type;
    this.isDirty = true; // Flag per sapere se deve essere ridisegnato
    this.nation = null; // Nazione che controlla questo tile
    this.units = []; // Unità presenti su questo tile
    this.improvements = []; // Miglioramenti costruiti
    
    // Cache per il rendering
    this._cachedPath = null;
    this._cachedPixelPos = null;
  }

  // Segna il tile come "sporco" (da ridisegnare)
  markDirty() {
    this.isDirty = true;
  }

  // Pulisce il flag dirty dopo il rendering
  markClean() {
    this.isDirty = false;
  }

  // Ottieni la posizione in pixel (con cache)
  getPixelPosition(hexSize) {
    if (!this._cachedPixelPos) {
      this._cachedPixelPos = this.coordinates.toPixel(hexSize);
    }
    return this._cachedPixelPos;
  }

  // Ottieni il path dell'esagono (con cache)
  getHexPath(ctx, hexSize, centerX, centerY) {
    if (!this._cachedPath) {
      const pos = this.getPixelPosition(hexSize);
      const x = pos.x + centerX;
      const y = pos.y + centerY;
      
      this._cachedPath = new Path2D();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + hexSize * Math.cos(angle);
        const py = y + hexSize * Math.sin(angle);
        
        if (i === 0) {
          this._cachedPath.moveTo(px, py);
        } else {
          this._cachedPath.lineTo(px, py);
        }
      }
      this._cachedPath.closePath();
    }
    return this._cachedPath;
  }

  // Invalida la cache (chiamare quando cambia la dimensione)
  invalidateCache() {
    this._cachedPath = null;
    this._cachedPixelPos = null;
  }

  // Cambia il tipo di tile
  setType(newType) {
    if (this.type !== newType) {
      this.type = newType;
      this.markDirty();
    }
  }

  // Assegna una nazione
  setNation(nation) {
    if (this.nation !== nation) {
      this.nation = nation;
      this.markDirty();
    }
  }
}

// === MAPPA ESAGONALE CON RETAINED MODE ===
class HexagonalMap {
  constructor(radius = 40, hexSize = 12) {
    this.radius = radius; // Raggio della mappa in esagoni
    this.hexSize = hexSize; // Dimensione di ogni esagono in pixel
    this.tiles = new Map(); // Map<string, HexTile>
    this.dirtyTiles = new Set(); // Set di tile da ridisegnare
    
    // Canvas e contesto
    this.canvas = null;
    this.ctx = null;
    
    // Viewport e camera
    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 1;
    
    // Inizializza la mappa
    this.initializeMap();
  }

  // Inizializza tutti i tile della mappa
  initializeMap() {
    console.log(`Inizializzando mappa esagonale con raggio ${this.radius}`);
    
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      
      for (let r = r1; r <= r2; r++) {
        const coordinates = new HexCoordinates(q, r);
        const tile = new HexTile(coordinates);
        this.tiles.set(coordinates.toString(), tile);
      }
    }
    
    console.log(`Creati ${this.tiles.size} tile esagonali`);
  }

  // Ottieni un tile dalle coordinate
  getTile(coordinates) {
    return this.tiles.get(coordinates.toString());
  }

  // Ottieni un tile dalle coordinate q,r
  getTileAt(q, r) {
    const coordinates = new HexCoordinates(q, r);
    return this.getTile(coordinates);
  }

  // Segna un tile come sporco
  markTileDirty(coordinates) {
    const tile = this.getTile(coordinates);
    if (tile) {
      tile.markDirty();
      this.dirtyTiles.add(coordinates.toString());
    }
  }

  // Segna tutti i tile come sporchi
  markAllDirty() {
    this.dirtyTiles.clear();
    for (const [key, tile] of this.tiles) {
      tile.markDirty();
      this.dirtyTiles.add(key);
    }
  }

  // Imposta il canvas
  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Centra la camera
    this.cameraX = canvas.width / 2;
    this.cameraY = canvas.height / 2;
    
    // Segna tutti i tile come sporchi per il primo rendering
    this.markAllDirty();
  }

  // Rendering ottimizzato - ridisegna solo i tile sporchi
  render() {
    if (!this.ctx) return;

    // Se ci sono tile sporchi, ridisegnali
    if (this.dirtyTiles.size > 0) {
      console.log(`Ridisegnando ${this.dirtyTiles.size} tile sporchi`);
      
      for (const tileKey of this.dirtyTiles) {
        const tile = this.tiles.get(tileKey);
        if (tile && tile.isDirty) {
          this.renderTile(tile);
          tile.markClean();
        }
      }
      
      this.dirtyTiles.clear();
    }
  }

  // Rendering completo (per debug o reset)
  renderAll() {
    if (!this.ctx) return;
    
    console.log("Rendering completo della mappa");
    
    // Pulisci il canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Disegna tutti i tile
    for (const [key, tile] of this.tiles) {
      this.renderTile(tile);
      tile.markClean();
    }
    
    this.dirtyTiles.clear();
  }

  // Rendering di un singolo tile
  renderTile(tile) {
    if (!this.ctx) return;

    const color = TILE_COLORS[tile.type];
    const path = tile.getHexPath(this.ctx, this.hexSize * this.zoom, this.cameraX, this.cameraY);
    
    // Disegna il tile
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this.ctx.fill(path);
    
    // Disegna il bordo
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke(path);
    
    // Se il tile ha una nazione, disegna un indicatore
    if (tile.nation) {
      const pos = tile.getPixelPosition(this.hexSize * this.zoom);
      const x = pos.x + this.cameraX;
      const y = pos.y + this.cameraY;
      
      // Disegna un cerchio per la nazione
      this.ctx.fillStyle = tile.nation.color || '#ff0000';
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.hexSize * this.zoom * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Disegna il nome della nazione (se lo zoom è abbastanza alto)
      if (this.zoom > 0.5) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${Math.floor(this.hexSize * this.zoom * 0.4)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(tile.nation.name, x, y + 4);
      }
    }
  }

  // Converte coordinate pixel in coordinate esagonali
  pixelToHex(pixelX, pixelY) {
    const localX = (pixelX - this.cameraX) / this.zoom;
    const localY = (pixelY - this.cameraY) / this.zoom;
    return HexCoordinates.fromPixel(localX, localY, this.hexSize);
  }

  // Ottieni il tile sotto il mouse
  getTileAtPixel(pixelX, pixelY) {
    const hexCoords = this.pixelToHex(pixelX, pixelY);
    return this.getTile(hexCoords);
  }

  // Muovi la camera
  moveCamera(deltaX, deltaY) {
    this.cameraX += deltaX;
    this.cameraY += deltaY;
    this.markAllDirty(); // Tutti i tile devono essere ridisegnati
  }

  // Cambia lo zoom
  setZoom(newZoom) {
    if (newZoom !== this.zoom) {
      this.zoom = Math.max(0.1, Math.min(3, newZoom));
      
      // Invalida la cache di tutti i tile
      for (const tile of this.tiles.values()) {
        tile.invalidateCache();
      }
      
      this.markAllDirty();
    }
  }

  // Applica il generatore di mappe esistente
  applyMapGenerator(generator) {
    console.log("Applicando generatore di mappe ai tile esagonali");
    
    const mapWidth = generator.width;
    const mapHeight = generator.height;
    const finalMap = generator.finalMap;
    
    // Mappa i tile quadrati ai tile esagonali
    for (const [key, tile] of this.tiles) {
      // Converti coordinate esagonali in coordinate della griglia quadrata
      const pos = tile.getPixelPosition(this.hexSize);
      
      // Normalizza le coordinate per mappare sulla griglia del generatore
      const gridX = Math.floor(((pos.x + mapWidth * this.hexSize / 2) / this.hexSize) * (mapWidth / (this.radius * 2)));
      const gridY = Math.floor(((pos.y + mapHeight * this.hexSize / 2) / this.hexSize) * (mapHeight / (this.radius * 2)));
      
      // Assicurati che le coordinate siano valide
      const clampedX = Math.max(0, Math.min(mapWidth - 1, gridX));
      const clampedY = Math.max(0, Math.min(mapHeight - 1, gridY));
      
      // Applica il tipo di tile
      if (finalMap[clampedY] && finalMap[clampedY][clampedX] !== undefined) {
        tile.setType(finalMap[clampedY][clampedX]);
      }
    }
    
    console.log("Mappa applicata ai tile esagonali");
  }
}

// === GENERATORE MAPPA AVANZATO (invariato) ===
class AdvancedMapGenerator {
  constructor(width = 480, height = 480, seed = Math.random()) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.simplex = new SimplexNoise(seed);
    this.random = this.createSeededRandom(seed);
    
    // Mappe per diversi layer
    this.elevationMap = new Array(height);
    this.temperatureMap = new Array(height);
    this.humidityMap = new Array(height);
    this.finalMap = new Array(height);
    
    // Inizializza tutte le mappe
    for (let y = 0; y < height; y++) {
      this.elevationMap[y] = new Array(width).fill(0);
      this.temperatureMap[y] = new Array(width).fill(0);
      this.humidityMap[y] = new Array(width).fill(0);
      this.finalMap[y] = new Array(width).fill(TILE_TYPES.OCEAN);
    }
    
    // Parametri continentali
    this.continentCenters = [];
    this.oceanDepthThreshold = -0.15;
    this.seaLevelThreshold = 0.0;
    this.hillThreshold = 0.3;
    this.mountainThreshold = 0.6;
  }

  // Generatore di numeri casuali con seed
  createSeededRandom(seed) {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = Math.floor(seed * m);
    
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }

  // Generazione completa della mappa
  generateMap() {
    console.log("=== GENERAZIONE MAPPA AVANZATA ===");
    
    // Step 1: Genera continenti con tettonica delle placche
    this.generateContinentalStructure();
    
    // Step 2: Genera elevazione con Perlin noise multi-ottava
    this.generateElevationMap();
    
    // Step 3: Aggiungi arcipelaghi sparsi
    this.generateArchipelagos();
    
    // Step 4: Genera temperatura basata su latitudine e elevazione
    this.generateTemperatureMap();
    
    // Step 5: Genera umidità basata su oceani e venti
    this.generateHumidityMap();
    
    // Step 6: Assegna biomi basati su elevazione, temperatura e umidità
    this.assignBiomes();
    
    // Step 7: Refina con automata cellulari
    this.applyCellularAutomata();
    
    // Step 8: Genera coste
    this.generateCoastlines();
    
    console.log("=== MAPPA GENERATA CON SUCCESSO ===");
    return this.finalMap;
  }

  // Step 1: Struttura continentale usando Voronoi
  generateContinentalStructure() {
    const numContinents = 3 + Math.floor(this.random() * 3); // 3-5 continenti
    
    // Genera centri continentali
    for (let i = 0; i < numContinents; i++) {
      this.continentCenters.push({
        x: Math.floor(this.random() * this.width),
        y: Math.floor(this.random() * this.height),
        strength: 0.5 + this.random() * 0.5,
        radius: Math.floor(80 + this.random() * 120)
      });
    }
    
    console.log(`Generati ${numContinents} centri continentali`);
  }

  // Step 2: Mappa di elevazione multi-scala
  generateElevationMap() {
    console.log("Generando mappa di elevazione...");
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let elevation = 0;
        
        // Influenza continentale (Voronoi)
        let continentInfluence = -1; // Inizia come oceano profondo
        for (const continent of this.continentCenters) {
          const distance = Math.sqrt(
            Math.pow(x - continent.x, 2) + Math.pow(y - continent.y, 2)
          );
          if (distance < continent.radius) {
            const falloff = 1 - (distance / continent.radius);
            continentInfluence = Math.max(continentInfluence, 
              continent.strength * falloff * falloff);
          }
        }
        
        // Perlin noise multi-ottava per dettagli
        let noiseValue = 0;
        let amplitude = 1;
        let frequency = 0.005;
        
        // 6 ottave di noise
        for (let i = 0; i < 6; i++) {
          noiseValue += this.simplex.noise2D(x * frequency, y * frequency) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        // Combina influenza continentale e noise
        elevation = continentInfluence * 0.7 + noiseValue * 0.3;
        
        // Effetto bordo (più oceano ai bordi)
        const edgeDistance = Math.min(x, this.width - x, y, this.height - y);
        const edgeFactor = Math.min(1, edgeDistance / 50);
        elevation *= edgeFactor;
        
        this.elevationMap[y][x] = elevation;
      }
    }
  }

  // Step 3: Genera arcipelaghi sparsi
  generateArchipelagos() {
    console.log("Generando arcipelaghi...");
    
    const numArchipelagos = 4 + Math.floor(this.random() * 3); // 4-6 arcipelaghi
    
    for (let i = 0; i < numArchipelagos; i++) {
      // Posiziona gli arcipelaghi lontano dai continenti principali
      let bestX = 0, bestY = 0, maxDistanceFromContinents = 0;
      
      // Trova la posizione più lontana dai continenti  
      for (let attempt = 0; attempt < 20; attempt++) {
        const testX = Math.floor(50 + this.random() * (this.width - 100));
        const testY = Math.floor(50 + this.random() * (this.height - 100));
        
        // Controllo di sicurezza per gli indici
        if (testX < 0 || testX >= this.width || testY < 0 || testY >= this.height) {
          continue;
        }
        
        let minDistanceFromContinents = Infinity;
        for (const continent of this.continentCenters) {
          const distance = Math.sqrt(
            Math.pow(testX - continent.x, 2) + Math.pow(testY - continent.y, 2)
          );
          minDistanceFromContinents = Math.min(minDistanceFromContinents, distance);
        }
        
        if (minDistanceFromContinents > maxDistanceFromContinents) {
          maxDistanceFromContinents = minDistanceFromContinents;
          bestX = testX;
          bestY = testY;
        }
      }
      
      // Controllo di sicurezza per bestX e bestY
      if (bestX < 0 || bestX >= this.width || bestY < 0 || bestY >= this.height) {
        console.warn(`Posizione arcipelago non valida: ${bestX}, ${bestY}`);
        continue;
      }
      
      // Genera l'arcipelago
      const archipelagoSize = Math.floor(15 + this.random() * 25); // 15-40 isole
      const clusterRadius = Math.floor(30 + this.random() * 40); // Raggio dell'arcipelago
      
      for (let j = 0; j < archipelagoSize; j++) {
        // Posizione casuale nell'area dell'arcipelago
        const angle = this.random() * Math.PI * 2;
        const distance = this.random() * clusterRadius;
        const islandX = Math.floor(bestX + Math.cos(angle) * distance);
        const islandY = Math.floor(bestY + Math.sin(angle) * distance);
        
        // Controllo di sicurezza per le coordinate dell'isola
        if (islandX < 0 || islandX >= this.width || islandY < 0 || islandY >= this.height) {
          continue;
        }
        
        // Crea una piccola isola
        const islandSize = Math.floor(3 + this.random() * 8); // 3-10 tile per isola
        
        for (let dy = -islandSize; dy <= islandSize; dy++) {
          for (let dx = -islandSize; dx <= islandSize; dx++) {
            const nx = islandX + dx;
            const ny = islandY + dy;
            
            // Controllo di sicurezza per ogni tile dell'isola
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
              if (distanceFromCenter <= islandSize) {
                const falloff = 1 - (distanceFromCenter / islandSize);
                const elevation = 0.2 + falloff * 0.4; // Elevazione moderata
                
                // Controllo di sicurezza per l'accesso all'array
                if (this.elevationMap[ny] && typeof this.elevationMap[ny][nx] !== 'undefined') {
                  this.elevationMap[ny][nx] = Math.max(this.elevationMap[ny][nx], elevation);
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`Generati ${numArchipelagos} arcipelaghi`);
  }

  // Step 4: Mappa temperatura
  generateTemperatureMap() {
    console.log("Generando mappa temperature...");
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Temperatura basata su latitudine (più freddo ai poli)
        const latitude = Math.abs(y - this.height / 2) / (this.height / 2);
        let temperature = 1 - latitude * 0.8;
        
        // Effetto altitudine (più freddo in montagna)
        const elevation = this.elevationMap[y][x];
        if (elevation > this.seaLevelThreshold) {
          temperature -= elevation * 0.4;
        }
        
        // Variazione con noise
        temperature += this.simplex.noise2D(x * 0.02, y * 0.02) * 0.2;
        
        this.temperatureMap[y][x] = Math.max(0, Math.min(1, temperature));
      }
    }
  }

  // Step 5: Mappa umidità
  generateHumidityMap() {
    console.log("Generando mappa umidità...");
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let humidity = 0.5; // Umidità base
        
        // Distanza dall'oceano
        let minDistanceToOcean = Infinity;
        for (let dy = -20; dy <= 20; dy++) {
          for (let dx = -20; dx <= 20; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              if (this.elevationMap[ny][nx] <= this.seaLevelThreshold) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                minDistanceToOcean = Math.min(minDistanceToOcean, distance);
              }
            }
          }
        }
        
        // Più umido vicino all'oceano
        if (minDistanceToOcean < Infinity) {
          humidity += Math.max(0, 0.5 - minDistanceToOcean / 40);
        }
        
        // Effetto temperatura (aria calda tiene più umidità)
        humidity += this.temperatureMap[y][x] * 0.3;
        
        // Variazione con noise
        humidity += this.simplex.noise2D(x * 0.03, y * 0.03) * 0.3;
        
        this.humidityMap[y][x] = Math.max(0, Math.min(1, humidity));
      }
    }
  }

  // Step 6: Assegnazione biomi
  assignBiomes() {
    console.log("Assegnando biomi...");
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const elevation = this.elevationMap[y][x];
        const temperature = this.temperatureMap[y][x];
        const humidity = this.humidityMap[y][x];
        
        // Oceano profondo
        if (elevation < this.oceanDepthThreshold) {
          this.finalMap[y][x] = TILE_TYPES.OCEAN;
        }
        // Oceano poco profondo
        else if (elevation < this.seaLevelThreshold) {
          this.finalMap[y][x] = TILE_TYPES.OCEAN;
        }
        // Montagne
        else if (elevation > this.mountainThreshold) {
          this.finalMap[y][x] = TILE_TYPES.MOUNTAINS;
        }
        // Colline
        else if (elevation > this.hillThreshold) {
          // Le colline possono essere boscose se c'è abbastanza umidità
          if (humidity > 0.6 && temperature > 0.3) {
            this.finalMap[y][x] = TILE_TYPES.FOREST;
          } else {
            this.finalMap[y][x] = TILE_TYPES.HILLS;
          }
        }
        // Terre basse
        else {
          // Foreste se umido e caldo
          if (humidity > 0.5 && temperature > 0.4) {
            this.finalMap[y][x] = TILE_TYPES.FOREST;
          }
          // Altrimenti pianure
          else {
            this.finalMap[y][x] = TILE_TYPES.PLAINS;
          }
        }
      }
    }
  }

  // Step 7: Automata cellulari per raffinare
  applyCellularAutomata() {
    console.log("Applicando automata cellulari...");
    
    const iterations = 2;
    for (let iter = 0; iter < iterations; iter++) {
      const newMap = [];
      for (let y = 0; y < this.height; y++) {
        newMap[y] = [...this.finalMap[y]];
      }
      
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          const currentType = this.finalMap[y][x];
          
          // Conta i tipi vicini
          const neighbors = {};
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const type = this.finalMap[y + dy][x + dx];
              neighbors[type] = (neighbors[type] || 0) + 1;
            }
          }
          
          // Regole per foreste: si espandono in pianure umide
          if (currentType === TILE_TYPES.PLAINS && 
              (neighbors[TILE_TYPES.FOREST] || 0) >= 3 &&
              this.humidityMap[y][x] > 0.5) {
            newMap[y][x] = TILE_TYPES.FOREST;
          }
          
          // Regole per montagne: mantieni cluster compatti
          if (currentType === TILE_TYPES.MOUNTAINS &&
              (neighbors[TILE_TYPES.MOUNTAINS] || 0) < 3) {
            newMap[y][x] = TILE_TYPES.HILLS;
          }
        }
      }
      
      this.finalMap = newMap;
    }
  }

  // Step 8: Genera coste
  generateCoastlines() {
    console.log("Generando linee costiere...");
    
    const coastMap = [];
    for (let y = 0; y < this.height; y++) {
      coastMap[y] = [...this.finalMap[y]];
    }
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.finalMap[y][x] !== TILE_TYPES.OCEAN) {
          // Controlla se è adiacente all'oceano
          let isCoast = false;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (this.finalMap[ny][nx] === TILE_TYPES.OCEAN) {
                  isCoast = true;
                  break;
                }
              }
            }
            if (isCoast) break;
          }
          
          if (isCoast && this.finalMap[y][x] === TILE_TYPES.PLAINS) {
            coastMap[y][x] = TILE_TYPES.COAST;
          }
        }
      }
    }
    
    this.finalMap = coastMap;
  }
}

// === VARIABILI GLOBALI ===
let globalHexMap = null;

// === FUNZIONI ESPOSTE ===

// Funzione principale per generare e mostrare la mappa esagonale
window.generateAndShowMapWithSeed = (seed) => {
  console.log("=== INIZIANDO GENERAZIONE MAPPA ESAGONALE ===");
  console.log("Seed:", seed);
  
  const canvas = document.getElementById("game-map");
  if (!canvas) {
    console.error("Canvas non trovato!");
    return;
  }
  
  // Mostra il canvas
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Crea la mappa esagonale
  globalHexMap = new HexagonalMap(40, 15); // Raggio 40, dimensione esagono 15px
  globalHexMap.setCanvas(canvas);
  
  // Genera la mappa con il generatore esistente
  const generator = new AdvancedMapGenerator(480, 480, seed);
  generator.generateMap();
  
  // Applica la mappa generata ai tile esagonali
  globalHexMap.applyMapGenerator(generator);
  
  // Rendering iniziale
  globalHexMap.renderAll();
  
  // Aggiungi controlli mouse/touch
  addMapControls(canvas);
  
  console.log("=== MAPPA ESAGONALE GENERATA CON SUCCESSO ===");
};

// Funzione per ridisegnare la mappa (per aggiornamenti)
window.redrawMapWithNations = () => {
  if (globalHexMap) {
    console.log("Ridisegnando mappa con nazioni aggiornate");
    globalHexMap.render(); // Rendering ottimizzato - solo tile sporchi
  }
};

// Aggiungi controlli per la mappa
function addMapControls(canvas) {
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging && globalHexMap) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      globalHexMap.moveCamera(deltaX, deltaY);
      globalHexMap.render();
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  
  // Zoom con rotella del mouse
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (globalHexMap) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = globalHexMap.zoom * zoomFactor;
      globalHexMap.setZoom(newZoom);
      globalHexMap.render();
    }
  });
  
  // Touch events per mobile
  let lastTouchDistance = 0;
  
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging && globalHexMap) {
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      
      globalHexMap.moveCamera(deltaX, deltaY);
      globalHexMap.render();
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && globalHexMap) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance > 0) {
        const zoomFactor = currentDistance / lastTouchDistance;
        const newZoom = globalHexMap.zoom * zoomFactor;
        globalHexMap.setZoom(newZoom);
        globalHexMap.render();
      }
      
      lastTouchDistance = currentDistance;
    }
  });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDragging = false;
    lastTouchDistance = 0;
  });
  
  // Imposta il cursore iniziale
  canvas.style.cursor = 'grab';
}

// Funzione per ottenere il tile sotto il mouse (utile per future interazioni)
window.getTileAtMouse = (mouseX, mouseY) => {
  if (globalHexMap) {
    return globalHexMap.getTileAtPixel(mouseX, mouseY);
  }
  return null;
};

// Funzione per aggiornare un tile specifico (per future funzionalità)
window.updateTile = (q, r, newType, nation = null) => {
  if (globalHexMap) {
    const tile = globalHexMap.getTileAt(q, r);
    if (tile) {
      tile.setType(newType);
      if (nation) {
        tile.setNation(nation);
      }
      globalHexMap.markTileDirty(tile.coordinates);
      globalHexMap.render();
    }
  }
};

// Inizializza le variabili globali necessarie
window.placedNations = window.placedNations || {};

// Funzione di compatibilità per il vecchio sistema
window.generateAndShowMapOnStart = () => {
  window.generateAndShowMapWithSeed(Math.random());
};

console.log("=== SISTEMA MAPPA ESAGONALE CARICATO ===");