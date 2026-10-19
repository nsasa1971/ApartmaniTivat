import test from 'node:test';
import assert from 'node:assert/strict';
import { nightPrice, estimateStay, monthWindow } from '../assets/js/pricing.js';
import { rates, apartments, pricing } from '../assets/js/content.js';

test('cijene dolaze iz content.js, a prikaz u sekciji "Cijene" se slaže sa njima', () => {
  assert.equal(rates.base, 100);
  assert.deepEqual(pricing.items.map((i) => i.price), ['100 €', '120 €', '120 €']);
  assert.ok(apartments.every((a) => Number.isInteger(a.capacity) && a.capacity >= 2));
});

test('sezona po noćenju: granice (oba datuma uključena) i nova godina', () => {
  assert.equal(nightPrice('2030-05-31', rates), 100);
  assert.equal(nightPrice('2030-06-01', rates), 120);
  assert.equal(nightPrice('2030-09-01', rates), 120);
  assert.equal(nightPrice('2030-09-02', rates), 100);
  assert.equal(nightPrice('2030-12-30', rates), 100);
  assert.equal(nightPrice('2030-12-31', rates), 120);
  assert.equal(nightPrice('2031-01-01', rates), 120);
  assert.equal(nightPrice('2031-01-02', rates), 120);
  assert.equal(nightPrice('2031-01-03', rates), 100);
});

test('procjena boravka: van sezone, preko granice sezone, nova godina', () => {
  const a = estimateStay('2030-10-01', '2030-10-13', rates);
  assert.deepEqual([a.nights, a.total, a.average, a.mixed, a.longStay], [12, 1200, 100, false, true]);
  const b = estimateStay('2030-05-28', '2030-06-03', rates); // noći 28, 29, 30, 31.5. (100) i 1, 2.6. (120)
  assert.deepEqual([b.nights, b.total, b.mixed, b.longStay], [6, 640, true, false]);
  assert.ok(Math.abs(b.average - 640 / 6) < 1e-9);
  const c = estimateStay('2030-12-30', '2031-01-03', rates); // 100 + 120 + 120 + 120
  assert.deepEqual([c.nights, c.total, c.mixed], [4, 460, true]);
  const d = estimateStay('2030-08-31', '2030-09-02', rates); // noći 31.8. i 1.9. (oba 120)
  assert.deepEqual([d.total, d.mixed], [240, false]);
  assert.equal(estimateStay('2030-07-10', '2030-07-19', rates).longStay, false); // 9 noćenja
  assert.equal(estimateStay('2030-07-10', '2030-07-20', rates).longStay, true); // 10 noćenja
});

test('prozor mjeseci: od mjeseca dolaska, najmanje 2, najviše 3', () => {
  assert.deepEqual(monthWindow('2030-07-15', '2030-07-18'), { y: 2030, m: 6, count: 2 });
  assert.deepEqual(monthWindow('2030-07-25', '2030-08-03'), { y: 2030, m: 6, count: 2 });
  assert.deepEqual(monthWindow('2030-07-25', '2030-09-03'), { y: 2030, m: 6, count: 3 });
  assert.deepEqual(monthWindow('2030-07-01', '2030-12-03'), { y: 2030, m: 6, count: 3 });
  assert.deepEqual(monthWindow('2030-12-20', '2031-01-05'), { y: 2030, m: 11, count: 2 });
});
