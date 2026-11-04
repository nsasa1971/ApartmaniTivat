// Testovi parsera Booking iCal-a i plana sinhronizacije (bez mreže i bez Firebase-a).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseBookingIcs, planApartmentSync, blockId, blockDoc, safeMessage } from '../scripts/lib/booking-ical.mjs';
import { bookedDaySet, addDays, isRangeFree } from '../assets/js/availability.js';
import { apartments } from '../assets/js/content.js';

const cal = (...events) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n${events.join('\r\n')}\r\nEND:VCALENDAR\r\n`;
const ev = (lines) => `BEGIN:VEVENT\r\nUID:${Math.random()}\r\n${lines.join('\r\n')}\r\nEND:VEVENT`;
const allDay = (from, to) => ev([`DTSTART;VALUE=DATE:${from}`, `DTEND;VALUE=DATE:${to}`, 'SUMMARY:CLOSED - Not available']);

test('jednodnevni događaj (DATE): zauzima samo noć dolaska, dan odlaska je slobodan', () => {
  assert.deepEqual(parseBookingIcs(cal(allDay('20260710', '20260711'))), [{ from: '2026-07-10', to: '2026-07-11' }]);
});

test('višednevni događaj: DTEND je isključiv i prenosi se bez izmjene', () => {
  assert.deepEqual(parseBookingIcs(cal(allDay('20260710', '20260715'))), [{ from: '2026-07-10', to: '2026-07-15' }]);
});

test('događaj koji prelazi mjesec i godinu', () => {
  assert.deepEqual(parseBookingIcs(cal(allDay('20260729', '20260803'), allDay('20261230', '20270103'))), [
    { from: '2026-07-29', to: '2026-08-03' },
    { from: '2026-12-30', to: '2027-01-03' },
  ]);
});

test('poklapa se sa konvencijom aplikacije (availability.js): odlazak je slobodan', () => {
  const [b] = parseBookingIcs(cal(allDay('20260710', '20260715')));
  const days = bookedDaySet([b]);
  assert.deepEqual([...days], ['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14']);
  assert.ok(!days.has('2026-07-15'));
  const map = new Map([['olive', [b]]]); // isti oblik kao što ga sajt gradi iz kolekcije availability
  assert.equal(isRangeFree(map, 'olive', '2026-07-15', '2026-07-17'), true); // novi dolazak na dan odlaska
  assert.equal(isRangeFree(map, 'olive', '2026-07-08', '2026-07-11'), false);
});

test('DATE-TIME: datum u zoni Europe/Podgorica (ljeto UTC+2, zima UTC+1)', () => {
  // 22:30 UTC = 00:30 sljedećeg dana u Podgorici (ljeto)
  assert.deepEqual(parseBookingIcs(cal(ev(['DTSTART:20260710T223000Z', 'DTEND:20260712T100000Z']))), [{ from: '2026-07-11', to: '2026-07-12' }]);
  // zima: 23:30 UTC = 00:30 sljedećeg dana
  assert.deepEqual(parseBookingIcs(cal(ev(['DTSTART:20260110T233000Z', 'DTEND:20260115T090000Z']))), [{ from: '2026-01-11', to: '2026-01-15' }]);
  // TZID
  assert.deepEqual(
    parseBookingIcs(cal(ev(['DTSTART;TZID=Europe/Podgorica:20260801T150000', 'DTEND;TZID=Europe/Podgorica:20260805T110000']))),
    [{ from: '2026-08-01', to: '2026-08-05' }]
  );
});

test('događaj unutar jednog dana ili bez DTEND zauzima jednu noć', () => {
  assert.deepEqual(parseBookingIcs(cal(ev(['DTSTART:20260710T100000Z', 'DTEND:20260710T120000Z']))), [{ from: '2026-07-10', to: '2026-07-11' }]);
  assert.deepEqual(parseBookingIcs(cal(ev(['DTSTART;VALUE=DATE:20260901']))), [{ from: '2026-09-01', to: '2026-09-02' }]);
});

test('duplikati se spajaju, rezultat je sortiran, otkazani događaji se preskaču', () => {
  const out = parseBookingIcs(
    cal(allDay('20260801', '20260805'), allDay('20260701', '20260703'), allDay('20260801', '20260805'), ev(['DTSTART;VALUE=DATE:20260901', 'DTEND;VALUE=DATE:20260905', 'STATUS:CANCELLED']))
  );
  assert.deepEqual(out, [
    { from: '2026-07-01', to: '2026-07-03' },
    { from: '2026-08-01', to: '2026-08-05' },
  ]);
});

test('prazan, ali validan kalendar daje praznu listu', () => {
  assert.deepEqual(parseBookingIcs(cal()), []);
});

test('nevalidan sadržaj baca grešku (HTML stranica, prazan odgovor, prekinut kalendar)', () => {
  assert.throws(() => parseBookingIcs('<html><body>Forbidden</body></html>'), /VCALENDAR/);
  assert.throws(() => parseBookingIcs(''), /VCALENDAR/);
  assert.throws(() => parseBookingIcs(undefined), /VCALENDAR/);
  assert.throws(() => parseBookingIcs('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20260710\r\n'), /VCALENDAR/);
});

test('rezultat ne zavisi od vremenske zone procesa (DATE vrijednosti)', () => {
  const code = `
    import { parseBookingIcs } from './scripts/lib/booking-ical.mjs';
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:1','DTSTART;VALUE=DATE:20260729','DTEND;VALUE=DATE:20260803','END:VEVENT','BEGIN:VEVENT','UID:2','DTSTART:20260710T223000Z','DTEND:20260712T100000Z','END:VEVENT','END:VCALENDAR'].join('\\r\\n');
    console.log(JSON.stringify(parseBookingIcs(ics)));`;
  const run = (TZ) => execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, TZ }, cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim();
  const expected = JSON.stringify([
    { from: '2026-07-11', to: '2026-07-12' },
    { from: '2026-07-29', to: '2026-08-03' },
  ]);
  for (const tz of ['UTC', 'America/Los_Angeles', 'Pacific/Auckland', 'Europe/Podgorica']) assert.equal(run(tz), expected, tz);
});

test('ID dokumenta je determinističan, a dokument ima ista polja kao postojeći + source', () => {
  assert.equal(blockId('olive', '2026-07-10', '2026-07-15'), 'booking-ical-olive-2026-07-10-2026-07-15');
  assert.deepEqual(blockDoc('olive', { from: '2026-07-10', to: '2026-07-15' }), {
    apartmentId: 'olive',
    from: '2026-07-10',
    to: '2026-07-15',
    bookingId: 'booking-ical-olive-2026-07-10-2026-07-15',
    source: 'booking',
  });
});

test('apartmani iz content.js odgovaraju feedovima (olive, lavanda, lemoni)', () => {
  assert.deepEqual(apartments.map((a) => a.id).sort(), ['lavanda', 'lemoni', 'olive']);
});

const existingDoc = (id, data) => ({ id, data });
test('plan: briše samo Booking blokove istog apartmana kojih više nema u feedu; ručne i tuđe ne dira', () => {
  const keep = blockDoc('olive', { from: '2026-07-10', to: '2026-07-12' });
  const stale = blockDoc('olive', { from: '2026-08-01', to: '2026-08-03' });
  const otherApt = blockDoc('lemoni', { from: '2026-08-01', to: '2026-08-03' });
  const manual = { apartmentId: 'olive', from: '2026-09-01', to: '2026-09-03', bookingId: 'abc' }; // bez source
  const other = { apartmentId: 'olive', from: '2026-09-05', to: '2026-09-06', bookingId: 'x', source: 'direct' };
  const existing = [
    existingDoc(keep.bookingId, keep),
    existingDoc(stale.bookingId, stale),
    existingDoc(otherApt.bookingId, otherApt),
    existingDoc('abc', manual),
    existingDoc('other', other),
  ];
  const plan = planApartmentSync('olive', [{ from: '2026-07-10', to: '2026-07-12' }, { from: '2026-10-01', to: '2026-10-04' }], existing);
  assert.deepEqual(plan.deletes.map((d) => d.id), [stale.bookingId]);
  assert.deepEqual(plan.upserts.map((u) => u.id), [blockId('olive', '2026-10-01', '2026-10-04')]);
  assert.deepEqual(plan.unchanged.map((u) => u.id), [keep.bookingId]);
});

test('plan: dokument sa source booking čija su polja drugačija se ponovo upisuje', () => {
  const id = blockId('olive', '2026-07-10', '2026-07-12');
  const plan = planApartmentSync('olive', [{ from: '2026-07-10', to: '2026-07-12' }], [existingDoc(id, { apartmentId: 'olive', from: '2026-07-10', to: '2026-07-12', source: 'booking' })]);
  assert.equal(plan.upserts.length, 1);
});

test('poruka greške ne sadrži tajne ni linkove', () => {
  const url = 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=SECRET-TOKEN';
  const msg = safeMessage(new Error(`fetch failed for ${url} (also ${url}x)`), [url]);
  assert.ok(!msg.includes('SECRET-TOKEN') && !msg.includes('http'));
  assert.ok(addDays('2026-07-10', 1) === '2026-07-11');
});
