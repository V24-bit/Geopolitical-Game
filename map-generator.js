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
const simplex = new SimplexNoise(Math.random);

function generateBiomeMap(size) {
    const map = [];
    const scale = 0.08;
    const riverScale = 0.3;
    const lakeScale = 0.17;
    const forestScale = 0.15;
    const continentThreshold = 0.25 + Math.random()*0.1;

    for(let y=0; y<size; y++) {
        const row = [];
        for(let x=0; x<size; x++) {
            let nx = x/size - 0.5, ny = y/size - 0.5;
            let elevation = simplex.noise2D(x * scale, y * scale);
            elevation = (elevation + 1) / 2;
            if (elevation < continentThreshold || Math.abs(nx) > 0.47 || Math.abs(ny) > 0.47) {
                row.push(TILE_OCEAN);
            } else {
                row.push(TILE_PLAIN);
            }
        }
        map.push(row);
    }
    // Montagne e colline
    for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
        if(map[y][x]===TILE_PLAIN) {
            let mtn = simplex.noise2D(x * 0.18, y * 0.18);
            if(mtn > 0.53) map[y][x] = TILE_MOUNTAIN;
            else if(mtn > 0.42) map[y][x] = TILE_HILL;
        }
    }
    // Fiumi principali
    for(let f=0;f<3;f++) {
        let fx = Math.floor(size*(0.2+0.6*Math.random()));
        let fy = Math.floor(size*(0.2+0.6*Math.random()));
        let len = Math.floor(size*(0.55+0.25*Math.random()));
        let angle = Math.random()*2*Math.PI;
        let x=fx, y=fy;
        for(let l=0;l<len;l++) {
            x += Math.cos(angle) + (simplex.noise2D(x*riverScale,y*riverScale)-0.5)*2;
            y += Math.sin(angle) + (simplex.noise2D(x*riverScale,y*riverScale+17)-0.5)*2;
            let ix = Math.round(x), iy = Math.round(y);
            if(ix>=0 && iy>=0 && ix<size && iy<size && map[iy][ix]!==TILE_OCEAN)
                map[iy][ix]=TILE_RIVER;
        }
    }
    // Fiumi minori
    for(let f=0;f<6;f++) {
        let fx = Math.floor(size*(0.15+0.7*Math.random()));
        let fy = Math.floor(size*(0.15+0.7*Math.random()));
        let len = Math.floor(size*(0.23+0.16*Math.random()));
        let angle = Math.random()*2*Math.PI;
        let x=fx, y=fy;
        for(let l=0;l<len;l++) {
            x += Math.cos(angle) + (simplex.noise2D(x*riverScale,y*riverScale+23)-0.5);
            y += Math.sin(angle) + (simplex.noise2D(x*riverScale,y*riverScale+29)-0.5);
            let ix = Math.round(x), iy = Math.round(y);
            if(ix>=0 && iy>=0 && ix<size && iy<size && map[iy][ix]!==TILE_OCEAN)
                map[iy][ix]=TILE_RIVER;
        }
    }
    // Laghi
    for(let l=0; l<8; l++) {
        let lx = Math.floor(size*Math.random());
        let ly = Math.floor(size*Math.random());
        let lr = 3+Math.floor(Math.random()*3);
        for(let y=ly-lr; y<=ly+lr; y++) for(let x=lx-lr; x<=lx+lr; x++) {
            if(x>=0 && y>=0 && x<size && y<size && (map[y][x]===TILE_PLAIN || map[y][x]===TILE_HILL) && Math.hypot(x-lx,y-ly)<lr)
                map[y][x]=TILE_LAKE;
        }
    }
    // Foreste
    for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
        if((map[y][x]===TILE_PLAIN || map[y][x]===TILE_HILL) && simplex.noise2D(x*forestScale, y*forestScale+17)>0.34)
            map[y][x]=TILE_FOREST;
    }
    // Piccole isole
    for(let i=0; i<9; i++) {
        let ix = Math.floor(size*Math.random());
        let iy = Math.floor(size*Math.random());
        let ir = 2+Math.floor(Math.random()*3);
        for(let y=iy-ir; y<=iy+ir; y++) for(let x=ix-ir; x<=ix+ir; x++) {
            if(x>=0 && y>=0 && x<size && y<size && map[y][x]===TILE_OCEAN && Math.hypot(x-ix,y-iy)<ir)
                map[y][x]=TILE_PLAIN;
        }
    }
    // Piccole penisole
    for(let p=0;p<4;p++) {
        let sx = Math.floor(size*(0.2 + 0.6*Math.random()));
        let sy = Math.floor(size*(0.2 + 0.6*Math.random()));
        let dir = Math.random()*2*Math.PI;
        let len = Math.floor(size*(0.11 + 0.09*Math.random()));
        for(let l=0;l<len;l++) {
            let x = Math.floor(sx + Math.cos(dir)*l);
            let y = Math.floor(sy + Math.sin(dir)*l);
            for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) {
                let nx=x+dx, ny=y+dy;
                if(nx>=0&&ny>=0&&nx<size&&ny<size && map[ny][nx]===TILE_OCEAN)
                    map[ny][nx]=TILE_PLAIN;
            }
        }
    }
    return map;
}

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

export function generateAndShowMapOnStart() {
    let map = generateBiomeMap(MAP_SIZE);
    let container = document.querySelector('.main-ui');
    let canvas = document.getElementById('game-map');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'game-map';
        canvas.width = container.offsetWidth || 330;
        canvas.height = 320;
        container.insertBefore(canvas, container.firstChild);
    } else {
        canvas.width = container.offsetWidth || 330;
        canvas.height = 320;
    }
    drawMapOnCanvas(map, canvas);
}

// Rigenera la mappa al resize
window.addEventListener('resize', () => {
    let canvas = document.getElementById('game-map');
    if (canvas) {
        generateAndShowMapOnStart();
    }
});
