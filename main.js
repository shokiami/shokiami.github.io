const NUM_IMAGES = 51;

window.onload = init;

function init() {
  // init images
  let image_container = document.getElementById('image-container');
  for (let i = 0; i < NUM_IMAGES; i++) {
    let image = document.createElement('img');
    image.id = i;
    image.src = 'images/' + i + '.jpg';
    image.className = 'image';
    image_container.appendChild(image);
  }
  // init fog
  let midpoint = 0.5;
  let gradient = '';
  for (let p = 0.0; p <= 1.0; p += 0.01) {
    let a = 1.0 / (1.0 + Math.pow(2.0, 25.0 * (p / midpoint - 1.0)));
    gradient += ', rgba(230, 230, 230, ' + a + ') ' + 100 * p + '%';
  }
  let fog = document.getElementById('fog');
  fog.style.setProperty('background', 'linear-gradient(to right' + gradient + ')');
  update();
}

function update() {
  let scroll = Math.min(Math.max(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 0.0), 1.0);
  let image_offset = 0.07;
  let i_cont = (1.0 - scroll) * image_offset + scroll * NUM_IMAGES;
  for (image of document.querySelectorAll('.image')) {
    // update visibility
    let i = parseInt(image.id);
    if (i_cont < i || i_cont > i + 2) {
      image.style.setProperty('visibility', 'hidden');
      continue;
    }
    image.style.setProperty('visibility', 'visible');
    // update scale
    let scale = 1.02 * Math.min(2.0 ** (i_cont - i), 4.0);
    image.style.setProperty('transform', 'translate(-50%, -50%) scale(' + scale + ')');
    // update opacity
    let opacity = 1.0;
    if (i > 0) {
      opacity = Math.min(i_cont - i, 1.0);
    }
    image.style.setProperty('opacity', opacity);
    // update size
    let width = Math.max(window.innerHeight / window.innerWidth * image.width / image.height, 1.0);
    image.style.setProperty('width', 100 * width + '%');
    // update position
    let target = 0.69;
    let left = target + (0.46 - target) * Math.pow(2.0, -0.5 * i_cont);
    image.style.setProperty('left', 100 * left + '%');
    let top = 0.5 + (0.47 - 0.5) * Math.pow(2.0, -0.5 * i_cont);
    image.style.setProperty('top', 100 * top + '%');
  }
  // update fog
  let left = -Math.pow(2.0, -1.0 * i_cont);
  let fog = document.getElementById('fog');
  fog.style.setProperty('left', 100 * left + '%');
  // loop
  window.requestAnimationFrame(update);
}
