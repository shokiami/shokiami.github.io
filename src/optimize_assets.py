import os
import shutil
from PIL import Image
import moviepy.editor as mp

IN_DIR = 'assets/'
OUT_DIR = '../assets/'
MAX_W = 1280
MAX_H = 720

for d in os.listdir(IN_DIR):
  if d == '.DS_Store':
    continue
  in_dir = os.path.join(IN_DIR, d)
  out_dir = os.path.join(OUT_DIR, d)
  if not os.path.exists(out_dir):
    os.makedirs(out_dir)
  for f in os.listdir(in_dir):
    if f == '.DS_Store':
      continue
    filename, ext = os.path.splitext(f)
    if d == 'mandelbrot':
      ext = '.webp'
    elif ext == '.png' or ext == '.jpg':
      ext = '.jpg'
    in_path = os.path.join(in_dir, f)
    out_path = os.path.join(out_dir, filename + ext)
    if os.path.exists(out_path):
      continue
    print(in_path, out_path)
    if d == 'mandelbrot':
      img = Image.open(in_path)
      img.save(out_path, 'WEBP', lossless=True)
    elif ext == '.jpg':
      img = Image.open(in_path)
      w, h = img.size
      if w > MAX_W or h > MAX_H:
        r = MAX_W / w if w - MAX_W > h - MAX_H else MAX_H / h
        w *= r
        h *= r
      img = img.resize((int(w), int(h)))
      img = img.convert('RGB')
      img.save(out_path, 'JPEG')
    elif ext == '.mp4':
      clip = mp.VideoFileClip(in_path)
      clip = clip.set_fps(10)
      clip = clip.resize(height=360)
      clip.write_videofile(out_path)
    else:
      shutil.copy(in_path, out_path)
