// Testovi pomoćnih funkcija za prikaz Booking sinhronizacije u adminu.
import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleBlocks, syncStatus, renderSyncStatus, blocksAsRanges, STALE_AFTER_MIN } from '../admin/js/booking-sync.js';

const apartments = [
  { id: 'olive', naziv: 'Olive' },
  { id: 'lemoni', naziv: 'Lemoni' },
];
const NOW = Date.parse('2026-07-01T12:00:00Z');
const at = (minAgo) => ({ toMillis: () => NOW - minAgo * 60000 });

test('blok pokriven ručnom rezervacijom istog apartmana se ne prikazuje dvaput', () => {
  const blocks = [
    { id: 'b1', apartmentId: 'olive', from: '2026-07-10', to: '2026-07-15' }, // isti period kao ručna
    { id: 'b2', apartmentId: 'olive', from: '2026-07-20', to: '2026-07-25' }, // nema ručne
    { id: 'b3', apartmentId: 'lemoni', from: '2026-07-10', to: '2026-07-15' }, // drugi apartman
    { id: 'b4', apartmentId: 'olive', from: '2026-08-01', to: '2026-08-06' }, // samo djelimično preklapanje
  ];
  const bookings = [
    { id: 'm1', apartmentId: 'olive', from: '2026-07-10', to: '2026-07-15' },
    { id: 'm2', apartmentId: 'olive', from: '2026-08-03', to: '2026-08-10' },
  ];
  assert.deepEqual(visibleBlocks(blocks, bookings).map((k) => k.id), ['b2', 'b3', 'b4']);
  assert.deepEqual(visibleBlocks(blocks, []).map((k) => k.id), ['b1', 'b2', 'b3', 'b4']);
});

test('status: bez dokumenta ništa se ne prikazuje', () => {
  assert.equal(syncStatus(null, NOW).level, 'none');
  assert.equal(renderSyncStatus(syncStatus(null, NOW)), '');
});

test('status: uspješna sinhronizacija prije X min, sa brojem blokova po apartmanu', () => {
  const s = syncStatus({ lastSuccessAt: at(12), lastError: null, blocks: { olive: 3, lemoni: 0 } }, NOW, apartments);
  assert.equal(s.level, 'ok');
  assert.equal(s.text, 'Booking sinhronizovan prije 12 min');
  assert.equal(s.detail, 'Olive: 3 · Lemoni: 0');
  assert.equal(syncStatus({ lastSuccessAt: at(0), lastError: null }, NOW).text, 'Booking sinhronizovan prije manje od minut');
  assert.equal(syncStatus({ lastSuccessAt: at(125), lastError: null }, NOW).text, 'Booking sinhronizovan prije 2 h 5 min');
});

test('status: upozorenje ako je prošlo više od 3 sata ili postoji greška', () => {
  assert.equal(syncStatus({ lastSuccessAt: at(STALE_AFTER_MIN), lastError: null }, NOW).level, 'ok');
  const stale = syncStatus({ lastSuccessAt: at(STALE_AFTER_MIN + 1), lastError: null }, NOW);
  assert.equal(stale.level, 'warn');
  assert.match(stale.text, /prije 3 h 1 min/);
  const err = syncStatus({ lastSuccessAt: at(5), lastError: 'olive: Preuzimanje nije uspjelo (HTTP 403).' }, NOW);
  assert.equal(err.level, 'warn');
  assert.match(err.text, /HTTP 403/);
  assert.equal(syncStatus({ lastError: null }, NOW).level, 'warn'); // nikad uspješno
});

test('prikaz statusa escapuje tekst', () => {
  const html = renderSyncStatus(syncStatus({ lastSuccessAt: at(1), lastError: '<img src=x onerror=alert(1)>' }, NOW));
  assert.ok(!html.includes('<img'));
  assert.match(html, /role="alert"/);
});

test('blokovi za provjeru preklapanja imaju čitljiv naziv', () => {
  assert.deepEqual(blocksAsRanges([{ id: 'b1', apartmentId: 'olive', from: '2026-07-10', to: '2026-07-12', source: 'booking' }]), [
    { id: 'b1', apartmentId: 'olive', from: '2026-07-10', to: '2026-07-12', guestName: 'Booking (sinhronizovano)' },
  ]);
});
