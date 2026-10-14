// Mjesečni kalendar (po apartmanu). Vraća HTML; klikove obrađuje app.js (delegacija).
import { WEEKDAYS, monthGrid, monthLabel } from '../../assets/js/availability.js';
import { SOURCES } from './apartments.js';
import { esc } from './ui.js';

export function renderCalendar({ apartments, bookings, aptId, month, today }) {
  const mine = bookings.filter((b) => b.apartmentId === aptId);
  const findBooking = (iso) => mine.find((b) => b.from <= iso && iso < b.to);

  const tabs = apartments
    .map(
      (a) => `<button type="button" data-apt="${esc(a.id)}" aria-pressed="${a.id === aptId}"
        class="min-h-12 flex-1 border border-ink px-2 font-sans text-sm font-bold aria-pressed:bg-ink aria-pressed:text-white">${esc(a.naziv)}</button>`
    )
    .join('');

  const cells = monthGrid(month.y, month.m)
    .flat()
    .map((iso) => {
      if (!iso) return '<div></div>';
      const b = findBooking(iso);
      const day = Number(iso.slice(8));
      const isToday = iso === today;
      const ring = isToday ? ' ring-2 ring-inset ring-[#0E878C]' : '';
      if (!b) {
        return `<button type="button" data-day="${iso}" aria-label="${day}. slobodno, dodaj rezervaciju"
          class="flex aspect-square min-h-11 items-center justify-center border border-line bg-white font-sans text-base text-ink${ring}">${day}</button>`;
      }
      const s = SOURCES[b.source] ?? SOURCES.other;
      const warn = b.source === 'direct' && !b.blockedOnBooking;
      return `<button type="button" data-booking="${esc(b.id)}" aria-label="${day}. zauzeto: ${esc(b.guestName)} (${s.label})${warn ? ', nije blokirano na Bookingu' : ''}"
        class="relative flex aspect-square min-h-11 flex-col items-center justify-center font-sans text-base font-bold ${s.cls}${ring}">
        <span>${day}</span><span class="text-[10px] font-normal leading-none" aria-hidden="true">${s.letter}</span>
        ${warn ? '<span class="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white" aria-hidden="true">!</span>' : ''}
      </button>`;
    })
    .join('');

  const legend = Object.values(SOURCES)
    .map((s) => `<span class="inline-flex items-center gap-1"><span class="inline-block h-4 w-4 ${s.cls}"></span>${s.label}</span>`)
    .join('');

  return `
    <div class="flex gap-2" role="group" aria-label="Apartman">${tabs}</div>
    <div class="mt-4 flex items-center justify-between">
      <button type="button" data-month="-1" aria-label="Prethodni mjesec" class="h-12 w-12 border border-ink text-2xl">‹</button>
      <h2 class="font-display text-[22px] capitalize" aria-live="polite">${monthLabel(month.y, month.m)}</h2>
      <button type="button" data-month="1" aria-label="Sljedeći mjesec" class="h-12 w-12 border border-ink text-2xl">›</button>
    </div>
    <div class="mt-3 grid grid-cols-7 gap-px text-center font-sans text-xs font-bold text-body" aria-hidden="true">${WEEKDAYS.map((d) => `<div>${d}</div>`).join('')}</div>
    <div class="mt-1 grid grid-cols-7 gap-px bg-line">${cells}</div>
    <p class="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm">${legend}<span class="inline-flex items-center gap-1"><span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">!</span>Nije blokirano na Bookingu</span></p>
    <p class="mt-1 font-sans text-sm text-body">Dodirnite slobodan dan za novu rezervaciju, a zauzet dan za izmjenu ili brisanje.</p>`;
}
