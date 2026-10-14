// ============================================================
//  Pomoćne funkcije za datume i dostupnost (čiste funkcije, bez DOM-a).
//  Koriste ih i javni sajt (sekcija "Dostupnost", provjera termina) i /admin.
//  Datumi su stringovi 'YYYY-MM-DD'. Dan odlaska ('to') je ISKLJUČEN:
//  rezervacija 10.–15. zauzima noći 10, 11, 12, 13 i 14; 15. je slobodan za novi dolazak.
// ============================================================

const pad = (n) => String(n).padStart(2, '0');

export const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
export const WEEKDAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

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

export const monthLabel = (y, m) => `${MONTHS[m]} ${y}.`;
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
