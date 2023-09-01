const MANDELBROT_COUNT = 140;
const MANDELBROT_WIDTH = 1920;
const MANDELBROT_HEIGHT = 1080;
const MANDELBROT_SCALAR = 1.28402541669;  // e^(1/4)
const MANDELBROT_LEFT1 = 0.65;
const MANDELBROT_LEFT2 = 0.90;
const MANDELBROT_TOP1 = 0.34;
const MANDELBROT_TOP2 = 0.20;
const MANDELBROT_DIR = 'assets/mandelbrot/';
const PLAY_DURATION = 60000;  // ms
const UNRESTRICTED_HREFS = ['', '#home', '#about', '#projects', '#contact'];

let scroll_to;
let scroll_top;
let scroll_max;
let scroll_start;
let scroll_dest;
let start_time;
let total_time;

window.onload = init;
window.onpopstate = navigate;
window.onresize = resize;
window.onclick = click;
window.onwheel = stop;

function init() {
  // init mobile
  if (window.outerWidth < 480 || window.outerHeight < 480) {
    initMobile();
    return;
  }
  // init project dropdown
  document.getElementById('project-dropdown').onmouseenter = expandProjects;
  document.getElementById('section-menu').onmouseleave = collapseProjects;
  // init navlinks
  for (let navlink of document.querySelectorAll('.navlink')) {
    navlink.onclick = navlinkClick;
  }
  // init scrolling
  scroll_to = null;
  scroll_top = 0.0;
  resize();
  // init youtube links
  for (let youtube of document.querySelectorAll('.youtube')) {
    youtube.onclick = launchYoutube;
  }
  // init play button
  document.getElementById('play-button').onclick = playButtonClick;
  // init mandelbrot images
  let mandelbrot_container = document.getElementById('mandelbrot-container');
  for (let i = 0; i < MANDELBROT_COUNT; i++) {
    mandelbrot_container.innerHTML += '<img id="' + i + '" class="mandelbrot" src="' + MANDELBROT_DIR + i + '.webp">';
  }
  // start loop
  loop();
}

function initMobile() {
  let main = document.getElementById('main');
  main.style.marginLeft = '0px';
  main.style.marginRight = '0px';
  document.getElementById('play-button').style.display = 'none';
  document.getElementById('zoom').style.display = 'none';
  let mandelbrot_container = document.getElementById('home');
  mandelbrot_container.style.backgroundImage = 'url(' + MANDELBROT_DIR + '0.webp)';
  mandelbrot_container.style.backgroundSize = 'cover';
  mandelbrot_container.style.backgroundPosition = 'center';
  mandelbrot_container.style.backgroundAttachment = 'fixed';
}

function loop() {
  updateScroll();
  updateMandelbrot();
  window.requestAnimationFrame(loop);
}

function expandProjects() {
  let project_menu = document.getElementById('project-menu');
  let height = 0;
  for (let dropdown_item of project_menu.children) {
    height += dropdown_item.getBoundingClientRect().height;
  }
  project_menu.style.height = height + 'px';
}

function collapseProjects() {
  document.getElementById('project-menu').style.height = '0px';
}

function navlinkClick(event) {
  event.preventDefault();
  let href = this.getAttribute('href');
  if (href !== window.location.hash) {
    history.pushState(null, null, href);
  }
  navigate();
}

function navigate() {
  unrestrict();
  show();
  let selector = window.location.hash;
  scroll_to = selector;
  scroll_start = window.scrollY;
  scroll_dest = selector === '' ? 0.0 : document.querySelector(selector).offsetTop;
  start_time = performance.now();
  total_time = 10.0 * Math.sqrt(Math.abs(scroll_dest - scroll_start));
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
  let selector = window.location.hash;
  if (UNRESTRICTED_HREFS.includes(selector)) {
    return;
  }
  let target = document.querySelector(selector);
  let diff = target.getBoundingClientRect().top;
  scroll_top = Math.round(2 * (window.scrollY + diff)) / 2.0;
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
    window.scrollTo(0, scroll_start + p * (scroll_dest - scroll_start));
    if (elapsed_time > total_time) {
      stop();
      restrict();
    }
  }
  let viewing = '';
  let selector = window.location.hash;
  if (!UNRESTRICTED_HREFS.includes(selector)) {
    let target = document.querySelector(selector);
    viewing = target.querySelectorAll('.header')[0].innerText + '<i class="fa fa-lock"></i>';
  } else {
    let main = document.getElementById('main');
    if (main.style.visibility !== 'hidden') {
      viewing = 'Home';
      for (let child of main.children) {
        if (child.offsetTop > window.scrollY + window.innerHeight / 2.0) {
          break;
        }
        viewing = child.querySelectorAll('.header')[0].innerText;
      }
    }
  }
  document.getElementById('viewing').innerHTML = viewing;
}

function resize() {
  unrestrict();
  scroll_max = document.body.scrollHeight - window.innerHeight;
  restrict();
}

function launchYoutube() {
  let url = this.id + (this.id.includes('?')? '&rel=0&autoplay=1' : '?rel=0&autoplay=1');
  this.innerHTML = '<iframe src=' + url + ' width="640px" height="360px" frameborder="0" allow="autoplay; fullscreen"></iframe>';
}

function playButtonClick() {
  document.getElementById('play-button').src.includes('play') ? play() : stop();
}

function play() {
  unrestrict();
  hide();
  scroll_to = '';
  scroll_start = window.scrollY;
  scroll_dest = scroll_start < scroll_max ? scroll_max : 0.0;
  start_time = performance.now();
  total_time = Math.abs(scroll_dest - scroll_start) / scroll_max * PLAY_DURATION;
  document.getElementById('play-button').src = 'assets/icons/pause.png';
}

function stop() {
  scroll_to = null;
  document.getElementById('play-button').src = 'assets/icons/play.png';
}

function show() {
  document.getElementById('main').style.visibility = 'visible';
}

function hide() {
  document.getElementById('main').style.visibility = 'hidden';
}

function click(event) {
  if (document.getElementById('home').contains(event.target) || event.target === document.body) {
    unrestrict();
    show();
    stop();
    if (window.location.hash !== '') {
      history.pushState(null, null, '#home');
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
    let width = Math.max(MANDELBROT_WIDTH / MANDELBROT_HEIGHT * window.innerHeight, window.innerWidth);
    let height = Math.max(MANDELBROT_HEIGHT / MANDELBROT_WIDTH * window.innerWidth, window.innerHeight);
    mandelbrot.style.width = width + 'px';
    mandelbrot.style.height = height + 'px';
    // update scale/translation
    let scale = MANDELBROT_SCALAR ** (i_cont - i);
    let p = 0.5**i;
    let p_cont = 0.5**i_cont;
    let dx1 = (0.5 - (p * MANDELBROT_LEFT1 + (1.0 - p) * MANDELBROT_LEFT2)) * width + 'px';
    let dy1 = (0.5 - (p * MANDELBROT_TOP1 + (1.0 - p) * MANDELBROT_TOP2)) * height + 'px';
    let x1 = (MANDELBROT_LEFT1 - 0.5) * width + 0.5 * window.innerWidth;
    let x2 = MANDELBROT_LEFT2 * window.innerWidth;
    let y1 = (MANDELBROT_TOP1 - 0.5) * height + 0.5 * window.innerHeight;
    let y2 = MANDELBROT_TOP2 * window.innerHeight;
    let dx2 = (p_cont * x1 + (1.0 - p_cont) * x2) - 0.5 * width + 'px';
    let dy2 = (p_cont * y1 + (1.0 - p_cont) * y2) - 0.5 * height + 'px';
    let transform = 'translate(' + dx2 + ', ' + dy2 + ') scale(' + scale + ') translate(' + dx1 + ', ' + dy1 + ')';
    mandelbrot.style.transform = transform;
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    mandelbrot.style.opacity = opacity;
  }
  let zoom = MANDELBROT_SCALAR ** i_cont;
  let [coeff, exp] = zoom.toExponential(4).replace('+', '').split('e');
  document.getElementById('zoom').innerHTML = coeff + '&#215;10<sup>' + exp + '</sup>';
}
