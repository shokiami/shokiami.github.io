// Main

window.onload = main;

function main() {
  init();
  function loop() {
    update();
    window.requestAnimationFrame(loop);
  }
  window.requestAnimationFrame(loop);
}

var canvas = null;
var mouse = null;
var ripples = null;

function init() {
  canvas = new Canvas();
  document.addEventListener("mousemove", mouse_move);
  document.addEventListener("click", click);
  ripples = [];
}

function update() {
  // clear canvas
  canvas.clear();
  update_ripples();
  draw_ripples();
  // render canvas
  canvas.render();
}

function mouse_move(event) {
  let [x, y] = canvas.to_xyz(event.clientX, event.clientY);
  mouse = {
    x: x,
    y: y,
  };
}

function click() {
  let ripple = {
    x: mouse.x,
    y: mouse.y,
    r: 0,
  };
  ripples.push(ripple);
}

function update_ripples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];
    if (ripple.r > 5) {
      ripples.splice(i, 1);
    } else {
      ripple.r += 0.05;
    }
  }
}

function draw_ripples() {
  for (let ripple of ripples) {
    let x = ripple.x;
    let y = ripple.y;
    let r = ripple.r;
    let res = 1000;
    let dtheta = 2 * Math.PI / res;
    for (let i = 0; i < res; i++) {
      let cos1 = Math.cos(i * dtheta);
      let sin1 = Math.sin(i * dtheta);
      let cos2 = Math.cos((i + 1) * dtheta);
      let sin2 = Math.sin((i + 1) * dtheta);
      canvas.triangle(x + r * cos1, y + r * sin1, 0, x + r * cos2, y + r * sin2, 0, x + (r - 0.01) * cos1, y + (r - 0.01) * sin1, 0, 1, 1, 1, 1 - r / 5);
      canvas.triangle(x + (r - 0.01) * cos1, y + (r - 0.01) * sin1, 0,  x + r * cos2, y + r * sin2, 0, x + (r - 0.01) * cos2, y + (r - 0.01) * sin2, 0, 1, 1, 1, 1 - r / 5);
    }
  }
}
