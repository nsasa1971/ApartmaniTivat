import test from 'node:test';
import assert from 'node:assert/strict';
import { overlaps, findConflicts, addDays, nightsBetween, monthGrid, bookedDaySet, isRangeFree, isAnyFree, shiftMonth, isValidISO, formatDate } from '../assets/js/availability.js';

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
