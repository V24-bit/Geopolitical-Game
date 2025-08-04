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

// --- Mappa ---

const simplex = new SimplexNoise();

function generateHeightMap(width, height, scale = 0.005) {
  const map = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const nx = x * scale;
      const ny = y * scale;
      const elevation = (simplex.noise2D(nx, ny) + 1) / 2; // normalizza [0, 1]
      row.push(elevation);
    }
    map.push(row);
  }
  return map;
}

function drawMapOnCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = 1200;
  const height = canvas.height = 800;

  const map = generateHeightMap(width, height);

  const imgData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = map[y][x];
      const index = (y * width + x) * 4;

      let r = 0, g = 0, b = 0;

      if (elevation < 0.4) { r = 0; g = 105; b = 148; }       // oceano
      else if (elevation < 0.5) { r = 240; g = 240; b = 170; } // costa
      else if (elevation < 0.7) { r = 80; g = 160; b = 60; }   // pianura
      else { r = 120; g = 120; b = 120; }                      // montagne

      imgData.data[index + 0] = r;
      imgData.data[index + 1] = g;
      imgData.data[index + 2] = b;
      imgData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// Espone la funzione al main.js
window.generateAndShowMapOnStart = () => {
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  drawMapOnCanvas(canvas);
};
