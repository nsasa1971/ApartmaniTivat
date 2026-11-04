// Booking.com sinhronizacija u adminu: blokovi iz `availability` (source === 'booking') i status iz `meta/bookingSync`.
// Čiste funkcije (bez DOM-a) – testirane u tests/booking-sync-admin.test.mjs.
import { esc } from './ui.js';

export const STALE_AFTER_MIN = 180; // upozorenje ako je prošlo više od 3 sata

/**
 * Blokovi koje treba prikazati. Blok sa Bookinga koji je u cijelosti pokriven ručnom rezervacijom
 * istog apartmana (npr. direktna rezervacija koju je vlasnica blokirala na Bookingu) ne prikazuje se dvaput.
 */
export function visibleBlocks(blocks, bookings) {
  return blocks.filter((k) => !bookings.some((b) => b.apartmentId === k.apartmentId && b.from <= k.from && k.to <= b.to));
}

const millis = (t) => (typeof t?.toMillis === 'function' ? t.toMillis() : t instanceof Date ? t.getTime() : typeof t === 'number' ? t : null);

const ago = (min) => {
  if (min < 1) return 'manje od minut';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return h < 24 ? `${h} h${min % 60 ? ` ${min % 60} min` : ''}` : `${Math.floor(h / 24)} d`;
};

/**
 * @param {object|null} meta  dokument meta/bookingSync (null ako ne postoji)
 * @param {number} nowMs
 * @returns {{level:'none'|'ok'|'warn', text:string, detail:string}}
 */
export function syncStatus(meta, nowMs, apartments = []) {
  if (!meta) return { level: 'none', text: '', detail: '' };
  const ok = millis(meta.lastSuccessAt);
  const min = ok == null ? null : Math.max(0, Math.floor((nowMs - ok) / 60000));
  const detail = apartments
    .filter((a) => Number.isInteger(meta.blocks?.[a.id]))
    .map((a) => `${a.naziv}: ${meta.blocks[a.id]}`)
    .join(' · ');
  const stale = min == null || min > STALE_AFTER_MIN;
  if (meta.lastError || stale) {
    const when = min == null ? 'Booking još nije uspješno sinhronizovan.' : `Posljednja uspješna sinhronizacija sa Bookingom: prije ${ago(min)}.`;
    const err = meta.lastError ? ` Greška: ${meta.lastError}` : '';
    return { level: 'warn', text: `${when}${err} Termini sa Bookinga možda nisu ažurni – provjerite kalendar na Bookingu.`, detail };
  }
  return { level: 'ok', text: `Booking sinhronizovan prije ${ago(min)}`, detail };
}

export function renderSyncStatus(status) {
  if (status.level === 'none') return '';
  const detail = status.detail ? `<span class="block text-xs opacity-80">Blokova sa Bookinga – ${esc(status.detail)}</span>` : '';
  return status.level === 'warn'
    ? `<p class="bg-red-50 px-4 py-3 font-sans text-sm font-bold text-red-800" role="alert">${esc(status.text)}${detail}</p>`
    : `<p class="px-4 py-2 font-sans text-sm text-body">${esc(status.text)}${detail}</p>`;
}

/** Oblik za provjeru preklapanja u formi rezervacije (guestName se prikazuje u poruci o preklapanju). */
export const blocksAsRanges = (blocks) => blocks.map((k) => ({ id: k.id, apartmentId: k.apartmentId, from: k.from, to: k.to, guestName: 'Booking (sinhronizovano)' }));
