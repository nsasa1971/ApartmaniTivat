// ============================================================
//  Javni sajt: čitanje kolekcije `availability` (samo javna polja apartmentId, from, to – bez ličnih podataka).
//  Ako Firebase nije podešen ili nije dostupan, vraća null i sajt radi bez kalendara.
//    - watchAvailability(): uživo (onSnapshot), za kalendar dostupnosti; stop() odjavljuje listener
//    - loadAvailability():  jednokratno, uvijek sa servera (bez keša), za provjeru termina pri slanju upita
// ============================================================
import { isFirebaseConfigured, firestore } from './firebase-client.js';
import { todayLocal } from './availability.js';

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

const upcoming = ({ collection, query, where, db }) => query(collection(db, 'availability'), where('to', '>=', todayLocal()));

let inflight;

/** Jednokratno čitanje sa servera. Vraća Map ili null. Istovremeni pozivi dijele jedan zahtjev, ali se ništa ne kešira. */
export function loadAvailability() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  return (inflight ??= withTimeout(
    (async () => {
      const fs = await firestore();
      return toMap(await fs.getDocs(upcoming(fs)));
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
  const stop = () => {
    stopped = true;
    unsubscribe?.();
    unsubscribe = null;
  };
  const ready = withTimeout(
    new Promise((resolve, reject) => {
      firestore()
        .then((fs) => {
          if (stopped) return resolve(null);
          unsubscribe = fs.onSnapshot(
            upcoming(fs),
            (snap) => {
              const map = toMap(snap);
              resolve(map);
              if (!stopped) onChange(map);
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
