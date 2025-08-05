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
