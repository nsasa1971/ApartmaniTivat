// Mali UI pomoćnici: escapovanje, toast, dijalozi.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

let toastTimer;
export function toast(message, kind = 'ok') {
  const el = $('#toast');
  el.textContent = message;
  el.className =
    'fixed inset-x-4 bottom-24 z-[300] mx-auto max-w-md px-4 py-3 text-center font-sans text-base text-white shadow-xl ' +
    (kind === 'error' ? 'bg-red-700' : 'bg-ink');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), kind === 'error' ? 7000 : 4000);
}

/** Otvara modalni <dialog>. Vraća { dlg, close }. */
let clearBound = false;
export function openDialog(html) {
  const dlg = $('#dlg');
  if (!clearBound) {
    dlg.addEventListener('close', () => setTimeout(() => !dlg.open && (dlg.innerHTML = ''), 0));
    clearBound = true;
  }
  dlg.innerHTML = html;
  if (!dlg.open) dlg.showModal();
  return { dlg, close: () => dlg.close() };
}

export function confirmDialog(message, okLabel = 'Potvrdi', danger = false) {
  return new Promise((resolve) => {
    const { dlg } = openDialog(`
      <form method="dialog" class="p-6">
        <p class="mb-6 font-sans text-lg">${esc(message)}</p>
        <div class="flex flex-col gap-3 sm:flex-row-reverse">
          <button value="ok" class="min-h-12 flex-1 px-6 font-sans text-base font-bold text-white ${danger ? 'bg-red-700' : 'bg-ink'}">${esc(okLabel)}</button>
          <button value="cancel" class="min-h-12 flex-1 border border-ink px-6 font-sans text-base font-bold">Odustani</button>
        </div>
      </form>`);
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
    dlg.returnValue = 'cancel';
  });
}
