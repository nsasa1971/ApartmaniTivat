// Potvrda rezervacije gostu: gotov tekst na CG/EN/RU koji vlasnica može urediti pa poslati mejlom ili preko WhatsApp-a.
// Ništa se ne šalje samo od sebe – dugmad otvaraju mejl/WhatsApp sa već napisanom porukom.
import { config, contact } from '../../assets/js/content.js';
import { openDialog, esc, $, toast } from './ui.js';

const LOCALES = { sr: 'sr-Latn-ME', en: 'en-GB', ru: 'ru-RU' };
const LANGS = [
  ['sr', 'Crnogorski'],
  ['en', 'English'],
  ['ru', 'Русский'],
];

// crnogorski (ijekavica): Intl daje ekavske oblike (ponedeljak), pa su nazivi ovdje upisani
const SR_DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];

const day = (iso, lang) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (lang === 'sr') return `${SR_DAYS[date.getUTCDay()]}, ${d}. ${SR_MONTHS[m - 1]} ${y}.`;
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
};

const nightsBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

const nights = (n, lang) => {
  if (lang === 'en') return `${n} ${n === 1 ? 'night' : 'nights'}`;
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  if (lang === 'ru') return `${n} ${!teen && last === 1 ? 'ночь' : !teen && last >= 2 && last <= 4 ? 'ночи' : 'ночей'}`;
  return `${n} ${!teen && last === 1 ? 'noć' : 'noći'}`;
};

const TEXT = {
  sr: {
    subject: (a) => `Potvrda rezervacije – Tivat Garden Homes (${a.from} – ${a.to})`,
    hello: (n) => `Poštovani/a ${n},`,
    intro: 'hvala Vam na upitu. Sa zadovoljstvom potvrđujemo Vašu rezervaciju:',
    apt: 'Apartman', arrival: 'Dolazak', departure: 'Odlazak', nights: 'Broj noćenja', guests: 'Broj gostiju', price: 'Cijena',
    checkIn: (t) => `check-in od ${t}`, checkOut: (t) => `check-out do ${t}`,
    address: 'Adresa', map: 'Lokacija na mapi', contact: 'Kontakt',
    outro: 'Molimo Vas da nam javite okvirno vrijeme dolaska. Za sva pitanja slobodno nam se javite.',
    regards: 'Srdačan pozdrav,',
  },
  en: {
    subject: (a) => `Booking confirmation – Tivat Garden Homes (${a.from} – ${a.to})`,
    hello: (n) => `Dear ${n},`,
    intro: 'thank you for your inquiry. We are pleased to confirm your reservation:',
    apt: 'Apartment', arrival: 'Arrival', departure: 'Departure', nights: 'Nights', guests: 'Guests', price: 'Price',
    checkIn: (t) => `check-in from ${t}`, checkOut: (t) => `check-out by ${t}`,
    address: 'Address', map: 'Location on the map', contact: 'Contact',
    outro: 'Please let us know your approximate arrival time. Do not hesitate to contact us if you have any questions.',
    regards: 'Kind regards,',
  },
  ru: {
    subject: (a) => `Подтверждение бронирования – Tivat Garden Homes (${a.from} – ${a.to})`,
    hello: (n) => `Уважаемый(ая) ${n},`,
    intro: 'благодарим за Ваш запрос. Рады подтвердить Ваше бронирование:',
    apt: 'Апартамент', arrival: 'Заезд', departure: 'Выезд', nights: 'Количество ночей', guests: 'Количество гостей', price: 'Стоимость',
    checkIn: (t) => `регистрация с ${t}`, checkOut: (t) => `освобождение до ${t}`,
    address: 'Адрес', map: 'Расположение на карте', contact: 'Контакты',
    outro: 'Пожалуйста, сообщите нам примерное время Вашего прибытия. Если у Вас есть вопросы, обращайтесь к нам.',
    regards: 'С уважением,',
  },
};

/** Tekst potvrde. `b`: { guestName, apartmentName, from, to, guests, price? } (datumi 'YYYY-MM-DD'). Vraća { subject, body }. */
export function buildConfirmation(lang, b) {
  const t = TEXT[lang] ?? TEXT.sr;
  const n = nightsBetween(b.from, b.to);
  const phone = contact.phoneDisplay || contact.phone;
  const price = b.price != null && b.price !== '' && Number(b.price) >= 0 ? `${t.price}: ${Number(b.price)} €` : null;
  const lines = [
    t.hello(b.guestName),
    '',
    t.intro,
    '',
    `${t.apt}: Holiday home ${b.apartmentName}`,
    `${t.arrival}: ${day(b.from, lang)} (${t.checkIn(config.checkIn)})`,
    `${t.departure}: ${day(b.to, lang)} (${t.checkOut(config.checkOut)})`,
    `${t.nights}: ${nights(n, lang)}`,
    `${t.guests}: ${b.guests}`,
    ...(price ? [price] : []),
    '',
    `${t.address}: ${[contact.address, contact.city, contact.countryName].filter(Boolean).join(', ')}`,
    `${t.map}: ${contact.mapUrl}`,
    `${t.contact}: ${phone}, ${contact.email}`,
    '',
    t.outro,
    '',
    t.regards,
    'Biljana Bauk',
    'Tivat Garden Homes',
  ];
  return { subject: t.subject({ from: day(b.from, lang), to: day(b.to, lang) }), body: lines.join('\n') };
}

/** Pretpostavljeni jezik gosta po pozivnom broju telefona (vlasnica ga može promijeniti). */
export function guessLang(phone) {
  const d = String(phone ?? '').replace(/[^\d+]/g, '');
  if (/^(\+|00)7/.test(d)) return 'ru';
  if (/^(\+|00)(382|381|385|387|389)/.test(d)) return 'sr';
  return /^(\+|00)/.test(d) ? 'en' : 'sr';
}

/** Dijalog: izbor jezika, izmjenjiv tekst, dugmad Email / WhatsApp / Kopiraj. */
export function openConfirmation(b, { email = '', phone = '' } = {}) {
  let lang = guessLang(phone);
  const digits = String(phone).replace(/[^\d]/g, '');
  const btn = 'flex min-h-12 flex-1 items-center justify-center px-4 font-sans text-base font-bold';
  const { dlg, close } = openDialog(`
    <div class="p-6">
      <h2 class="mb-1 font-display text-[22px]">Potvrda rezervacije</h2>
      <p class="mb-4 font-sans text-sm text-body">Tekst možete izmijeniti prije slanja. Ništa se ne šalje samo od sebe.</p>
      <div class="mb-3 flex gap-2" role="group" aria-label="Jezik poruke">
        ${LANGS.map(([k, name]) => `<button type="button" data-lang="${k}" aria-pressed="${k === lang}" class="min-h-11 flex-1 border border-ink px-3 font-sans text-sm font-bold aria-pressed:bg-ink aria-pressed:text-white">${esc(name)}</button>`).join('')}
      </div>
      <label class="sr-only" for="cf-text">Tekst potvrde</label>
      <textarea id="cf-text" rows="12" class="w-full border border-midtone p-3 font-sans text-sm leading-6 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E878C]"></textarea>
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <a id="cf-mail" class="${btn} bg-ink text-white" target="_blank" rel="noopener">Email${email ? '' : ' (nema adrese)'}</a>
        <a id="cf-wa" class="${btn} bg-[#053133] text-white" target="_blank" rel="noopener">WhatsApp${digits ? '' : ' (nema broja)'}</a>
        <button type="button" id="cf-copy" class="${btn} border border-ink">Kopiraj</button>
        <button type="button" id="cf-close" class="${btn} border border-midtone">Zatvori</button>
      </div>
    </div>`);
  const ta = $('#cf-text', dlg);
  const mail = $('#cf-mail', dlg);
  const wa = $('#cf-wa', dlg);
  let subject = '';
  const links = () => {
    const text = ta.value;
    if (email) mail.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    else mail.removeAttribute('href');
    if (digits) wa.href = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    else wa.removeAttribute('href');
    mail.classList.toggle('opacity-40', !email);
    wa.classList.toggle('opacity-40', !digits);
  };
  const fill = () => {
    const r = buildConfirmation(lang, b);
    subject = r.subject;
    ta.value = r.body;
    links();
  };
  dlg.querySelectorAll('[data-lang]').forEach((el) =>
    el.addEventListener('click', () => {
      lang = el.dataset.lang;
      dlg.querySelectorAll('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', String(x === el)));
      fill();
    })
  );
  ta.addEventListener('input', links);
  $('#cf-close', dlg).addEventListener('click', close);
  $('#cf-copy', dlg).addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ta.value);
      toast('Tekst je kopiran.');
    } catch {
      ta.select();
      toast('Označite tekst i kopirajte ga ručno.', 'error');
    }
  });
  fill();
}
