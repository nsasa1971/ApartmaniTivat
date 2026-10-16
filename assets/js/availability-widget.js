// ============================================================
//  Javni sajt: sekcija "Dostupnost". Čita samo kolekciju `availability` (datumi).
//  Firebase SDK se učitava lazy – tek kad je sekcija blizu viewporta.
//  Podaci se prate uživo (onSnapshot) dok je sekcija blizu ekrana i tab je vidljiv; inače se listener odjavljuje.
//  Ako Firebase nije podešen ili ne odgovori, sekcija ostaje sakrivena i sajt radi normalno.
// ============================================================
import { isFirebaseConfigured } from './firebase-config.js';
import { watchAvailability } from './availability-data.js';
import { apartments } from './content.js';
import { t } from './i18n.js';
import { monthGrid, monthLabel, shiftMonth, todayLocal, addDays, isRangeFree, formatRange, bookedDaySet } from './availability.js';


export function initAvailability() {
  const section = document.getElementById('dostupnost');
  const anchor = document.getElementById('dostupnost-anchor');
  if (!section || !anchor || !isFirebaseConfigured()) return;

  let watch = null; // aktivno praćenje
  let view = null; // { update(map) } – kad je kalendar prikazan
  let inView = false;
  let failed = false;

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
      return;
    }
    view ??= mount(section, map);
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
}

function mount(section, map) {
  const today = todayLocal();
  const now = new Date();
  const first = { y: now.getFullYear(), m: now.getMonth() };
  const state = { apt: apartments[0].id, month: { ...first }, from: null, to: null };

  const grid = section.querySelector('#avail-grid');
  const label = section.querySelector('#avail-month');
  const msg = section.querySelector('#avail-msg');
  const send = section.querySelector('#avail-send');
  const prev = section.querySelector('[data-avail-month="-1"]');

  const render = () => {
    const booked = bookedDaySet(map.get(state.apt) ?? []);
    label.textContent = monthLabel(state.month.y, state.month.m);
    prev.disabled = state.month.y === first.y && state.month.m === first.m;
    grid.innerHTML = monthGrid(state.month.y, state.month.m)
      .flat()
      .map((iso) => {
        if (!iso) return '<div class="bg-white"></div>';
        const day = Number(iso.slice(8));
        const past = iso < today;
        const taken = booked.has(iso);
        const inSel = state.from && iso >= state.from && iso < (state.to ?? addDays(state.from, 1));
        const isEnd = state.to && iso === state.to;
        const cls = inSel
          ? 'bg-[#34493A] text-white font-bold'
          : isEnd
            ? 'bg-white text-ink ring-2 ring-inset ring-[#34493A] font-bold'
            : taken
              ? 'bg-[#E0D9C8] text-[#8A8574] line-through'
              : past
                ? 'bg-white text-midtone'
                : 'bg-white text-ink hover:bg-mist';
        const state_ = taken ? t('avail.takenLower') : past ? t('avail.past') : t('avail.freeLower');
        return `<button type="button" data-day="${iso}" ${past ? 'disabled' : ''} aria-label="${day}. ${monthLabel(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1)} – ${state_}"
          class="flex aspect-square min-h-10 items-center justify-center font-sans text-base ${cls}">${day}</button>`;
      })
      .join('');
    const ready = state.from && state.to;
    send.classList.toggle('hidden', !ready);
    if (ready) msg.textContent = t('avail.chosen', { range: formatRange(state.from, state.to) });
  };

  const say = (text) => (msg.textContent = text);

  section.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.availApt) {
      state.apt = btn.dataset.availApt;
      state.from = state.to = null;
      section.querySelectorAll('[data-avail-apt]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      say('');
      render();
    } else if (btn.dataset.availMonth) {
      state.month = shiftMonth(state.month, Number(btn.dataset.availMonth));
      render();
    } else if (btn.dataset.day) {
      const day = btn.dataset.day;
      const booked = bookedDaySet(map.get(state.apt) ?? []);
      if (!state.from || state.to || day <= state.from) {
        // prvi klik: dolazak
        state.to = null;
        if (booked.has(day)) {
          state.from = null;
          say(t('avail.notFree'));
        } else {
          state.from = day;
          say(t('avail.pickOut'));
        }
      } else if (isRangeFree(map, state.apt, state.from, day)) {
        state.to = day;
      } else {
        state.from = state.to = null;
        say(t('avail.notFree'));
      }
      render();
    } else if (btn.id === 'avail-send' && state.from && state.to) {
      window.dispatchEvent(new CustomEvent('tgh:select-range', { detail: { apartmentId: state.apt, from: state.from, to: state.to } }));
    }
  });

  // nove podatke (uživo) upisujemo u kalendar; izabrani termin koji je u međuvremenu zauzet se poništava
  const update = (next) => {
    map = next;
    if (state.from) {
      const booked = bookedDaySet(map.get(state.apt) ?? []);
      if (booked.has(state.from) || (state.to && !isRangeFree(map, state.apt, state.from, state.to))) {
        state.from = state.to = null;
        say(t('avail.notFree'));
      }
    }
    render();
  };

  section.classList.remove('hidden');
  section.querySelector('#avail-loading')?.remove();
  section.querySelector('#avail-body').classList.remove('hidden');
  render();
  // kad gost dolazi sa linka (npr. sa bloga) na #dostupnost-anchor, ostani na kalendaru:
  // dio ispod ne smije da "povuče" pregled na formu za upit kad se kalendar pojavi
  if (window.location.hash === '#dostupnost-anchor') document.getElementById('dostupnost-anchor')?.scrollIntoView();
  return { update };
}
