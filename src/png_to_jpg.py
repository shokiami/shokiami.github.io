import os
from PIL import Image

IN_DIR = 'mandelbrot_out/'
OUT_DIR = '../assets/mandelbrot/'
NUM_IMAGES = 140

if not os.path.isdir(OUT_DIR):
  os.makedirs(OUT_DIR)

for i in range(NUM_IMAGES):
  img = Image.open(f'{IN_DIR}{i}.png')
  img.save(f'{OUT_DIR}{i}.jpg')
