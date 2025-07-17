// === CONFIGURAZIONE SPRITESHEET ONDA ===
const waveAnim = new window.Image();
waveAnim.src = "assets/animations/wave01.png";
const WAVE_FRAMES = 18;
const WAVE_FPS = 17;
const WAVE_FRAME_WIDTH = 32;
const WAVE_FRAME_HEIGHT = 32;

// --- BIOMI ---
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

const MAP_SIZE = 120; // Puoi modificare la risoluzione

let pixelWaves = [];

// Rumore Perlin-like semplice
function noise(x, y, seed=0) {
    return Math.abs(Math.sin((x*83.1 + y*61.7 + seed*13.7) * 0.017)) % 1;
}

// Generatore di continente/isole
function generateLandMask(size, continents=3, islands=12) {
    let land = Array.from({length:size},()=>Array(size).fill(false));
    const seed = Math.random()*1000;
    // Genera continenti
    for(let c=0;c<continents;c++) {
        let cx = Math.floor(size*(0.2 + 0.6*Math.random()));
        let cy = Math.floor(size*(0.2 + 0.6*Math.random()));
        let cr = size*(0.22 + 0.13*Math.random());
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            let n = noise(x*0.12, y*0.12, seed+c*37);
            if(dist < cr*(0.7+n*0.5)) land[y][x]=true;
        }
    }
    // Genera isole/arcipelaghi
    for(let i=0;i<islands;i++) {
        let cx = Math.floor(size*Math.random());
        let cy = Math.floor(size*Math.random());
        let cr = size*(0.05+0.05*Math.random());
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            let n = noise(x*0.22, y*0.22, seed+i*9);
            if(dist < cr*(0.7+n*0.7)) land[y][x]=true;
        }
    }
    // Genera penisole random
    for(let p=0;p<Math.floor(continents*1.5);p++) {
        let startX = Math.floor(size*(0.1 + 0.8*Math.random()));
        let startY = Math.floor(size*(0.1 + 0.8*Math.random()));
        let dir = Math.random()*Math.PI*2;
        let len = Math.floor(size*(0.15+0.12*Math.random()));
        for(let l=0;l<len;l++) {
            let x = Math.floor(startX + Math.cos(dir)*l);
            let y = Math.floor(startY + Math.sin(dir)*l);
            for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++) {
                let nx = x+dx, ny = y+dy;
                if(nx>=0 && ny>=0 && nx<size && ny<size) land[ny][nx]=true;
            }
        }
    }
    return land;
}

// Generatore di rilievi (montagne/colline)
function generateElevationMap(size, land) {
    let elevation = Array.from({length:size},()=>Array(size).fill(0));
    let seed = Math.random()*1000;
    // Montagne
    for(let m=0;m<Math.floor(size/7);m++) {
        let mx = Math.floor(size*Math.random());
        let my = Math.floor(size*Math.random());
        let mr = size*(0.10+0.08*Math.random());
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-mx)**2 + (y-my)**2);
            let n = noise(x*0.22, y*0.22, seed+m*97);
            if(dist < mr*(0.7+n*0.5) && land[y][x]) elevation[y][x]+=0.8-n*0.15;
        }
    }
    // Colline diffuse
    for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
        if(land[y][x]) elevation[y][x] += noise(x*0.07, y*0.07, seed+19)*0.4;
    }
    return elevation;
}

// Generatore di fiumi (curve dalle montagne)
function generateRivers(size, elevation, land) {
    let riverMap = Array.from({length:size},()=>Array(size).fill(false));
    let seed = Math.random()*1000;
    for(let r=0;r<5;r++) {
        // Trova una sorgente in montagna
        let tries = 0;
        let sx,sy;
        do {
            sx = Math.floor(size*Math.random());
            sy = Math.floor(size*Math.random());
            tries++;
        } while(((elevation[sy] && elevation[sy][sx])<0.7 || !land[sy][sx]) && tries<100);
        let len = Math.floor(size*(0.6+0.2*Math.random()));
        let x = sx, y = sy;
        for(let l=0;l<len;l++) {
            riverMap[Math.floor(y)][Math.floor(x)] = true;
            // Segui la pendenza verso il basso
            let minE = elevation[Math.floor(y)][Math.floor(x)];
            let bestDx = 0, bestDy = 0;
            for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
                let nx = Math.floor(x+dx), ny = Math.floor(y+dy);
                if(nx>=0 && nx<size && ny>=0 && ny<size && land[ny][nx] && elevation[ny][nx]<minE) {
                    minE = elevation[ny][nx];
                    bestDx = dx; bestDy = dy;
                }
            }
            x += bestDx + (noise(x*0.1,y*0.1,seed+r*7)-0.5)*0.7;
            y += bestDy + (noise(x*0.1,y*0.1,seed+r*17)-0.5)*0.7;
            if(!land[Math.floor(y)][Math.floor(x)]) break;
        }
    }
    // Fiumi piccoli
    for(let r=0;r<9;r++) {
        let sx = Math.floor(size*Math.random());
        let sy = Math.floor(size*Math.random());
        if(!land[sy][sx] || elevation[sy][sx]<0.45) continue;
        let len = Math.floor(size*(0.25+0.15*Math.random()));
        let x = sx, y = sy;
        for(let l=0;l<len;l++) {
            riverMap[Math.floor(y)][Math.floor(x)] = true;
            let minE = elevation[Math.floor(y)][Math.floor(x)];
            let bestDx = 0, bestDy = 0;
            for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
                let nx = Math.floor(x+dx), ny = Math.floor(y+dy);
                if(nx>=0 && nx<size && ny>=0 && ny<size && land[ny][nx] && elevation[ny][nx]<minE) {
                    minE = elevation[ny][nx];
                    bestDx = dx; bestDy = dy;
                }
            }
            x += bestDx + (noise(x*0.1,y*0.1,seed+r*11)-0.5)*0.3;
            y += bestDy + (noise(x*0.1,y*0.1,seed+r*13)-0.5)*0.3;
            if(!land[Math.floor(y)][Math.floor(x)]) break;
        }
    }
    return riverMap;
}

// Generatore laghi
function generateLakes(size, elevation, land, rivers) {
    let lakeMap = Array.from({length:size},()=>Array(size).fill(false));
    let seed = Math.random()*1000;
    for(let l=0;l<7;l++) {
        let lx = Math.floor(size*Math.random());
        let ly = Math.floor(size*Math.random());
        if(!land[ly][lx] || elevation[ly][lx]>0.55) continue;
        let lr = size*(0.03+0.03*Math.random());
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-lx)**2 + (y-ly)**2);
            let n = noise(x*0.2, y*0.2, seed+l*13);
            if(dist < lr*(0.7+n*0.7) && land[y][x] && elevation[y][x]<0.52 && !rivers[y][x]) lakeMap[y][x]=true;
        }
    }
    return lakeMap;
}

// Biomi principali
function generateBiomeMap(size) {
    const land = generateLandMask(size, 3+Math.floor(Math.random()*2), 9+Math.floor(Math.random()*7));
    const elevation = generateElevationMap(size, land);
    const rivers = generateRivers(size, elevation, land);
    const lakes = generateLakes(size, elevation, land, rivers);

    const map = [];
    for(let y=0;y<size;y++) {
        const row = [];
        for(let x=0;x<size;x++) {
            if(!land[y][x]) {
                row.push(TILE_OCEAN);
            } else if (rivers[y][x]) {
                row.push(TILE_RIVER);
            } else if (lakes[y][x]) {
                row.push(TILE_LAKE);
            } else if (elevation[y][x]>0.78) {
                row.push(TILE_MOUNTAIN);
            } else if (elevation[y][x]>0.62) {
                row.push(TILE_HILL);
            } else if (noise(x*0.15,y*0.15)+noise(x*0.21,y*0.19)>1.22) {
                row.push(TILE_FOREST);
            } else {
                row.push(TILE_PLAIN);
            }
        }
        map.push(row);
    }
    return map;
}

export function spawnWaves(map, now) {
  if (!spawnWaves.lastSpawn || now - spawnWaves.lastSpawn > 1300) {
    spawnWaves.lastSpawn = now;
    for (let i = 0; i < 5; i++) {
      let tries = 0, found = false, x, y;
      while (!found && tries < 40) {
        x = Math.floor(Math.random() * MAP_SIZE);
        y = Math.floor(Math.random() * MAP_SIZE);
        let type = map[y][x];
        if (type === TILE_OCEAN || type === TILE_LAKE || type === TILE_RIVER) found = true;
        tries++;
      }
      if (found) {
        pixelWaves.push({
          x, y,
          type: map[y][x],
          startTime: now,
          duration: 800 + Math.random() * 800
        });
      }
    }
  }
  pixelWaves = pixelWaves.filter(w => now - w.startTime < w.duration);
}

// Disegna la mappa e le onde animate
export function drawMapOnCanvas(map, canvas, zoom = 1, offsetX = 0, offsetY = 0, now = 0) {
  let width = canvas.width;
  let height = canvas.height;
  let ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(offsetX, offsetY);
  ctx.scale(zoom, zoom);

  let tX = width / MAP_SIZE;
  let tY = height / MAP_SIZE;

  let startX = 0, endX = MAP_SIZE;
  let startY = 0, endY = MAP_SIZE;

  let waveMap = new Map();
  for (const w of pixelWaves) {
    if (w.x >= startX && w.x < endX && w.y >= startY && w.y < endY)
      waveMap.set(w.y + "," + w.x, w);
  }
  let frameIdx = 0;
  if (waveAnim.complete && waveAnim.naturalWidth > 0) {
    frameIdx = Math.floor((now / (1000 / WAVE_FPS)) % WAVE_FRAMES);
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      let type = map[y][x];
      let color = COLORS[type];
      let key = y + "," + x;
      if (waveMap.has(key) && waveAnim.complete && waveAnim.naturalWidth > 0) {
        ctx.drawImage(
          waveAnim,
          frameIdx * WAVE_FRAME_WIDTH, 0,
          WAVE_FRAME_WIDTH, WAVE_FRAME_HEIGHT,
          x * tX, y **

