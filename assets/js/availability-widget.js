// ============================================================
//  Javni sajt: sekcija "Dostupnost". Čita samo kolekciju `availability` (datumi).
//  Firebase SDK se učitava lazy – tek kad je sekcija blizu viewporta.
//  Ako Firebase nije podešen ili ne odgovori, sekcija ostaje sakrivena i sajt radi normalno.
// ============================================================
import { isFirebaseConfigured } from './firebase-config.js';
import { loadAvailability } from './availability-data.js';
import { apartments } from './content.js';
import { monthGrid, monthLabel, shiftMonth, todayLocal, addDays, isRangeFree, formatRange, bookedDaySet } from './availability.js';

const MSG_NOT_FREE = 'Izabrani termin nije slobodan. Izaberite druge datume.';

export function initAvailability() {
  const section = document.getElementById('dostupnost');
  const anchor = document.getElementById('dostupnost-anchor');
  if (!section || !anchor || !isFirebaseConfigured()) return;

  const io = new IntersectionObserver(
    async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const map = await loadAvailability();
      if (map) mount(section, map);
    },
    { rootMargin: '600px' }
  );
  io.observe(anchor);
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
              ? 'bg-charcoal text-white'
              : past
                ? 'bg-white text-midtone'
                : 'bg-white text-ink hover:bg-mist';
        const state_ = taken ? 'zauzeto' : past ? 'prošlo' : 'slobodno';
        return `<button type="button" data-day="${iso}" ${past ? 'disabled' : ''} aria-label="${day}. ${monthLabel(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1)} – ${state_}"
          class="flex aspect-square min-h-10 items-center justify-center font-sans text-base ${cls}">${day}</button>`;
      })
      .join('');
    const ready = state.from && state.to;
    send.classList.toggle('hidden', !ready);
    if (ready) msg.textContent = `Izabrano: ${formatRange(state.from, state.to)}`;
  };

  const say = (text) => (msg.textContent = text);

  section.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.availApt) {
      state.apt = t.dataset.availApt;
      state.from = state.to = null;
      section.querySelectorAll('[data-avail-apt]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
      say('');
      render();
    } else if (t.dataset.availMonth) {
      state.month = shiftMonth(state.month, Number(t.dataset.availMonth));
      render();
    } else if (t.dataset.day) {
      const day = t.dataset.day;
      const booked = bookedDaySet(map.get(state.apt) ?? []);
      if (!state.from || state.to || day <= state.from) {
        // prvi klik: dolazak
        state.to = null;
        if (booked.has(day)) {
          state.from = null;
          say(MSG_NOT_FREE);
        } else {
          state.from = day;
          say('Sada izaberite dan odlaska.');
        }
      } else if (isRangeFree(map, state.apt, state.from, day)) {
        state.to = day;
      } else {
        state.from = state.to = null;
        say(MSG_NOT_FREE);
      }
      render();
    } else if (t.id === 'avail-send' && state.from && state.to) {
      window.dispatchEvent(new CustomEvent('tgh:select-range', { detail: { apartmentId: state.apt, from: state.from, to: state.to } }));
    }
  });

  section.classList.remove('hidden');
  render();
}
