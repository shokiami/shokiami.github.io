// On Window Load

function main() {
  const canvas = new Canvas();
  function refresh() {
    canvas.angle_x += 0.01;
    canvas.angle_y += 0.02;
    canvas.angle_z += 0.03;
    // clear canvas
    canvas.clear();
    // front face
    canvas.triangle( 1,  1,  1, -1,  1,  1, -1, -1,  1,  0,  0,  1,  1);
    canvas.triangle( 1, -1,  1,  1,  1,  1, -1, -1,  1,  0,  0,  1,  1);
    // back face
    canvas.triangle(-1,  1, -1,  1,  1, -1, -1, -1, -1,  0,  0,  1,  1);
    canvas.triangle( 1,  1, -1,  1, -1, -1, -1, -1, -1,  0,  0,  1,  1);
    // top face
    canvas.triangle( 1,  1, -1, -1,  1, -1, -1,  1,  1,  0,  0,  1,  1);
    canvas.triangle( 1,  1,  1,  1,  1, -1, -1,  1,  1,  0,  0,  1,  1);
    // bottom face
    canvas.triangle(-1, -1, -1,  1, -1, -1, -1, -1,  1,  0,  0,  1,  1);
    canvas.triangle( 1, -1, -1,  1, -1,  1, -1, -1,  1,  0,  0,  1,  1);
    // right face
    canvas.triangle( 1,  1, -1,  1,  1,  1,  1, -1,  1,  0,  0,  1,  1);
    canvas.triangle( 1, -1, -1,  1,  1, -1,  1, -1,  1,  0,  0,  1,  1);
    // left face
    canvas.triangle(-1,  1,  1, -1,  1, -1, -1, -1,  1,  0,  0,  1,  1);
    canvas.triangle(-1,  1, -1, -1, -1, -1, -1, -1,  1,  0,  0,  1,  1);
    // render canvas
    canvas.render();
    requestAnimationFrame(refresh);
  }
  requestAnimationFrame(refresh);
}

window.onload = main;
