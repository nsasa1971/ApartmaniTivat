import { renderApp, hash } from './render.js';
import { defaultLang, applyLanguage, languages } from './i18n.js';
import { initBooking } from './booking.js';
import { initLightbox } from './lightbox.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ============ SADRŽAJ: sekcije se generišu iz content.js ============
// build skripta već upisuje isti HTML u index.html (SEO, brz prvi prikaz).
// Ovde se HTML ponovo generiše samo ako se content.js promenio posle builda.
const app = $('#app');
const html = renderApp();
if (app.dataset.hash !== hash(html)) app.innerHTML = html;

// ============ JEZIK ============
const storage = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* privatni režim */ } },
};
const supported = languages.map((l) => l.code);
const setLang = (lang) => {
  const applied = applyLanguage(lang, app);
  storage.set('lang', applied);
};
const saved = storage.get('lang');
if (saved && saved !== defaultLang && supported.includes(saved)) setLang(saved);
$$('[data-lang]').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

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

const closeMenu = () => {
  mobileMenu.classList.add('hidden');
  menuBtn.setAttribute('aria-expanded', 'false');
};
menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('#mobile-menu a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuBtn.focus();
  }
});

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

// ============ FOOTER GODINA ============
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
