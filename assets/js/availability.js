// ============================================================
//  Pomoćne funkcije za datume i dostupnost (čiste funkcije, bez DOM-a).
//  Koriste ih i javni sajt (sekcija "Dostupnost", provjera termina) i /admin.
//  Datumi su stringovi 'YYYY-MM-DD'. Dan odlaska ('to') je ISKLJUČEN:
//  rezervacija 10.–15. zauzima noći 10, 11, 12, 13 i 14; 15. je slobodan za novi dolazak.
// ============================================================

import { getLang } from './i18n.js';

const pad = (n) => String(n).padStart(2, '0');

const L10N = {
  sr: {
    months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
    short: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
    weekdays: ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'],
    nights: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'noćenje' : 'noćenja'}`,
    day: (d, mon, y) => `${d}. ${mon} ${y}.`,
    month: (mon, y) => `${mon} ${y}.`,
  },
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    nights: (n) => `${n} ${n === 1 ? 'night' : 'nights'}`,
    day: (d, mon, y) => `${mon} ${d}, ${y}`,
    month: (mon, y) => `${mon} ${y}`,
  },
  ru: {
    months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    short: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    nights: (n) => {
      const f = n % 10 === 1 && n % 100 !== 11 ? 'ночь' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ночи' : 'ночей';
      return `${n} ${f}`;
    },
    day: (d, mon, y) => `${d} ${mon} ${y} г.`,
    month: (mon, y) => `${mon} ${y} г.`,
  },
};
const loc = () => L10N[getLang()] ?? L10N.sr;

// srpske liste (koristi ih i /admin)
export const MONTHS = L10N.sr.months;
export const SHORT_MONTHS = L10N.sr.short;
export const WEEKDAYS = L10N.sr.weekdays;
/** Dani u sedmici na jeziku sajta (srpski u /admin-u). */
export const weekdays = () => loc().weekdays;

/** Današnji datum po lokalnom vremenu uređaja. */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const toISO = (ms) => new Date(ms).toISOString().slice(0, 10);

export const isValidISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parseISO(s)) === s;
export const addDays = (s, n) => toISO(parseISO(s) + n * 86400000);
export const nightsBetween = (from, to) => Math.round((parseISO(to) - parseISO(from)) / 86400000);

/** Preklapanje poluotvorenih intervala [from, to). */
export const overlaps = (aFrom, aTo, bFrom, bTo) => aFrom < bTo && bFrom < aTo;

/** Rezervacije/zauzeća iz `ranges` ({id, from, to}) koja se preklapaju sa [from, to). */
export const findConflicts = (ranges, from, to, ignoreId = null) =>
  ranges.filter((r) => r.id !== ignoreId && r.bookingId !== ignoreId && overlaps(from, to, r.from, r.to));

/** Svi zauzeti dani (noći) u listi intervala, kao Set. */
export const bookedDaySet = (ranges) => {
  const set = new Set();
  for (const r of ranges) for (let d = r.from; d < r.to; d = addDays(d, 1)) set.add(d);
  return set;
};

export const formatDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}.`;
};

/** "5. nov 2026." – mjesec je napisan riječju da se ne može pomiješati sa danom. */
export const formatDateLong = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const l = loc();
  return l.day(d, l.short[m - 1], y);
};

/** 1 noćenje, 2–4 noćenja, 5+ noćenja, 21 noćenje … */
export const nightsLabel = (n) => loc().nights(n);

/** "5. nov 2026. – 9. nov 2026., 4 noćenja" (prazan string ako datumi nisu ispravni). */
export const formatRange = (from, to) =>
  isValidISO(from) && isValidISO(to) && to > from
    ? `${formatDateLong(from)} – ${formatDateLong(to)}, ${nightsLabel(nightsBetween(from, to))}`
    : '';

export const monthLabel = (y, m) => {
  const l = loc();
  return l.month(l.months[m], y);
};
export const shiftMonth = ({ y, m }, delta) => {
  const t = y * 12 + m + delta;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
};

/** Mjesec kao nedjelje (ponedjeljak prvi); prazna polja su null. */
export const monthGrid = (y, m) => {
  const first = new Date(Date.UTC(y, m, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

/** Da li je [from,to) slobodan za apartman (map: apartmentId → [{from,to}]). */
export const isRangeFree = (map, apartmentId, from, to) => !(map.get(apartmentId) ?? []).some((r) => overlaps(from, to, r.from, r.to));

/** Da li je termin slobodan u bar jednom od apartmana. */
export const isAnyFree = (map, apartmentIds, from, to) => apartmentIds.some((id) => isRangeFree(map, id, from, to));
