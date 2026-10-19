// ============================================================
//  Okvirna cijena boravka. Cijene i sezone dolaze ISKLJUČIVO iz `rates` u content.js.
//  Računa se po noćenju: svaka noć ima cijenu svoje sezone (noć = datum dolaska do dana prije odlaska).
// ============================================================
import { addDays, nightsBetween } from './availability.js';

/** Da li je MM-DD u periodu (oba kraja uključena; period može preći preko nove godine). */
const inPeriod = (md, from, to) => (from <= to ? md >= from && md <= to : md >= from || md <= to);

/** Cijena noći koja počinje datumom `iso` ('YYYY-MM-DD'). */
export function nightPrice(iso, rates) {
  const md = iso.slice(5);
  const season = rates.seasons.find((s) => inPeriod(md, s.from, s.to));
  return season ? season.price : rates.base;
}

/**
 * @returns {{ nights: number, total: number, average: number, prices: number[], mixed: boolean, longStay: boolean }}
 * `mixed` = boravak obuhvata noćenja po različitim cijenama (granica sezone).
 */
export function estimateStay(from, to, rates) {
  const nights = nightsBetween(from, to);
  let total = 0;
  const prices = new Set();
  for (let d = from, i = 0; i < nights; d = addDays(d, 1), i++) {
    const p = nightPrice(d, rates);
    total += p;
    prices.add(p);
  }
  return {
    nights,
    total,
    average: nights ? total / nights : 0,
    prices: [...prices].sort((a, b) => a - b),
    mixed: prices.size > 1,
    longStay: nights >= rates.discountNoticeNights,
  };
}

/** Mjeseci koje kalendar prikazuje za pretragu: od mjeseca dolaska do mjeseca odlaska, najmanje 2, najviše 3. */
export function monthWindow(from, to) {
  const y = Number(from.slice(0, 4));
  const m = Number(from.slice(5, 7)) - 1;
  const span = (Number(to.slice(0, 4)) - y) * 12 + (Number(to.slice(5, 7)) - 1 - m) + 1;
  return { y, m, count: Math.max(2, Math.min(3, span)) };
}
