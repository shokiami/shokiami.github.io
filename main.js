// On Window Load

function main() {
  const canvas = new Canvas();
  canvas.clear();
  canvas.triangle(-1, -1, 0, 0, 1, 0, 1, -1, 0, 0, 0, 1, 1);
  canvas.render();
}

window.onload = main;
