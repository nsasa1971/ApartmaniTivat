// ============================================================
//  Build skripta: iz assets/js/content.js generiše
//   - SEO <head> (title, meta, canonical, Open Graph, JSON-LD) u index.html
//   - prerender sadržaja (#app) u index.html
//   - manifest.webmanifest, robots.txt, sitemap.xml
//  Idempotentna je: menja samo delove između build:* markera.
// ============================================================
import { readFile, writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as c from '../assets/js/content.js';
import { renderApp, hash, esc, isPlaceholder } from '../assets/js/render.js';
import { posts, blogLangs, blogIndexPath, postPath } from '../assets/js/blog-content.js';
import { renderBlogIndexPage, renderPostPage } from '../assets/js/blog-render.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = (p) => path.join(root, p);

const base = c.site.url.replace(/\/+$/, '');
const abs = (p) => `${base}/${p.replace(/^\/+/, '')}`;
if (isPlaceholder(base)) {
  console.warn('⚠  site.url u content.js je još placeholder – canonical, og:image i sitemap nisu pravi.');
}

// ---------- JSON-LD ----------
const nonPlaceholder = (v) => (isPlaceholder(v) ? undefined : v);
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: c.site.brand,
  description: c.site.description,
  url: `${base}/`,
  image: abs(c.site.ogImage),
  telephone: nonPlaceholder(c.contact.phone),
  email: nonPlaceholder(c.contact.email),
  address: {
    '@type': 'PostalAddress',
    streetAddress: c.contact.address,
    addressLocality: c.contact.city,
    addressCountry: c.contact.country,
  },
  geo: c.contact.lat && c.contact.lng ? { '@type': 'GeoCoordinates', latitude: c.contact.lat, longitude: c.contact.lng } : undefined,
  sameAs: nonPlaceholder(c.social.instagram) ? [c.social.instagram] : undefined,
  containsPlace: c.apartments.map((a) => ({
    '@type': 'Apartment',
    name: a.fullName ?? a.name,
    description: a.summary,
    floorSize: a.area ? { '@type': 'QuantitativeValue', value: parseFloat(a.area), unitCode: 'MTK' } : undefined,
  })),
};
const ld = JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c');

const head = `<title>${esc(c.site.title)}</title>
  <meta name="description" content="${esc(c.site.description)}">
  <meta name="theme-color" content="${esc(c.site.themeColor)}">
  <link rel="canonical" href="${esc(base)}/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${esc(c.site.locale)}">
  <meta property="og:site_name" content="${esc(c.site.brand)}">
  <meta property="og:title" content="${esc(c.site.title)}">
  <meta property="og:description" content="${esc(c.site.ogDescription)}">
  <meta property="og:url" content="${esc(base)}/">
  <meta property="og:image" content="${esc(abs(c.site.ogImage))}">
  <meta property="og:image:secure_url" content="${esc(abs(c.site.ogImage))}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(c.site.brand)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${esc(abs(c.site.ogImage))}">
  <script>try{var l=localStorage.getItem('lang');if(l&&l!=='sr'){document.documentElement.classList.add('lang-pending');setTimeout(function(){document.documentElement.classList.remove('lang-pending')},3500)}}catch(e){}</script>
  <link rel="icon" href="assets/img/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/icon-192.png">
  <link rel="manifest" href="manifest.webmanifest">
  <script type="application/ld+json">
${ld}
  </script>`;

// ---------- index.html ----------
const replaceBlock = (html, name, inner) => {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`Marker build:${name} ne postoji u index.html`);
  return html.replace(re, (_, a, b) => `${a}\n${inner}\n  ${b}`);
};

let html = await readFile(file('index.html'), 'utf8');
const app = renderApp();
html = replaceBlock(html, 'head', `  ${head}`);
html = replaceBlock(html, 'app', `  <div id="app" data-hash="${hash(app)}">${app}  </div>`);
await writeFile(file('index.html'), html);

// ---------- manifest ----------
const manifest = {
  name: c.site.title,
  short_name: c.site.brand,
  start_url: './',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: c.site.themeColor,
  icons: [
    { src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
await writeFile(file('manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

// ---------- robots + sitemap ----------
await writeFile(file('robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`);
// ---------- blog: spisak i članci na sva tri jezika ----------
const HREFLANG = { sr: 'sr-Latn-ME', en: 'en', ru: 'ru' };
const writePage = async (urlPath, html) => {
  const out = file(urlPath.endsWith('/') ? `${urlPath.slice(1)}index.html` : urlPath.slice(1));
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
};
for (const lang of blogLangs) {
  await writePage(blogIndexPath(lang), renderBlogIndexPage(lang, base));
  for (const post of posts) await writePage(postPath(post, lang), renderPostPage(post, lang, base));
}

const alt = (pathFor) =>
  [...blogLangs.map((l) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(base + pathFor(l))}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(base + pathFor('sr'))}"/>`].join('\n');
const entries = [
  `  <url><loc>${esc(`${base}/`)}</loc></url>`,
  `  <url><loc>${esc(`${base}/${c.footer.privacyHref}`)}</loc></url>`,
  ...blogLangs.map((l) => `  <url><loc>${esc(base + blogIndexPath(l))}</loc>\n${alt(blogIndexPath)}\n  </url>`),
  ...posts.flatMap((post) =>
    blogLangs.map((l) => `  <url><loc>${esc(base + postPath(post, l))}</loc><lastmod>${post.date}</lastmod>\n${alt((x) => postPath(post, x))}\n  </url>`)
  ),
];
await writeFile(
  file('sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
);

console.log(`✓ meta, prerender, manifest, robots.txt, sitemap.xml i blog (${posts.length * blogLangs.length + blogLangs.length} stranica) generisani`);
