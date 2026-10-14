// ============================================================
//  Pravi galeriju za sajt iz 6 izabranih fotografija.
//  Upotreba:  npm run gallery -- <folder-sa-fotografijama>
//  - uzima prvih 6 slika po abecednom redu (nazovi ih 1.jpg … 6.jpg da odrediš redoslijed)
//  - upisuje assets/img/gallery-1..6.jpg (1240×827) i thumb-1..6.jpg (394×394)
//  - poštuje rotaciju, skida metapodatke; originali se ne mijenjaju
// ============================================================
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) {
  console.error('Upotreba: npm run gallery -- <folder-sa-fotografijama>');
  process.exit(1);
}

const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const files = (await readdir(input))
  .filter((f) => EXT.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .slice(0, 6);

if (files.length < 6) console.warn(`Upozorenje: pronađeno je samo ${files.length} slika (potrebno 6).`);

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
