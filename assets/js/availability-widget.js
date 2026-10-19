// ============================================================
//  Javni sajt: sekcija "Dostupnost" (kalendari sva tri apartmana + kartice sa statusom za izabrane datume).
//  Čita samo kolekciju `availability` (datumi), uživo (Firestore onSnapshot), plus termine sa Bookinga (iCal).
//  Firebase SDK se učitava lazy – tek kad je sekcija blizu viewporta ili kad stigne pretraga iz hero trake.
//  Ako Firebase nije podešen ili ne odgovori, sekcija ostaje sakrivena i sajt radi normalno.
//
//  Događaji:
//    prima  'tgh:search'          { from, to, adults, children, ages, crib }  (hero traka, dugme "Pretraži")
//    šalje  'tgh:select-range'    { apartmentId, from, to, adults, children, ages, crib }  (dugme "Pošalji upit" na kartici)
//    šalje  'tgh:search-fallback' (isti detalji) ako se kalendar ne može učitati – forma za upit se popunjava direktno
// ============================================================
import { isFirebaseConfigured } from './firebase-config.js';
import { watchAvailability } from './availability-data.js';
import { apartments, contact, rates } from './content.js';
import { t, getLang } from './i18n.js';
import { estimateStay, monthWindow } from './pricing.js';
import { monthGrid, monthLabel, shiftMonth, todayLocal, addDays, isRangeFree, formatRange, bookedDaySet, nightsLabel, weekdays } from './availability.js';

const LOCALES = { sr: 'sr-Latn-ME', en: 'en-GB', ru: 'ru-RU' };
const num = (n) => new Intl.NumberFormat(LOCALES[getLang()] ?? LOCALES.sr, { maximumFractionDigits: 2 }).format(n);
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAvailability() {
  const section = document.getElementById('dostupnost');
  const anchor = document.getElementById('dostupnost-anchor');
  if (!section || !anchor || !isFirebaseConfigured()) return;

  let watch = null; // aktivno praćenje
  let view = null; // { update(map), search(detail) } – kad je kalendar prikazan
  let inView = false;
  let failed = false;
  let pending = null; // pretraga koja je stigla prije nego što je kalendar učitan

  const start = async () => {
    if (watch || failed) return;
    const w = (watch = watchAvailability((map) => view?.update(map)));
    const map = await w.ready;
    if (watch !== w) return; // u međuvremenu zaustavljeno
    if (!map) {
      if (view) { // greška pri ponovnom povezivanju: ostaje prikaz posljednjih podataka
        watch = null;
        return;
      }
      // kalendar nije dostupan: sekcija se uklanja (sajt radi normalno bez nje)
      failed = true;
      watch = null;
      section.classList.add('hidden');
      io.disconnect();
      if (pending) window.dispatchEvent(new CustomEvent('tgh:search-fallback', { detail: pending }));
      pending = null;
      return;
    }
    view ??= mount(section, map);
    if (pending) {
      view.search(pending);
      pending = null;
    }
  };
  const stop = () => {
    watch?.stop();
    watch = null;
  };
  const sync = () => (inView && !document.hidden ? start() : stop());

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    },
    { rootMargin: '600px' }
  );
  io.observe(section);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);

  // pretraga iz hero trake: kalendar se otvara (i učitava ako još nije)
  window.addEventListener('tgh:search', (e) => {
    if (failed) return window.dispatchEvent(new CustomEvent('tgh:search-fallback', { detail: e.detail }));
    if (view) return view.search(e.detail);
    pending = e.detail;
    inView = true;
    start();
  });
}

function mount(section, initialMap) {
  let map = initialMap;
  const today = todayLocal();
  const now = new Date();
  const first = { y: now.getFullYear(), m: now.getMonth() };
  const state = {
    apt: apartments[0].id, // aktivni apartman (mobilni tabovi)
    month: { ...first },
    count: 1, // koliko mjeseci se prikazuje
    from: null,
    to: null,
    guests: null, // ukupan broj gostiju (poznat samo iz pretrage u hero traci)
    adults: undefined,
    children: undefined,
    ages: undefined,
    crib: undefined,
  };

  const $ = (sel) => section.querySelector(sel);
  const cals = $('#avail-cals');
  const results = $('#avail-results');
  const label = $('#avail-month');
  const msg = $('#avail-msg');
  const prev = $('[data-avail-month="-1"]');
  const say = (text) => (msg.textContent = text);

  // ---------- kalendar jednog apartmana ----------
  const monthHtml = (aptId, ym) => {
    const booked = bookedDaySet(map.get(aptId) ?? []);
    const days = monthGrid(ym.y, ym.m)
      .flat()
      .map((iso) => {
        if (!iso) return '<div class="bg-white"></div>';
        const day = Number(iso.slice(8));
        const past = iso < today;
        const taken = booked.has(iso);
        const inSel = state.from && iso >= state.from && iso < (state.to ?? addDays(state.from, 1));
        const isEnd = state.to && iso === state.to;
        const cls =
          taken && inSel
            ? 'bg-[#E0D9C8] text-[#8A8574] line-through ring-2 ring-inset ring-[#34493A]'
            : inSel
              ? 'bg-[#34493A] text-white font-bold'
              : isEnd
                ? 'bg-white text-ink ring-2 ring-inset ring-[#34493A] font-bold'
                : taken
                  ? 'bg-[#E0D9C8] text-[#8A8574] line-through'
                  : past
                    ? 'bg-white text-midtone'
                    : 'bg-white text-ink hover:bg-mist';
        const st = taken ? t('avail.takenLower') : past ? t('avail.past') : t('avail.freeLower');
        return `<button type="button" data-day="${iso}" ${past ? 'disabled' : ''} aria-label="${day}. ${monthLabel(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1)} – ${st}"
          class="flex aspect-square min-h-10 items-center justify-center font-sans text-base ${cls}">${day}</button>`;
      })
      .join('');
    return `
      <div>
        <h4 class="mb-2 font-display text-[18px] capitalize">${monthLabel(ym.y, ym.m)}</h4>
        <div class="grid grid-cols-7 gap-px text-center font-sans text-xs font-bold text-body" aria-hidden="true">${weekdays().map((d) => `<div>${d}</div>`).join('')}</div>
        <div class="mt-1 grid grid-cols-7 gap-px bg-line">${days}</div>
      </div>`;
  };

  const renderCals = () => {
    const months = Array.from({ length: state.count }, (_, i) => shiftMonth(state.month, i));
    label.textContent = months.length > 1 ? `${monthLabel(months[0].y, months[0].m)} – ${monthLabel(months.at(-1).y, months.at(-1).m)}` : monthLabel(months[0].y, months[0].m);
    prev.disabled = state.month.y === first.y && state.month.m === first.m;
    cals.innerHTML = apartments
      .map(
        (ap) => `
        <section data-col="${esc(ap.id)}" class="${ap.id === state.apt ? '' : 'max-md:hidden '}text-left" aria-label="${esc(ap.name)}">
          <h3 class="mb-3 hidden font-display text-[22px] text-ink md:block">${esc(ap.name)}</h3>
          <div class="grid gap-6">${months.map((ym) => monthHtml(ap.id, ym)).join('')}</div>
        </section>`
      )
      .join('');
    section.querySelectorAll('[data-avail-apt]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.availApt === state.apt)));
  };

  // ---------- kartice sa statusom za izabrane datume ----------
  const contactHtml = `<a href="tel:${esc(String(contact.phone).replace(/[^\d+]/g, ''))}" class="underline hover:no-underline">${t('avail.contactCall')} ${esc(contact.phoneDisplay || contact.phone)}</a> · <a href="mailto:${esc(contact.email)}" class="underline hover:no-underline">${esc(contact.email)}</a>`;

  const cardHtml = (ap) => {
    const free = isRangeFree(map, ap.id, state.from, state.to);
    const over = state.guests != null && state.guests > ap.capacity;
    let body = '';
    if (free) {
      const est = estimateStay(state.from, state.to, rates);
      body = `
        <p class="mt-3 font-sans text-base font-bold text-ink">${t('avail.priceLine', { nights: nightsLabel(est.nights), total: `${num(est.total)} €`, avg: `${num(est.average)} €` })}</p>
        ${est.mixed ? `<p class="font-sans text-sm text-body">${t('avail.seasonNote')}</p>` : ''}
        ${est.longStay ? `<p class="mt-1 font-sans text-sm text-body">${t('avail.discountNote')}</p>` : ''}
        <p class="mt-1 font-sans text-sm text-body">${t('avail.priceDisclaimer')}</p>
        ${
          over
            ? `<p class="mt-4 border-l-4 border-[#34493A] bg-mist p-3 font-sans text-sm" role="note">${t('avail.overCapacity', { n: state.guests, max: ap.capacity })}<br>${contactHtml}</p>`
            : `<button type="button" data-card-send="${esc(ap.id)}" class="mt-4 min-h-12 w-full bg-ink px-6 font-sans text-sm font-bold uppercase text-white transition hover:bg-charcoal">${t('avail.cardSend')}</button>`
        }`;
    }
    return `
      <article class="flex flex-col bg-white p-5" data-card="${esc(ap.id)}">
        <h3 class="font-display text-[22px] text-ink">${esc(ap.name)}</h3>
        <p class="mt-2 inline-flex w-fit items-center gap-2 px-3 py-1 font-sans text-sm font-bold ${free ? 'bg-[#E4EDDF] text-[#1F2F25]' : 'bg-[#E0D9C8] text-[#5C5748]'}">
          <span aria-hidden="true">${free ? '✓' : '✕'}</span>${free ? t('avail.cardFree') : t('avail.cardTaken')}
        </p>${body}
      </article>`;
  };

  const renderResults = () => {
    const active = state.from && state.to;
    results.classList.toggle('hidden', !active);
    if (!active) {
      results.innerHTML = '';
      return;
    }
    const parts = [formatRange(state.from, state.to)];
    if (state.guests != null) parts.push(t('avail.guestsN', { n: state.guests }));
    results.innerHTML = `
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="font-display text-[24px] text-ink">${t('avail.resultsTitle')}</h3>
        <p class="font-sans text-base"><strong>${esc(parts.join(' · '))}</strong> <button type="button" data-avail-clear class="ml-2 underline hover:no-underline">${t('avail.clear')}</button></p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">${apartments.map(cardHtml).join('')}</div>`;
  };

  const render = () => {
    renderCals();
    renderResults();
  };

  // ---------- interakcija ----------
  section.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.availApt) {
      state.apt = btn.dataset.availApt;
      renderCals();
    } else if (btn.dataset.availMonth) {
      state.month = shiftMonth(state.month, Number(btn.dataset.availMonth));
      renderCals();
    } else if (btn.dataset.day) {
      const day = btn.dataset.day;
      if (!state.from || state.to || day <= state.from) {
        state.from = day;
        state.to = null;
        say(t('avail.pickOut'));
      } else {
        state.to = day;
        say(t('avail.chosen', { range: formatRange(state.from, state.to) }));
      }
      render();
    } else if (btn.dataset.availClear !== undefined) {
      state.from = state.to = null;
      state.guests = null;
      say(t('avail.hint'));
      render();
    } else if (btn.dataset.cardSend) {
      window.dispatchEvent(
        new CustomEvent('tgh:select-range', {
          detail: { apartmentId: btn.dataset.cardSend, from: state.from, to: state.to, adults: state.adults, children: state.children, ages: state.ages, crib: state.crib },
        })
      );
    }
  });

  /** Pretraga iz hero trake: izbor datuma i gostiju, prozor mjeseci od dolaska, skok na sekciju. */
  const search = (d) => {
    state.from = d.from;
    state.to = d.to;
    state.adults = d.adults;
    state.children = d.children;
    state.ages = d.ages;
    state.crib = d.crib;
    state.guests = Number.isInteger(d.adults) ? d.adults + (d.children ?? 0) : null;
    const w = monthWindow(d.from, d.to);
    state.month = { y: w.y, m: w.m };
    state.count = w.count;
    // na telefonu je aktivan prvi slobodan apartman (ako postoji)
    state.apt = apartments.find((ap) => isRangeFree(map, ap.id, d.from, d.to))?.id ?? apartments[0].id;
    say(t('avail.chosen', { range: formatRange(d.from, d.to) }));
    render();
    section.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  // nove podatke (uživo) upisujemo u kalendar i kartice; izbor datuma ostaje
  const update = (next) => {
    map = next;
    render();
  };

  section.classList.remove('hidden');
  section.querySelector('#avail-loading')?.remove();
  section.querySelector('#avail-body').classList.remove('hidden');
  render();
  // kad gost dolazi sa linka (npr. sa bloga) na #dostupnost-anchor, ostani na kalendaru:
  // dio ispod ne smije da "povuče" pregled na formu za upit kad se kalendar pojavi
  if (window.location.hash === '#dostupnost-anchor') document.getElementById('dostupnost-anchor')?.scrollIntoView();
  return { update, search };
}
