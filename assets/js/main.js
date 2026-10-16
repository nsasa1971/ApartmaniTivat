import { renderApp, hash, setImageFormat } from './render.js';
import { defaultLang, applyLanguage, languages } from './i18n.js';
import { localizedContent } from './content.i18n.js';
import { initBooking } from './booking.js';
import { initLightbox } from './lightbox.js';
import { initAvailability } from './availability-widget.js';
import { initHero } from './hero.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ============ JEZIK + SADRŽAJ: sekcije se generišu iz content.js (+ content.i18n.js) ============
// build skripta već upisuje isti HTML (srpski) u index.html (SEO, brz prvi prikaz).
// Za srpski se HTML ponovo generiše samo ako se content.js promijenio posle builda;
// za en/ru se sadržaj uvijek renderuje na izabranom jeziku (izbor se pamti, promjena = osvježavanje).
const storage = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* privatni režim */ } },
};
const supported = languages.map((l) => l.code);
// link sa bloga (npr. /?lang=en) postavlja jezik i čisti adresu
const qLang = new URLSearchParams(window.location.search).get('lang');
if (qLang && supported.includes(qLang)) {
  storage.set('lang', qLang);
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
}
const saved = storage.get('lang');
const lang = saved && supported.includes(saved) ? saved : defaultLang;

// build upisuje data-img="webp" kad su napravljene .webp slike; isti format mora i ovdje da bi HTML bio identičan prerenderovanom
setImageFormat(document.documentElement.dataset.img);
const app = $('#app');
const html = renderApp(lang);
if (lang !== defaultLang || app.dataset.hash !== hash(html)) app.innerHTML = html;
applyLanguage(lang, app);
if (lang !== defaultLang) document.title = localizedContent(lang).site.title;
document.documentElement.classList.remove('lang-pending');

// ----- padajuća lista jezika -----
const langToggle = $('#lang-toggle');
const langList = $('#lang-list');
const setLangOpen = (open) => {
  langList.classList.toggle('hidden', !open);
  langToggle.setAttribute('aria-expanded', String(open));
};
langToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  setLangOpen(langList.classList.contains('hidden'));
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-lang-menu]')) setLangOpen(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !langList.classList.contains('hidden')) {
    setLangOpen(false);
    langToggle.focus();
  }
});
$$('[data-lang]').forEach((btn) =>
  btn.addEventListener('click', () => {
    setLangOpen(false);
    if (btn.dataset.lang === lang) return;
    storage.set('lang', btn.dataset.lang);
    window.location.reload();
  })
);

// ============ HEADER: senka pri skrolu + mobilni meni ============
const header = $('#header');
const menuBtn = $('#menu-toggle');
const mobileMenu = $('#mobile-menu');
const scrollUp = $('#scroll-up');

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('shadow-md', y > 10);
  scrollUp.classList.toggle('hidden', y < 400);
  scrollUp.classList.toggle('flex', y >= 400);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// dok je meni otvoren, stranica ispod se ne skroluje (inače prevlačenje prsta preko menija lista sajt)
const setMenu = (open) => {
  mobileMenu.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('overflow-hidden', open);
  document.body.classList.toggle('overflow-hidden', open); // iOS Safari traži i body
};
const closeMenu = () => setMenu(false);
menuBtn.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });
$$('#mobile-menu a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuBtn.focus();
  }
});

// ----- mobilni meni: "Okolina" je harmonika (zatvorena dok se ne dotakne) -----
$$('[data-acc]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    const list = btn.nextElementSibling;
    list.classList.toggle('hidden', !open);
    list.classList.toggle('grid', open);
    btn.querySelector('svg').classList.toggle('rotate-180', open);
  })
);

// ----- padajući meni "Okolina" (otvara se prelaskom miša ili fokusom; ovdje se samo ažurira aria-expanded) -----
$$('[data-nav-menu]').forEach((m) => {
  const btn = $('button', m);
  const set = (v) => btn.setAttribute('aria-expanded', String(v));
  m.addEventListener('mouseenter', () => set(true));
  m.addEventListener('mouseleave', () => set(m.matches(':focus-within')));
  m.addEventListener('focusin', () => set(true));
  m.addEventListener('focusout', () => set(m.matches(':hover')));
});

// ============ "REZERVIŠI" vodi na kalendar dostupnosti ============
$$('[data-book]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    closeMenu();
    $('#dostupnost-anchor')?.scrollIntoView({ behavior: smooth });
    // kalendar se učitava tek kad mu se približimo; ako ne stigne (Firebase nedostupan), idi na formu za upit
    setTimeout(() => {
      if ($('#dostupnost')?.classList.contains('hidden')) $('#rezervacija')?.scrollIntoView({ behavior: smooth });
    }, 3000);
  })
);

// ============ REVEAL ANIMACIJE ============
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.15 }
);
$$('.reveal').forEach((el) => io.observe(el));

// ============ BOOKING TRAKA + FORMA ZA UPIT, LIGHTBOX ============
initBooking();
initLightbox();
initAvailability();
initHero();

// ============ FOOTER GODINA ============
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
