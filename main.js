const MANDELBROT_COUNT = 140;
const MANDELBROT_HEIGHT = 1080;
const MANDELBROT_WIDTH = 1920;
const MANDELBROT_SCALAR = 1.28402541669;  // e^(1/4)
const MANDELBROT_DIR = 'assets/mandelbrot/';

let scroll_to;
let scroll_top;
let scroll_max;
let scroll_start;
let scroll_dist;
let start_time;
let total_time;

window.onload = init;
window.onpopstate = popstate;

function init() {
  // init dropdowns
  for (let dropdown_menu of document.querySelectorAll('.dropdown-menu')) {
    dropdown_menu.style.height = '0px';
  }
  // init mandelbrots
  let mandelbrot_container = document.getElementById('mandelbrot-container');
  for (let i = 0; i < MANDELBROT_COUNT; i++) {
    let mandelbrot = document.createElement('img');
    mandelbrot.id = i;
    mandelbrot.src = MANDELBROT_DIR + i + '.webp';
    mandelbrot.className = 'mandelbrot';
    mandelbrot.loading = 'lazy';
    mandelbrot_container.appendChild(mandelbrot);
  }
  // init navlinks
  for (let navlink of document.querySelectorAll('.navlink')) {
    navlink.onclick = navlinkClick;
  }
  // init scroll
  scroll_to = null;
  scroll_top = 0.0;
  scroll_max = document.documentElement.scrollHeight - window.innerHeight;
  restrict(window.location.hash);
  // start loop
  loop();
}

function loop() {
  updateScroll();
  updateMandelbrot();
  window.requestAnimationFrame(loop);
}

function navlinkClick(event) {
  event.preventDefault();
  let href = this.getAttribute('href');
  if (href !== window.location.hash) {
    history.pushState(null, null, href);
  }
  scroll(href);
}

function popstate() {
  scroll(window.location.hash);
}

function scroll(href) {
  unrestrict();
  scroll_to = href;
  scroll_start = window.scrollY;
  scroll_dist = href === '' ? -scroll_start : document.querySelector(href).getBoundingClientRect().top;
  start_time = performance.now();
  total_time = 10.0 * Math.sqrt(Math.abs(scroll_dist));
}

function unrestrict() {
  let scroll = window.scrollY;
  document.getElementById('home').style.display = 'flex';
  for (let child of document.getElementById('main').children) {
    child.style.display = 'block';
  }
  window.scrollTo(0.0, scroll_top + scroll);
  scroll_top = 0.0;
}

function restrict(href) {
  if (href === '' || href === '#home' || href === '#about' || href === '#projects' || href === '#contact') {
    return;
  }
  let target = document.querySelector(href);
  let diff = target.getBoundingClientRect().top;
  scroll_top = window.scrollY + diff;
  document.getElementById('home').style.display = 'none';
  for (let child of document.getElementById('main').children) {
    if (child.id !== target.id && child.id !== 'footer') {
      child.style.display = 'none';
    }
  }
  window.scrollTo(0.0, diff);
}

function updateScroll() {
  if (scroll_to !== null) {
    let elapsed_time = performance.now() - start_time;
    let p = Math.min(elapsed_time / total_time, 1.0);
    p = p * (2.0 - p);
    window.scrollTo(0, scroll_start + p * scroll_dist);
    if (elapsed_time > total_time) {
      restrict(scroll_to);
      scroll_to = null;
    }
  }
}

function updateMandelbrot() {
  let scroll = Math.min(Math.max((scroll_top + window.scrollY) / scroll_max, 0.0), 1.0);
  let i_cont = scroll * (MANDELBROT_COUNT - 1);
  for (let mandelbrot of document.querySelectorAll('.mandelbrot')) {
    // update display
    let i = parseInt(mandelbrot.id);
    if (i_cont < i || i_cont > i + 2) {
      mandelbrot.style.display = 'none';
      continue;
    }
    mandelbrot.style.display = 'block';
    // update size
    let height = 100.0 * Math.max(MANDELBROT_HEIGHT / MANDELBROT_WIDTH * window.innerWidth / window.innerHeight, 1.0) + '%';
    mandelbrot.style.height = height;
    // update scale
    let scale = MANDELBROT_SCALAR ** (i_cont - i);
    let dy = 50.0 - 100.0 * (0.2 + 0.14 * 0.5 ** i) + '%';
    let dx = 50.0 - 100.0 * (0.9 - 0.25 * 0.5 ** i) + '%';
    let transform = 'translate(-50%, -50%) scale(' + scale + ') translate(' + dx + ', ' + dy + ')';
    mandelbrot.style.transform = transform;
    // update position
    let top = 100.0 * (0.2 + 0.14 * 0.5 ** i_cont) + '%';
    let left = 100.0 * (0.9 - 0.25 * 0.5 ** i_cont) + '%';
    mandelbrot.style.top = top;
    mandelbrot.style.left = left;
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    mandelbrot.style.opacity = opacity;
  }
}

function toggleDropdown(dropdown) {
  let dropdown_menu = dropdown.parentElement.nextElementSibling;
  if (dropdown_menu.style.getPropertyValue('height') == '0px') {
    let item_height = dropdown_menu.children[0].getBoundingClientRect().height;
    let height = dropdown_menu.children.length * item_height;
    dropdown_menu.style.height = height + 'px';
  } else {
    dropdown_menu.style.height = '0px';
  }
  let dropdown_arrow = dropdown.children[0];
  dropdown_arrow.classList.toggle('activated');
}
