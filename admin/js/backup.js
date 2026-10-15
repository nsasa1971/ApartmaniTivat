// Rezervna kopija: izvoz svih rezervacija u JSON i CSV.
const iso = (ts) => ts?.toDate?.()?.toISOString?.() ?? '';

const COLUMNS = ['id', 'apartmentId', 'guestName', 'phone', 'email', 'from', 'to', 'guests', 'source', 'price', 'note', 'blockedOnBooking', 'createdAt'];

const normalize = (b) => ({ ...Object.fromEntries(COLUMNS.map((k) => [k, b[k] ?? ''])), createdAt: iso(b.createdAt) });

/** CSV ćelija: navodnici + zaštita od "CSV injection" (=, +, -, @ na početku). */
const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const toJSON = (bookings) =>
  JSON.stringify({ exportedAt: new Date().toISOString(), count: bookings.length, bookings: bookings.map(normalize) }, null, 2);

export const toCSV = (bookings) =>
  '﻿' + [COLUMNS.join(','), ...bookings.map((b) => COLUMNS.map((k) => cell(normalize(b)[k])).join(','))].join('\r\n');

export function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const stamp = () => new Date().toISOString().slice(0, 10);
