// ============================================================
//  RENDER: generiše HTML sekcija iz content.js (template literali).
//  Čist modul bez DOM-a – koristi ga i browser (main.js) i build skripta
//  (scripts/build-meta.mjs) koja ga upisuje u index.html radi SEO-a.
// ============================================================
import * as base from './content.js';
import { localizedContent } from './content.i18n.js';
import { t, languages, setLang, getLang } from './i18n.js';
import { weekdays } from './availability.js';
import { posts, blogIndexPath, postPath } from './blog-content.js';

// sadržaj na trenutnom jeziku (postavlja ga renderApp)
let c = base;

export const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** true ako je vrednost prazna ili još uvek placeholder u uglastim zagradama */
export const isPlaceholder = (v) => !v || /\[.*\]/.test(String(v));

/** mali hash za poređenje prerenderovanog i runtime HTML-a */
export const hash = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

// "Rezerviši" vodi na kalendar dostupnosti (ako nije dostupan, main.js skroluje na formu za upit)
// ---------- WebP: build pravi .webp pored svake JPG/PNG slike; ovdje se putanje u gotovom HTML-u prebacuju na njih ----------
let imageFormat = null;
export const setImageFormat = (f) => {
  imageFormat = f === 'webp' ? 'webp' : null;
};
// ostaju u originalnom formatu: slika za dijeljenje linkova, favicon i ikone aplikacije
const KEEP_FORMAT = /(^|\/)(og|favicon|icon-\d+)\.(jpe?g|png)$/i;
/** Zamjenjuje assets/img/*.jpg|png sa .webp (ako je WebP uključen). */
export const toWebp = (html) =>
  imageFormat
    ? html.replace(/(assets\/img\/[A-Za-z0-9_./$\-{}]*?)\.(jpe?g|png)(?![A-Za-z0-9_./$-])/gi, (m, p, ext) => (KEEP_FORMAT.test(`${p}.${ext}`) ? m : `${p}.webp`))
    : html;

const BOOK_HREF = '#dostupnost-anchor';
const arrow = '<span aria-hidden="true">→</span>';

const igIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2ZM17.2 5.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/><path d="M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6Zm4 14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"/></svg>`;
const calIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 3v3M16 3v3"/></svg>`;
const areaIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="8.5" y="8.5" width="7" height="7" rx="1"/></svg>`;
const acIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="8" rx="2"/><path d="M6.5 9h11M8 15.5v2.5M12 15.5v4M16 15.5v2.5"/></svg>`;
const wifiIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 9.5a11 11 0 0 1 15 0M7.5 12.8a6.5 6.5 0 0 1 9 0M10.3 16a2.3 2.3 0 0 1 3.4 0"/><circle cx="12" cy="19" r=".6" fill="currentColor"/></svg>`;
const tvIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;
const parkingIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 16.5V8h3.2a2.6 2.6 0 0 1 0 5.2H10"/></svg>`;
const clockIcon = `<svg class="h-5 w-5 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const guestsIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.3c2.2.7 3.5 2.6 3.5 5.7"/></svg>`;


// ---------- Navigacija ----------
/** Glavni meni: 6 stavki; Plaže, Znamenitosti, Hrana i Savjeti (blog) su u padajućem "Okolina". */
export function navTree() {
  const { food, sights } = c.extraSections;
  return [
    { key: 'nav.home', href: '#top' },
    { key: 'nav.stay', href: `#${c.apartmentsSection.id}` },
    { key: 'nav.prices', href: `#${c.pricing.id}` },
    { key: 'nav.gallery', href: '#galerija' },
    {
      key: 'nav.around',
      children: [
        { key: 'nav.beaches', href: '#plaze' },
        ...(sights.enabled ? [{ key: 'nav.sights', href: `#${sights.id}` }] : []),
        ...(food.enabled ? [{ key: 'nav.food', href: `#${food.id}` }] : []),
        { key: 'nav.blog', href: blogIndexPath(getLang()) },
      ],
    },
    { key: 'nav.contact', href: '#kontakt' },
  ];
}

/** Ravna lista svih stavki (footer). */
export const navItems = () => navTree().flatMap((n) => n.children ?? [n]);

const flagSvg = (code, uid) => {
  const body = {
    rs: '<rect width="24" height="16" fill="#C6363C"/><rect y="5.33" width="24" height="10.67" fill="#0C4076"/><rect y="10.67" width="24" height="5.33" fill="#fff"/>',
    ru: '<rect width="24" height="16" fill="#fff"/><rect y="5.33" width="24" height="10.67" fill="#0039A6"/><rect y="10.67" width="24" height="5.33" fill="#D52B1E"/>',
    gb: `<clipPath id="fc-${uid}"><rect width="24" height="16"/></clipPath><g clip-path="url(#fc-${uid})"><rect width="24" height="16" fill="#012169"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" stroke-width="1.6"/><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.2"/><path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3.2"/></g>`,
  }[code];
  if (code === 'me') return `<img src="assets/img/flag-me.png" width="24" height="16" alt="${esc(languages.find((l) => l.flag === 'me')?.name ?? '')}" aria-hidden="true" class="h-4 w-6 object-cover">`; // prava zastava (slika)
  return `<svg class="h-4 w-6" viewBox="0 0 24 16" aria-hidden="true">${body}</svg>`;
};
const flagBox = (code, uid) => `<span class="block h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/15">${flagSvg(code, uid)}</span>`;

/** Padajuća lista jezika sa zastavama (otvara/zatvara je main.js). */
const langMenu = () => {
  const cur = languages.find((l) => l.code === getLang()) ?? languages[0];
  return `
        <div class="relative hidden lg:block" data-lang-menu>
          <button type="button" id="lang-toggle" aria-haspopup="listbox" aria-expanded="false" aria-controls="lang-list" aria-label="${esc(t('aria.language'))}: ${esc(cur.name)}"
                  class="flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-3 font-sans text-sm transition hover:border-ink/40">
            ${flagBox(cur.flag, 'cur')}
            <span class="hidden sm:inline">${cur.label}</span>
            <svg class="h-3 w-3 text-ink/60" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>
          </button>
          <ul id="lang-list" role="listbox" aria-label="${esc(t('aria.language'))}" class="absolute right-0 z-[60] mt-2 hidden w-48 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-xl">
            ${languages
              .map(
                (l) => `<li role="presentation"><button type="button" role="option" data-lang="${l.code}" lang="${l.code}" aria-selected="${l.code === cur.code}" class="flex w-full items-center gap-3 px-4 py-2.5 text-left font-sans text-sm hover:bg-mist aria-selected:font-bold">${flagBox(l.flag, l.code)}<span>${esc(l.name)}</span></button></li>`
              )
              .join('\n            ')}
          </ul>
        </div>`;
};

const instagram = (cls) =>
  `<a href="${esc(c.social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram" class="${cls}">${igIcon}</a>`;

// ---------- Header ----------
function header() {
  const nav = navTree();
  return `
  <header id="header" class="sticky top-0 z-50 bg-white transition-shadow">
    <div class="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-2 lg:gap-3 xl:gap-6">
      <a href="#top" class="shrink-0" aria-label="${esc(c.site.brand)}">
        <img src="${esc(c.logo.src)}" width="${c.logo.width}" height="${c.logo.height}" alt="${esc(c.site.brand)}" class="h-20 w-auto md:h-24 lg:h-20 xl:h-24">
      </a>

      <nav class="hidden lg:block" aria-label="${esc(t('aria.mainNav'))}">
        <ul class="flex items-center">
          ${nav
            .map((n) =>
              n.children
                ? `<li class="group relative" data-nav-menu>
            <button type="button" aria-haspopup="true" aria-expanded="false" class="inline-flex items-center gap-1 px-[13px] py-[11px] hover:opacity-60 lg:px-[9px] xl:px-[13px]">${t(n.key)}<svg class="h-3 w-3 text-ink/60" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg></button>
            <ul class="absolute left-0 top-full z-[60] hidden min-w-[200px] overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-xl group-focus-within:block group-hover:block">
              ${n.children.map((ch) => `<li><a href="${ch.href}" class="block px-5 py-2.5 font-sans text-base hover:bg-mist">${t(ch.key)}</a></li>`).join('\n              ')}
            </ul>
          </li>`
                : `<li><a href="${n.href}" class="px-[13px] py-[11px] hover:opacity-60 lg:px-[9px] xl:px-[13px]">${t(n.key)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </nav>

      <div class="flex items-center gap-2 sm:gap-4 lg:gap-3 xl:gap-4">
        ${langMenu()}
        ${instagram('hidden h-9 w-9 items-center justify-center rounded-[10%] bg-[#2A3D2F] text-white hover:opacity-90 sm:flex lg:hidden xl:flex')}
        <a href="${BOOK_HREF}" data-book class="bg-ink px-5 py-3 font-sans text-sm font-bold uppercase tracking-wide sm:px-6 text-white transition hover:bg-charcoal">${t('btn.book')}</a>
        <button id="menu-toggle" type="button" class="lg:hidden" aria-label="${t('aria.menu')}" aria-expanded="false" aria-controls="mobile-menu">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>

    <nav id="mobile-menu" class="hidden max-h-[calc(100svh-96px)] overflow-y-auto overscroll-contain border-t border-line bg-white lg:hidden" aria-label="${esc(t('aria.mobileNav'))}">
      <ul class="mx-auto max-w-page divide-y divide-line px-4">
        ${nav
          .map((n) =>
            n.children
              ? `<li>
          <button type="button" data-acc aria-expanded="false" class="flex w-full items-center justify-between py-2.5 text-left">${t(n.key)}<svg class="h-4 w-4 text-ink/60 transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg></button>
          <ul class="mb-2 hidden grid-cols-2 gap-2">${n.children.map((ch) => `<li><a href="${ch.href}" class="block rounded-lg bg-mist px-3 py-2.5 text-center font-sans text-sm">${t(ch.key)}</a></li>`).join('')}</ul></li>`
              : `<li><a href="${n.href}" class="block py-2.5">${t(n.key)}</a></li>`
          )
          .join('\n        ')}
        <li class="flex items-center gap-1 py-2" role="group" aria-label="${esc(t('aria.language'))}">
          ${languages
            .map(
              (l) =>
                `<button type="button" data-lang="${l.code}" aria-pressed="${l.code === getLang()}" lang="${l.code}" title="${esc(l.name)}" class="px-3 py-2 font-sans text-sm aria-pressed:font-bold aria-pressed:underline aria-pressed:underline-offset-4">${l.label}</button>`
            )
            .join('')}
        </li>
      </ul>
    </nav>
  </header>`;
}

// ---------- Hero + booking traka ----------
function hero() {
  const h = c.hero;
  const boxCls = 'flex min-w-0 flex-col justify-center rounded-2xl border border-white/60 bg-white/75 px-4 py-2.5 transition focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/25 hover:bg-white/90';
  const labelCls = 'flex items-center gap-2 text-[11px] font-bold uppercase leading-4 tracking-[.14em] text-forest';
  const field = (id, key) => `
            <label class="${boxCls}">
              <span class="${labelCls}">${calIcon}<span>${t(key)}</span></span>
              <span class="relative mt-1 block">
                <span data-date-display="${id}" class="block text-base font-bold text-ink">${t('f.pickDate')}</span>
                <input type="date" name="${id}" id="${id}" data-date lang="${getLang()}" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" required>
              </span>
            </label>`;
  const stepBtn = 'flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg leading-none text-ink shadow-sm transition hover:bg-forest hover:text-white focus-visible:ring-2 focus-visible:ring-forest';
  const stepper = (name, key, value) => `
            <div class="${boxCls}" role="group" aria-labelledby="${name}-label">
              <span id="${name}-label" class="${labelCls}">${guestsIcon}<span>${t(key)}</span></span>
              <span class="mt-1 flex items-center justify-between gap-3">
                <button type="button" data-step="${name}" data-dir="-1" class="${stepBtn}" aria-label="${esc(t(key))} – ${esc(t('booking.fewer'))}">−</button>
                <output id="${name}-output" class="min-w-[1.5ch] text-center text-base font-bold" aria-live="polite">${value}</output>
                <button type="button" data-step="${name}" data-dir="1" class="${stepBtn}" aria-label="${esc(t(key))} – ${esc(t('booking.more'))}">+</button>
              </span>
              <input type="hidden" name="${name}" id="${name}" value="${value}">
            </div>`;
  return `
    <section class="relative flex min-h-[calc(100svh-96px)] items-center py-12 md:min-h-[calc(100svh-112px)] md:py-16 lg:min-h-[calc(100svh-96px)] xl:min-h-[calc(100svh-112px)]">
      <div data-hero data-slides="${esc(JSON.stringify(h.slides || []))}" data-aria-slide="${esc(t('aria.slide', { n: '{n}', m: '{m}' }))}" class="absolute inset-0 isolate overflow-hidden">
        <picture>${h.mobileSrc ? `<source media="(max-width: 767px)" srcset="${esc(h.mobileSrc)}">` : ''}
          <img data-hero-slide src="${esc(h.image.src)}" width="${h.image.width}" height="${h.image.height}" alt="${esc(h.image.alt ?? '')}" loading="eager" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover object-[68%_50%] md:object-center">
        </picture>
      </div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,40,31,.38)_0%,rgba(26,40,31,.5)_100%)] md:bg-[linear-gradient(90deg,rgba(26,40,31,.88)_0%,rgba(26,40,31,.6)_45%,rgba(26,40,31,0)_80%)]"></div>
      <div data-hero-dots class="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-3 md:bottom-auto md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:flex-col" role="group" aria-label="${esc(t('aria.slides'))}"></div>

      <div class="container relative max-w-page">
        <div class="max-w-3xl text-center text-white [text-shadow:0_1px_6px_rgba(0,0,0,.55)] md:pl-3 md:text-left">
          <span class="mb-[30px] ml-10 hidden h-24 w-px bg-white/70 md:block" aria-hidden="true"></span>
          <p class="mb-3 text-lg md:text-xl">${esc(h.subtitle)}</p>
          <h1 class="mb-6 whitespace-nowrap font-display text-[clamp(30px,8.6vw,76px)] leading-[1.15] tracking-[1px] text-white">${esc(h.title)}</h1>
          <p class="mx-auto max-w-xl text-base md:mx-0 md:text-xl">${esc(h.text)}</p>
        </div>

        <!-- Booking traka (samo desktop): popunjava formu za upit (#rezervacija) -->
        <form id="booking-form" class="mt-10 hidden max-w-[1040px] rounded-3xl border border-white/40 bg-white/50 p-3 text-ink shadow-[0_24px_60px_-18px_rgba(0,0,0,.55)] backdrop-blur-xl md:block md:p-4" aria-label="${esc(t('aria.search'))}" novalidate>
          <div class="grid gap-3 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]">
            ${field('checkin', 'booking.checkin')}
            ${field('checkout', 'booking.checkout')}
            ${stepper('adults', 'booking.adults', c.config.defaultGuests)}
            ${stepper('children', 'booking.children', 0)}
            <button type="submit" class="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-btn px-8 font-sans text-base font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-ink md:min-w-[150px]"><span>${t('btn.search')}</span>${arrow}</button>
          </div>
          <div id="strip-extra" class="mt-3 hidden flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
            <div id="strip-ages" class="flex flex-wrap items-center gap-3"></div>
            <label class="inline-flex items-center gap-2 font-sans text-sm font-bold text-ink"><input type="checkbox" id="strip-crib" class="h-4 w-4 accent-forest"> ${t('booking.crib')}</label>
          </div>
          <p id="booking-range" class="hidden px-2 pt-2 text-sm font-bold text-forest" aria-live="polite"></p>
          <p id="booking-error" class="hidden px-2 pt-2 text-sm text-red-700" role="alert"></p>
        </form>
      </div>
    </section>`;
}

const moreLink = (href, cls) =>
  `<a href="${esc(href)}" class="${cls}"><span>${t('btn.more')}</span> ${arrow}</a>`;

// ---------- Uvod ----------
function intro() {
  const s = c.intro;
  return `
    <section id="smestaj" class="overflow-hidden bg-mist py-10 md:mb-[200px] md:py-0">
      <div class="container max-w-page">
        <div class="grid items-center md:grid-cols-2">
          <div class="reveal order-2 md:order-1 md:mb-[-130px] md:mt-[130px]">
            <img src="${esc(s.image.src)}" width="${s.image.width}" height="${s.image.height}" loading="lazy" decoding="async" alt="${esc(s.image.alt)}"
                 class="w-full md:mx-0 md:mr-[50px] md:w-[calc(100%-50px)]">
          </div>
          <div class="order-1 mb-6 text-center md:order-2 md:mb-0 md:pl-[50px] md:pt-20 md:text-left">
            <h2 class="mb-[25px] font-display text-[25px] leading-[39px] text-ink md:text-[30px]">${esc(s.title)}</h2>
            ${s.text
              .split('\n\n')
              .map((t, i, all) => `<p class="${i === all.length - 1 ? 'mb-[30px]' : 'mb-4'} font-sans text-sm leading-loose text-ink md:text-lg">${esc(t)}</p>`)
              .join('\n            ')}
            ${moreLink(s.href, 'inline-flex items-center gap-3 font-sans text-base text-ink hover:opacity-60 md:text-lg')}
          </div>
        </div>
      </div>
    </section>`;
}

// ---------- Galerija apartmana: 4 sličice ispod glavne slike (+N na posljednjoj), sve slike u lightbox-u ----------
function aptGallery(ap) {
  const photos = ap.photos ?? [];
  if (!photos.length) return '';
  const shown = photos.slice(0, 4);
  const rest = photos.length - shown.length;
  const alt = (i) => t('apt.photo', { name: ap.fullName ?? ap.name, n: i + 1 });
  const link = (p, i, inner, cls) =>
    `<a href="${esc(p.full)}" data-lightbox data-group="${esc(ap.id)}" data-alt="${esc(alt(i))}" class="${cls}" aria-label="${esc(i === shown.length - 1 && rest > 0 ? t('apt.photosAll', { n: photos.length }) : alt(i))}">${inner}</a>`;
  return `
            <ul class="mt-2 grid grid-cols-4 gap-2">
              ${shown
                .map(
                  (p, i) => `<li>${link(
                    p,
                    i,
                    `<img src="${esc(p.thumb)}" width="300" height="225" loading="lazy" decoding="async" alt="" class="aspect-[4/3] w-full object-cover transition group-hover:opacity-90">${
                      i === shown.length - 1 && rest > 0
                        ? `<span class="absolute inset-0 flex items-center justify-center bg-ink/55 font-sans text-base font-bold text-white">+${rest}</span>`
                        : ''
                    }`,
                    'group relative block overflow-hidden rounded-lg'
                  )}</li>`
                )
                .join('\n              ')}
            </ul>
            <span hidden>${photos
              .slice(shown.length)
              .map((p, k) => link(p, shown.length + k, '', 'hidden'))
              .join('')}</span>`;
}

// ---------- Apartmani (kartice) ----------
function apartments() {
  const a = c.apartmentsSection;
  return `
    <section id="${esc(a.id)}" class="py-[50px] md:pb-[100px] md:pt-0">
      <div class="container max-w-page">
        <h2 class="mb-12 text-center font-display text-[30px] leading-tight text-[#1F2F25]">${esc(a.title)}</h2>
        <div class="grid gap-6 md:grid-cols-3">
          ${c.apartments
            .map(
              (ap) => `<article class="group reveal block">
            <img src="${esc(ap.image.src)}" width="${ap.image.width}" height="${ap.image.height}" loading="lazy" decoding="async" alt="${esc(ap.image.alt)}" class="img-muted w-full">
            ${aptGallery(ap)}
            <h3 class="mt-5 font-sans text-xl font-bold text-ink">${esc(ap.fullName ?? ap.name)}</h3>
            <ul class="mt-4 grid grid-cols-3 gap-2">
              ${[
                [areaIcon, ap.area],
                [guestsIcon, ap.guests],
                [acIcon, t('apt.ac')],
                [wifiIcon, t('apt.wifi')],
                [tvIcon, t('apt.tv')],
                [parkingIcon, t('apt.parking')],
              ]
                .map(
                  ([icon, label]) => `<li class="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl bg-mist px-1 text-center font-sans text-[13px] leading-tight text-ink">
                <span class="flex h-6 w-6 items-center justify-center text-forest [&>svg]:h-6 [&>svg]:w-6">${icon.replace('stroke-width="1.6"', 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"')}</span>
                <span>${esc(label)}</span>
              </li>`
                )
                .join('\n              ')}
            </ul>
            <p class="mt-4 font-sans text-sm leading-7 text-body">${esc(ap.summary)}</p>
            <ul class="mt-auto list-disc pl-5 pt-2 font-sans text-sm leading-7 text-body">
              ${ap.features.map((f) => `<li>${esc(f)}</li>`).join('\n              ')}
            </ul>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

// ---------- Cijene ----------
function pricing() {
  const p = c.pricing;
  return `
    <section id="${esc(p.id)}" class="bg-mist py-[50px] md:py-[100px]">
      <div class="container max-w-page text-center">
        <h2 class="mb-12 font-display text-[30px] leading-tight text-[#1F2F25]">${esc(p.title)}</h2>
        <div class="grid gap-6 md:grid-cols-3">
          ${p.items
            .map(
              (it) => `<div class="reveal bg-white p-6 md:p-10">
            <h3 class="font-display text-[23px] leading-10 text-ink">${esc(it.label)}</h3>
            <p class="min-h-7 font-sans text-sm text-body">${esc(it.note)}</p>
            <p class="mt-3 font-display text-[46px] leading-tight text-ink">${esc(it.price)}</p>
            <p class="font-sans text-sm text-body">${esc(it.unit)}</p>
          </div>`
            )
            .join('\n          ')}
        </div>
        <p class="mt-8 font-sans text-base text-ink">${esc(p.basis)}</p>
        <p class="mt-2 inline-flex items-center gap-2 font-sans text-base font-bold text-ink">${clockIcon}${esc(p.checkInfo)}</p>
        <ul class="mx-auto mt-4 max-w-2xl font-sans text-base text-ink">
          ${p.discounts.map((d) => `<li>${esc(d)}</li>`).join('\n          ')}
        </ul>
        <p class="mt-6 font-sans text-sm text-body">${esc(p.disclaimer)}</p>
      </div>
    </section>`;
}

// ---------- Galerija ----------
function gallery() {
  return `
    <section id="galerija" class="md:pt-0">
      <div class="container max-w-page">
        <div class="grid grid-cols-2 gap-0 md:grid-cols-3" data-gallery>
          ${c.gallery
            .map(
              (g) => `<a href="${esc(g.full)}" class="group ${g.full.endsWith('gallery-13.jpg') ? 'hidden md:block' : 'block'} overflow-hidden" data-lightbox>
            <img src="${esc(g.thumb)}" width="394" height="394" loading="lazy" decoding="async" alt="${esc(g.alt)}" class="img-muted aspect-square w-full object-cover">
          </a>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

// ---------- Tekst + slika ----------
function feature() {
  const s = c.feature;
  return `
    <section class="py-[50px] md:py-[150px] md:pb-[150px] md:pt-[170px]">
      <div class="container max-w-page">
        <div class="grid items-center gap-8 md:grid-cols-2">
          <div class="reveal text-center md:pr-[50px] md:text-left">
            <h2 class="mb-[30px] font-display text-[25px] leading-[39px] text-ink md:text-[30px]">${esc(s.title)}</h2>
            <p class="mb-[30px] font-sans text-sm leading-loose md:text-lg">${esc(s.text)}</p>
            ${moreLink(s.href, 'inline-flex items-center gap-3 font-sans text-base hover:opacity-60 md:text-lg')}
          </div>
          <div class="reveal md:p-[10px] md:pl-[60px]">
            <img src="${esc(s.image.src)}" width="${s.image.width}" height="${s.image.height}" loading="lazy" decoding="async" alt="${esc(s.image.alt)}" class="w-full">
          </div>
        </div>
      </div>
    </section>`;
}

// ---------- Utisci ----------
function reviews() {
  const many = c.reviews.length > 2;
  return `
    <section class="relative bg-charcoal py-[25px] md:py-[100px]">
      <div class="absolute inset-0 bg-[#F4EFE2]"></div>
      <div class="container relative max-w-page">
        <div class="grid gap-6 ${many ? 'md:grid-cols-3 md:gap-8' : 'md:grid-cols-2 md:gap-10'}">
          ${c.reviews
            .map(
              (r) => `<article class="reveal flex flex-col bg-white p-5 ${many ? 'md:p-8' : 'md:p-[60px]'}">
            <h3 class="mb-4 font-display text-[23px] leading-8 text-ink">${esc(r.title)}</h3>
            <div class="mb-3 flex gap-1 text-[#F4CC4C]" role="img" aria-label="${esc(t('aria.stars', { n: r.rating }))}">${'★'.repeat(r.rating)}</div>
            <p class="font-sans text-base italic leading-8 text-body">${esc(r.text)}</p>
            <div class="mt-auto flex items-center gap-4 pt-6">
              <img src="${esc(r.avatar)}" width="48" height="48" loading="lazy" decoding="async" alt="${esc(r.name)}" class="h-12 w-12 rounded-full object-cover">
              <span class="min-w-0">
                <span class="block font-display text-[22px] leading-7 text-ink">${esc(r.name)}</span>${
                  r.source
                    ? `\n                <a href="${esc(r.source)}" target="_blank" rel="noopener" class="font-sans text-sm text-body underline hover:opacity-60">${esc(t('review.source'))}</a>`
                    : ''
                }
              </span>
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;
}

// ---------- Tamna sekcija ----------
function dark() {
  const s = c.dark;
  return `
    <section class="py-[30px] md:py-[100px]">
      <div class="container max-w-page">
        <div class="grid items-center bg-charcoal md:grid-cols-2">
          <div class="reveal p-[30px] text-center text-white md:py-[67px] md:pl-[50px] md:pr-[35px] md:text-left">
            <h2 class="mb-[25px] font-display text-[25px] leading-[39px] text-white md:text-[30px]">${esc(s.title)}</h2>
            <p class="mb-[30px] font-sans text-sm leading-loose md:text-lg">${esc(s.text)}</p>
            ${moreLink(s.href, 'inline-flex items-center gap-3 font-sans text-base hover:opacity-70 md:text-lg')}
          </div>
          <div class="reveal p-5 md:p-0">
            <img src="${esc(s.image.src)}" width="${s.image.width}" height="${s.image.height}" loading="lazy" decoding="async" alt="${esc(s.image.alt)}"
                 class="w-full object-cover md:ml-[50px] md:-my-[50px] md:h-[415px] md:w-[calc(100%-50px)] md:pt-[78px]">
          </div>
        </div>
      </div>
    </section>`;
}

// ---------- Kartice (plaže, hrana, znamenitosti) ----------
const cards = (items) =>
  items
    .map((p) => {
      const inner = `
            <img src="${esc(p.image.src)}" width="${p.image.width}" height="${p.image.height}" loading="lazy" decoding="async" alt="${esc(p.image.alt)}" class="img-muted w-full">
            <p class="mt-[5px] font-sans text-lg text-black">${esc(p.name)}</p>${
              p.desc ? `\n            <p class="font-sans text-sm leading-7 text-body">${esc(p.desc)}</p>` : ''
            }${
              p.highlights?.length
                ? `\n            <ul class="mt-auto list-disc pl-5 pt-2 font-sans text-sm leading-7 text-body">${p.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
                : ''
            }`;
      const layout = p.highlights?.length ? 'flex flex-col' : 'block';
      return p.link
        ? `<a href="${esc(p.link)}" target="_blank" rel="noopener" class="group reveal ${layout}">${inner}\n          </a>`
        : `<div class="group reveal ${layout}">${inner}\n          </div>`;
    })
    .join('\n          ');

function beaches() {
  const extras = Object.values(c.extraSections)
    .filter((s) => s.enabled)
    .map(
      (s) => `
        <div id="${esc(s.id)}" class="mt-16">
          <h2 class="${s.intro ? 'mb-4' : 'mb-12'} text-center font-display text-[30px] leading-tight text-[#1F2F25]">${esc(s.title)}</h2>${
            s.intro ? `\n          <p class="mx-auto mb-12 max-w-xl text-center font-sans text-base text-body">${esc(s.intro)}</p>` : ''
          }
          <div class="grid gap-6 md:grid-cols-3">
          ${cards(s.items)}
          </div>
        </div>`
    )
    .join('');
  return `
    <section id="plaze" class="mb-[50px] bg-mist py-[50px] md:mb-[160px] md:pb-[100px] md:pt-[100px]">
      <div class="container max-w-page">
        <h2 class="mb-12 text-center font-display text-[30px] leading-tight text-[#1F2F25]">${esc(c.beaches.title)}</h2>
        <div class="grid gap-6 ${c.beaches.items.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'}">
          ${cards(c.beaches.items)}
        </div>${extras}
      </div>
    </section>`;
}

// ---------- Kontakt linkovi (renderuju se kao link samo ako vrednost nije placeholder) ----------
const digits = (v) => String(v).replace(/[^\d]/g, '');
export function contactLinks() {
  const k = c.contact;
  return [
    { id: 'phone', label: t('contact.phone'), value: k.phoneDisplay || k.phone, href: `tel:${String(k.phone).replace(/[^\d+]/g, '')}` },
    { id: 'phone2', label: t('contact.phone'), value: k.phoneDisplay2 || k.phone2, href: `tel:${String(k.phone2 || '').replace(/[^\d+]/g, '')}` },
    { id: 'email', label: 'Email', value: k.email, href: `mailto:${k.email}` },
    { id: 'whatsapp', label: 'WhatsApp', value: k.whatsapp, href: `https://wa.me/${digits(k.whatsapp)}` },
    { id: 'viber', label: 'Viber', value: k.viber, href: `viber://chat?number=%2B${digits(k.viber)}` },
  ].filter((l) => l.value);
}

export const fullAddress = () => [c.contact.address, c.contact.city, c.contact.countryName].filter(Boolean).join(', ');

// ---------- Savjeti (blog): tri najnovija članka, interni linkovi ka stranicama bloga ----------
function blogSection() {
  const lang = getLang();
  return `
    <section id="savjeti" class="py-[50px] md:py-[100px]">
      <div class="container max-w-page">
        <h2 class="mb-12 text-center font-display text-[30px] leading-tight text-[#1F2F25]">${t('blog.title')}</h2>
        <div class="grid gap-6 md:grid-cols-3">
          ${posts
            .slice(0, 3)
            .map(
              (p) => `<article class="group reveal flex flex-col">
            <a href="${postPath(p, lang)}" class="block overflow-hidden"><img src="${esc(p.image.src)}" width="${p.image.width}" height="${p.image.height}" loading="lazy" decoding="async" alt="${esc(p[lang].imageAlt)}" class="img-muted w-full"></a>
            <h3 class="mt-5 font-sans text-xl font-bold leading-snug text-ink"><a href="${postPath(p, lang)}" class="hover:opacity-70">${esc(p[lang].title)}</a></h3>
            <p class="mt-2 font-sans text-sm leading-7 text-body">${esc(p[lang].excerpt)}</p>
            <a href="${postPath(p, lang)}" class="mt-3 font-sans text-sm font-bold text-ink hover:opacity-70">${t('blog.read')} ${arrow}</a>
          </article>`
            )
            .join('\n          ')}
        </div>
        <p class="mt-10 text-center"><a href="${blogIndexPath(lang)}" class="inline-flex items-center gap-3 font-sans text-base text-ink hover:opacity-60 md:text-lg">${t('blog.all')} ${arrow}</a></p>
      </div>
    </section>`;
}

// ---------- Dostupnost (popunjava availability-widget.js; sakrivena dok Firebase ne odgovori) ----------
function availabilitySection() {
  const a = c.availability;
  return `
    <div id="dostupnost-anchor" aria-hidden="true"></div>
    <section id="${esc(a.id)}" class="hidden bg-mist py-[50px] md:py-[100px]" aria-labelledby="dostupnost-title">
      <div class="container max-w-page text-center">
        <h2 id="dostupnost-title" class="mb-4 font-display text-[30px] leading-tight text-[#1F2F25]">${esc(a.title)}</h2>
        <p class="mx-auto mb-8 max-w-xl font-sans text-lg">${esc(a.text)}</p>
        <div class="mx-auto max-w-md bg-white p-4 md:p-6">
          <div class="flex gap-2" role="group" aria-label="${esc(t('aria.apartment'))}">
            ${c.apartments
              .map(
                (ap, i) => `<button type="button" data-avail-apt="${esc(ap.id)}" aria-pressed="${i === 0}" class="min-h-11 flex-1 border border-ink px-2 font-sans text-sm font-bold aria-pressed:bg-ink aria-pressed:text-white">${esc(ap.name)}</button>`
              )
              .join('')}
          </div>
          <div class="mt-4 flex items-center justify-between">
            <button type="button" data-avail-month="-1" aria-label="${esc(t('aria.prevMonth'))}" class="h-11 w-11 border border-ink text-2xl disabled:opacity-30">‹</button>
            <h3 id="avail-month" class="font-display text-[22px] capitalize" aria-live="polite"></h3>
            <button type="button" data-avail-month="1" aria-label="${esc(t('aria.nextMonth'))}" class="h-11 w-11 border border-ink text-2xl">›</button>
          </div>
          <div class="mt-3 grid grid-cols-7 gap-px text-center font-sans text-xs font-bold text-body" aria-hidden="true">
            ${weekdays().map((d) => `<div>${d}</div>`).join('')}
          </div>
          <div id="avail-grid" class="mt-1 grid grid-cols-7 gap-px bg-line"></div>
          <p class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-sm">
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 border border-line bg-white"></span>${t('avail.free')}</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 bg-[#E0D9C8]"></span>${t('avail.taken')}</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 bg-[#34493A]"></span>${t('avail.yours')}</span>
          </p>
          <p id="avail-msg" class="mt-3 min-h-6 font-sans text-sm" role="status" aria-live="polite"></p>
          <button type="button" id="avail-send" class="mt-2 hidden w-full bg-ink px-6 py-4 font-sans text-sm font-bold uppercase text-white transition hover:bg-charcoal">${t('btn.sendRange')}</button>
        </div>
      </div>
    </section>`;
}

// ---------- Rezervacija: forma za upit + direktni kontakti ----------
function reservation() {
  const b = c.booking;
  const { minGuests, maxGuests, defaultGuests } = c.config;
  const maxChildren = maxGuests - 1;
  const inputCls =
    'min-h-[50px] w-full border border-midtone bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-shadow focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34493A] aria-[invalid=true]:border-red-600';
  // datum: nevidljivo native polje (otvara izbornik datuma) + tekst na jeziku sajta
  const dateBox = (id, name) => `<span class="relative flex min-h-[50px] w-full items-center border border-midtone bg-white px-4 py-3 font-sans text-base text-ink focus-within:border-ink focus-within:ring-2 focus-within:ring-[#34493A] has-[[aria-invalid=true]]:border-red-600">
                <span data-date-display="${id}" class="block">${t('f.pickDate')}</span>
                <input type="date" id="${id}" name="${name}" data-date lang="${getLang()}" required class="absolute inset-0 h-full w-full cursor-pointer opacity-0">
              </span>`;
  const field = (id, label, control, extra = '') => `
            <div${extra}>
              <label for="${id}" class="mb-1 block font-sans text-sm font-bold">${label}</label>
              ${control}
              <p id="${id}-error" class="hidden pt-1 font-sans text-sm text-red-600" data-error-for="${id}"></p>
            </div>`;
  return `
    <section id="rezervacija" class="container max-w-page pb-12 text-center [overflow-anchor:none]">
      <h2 class="mb-4 font-display text-[30px] md:text-[46px]">${esc(b.title)}</h2>
      <p class="mx-auto mb-6 max-w-xl font-sans text-lg">${esc(b.text)}</p>

      <div class="mt-10 grid gap-12 md:grid-cols-[2fr_1fr] md:gap-16">
        <form id="inquiry-form" class="relative text-left" novalidate aria-label="${esc(t('aria.inquiryForm'))}">
          <div class="grid gap-5 md:grid-cols-2">
            ${field('fullname', t('f.name'), `<input type="text" id="fullname" name="fullname" autocomplete="name" required class="${inputCls}">`)}
            ${field('email', t('f.email'), `<input type="email" id="email" name="email" autocomplete="email" required class="${inputCls}">`)}
            ${field('phone', t('f.phone'), `<input type="tel" id="phone" name="phone" autocomplete="tel" class="${inputCls}">`)}
            <fieldset class="font-sans">
              <legend class="mb-1 block text-sm font-bold">${t('f.messengers')}</legend>
              <div class="flex gap-6 py-3 text-base">
                <label class="inline-flex items-center gap-2"><input type="checkbox" name="messengers" value="WhatsApp" class="h-4 w-4 accent-ink"> WhatsApp</label>
                <label class="inline-flex items-center gap-2"><input type="checkbox" name="messengers" value="Viber" class="h-4 w-4 accent-ink"> Viber</label>
              </div>
            </fieldset>
            ${field('inq-checkin', t('f.checkin'), dateBox('inq-checkin', 'checkin'))}
            ${field('inq-checkout', t('f.checkout'), dateBox('inq-checkout', 'checkout'))}
            <p id="inq-range" class="hidden font-sans text-sm font-bold text-[#243528] md:col-span-2 md:-mt-2" aria-live="polite"></p>
            ${field('inq-guests', t('f.adults'), `<input type="number" id="inq-guests" name="guests" min="1" max="${maxGuests}" step="1" value="${defaultGuests}" inputmode="numeric" required class="${inputCls}">`)}
            ${field('inq-children', t('f.children'), `<input type="number" id="inq-children" name="children" min="0" max="${maxChildren}" step="1" value="0" inputmode="numeric" class="${inputCls}">`)}
            ${field('inq-ages', t('f.ages'), `<input type="text" id="inq-ages" name="ages" maxlength="60" autocomplete="off" class="${inputCls}">`, ' id="inq-ages-wrap" hidden')}
            <div id="inq-crib-wrap" class="self-center" hidden>
              <label class="inline-flex items-center gap-3 font-sans text-base"><input type="checkbox" id="inq-crib" name="crib" class="h-4 w-4 accent-ink"> ${t('f.crib')}</label>
            </div>
            ${field(
              'apartment',
              t('f.apartment'),
              `<select id="apartment" name="apartment" class="${inputCls}">
                <option value="">${t('f.noPref')}</option>
                ${c.apartments.map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('\n                ')}
              </select>`
            )}
          </div>

          <div class="mt-5">
            <label for="message" class="mb-1 block font-sans text-sm font-bold">${t('f.message')}</label>
            <textarea id="message" name="message" rows="5" class="${inputCls}"></textarea>
          </div>

          <div class="mt-5">
            <label class="flex items-start gap-3 font-sans text-sm leading-6">
              <input type="checkbox" id="consent" name="consent" required class="mt-1.5 h-4 w-4 shrink-0 accent-ink" aria-describedby="consent-error">
              <span>${esc(t('f.consent', { link: '\u0000' })).replace('\u0000', `<a href="${esc(b.privacyHref)}" target="_blank" rel="noopener" class="underline hover:opacity-60">${esc(t('f.privacyLink'))}</a>`)}</span>
            </label>
            <p id="consent-error" class="hidden pt-1 font-sans text-sm text-red-600" data-error-for="consent"></p>
          </div>

          <!-- Zaštita od botova: honeypot (ljudi ga ne vide) -->
          <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>${t('f.honeypot')} <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
          </div>

          <div class="mt-6 text-center md:text-left">
            <button type="submit" id="inquiry-submit" class="w-full bg-ink px-10 py-5 font-sans text-sm font-bold uppercase text-white transition hover:bg-charcoal disabled:cursor-wait disabled:opacity-60 md:w-auto md:px-[90px]">${t('btn.send')}</button>
          </div>
          <p id="inquiry-status" class="mt-4 hidden font-sans text-base" role="status" aria-live="polite"></p>
        </form>

        <aside class="text-center md:text-left" aria-label="${esc(t('aria.directContact'))}">
          <h3 class="mb-4 font-display text-[23px] leading-10 text-ink">${t('contact.direct')}</h3>
          <ul class="space-y-1 font-sans text-base" data-contacts>
            ${contactLinks()
              .map((k) =>
                isPlaceholder(k.value)
                  ? `<li><span class="font-bold">${k.label}:</span> ${esc(k.value)}</li>`
                  : `<li><span class="font-bold">${k.label}:</span> <a href="${esc(k.href)}"${k.id === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''} class="underline hover:opacity-60">${esc(k.value)}</a></li>`
              )
              .join('\n            ')}
            <li><span class="font-bold">${t('contact.address')}:</span> ${
              c.contact.mapUrl
                ? `<a href="${esc(c.contact.mapUrl)}" target="_blank" rel="noopener" class="underline hover:opacity-60">${esc(fullAddress())}</a>`
                : esc(fullAddress())
            }</li>
          </ul>
        </aside>
      </div>
    </section>`;
}

// ---------- Mapa ----------
function map() {
  return `
    <section aria-label="${esc(t('aria.location'))}" class="relative z-[1] [overflow-anchor:none]">
      <iframe title="${esc(t('map.title', { city: c.contact.city }))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              class="block h-[440px] w-full border-0 md:h-[440px]"
              src="https://www.google.com/maps?q=${encodeURIComponent(c.contact.lat && c.contact.lng ? `${c.contact.lat},${c.contact.lng}` : c.contact.mapQuery)}&z=17&output=embed"></iframe>
    </section>`;
}

// ---------- Footer ----------
function footer() {
  const nav = navItems();
  const half = Math.ceil(nav.length / 2);
  const list = (items) =>
    `<ul class="font-sans text-sm leading-8 text-white/80">
          ${items.map((n) => `<li><a href="${n.href}" class="hover:text-white">${t(n.key)}</a></li>`).join('\n          ')}
        </ul>`;
  return `
  <footer id="kontakt" class="bg-night text-white [overflow-anchor:none]">
    <div class="container max-w-page py-16">
      <div class="grid gap-10 text-center md:grid-cols-[minmax(0,22rem)_auto_auto_auto] md:justify-between md:gap-x-10 md:text-left">
        <div>
          <img src="${esc(c.logo.src)}" width="${c.logo.width}" height="${c.logo.height}" alt="${esc(c.site.brand)}" loading="lazy" class="mx-auto mb-5 h-28 w-28 md:mx-0">
          <h2 class="mb-4 font-display text-[26px] text-white">${t('footer.about')}</h2>
          <p class="font-sans text-sm leading-7 text-white/80">${esc(c.footer.about)}</p>
          <p class="mt-3 font-sans text-sm leading-7 text-white/80">${esc(fullAddress())}${
            [
              [c.contact.phone, c.contact.phoneDisplay],
              [c.contact.phone2, c.contact.phoneDisplay2],
            ]
              .filter(([p]) => p)
              .map(([p, d]) => `<br><a href="tel:${esc(String(p).replace(/[^\d+]/g, ''))}" class="hover:text-white">${esc(d || p)}</a>`)
              .join('')
          }${
            isPlaceholder(c.contact.email) ? '' : `<br><a href="mailto:${esc(c.contact.email)}" class="hover:text-white">${esc(c.contact.email)}</a>`
          }</p>
        </div>
        ${list(nav.slice(0, half))}
        ${list(nav.slice(half))}
        <div class="flex flex-col items-center gap-4 md:items-start">
          <h2 class="font-display text-[26px] text-white">${t('footer.follow')}</h2>
          ${instagram('flex h-9 w-9 items-center justify-center rounded-[10%] bg-[#2A3D2F] hover:opacity-90')}
          <a href="${BOOK_HREF}" data-book class="bg-white px-8 py-3 font-sans text-sm font-bold uppercase text-ink transition hover:bg-mist">${t('btn.book')}</a>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="container flex max-w-page flex-col items-center justify-between gap-2 py-5 font-sans text-sm text-white/70 md:flex-row">
        <a href="${esc(c.footer.privacyHref)}" class="hover:text-white">${t('footer.privacy')}</a>
        <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(c.site.brand)}. ${t('footer.rights')}</p>
      </div>
    </div>
  </footer>`;
}

// ---------- Lightbox + dugme "na vrh" ----------
function overlays() {
  return `
  <div id="lightbox" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Galerija" tabindex="-1">
    <button id="lb-close" type="button" class="absolute right-5 top-5 p-2 text-4xl leading-none text-white" aria-label="${t('btn.close')}">×</button>
    <button id="lb-prev" type="button" class="absolute left-4 p-2 text-5xl text-white" aria-label="${t('btn.prev')}">‹</button>
    <img id="lb-img" src="" alt="${esc(t('aria.gallery'))}" class="max-h-[90vh] max-w-[90vw] select-none object-contain">
    <button id="lb-next" type="button" class="absolute right-4 p-2 text-5xl text-white" aria-label="${t('btn.next')}">›</button>
  </div>

  <a id="scroll-up" href="#top" aria-label="${t('btn.top')}"
     class="fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center bg-ink text-white hover:bg-charcoal"><span aria-hidden="true">↑</span></a>`;
}

/** Kompletan sadržaj <div id="app"> na traženom jeziku (default sr). */
export function renderApp(lang = 'sr') {
  setLang(lang);
  c = localizedContent(lang);
  return toWebp(`
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-white focus:px-4 focus:py-2">${t('aria.skip')}</a>
${header()}

  <main id="main">
    <div id="top"></div>
${hero()}
${intro()}
${apartments()}
${pricing()}
${gallery()}
${feature()}
${reviews()}
${dark()}
${beaches()}
${blogSection()}
${availabilitySection()}
${reservation()}
${map()}
  </main>

${footer()}
${overlays()}
`);
}
