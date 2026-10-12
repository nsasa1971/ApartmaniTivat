// ============================================================
//  Lightbox: fokus-trap, vraćanje fokusa, tastatura i swipe
// ============================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function initLightbox() {
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const items = $$('[data-lightbox]');
  if (!lb || !items.length) return;

  const closeBtn = $('#lb-close');
  const prevBtn = $('#lb-prev');
  const nextBtn = $('#lb-next');
  const focusable = [closeBtn, prevBtn, nextBtn];

  let current = 0;
  let lastTrigger = null;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const link = items[current];
    lbImg.src = link.href;
    lbImg.alt = $('img', link)?.alt ?? '';
  };

  const isOpen = () => !lb.classList.contains('hidden');

  const open = (i, trigger) => {
    lastTrigger = trigger;
    show(i);
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lb.classList.add('hidden');
    lb.classList.remove('flex');
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    lastTrigger?.focus(); // vraćanje fokusa na sliku koja je otvorila lightbox
  };

  items.forEach((a, i) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      open(i, a);
    })
  );
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      // fokus-trap: Tab kruži samo kroz dugmad lightbox-a
      const idx = focusable.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? idx - 1 : idx + 1;
      focusable[(next + focusable.length) % focusable.length].focus();
    }
  });

  // swipe na mobilnom (levo = sledeća, desno = prethodna)
  let startX = 0;
  let startY = 0;
  lb.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
}
