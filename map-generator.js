const simplex = new SimplexNoise();

function generateHeight(x, y, scale = 0.005) {
  return simplex.noise2D(x * scale, y * scale);
}

function drawMapOnCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const w = canvas.width;
  const h = canvas.height;

  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const index = (y * w + x) * 4;
      const heightVal = generateHeight(x, y);

      let r, g, b;
      if (heightVal < -0.1) {
        [r, g, b] = [0, 105, 148]; // oceano
      } else if (heightVal < 0.0) {
        [r, g, b] = [70, 130, 180]; // costa
      } else if (heightVal < 0.2) {
        [r, g, b] = [34, 139, 34]; // pianura
      } else if (heightVal < 0.4) {
        [r, g, b] = [139, 69, 19]; // collina
      } else {
        [r, g, b] = [160, 160, 160]; // montagna
      }

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

window.generateAndShowMapOnStart = (canvas) => {
  drawMapOnCanvas(canvas);
};
