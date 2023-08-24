const MANDELBROT_COUNT = 140;
const MANDELBROT_HEIGHT = 1080;
const MANDELBROT_WIDTH = 1920;
const MANDELBROT_SCALAR = 1.28402541669;  // e^(1/4)
const MANDELBROT_DIR = 'assets/mandelbrot/';

window.onload = init;

function init() {
  // init dropdowns
  for (let dropdown_menu of document.querySelectorAll('.dropdown-menu')) {
    dropdown_menu.style.setProperty('height', '0px');
  }
  // init mandelbrots
  let mandelbrot_container = document.getElementById('mandelbrot-container');
  for (let i = 0; i < MANDELBROT_COUNT; i++) {
    let mandelbrot = document.createElement('img');
    mandelbrot.id = i;
    mandelbrot.src = MANDELBROT_DIR + i + '.jpg';
    mandelbrot.className = 'mandelbrot';
    mandelbrot_container.appendChild(mandelbrot);
  }
  update();
}

function update() {
  let scroll = Math.min(Math.max(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 0.0), 1.0);
  let i_cont = scroll * (MANDELBROT_COUNT - 1);
  for (let mandelbrot of document.querySelectorAll('.mandelbrot')) {
    // update visibility
    let i = parseInt(mandelbrot.id);
    if (i_cont < i || i_cont > i + 2) {
      mandelbrot.style.setProperty('visibility', 'hidden');
      continue;
    }
    mandelbrot.style.setProperty('visibility', 'visible');
    // update size
    let height = 100.0 * Math.max(MANDELBROT_HEIGHT / MANDELBROT_WIDTH * window.innerWidth / window.innerHeight, 1.0) + '%';
    mandelbrot.style.setProperty('height', height);
    // update scale
    let scale = MANDELBROT_SCALAR ** (i_cont - i);
    let dy = 50.0 - 100.0 * (0.2 + 0.14 * 0.9 ** i) + '%';
    let dx = 50.0 - 100.0 * (0.9 - 0.25 * 0.9 ** i) + '%';
    let transform = 'translate(-50%, -50%) scale(' + scale + ') translate(' + dx + ', ' + dy + ')';
    mandelbrot.style.setProperty('transform', transform);
    // update position
    let top = 100.0 * (0.2 + 0.14 * 0.9 ** i_cont) + '%';
    let left = 100.0 * (0.9 - 0.25 * 0.9 ** i_cont) + '%';
    mandelbrot.style.setProperty('top', top);
    mandelbrot.style.setProperty('left', left);
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    mandelbrot.style.setProperty('opacity', opacity);
  }
  window.requestAnimationFrame(update);
}

function toggleDropdown(dropdown) {
  let dropdown_menu = dropdown.parentElement.nextElementSibling;
  if (dropdown_menu.style.getPropertyValue('height') == '0px') {
    let item_height = dropdown_menu.children[0].getBoundingClientRect().height;
    let height = dropdown_menu.children.length * item_height;
    dropdown_menu.style.setProperty('height', height + 'px');
  } else {
    dropdown_menu.style.setProperty('height', '0px');
  }
  let dropdown_arrow = dropdown.children[0];
  dropdown_arrow.classList.toggle('activated');
}
