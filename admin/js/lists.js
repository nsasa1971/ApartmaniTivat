// Liste: nadolazeće rezervacije i sanduče upita (HTML; događaje obrađuje app.js).
import { addDays, formatDateLong, nightsLabel, nightsBetween } from '../../assets/js/availability.js';
import { SOURCES } from './apartments.js';
import { esc } from './ui.js';

const aptName = (apartments, id) => apartments.find((a) => a.id === id)?.naziv ?? id;
const digits = (v) => String(v ?? '').replace(/[^\d]/g, '');

const bookingCard = (b, apartments) => {
  const s = SOURCES[b.source] ?? SOURCES.other;
  const warn = b.source === 'direct' && !b.blockedOnBooking;
  return `
    <li class="border border-line bg-white">
      <button type="button" data-booking="${esc(b.id)}" class="block w-full p-4 text-left">
        <span class="flex items-start justify-between gap-3">
          <span class="font-display text-[20px] leading-7">${esc(b.guestName)}</span>
          <span class="shrink-0 px-2 py-0.5 font-sans text-xs font-bold ${s.cls}">${s.label}</span>
        </span>
        <span class="mt-1 block font-sans text-sm">${esc(aptName(apartments, b.apartmentId))}</span>
        <span class="block font-sans text-base font-bold">${formatDateLong(b.from)} – ${formatDateLong(b.to)} <span class="font-normal">(${nightsLabel(nightsBetween(b.from, b.to))}, ${b.guests} gost.)</span></span>
        ${warn ? '<span class="mt-2 inline-block bg-red-600 px-2 py-0.5 font-sans text-xs font-bold text-white">Nije blokirano na Bookingu</span>' : ''}
      </button>
      ${warn ? `<div class="border-t border-line px-4 pb-3 pt-2"><button type="button" data-block="${esc(b.id)}" class="min-h-11 w-full bg-[#053133] px-4 font-sans text-sm font-bold text-white">Označi kao blokirano na Bookingu</button></div>` : ''}
    </li>`;
};

export function renderBookings({ bookings, apartments, today, search }) {
  const q = search.trim().toLowerCase();
  const list = bookings.filter((b) => !q || (b.guestName ?? '').toLowerCase().includes(q));
  const in30 = addDays(today, 30);
  const asc = (a, b) => a.from.localeCompare(b.from) || a.guestName.localeCompare(b.guestName);
  const current = list.filter((b) => b.from <= today && today < b.to).sort(asc);
  const soon = list.filter((b) => b.from > today && b.from <= in30).sort(asc);
  const later = list.filter((b) => b.from > in30).sort(asc);
  const past = list.filter((b) => b.to <= today).sort((a, b) => b.from.localeCompare(a.from));
  const group = (title, items, open = true) =>
    items.length
      ? `<section class="mt-6"><h2 class="mb-2 font-display text-[20px]">${title} <span class="font-sans text-sm text-body">(${items.length})</span></h2>
         <ul class="grid gap-3">${items.map((b) => bookingCard(b, apartments)).join('')}</ul></section>`
      : '';
  const pastHtml = past.length
    ? `<details class="mt-6"><summary class="min-h-11 cursor-pointer py-2 font-display text-[20px]">Prošle rezervacije <span class="font-sans text-sm text-body">(${past.length})</span></summary>
       <ul class="mt-2 grid gap-3">${past.map((b) => bookingCard(b, apartments)).join('')}</ul></details>`
    : '';
  const empty = !list.length ? `<p class="mt-6 font-sans text-base text-body">${q ? 'Nema rezervacija za ovu pretragu.' : 'Još nema rezervacija. Dodajte prvu preko kalendara ili dugmeta „Nova rezervacija“.'}</p>` : '';
  return `
    <div class="flex flex-col gap-3 sm:flex-row">
      <label class="sr-only" for="search">Pretraga po imenu gosta</label>
      <input id="search" type="search" value="${esc(search)}" placeholder="Pretraga po imenu gosta" class="min-h-12 flex-1 border border-midtone px-3 font-sans text-base focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E878C]">
      <button type="button" data-new class="min-h-12 bg-ink px-6 font-sans text-base font-bold uppercase text-white">Nova rezervacija</button>
    </div>
    ${group('Trenutno u objektu', current)}
    ${group('Dolasci u narednih 30 dana', soon)}
    ${group('Kasnije', later)}
    ${pastHtml}${empty}`;
}

const tsLabel = (ts) => {
  const d = ts?.toDate?.();
  return d ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : 'upravo sada';
};

const STATUS = { new: ['Novi', 'bg-red-600 text-white'], accepted: ['Prihvaćen', 'bg-[#053133] text-white'], declined: ['Odbijen', 'bg-midtone text-ink'] };

const inquiryCard = (q, apartments) => {
  const [label, cls] = STATUS[q.status] ?? STATUS.new;
  const contact = `
    <div class="mt-3 flex flex-wrap gap-2">
      ${q.phone ? `<a href="tel:${esc(String(q.phone).replace(/[^\d+]/g, ''))}" class="flex min-h-11 items-center border border-ink px-4 font-sans text-sm font-bold">Pozovi</a>
      <a href="https://wa.me/${digits(q.phone)}" target="_blank" rel="noopener" class="flex min-h-11 items-center border border-ink px-4 font-sans text-sm font-bold">WhatsApp</a>` : ''}
      <a href="mailto:${esc(q.email)}" class="flex min-h-11 items-center border border-ink px-4 font-sans text-sm font-bold">Email</a>
    </div>`;
  const actions =
    q.status === 'new'
      ? `<div class="mt-3 grid grid-cols-2 gap-2">
           <button type="button" data-accept="${esc(q.id)}" class="min-h-12 bg-ink px-4 font-sans text-base font-bold text-white">Prihvati</button>
           <button type="button" data-decline="${esc(q.id)}" class="min-h-12 border border-ink px-4 font-sans text-base font-bold">Odbij</button>
         </div>`
      : '';
  return `
    <li class="border border-line bg-white p-4">
      <div class="flex items-start justify-between gap-3">
        <span class="font-display text-[20px] leading-7">${esc(q.guestName)}</span>
        <span class="shrink-0 px-2 py-0.5 font-sans text-xs font-bold ${cls}">${label}</span>
      </div>
      <p class="font-sans text-sm text-body">${tsLabel(q.createdAt)}</p>
      <p class="mt-1 font-sans text-base font-bold">${formatDateLong(q.from)} – ${formatDateLong(q.to)} <span class="font-normal">(${nightsLabel(nightsBetween(q.from, q.to))}, ${q.guests} gost.)</span></p>
      <p class="font-sans text-sm">${q.apartmentId ? esc(aptName(apartments, q.apartmentId)) : 'Bez preferencije apartmana'}</p>
      <p class="font-sans text-sm">${esc(q.email)}${q.phone ? ' · ' + esc(q.phone) : ''}${q.messengers ? ' · ' + esc(q.messengers) : ''}</p>
      ${q.message ? `<p class="mt-2 whitespace-pre-line border-l-4 border-line pl-3 font-sans text-sm">${esc(q.message)}</p>` : ''}
      ${contact}${actions}
    </li>`;
};

export const newInquiryCount = (inquiries) => inquiries.filter((q) => q.status === 'new').length;

export function renderInquiries({ inquiries, apartments }) {
  const fresh = inquiries.filter((q) => q.status === 'new');
  const done = inquiries.filter((q) => q.status !== 'new');
  if (!inquiries.length) return '<p class="font-sans text-base text-body">Još nema upita sa sajta.</p>';
  return `
    ${fresh.length ? `<h2 class="mb-2 font-display text-[20px]">Novi upiti <span class="font-sans text-sm text-body">(${fresh.length})</span></h2><ul class="grid gap-3">${fresh.map((q) => inquiryCard(q, apartments)).join('')}</ul>` : '<p class="font-sans text-base text-body">Nema novih upita.</p>'}
    ${done.length ? `<h2 class="mb-2 mt-8 font-display text-[20px]">Obrađeni upiti <span class="font-sans text-sm text-body">(${done.length})</span></h2><ul class="grid gap-3">${done.map((q) => inquiryCard(q, apartments)).join('')}</ul>` : ''}`;
}
