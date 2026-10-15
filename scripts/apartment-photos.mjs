// ============================================================
//  Fotografije po apartmanima: smanjuje originale i upisuje spisak u assets/js/apartment-photos.js
//  Upotreba:
//    npm run apt-photos -- <folder>            (podrazumijevano: ./apartmani-slike)
//  Folder treba da ima podfoldere olive, lavande (ili lavanda) i lemoni sa fotografijama:
//    apartmani-slike/olive/*.jpg, apartmani-slike/lavande/*.jpg, apartmani-slike/lemoni/*.jpg
//  Redoslijed slika = abecedni/brojčani redoslijed imena fajlova (1.jpg, 2.jpg, 10.jpg ...).
//  Za svaki apartman koji je u folderu stare slike se zamjenjuju novim; ostali apartmani ostaju kakvi jesu.
//  Rezultat: assets/img/apartments/<id>/NN.jpg (do 1600 px) i NN-t.jpg (sličica 600×450).
//  Originali se ne mijenjaju.
// ============================================================
import { readdir, mkdir, rm, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.resolve(process.argv[2] ?? 'apartmani-slike');
const IDS = { olive: 'olive', lavanda: 'lavanda', lavande: 'lavanda', lemoni: 'lemoni' };
const EXT = /\.(jpe?g|png|webp|tiff?)$/i;
const pad = (n) => String(n).padStart(2, '0');

try {
  await stat(input);
} catch {
  console.error(`Folder ne postoji: ${input}`);
  process.exit(1);
}

const dataFile = path.join(root, 'assets/js/apartment-photos.js');
const { apartmentPhotos: current } = await import(`${pathToFileURL(dataFile).href}?t=${Date.now()}`);
const result = { olive: [], lavanda: [], lemoni: [], ...current };

const dirs = (await readdir(input, { withFileTypes: true })).filter((d) => d.isDirectory());
if (!dirs.length) console.warn('U folderu nema podfoldera (olive, lavande, lemoni).');

for (const d of dirs) {
  const id = IDS[d.name.toLowerCase()];
  if (!id) {
    console.warn(`Preskačem folder "${d.name}" (očekivano: olive, lavande, lemoni).`);
    continue;
  }
  const files = (await readdir(path.join(input, d.name))).filter((f) => EXT.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const outDir = path.join(root, 'assets/img/apartments', id);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const list = [];
  for (const [i, f] of files.entries()) {
    const n = pad(i + 1);
    const src = path.join(input, d.name, f);
    const full = path.join(outDir, `${n}.jpg`);
    const thumb = path.join(outDir, `${n}-t.jpg`);
    const info = await sharp(src).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(full);
    await sharp(src).rotate().resize(600, 450, { fit: 'cover', position: 'attention' }).jpeg({ quality: 76, mozjpeg: true }).toFile(thumb);
    list.push({ full: `assets/img/apartments/${id}/${n}.jpg`, thumb: `assets/img/apartments/${id}/${n}-t.jpg`, width: info.width, height: info.height });
    console.log(`${id}/${f} → ${n}.jpg  ${(info.size / 1024).toFixed(0)} KB`);
  }
  result[id] = list;
  console.log(`✓ ${id}: ${list.length} slika`);
}

const body = Object.entries(result)
  .map(([id, list]) => `  ${id}: [\n${list.map((p) => `    ${JSON.stringify(p)},`).join('\n')}${list.length ? '\n' : ''}  ],`)
  .join('\n');
const header = (await import('node:fs')).readFileSync(dataFile, 'utf8').split('export const apartmentPhotos')[0];
await writeFile(dataFile, `${header}export const apartmentPhotos = {\n${body}\n};\n`);
console.log('✓ assets/js/apartment-photos.js ažuriran. Zatim: npm run build, pa commit i push.');
