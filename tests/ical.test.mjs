import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIcal, icalDate } from '../netlify/lib/ical.mjs';
import handler from '../netlify/functions/booking-ical.mjs';
import { mergeAvailability } from '../assets/js/availability-data.js';

const ICS = [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Booking.com//EN',
  'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20301020', 'DTEND;VALUE=DATE:20301023', 'SUMMARY:CLOSED - Not available', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART:20301101T140000Z', 'DTEND:20301105T100000Z', 'SUMMARY:Ivan Petrović', 'DESCRIPTION:lični', ' podaci', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20301110', 'STATUS:CANCELLED', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20200101', 'DTEND;VALUE=DATE:20200105', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20301201', 'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

test('iCal: datumi, otkazano, jedna noć bez DTEND, stari termini, bez ličnih podataka', () => {
  const r = parseIcal(ICS, { today: '2030-01-01' });
  assert.deepEqual(r, [
    { from: '2030-10-20', to: '2030-10-23' },
    { from: '2030-11-01', to: '2030-11-05' },
    { from: '2030-12-01', to: '2030-12-02' },
  ]);
  assert.ok(!JSON.stringify(r).includes('Petrovi'));
  assert.equal(parseIcal(ICS).length, 4); // bez `today` se ne filtrira (otkazani je i dalje izbačen)
});

test('iCal: neispravni ulazi', () => {
  assert.deepEqual(parseIcal(''), []);
  assert.deepEqual(parseIcal('nije ical'), []);
  assert.equal(icalDate('2030-10-20'), null);
  assert.equal(icalDate('20301340'), null);
  assert.equal(icalDate('20301231T000000Z'), '2030-12-31');
});

test('funkcija: vraća samo datume, bilježi apartman čiji iCal nije dostupan', async () => {
  const realFetch = globalThis.fetch;
  process.env.BOOKING_ICAL_OLIVE = 'https://example.test/olive.ics';
  process.env.BOOKING_ICAL_LAVANDA = 'https://example.test/lavanda.ics';
  delete process.env.BOOKING_ICAL_LEMONI;
  globalThis.fetch = async (url) => (String(url).includes('olive') ? new Response(ICS) : new Response('greška', { status: 500 }));
  try {
    const res = await handler();
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(Object.keys(body.apartments), ['olive']);
    assert.ok(body.apartments.olive.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.from) && /^\d{4}-\d{2}-\d{2}$/.test(x.to)));
    assert.deepEqual(body.failed, ['lavanda']); // lemoni nema podešen link: nije ni greška
    assert.match(res.headers.get('cache-control'), /s-maxage=60$/);
    assert.ok(!JSON.stringify(body).includes('Petrovi'));
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.BOOKING_ICAL_OLIVE;
    delete process.env.BOOKING_ICAL_LAVANDA;
  }
});

test('spajanje termina iz Firebase-a i sa Booking.com-a', () => {
  const a = new Map([['olive', [{ from: '2030-07-01', to: '2030-07-03' }]]]);
  const b = new Map([['olive', [{ from: '2030-07-10', to: '2030-07-12' }]], ['lemoni', [{ from: '2030-08-01', to: '2030-08-02' }]]]);
  const m = mergeAvailability(a, b);
  assert.equal(m.get('olive').length, 2);
  assert.equal(m.get('lemoni').length, 1);
  assert.equal(a.get('olive').length, 1); // ulazi se ne mijenjaju
});
