#!/usr/bin/env python3
"""Generiše placeholder slike u assets/img/.
Pokretanje: python3 scripts/make-placeholders.py  (zahteva Pillow)
Zameni ih svojim fotografijama ISTIM imenima i dimenzijama (vidi assets/img/README.md)."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
os.makedirs(OUT, exist_ok=True)

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
              '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def make(name, w, h, bg, fg, text, fmt='JPEG'):
    img = Image.new('RGB', (w, h), bg)
    d = ImageDraw.Draw(img)
    f = font(max(14, min(w, h) // (5 if w < 300 else 9)))
    box = d.textbbox((0, 0), text, font=f)
    d.text(((w - box[2]) / 2, (h - box[3]) / 2), text, fill=fg, font=f)
    path = os.path.join(OUT, name)
    if fmt == 'JPEG':
        img.save(path, 'JPEG', quality=70, optimize=True, progressive=True)
    else:
        img.save(path, fmt, optimize=True)

make('hero.jpg', 1920, 900, '#555754', '#6a6c69', 'HERO 1920x900')
make('foto1.jpg', 605, 806, '#9C9F9B', '#ffffff', 'FOTO 1')
make('foto2.jpg', 1240, 827, '#9C9F9B', '#ffffff', 'FOTO 2')
make('foto3.jpg', 2500, 1667, '#9C9F9B', '#ffffff', 'FOTO 3')
for i in range(1, 7):
    make(f'gallery-{i}.jpg', 1240, 827, '#555754', '#ffffff', f'GALERIJA {i}')
    make(f'thumb-{i}.jpg', 394, 394, '#9C9F9B', '#ffffff', str(i))
for i in range(1, 4):
    make(f'beach-{i}.jpg', 1024, 768, '#9C9F9B', '#ffffff', f'PLAZA {i}')
make('og.jpg', 1200, 630, '#404040', '#ffffff', 'OG 1200x630')
make('avatar.png', 80, 80, '#EAEAEA', '#9C9F9B', '?', 'PNG')
make('logo.png', 211, 100, '#ffffff', '#191B18', 'LOGO', 'PNG')
make('favicon.png', 64, 64, '#191B18', '#ffffff', 'A', 'PNG')
make('icon-192.png', 192, 192, '#191B18', '#ffffff', 'A', 'PNG')
make('icon-512.png', 512, 512, '#191B18', '#ffffff', 'A', 'PNG')
print('OK')
