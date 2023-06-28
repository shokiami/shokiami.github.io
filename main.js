const NUM_IMAGES = 51;

window.onload = init;

function init() {
  let image_container = document.getElementById('image-container');
  for (let i = 0; i < NUM_IMAGES; i++) {
    let image = document.createElement('img');
    image.id = i;
    image.src = 'images/' + i + '.png';
    image.className = 'image';
    image_container.appendChild(image);
  }
  update();
}

function update() {
  let curr = NUM_IMAGES * Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 0.999);
  for (image of document.querySelectorAll('.image')) {
    let i = parseInt(image.id);
    if (curr < i || curr > i + 1) {
      image.style.setProperty('visibility', 'hidden');
      continue;
    }
    image.style.setProperty('visibility', 'visible');
    let scale = Math.min(2.0 ** (curr - i), 2.0);
    image.style.setProperty('transform', 'scale(' + scale + ')');
    let width = Math.max(window.innerHeight / window.innerWidth * image.width / image.height, 1.0);
    image.style.setProperty('width', 100 * width + '%');
  }
  window.requestAnimationFrame(update);
}
