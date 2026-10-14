import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateLong, nightsLabel, formatRange, overlaps, findConflicts, addDays, nightsBetween, monthGrid, bookedDaySet, isRangeFree, isAnyFree, shiftMonth, isValidISO, formatDate } from '../assets/js/availability.js';

test('dan odlaska je slobodan za novi dolazak', () => {
  assert.equal(overlaps('2030-07-15', '2030-07-18', '2030-07-10', '2030-07-15'), false);
  assert.equal(overlaps('2030-07-14', '2030-07-18', '2030-07-10', '2030-07-15'), true);
});

test('preklapanje i izuzimanje sopstvene rezervacije', () => {
  const r = [{ id: 'a', from: '2030-07-10', to: '2030-07-15' }, { id: 'b', from: '2030-07-20', to: '2030-07-22' }];
  assert.deepEqual(findConflicts(r, '2030-07-12', '2030-07-21').map((x) => x.id), ['a', 'b']);
  assert.deepEqual(findConflicts(r, '2030-07-12', '2030-07-21', 'a').map((x) => x.id), ['b']);
  assert.deepEqual(findConflicts(r, '2030-07-15', '2030-07-20'), []);
});

test('datumi: addDays preko granice mjeseca i godine, noći, validacija', () => {
  assert.equal(addDays('2030-12-31', 1), '2031-01-01');
  assert.equal(addDays('2030-03-01', -1), '2030-02-28');
  assert.equal(nightsBetween('2030-07-10', '2030-07-15'), 5);
  assert.equal(isValidISO('2030-02-30'), false);
  assert.equal(isValidISO('2030-02-28'), true);
  assert.equal(formatDate('2030-07-05'), '05.07.2030.');
});

test('monthGrid: ponedjeljak prvi, 7 kolona', () => {
  const w = monthGrid(2030, 6); // jul 2030 počinje u ponedjeljak
  assert.equal(w[0][0], '2030-07-01');
  assert.ok(w.every((x) => x.length === 7));
  assert.equal(w.flat().filter(Boolean).length, 31);
  assert.equal(monthGrid(2030, 7)[0].filter((x) => x === null).length, 3); // avgust 2030 počinje u petak
});

test('bookedDaySet isključuje dan odlaska; isRangeFree/isAnyFree', () => {
  const set = bookedDaySet([{ from: '2030-07-10', to: '2030-07-12' }]);
  assert.deepEqual([...set], ['2030-07-10', '2030-07-11']);
  const map = new Map([['olive', [{ from: '2030-07-10', to: '2030-07-15' }]], ['lavanda', []]]);
  assert.equal(isRangeFree(map, 'olive', '2030-07-12', '2030-07-13'), false);
  assert.equal(isRangeFree(map, 'lemoni', '2030-07-12', '2030-07-13'), true);
  assert.equal(isAnyFree(map, ['olive'], '2030-07-12', '2030-07-13'), false);
  assert.equal(isAnyFree(map, ['olive', 'lavanda'], '2030-07-12', '2030-07-13'), true);
});

test('shiftMonth', () => {
  assert.deepEqual(shiftMonth({ y: 2030, m: 11 }, 1), { y: 2031, m: 0 });
  assert.deepEqual(shiftMonth({ y: 2030, m: 0 }, -1), { y: 2029, m: 11 });
});

test('dan odlaska: rezervacija 12.–16. ne blokira 16. za dolazak, 17. je slobodan', () => {
  const booking = [{ id: 'b', from: '2030-07-12', to: '2030-07-16' }];
  const days = bookedDaySet(booking);
  assert.deepEqual([...days], ['2030-07-12', '2030-07-13', '2030-07-14', '2030-07-15']);
  assert.equal(days.has('2030-07-16'), false); // dan odlaska nije zauzet
  assert.equal(days.has('2030-07-17'), false);
  // novi dolazak 16. je dozvoljen
  assert.deepEqual(findConflicts(booking, '2030-07-16', '2030-07-18'), []);
  assert.equal(isRangeFree(new Map([['olive', booking]]), 'olive', '2030-07-16', '2030-07-18'), true);
  // dolazak 15. nije dozvoljen (noć 15. je zauzeta)
  assert.equal(findConflicts(booking, '2030-07-15', '2030-07-17').length, 1);
  assert.equal(isRangeFree(new Map([['olive', booking]]), 'olive', '2030-07-15', '2030-07-17'), false);
  // i obrnuto: odlazak na dan dolaska sljedeće rezervacije je u redu
  assert.deepEqual(findConflicts(booking, '2030-07-10', '2030-07-12'), []);
});

test('datum riječima i noćenja', () => {
  assert.equal(formatDateLong('2026-11-05'), '5. nov 2026.');
  assert.equal(formatRange('2026-11-05', '2026-11-09'), '5. nov 2026. – 9. nov 2026., 4 noćenja');
  assert.equal(formatRange('2026-11-05', '2026-11-06'), '5. nov 2026. – 6. nov 2026., 1 noćenje');
  assert.equal(formatRange('2026-11-09', '2026-11-05'), '');
  assert.equal(formatRange('', '2026-11-05'), '');
  assert.deepEqual([1, 2, 5, 11, 21, 22, 25].map(nightsLabel), ['1 noćenje', '2 noćenja', '5 noćenja', '11 noćenja', '21 noćenje', '22 noćenja', '25 noćenja']);
});
