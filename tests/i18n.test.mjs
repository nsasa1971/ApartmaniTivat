import test from 'node:test';
import assert from 'node:assert/strict';
import { i18n, languages, setLang, t } from '../assets/js/i18n.js';
import { localizedContent, translations } from '../assets/js/content.i18n.js';
import * as base from '../assets/js/content.js';
import { nightsLabel, formatRange } from '../assets/js/availability.js';

test('svaki ključ interfejsa postoji i nije prazan na svim jezicima', () => {
  const keys = Object.keys(i18n.sr);
  for (const { code } of languages) {
    assert.deepEqual(Object.keys(i18n[code]), keys, code);
    for (const k of keys) assert.ok(String(i18n[code][k]).trim(), `${code}:${k}`);
  }
});

test('prevodi sadržaja imaju iste liste kao osnovni sadržaj', () => {
  for (const lang of Object.keys(translations)) {
    const c = localizedContent(lang);
    assert.equal(c.apartments.length, base.apartments.length);
    c.apartments.forEach((a, i) => assert.equal(a.features.length, base.apartments[i].features.length, `${lang} apartman ${i} features`));
    assert.equal(c.beaches.items.length, base.beaches.items.length);
    assert.equal(c.pricing.items.length, base.pricing.items.length);
    assert.equal(c.pricing.discounts.length, base.pricing.discounts.length);
    const { sights, food } = base.extraSections;
    assert.equal(c.extraSections.sights.items.length, sights.items.length);
    assert.equal(c.extraSections.food.items.length, food.items.length);
    c.extraSections.sights.items.forEach((s, i) => assert.equal(s.highlights.length, sights.items[i].highlights.length, `${lang} sight ${i}`));
    // cijene i slike se ne prevode
    assert.equal(c.pricing.items[0].price, base.pricing.items[0].price);
    assert.equal(c.beaches.items[0].image.src, base.beaches.items[0].image.src);
  }
});

test('srpski ostaje osnovni sadržaj', () => {
  assert.equal(localizedContent('sr').hero.title, base.hero.title);
  assert.equal(localizedContent('xx').hero.text, base.hero.text);
});

test('datumi i noćenja prate jezik', () => {
  setLang('en');
  assert.equal(formatRange('2026-11-05', '2026-11-09'), 'Nov 5, 2026 – Nov 9, 2026, 4 nights');
  setLang('ru');
  assert.deepEqual([1, 2, 5, 11, 21, 22, 25].map(nightsLabel), ['1 ночь', '2 ночи', '5 ночей', '11 ночей', '21 ночь', '22 ночи', '25 ночей']);
  assert.equal(t('m.guests', { min: 1, max: 8 }), 'Общее число гостей должно быть от 1 до 8.');
  setLang('sr');
  assert.equal(nightsLabel(21), '21 noćenje');
});
