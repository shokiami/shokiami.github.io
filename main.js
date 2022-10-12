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
    if (ripple.r > 10) {
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
    for (let i = 0; i <= res; i++) {
      canvas.triangle(x + r * Math.cos(i * dtheta), y + r * Math.sin(i * dtheta), 0, x + r * Math.cos(i * dtheta) + 0.01, y + r * Math.sin(i * dtheta), 0, x + r * Math.cos(i * dtheta), y + r * Math.sin(i * dtheta) + 0.01, 0, 1, 1, 1, 1);
    }
  }
}
