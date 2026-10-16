// ============================================================
//  Tivat Garden Homes – administracija (vanilla JS, ES moduli)
// ============================================================
import { isFirebaseConfigured } from '../../assets/js/firebase-config.js';
import { todayLocal, shiftMonth, addDays } from '../../assets/js/availability.js';
import { DEFAULT_APARTMENTS } from './apartments.js';
import { $, $$, esc, toast, confirmDialog } from './ui.js';
import * as store from './store.js';
import { renderCalendar } from './calendar.js';
import { openBookingForm } from './booking-form.js';
import { openConfirmation } from './confirmation.js';
import { renderBookings, renderInquiries, newInquiryCount } from './lists.js';
import { toJSON, toCSV, download, stamp } from './backup.js';

const now = new Date();
const state = {
  user: null,
  apartments: DEFAULT_APARTMENTS,
  bookings: [],
  inquiries: [],
  tab: 'calendar',
  aptId: DEFAULT_APARTMENTS[0].id,
  month: { y: now.getFullYear(), m: now.getMonth() },
  search: '',
  dataError: null,
};
let unsubs = [];
let installPrompt = null;

const root = $('#app');
const BRAND = 'Tivat Garden Homes';

// ---------- ekrani ----------
function showNotConfigured() {
  root.innerHTML = `
    <main class="mx-auto max-w-md p-6">
      <h1 class="mb-4 font-display text-[28px] leading-9">Firebase nije podešen</h1>
      <p class="font-sans text-base">Upišite Firebase konfiguraciju u <code>assets/js/firebase-config.js</code> (Firebase konzola → Project settings → Your apps → Web), pa pokrenite <code>npm run build</code> i objavite sajt. Koraci su opisani u README-u (odjeljak „Administracija“).</p>
    </main>`;
}

function showLogin(message = '') {
  root.innerHTML = `
    <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <img src="../assets/img/logo.png" width="211" height="100" alt="${BRAND}" class="mx-auto mb-4 h-16 w-auto">
      <h1 class="mb-6 text-center font-display text-[26px] leading-9">Administracija</h1>
      <form id="login" class="grid gap-4" novalidate>
        <div>
          <label for="email" class="mb-1 block font-sans text-sm font-bold">Email</label>
          <input id="email" name="email" type="email" autocomplete="username" required class="min-h-12 w-full border border-midtone px-3 font-sans text-base focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E878C]">
        </div>
        <div>
          <label for="password" class="mb-1 block font-sans text-sm font-bold">Lozinka</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required class="min-h-12 w-full border border-midtone px-3 font-sans text-base focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E878C]">
        </div>
        <p id="login-msg" class="${message ? '' : 'hidden'} font-sans text-sm text-red-700" role="alert">${esc(message)}</p>
        <button type="submit" class="min-h-12 bg-ink px-6 font-sans text-base font-bold uppercase text-white disabled:opacity-60">Prijavi se</button>
        <button type="button" id="forgot" class="min-h-11 font-sans text-sm underline">Zaboravljena lozinka?</button>
      </form>
    </main>`;
  const msg = (text, ok = false) => {
    const p = $('#login-msg');
    p.textContent = text;
    p.className = `font-sans text-sm ${ok ? 'text-[#053133]' : 'text-red-700'}`;
  };
  $('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#password').value;
    if (!email || !password) return msg('Unesite email i lozinku.');
    const btn = e.submitter ?? $('#login button[type=submit]');
    btn.disabled = true;
    try {
      await store.signIn(email, password);
    } catch (err) {
      msg(store.authErrorMessage(err));
      btn.disabled = false;
    }
  });
  $('#forgot').addEventListener('click', async () => {
    const email = $('#email').value.trim();
    if (!email) return msg('Unesite email adresu, pa ponovo izaberite „Zaboravljena lozinka?“.');
    try {
      await store.resetPassword(email);
      msg('Ako nalog postoji, poslali smo vam poruku sa uputstvom za novu lozinku.', true);
    } catch (err) {
      msg(store.authErrorMessage(err));
    }
  });
}

function showMain() {
  root.innerHTML = `
    <header class="sticky top-0 z-40 border-b border-line bg-white">
      <div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 class="font-display text-[20px] leading-7">${BRAND}</h1>
        <span id="net" class="hidden bg-red-600 px-2 py-0.5 font-sans text-xs font-bold text-white">Offline</span>
      </div>
    </header>
    <div id="data-error" class="hidden mx-auto max-w-2xl bg-red-50 px-4 py-3 font-sans text-sm text-red-800" role="alert"></div>
    <main id="view" class="mx-auto max-w-2xl px-4 pb-28 pt-4"></main>
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white" aria-label="Glavna navigacija">
      <ul class="mx-auto grid max-w-2xl grid-cols-4">
        ${[
          ['calendar', 'Kalendar'],
          ['bookings', 'Rezervacije'],
          ['inquiries', 'Upiti'],
          ['more', 'Više'],
        ]
          .map(
            ([id, label]) => `<li><button type="button" data-tab="${id}" class="relative flex min-h-16 w-full items-center justify-center font-sans text-sm font-bold aria-[current=page]:bg-ink aria-[current=page]:text-white">${label}<span data-badge="${id}" class="absolute right-2 top-2 hidden min-w-5 rounded-full bg-red-600 px-1 text-xs text-white"></span></button></li>`
          )
          .join('')}
      </ul>
    </nav>`;
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => ((state.tab = b.dataset.tab), render())));
  const view = $('#view');
  view.addEventListener('click', onViewClick);
  view.addEventListener('input', (e) => {
    if (e.target.id === 'search') {
      state.search = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const s = $('#search');
      s?.focus();
      s?.setSelectionRange(pos, pos);
    }
  });
  updateNet();
  render();
}

function render() {
  const view = $('#view');
  if (!view) return;
  $$('[data-tab]').forEach((b) => (b.dataset.tab === state.tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
  const n = newInquiryCount(state.inquiries);
  const badge = $('[data-badge="inquiries"]');
  badge.textContent = n;
  badge.classList.toggle('hidden', !n);
  badge.setAttribute('aria-label', `${n} novih upita`);
  const err = $('#data-error');
  err.textContent = state.dataError ?? '';
  err.classList.toggle('hidden', !state.dataError);

  const today = todayLocal();
  if (state.tab === 'calendar') view.innerHTML = renderCalendar({ ...state, today });
  else if (state.tab === 'bookings') view.innerHTML = renderBookings({ ...state, today });
  else if (state.tab === 'inquiries') view.innerHTML = renderInquiries(state);
  else view.innerHTML = renderMore();
}

function renderMore() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return `
    <h2 class="mb-4 font-display text-[22px]">Više</h2>
    <p class="mb-4 font-sans text-sm text-body">Prijavljeni ste kao <strong>${esc(state.user?.email ?? '')}</strong>.</p>
    <div class="grid gap-3">
      <button type="button" data-export="json" class="min-h-12 border border-ink px-4 font-sans text-base font-bold">Rezervna kopija: preuzmi JSON</button>
      <button type="button" data-export="csv" class="min-h-12 border border-ink px-4 font-sans text-base font-bold">Rezervna kopija: preuzmi CSV (Excel)</button>
      ${
        standalone
          ? ''
          : installPrompt
            ? '<button type="button" data-install class="min-h-12 bg-[#053133] px-4 font-sans text-base font-bold text-white">Dodaj na početni ekran</button>'
            : `<p class="border border-line p-3 font-sans text-sm">${ios ? 'Za instalaciju: u Safariju dodirnite „Podijeli“, pa „Dodaj na početni ekran“.' : 'Za instalaciju: u meniju pregledača izaberite „Dodaj na početni ekran“ / „Instaliraj aplikaciju“.'}</p>`
      }
      <button type="button" data-logout class="min-h-12 bg-ink px-4 font-sans text-base font-bold uppercase text-white">Odjavi se</button>
    </div>
    <p class="mt-6 font-sans text-sm text-body">Preporuka: bar jednom mjesečno preuzmite rezervnu kopiju i sačuvajte je na sigurno mjesto.</p>`;
}

// ---------- akcije ----------
function feedback(res, okText = 'Sačuvano.') {
  toast(
    res === 'pending' ? 'Sačuvano na ovom uređaju. Sinhronizovaće se čim se vrati internet veza.' : okText,
    'ok'
  );
}

function bookingFormFor(booking, prefill = {}, extra = {}) {
  openBookingForm({
    booking,
    prefill,
    title: extra.title,
    apartments: state.apartments,
    bookings: state.bookings,
    onSave: async (data) => {
      const r = await store.saveBooking(data, { id: booking?.id ?? null, inquiryId: extra.inquiryId ?? null });
      feedback(r.state, extra.inquiryId ? 'Upit je prihvaćen, a termin je upisan i zauzet na sajtu.' : 'Rezervacija je sačuvana.');
    },
    onDelete: booking
      ? async () => {
          if (!(await confirmDialog(`Obrisati rezervaciju gosta „${booking.guestName}“? Termin će opet biti slobodan na sajtu.`, 'Obriši', true))) return bookingFormFor(booking, prefill, extra);
          try {
            feedback(await store.deleteBooking(booking.id), 'Rezervacija je obrisana.');
          } catch (e) {
            console.error(e);
            toast('Brisanje nije uspjelo. Pokušajte ponovo.', 'error');
          }
        }
      : null,
  });
}

async function onViewClick(e) {
  const t = e.target.closest('button, a');
  if (!t) return;
  const d = t.dataset;
  if (d.apt) { state.aptId = d.apt; render(); }
  else if (d.month) { state.month = shiftMonth(state.month, Number(d.month)); render(); }
  else if (d.day) bookingFormFor(null, { apartmentId: state.aptId, from: d.day, to: addDays(d.day, 1) });
  else if (d.booking) bookingFormFor(state.bookings.find((b) => b.id === d.booking));
  else if (d.new !== undefined) bookingFormFor(null, { apartmentId: '' });
  else if (d.confirmBk || d.confirmInq) {
    const q = d.confirmInq ? state.inquiries.find((x) => x.id === d.confirmInq) : null;
    // za prihvaćen upit koristi se rezervacija (datumi su možda izmijenjeni pri prihvatanju), a ako je nema – sam upit
    const b = d.confirmBk ? state.bookings.find((x) => x.id === d.confirmBk) : state.bookings.find((x) => x.id === q?.bookingId) ?? q;
    if (!b) return;
    const apt = state.apartments.find((a) => a.id === b.apartmentId);
    openConfirmation(
      { guestName: b.guestName, apartmentName: apt?.naziv ?? b.apartmentId, from: b.from, to: b.to, guests: b.guests, price: b.price },
      { email: b.email, phone: b.phone }
    );
  } else if (d.block) {
    try { feedback(await store.setBlockedOnBooking(d.block, true), 'Označeno kao blokirano na Bookingu.'); }
    catch (err) { console.error(err); toast('Izmjena nije uspjela.', 'error'); }
  } else if (d.accept) {
    const q = state.inquiries.find((x) => x.id === d.accept);
    if (!q) return;
    bookingFormFor(
      null,
      { apartmentId: q.apartmentId, guestName: q.guestName, phone: q.phone, email: q.email, from: q.from, to: q.to, guests: q.guests, note: q.message, source: 'direct' },
      { inquiryId: q.id, title: 'Prihvatanje upita' }
    );
  } else if (d.decline) {
    if (await confirmDialog('Odbiti ovaj upit?', 'Odbij', true)) {
      try { feedback(await store.setInquiryStatus(d.decline, 'declined'), 'Upit je odbijen.'); }
      catch (err) { console.error(err); toast('Izmjena nije uspjela.', 'error'); }
    }
  } else if (d.export) {
    if (d.export === 'json') download(`rezervacije-${stamp()}.json`, toJSON(state.bookings), 'application/json');
    else download(`rezervacije-${stamp()}.csv`, toCSV(state.bookings), 'text/csv;charset=utf-8');
    toast(`Preuzeto: ${state.bookings.length} rezervacija.`);
  } else if (d.install !== undefined && installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    render();
  } else if (d.logout !== undefined) {
    await store.signOutUser();
  }
}

// ---------- podaci ----------
const dataErr = (e) => {
  console.error(e);
  state.dataError =
    e?.code === 'permission-denied'
      ? 'Nemate pristup podacima. Provjerite da li je UID vlasnice upisan u firestore.rules i objavljen u Firebase konzoli.'
      : 'Podaci se ne mogu učitati. Prikazano je ono što je sačuvano na uređaju.';
  render();
};

async function startData() {
  stopData();
  state.apartments = await store.ensureApartments();
  unsubs.push(await store.subscribeBookings((list) => ((state.bookings = list), (state.dataError = null), render()), dataErr));
  unsubs.push(await store.subscribeInquiries((list) => ((state.inquiries = list), render()), dataErr));
}
function stopData() {
  unsubs.forEach((u) => u());
  unsubs = [];
  state.bookings = [];
  state.inquiries = [];
}

const updateNet = () => $('#net')?.classList.toggle('hidden', navigator.onLine);
addEventListener('online', updateNet);
addEventListener('offline', updateNet);
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; if (state.tab === 'more') render(); });

// ---------- start ----------
async function main() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW:', e.message));
  if (!isFirebaseConfigured()) return showNotConfigured();
  try {
    await store.watchAuth(async (user) => {
      state.user = user;
      if (!user) {
        stopData();
        return showLogin();
      }
      showMain();
      try { await startData(); } catch (e) { dataErr(e); }
    });
  } catch (e) {
    console.error(e);
    showLogin('Prijava trenutno nije dostupna. Provjerite internet vezu.');
  }
}
main();
