// ============================================================
//  Pravi galeriju za sajt iz 6 izabranih fotografija.
//  Upotreba:  npm run gallery -- <folder-sa-fotografijama>
//  - uzima sve slike iz foldera po brojčanom redu (1.jpg, 2.jpg, … 15.jpg – broj određuje redoslijed)
//  - upisuje assets/img/gallery-N.jpg (1240×827) i thumb-N.jpg (394×394)
//  - broj slika treba da odgovara GALLERY_COUNT u assets/js/content.js
//  - poštuje rotaciju, skida metapodatke; originali se ne mijenjaju
// ============================================================
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { gallery } from '../assets/js/content.js';

const input = process.argv[2];
if (!input) {
  console.error('Upotreba: npm run gallery -- <folder-sa-fotografijama>');
  process.exit(1);
}

const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const files = (await readdir(input))
  .filter((f) => EXT.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length !== gallery.length)
  console.warn(
    `Upozorenje: u folderu je ${files.length} slika, a content.js (GALLERY_COUNT) očekuje ${gallery.length}. Uskladi ih.`
  );

const out = path.resolve('assets/img');
for (const [i, f] of files.entries()) {
  const n = i + 1;
  const src = path.join(input, f);
  const make = (w, h, name, q) =>
    sharp(src, { limitInputPixels: false })
      .rotate()
      .resize({ width: w, height: h, fit: 'cover', position: sharp.strategy.attention })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: q, mozjpeg: true, progressive: true })
      .toFile(path.join(out, name));
  await make(1240, 827, `gallery-${n}.jpg`, 80);
  await make(394, 394, `thumb-${n}.jpg`, 80);
  console.log(`${f} → gallery-${n}.jpg + thumb-${n}.jpg`);
}
console.log('\nGotovo. Pokreni `npm run build`, pa provjeri sajt.');
