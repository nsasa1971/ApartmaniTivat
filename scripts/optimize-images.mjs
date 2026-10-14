// ============================================================
//  Smanjuje velike fotografije za web.
//  Upotreba:
//    npm run images -- <ulazni-folder> [izlazni-folder] [--max 1600] [--quality 78]
//  Primjer:
//    npm run images -- ~/Desktop/apartmani-slike
//  - rekurzivno obilazi ulazni folder (jpg, jpeg, png, webp, tif)
//  - poštuje EXIF rotaciju, skida metapodatke (GPS i sl.), čuva strukturu foldera
//  - najduža stranica se smanjuje na --max piksela (nikad se ne uvećava)
//  - izlaz je uvijek .jpg (mozjpeg); podrazumijevani izlaz je ./optimized (nije u gitu)
//  Originali se ne mijenjaju.
// ============================================================
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = Number(args[i + 1]);
  args.splice(i, 2);
  return Number.isFinite(v) && v > 0 ? v : def;
};
const max = opt('max', 1600);
const quality = opt('quality', 78);
const [input, output = 'optimized'] = args;

if (!input) {
  console.error('Upotreba: npm run images -- <ulazni-folder> [izlazni-folder] [--max 1600] [--quality 78]');
  process.exit(1);
}

const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const inRoot = path.resolve(input);
const outRoot = path.resolve(output);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (p === outRoot) continue;
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.has(path.extname(e.name).toLowerCase())) yield p;
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(2);
sharp.cache(false);
let n = 0, before = 0, after = 0, failed = 0;

for await (const file of walk(inRoot)) {
  const rel = path.relative(inRoot, file);
  const dest = path.join(outRoot, rel.replace(/\.[^.]+$/, '') + '.jpg');
  try {
    await mkdir(path.dirname(dest), { recursive: true });
    await sharp(file, { limitInputPixels: false })
      .rotate()
      .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toFile(dest);
    const [a, b] = [(await stat(file)).size, (await stat(dest)).size];
    before += a; after += b; n++;
    console.log(`${rel}  ${mb(a)} MB → ${mb(b)} MB`);
  } catch (err) {
    failed++;
    console.error(`Preskočeno ${rel}: ${err.message}`);
  }
}

console.log(`\nGotovo: ${n} slika, ${mb(before)} MB → ${mb(after)} MB (izlaz: ${outRoot})${failed ? `, neuspjelo: ${failed}` : ''}`);
