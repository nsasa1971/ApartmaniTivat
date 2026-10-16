// ============================================================
//  Minimalan iCal (RFC 5545) parser za zauzete termine sa Booking.com-a.
//  Vraća samo datume: [{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }] (`to` = dan odlaska, isključen – kao u kalendaru sajta).
//  Nikakvi lični podaci (SUMMARY, DESCRIPTION...) se ne čitaju niti vraćaju.
// ============================================================

const pad = (n) => String(n).padStart(2, '0');

/** '20261020' | '20261020T140000Z' | '20261020T140000' → '2026-10-20' (ili null) */
export function icalDate(value) {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(String(value ?? '').trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  if (Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > 31) return null;
  return `${y}-${mo}-${d}`;
}

const nextDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
};

/** Spaja "preložene" linije (linija koja počinje razmakom/tabom nastavlja prethodnu). */
const unfold = (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '').split('\n');

/**
 * @param {string} text sadržaj .ics fajla
 * @param {{ today?: string }} [opts] ako je zadat `today`, izbacuju se termini koji su završeni (to < today)
 */
export function parseIcal(text, { today } = {}) {
  const ranges = [];
  let ev = null;
  for (const line of unfold(String(text ?? ''))) {
    if (line === 'BEGIN:VEVENT') ev = {};
    else if (line === 'END:VEVENT') {
      if (ev && ev.from && !ev.cancelled) {
        const to = ev.to && ev.to > ev.from ? ev.to : nextDay(ev.from); // bez DTEND: jedna noć
        if (!today || to >= today) ranges.push({ from: ev.from, to });
      }
      ev = null;
    } else if (ev) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const name = line.slice(0, i).split(';')[0].toUpperCase();
      const value = line.slice(i + 1);
      if (name === 'DTSTART') ev.from = icalDate(value);
      else if (name === 'DTEND') ev.to = icalDate(value);
      else if (name === 'STATUS' && value.trim().toUpperCase() === 'CANCELLED') ev.cancelled = true;
    }
  }
  return ranges.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
}
