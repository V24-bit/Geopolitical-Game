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

// Funzione principale per disegnare la mappa
function drawTileMapOnCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = 1200;
  const height = canvas.height = 800;

  console.log("=== INIZIANDO GENERAZIONE MAPPA AVANZATA ===");
  const startTime = performance.now();

  // Crea il nuovo generatore avanzato
  const generator = new AdvancedMapGenerator(480, 480, Math.random());
  const tileMap = generator.generateMap();

  const endTime = performance.now();
  console.log(`=== MAPPA GENERATA IN ${(endTime - startTime).toFixed(2)}ms ===`);

  // Calcola statistiche
  const stats = {};
  for (let y = 0; y < generator.height; y++) {
    for (let x = 0; x < generator.width; x++) {
      const type = tileMap[y][x];
      stats[type] = (stats[type] || 0) + 1;
    }
  }
  
  console.log("Statistiche mappa:");
  console.log(`Oceano: ${stats[TILE_TYPES.OCEAN] || 0} tiles (${((stats[TILE_TYPES.OCEAN] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Costa: ${stats[TILE_TYPES.COAST] || 0} tiles (${((stats[TILE_TYPES.COAST] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Pianure: ${stats[TILE_TYPES.PLAINS] || 0} tiles (${((stats[TILE_TYPES.PLAINS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Colline: ${stats[TILE_TYPES.HILLS] || 0} tiles (${((stats[TILE_TYPES.HILLS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Montagne: ${stats[TILE_TYPES.MOUNTAINS] || 0} tiles (${((stats[TILE_TYPES.MOUNTAINS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Foreste: ${stats[TILE_TYPES.FOREST] || 0} tiles (${((stats[TILE_TYPES.FOREST] || 0) / (480*480) * 100).toFixed(1)}%)`);

  const tileWidth = width / generator.width;
  const tileHeight = height / generator.height;

  // Disegna ogni tile
  for (let y = 0; y < generator.height; y++) {
    for (let x = 0; x < generator.width; x++) {
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

  console.log("=== MAPPA DISEGNATA CON SUCCESSO ===");
}

// Espone la funzione al main.js
window.generateAndShowMapOnStart = () => {
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  drawTileMapOnCanvas(canvas);
};
// Funzione per generare la mappa con un seed specifico (per multiplayer)
window.generateAndShowMapWithSeed = (seed) => {
  console.log("Generando mappa con seed:", seed);
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  drawTileMapOnCanvasWithSeed(canvas, seed);
};

// Funzione per disegnare la mappa con seed specifico
function drawTileMapOnCanvasWithSeed(canvas, seed) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = 1200;
  const height = canvas.height = 800;

  console.log("=== INIZIANDO GENERAZIONE MAPPA AVANZATA CON SEED ===");
  const startTime = performance.now();

  // Crea il nuovo generatore avanzato con il seed fornito
  const generator = new AdvancedMapGenerator(480, 480, seed);
  const tileMap = generator.generateMap();

  const endTime = performance.now();
  console.log(`=== MAPPA GENERATA IN ${(endTime - startTime).toFixed(2)}ms ===`);

  // Calcola statistiche
  const stats = {};
  for (let y = 0; y < generator.height; y++) {
    for (let x = 0; x < generator.width; x++) {
      const type = tileMap[y][x];
      stats[type] = (stats[type] || 0) + 1;
    }
  }
  
  console.log("Statistiche mappa:");
  console.log(`Oceano: ${stats[TILE_TYPES.OCEAN] || 0} tiles (${((stats[TILE_TYPES.OCEAN] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Costa: ${stats[TILE_TYPES.COAST] || 0} tiles (${((stats[TILE_TYPES.COAST] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Pianure: ${stats[TILE_TYPES.PLAINS] || 0} tiles (${((stats[TILE_TYPES.PLAINS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Colline: ${stats[TILE_TYPES.HILLS] || 0} tiles (${((stats[TILE_TYPES.HILLS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Montagne: ${stats[TILE_TYPES.MOUNTAINS] || 0} tiles (${((stats[TILE_TYPES.MOUNTAINS] || 0) / (480*480) * 100).toFixed(1)}%)`);
  console.log(`Foreste: ${stats[TILE_TYPES.FOREST] || 0} tiles (${((stats[TILE_TYPES.FOREST] || 0) / (480*480) * 100).toFixed(1)}%)`);

  const tileWidth = width / generator.width;
  const tileHeight = height / generator.height;

  // Disegna ogni tile
  for (let y = 0; y < generator.height; y++) {
    for (let x = 0; x < generator.width; x++) {
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

  console.log("=== MAPPA DISEGNATA CON SUCCESSO ===");
  
  // Inizializza le variabili globali per le nazioni se non esistono
  if (!window.placedNations) {
    window.placedNations = {};
  }
  
  // Esponi la funzione di ridisegno
  window.redrawMapWithNations = () => {
    drawTileMapOnCanvasWithSeed(canvas, seed);
    // Qui potresti aggiungere il codice per ridisegnare le nazioni posizionate
  };
}

// Inizializza le variabili globali necessarie
window.placedNations = window.placedNations || {};