// ============================================================
//  PREVODI (sr / en / ru)
//  Prevedeni su samo navigacija i dugmad. Ostali tekstovi su u content.js.
//  U HTML-u se koristi: data-i18n="kljuc" (tekst) i data-i18n-aria="kljuc" (aria-label).
//  Novi jezik: dodaj objekat ispod i unos u `languages`.
// ============================================================

export const defaultLang = 'sr';

export const languages = [
  { code: 'sr', label: 'SR', name: 'Srpski' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

export const i18n = {
  sr: {
    'nav.home': 'Početna',
    'nav.stay': 'Smeštaj',
    'nav.beaches': 'Plaže',
    'nav.food': 'Hrana',
    'nav.sights': 'Znamenitosti',
    'nav.gallery': 'Galerija',
    'nav.contact': 'Kontakt',
    'btn.book': 'Rezerviši',
    'btn.search': 'Pretraži',
    'btn.more': 'Saznaj više',
    'btn.send': 'Pošalji upit',
    'btn.close': 'Zatvori',
    'btn.prev': 'Prethodna',
    'btn.next': 'Sledeća',
    'btn.top': 'Na vrh',
    'booking.checkin': 'Dolazak',
    'booking.checkout': 'Odlazak',
    'booking.guests': 'Gosti',
    'aria.menu': 'Meni',
    'aria.language': 'Jezik',
    'footer.privacy': 'Politika privatnosti',
    'footer.about': 'O nama',
    'footer.follow': 'Pratite nas',
  },
  en: {
    'nav.home': 'Home',
    'nav.stay': 'Accommodation',
    'nav.beaches': 'Beaches',
    'nav.food': 'Food',
    'nav.sights': 'Sights',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'btn.book': 'Book now',
    'btn.search': 'Search',
    'btn.more': 'Learn more',
    'btn.send': 'Send inquiry',
    'btn.close': 'Close',
    'btn.prev': 'Previous',
    'btn.next': 'Next',
    'btn.top': 'Back to top',
    'booking.checkin': 'Check-in',
    'booking.checkout': 'Check-out',
    'booking.guests': 'Guests',
    'aria.menu': 'Menu',
    'aria.language': 'Language',
    'footer.privacy': 'Privacy policy',
    'footer.about': 'About us',
    'footer.follow': 'Follow us',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.stay': 'Размещение',
    'nav.beaches': 'Пляжи',
    'nav.food': 'Еда',
    'nav.sights': 'Достопримечательности',
    'nav.gallery': 'Галерея',
    'nav.contact': 'Контакты',
    'btn.book': 'Забронировать',
    'btn.search': 'Найти',
    'btn.more': 'Узнать больше',
    'btn.send': 'Отправить запрос',
    'btn.close': 'Закрыть',
    'btn.prev': 'Назад',
    'btn.next': 'Вперёд',
    'btn.top': 'Наверх',
    'booking.checkin': 'Заезд',
    'booking.checkout': 'Выезд',
    'booking.guests': 'Гости',
    'aria.menu': 'Меню',
    'aria.language': 'Язык',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.about': 'О нас',
    'footer.follow': 'Мы в соцсетях',
  },
};

/** Prevod ključa; ako ga nema u izabranom jeziku, koristi srpski. */
export const t = (key, lang = defaultLang) => i18n[lang]?.[key] ?? i18n[defaultLang][key] ?? key;

/** Primenjuje jezik na sve elemente sa data-i18n / data-i18n-aria u datom korenu. */
export function applyLanguage(lang, root = document) {
  if (!i18n[lang]) lang = defaultLang;
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria, lang));
  });
  root.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });
  return lang;
}
