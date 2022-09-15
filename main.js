// WebGL Code

function main() {
  initWebGL();
  clear();
  triangle(-1, -1, 0, 0, 1, 0, 1, -1, 0, 0, 0, 1, 1);
  render();
}

window.onload = main;
