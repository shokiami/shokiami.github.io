const IMAGE_COUNT = 140;
const IMAGE_HEIGHT = 1080;
const IMAGE_WIDTH = 1920;
const IMAGE_SCALAR = 1.28402541669;  // e^(1/4)
const IMAGE_DIR = 'assets/mandelbrot/';

window.onload = init;

function init() {
  // init dropdowns
  for (let dropdown_menu of document.querySelectorAll('.dropdown-menu')) {
    dropdown_menu.style.setProperty('height', '0px');
  }
  // init images
  let image_container = document.getElementById('image-container');
  for (let i = 0; i < IMAGE_COUNT; i++) {
    let image = document.createElement('img');
    image.id = i;
    image.src = IMAGE_DIR + i + '.jpg';
    image.className = 'image';
    image_container.appendChild(image);
  }
  update();
}

function update() {
  let scroll = Math.min(Math.max(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 0.0), 1.0);
  let i_cont = scroll * (IMAGE_COUNT - 1);
  for (let image of document.querySelectorAll('.image')) {
    // update visibility
    let i = parseInt(image.id);
    if (i_cont < i || i_cont > i + 2) {
      image.style.setProperty('visibility', 'hidden');
      continue;
    }
    image.style.setProperty('visibility', 'visible');
    // update size
    let height = 100.0 * Math.max(IMAGE_HEIGHT / IMAGE_WIDTH * window.innerWidth / window.innerHeight, 1.0) + '%';
    image.style.setProperty('height', height);
    // update scale
    let scale = IMAGE_SCALAR ** (i_cont - i);
    let dy = 50.0 - 100.0 * (0.2 + 0.14 * 0.9 ** i) + '%';
    let dx = 50.0 - 100.0 * (0.9 - 0.25 * 0.9 ** i) + '%';
    let transform = 'translate(-50%, -50%) scale(' + scale + ') translate(' + dx + ', ' + dy + ')';
    image.style.setProperty('transform', transform);
    // update position
    let top = 100.0 * (0.2 + 0.14 * 0.9 ** i_cont) + '%';
    let left = 100.0 * (0.9 - 0.25 * 0.9 ** i_cont) + '%';
    image.style.setProperty('top', top);
    image.style.setProperty('left', left);
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    image.style.setProperty('opacity', opacity);
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
