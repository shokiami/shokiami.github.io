const NUM_IMAGES = 149;
const SCALAR = 1.284;  // e^(1/4)

window.onload = init;

function init() {
  // init images
  let image_container = document.getElementById('image-container');
  for (let i = 0; i < NUM_IMAGES; i++) {
    let image = document.createElement('img');
    image.id = i;
    image.src = 'images/' + i + '.png';
    image.className = 'image';
    image_container.appendChild(image);
  }
  // init fog
  let midpoint = 0.5;
  let gradient = '';
  for (let p = 0.0; p <= 1.0; p += 0.01) {
    let a = 1.0 / (1.0 + 2.0 ** (25.0 * (p / midpoint - 1.0)));
    gradient += ', rgba(255, 255, 255, ' + a + ') ' + 100 * p + '%';
  }
  let fog = document.getElementById('fog');
  fog.style.setProperty('background', 'linear-gradient(to right' + gradient + ')');
  update();
}

function update() {
  let scroll = NUM_IMAGES * Math.min(Math.max(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 0.0), 1.0);
  for (image of document.querySelectorAll('.image')) {
    // update visibility
    let i = parseInt(image.id);
    if (scroll < i || scroll > i + 2) {
      image.style.setProperty('visibility', 'hidden');
      continue;
    }
    image.style.setProperty('visibility', 'visible');
    // update scale
    let scale = Math.min(SCALAR ** (scroll - i), SCALAR * SCALAR);
    image.style.setProperty('transform', 'translate(-50%, -50%) scale(' + scale + ')');
    // update opacity
    let opacity = 1.0;
    if (i > 0) {
      opacity = Math.min(scroll - i, 1.0);
    }
    image.style.setProperty('opacity', opacity);
    // update size
    let height = Math.max(window.innerWidth / window.innerHeight * 9.0 / 16.0, 1.0);
    image.style.setProperty('height', 100 * height + '%');
    // update position
    let left = 0.7 - 0.3 * 0.7 ** scroll;
    image.style.setProperty('left', 100 * left + '%');
  }
  // update fog
  let left = -1.0 * 0.5 ** scroll;
  let fog = document.getElementById('fog');
  fog.style.setProperty('left', 100 * left + '%');
  // loop
  window.requestAnimationFrame(update);
}
