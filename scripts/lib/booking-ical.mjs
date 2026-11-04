// ============================================================
//  Booking.com iCal → zauzeti periodi (čiste funkcije, bez mreže i Firebase-a).
//  Koristi ih scripts/sync-booking.mjs i tests/booking-ical.test.mjs.
//
//  Konvencija je ista kao u aplikaciji (assets/js/availability.js): datumi su 'YYYY-MM-DD',
//  `to` (dan odlaska) je ISKLJUČEN – DTEND u iCal-u je takođe isključiv, pa se prenosi bez izmjene.
//  Rezervacija 10.–15. zauzima noći 10, 11, 12, 13 i 14; 15. je slobodan za novi dolazak.
// ============================================================
import ical from 'node-ical';

export const TIME_ZONE = 'Europe/Podgorica';
export const SOURCE = 'booking';

const pad = (n) => String(n).padStart(2, '0');
const dayMs = 86400000;
const toISO = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * dayMs).toISOString().slice(0, 10);

/** Datum (YYYY-MM-DD) trenutka u zadatoj vremenskoj zoni. */
function zonedDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Datum iz vrijednosti koju vraća node-ical.
 * DATE (cio dan): node-ical pravi Date u lokalnoj ponoći procesa, pa se čitaju lokalna polja (radi u bilo kojoj TZ).
 * DATE-TIME: pravi trenutak u vremenu, pa se pretvara u datum u zoni Europe/Podgorica.
 */
function dateOf(value, datetype, timeZone) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  return datetype === 'date' ? toISO(value.getFullYear(), value.getMonth() + 1, value.getDate()) : zonedDate(value, timeZone);
}

/**
 * Parsira iCal tekst u listu zauzetih perioda [{from, to}] (sortirano, bez duplikata).
 * Baca grešku ako sadržaj nije validan VCALENDAR ili ako ijedan VEVENT ne može da se pročita –
 * pozivalac tada NE smije brisati postojeće blokove.
 */
export function parseBookingIcs(text, { timeZone = TIME_ZONE } = {}) {
  if (typeof text !== 'string' || !/^BEGIN:VCALENDAR/im.test(text) || !/^END:VCALENDAR/im.test(text)) {
    throw new Error('Sadržaj nije validan VCALENDAR.');
  }
  let parsed;
  try {
    parsed = ical.sync.parseICS(text);
  } catch {
    throw new Error('iCal sadržaj se ne može parsirati.');
  }
  const found = new Map();
  for (const ev of Object.values(parsed)) {
    if (ev?.type !== 'VEVENT') continue;
    if (String(ev.status ?? '').toUpperCase() === 'CANCELLED') continue;
    const from = dateOf(ev.start, ev.datetype, timeZone);
    let to = ev.end ? dateOf(ev.end, ev.datetype, timeZone) : null;
    if (!from) throw new Error('Događaj u iCal-u nema ispravan početak.');
    // bez DTEND (ili događaj unutar jednog dana) zauzima samo noć početka
    if (!to || to <= from) to = addDays(from, 1);
    found.set(`${from}|${to}`, { from, to });
  }
  return [...found.values()].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.to < b.to ? -1 : a.to > b.to ? 1 : 0));
}

/** Deterministički ID dokumenta u `availability`. */
export const blockId = (apartmentId, from, to) => `booking-ical-${apartmentId}-${from}-${to}`;

/** Polja dokumenta u `availability` (isti kao kod rezervacija sa sajta + source). Samo datumi, bez ličnih podataka. */
export const blockDoc = (apartmentId, { from, to }) => ({
  apartmentId,
  from,
  to,
  bookingId: blockId(apartmentId, from, to),
  source: SOURCE,
});

/**
 * Plan sinhronizacije jednog apartmana.
 * @param {string} apartmentId
 * @param {{from:string,to:string}[]} feed       blokovi iz feeda
 * @param {{id:string, data:object}[]} existing  postojeći dokumenti iz `availability` (bilo koji; filtrira se ovdje)
 * Brišu se ISKLJUČIVO dokumenti sa source === 'booking' ovog apartmana kojih više nema u feedu.
 */
export function planApartmentSync(apartmentId, feed, existing) {
  const wanted = new Map(feed.map((b) => [blockId(apartmentId, b.from, b.to), blockDoc(apartmentId, b)]));
  const mine = existing.filter((d) => d.data?.source === SOURCE && d.data?.apartmentId === apartmentId);
  const have = new Map(mine.map((d) => [d.id, d.data]));
  const same = (a, b) => ['apartmentId', 'from', 'to', 'bookingId', 'source'].every((k) => a?.[k] === b[k]);
  const upserts = [];
  const unchanged = [];
  for (const [id, data] of wanted) (same(have.get(id), data) ? unchanged : upserts).push({ id, data });
  const deletes = mine.filter((d) => !wanted.has(d.id)).map((d) => ({ id: d.id, data: d.data }));
  return { upserts, unchanged, deletes };
}

/** Poruka greške bez tajni: uklanja svaku od zadatih vrijednosti (npr. iCal linkove) i skraćuje tekst. */
export function safeMessage(err, secrets = []) {
  let msg = String(err?.message ?? err ?? 'Nepoznata greška').replace(/\s+/g, ' ');
  for (const s of secrets) if (s) msg = msg.split(s).join('[skriveno]');
  msg = msg.replace(/https?:\/\/\S+/gi, '[link]');
  return msg.slice(0, 300);
}
