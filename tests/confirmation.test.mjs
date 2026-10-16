import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConfirmation, guessLang } from '../admin/js/confirmation.js';

const b = { guestName: 'Ivan Petrović', apartmentName: 'Lavande', from: '2030-07-15', to: '2030-07-18', guests: 3, price: 360 };

test('potvrda: sadrži sve podatke na sva tri jezika', () => {
  for (const lang of ['sr', 'en', 'ru']) {
    const { subject, body } = buildConfirmation(lang, b);
    assert.ok(subject.includes('Tivat Garden Homes'), lang);
    for (const s of ['Ivan Petrović', 'Lavande', '14:00', '10:00', '360 €', 'Bonići', 'baukbiljana@gmail.com', 'maps.app.goo.gl']) assert.ok(body.includes(s), `${lang}: ${s}`);
  }
  assert.match(buildConfirmation('sr', b).body, /3 noći/);
  assert.match(buildConfirmation('en', b).body, /3 nights/);
  assert.match(buildConfirmation('ru', b).body, /3 ночи/);
  assert.match(buildConfirmation('sr', { ...b, to: '2030-07-16' }).body, /1 noć(\n|$)/);
  assert.match(buildConfirmation('sr', { ...b, to: '2030-07-20' }).body, /5 noći/);
  assert.match(buildConfirmation('sr', b).body, /ponedjeljak, 15\. jul 2030\./); // ijekavica
  assert.ok(!/ponedeljak/.test(buildConfirmation('sr', b).body));
});

test('potvrda: cijena se ne ispisuje ako nije unijeta', () => {
  assert.ok(!buildConfirmation('sr', { ...b, price: null }).body.includes('Cijena'));
  assert.ok(!buildConfirmation('en', { ...b, price: '' }).body.includes('Price'));
});

test('jezik gosta se pretpostavlja po pozivnom broju', () => {
  assert.equal(guessLang('+7 912 345 67 89'), 'ru');
  assert.equal(guessLang('+382 69 123 456'), 'sr');
  assert.equal(guessLang('0038169123456'), 'sr');
  assert.equal(guessLang('+44 7700 900123'), 'en');
  assert.equal(guessLang('069123456'), 'sr');
  assert.equal(guessLang(''), 'sr');
});
