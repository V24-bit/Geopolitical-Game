// Variabili globali per la mappa
let mapWidth = 800;
let mapHeight = 600;
let tileSize = 4;
let mapData = [];
let canvas, ctx;

// Oggetto globale per le nazioni posizionate
window.placedNations = {};
let hasPlayerPlacedNation = false;

// Funzione principale per generare e mostrare la mappa con seed
window.generateAndShowMapWithSeed = function(seed) {
  console.log("🗺️ Iniziando generazione mappa con seed:", seed);
  
  try {
    // Ottieni il canvas
    canvas = document.getElementById("game-map");
    if (!canvas) {
      throw new Error("Canvas game-map non trovato");
    }
    
    ctx = canvas.getContext("2d");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    
    // Genera la mappa con il seed
    console.log("🎲 Generando dati mappa...");
    generateMapData(seed);
    
    // Disegna la mappa
    console.log("🎨 Disegnando mappa...");
    drawMap();
    
    // Mostra il canvas
    canvas.style.display = "block";
    console.log("✅ Mappa generata e mostrata con successo");
    
    // Setup click handler per posizionamento nazioni
    setTimeout(() => {
      setupNationPlacement();
    }, 100);
    
  } catch (error) {
    console.error("❌ Errore nella generazione mappa:", error);
    throw error;
  }
};

// Funzione per generare i dati della mappa usando un seed
function generateMapData(seed) {
  // Usa il seed per Math.random deterministico
  let seedValue = seed;
  function seededRandom() {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  }
  
  mapData = [];
  const cols = Math.floor(mapWidth / tileSize);
  const rows = Math.floor(mapHeight / tileSize);
  
  // Genera noise per il terreno
  for (let y = 0; y < rows; y++) {
    mapData[y] = [];
    for (let x = 0; x < cols; x++) {
      const noise = generateNoise(x, y, seededRandom);
      mapData[y][x] = getTileType(noise);
    }
  }
  
  console.log(`📊 Mappa generata: ${cols}x${rows} tiles`);
}

// Funzione per generare noise
function generateNoise(x, y, randomFunc) {
  const scale = 0.05;
  const octaves = 4;
  let value = 0;
  let amplitude = 1;
  let frequency = scale;
  
  for (let i = 0; i < octaves; i++) {
    value += randomFunc() * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}

// Funzione per determinare il tipo di tile basato sul noise
function getTileType(noise) {
  if (noise < 0.3) return 'water';
  if (noise < 0.4) return 'sand';
  if (noise < 0.6) return 'grass';
  if (noise < 0.8) return 'forest';
  return 'mountain';
}

// Funzione per ottenere il colore del tile
function getTileColor(type) {
  switch (type) {
    case 'water': return '#4A90E2';
    case 'sand': return '#F5DEB3';
    case 'grass': return '#90EE90';
    case 'forest': return '#228B22';
    case 'mountain': return '#8B7355';
    default: return '#CCCCCC';
  }
}

// Funzione per disegnare la mappa
function drawMap() {
  if (!ctx || !mapData.length) return;
  
  const cols = Math.floor(mapWidth / tileSize);
  const rows = Math.floor(mapHeight / tileSize);
  
  // Disegna i tile
  for (let y = 0; y < rows && y < mapData.length; y++) {
    for (let x = 0; x < cols && x < mapData[y].length; x++) {
      const tileType = mapData[y][x];
      const color = getTileColor(tileType);
      
      ctx.fillStyle = color;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
  
  // Disegna le nazioni dopo i tile
  setTimeout(() => {
    drawAllNations();
  }, 50);
}

// Funzione per disegnare tutte le nazioni
function drawAllNations() {
  if (!window.placedNations) return;
  
  const nationCount = Object.keys(window.placedNations).length;
  console.log(`🏛️ Disegnando ${nationCount} nazioni`);
  
  Object.entries(window.placedNations).forEach(([playerName, data]) => {
    drawNationMarker(data.x, data.y, playerName);
  });
}

// Funzione per disegnare il marker di una nazione
function drawNationMarker(x, y, playerName) {
  if (!ctx) return;
  
  // Confine circolare esterno (translucido)
  ctx.strokeStyle = 'rgba(255, 68, 68, 0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Confine circolare interno
  ctx.strokeStyle = 'rgba(255, 68, 68, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Punto centrale (capitale)
  ctx.fillStyle = 'rgba(255, 68, 68, 0.8)';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Nome della nazione
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  
  // Ombra del testo
  ctx.strokeText(playerName, x, y - 25);
  ctx.fillText(playerName, x, y - 25);
}

// Funzione per setup del posizionamento nazioni
function setupNationPlacement() {
  if (!canvas || hasPlayerPlacedNation) {
    console.log("⚠️ Setup posizionamento saltato - già posizionato o canvas mancante");
    return;
  }
  
  console.log("🎯 Setup click handler per posizionamento nazione");
  
  const clickHandler = function(event) {
    if (hasPlayerPlacedNation) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Verifica che non sia acqua
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    
    if (tileY < mapData.length && tileX < mapData[tileY].length) {
      const tileType = mapData[tileY][x];
      
      if (tileType === 'water') {
        console.log("❌ Clic su acqua - posizionamento non valido");
        return;
      }
      
      // Posiziona la nazione
      placeNation(x, y);
    }
  };
  
  canvas.addEventListener('click', clickHandler);
}

// Funzione per posizionare una nazione
function placeNation(x, y) {
  if (!window.currentPlayerName || hasPlayerPlacedNation) return;
  
  console.log(`🏛️ Posizionando nazione ${window.currentPlayerName} a (${x}, ${y})`);
  
  // Blocca ulteriori posizionamenti
  hasPlayerPlacedNation = true;
  
  // Aggiungi alle nazioni locali
  window.placedNations[window.currentPlayerName] = { x, y };
  
  // Disegna immediatamente
  drawNationMarker(x, y, window.currentPlayerName);
  
  // Salva su Firebase
  if (window.currentGameCode && window.db) {
    const updateData = {};
    updateData[`nazioni.${window.currentPlayerName}`] = { x, y };
    
    window.db.collection("partite").doc(window.currentGameCode).update(updateData)
      .then(() => {
        console.log("✅ Nazione salvata su Firebase");
      })
      .catch((error) => {
        console.error("❌ Errore salvataggio Firebase:", error);
      });
  }
}

// Funzione per ridisegnare la mappa con le nazioni
window.redrawMapWithNations = function() {
  if (!ctx || !mapData.length) return;
  
  console.log("🔄 Ridisegnando mappa con nazioni");
  
  // Ridisegna solo i tile base
  drawMap();
};

console.log("✅ Map generator caricato correttamente");