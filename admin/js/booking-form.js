// Forma rezervacije (nova / izmjena / prihvatanje upita) sa validacijom.
import { findConflicts, formatDate, addDays, nightsBetween, isValidISO } from '../../assets/js/availability.js';
import { SOURCES } from './apartments.js';
import { $, esc, openDialog } from './ui.js';

/**
 * @param {object} o
 * @param {object|null} o.booking     postojeća rezervacija (izmjena)
 * @param {object} o.prefill          početne vrijednosti (nova rezervacija / prihvaćen upit)
 * @param {object[]} o.apartments
 * @param {object[]} o.bookings       sve rezervacije (provjera preklapanja)
 * @param {(data:object)=>Promise<void>} o.onSave
 * @param {(()=>void)|null} o.onDelete
 */
export function openBookingForm({ booking = null, prefill = {}, apartments, bookings, onSave, onDelete = null, title }) {
  const v = { source: 'direct', guests: 2, blockedOnBooking: false, ...prefill, ...(booking ?? {}) };
  const opt = (value, label, sel) => `<option value="${esc(value)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
  const inputCls = 'min-h-12 w-full border border-midtone bg-white px-3 py-2 font-sans text-base text-ink focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E878C] aria-[invalid=true]:border-red-600';
  const field = (id, label, control) => `
    <div>
      <label for="${id}" class="mb-1 block font-sans text-sm font-bold">${label}</label>
      ${control}
      <p id="${id}-err" class="hidden pt-1 font-sans text-sm text-red-700" role="alert"></p>
    </div>`;

  const { dlg, close } = openDialog(`
    <form id="bf" novalidate class="max-h-[90vh] overflow-y-auto p-5">
      <div class="mb-4 flex items-start justify-between gap-4">
        <h2 class="font-display text-[24px] leading-8">${esc(title ?? (booking ? 'Izmjena rezervacije' : 'Nova rezervacija'))}</h2>
        <button type="button" data-close class="h-11 w-11 shrink-0 text-3xl leading-none" aria-label="Zatvori">×</button>
      </div>
      <div class="grid gap-4">
        ${field('bf-apt', 'Apartman *', `<select id="bf-apt" name="apartmentId" class="${inputCls}">
          <option value="">— izaberite apartman —</option>
          ${apartments.map((a) => opt(a.id, a.naziv, a.id === v.apartmentId)).join('')}</select>`)}
        <div class="grid grid-cols-2 gap-3">
          ${field('bf-from', 'Dolazak *', `<input id="bf-from" name="from" type="date" value="${esc(v.from ?? '')}" class="${inputCls}">`)}
          ${field('bf-to', 'Odlazak *', `<input id="bf-to" name="to" type="date" value="${esc(v.to ?? '')}" class="${inputCls}">`)}
        </div>
        <p id="bf-info" class="-mt-2 font-sans text-sm text-body"></p>
        <p id="bf-conflict" class="hidden border-l-4 border-red-600 bg-red-50 p-3 font-sans text-sm text-red-800" role="alert"></p>
        ${field('bf-name', 'Ime i prezime gosta *', `<input id="bf-name" name="guestName" type="text" autocomplete="off" value="${esc(v.guestName ?? '')}" class="${inputCls}">`)}
        ${field('bf-guests', 'Broj gostiju *', `<input id="bf-guests" name="guests" type="number" min="1" inputmode="numeric" value="${esc(v.guests)}" class="${inputCls}">`)}
        ${field('bf-phone', 'Telefon', `<input id="bf-phone" name="phone" type="tel" value="${esc(v.phone ?? '')}" class="${inputCls}">`)}
        ${field('bf-email', 'Email', `<input id="bf-email" name="email" type="email" value="${esc(v.email ?? '')}" class="${inputCls}">`)}
        ${field('bf-source', 'Izvor rezervacije *', `<select id="bf-source" name="source" class="${inputCls}">
          ${Object.entries(SOURCES).map(([k, s]) => opt(k, s.label, k === v.source)).join('')}</select>`)}
        <div id="bf-block" class="hidden border-l-4 border-[#0E878C] bg-[#0E878C]/10 p-3">
          <p class="mb-2 font-sans text-sm font-bold text-[#053133]">Podsjetnik: blokirajte ovaj termin na Bookingu.</p>
          <label class="flex min-h-11 items-center gap-3 font-sans text-base">
            <input id="bf-blocked" name="blockedOnBooking" type="checkbox" class="h-6 w-6 accent-ink"${v.blockedOnBooking ? ' checked' : ''}>
            Blokirano na Bookingu
          </label>
        </div>
        ${field('bf-price', 'Cijena (€), opciono', `<input id="bf-price" name="price" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(v.price ?? '')}" class="${inputCls}">`)}
        ${field('bf-note', 'Napomena', `<textarea id="bf-note" name="note" rows="3" class="${inputCls}">${esc(v.note ?? '')}</textarea>`)}
      </div>
      <p id="bf-form-err" class="mt-4 hidden font-sans text-sm text-red-700" role="alert"></p>
      <div class="mt-6 flex flex-col gap-3">
        <button type="submit" id="bf-save" class="min-h-12 bg-ink px-6 font-sans text-base font-bold uppercase text-white disabled:opacity-60">Sačuvaj</button>
        ${onDelete ? '<button type="button" id="bf-del" class="min-h-12 border border-red-700 px-6 font-sans text-base font-bold text-red-700">Obriši rezervaciju</button>' : ''}
        <button type="button" data-close class="min-h-12 border border-ink px-6 font-sans text-base font-bold">Odustani</button>
      </div>
    </form>`);

  const form = $('#bf', dlg);
  const el = form.elements;
  const aptOf = (id) => apartments.find((a) => a.id === id);

  const setErr = (id, text) => {
    const p = $(`#${id}-err`, dlg);
    const input = $(`#${id}`, dlg);
    p.textContent = text || '';
    p.classList.toggle('hidden', !text);
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
  };

  /** Preklapanje sa postojećim rezervacijama istog apartmana (blokira čuvanje). */
  const conflictsNow = () => {
    if (!el.apartmentId.value || !isValidISO(el.from.value) || !isValidISO(el.to.value) || el.to.value <= el.from.value) return [];
    const mine = bookings.filter((b) => b.apartmentId === el.apartmentId.value);
    return findConflicts(mine, el.from.value, el.to.value, booking?.id ?? null);
  };

  const refresh = () => {
    el.from.value && !el.to.value && (el.to.value = addDays(el.from.value, 1));
    const info = $('#bf-info', dlg);
    info.textContent =
      isValidISO(el.from.value) && isValidISO(el.to.value) && el.to.value > el.from.value
        ? `Broj noćenja: ${nightsBetween(el.from.value, el.to.value)}`
        : '';
    const cs = conflictsNow();
    const box = $('#bf-conflict', dlg);
    box.classList.toggle('hidden', !cs.length);
    box.innerHTML = cs.length
      ? `<strong>Termin se preklapa</strong> sa postojećom rezervacijom: ${cs
          .map((c) => `${esc(c.guestName)} (${formatDate(c.from)} – ${formatDate(c.to)})`)
          .join('; ')}. Izaberite druge datume ili prvo izmijenite postojeću rezervaciju.`
      : '';
    $('#bf-block', dlg).classList.toggle('hidden', el.source.value !== 'direct');
  };
  ['apartmentId', 'from', 'to', 'source'].forEach((n) => el[n].addEventListener('change', refresh));
  el.from.addEventListener('change', () => {
    if (isValidISO(el.from.value) && (!el.to.value || el.to.value <= el.from.value)) el.to.value = addDays(el.from.value, 1);
    refresh();
  });
  refresh();

  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  $('#bf-del', dlg)?.addEventListener('click', () => onDelete());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = {};
    const apt = aptOf(el.apartmentId.value);
    if (!apt) err['bf-apt'] = 'Izaberite apartman.';
    if (!el.guestName.value.trim()) err['bf-name'] = 'Unesite ime i prezime gosta.';
    if (!isValidISO(el.from.value)) err['bf-from'] = 'Izaberite datum dolaska.';
    if (!isValidISO(el.to.value)) err['bf-to'] = 'Izaberite datum odlaska.';
    else if (isValidISO(el.from.value) && el.to.value <= el.from.value) err['bf-to'] = 'Datum odlaska mora biti poslije datuma dolaska.';
    const g = Number(el.guests.value);
    if (!Number.isInteger(g) || g < 1) err['bf-guests'] = 'Unesite broj gostiju (najmanje 1).';
    else if (apt && g > apt.kapacitet) err['bf-guests'] = `Kapacitet apartmana je ${apt.kapacitet} gosta.`;
    if (el.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.email.value.trim())) err['bf-email'] = 'Email adresa nije ispravna.';
    if (el.price.value !== '' && !(Number(el.price.value) >= 0)) err['bf-price'] = 'Cijena mora biti broj (0 ili veći).';
    for (const id of ['bf-apt', 'bf-name', 'bf-from', 'bf-to', 'bf-guests', 'bf-email', 'bf-price']) setErr(id, err[id]);
    const conflicts = conflictsNow();
    const first = Object.keys(err)[0];
    if (first) return $(`#${first}`, dlg).focus();
    if (conflicts.length) return $('#bf-conflict', dlg).scrollIntoView({ block: 'center' });

    const btn = $('#bf-save', dlg);
    btn.disabled = true;
    btn.textContent = 'Čuvanje…';
    try {
      await onSave({
        apartmentId: el.apartmentId.value,
        guestName: el.guestName.value.trim(),
        phone: el.phone.value.trim(),
        email: el.email.value.trim(),
        from: el.from.value,
        to: el.to.value,
        guests: g,
        source: el.source.value,
        price: el.price.value,
        note: el.note.value.trim(),
        blockedOnBooking: el.blockedOnBooking.checked,
      });
      close();
    } catch (e2) {
      console.error(e2);
      const p = $('#bf-form-err', dlg);
      p.textContent =
        e2?.code === 'permission-denied'
          ? 'Nemate ovlašćenje za upis. Provjerite da li je UID vlasnice upisan u firestore.rules.'
          : 'Čuvanje nije uspjelo. Provjerite vezu i pokušajte ponovo.';
      p.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Sačuvaj';
    }
  });
}
