// ============================================================
//  Booking traka (hero) + forma za upit (#rezervacija)
// ============================================================
import { config, contact, apartments, site } from './content.js';
import { isPlaceholder } from './render.js';
import { todayLocal, addDays, isAnyFree, formatRange } from './availability.js';
import { loadAvailability } from './availability-data.js';
import { saveInquiry } from './inquiry-client.js';
import { t, getLang } from './i18n.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- poruke: prevodi su u i18n.js (ključevi m.*) ----------
const m = (key, vars) => t(`m.${key}`, vars);

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

  // ---------- odrasli, djeca, uzrast djece, krevetac ----------
  const state = { adults: config.defaultGuests, children: 0, ages: [] };
  const MAX_CHILDREN = 6;
  const outs = { adults: $('#adults-output'), children: $('#children-output') };
  const hidden = { adults: $('#adults'), children: $('#children') };
  const extra = $('#strip-extra');
  const agesBox = $('#strip-ages');
  const crib = $('#strip-crib');
  const ageOptions = (sel) =>
    Array.from({ length: 18 }, (_, n) => `<option value="${n}"${n === sel ? ' selected' : ''}>${n === 0 ? t('age.under1') : t('age.n', { n })}</option>`).join('');

  const renderGuests = () => {
    state.adults = Math.max(config.minGuests, Math.min(state.adults, config.maxGuests - state.children));
    state.children = Math.max(0, Math.min(state.children, MAX_CHILDREN, config.maxGuests - state.adults));
    while (state.ages.length < state.children) state.ages.push(5);
    state.ages.length = state.children;
    for (const k of ['adults', 'children']) {
      outs[k].textContent = state[k];
      hidden[k].value = state[k];
    }
    agesBox.innerHTML = state.ages
      .map(
        (age, i) => `<label class="flex items-center gap-2 font-sans text-sm font-bold"><span>${t('booking.childAge', { n: i + 1 })}</span><select data-age="${i}" class="rounded-xl border border-white/70 bg-white/80 px-3 py-2 font-sans text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-forest">${ageOptions(age)}</select></label>`
      )
      .join('');
    extra.classList.toggle('hidden', state.children === 0);
    extra.classList.toggle('flex', state.children > 0);
  };
  $$('[data-step]', form).forEach((btn) =>
    btn.addEventListener('click', () => {
      state[btn.dataset.step] += Number(btn.dataset.dir);
      renderGuests();
    })
  );
  agesBox.addEventListener('change', (e) => {
    const sel = e.target.closest('select[data-age]');
    if (sel) state.ages[Number(sel.dataset.age)] = Number(sel.value);
  });
  renderGuests();

  const showError = (text) => {
    errorEl.textContent = text;
    errorEl.classList.remove('hidden');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    if (!checkin.value || !checkout.value) return showError(t('booking.pickDates'));
    if (checkout.value <= checkin.value) return showError(m('checkoutOrder'));
    if (!(await isTermFree('', checkin.value, checkout.value))) return showError(m('notFree'));

    // Bez spoljnog sajta: prenesi izbor u formu za upit i skroluj do nje
    if (inquiry) {
      inquiry.fill({
        checkin: checkin.value,
        checkout: checkout.value,
        adults: state.adults,
        children: state.children,
        ages: state.ages,
        crib: state.children > 0 && crib.checked,
      });
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

  const toggleChildren = () => {
    const has = Number(el.children.value) > 0;
    $('#inq-ages-wrap', form).hidden = !has;
    $('#inq-crib-wrap', form).hidden = !has;
    if (!has) {
      el.ages.value = '';
      el.crib.checked = false;
    }
  };
  el.children.addEventListener('input', toggleChildren);
  el.children.addEventListener('change', toggleChildren);
  form.addEventListener('reset', () => setTimeout(toggleChildren, 0));

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
    statusEl.className = `mt-4 font-sans text-base ${kind === 'error' ? 'text-red-600' : kind === 'ok' ? 'text-[#243528]' : 'text-body'}`;
  };

  /** Vraća objekat grešaka { polje: poruka } */
  function validate() {
    const err = {};
    const v = (n) => el[n].value.trim();
    if (!v('fullname')) err.fullname = m('fullname');
    if (!v('email')) err.email = m('emailEmpty');
    else if (!EMAIL_RE.test(v('email'))) err.email = m('emailBad');
    if (v('phone') && !PHONE_RE.test(v('phone'))) err.phone = m('phoneBad');

    const ci = el.checkin.value;
    const co = el.checkout.value;
    if (!ci) err.checkin = m('checkinEmpty');
    else if (ci < todayLocal()) err.checkin = m('checkinPast');
    if (!co) err.checkout = m('checkoutEmpty');
    else if (ci && co <= ci) err.checkout = m('checkoutOrder');

    const adults = Number(el.guests.value);
    const kids = Number(el.children.value || 0);
    if (!Number.isInteger(adults) || !Number.isInteger(kids) || adults < config.minGuests || kids < 0 || adults + kids > config.maxGuests)
      err.guests = m('guests', { min: config.minGuests, max: config.maxGuests });
    if (!el.consent.checked) err.consent = m('consent');
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
      guests: Number(el.guests.value) + Number(el.children.value || 0), // ukupno (odrasli + djeca)
      adults: Number(el.guests.value),
      children: Number(el.children.value || 0),
      ages: el.ages.value.trim(),
      crib: el.crib.checked,
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
      `Odrasli: ${d.adults}`,
      d.children ? `Djeca: ${d.children}${d.ages ? ` (uzrast: ${d.ages})` : ''}` : null,
      d.children && d.crib ? 'Krevetac za bebu: DA' : null,
      `Jezik sajta: ${getLang().toUpperCase()}`,
      `Apartman: ${d.apartment || 'bez preferencije'}`,
      '',
      d.message || '(bez poruke)',
    ]
      .filter((l) => l !== null)
      .join('\n');

  /** Podaci za bazu: djeca, uzrast i krevetac se dopisuju u poruku (polja baze su fiksna). */
  const forDb = (d) => ({
    ...d,
    message: [d.message, d.children ? `[Djeca: ${d.children}${d.ages ? `, uzrast: ${d.ages}` : ''}${d.crib ? ', krevetac za bebu: DA' : ''}]` : '']
      .filter(Boolean)
      .join('\n\n'),
  });

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
      showStatus(m('success'), 'ok');
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
      showStatus(m('tooFast'), 'error');
      return;
    }

    const data = collect();
    const m = mode();

    // termin mora biti slobodan (kalendar iz Firestore-a; ako nije dostupan, ne blokira)
    submitBtn.disabled = true;
    showStatus(m('sending'), 'info');
    const free = await isTermFree(data.apartmentId, data.checkin, data.checkout);
    submitBtn.disabled = false;
    if (!free) {
      statusEl.classList.add('hidden');
      setError('checkout', m('notFree'));
      el.checkout.focus();
      return;
    }

    if (m === 'mailto') {
      if (isPlaceholder(contact.email)) {
        showStatus(m('noTarget'), 'error');
        return;
      }
      saveInquiry(forDb(data)).catch((err) => console.warn('Upit nije upisan u bazu:', err.message));
      showStatus(m('mailto', { email: contact.email }), 'ok');
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject(data))}&body=${encodeURIComponent(summary(data))}`;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    showStatus(m('sending'), 'info');
    try {
      // email (Formspree) i upis u Firestore (sanduče upita u /admin) idu paralelno;
      // dovoljno je da uspije jedan od njih – upit je stigao do vlasnice
      const [mailRes, dbRes] = await Promise.allSettled([send(data), saveInquiry(forDb(data))]);
      if (mailRes.status === 'rejected') console.warn('Formspree nije uspio:', mailRes.reason);
      if (dbRes.status === 'rejected') console.warn('Upis upita u bazu nije uspio:', dbRes.reason);
      if (mailRes.status === 'rejected' && !(dbRes.status === 'fulfilled' && dbRes.value === true)) throw mailRes.reason;
      showStatus(m('success'), 'ok');
      form.reset();
      el.guests.value = config.defaultGuests;
      toggleChildren();
      showErrors({});
    } catch (error) {
      console.error('Slanje forme nije uspelo:', error);
      showStatus(m('failed'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  });

  return {
    form,
    /** popunjava polja iz booking trake */
    fill({ checkin, checkout, adults, children, ages, crib, apartmentId }) {
      if (apartmentId !== undefined) el.apartment.value = apartmentId;
      el.checkin.value = checkin;
      el.checkout.min = addDays(checkin, 1);
      el.checkout.value = checkout;
      if (adults !== undefined) el.guests.value = adults;
      if (children !== undefined) {
        el.children.value = children;
        el.ages.value = (ages ?? []).map((a) => (a === 0 ? '<1' : a)).join(', ');
        el.crib.checked = !!crib;
      }
      toggleChildren();
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
