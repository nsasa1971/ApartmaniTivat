// Sastavlja folder dist/ sa fajlovima koji se objavljuju (Netlify, GitHub Pages).
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const f of ['index.html', 'politika-privatnosti.html', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', 'CNAME']) {
  if (existsSync(f)) cpSync(f, `dist/${f}`);
}
for (const d of ['assets', 'data']) cpSync(d, `dist/${d}`, { recursive: true });
console.log('✓ dist/ spreman za objavu');
