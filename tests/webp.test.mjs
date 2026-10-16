import test from 'node:test';
import assert from 'node:assert/strict';
import { setImageFormat, toWebp, renderApp } from '../assets/js/render.js';

test('toWebp prebacuje JPG/PNG slike sajta, ostavlja og sliku i ikone', () => {
  setImageFormat('webp');
  const html = [
    '<img src="assets/img/beach-1.jpg">',
    '<a href="/assets/img/apartments/olive/01.jpg">',
    'data-slides="[&quot;assets/img/gallery-13.jpg&quot;]"',
    '<img src="assets/img/logo.png">',
    'srcset="assets/img/hero-mobile.jpg"',
    '<meta content="https://x.test/assets/img/og.jpg">',
    '<link href="assets/img/favicon.png"><link href="assets/img/icon-192.png">',
  ].join('\n');
  const out = toWebp(html);
  for (const kept of ['og.jpg', 'favicon.png', 'icon-192.png']) assert.ok(out.includes(kept), kept);
  assert.ok(out.includes('assets/img/beach-1.webp'));
  assert.ok(out.includes('/assets/img/apartments/olive/01.webp'));
  assert.ok(out.includes('&quot;assets/img/gallery-13.webp&quot;'));
  assert.ok(out.includes('assets/img/logo.webp'));
  assert.ok(out.includes('srcset="assets/img/hero-mobile.webp"'));
  setImageFormat(null);
  assert.equal(toWebp(html), html);
});

test('cijela početna sa WebP-om ne sadrži JPG/PNG osim og slike i ikona', () => {
  setImageFormat('webp');
  const left = renderApp('sr').match(/assets\/img\/[A-Za-z0-9_./-]+\.(jpe?g|png)/g) ?? [];
  setImageFormat(null);
  assert.deepEqual([...new Set(left)].filter((p) => !/(og|favicon|icon-\d+)\.(jpe?g|png)$/.test(p)), []);
});
