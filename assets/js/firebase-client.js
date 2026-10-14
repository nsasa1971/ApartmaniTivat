// ============================================================
//  Lazy učitavanje Firebase SDK-a (modularni ES moduli sa Google CDN-a).
//  Ništa se ne učitava dok se ne pozove firestore() / authApi() – sajt tako
//  ne plaća cijenu SDK-a dok posjetilac ne dođe do kalendara ili ne pošalje upit.
// ============================================================
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const VERSION = '10.14.1';
const base = `https://www.gstatic.com/firebasejs/${VERSION}`;

let appPromise;
const app = () => {
  if (!isFirebaseConfigured()) return Promise.reject(new Error('firebase-not-configured'));
  return (appPromise ??= import(`${base}/firebase-app.js`).then((m) => m.initializeApp(firebaseConfig)));
};

let dbPromise;
/**
 * Firestore. `persistent: true` (admin) uključuje offline keš u IndexedDB-u.
 * Vraća { db, ...funkcije iz firebase-firestore.js }.
 */
export const firestore = ({ persistent = false } = {}) =>
  (dbPromise ??= (async () => {
    const [a, fs] = await Promise.all([app(), import(`${base}/firebase-firestore.js`)]);
    const db = persistent
      ? fs.initializeFirestore(a, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) })
      : fs.getFirestore(a);
    return { db, ...fs };
  })().catch((e) => {
    dbPromise = undefined;
    throw e;
  }));

let authPromise;
/** Firebase Authentication (samo za /admin). Vraća { auth, ...funkcije iz firebase-auth.js }. */
export const authApi = () =>
  (authPromise ??= (async () => {
    const [a, au] = await Promise.all([app(), import(`${base}/firebase-auth.js`)]);
    return { auth: au.getAuth(a), ...au };
  })().catch((e) => {
    authPromise = undefined;
    throw e;
  }));

export { isFirebaseConfigured };
