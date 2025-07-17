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

const MAP_SIZE = 80; // Regola la grandezza

// Funzione helper per rumore pseudo-casuale
function rand(x, y, seed=0) {
    return Math.abs(Math.sin((x*9283.3 + y*3841.7 + seed*918.3) * 0.017)) % 1;
}

// --- Genera la mappa con continenti, isole, montagne, fiumi, laghi, foreste ---
function generateWorldMap(size) {
    const map = [];
    const seed = Math.floor(Math.random()*99999);
    // 1. genera base: tutto oceano
    for(let y=0;y<size;y++) {
        map[y] = [];
        for(let x=0;x<size;x++) {
            map[y][x] = TILE_OCEAN;
        }
    }
    // 2. genera continenti (zone di terra)
    let continents = 2 + Math.floor(rand(seed, 0)*2);
    for(let c=0;c<continents;c++) {
        let cx = Math.floor(size*(0.25 + 0.45*rand(seed, c)));
        let cy = Math.floor(size*(0.25 + 0.45*rand(seed+1, c)));
        let radius = size*(0.22 + 0.14*rand(cx, cy));
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dx = x-cx, dy = y-cy;
            let dist = Math.sqrt(dx*dx + dy*dy) + rand(x,y,seed+c*5)*size*0.07;
            if(dist < radius) map[y][x] = TILE_PLAIN;
        }
    }
    // 3. genera isole/arcipelaghi
    let islands = 7 + Math.floor(rand(seed, 2)*6);
    for(let i=0;i<islands;i++) {
        let cx = Math.floor(size*rand(seed+23,i));
        let cy = Math.floor(size*rand(seed+17,i));
        let radius = size*(0.04 + 0.04*rand(cx,cy));
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            if(dist < radius) map[y][x] = TILE_PLAIN;
        }
    }
    // 4. genera penisole
    for(let p=0;p<continents;p++) {
        let sx = Math.floor(size*(0.2 + 0.6*rand(seed+p,seed-p)));
        let sy = Math.floor(size*(0.2 + 0.6*rand(seed+p*3,seed-p*2)));
        let dir = rand(seed,p)*2*Math.PI;
        let len = Math.floor(size*(0.1 + 0.09*rand(seed,p*7)));
        for(let l=0;l<len;l++) {
            let x = Math.floor(sx + Math.cos(dir)*l);
            let y = Math.floor(sy + Math.sin(dir)*l);
            for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++) {
                let nx=x+dx, ny=y+dy;
                if(nx>=0&&ny>=0&&nx<size&&ny<size) map[ny][nx]=TILE_PLAIN;
            }
        }
    }
    // 5. montagne a catena
    for(let m=0;m<4+Math.floor(rand(seed,5)*3);m++) {
        let sx = Math.floor(size*rand(seed+31,m));
        let sy = Math.floor(size*rand(seed+21,m));
        let dir = rand(seed,m)*2*Math.PI;
        let len = Math.floor(size*(0.18 + 0.09*rand(seed,m*3)));
        for(let l=0;l<len;l++) {
            let x = Math.floor(sx + Math.cos(dir)*l);
            let y = Math.floor(sy + Math.sin(dir)*l);
            for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) {
                let nx=x+dx, ny=y+dy;
                if(nx>=0&&ny>=0&&nx<size&&ny<size && map[ny][nx]===TILE_PLAIN)
                    map[ny][nx]=TILE_MOUNTAIN;
            }
        }
    }
    // 6. colline intorno alle montagne
    for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
        if(map[y][x]===TILE_PLAIN) {
            for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) {
                let nx=x+dx, ny=y+dy;
                if(nx>=0&&ny>=0&&nx<size&&ny<size && map[ny][nx]===TILE_MOUNTAIN)
                    if(rand(nx,ny,seed)>0.5) map[y][x]=TILE_HILL;
            }
        }
    }
    // 7. foreste random su pianure e colline
    for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
        if((map[y][x]===TILE_PLAIN || map[y][x]===TILE_HILL) && rand(x,y,seed+77)>0.77)
            map[y][x]=TILE_FOREST;
    }
    // 8. laghi random su pianure
    for(let l=0;l<7;l++) {
        let lx = Math.floor(size*rand(seed+99,l));
        let ly = Math.floor(size*rand(seed+98,l));
        let lr = size*(0.02 + 0.03*rand(lx,ly));
        for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
            let dist = Math.sqrt((x-lx)**2 + (y-ly)**2);
            if(dist < lr && map[y][x]===TILE_PLAIN)
                map[y][x]=TILE_LAKE;
        }
    }
    // 9. fiumi grandi (dalle montagne all'oceano)
    for(let f=0;f<3;f++) {
        let startX = Math.floor(size*rand(seed+123,f));
        let startY = Math.floor(size*rand(seed+321,f));
        let x=startX, y=startY;
        for(let s=0;s<size*0.7;s++) {
            if(x<0||y<0||x>=size||y>=size) break;
            if(map[Math.floor(y)][Math.floor(x)]===TILE_OCEAN) break;
            if(map[Math.floor(y)][Math.floor(x)]!==TILE_MOUNTAIN) continue;
            for(let l=0;l<size*0.5;l++) {
                if(x<0||y<0||x>=size||y>=size) break;
                if(map[Math.floor(y)][Math.floor(x)]===TILE_OCEAN) break;
                map[Math.floor(y)][Math.floor(x)]=TILE_RIVER;
                // direzione random verso il bordo
                let angle = rand(x,y,seed+f*7)*2*Math.PI;
                x += Math.cos(angle)*1.2 + (rand(x,y,seed+4)-0.5)*2;
                y += Math.sin(angle)*1.2 + (rand(x,y,seed+8)-0.5)*2;
            }
        }
    }
    // 10. fiumi piccoli
    for(let f=0;f<7;f++) {
        let startX = Math.floor(size*rand(seed+222,f));
        let startY = Math.floor(size*rand(seed+333,f));
        let x=startX, y=startY;
        for(let l=0;l<size*0.25;l++) {
            if(x<0||y<0||x>=size||y>=size) break;
            if(map[Math.floor(y)][Math.floor(x)]===TILE_OCEAN) break;
            if(map[Math.floor(y)][Math.floor(x)]!==TILE_PLAIN) continue;
            map[Math.floor(y)][Math.floor(x)]=TILE_RIVER;
            let angle = rand(x,y,seed+f*13)*2*Math.PI;
            x += Math.cos(angle)*1.1 + (rand(x,y,seed+11)-0.5)*1.5;
            y += Math.sin(angle)*1.1 + (rand(x,y,seed+19)-0.5)*1.5;
        }
    }
    return map;
}

// --- DISEGNA MAPPA ---
export function drawMapOnCanvas(map, canvas) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,width,height);
    let tX = width / MAP_SIZE;
    let tY = height / MAP_SIZE;
    for(let y=0;y<MAP_SIZE;y++) {
        for(let x=0;x<MAP_SIZE;x++) {
            let color = COLORS[map[y][x]] || "#fff";
            ctx.fillStyle = color;
            ctx.fillRect(x*tX, y*tY, tX, tY);
        }
    }
}

// --- GENERA E MOSTRA MAPPA ---
export function generateAndShowMapOnStart() {
    let map = generateWorldMap(MAP_SIZE);

    // Inserisci il canvas nel div centrale della tua UI
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
