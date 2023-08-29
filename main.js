const MANDELBROT_COUNT = 140;
const MANDELBROT_WIDTH = 1920;
const MANDELBROT_HEIGHT = 1080;
const MANDELBROT_SCALAR = 1.28402541669;  // e^(1/4)
const MANDELBROT_DIR = 'assets/mandelbrot/';
const PLAY_DURATION = 60000;  // ms

let scroll_to;
let scroll_top;
let scroll_max;
let scroll_start;
let scroll_dist;
let start_time;
let total_time;

window.onload = init;
window.onpopstate = nav;
window.onresize = resize;
window.onclick = click;
window.onwheel = stop;

function init() {
  // init dropdown
  document.getElementById('project-dropdown').onclick = toggleDropdown;
  for (let dropdown_menu of document.querySelectorAll('.dropdown-menu')) {
    dropdown_menu.style.height = '0px';
  }
  // init mandelbrots
  let mandelbrot_container = document.getElementById('mandelbrot-container');
  for (let i = 0; i < MANDELBROT_COUNT; i++) {
    mandelbrot_container.innerHTML += '<img id="' + i + '" class="mandelbrot" src="' + MANDELBROT_DIR + i + '.webp" loading="lazy">';
  }
  resizeMandelbrot();
  // init navlinks
  for (let navlink of document.querySelectorAll('.navlink')) {
    navlink.onclick = navlinkClick;
  }
  // init scroll
  scroll_to = null;
  scroll_top = 0.0;
  scroll_max = getScrollMax();
  restrict();
  // init youtube
  for (let youtube of document.querySelectorAll('.youtube')) {
    youtube.onclick = launchYoutube;
  }
  // init play
  document.getElementById('play-button').onclick = playButtonClick;
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
  nav();
}

function nav() {
  unrestrict();
  show();
  let href = window.location.hash;
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

function restrict() {
  let href = window.location.hash;
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
    p = p < 2.0 / 3.0 ? 1.2 * p : -1.8 * p**2 + 3.6 * p - 0.8;
    window.scrollTo(0, scroll_start + p * scroll_dist);
    if (elapsed_time > total_time) {
      stop();
      restrict();
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
    // update scale
    let scale = MANDELBROT_SCALAR ** (i_cont - i);
    let dx = 50.0 - 100.0 * (0.9 - 0.25 * 0.5 ** i) + '%';
    let dy = 50.0 - 100.0 * (0.2 + 0.14 * 0.5 ** i) + '%';
    let transform = 'translate(-50%, -50%) scale(' + scale + ') translate(' + dx + ', ' + dy + ')';
    mandelbrot.style.transform = transform;
    // update position
    let left = 100.0 * (0.9 - 0.25 * 0.5 ** i_cont) + '%';
    let top = 100.0 * (0.2 + 0.14 * 0.5 ** i_cont) + '%';
    mandelbrot.style.left = left;
    mandelbrot.style.top = top;
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    mandelbrot.style.opacity = opacity;
  }
  let zoom = MANDELBROT_SCALAR ** i_cont;
  let [coeff, exp] = zoom.toExponential(4).replace('+', '').split('e');
  document.getElementById('zoom').innerHTML = coeff + '&#215;10<sup>' + exp + '</sup>';
}

function resizeMandelbrot() {
  for (let mandelbrot of document.querySelectorAll('.mandelbrot')) {
    let height = 100.0 * Math.max(MANDELBROT_HEIGHT / MANDELBROT_WIDTH * window.innerWidth / window.innerHeight, 1.0) + '%';
    mandelbrot.style.height = height;
  }
}

function resize() {
  unrestrict();
  scroll_max = getScrollMax();
  restrict();
  resizeMandelbrot();
}

function toggleDropdown() {
  let dropdown_menu = this.parentElement.nextElementSibling;
  if (dropdown_menu.style.getPropertyValue('height') == '0px') {
    let height = 0;
    for (let dropdown_item of dropdown_menu.children) {
      height += dropdown_item.getBoundingClientRect().height;
    }
    dropdown_menu.style.height = height + 'px';
  } else {
    dropdown_menu.style.height = '0px';
  }
  let dropdown_arrow = this.children[0];
  dropdown_arrow.classList.toggle('activated');
}

function launchYoutube() {
  let url = this.id + (this.id.includes('?')? '&rel=0&autoplay=1' : '?rel=0&autoplay=1');
  this.innerHTML = '<iframe src=' + url + ' width="640px" height="360px" frameborder="0" allow="autoplay; fullscreen"></iframe>';
}

function playButtonClick() {
  document.getElementById('play-button').src.includes('play') ? play() : stop();
}

function show() {
  document.getElementById('main').style.visibility = 'visible';
}

function hide() {
  document.getElementById('main').style.visibility = 'hidden';
}

function play() {
  unrestrict();
  hide();
  scroll_to = '';
  scroll_start = window.scrollY;
  start_time = performance.now();
  scroll_dist = scroll_start < scroll_max ? scroll_max - scroll_start : -scroll_start;
  total_time = Math.abs(scroll_dist) / scroll_max * PLAY_DURATION;
  document.getElementById('play-button').src = 'assets/icons/pause.png';
}

function stop() {
  scroll_to = null;
  document.getElementById('play-button').src = 'assets/icons/play.png';
}

function click(event) {
  if (event.target === document.body) {
    unrestrict();
    show();
    stop();
    if (window.location.hash !== '') {
      history.pushState(null, null, '#home');
    }
  }
}

function getScrollMax() {
  let content_height = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  let viewport_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  return content_height - viewport_height;
}
