// ============ KONFIGURACIJA ============
const CONFIG = {
  // Link ka sistemu za rezervacije (Booking engine, Airbnb, Beds24, forma...). Ostaviti prazno dok ne postoji.
  bookingUrl: '',
  minGuests: 1,
  maxGuests: 8,
  defaultGuests: 2,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ============ HEADER: senka pri skrolu + mobilni meni ============
const header = $('#header');
const menuBtn = $('#menu-toggle');
const mobileMenu = $('#mobile-menu');
const scrollUp = $('#scroll-up');

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('shadow-md', y > 10);
  scrollUp.classList.toggle('hidden', y < 400);
  scrollUp.classList.toggle('flex', y >= 400);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuBtn?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('#mobile-menu a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
  })
);

// ============ REVEAL ANIMACIJE ============
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.15 }
);
$$('.reveal').forEach((el) => io.observe(el));

// ============ BOOKING TRAKA ============
const form = $('#booking-form');
if (form) {
  const checkin = $('#checkin');
  const checkout = $('#checkout');
  const guestsInput = $('#guests');
  const guestsOut = $('#guests-output');
  const errorEl = $('#booking-error');

  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (dateStr, n) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return iso(d);
  };

  const today = iso(new Date());
  checkin.min = today;
  checkout.min = addDays(today, 1);

  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const minOut = addDays(checkin.value, 1);
    checkout.min = minOut;
    if (!checkout.value || checkout.value < minOut) checkout.value = minOut;
  });

  let guests = CONFIG.defaultGuests;
  const renderGuests = () => {
    guestsOut.textContent = guests;
    guestsInput.value = guests;
  };
  $$('[data-guests]', form).forEach((btn) =>
    btn.addEventListener('click', () => {
      guests = Math.min(CONFIG.maxGuests, Math.max(CONFIG.minGuests, guests + Number(btn.dataset.guests)));
      renderGuests();
    })
  );
  renderGuests();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    if (!checkin.value || !checkout.value) {
      errorEl.textContent = 'Izaberite datum dolaska i odlaska.';
      errorEl.classList.remove('hidden');
      return;
    }
    if (checkout.value <= checkin.value) {
      errorEl.textContent = 'Datum odlaska mora biti posle datuma dolaska.';
      errorEl.classList.remove('hidden');
      return;
    }

    const params = new URLSearchParams({
      checkin: checkin.value,
      checkout: checkout.value,
      guests: String(guests),
    });

    if (CONFIG.bookingUrl) {
      window.open(`${CONFIG.bookingUrl}?${params}`, '_blank', 'noopener');
    } else {
      // sopstvena forma za upit: prenesi izbor u formu (ako postoji) i skroluj do nje
      const inquiry = $('#inquiry-form');
      if (inquiry) {
        ['checkin', 'checkout', 'guests'].forEach((name) => {
          const field = inquiry.elements[name];
          if (field) field.value = params.get(name);
        });
      }
      $('#rezervacija')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Sva dugmad "Rezerviši"
$$('[data-book-url]').forEach((a) => {
  if (CONFIG.bookingUrl) {
    a.href = CONFIG.bookingUrl;
    a.target = '_blank';
    a.rel = 'noopener';
  }
});

// ============ LIGHTBOX ============
const lb = $('#lightbox');
const lbImg = $('#lb-img');
const items = $$('[data-lightbox]');
let current = 0;

const show = (i) => {
  current = (i + items.length) % items.length;
  const link = items[current];
  lbImg.src = link.href;
  lbImg.alt = $('img', link)?.alt ?? '';
};
const openLb = (i) => {
  show(i);
  lb.classList.remove('hidden');
  lb.classList.add('flex');
  document.body.style.overflow = 'hidden';
};
const closeLb = () => {
  lb.classList.add('hidden');
  lb.classList.remove('flex');
  document.body.style.overflow = '';
};

items.forEach((a, i) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    openLb(i);
  })
);
$('#lb-close').addEventListener('click', closeLb);
$('#lb-prev').addEventListener('click', () => show(current - 1));
$('#lb-next').addEventListener('click', () => show(current + 1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => {
  if (lb.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});

// ============ FOOTER GODINA ============
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
