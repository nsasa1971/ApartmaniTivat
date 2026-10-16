// ============================================================
//  Generator stranica bloga (čist modul, bez DOM-a). Koristi ga scripts/build-meta.mjs
//  da napravi: /blog/, /en/blog/, /ru/blog/ (spisak) i po jednu stranicu za svaki članak i jezik.
//  Stranice su obični HTML (bez JavaScripta) radi brzine i SEO-a; stil je isti kao na sajtu.
// ============================================================
import * as c from './content.js';
import { blog, blogLangs, blogIndexPath, postPath, homeHref } from './blog-content.js';
import { allPosts as posts } from './guides-content.js';
import { t, languages } from './i18n.js';
import { esc, toWebp } from './render.js';

const HTML_LANG = { sr: 'sr-Latn-ME', en: 'en', ru: 'ru' };
const DATE_LOCALE = { sr: 'sr-Latn', en: 'en-GB', ru: 'ru-RU' };
const OG_LOCALE = { sr: 'sr_ME', en: 'en_GB', ru: 'ru_RU' };

const tr = (key, lang, vars) => t(key, vars, lang);
const abs = (base, p) => `${base}${p.startsWith('/') ? '' : '/'}${p}`;
const fmtDate = (iso, lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(DATE_LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const phones = () =>
  [
    [c.contact.phone, c.contact.phoneDisplay],
    [c.contact.phone2, c.contact.phoneDisplay2],
  ]
    .filter(([p]) => p)
    .map(([p, d]) => `<a href="tel:${esc(String(p).replace(/[^\d+]/g, ''))}" class="hover:text-white">${esc(d || p)}</a>`);

function renderBlocks(blocks) {
  return blocks
    .map(([type, val]) => {
      if (type === 'h2') return `<h2 class="mb-3 mt-10 font-display text-[26px] leading-tight text-ink md:text-[30px]">${esc(val)}</h2>`;
      if (type === 'h3') return `<h3 class="mb-2 mt-6 font-sans text-xl font-bold leading-snug text-ink">${esc(val)}</h3>`;
      if (type === 'ul') return `<ul class="mb-4 list-disc space-y-1 pl-6">${val.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      return `<p class="mb-4">${esc(val)}</p>`;
    })
    .join('\n        ');
}

/** Cijela HTML stranica: zaglavlje, sadržaj, podnožje, SEO oznake. `alternates` = { sr: '/putanja', en: ..., ru: ... } */
function page({ lang, base, title, description, path, alternates, image, ogType = 'website', jsonLd, main }) {
  const url = abs(base, path);
  const ogImage = abs(base, image.src);
  const homeUrl = homeHref(lang);
  const header = `
  <header class="sticky top-0 z-50 bg-white shadow-sm">
    <div class="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2">
      <a href="${homeUrl}" class="shrink-0" aria-label="${esc(c.site.brand)}"><img src="/${esc(c.logo.small)}" width="${c.logo.width}" height="${c.logo.height}" alt="${esc(c.site.brand)}" class="h-16 w-auto md:h-20"></a>
      <nav class="hidden items-center gap-7 font-sans text-base md:flex" aria-label="${esc(tr('aria.mainNav', lang))}">
        <a href="${homeUrl}" class="hover:underline">${tr('blog.home', lang)}</a>
        <a href="${homeHref(lang, '#apartmani')}" class="hover:underline">${tr('blog.stay', lang)}</a>
        <a href="${blogIndexPath(lang)}" class="font-bold hover:underline">${tr('nav.blog', lang)}</a>
      </nav>
      <div class="flex items-center gap-3">
        <div class="flex items-center font-sans text-sm" role="group" aria-label="${esc(tr('aria.language', lang))}">
          ${languages
            .map(
              (l) =>
                `<a href="${alternates[l.code]}" hreflang="${HTML_LANG[l.code]}" lang="${HTML_LANG[l.code]}" title="${esc(l.name)}" ${l.code === lang ? 'aria-current="true"' : ''} class="px-2 py-1 hover:no-underline ${l.code === lang ? 'font-bold underline underline-offset-4' : ''}">${l.label}</a>`
            )
            .join('')}
        </div>
        <a href="${homeHref(lang, '#dostupnost-anchor')}" class="bg-ink px-4 py-3 font-sans text-xs font-bold uppercase tracking-wide text-white transition hover:bg-charcoal sm:px-6 sm:text-sm">${tr('btn.book', lang)}</a>
      </div>
    </div>
  </header>`;
  const footer = `
  <footer class="mt-16 bg-night text-white">
    <div class="container flex max-w-page flex-col items-center gap-6 py-12 text-center md:flex-row md:items-start md:justify-between md:text-left">
      <div class="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <img src="/${esc(c.logo.small)}" width="${c.logo.width}" height="${c.logo.height}" alt="" loading="lazy" class="h-24 w-24">
        <p class="font-sans text-sm leading-7 text-white/80"><strong class="text-base text-white">${esc(c.site.brand)}</strong><br>${esc(
          [c.contact.address, c.contact.city, lang === 'sr' ? c.contact.countryName : { en: 'Montenegro', ru: 'Черногория' }[lang]].join(', ')
        )}<br>${phones().join('<br>')}${c.contact.email && !/\[.*\]/.test(c.contact.email) ? `<br><a href="mailto:${esc(c.contact.email)}" class="hover:text-white">${esc(c.contact.email)}</a>` : ''}</p>
      </div>
      <ul class="font-sans text-sm leading-8 text-white/80">
        <li><a href="${homeUrl}" class="hover:text-white">${tr('blog.home', lang)}</a></li>
        <li><a href="${blogIndexPath(lang)}" class="hover:text-white">${tr('nav.blog', lang)}</a></li>
        <li><a href="/politika-privatnosti.html" class="hover:text-white">${tr('footer.privacy', lang)}</a></li>
      </ul>
    </div>
    <div class="border-t border-white/10 py-4 text-center font-sans text-sm text-white/70">© ${new Date().getFullYear()} ${esc(c.site.brand)}. ${tr('footer.rights', lang)}</div>
  </footer>`;
  const hreflangs = blogLangs
    .map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${esc(abs(base, alternates[l]))}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${esc(abs(base, alternates.sr))}">`)
    .join('\n  ');
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="${esc(c.site.themeColor)}">
  <link rel="canonical" href="${esc(url)}">
  ${hreflangs}
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
  <meta property="og:site_name" content="${esc(c.site.brand)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="${image.width}">
  <meta property="og:image:height" content="${image.height}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${esc(ogImage)}">
  <link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="icon" href="/assets/img/favicon.png" sizes="64x64" type="image/png">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/spinnaker-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/lato-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css">
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c')}
  </script>
</head>
<body class="bg-white antialiased">
${toWebp(header)}
  <main id="main">
${toWebp(main)}
  </main>
${toWebp(footer)}
</body>
</html>
`;
}

const card = (post, lang) => `
        <article class="group flex flex-col">
          <a href="${postPath(post, lang)}" class="block overflow-hidden">
            <img src="/${esc(post.image.src)}" width="${post.image.width}" height="${post.image.height}" loading="lazy" decoding="async" alt="${esc(post[lang].imageAlt)}" class="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]">
          </a>
          <h2 class="mt-4 font-display text-[22px] leading-snug text-ink"><a href="${postPath(post, lang)}" class="hover:underline">${esc(post[lang].title)}</a></h2>
          <p class="mt-2 font-sans text-sm leading-7 text-body">${esc(post[lang].excerpt)}</p>
          <a href="${postPath(post, lang)}" class="mt-3 inline-flex items-center gap-2 font-sans text-sm font-bold text-ink hover:underline">${tr('blog.read', lang)} <span aria-hidden="true">→</span></a>
        </article>`;

/** Spisak članaka: /blog/, /en/blog/, /ru/blog/ */
export function renderBlogIndexPage(lang, base) {
  const alternates = Object.fromEntries(blogLangs.map((l) => [l, blogIndexPath(l)]));
  const title = `${blog.title[lang]} – ${c.site.brand}`;
  const main = `
    <div class="container max-w-page py-12 md:py-16">
      <h1 class="mb-4 text-center font-display text-[32px] leading-tight text-ink md:text-[46px]">${esc(blog.title[lang])}</h1>
      <p class="mx-auto mb-12 max-w-2xl text-center font-sans text-lg text-body">${esc(blog.description[lang])}</p>
      <div class="grid gap-x-6 gap-y-12 md:grid-cols-3">${posts.map((p) => card(p, lang)).join('')}
      </div>
    </div>`;
  return page({
    lang,
    base,
    title,
    description: blog.description[lang],
    path: blogIndexPath(lang),
    alternates,
    image: { src: c.site.ogImage, width: 1200, height: 630 },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: blog.title[lang],
      description: blog.description[lang],
      url: abs(base, blogIndexPath(lang)),
      inLanguage: HTML_LANG[lang],
      publisher: { '@type': 'Organization', name: c.site.brand },
    },
    main,
  });
}

/** Stranica jednog članka na jednom jeziku. */
export function renderPostPage(post, lang, base) {
  const p = post[lang];
  const alternates = Object.fromEntries(blogLangs.map((l) => [l, postPath(post, l)]));
  const url = abs(base, postPath(post, lang));
  const related = posts.filter((x) => x.id !== post.id).slice(0, 3);
  const main = `
    <article class="container max-w-[860px] py-10 md:py-14">
      <nav class="mb-6 font-sans text-sm text-body" aria-label="breadcrumb">
        <a href="${blogIndexPath(lang)}" class="underline hover:no-underline">${esc(tr('nav.blog', lang))}</a> <span aria-hidden="true">/</span> <span>${esc(p.title)}</span>
      </nav>
      <h1 class="font-display text-[30px] leading-tight text-ink md:text-[44px]">${esc(p.title)}</h1>
      <p class="mb-8 mt-3 font-sans text-sm text-body"><time datetime="${post.date}">${esc(fmtDate(post.date, lang))}</time></p>
      <img src="/${esc(post.image.src)}" width="${post.image.width}" height="${post.image.height}" alt="${esc(p.imageAlt)}" fetchpriority="high" class="mb-8 aspect-[4/3] w-full object-cover md:aspect-[16/9]">
      <div class="font-sans text-base leading-8 text-ink md:text-lg md:leading-9">
        ${renderBlocks(p.body)}
      </div>
      <aside class="mt-12 bg-mist p-6 text-center md:p-10">
        <h2 class="font-display text-[26px] leading-tight text-ink">${tr('blog.ctaTitle', lang)}</h2>
        <p class="mx-auto mt-3 max-w-xl font-sans text-base text-body">${tr('blog.ctaText', lang)}</p>
        <a href="${homeHref(lang, '#dostupnost-anchor')}" class="mt-6 inline-block bg-ink px-8 py-4 font-sans text-sm font-bold uppercase tracking-wide text-white transition hover:bg-charcoal">${tr('blog.ctaButton', lang)}</a>
      </aside>
    </article>
    <section class="container max-w-page" aria-labelledby="related">
      <h2 id="related" class="mb-8 text-center font-display text-[26px] leading-tight text-ink">${tr('blog.related', lang)}</h2>
      <div class="grid gap-x-6 gap-y-12 md:grid-cols-3">${related.map((r) => card(r, lang)).join('')}
      </div>
    </section>`;
  return page({
    lang,
    base,
    title: `${p.title} – ${c.site.brand}`,
    description: p.description,
    path: postPath(post, lang),
    alternates,
    image: post.image,
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.title,
      description: p.description,
      image: abs(base, post.image.src),
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: HTML_LANG[lang],
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: c.site.brand },
      publisher: { '@type': 'Organization', name: c.site.brand, logo: { '@type': 'ImageObject', url: abs(base, c.logo.src) } },
    },
    main,
  });
}
