import test from 'node:test';
import assert from 'node:assert/strict';
import { blog, blogLangs, postPath, blogIndexPath } from '../assets/js/blog-content.js';
import { allPosts as posts } from '../assets/js/guides-content.js';
import { renderPostPage, renderBlogIndexPage } from '../assets/js/blog-render.js';

const BASE = 'https://example.test';

test('svaki članak ima sva tri jezika sa kompletnim poljima', () => {
  for (const p of posts) {
    for (const l of blogLangs) {
      const x = p[l];
      for (const k of ['slug', 'title', 'description', 'excerpt', 'imageAlt']) assert.ok(String(x[k]).trim(), `${p.id}/${l}/${k}`);
      assert.match(x.slug, /^[a-z0-9-]+$/, `slug ${p.id}/${l}`);
      assert.ok(x.description.length <= 170, `opis predug ${p.id}/${l} (${x.description.length})`);
      assert.ok(x.body.length >= 5, `kratak članak ${p.id}/${l}`);
    }
    // isti raspored blokova u svim jezicima (isti broj naslova i lista)
    const shape = (l) => p[l].body.map(([t]) => t).join(',');
    assert.equal(shape('en'), shape('sr'), `${p.id} en`);
    assert.equal(shape('ru'), shape('sr'), `${p.id} ru`);
  }
});

test('putanje su jedinstvene', () => {
  const all = [...blogLangs.map((l) => blogIndexPath(l)), ...posts.flatMap((p) => blogLangs.map((l) => postPath(p, l)))];
  assert.equal(new Set(all).size, all.length);
  assert.equal(postPath(posts[0], 'en'), `/en/blog/${posts[0].en.slug}.html`);
});

test('stranice imaju canonical, hreflang, članak i spisak', () => {
  for (const l of blogLangs) {
    const idx = renderBlogIndexPage(l, BASE);
    assert.ok(idx.includes(`<h1`) && idx.includes(blog.title[l]));
    for (const p of posts) {
      const html = renderPostPage(p, l, BASE);
      assert.ok(html.includes(`rel="canonical" href="${BASE}${postPath(p, l)}"`), `canonical ${p.id}/${l}`);
      for (const x of blogLangs) assert.ok(html.includes(`href="${BASE}${postPath(p, x)}"`), `hreflang ${x}`);
      assert.ok(html.includes('"@type": "Article"'));
      assert.ok(html.includes(`<h1`) && html.includes(p[l].title.replace(/&/g, '&amp;')));
    }
  }
});
