// ============================================================
//  RENDER: generiše HTML sekcija iz content.js (template literali).
//  Čist modul bez DOM-a – koristi ga i browser (main.js) i build skripta
//  (scripts/build-meta.mjs) koja ga upisuje u index.html radi SEO-a.
// ============================================================
import * as c from './content.js';
import { t, languages } from './i18n.js';

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

const BOOK_HREF = '#rezervacija';
const arrow = '<span aria-hidden="true">→</span>';

const igIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2ZM17.2 5.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/><path d="M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6Zm4 14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"/></svg>`;
const calIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 3v3M16 3v3"/></svg>`;
const guestsIcon = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.3c2.2.7 3.5 2.6 3.5 5.7"/></svg>`;

const i = (key, tag = '') => `data-i18n="${key}"${tag}`;

// ---------- Navigacija ----------
export function navItems() {
  const { food, sights } = c.extraSections;
  return [
    { key: 'nav.home', href: '#top' },
    { key: 'nav.stay', href: `#${c.apartmentsSection.id}` },
    { key: 'nav.prices', href: `#${c.pricing.id}` },
    { key: 'nav.gallery', href: '#galerija' },
    { key: 'nav.beaches', href: '#plaze' },
    ...(sights.enabled ? [{ key: 'nav.sights', href: `#${sights.id}` }] : []),
    ...(food.enabled ? [{ key: 'nav.food', href: `#${food.id}` }] : []),
    { key: 'nav.contact', href: '#kontakt' },
  ];
}

const langButtons = (cls) =>
  languages
    .map(
      (l) =>
        `<button type="button" data-lang="${l.code}" aria-pressed="${l.code === 'sr'}" lang="${l.code}" title="${esc(l.name)}" class="${cls}">${l.label}</button>`
    )
    .join('');

const instagram = (cls) =>
  `<a href="${esc(c.social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram" class="${cls}">${igIcon}</a>`;

// ---------- Header ----------
function header() {
  const nav = navItems();
  return `
  <header id="header" class="sticky top-0 z-50 bg-white transition-shadow">
    <div class="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-2 lg:gap-3 xl:gap-6">
      <a href="#top" class="shrink-0" aria-label="${esc(c.site.brand)}">
        <img src="${esc(c.logo.src)}" width="${c.logo.width}" height="${c.logo.height}" alt="${esc(c.site.brand)}" class="h-20 w-auto md:h-24 lg:h-20 xl:h-24">
      </a>

      <nav class="hidden lg:block" aria-label="Glavna navigacija">
        <ul class="flex items-center">
          ${nav.map((n) => `<li><a href="${n.href}" ${i(n.key)} class="px-[13px] py-[11px] hover:opacity-60 lg:px-[5px] xl:px-[13px]">${t(n.key)}</a></li>`).join('\n          ')}
        </ul>
      </nav>

      <div class="flex items-center gap-4 lg:gap-3 xl:gap-4">
        <div class="hidden items-center lg:flex" role="group" data-i18n-aria="aria.language" aria-label="${t('aria.language')}">
          ${langButtons('px-2 py-1 font-sans text-sm hover:opacity-60 aria-pressed:font-bold aria-pressed:underline aria-pressed:underline-offset-4')}
        </div>
        ${instagram('hidden h-9 w-9 items-center justify-center rounded-[10%] bg-[#2A3D2F] text-white hover:opacity-90 sm:flex lg:hidden xl:flex')}
        <a href="${BOOK_HREF}" ${i('btn.book')} class="bg-ink px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition hover:bg-charcoal">${t('btn.book')}</a>
        <button id="menu-toggle" type="button" class="lg:hidden" data-i18n-aria="aria.menu" aria-label="${t('aria.menu')}" aria-expanded="false" aria-controls="mobile-menu">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>

    <nav id="mobile-menu" class="hidden border-t border-line bg-white lg:hidden" aria-label="Mobilna navigacija">
      <ul class="mx-auto max-w-page divide-y divide-line px-4">
        ${nav.map((n) => `<li><a href="${n.href}" ${i(n.key)} class="block py-3">${t(n.key)}</a></li>`).join('\n        ')}
        <li class="flex items-center gap-1 py-2" role="group" data-i18n-aria="aria.language" aria-label="${t('aria.language')}">
          ${langButtons('px-3 py-2 font-sans text-sm aria-pressed:font-bold aria-pressed:underline aria-pressed:underline-offset-4')}
        </li>
      </ul>
    </nav>
  </header>`;
}

// ---------- Hero + booking traka ----------
function hero() {
  const h = c.hero;
  const field = (id, label, key) => `
            <label class="flex items-center gap-3 rounded-full px-2 py-2">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#34493A]/20 bg-[#34493A]/10" aria-hidden="true">${calIcon}</span>
              <span class="flex flex-col">
                <span ${i(key)} class="text-sm font-bold leading-4 text-[#243528]">${t(key)}</span>
                <input type="date" name="${id}" id="${id}" class="bg-transparent text-sm text-[#243528]/70 outline-none focus-visible:ring-2 focus-visible:ring-[#34493A]" required>
              </span>
            </label>`;
  return `
    <section class="relative flex min-h-[250px] items-center py-12 md:min-h-[320px] md:pb-[130px] md:pt-[100px]">
      <div data-hero data-slides="${esc(JSON.stringify(h.slides || []))}" class="absolute inset-0 overflow-hidden">
        <img data-hero-slide src="${esc(h.image.src)}" width="${h.image.width}" height="${h.image.height}" alt="" loading="eager" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover object-[68%_50%] md:object-center">
      </div>
      <div class="absolute inset-0 bg-[#34493A]/70 md:bg-transparent md:bg-[linear-gradient(90deg,#34493AFA_2%,#F2295B00_42%)]"></div>
      <div data-hero-dots class="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:right-8" role="group" aria-label="Slike"></div>

      <div class="container relative max-w-page">
        <div class="max-w-xl text-center text-white [text-shadow:0_1px_4px_rgba(0,0,0,.45)] md:pl-3 md:pr-[70px] md:text-left md:[text-shadow:none]">
          <span class="mb-[30px] ml-10 hidden h-24 w-px bg-white/70 md:block" aria-hidden="true"></span>
          <p class="mb-4 text-lg md:text-xl">${esc(h.subtitle)}</p>
          <h1 class="mb-[30px] font-display text-[46px] leading-[65px] tracking-[1px] text-white md:text-[54px]">${esc(h.title)}</h1>
          <p class="text-base md:text-xl">${esc(h.text)}</p>
        </div>

        <!-- Booking traka: popunjava formu za upit (#rezervacija) -->
        <form id="booking-form" class="mt-12 max-w-[1000px] rounded-[25px] bg-white p-3 text-ink shadow-xl md:rounded-[55px] md:px-5 md:py-2" aria-label="Pretraga termina" novalidate>
          <div class="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            ${field('checkin', 'Dolazak', 'booking.checkin')}
            ${field('checkout', 'Odlazak', 'booking.checkout')}

            <div class="flex items-center gap-3 rounded-full px-2 py-2" role="group" aria-labelledby="guests-label">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#34493A]/20 bg-[#34493A]/10" aria-hidden="true">${guestsIcon}</span>
              <span class="flex flex-col">
                <span id="guests-label" ${i('booking.guests')} class="text-sm font-bold leading-4 text-[#243528]">${t('booking.guests')}</span>
                <span class="flex items-center gap-3 text-sm text-[#243528]/70">
                  <button type="button" data-guests="-1" class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#243528] leading-none text-[#243528] focus-visible:ring-2 focus-visible:ring-[#34493A]" aria-label="Manje gostiju">−</button>
                  <output id="guests-output" aria-live="polite">${c.config.defaultGuests}</output>
                  <button type="button" data-guests="1" class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#243528] leading-none text-[#243528] focus-visible:ring-2 focus-visible:ring-[#34493A]" aria-label="Više gostiju">+</button>
                </span>
              </span>
              <input type="hidden" name="guests" id="guests" value="${c.config.defaultGuests}">
            </div>

            <button type="submit" ${i('btn.search')} class="h-[52px] rounded-full bg-btn px-8 font-sans text-base font-bold text-white transition hover:bg-ink">${t('btn.search')}</button>
          </div>
          <p id="booking-range" class="hidden px-3 pt-1 text-sm font-bold text-[#243528]" aria-live="polite"></p>
          <p id="booking-error" class="hidden px-3 pt-1 text-sm text-red-600" role="alert"></p>
        </form>
      </div>
    </section>`;
}

const moreLink = (href, cls) =>
  `<a href="${esc(href)}" class="${cls}"><span ${i('btn.more')}>${t('btn.more')}</span> ${arrow}</a>`;

// ---------- Uvod ----------
function intro() {
  const s = c.intro;
  return `
    <section id="smestaj" class="overflow-hidden bg-mist py-10 md:mb-[200px] md:py-0">
      <div class="container max-w-page">
        <div class="grid items-center md:grid-cols-2">
          <div class="reveal order-2 md:order-1 md:mb-[-130px] md:mt-[130px]">
            <img src="${esc(s.image.src)}" width="${s.image.width}" height="${s.image.height}" loading="lazy" decoding="async" alt="${esc(s.image.alt)}"
                 class="mx-auto w-[70%] md:mx-0 md:mr-[50px] md:w-[calc(100%-50px)]">
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
            <h3 class="mt-[5px] font-sans text-lg text-black">${esc(ap.fullName ?? ap.name)}</h3>
            <p class="font-sans text-sm font-bold text-ink">${esc(ap.area)} · ${esc(ap.guests)}</p>
            <p class="mt-2 font-sans text-sm leading-7 text-body">${esc(ap.summary)}</p>
            <ul class="mt-2 list-disc pl-5 font-sans text-sm leading-7 text-body">
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
              (g) => `<a href="${esc(g.full)}" class="group block overflow-hidden" data-lightbox>
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
  return `
    <section class="relative bg-charcoal py-[25px] md:py-[100px]">
      <div class="absolute inset-0 bg-[#F4EFE2]"></div>
      <div class="container relative max-w-page">
        <div class="grid gap-6 md:grid-cols-2 md:gap-10">
          ${c.reviews
            .map(
              (r) => `<article class="reveal bg-white p-4 md:p-[60px]">
            <h3 class="mb-5 font-display text-[23px] leading-10 text-ink">${esc(r.title)}</h3>
            <div class="mb-3 flex gap-1 text-[#F4CC4C]" role="img" aria-label="${r.rating} od 5 zvezdica">${'★'.repeat(r.rating)}</div>
            <p class="font-sans text-base italic leading-8 text-body">${esc(r.text)}</p>
            <div class="mt-6 flex items-center gap-4">
              <img src="${esc(r.avatar)}" width="48" height="48" loading="lazy" decoding="async" alt="" class="h-12 w-12 rounded-full object-cover">
              <span class="font-display text-[22px] text-ink">${esc(r.name)}</span>
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
            }`;
      return p.link
        ? `<a href="${esc(p.link)}" target="_blank" rel="noopener" class="group reveal block">${inner}\n          </a>`
        : `<div class="group reveal block">${inner}\n          </div>`;
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
    { id: 'phone', label: 'Telefon', value: k.phoneDisplay || k.phone, href: `tel:${String(k.phone).replace(/[^\d+]/g, '')}` },
    { id: 'email', label: 'Email', value: k.email, href: `mailto:${k.email}` },
    { id: 'whatsapp', label: 'WhatsApp', value: k.whatsapp, href: `https://wa.me/${digits(k.whatsapp)}` },
    { id: 'viber', label: 'Viber', value: k.viber, href: `viber://chat?number=%2B${digits(k.viber)}` },
  ].filter((l) => l.value);
}

export const fullAddress = () => [c.contact.address, c.contact.city, c.contact.countryName].filter(Boolean).join(', ');

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
          <div class="flex gap-2" role="group" aria-label="Apartman">
            ${c.apartments
              .map(
                (ap, i) => `<button type="button" data-avail-apt="${esc(ap.id)}" aria-pressed="${i === 0}" class="min-h-11 flex-1 border border-ink px-2 font-sans text-sm font-bold aria-pressed:bg-ink aria-pressed:text-white">${esc(ap.name)}</button>`
              )
              .join('')}
          </div>
          <div class="mt-4 flex items-center justify-between">
            <button type="button" data-avail-month="-1" aria-label="Prethodni mjesec" class="h-11 w-11 border border-ink text-2xl disabled:opacity-30">‹</button>
            <h3 id="avail-month" class="font-display text-[22px] capitalize" aria-live="polite"></h3>
            <button type="button" data-avail-month="1" aria-label="Sljedeći mjesec" class="h-11 w-11 border border-ink text-2xl">›</button>
          </div>
          <div class="mt-3 grid grid-cols-7 gap-px text-center font-sans text-xs font-bold text-body" aria-hidden="true">
            ${['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((d) => `<div>${d}</div>`).join('')}
          </div>
          <div id="avail-grid" class="mt-1 grid grid-cols-7 gap-px bg-line"></div>
          <p class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-sm">
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 border border-line bg-white"></span>Slobodno</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 bg-charcoal"></span>Zauzeto</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 bg-[#34493A]"></span>Vaš izbor</span>
          </p>
          <p id="avail-msg" class="mt-3 min-h-6 font-sans text-sm" role="status" aria-live="polite"></p>
          <button type="button" id="avail-send" class="mt-2 hidden w-full bg-ink px-6 py-4 font-sans text-sm font-bold uppercase text-white transition hover:bg-charcoal">Pošalji upit za ovaj termin</button>
        </div>
      </div>
    </section>`;
}

// ---------- Rezervacija: forma za upit + direktni kontakti ----------
function reservation() {
  const b = c.booking;
  const { minGuests, maxGuests, defaultGuests } = c.config;
  const inputCls =
    'min-h-[50px] w-full border border-midtone bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-shadow focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34493A] aria-[invalid=true]:border-red-600';
  const field = (id, label, control, extra = '') => `
            <div${extra}>
              <label for="${id}" class="mb-1 block font-sans text-sm font-bold">${label}</label>
              ${control}
              <p id="${id}-error" class="hidden pt-1 font-sans text-sm text-red-600" data-error-for="${id}"></p>
            </div>`;
  return `
    <section id="rezervacija" class="container max-w-page pb-12 text-center">
      <h2 class="mb-4 font-display text-[30px] md:text-[46px]">${esc(b.title)}</h2>
      <p class="mx-auto mb-6 max-w-xl font-sans text-lg">${esc(b.text)}</p>

      <div class="mt-10 grid gap-12 md:grid-cols-[2fr_1fr] md:gap-16">
        <form id="inquiry-form" class="relative text-left" novalidate aria-label="Forma za upit">
          <div class="grid gap-5 md:grid-cols-2">
            ${field('fullname', 'Ime i prezime *', `<input type="text" id="fullname" name="fullname" autocomplete="name" required class="${inputCls}">`)}
            ${field('email', 'Email *', `<input type="email" id="email" name="email" autocomplete="email" required class="${inputCls}">`)}
            ${field('phone', 'Telefon', `<input type="tel" id="phone" name="phone" autocomplete="tel" class="${inputCls}">`)}
            <fieldset class="font-sans">
              <legend class="mb-1 block text-sm font-bold">Dostupan/na sam i na</legend>
              <div class="flex gap-6 py-3 text-base">
                <label class="inline-flex items-center gap-2"><input type="checkbox" name="messengers" value="WhatsApp" class="h-4 w-4 accent-ink"> WhatsApp</label>
                <label class="inline-flex items-center gap-2"><input type="checkbox" name="messengers" value="Viber" class="h-4 w-4 accent-ink"> Viber</label>
              </div>
            </fieldset>
            ${field('inq-checkin', 'Dolazak *', `<input type="date" id="inq-checkin" name="checkin" required class="${inputCls}">`)}
            ${field('inq-checkout', 'Odlazak *', `<input type="date" id="inq-checkout" name="checkout" required class="${inputCls}">`)}
            <p id="inq-range" class="hidden font-sans text-sm font-bold text-[#243528] md:col-span-2 md:-mt-2" aria-live="polite"></p>
            ${field('inq-guests', 'Broj gostiju *', `<input type="number" id="inq-guests" name="guests" min="${minGuests}" max="${maxGuests}" step="1" value="${defaultGuests}" inputmode="numeric" required class="${inputCls}">`)}
            ${field(
              'apartment',
              'Apartman',
              `<select id="apartment" name="apartment" class="${inputCls}">
                <option value="">Bez preferencije</option>
                ${c.apartments.map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('\n                ')}
              </select>`
            )}
          </div>

          <div class="mt-5">
            <label for="message" class="mb-1 block font-sans text-sm font-bold">Poruka</label>
            <textarea id="message" name="message" rows="5" class="${inputCls}"></textarea>
          </div>

          <div class="mt-5">
            <label class="flex items-start gap-3 font-sans text-sm leading-6">
              <input type="checkbox" id="consent" name="consent" required class="mt-1.5 h-4 w-4 shrink-0 accent-ink" aria-describedby="consent-error">
              <span>Saglasan/na sam sa <a href="${esc(b.privacyHref)}" target="_blank" rel="noopener" class="underline hover:opacity-60">politikom privatnosti</a> i obradom podataka radi odgovora na upit. *</span>
            </label>
            <p id="consent-error" class="hidden pt-1 font-sans text-sm text-red-600" data-error-for="consent"></p>
          </div>

          <!-- Zaštita od botova: honeypot (ljudi ga ne vide) -->
          <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>Ne popunjavati <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
          </div>

          <div class="mt-6 text-center md:text-left">
            <button type="submit" id="inquiry-submit" ${i('btn.send')} class="w-full bg-ink px-10 py-5 font-sans text-sm font-bold uppercase text-white transition hover:bg-charcoal disabled:cursor-wait disabled:opacity-60 md:w-auto md:px-[90px]">${t('btn.send')}</button>
          </div>
          <p id="inquiry-status" class="mt-4 hidden font-sans text-base" role="status" aria-live="polite"></p>
        </form>

        <aside class="text-center md:text-left" aria-label="Direktni kontakt">
          <h3 class="mb-4 font-display text-[23px] leading-10 text-ink">Direktni kontakt</h3>
          <ul class="space-y-1 font-sans text-base" data-contacts>
            ${contactLinks()
              .map((k) =>
                isPlaceholder(k.value)
                  ? `<li><span class="font-bold">${k.label}:</span> ${esc(k.value)}</li>`
                  : `<li><span class="font-bold">${k.label}:</span> <a href="${esc(k.href)}"${k.id === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''} class="underline hover:opacity-60">${esc(k.value)}</a></li>`
              )
              .join('\n            ')}
            <li><span class="font-bold">Adresa:</span> ${
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
    <section aria-label="Lokacija" class="relative z-[1]">
      <iframe title="Mapa – ${esc(c.contact.city)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
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
          ${items.map((n) => `<li><a href="${n.href}" ${i(n.key)} class="hover:text-white">${t(n.key)}</a></li>`).join('\n          ')}
        </ul>`;
  return `
  <footer id="kontakt" class="bg-night text-white">
    <div class="container max-w-page py-16">
      <div class="grid gap-10 text-center md:grid-cols-4 md:text-left">
        <div>
          <h2 ${i('footer.about')} class="mb-4 font-display text-[26px] text-white">${t('footer.about')}</h2>
          <p class="font-sans text-sm leading-7 text-white/80">${esc(c.footer.about)}</p>
          <p class="mt-3 font-sans text-sm leading-7 text-white/80">${esc(fullAddress())}${
            c.contact.phone
              ? `<br><a href="tel:${esc(String(c.contact.phone).replace(/[^\d+]/g, ''))}" class="hover:text-white">${esc(c.contact.phoneDisplay || c.contact.phone)}</a>`
              : ''
          }</p>
        </div>
        ${list(nav.slice(0, half))}
        ${list(nav.slice(half))}
        <div class="flex flex-col items-center gap-4 md:items-start">
          <h2 ${i('footer.follow')} class="font-display text-[26px] text-white">${t('footer.follow')}</h2>
          ${instagram('flex h-9 w-9 items-center justify-center rounded-[10%] bg-[#2A3D2F] hover:opacity-90')}
          <a href="${BOOK_HREF}" ${i('btn.book')} class="bg-white px-8 py-3 font-sans text-sm font-bold uppercase text-ink transition hover:bg-mist">${t('btn.book')}</a>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="container flex max-w-page flex-col items-center justify-between gap-2 py-5 font-sans text-sm text-white/70 md:flex-row">
        <a href="${esc(c.footer.privacyHref)}" ${i('footer.privacy')} class="hover:text-white">${t('footer.privacy')}</a>
        <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(c.site.brand)}. Sva prava zadržana.</p>
      </div>
    </div>
  </footer>`;
}

// ---------- Lightbox + dugme "na vrh" ----------
function overlays() {
  return `
  <div id="lightbox" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Galerija" tabindex="-1">
    <button id="lb-close" type="button" class="absolute right-5 top-5 p-2 text-4xl leading-none text-white" data-i18n-aria="btn.close" aria-label="${t('btn.close')}">×</button>
    <button id="lb-prev" type="button" class="absolute left-4 p-2 text-5xl text-white" data-i18n-aria="btn.prev" aria-label="${t('btn.prev')}">‹</button>
    <img id="lb-img" src="" alt="" class="max-h-[90vh] max-w-[90vw] select-none object-contain">
    <button id="lb-next" type="button" class="absolute right-4 p-2 text-5xl text-white" data-i18n-aria="btn.next" aria-label="${t('btn.next')}">›</button>
  </div>

  <a id="scroll-up" href="#top" data-i18n-aria="btn.top" aria-label="${t('btn.top')}"
     class="fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center bg-ink text-white hover:bg-charcoal"><span aria-hidden="true">↑</span></a>`;
}

/** Kompletan sadržaj <div id="app"> (default jezik = sr). */
export function renderApp() {
  return `
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-white focus:px-4 focus:py-2">Preskoči na sadržaj</a>
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
${availabilitySection()}
${reservation()}
${map()}
  </main>

${footer()}
${overlays()}
`;
}
