const REAL = 0.33888665790093404
const IMAG = 0.57352752336659824
const WIDTH = 1920;
const HEIGHT = 1080;
const COUNT = 140;
const SCALAR = 1.28402541669;  // e^(1/4)
const CENTER_X1 = 0.1;
const CENTER_Y1 = 0.0;
const ZOOM_X2 = 0.4;
const ZOOM_Y2 = 0.3;
const ZOOM_SCALAR = 0.3;
const DIR = 'assets/mandelbrot/';
const PLAY_DURATION = 60000;  // ms
const UNRESTRICTED = ['', '#home', '#about', '#projects', '#contact'];

let viewport_width;
let viewport_height;
let scroll_to;
let scroll_top;
let scroll_max;
let scroll_start;
let scroll_dest;
let start_time;
let total_time;

window.onload = init;

function isMobile() {
  let home = document.getElementById('home');
  viewport_width = home.offsetWidth;
  viewport_height = home.offsetHeight;
  console.log(window.screen.width, window.screen.height);
  document.getElementById('title').innerHTML = window.screen.width + 'x' + window.screen.height;
  return window.outerWidth < 480 || window.outerHeight < 480;
}

function init() {
  // init mobile
  if (isMobile()) {
    initMobile();
    return;
  }
  // init callbacks
  window.onpopstate = navigate;
  window.onresize = resize;
  window.onclick = click;
  window.onwheel = stop;
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
  for (let i = 0; i < COUNT; i++) {
    mandelbrot_container.innerHTML += '<img id="' + i + '" class="mandelbrot" src="' + DIR + i + '.webp">';
  }
  // start loop
  loop();
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
    height += dropdown_item.offsetHeight;
  }
  project_menu.style.height = height + 'px';
}

function collapseProjects() {
  document.getElementById('project-menu').style.height = '0px';
}

function navlinkClick(event) {
  event.preventDefault();
  let selector = this.getAttribute('href');
  if (selector !== window.location.hash) {
    history.pushState(null, null, selector);
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
  if (UNRESTRICTED.includes(selector)) {
    return;
  }
  scroll_top = document.querySelector(selector).offsetTop;
  let scroll = window.scrollY - scroll_top;
  document.getElementById('home').style.display = 'none';
  for (let child of document.getElementById('main').children) {
    let child_selector = '#' + child.id;
    if (child_selector !== selector && child_selector !== '#footer') {
      child.style.display = 'none';
    }
  }
  window.scrollTo(0.0, scroll);
}

function updateScroll() {
  if (scroll_to !== null) {
    let elapsed_time = performance.now() - start_time;
    let p = Math.min(elapsed_time / total_time, 1.0);
    p = p < 2.0 / 3.0 ? 1.2 * p : -1.8 * p**2 + 3.6 * p - 0.8;
    window.scrollTo(0.0, scroll_start + p * (scroll_dest - scroll_start));
    if (elapsed_time > total_time) {
      stop();
      restrict();
    }
  }
  let viewing = '';
  let selector = window.location.hash;
  if (!UNRESTRICTED.includes(selector)) {
    let section = document.querySelector(selector).querySelectorAll('.header')[0].innerText;
    viewing = section + '<i class="fa fa-lock"></i>';
  } else {
    let main = document.getElementById('main');
    if (main.style.visibility !== 'hidden') {
      viewing = 'Home';
      for (let child of main.children) {
        if (child.offsetTop > window.scrollY + viewport_height / 2.0) {
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
  let home = document.getElementById('home');
  viewport_width = home.offsetWidth;
  viewport_height = home.offsetHeight;
  scroll_max = document.getElementById('main').offsetHeight;
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
  let scroll = Math.min(Math.max(Math.ceil(scroll_top + window.scrollY) / scroll_max, 0.0), 1.0);
  let i_cont = scroll * (COUNT - 1);
  for (let mandelbrot of document.querySelectorAll('.mandelbrot')) {
    // update display
    let i = parseInt(mandelbrot.id);
    if (i_cont < i || i_cont > i + 2) {
      mandelbrot.style.display = 'none';
      continue;
    }
    mandelbrot.style.display = 'block';
    // update size
    let width = Math.max(WIDTH / HEIGHT * viewport_height, viewport_width);
    let height = Math.max(HEIGHT / WIDTH * viewport_width, viewport_height);
    mandelbrot.style.width = width + 'px';
    mandelbrot.style.height = height + 'px';
    // update scale/translation
    let scale = SCALAR ** (i_cont - i);
    let p = 0.5**i;
    let p_cont = 0.5**i_cont;
    let zoom_x1 = REAL * ZOOM_SCALAR * Math.min(WIDTH, HEIGHT) / WIDTH + CENTER_X1;
    let zoom_y1 = IMAG * ZOOM_SCALAR * Math.min(WIDTH, HEIGHT) / HEIGHT + CENTER_Y1;
    let dx1 = -width * (p * zoom_x1 + (1.0 - p) * ZOOM_X2) + 'px';
    let dy1 = height * (p * zoom_y1 + (1.0 - p) * ZOOM_Y2) + 'px';
    let dx2 = p_cont * zoom_x1 * width + (1.0 - p_cont) * ZOOM_X2 * viewport_width - 0.5 * width + 'px';
    let dy2 = -p_cont * zoom_y1 * height - (1.0 - p_cont) * ZOOM_Y2 * viewport_height - 0.5 * height + 'px';
    let transform = 'translate(' + dx2 + ', ' + dy2 + ') scale(' + scale + ') translate(' + dx1 + ', ' + dy1 + ')';
    mandelbrot.style.transform = transform;
    // update opacity
    let opacity = i > 0 ? Math.min(i_cont - i, 1.0) : 1.0;
    mandelbrot.style.opacity = opacity;
  }
  let zoom = SCALAR ** i_cont;
  let [coeff, exp] = zoom.toExponential(4).replace('+', '').split('e');
  document.getElementById('zoom').innerHTML = coeff + '&#215;10<sup>' + exp + '</sup>';
}

function initMobile() {
  // remove margins from main
  let main = document.getElementById('main');
  main.style.marginLeft = '0px';
  main.style.marginRight = '0px';
  // horizontal navbar
  let navbar = document.getElementById('navbar');
  navbar.classList = '';
  navbar.style.left = '0px';
  navbar.style.top = '0px';
  navbar.style.width = '100%';
  navbar.style.display = 'flex';
  navbar.style.justifyContent = 'space-between';
  navbar.style.alignItems = 'center';
  navbar.style.backdropFilter = 'blur(10px)';
  navbar.style.webkitBackdropFilter = 'blur(10px)';
  navbar.style.borderBottom = '1px solid #222222';
  let navbar_title = document.getElementById('navbar-title');
  navbar_title.style.padding = '20px';
  navbar_title.style.borderBottom = 'none';
  navbar_title.style.color = '#222222';
  for (let section_item of document.getElementById('section-menu').children) {
    section_item.style.display = 'inline-block';
    let navlink = section_item.children[0];
    navlink.style.fontSize = '24px';
    navlink.style.padding = '20px';
    navlink.style.transition = 'none';
    navlink.style.color = '#222222';
  }
  document.getElementById('project-menu').style.display = 'none';
  // init navlinks
  for (let navlink of document.querySelectorAll('.navlink')) {
    navlink.onclick = mobileNavLinkClick;
  }
  window.onpopstate = mobileNavigate;
  mobileRestrict();
  // init youtube links
  for (let youtube of document.querySelectorAll('.youtube')) {
    youtube.onclick = launchYoutube;
  }
  // remove play button
  document.getElementById('play-button').style.display = 'none';
  // init mandelbrot image
  let mandelbrot = document.createElement('img');
  mandelbrot.id = '0';
  mandelbrot.className = 'mandelbrot';
  mandelbrot.src = DIR + '0.webp';
  mandelbrot.style.transform = 'translate(-50%, -50%)';
  document.getElementById('mandelbrot-container').append(mandelbrot);
  function loop() {
    let home = document.getElementById('home');
    if (home.style.display !== 'none') {
      viewport_width = home.offsetWidth;
      viewport_height = home.offsetHeight;
      mandelbrot.style.width = Math.max(WIDTH / HEIGHT * viewport_height, viewport_width) + 'px';
      window.requestAnimationFrame(loop);
    }
  }
  loop();
}

function mobileNavLinkClick(event) {
  event.preventDefault();
  let href = this.getAttribute('href');
  if (href !== window.location.hash) {
    history.pushState(null, null, href);
  }
  mobileNavigate();
}

function mobileNavigate() {
  mobileRestrict();
  let scroll = document.querySelector(window.location.hash).offsetTop;
  let navbar_height = document.getElementById('navbar').offsetHeight;
  window.scrollTo(0.0, scroll - navbar_height);
}

function mobileRestrict() {
  let selector = window.location.hash;
  let main = document.getElementById('main');
  if (UNRESTRICTED.includes(selector)) {
    main.style.marginTop = '0px';
    document.getElementById('home').style.display = 'flex';
    for (let child of main.children) {
      if (UNRESTRICTED.includes('#' + child.id)) {
        child.style.display = 'block';
      } else {
        child.style.display = 'none';
      }
    }
  } else {
    main.style.marginTop = document.getElementById('navbar').offsetHeight + 'px';
    document.getElementById('home').style.display = 'none';
    for (let child of main.children) {
      let child_selector = '#' + child.id;
      if (child_selector === selector || child_selector === '#footer') {
        child.style.display = 'block';
      } else {
        child.style.display = 'none';
      }
    }
  }
}
