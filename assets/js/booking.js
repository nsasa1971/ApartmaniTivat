// ============================================================
//  Booking traka (hero) + forma za upit (#rezervacija)
// ============================================================
import { config, contact, apartments, site } from './content.js';
import { isPlaceholder } from './render.js';
import { todayLocal, addDays, isAnyFree, formatRange } from './availability.js';
import { loadAvailability } from './availability-data.js';
import { saveInquiry } from './inquiry-client.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- poruke (srpski, latinica) ----------
const MSG = {
  fullname: 'Unesite ime i prezime.',
  emailEmpty: 'Unesite email adresu.',
  emailBad: 'Unesite ispravnu email adresu (npr. ime@domen.com).',
  phoneBad: 'Unesite ispravan broj telefona (cifre, razmaci, + i -).',
  checkinEmpty: 'Izaberite datum dolaska.',
  checkinPast: 'Datum dolaska ne može biti u prošlosti.',
  checkoutEmpty: 'Izaberite datum odlaska.',
  checkoutOrder: 'Datum odlaska mora biti posle datuma dolaska.',
  notFree: 'Izabrani termin nije slobodan. Izaberite druge datume.',
  guests: (min, max) => `Broj gostiju mora biti između ${min} i ${max}.`,
  consent: 'Morate prihvatiti politiku privatnosti da biste poslali upit.',
  sending: 'Šalje se…',
  success: 'Hvala! Vaš upit je poslat. Javićemo vam se na email adresu koju ste uneli.',
  tooFast: 'Molimo sačekajte nekoliko sekundi i pokušajte ponovo.',
  failed: 'Slanje nije uspelo. Pokušajte ponovo ili nas kontaktirajte direktno.',
  mailto: (email) => `Otvaramo vaš email program sa popunjenim upitom. Ako se ništa ne desi, pošaljite poruku na ${email}.`,
  noTarget: 'Slanje forme još nije podešeno. Kontaktirajte nas direktno (podaci pored forme).',
};

/** Da li je termin slobodan? Bez apartmana: dovoljno je da je slobodan bar jedan. Ako kalendar nije dostupan, ne blokira. */
async function isTermFree(apartmentId, from, to) {
  const map = await loadAvailability();
  if (!map) return true;
  return isAnyFree(map, apartmentId ? [apartmentId] : apartments.map((a) => a.id), from, to);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s().\-/]{5,}$/;

// ============ BOOKING TRAKA ============
function initStrip(inquiry) {
  const form = $('#booking-form');
  if (!form) return;
  const checkin = $('#checkin');
  const checkout = $('#checkout');
  const guestsInput = $('#guests');
  const guestsOut = $('#guests-output');
  const errorEl = $('#booking-error');

  const today = todayLocal();
  checkin.min = today;
  checkout.min = addDays(today, 1);

  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const minOut = addDays(checkin.value, 1);
    checkout.min = minOut;
    if (!checkout.value || checkout.value < minOut) checkout.value = minOut;
  });

  // datum riječima ispod trake (native polje datuma prikazuje format po jeziku pregledača)
  const rangeEl = $('#booking-range');
  const showRange = () => {
    const t = formatRange(checkin.value, checkout.value);
    rangeEl.textContent = t;
    rangeEl.classList.toggle('hidden', !t);
  };
  checkin.addEventListener('change', showRange);
  checkout.addEventListener('change', showRange);

  let guests = config.defaultGuests;
  const renderGuests = () => {
    guestsOut.textContent = guests;
    guestsInput.value = guests;
  };
  $$('[data-guests]', form).forEach((btn) =>
    btn.addEventListener('click', () => {
      guests = Math.min(config.maxGuests, Math.max(config.minGuests, guests + Number(btn.dataset.guests)));
      renderGuests();
    })
  );
  renderGuests();

  const showError = (text) => {
    errorEl.textContent = text;
    errorEl.classList.remove('hidden');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    if (!checkin.value || !checkout.value) return showError('Izaberite datum dolaska i odlaska.');
    if (checkout.value <= checkin.value) return showError(MSG.checkoutOrder);
    if (!(await isTermFree('', checkin.value, checkout.value))) return showError(MSG.notFree);

    // Bez spoljnog sajta: prenesi izbor u formu za upit i skroluj do nje
    if (inquiry) {
      inquiry.fill({ checkin: checkin.value, checkout: checkout.value, guests });
    }
    const target = $('#rezervacija');
    target?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    inquiry?.form.elements.fullname.focus({ preventScroll: true });
  });
}

// ============ FORMA ZA UPIT ============
function initInquiry() {
  const form = $('#inquiry-form');
  if (!form) return null;

  const el = form.elements;
  const statusEl = $('#inquiry-status');
  const submitBtn = $('#inquiry-submit');
  const startedAt = Date.now();

  // ograničenja datuma
  const today = todayLocal();
  el.checkin.min = today;
  el.checkout.min = addDays(today, 1);
  el.checkin.addEventListener('change', () => {
    if (!el.checkin.value) return;
    const minOut = addDays(el.checkin.value, 1);
    el.checkout.min = minOut;
    if (!el.checkout.value || el.checkout.value < minOut) el.checkout.value = minOut;
  });

  // datum riječima ispod polja (interno ostaje YYYY-MM-DD)
  const rangeEl = $('#inq-range', form);
  const showRange = () => {
    const t = formatRange(el.checkin.value, el.checkout.value);
    rangeEl.textContent = t;
    rangeEl.classList.toggle('hidden', !t);
  };
  el.checkin.addEventListener('change', showRange);
  el.checkout.addEventListener('change', showRange);
  form.addEventListener('reset', () => setTimeout(showRange, 0));

  const setError = (name, text) => {
    const first = el[name];
    const msgEl = $(`#${first.id}-error`, form);
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.classList.toggle('hidden', !text);
    first.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (text) first.setAttribute('aria-describedby', msgEl.id);
    else if (name !== 'consent') first.removeAttribute('aria-describedby');
  };

  const showStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = `mt-4 font-sans text-base ${kind === 'error' ? 'text-red-600' : kind === 'ok' ? 'text-[#053133]' : 'text-body'}`;
  };

  /** Vraća objekat grešaka { polje: poruka } */
  function validate() {
    const err = {};
    const v = (n) => el[n].value.trim();
    if (!v('fullname')) err.fullname = MSG.fullname;
    if (!v('email')) err.email = MSG.emailEmpty;
    else if (!EMAIL_RE.test(v('email'))) err.email = MSG.emailBad;
    if (v('phone') && !PHONE_RE.test(v('phone'))) err.phone = MSG.phoneBad;

    const ci = el.checkin.value;
    const co = el.checkout.value;
    if (!ci) err.checkin = MSG.checkinEmpty;
    else if (ci < todayLocal()) err.checkin = MSG.checkinPast;
    if (!co) err.checkout = MSG.checkoutEmpty;
    else if (ci && co <= ci) err.checkout = MSG.checkoutOrder;

    const g = Number(el.guests.value);
    if (!Number.isInteger(g) || g < config.minGuests || g > config.maxGuests)
      err.guests = MSG.guests(config.minGuests, config.maxGuests);
    if (!el.consent.checked) err.consent = MSG.consent;
    return err;
  }

  const FIELDS = ['fullname', 'email', 'phone', 'checkin', 'checkout', 'guests', 'consent'];
  const showErrors = (err) => FIELDS.forEach((n) => setError(n, err[n]));

  // ispravljanje greške čim korisnik izmeni polje
  FIELDS.forEach((n) => {
    const f = el[n];
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') showErrors(validate()); });
    f.addEventListener('change', () => { if (f.getAttribute('aria-invalid') === 'true') showErrors(validate()); });
  });

  // ---------- sastavljanje podataka ----------
  function collect() {
    const apt = apartments.find((a) => a.id === el.apartment.value);
    const messengers = $$('input[name="messengers"]:checked', form).map((i) => i.value);
    return {
      name: el.fullname.value.trim(),
      email: el.email.value.trim(),
      phone: el.phone.value.trim(),
      messengers: messengers.join(', '),
      checkin: el.checkin.value,
      checkout: el.checkout.value,
      guests: el.guests.value,
      apartmentId: apt ? apt.id : '',
      apartment: apt ? apt.name : '',
      message: el.message.value.trim(),
    };
  }

  const summary = (d) =>
    [
      `Ime i prezime: ${d.name}`,
      `Email: ${d.email}`,
      `Telefon: ${d.phone || '-'}`,
      d.messengers ? `Dostupan/na na: ${d.messengers}` : null,
      `Dolazak: ${d.checkin}`,
      `Odlazak: ${d.checkout}`,
      `Broj gostiju: ${d.guests}`,
      `Apartman: ${d.apartment || 'bez preferencije'}`,
      '',
      d.message || '(bez poruke)',
    ]
      .filter((l) => l !== null)
      .join('\n');

  const subject = (d) => `Upit za smeštaj ${d.checkin} – ${d.checkout} (${site.brand})`;

  // ---------- slanje ----------
  const fc = config.form;
  const mode = () => {
    if (fc.provider === 'formspree' && fc.endpoint) return 'formspree';
    if (fc.provider === 'web3forms' && fc.web3formsAccessKey) return 'web3forms';
    return 'mailto';
  };

  async function send(d) {
    const m = mode();
    const body =
      m === 'formspree'
        ? { ...d, message: summary(d), _subject: subject(d), _replyto: d.email }
        : {
            ...d,
            access_key: fc.web3formsAccessKey,
            subject: subject(d),
            from_name: site.brand,
            replyto: d.email,
            message: summary(d),
            botcheck: '',
          };
    const url = m === 'formspree' ? fc.endpoint : fc.endpoint || 'https://api.web3forms.com/submit';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (m === 'web3forms') {
      const json = await res.json();
      if (json.success === false) throw new Error(json.message || 'web3forms');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showStatus('', '');
    statusEl.classList.add('hidden');

    // honeypot: botovi popunjavaju skriveno polje – lažna potvrda, ništa se ne šalje
    if (el.website.value) {
      showStatus(MSG.success, 'ok');
      return form.reset();
    }

    const err = validate();
    showErrors(err);
    const firstBad = FIELDS.find((n) => err[n]);
    if (firstBad) {
      const f = el[firstBad];
      f.focus();
      return;
    }

    // vremenska zaštita: previše brzo slanje
    if (Date.now() - startedAt < config.form.minFillSeconds * 1000) {
      showStatus(MSG.tooFast, 'error');
      return;
    }

    const data = collect();
    const m = mode();

    // termin mora biti slobodan (kalendar iz Firestore-a; ako nije dostupan, ne blokira)
    submitBtn.disabled = true;
    showStatus(MSG.sending, 'info');
    const free = await isTermFree(data.apartmentId, data.checkin, data.checkout);
    submitBtn.disabled = false;
    if (!free) {
      statusEl.classList.add('hidden');
      setError('checkout', MSG.notFree);
      el.checkout.focus();
      return;
    }

    if (m === 'mailto') {
      if (isPlaceholder(contact.email)) {
        showStatus(MSG.noTarget, 'error');
        return;
      }
      saveInquiry(data).catch((err) => console.warn('Upit nije upisan u bazu:', err.message));
      showStatus(MSG.mailto(contact.email), 'ok');
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject(data))}&body=${encodeURIComponent(summary(data))}`;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    showStatus(MSG.sending, 'info');
    try {
      // email (Formspree) i upis u Firestore (sanduče upita u /admin) idu paralelno;
      // dovoljno je da uspije jedan od njih – upit je stigao do vlasnice
      const [mailRes, dbRes] = await Promise.allSettled([send(data), saveInquiry(data)]);
      if (mailRes.status === 'rejected') console.warn('Formspree nije uspio:', mailRes.reason);
      if (dbRes.status === 'rejected') console.warn('Upis upita u bazu nije uspio:', dbRes.reason);
      if (mailRes.status === 'rejected' && !(dbRes.status === 'fulfilled' && dbRes.value === true)) throw mailRes.reason;
      showStatus(MSG.success, 'ok');
      form.reset();
      el.guests.value = config.defaultGuests;
      showErrors({});
    } catch (error) {
      console.error('Slanje forme nije uspelo:', error);
      showStatus(MSG.failed, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  });

  return {
    form,
    /** popunjava polja iz booking trake */
    fill({ checkin, checkout, guests, apartmentId }) {
      if (apartmentId !== undefined) el.apartment.value = apartmentId;
      el.checkin.value = checkin;
      el.checkout.min = addDays(checkin, 1);
      el.checkout.value = checkout;
      if (guests !== undefined) el.guests.value = guests;
      showRange();
      showErrors({});
    },
  };
}

export function initBooking() {
  const inquiry = initInquiry();
  initStrip(inquiry);
  // kalendar dostupnosti učitavamo tek kad posjetilac počne da popunjava termin
  ['#booking-form', '#inquiry-form'].forEach((sel) => $(sel)?.addEventListener('focusin', () => loadAvailability(), { once: true }));
  // izbor termina u kalendaru dostupnosti (availability-widget.js) popunjava formu za upit
  window.addEventListener('tgh:select-range', (e) => {
    if (!inquiry) return;
    const { apartmentId, from, to } = e.detail;
    inquiry.fill({ apartmentId, checkin: from, checkout: to });
    $('#rezervacija')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    inquiry.form.elements.fullname.focus({ preventScroll: true });
  });
}
