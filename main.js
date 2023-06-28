const NUM_IMAGES = 51;

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
    let a = 1.0 / (1.0 + Math.pow(2.0, 25.0 * (p / midpoint - 1.0)));
    gradient += ', rgba(230, 230, 230, ' + a + ') ' + 100 * p + '%';
  }
  let fog = document.getElementById('fog');
  fog.style.setProperty('background', 'linear-gradient(to right' + gradient + ')');
  update();
}

function update() {
  let scroll = NUM_IMAGES * window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  for (image of document.querySelectorAll('.image')) {
    // update visibility
    let i = parseInt(image.id);
    if (scroll < i || scroll > i + 2) {
      image.style.setProperty('visibility', 'hidden');
      continue;
    }
    image.style.setProperty('visibility', 'visible');
    // update scale
    let scale = Math.min(2.0 ** (scroll - i), 4.0);
    image.style.setProperty('transform', 'translate(-50%, -50%) scale(' + scale + ')');
    // update opacity
    let opacity = 1.0;
    if (i > 0) {
      opacity = Math.min(scroll - i, 1.0);
    }
    image.style.setProperty('opacity', opacity);
    // update size
    let width = Math.max(window.innerHeight / window.innerWidth * image.width / image.height, 1.0);
    image.style.setProperty('width', 100 * width + '%');
    // update position
    let target = 0.67;
    let left = target - (target - 0.5) * Math.pow(2.0, -0.5 * scroll);
    image.style.setProperty('left', 100 * left + '%');    
  }
  // update fog
  let left = -Math.pow(2.0, -1.0 * scroll);
  console.log(left);
  let fog = document.getElementById('fog');
  fog.style.setProperty('left', 100 * left + '%');
  // loop
  window.requestAnimationFrame(update);
}
