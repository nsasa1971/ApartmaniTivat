// ============================================================
//  Netlify funkcija: GET /api/booking-ical
//  Čita iCal kalendare sa Booking.com-a (linkovi su u Netlify promjenljivama okruženja, ne u kodu)
//  i vraća SAMO zauzete datume po apartmanu. Odgovor se kešira na Netlify CDN-u (10 min),
//  pa Booking.com dobija najviše nekoliko zahtjeva na sat bez obzira na broj posjetilaca.
//
//  Promjenljive okruženja (Netlify → Site configuration → Environment variables):
//    BOOKING_ICAL_OLIVE, BOOKING_ICAL_LAVANDA, BOOKING_ICAL_LEMONI  – iCal (export) linkovi iz Booking.com administracije
// ============================================================
import { parseIcal } from '../lib/ical.mjs';

const APARTMENTS = ['olive', 'lavanda', 'lemoni'];
const TIMEOUT_MS = 8000;

const todayIso = () => new Date().toISOString().slice(0, 10);

async function fetchOne(id) {
  const url = process.env[`BOOKING_ICAL_${id.toUpperCase()}`];
  if (!url) return { id, skipped: true };
  try {
    if (!/^https:\/\//i.test(url)) throw new Error('nije https');
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: 'text/calendar' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('BEGIN:VCALENDAR')) throw new Error('nije iCal');
    return { id, ranges: parseIcal(text, { today: todayIso() }) };
  } catch (e) {
    console.warn(`iCal ${id}: ${e.message}`);
    return { id, failed: true };
  }
}

export default async () => {
  const results = await Promise.all(APARTMENTS.map(fetchOne));
  const apartments = {};
  const failed = [];
  for (const r of results) {
    if (r.ranges) apartments[r.id] = r.ranges;
    if (r.failed) failed.push(r.id);
  }
  return new Response(JSON.stringify({ apartments, failed, updatedAt: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // greška: kratak keš da se brzo oporavi; uspjeh: 10 min
      'Cache-Control': failed.length ? 'public, max-age=0, s-maxage=60' : 'public, max-age=0, s-maxage=600, stale-while-revalidate=600',
    },
  });
};

export const config = { path: '/api/booking-ical' };
