// ============================================================
//  Javni sajt: čitanje kolekcije `availability` (samo datumi, bez ličnih podataka).
//  Ako Firebase nije podešen ili nije dostupan, vraća null i sajt radi bez kalendara.
// ============================================================
import { isFirebaseConfigured, firestore } from './firebase-client.js';
import { todayLocal } from './availability.js';

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

let cache;

/** Vraća Map: apartmentId → [{from, to}] (samo termini koji se završavaju danas ili kasnije), ili null. */
export function loadAvailability() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  return (cache ??= withTimeout(
    (async () => {
      const { db, collection, query, where, getDocs } = await firestore();
      const snap = await getDocs(query(collection(db, 'availability'), where('to', '>=', todayLocal())));
      const map = new Map();
      snap.forEach((d) => {
        const { apartmentId, from, to } = d.data();
        if (!map.has(apartmentId)) map.set(apartmentId, []);
        map.get(apartmentId).push({ from, to });
      });
      return map;
    })(),
    8000
  ).catch((e) => {
    cache = undefined; // pokušaj ponovo pri sljedećem pozivu
    console.warn('Dostupnost nije učitana:', e.message);
    return null;
  }));
}
