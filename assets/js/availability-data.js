// ============================================================
//  Javni sajt: čitanje kolekcije `availability` (samo javna polja apartmentId, from, to – bez ličnih podataka).
//  Ako Firebase nije podešen ili nije dostupan, vraća null i sajt radi bez kalendara.
//    - watchAvailability(): uživo (onSnapshot), za kalendar dostupnosti; stop() odjavljuje listener
//    - loadAvailability():  jednokratno, uvijek sa servera (bez keša), za provjeru termina pri slanju upita
//  Termini sa Booking.com-a (iCal, Netlify funkcija /api/booking-ical) se spajaju sa terminima iz Firebase-a.
//  Ako funkcija nije dostupna (npr. nije podešena), kalendar radi samo sa Firebase terminima.
// ============================================================
import { isFirebaseConfigured, firestore } from './firebase-client.js';
import { todayLocal, isValidISO } from './availability.js';

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/** Spisak termina (samo oni koji se završavaju danas ili kasnije) → Map: apartmentId → [{from, to}] */
const toMap = (snap) => {
  const map = new Map();
  snap.forEach((d) => {
    const { apartmentId, from, to } = d.data();
    if (!map.has(apartmentId)) map.set(apartmentId, []);
    map.get(apartmentId).push({ from, to });
  });
  return map;
};

const EXTERNAL_URL = '/api/booking-ical';
const EXTERNAL_REFRESH_MS = 5 * 60 * 1000; // funkcija kešira 10 min, pa češće nema smisla

let lastExternal = new Map();

/** Zauzeti termini sa Booking.com-a: Map apartmentId → [{from, to}]. Greška = posljednji poznati podaci. */
export async function loadExternalAvailability() {
  try {
    const res = await withTimeout(fetch(EXTERNAL_URL, { headers: { Accept: 'application/json' } }), 5000);
    if (!res.ok) return lastExternal;
    const data = await res.json();
    const map = new Map();
    for (const [id, ranges] of Object.entries(data.apartments ?? {})) {
      const ok = ranges.filter((r) => isValidISO(r.from) && isValidISO(r.to) && r.to > r.from);
      if (ok.length) map.set(id, ok);
    }
    // apartman čiji je iCal privremeno nedostupan zadržava prethodne podatke
    for (const id of data.failed ?? []) if (lastExternal.has(id) && !map.has(id)) map.set(id, lastExternal.get(id));
    return (lastExternal = map);
  } catch {
    return lastExternal;
  }
}

/** Spaja dvije mape termina (unija po apartmanu). */
export const mergeAvailability = (a, b) => {
  const out = new Map();
  for (const m of [a, b]) for (const [id, ranges] of m) out.set(id, [...(out.get(id) ?? []), ...ranges]);
  return out;
};

const upcoming = ({ collection, query, where, db }) => query(collection(db, 'availability'), where('to', '>=', todayLocal()));

let inflight;

/** Jednokratno čitanje sa servera. Vraća Map ili null. Istovremeni pozivi dijele jedan zahtjev, ali se ništa ne kešira. */
export function loadAvailability() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  return (inflight ??= withTimeout(
    (async () => {
      const fs = await firestore();
      const [snap, external] = await Promise.all([fs.getDocs(upcoming(fs)), loadExternalAvailability()]);
      return mergeAvailability(toMap(snap), external);
    })(),
    8000
  )
    .catch((e) => {
      console.warn('Dostupnost nije učitana:', e.message);
      return null;
    })
    .finally(() => {
      inflight = undefined;
    }));
}

/**
 * Uživo praćenje (Firestore onSnapshot). `onChange(map)` se zove pri svakoj promjeni (i pri prvom učitavanju);
 * `ready` se razrješava prvim podacima (Map) ili null ako učitavanje ne uspije.
 * `stop()` odjavljuje listener – zovite ga kad kalendar nije potreban (van ekrana, skriven tab).
 */
export function watchAvailability(onChange) {
  if (!isFirebaseConfigured()) return { ready: Promise.resolve(null), stop() {} };
  let stopped = false;
  let unsubscribe = null;
  let refreshTimer = null;
  let own = null; // posljednji podaci iz Firebase-a
  let external = lastExternal; // posljednji podaci sa Booking.com-a
  const emit = () => own && !stopped && onChange(mergeAvailability(own, external));
  const stop = () => {
    stopped = true;
    unsubscribe?.();
    unsubscribe = null;
    clearInterval(refreshTimer);
  };
  const refreshExternal = async () => {
    const next = await loadExternalAvailability();
    if (stopped) return;
    external = next;
    emit();
  };
  const ready = withTimeout(
    new Promise((resolve, reject) => {
      firestore()
        .then((fs) => {
          if (stopped) return resolve(null);
          refreshExternal();
          refreshTimer = setInterval(refreshExternal, EXTERNAL_REFRESH_MS);
          unsubscribe = fs.onSnapshot(
            upcoming(fs),
            (snap) => {
              own = toMap(snap);
              resolve(mergeAvailability(own, external));
              emit();
            },
            (e) => {
              console.warn('Dostupnost (uživo) nije dostupna:', e.message);
              reject(e);
            }
          );
        })
        .catch(reject);
    }),
    8000
  ).catch((e) => {
    console.warn('Dostupnost nije učitana:', e.message);
    stop();
    return null;
  });
  return { ready, stop };
}
