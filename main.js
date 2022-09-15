// On Window Load

function main() {
  const canvas = new Canvas();
  function refresh() {
    canvas.angle_x += 0.01;
    canvas.angle_y += 0.02;
    canvas.angle_z += 0.03;
    // clear canvas
    canvas.clear();
    // front face (white)
    canvas.triangle(-1,  1,  1,  1,  1,  1, -1, -1,  1,  1,  1,  1,  1);
    canvas.triangle( 1, -1,  1,  1,  1,  1, -1, -1,  1,  1,  1,  1,  1);
    // back face (red)
    canvas.triangle(-1,  1, -1,  1,  1, -1, -1, -1, -1,  1,  0,  0,  1);
    canvas.triangle( 1, -1, -1,  1,  1, -1, -1, -1, -1,  1,  0,  0,  1);
    // top face (green)
    canvas.triangle(-1,  1, -1,  1,  1, -1, -1,  1,  1,  0,  1,  0,  1);
    canvas.triangle( 1,  1,  1,  1,  1, -1, -1,  1,  1,  0,  1,  0,  1);
    // bottom face (blue)
    canvas.triangle(-1, -1, -1,  1, -1, -1, -1, -1,  1,  0,  0,  1,  1);
    canvas.triangle( 1, -1,  1,  1, -1, -1, -1, -1,  1,  0,  0,  1,  1);
    // right face (yellow)
    canvas.triangle( 1,  1,  1,  1,  1, -1,  1, -1,  1,  1,  1,  0,  1);
    canvas.triangle( 1, -1, -1,  1,  1, -1,  1, -1,  1,  1,  1,  0,  1);
    // left face (pink)
    canvas.triangle(-1,  1,  1, -1,  1, -1, -1, -1,  1,  1,  0,  1,  1);
    canvas.triangle(-1, -1, -1, -1,  1, -1, -1, -1,  1,  1,  0,  1,  1);
    // render canvas
    canvas.render();
    requestAnimationFrame(refresh);
  }
  requestAnimationFrame(refresh);
}

window.onload = main;
