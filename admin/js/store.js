// ============================================================
//  Sloj podataka za /admin (Firebase Authentication + Firestore).
//  Rezervacije se upisuju ATOMSKI (writeBatch) u `bookings` (privatno) i
//  `availability` (javno, samo datumi). availability/{id} ima isti ID kao bookings/{id}.
// ============================================================
import { authApi, firestore } from '../../assets/js/firebase-client.js';
import { DEFAULT_APARTMENTS } from './apartments.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const authErrorMessage = (e) =>
  ({
    'auth/invalid-credential': 'Pogrešan email ili lozinka.',
    'auth/wrong-password': 'Pogrešan email ili lozinka.',
    'auth/user-not-found': 'Pogrešan email ili lozinka.',
    'auth/invalid-email': 'Email adresa nije ispravna.',
    'auth/too-many-requests': 'Previše pokušaja. Sačekajte nekoliko minuta i pokušajte ponovo.',
    'auth/network-request-failed': 'Nema internet veze. Provjerite mrežu i pokušajte ponovo.',
    'auth/user-disabled': 'Ovaj nalog je onemogućen.',
  })[e?.code] || 'Došlo je do greške. Pokušajte ponovo.';

// ---------- prijava ----------
export async function watchAuth(cb) {
  const { auth, onAuthStateChanged } = await authApi();
  return onAuthStateChanged(auth, cb);
}
export async function signIn(email, password) {
  const { auth, signInWithEmailAndPassword } = await authApi();
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signOutUser() {
  const { auth, signOut } = await authApi();
  return signOut(auth);
}
export async function resetPassword(email) {
  const { auth, sendPasswordResetEmail } = await authApi();
  return sendPasswordResetEmail(auth, email);
}

// ---------- apartmani ----------
const dbp = () => firestore({ persistent: true });

/** Upisuje apartmane koji ne postoje; vraća listu (iz baze + podrazumijevani). */
export async function ensureApartments() {
  const { db, collection, doc, getDocs, setDoc, updateDoc } = await dbp();
  let existing = [];
  try {
    existing = (await getDocs(collection(db, 'apartments'))).docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Apartmani nisu učitani:', e.message);
  }
  const have = new Set(existing.map((a) => a.id));
  for (const a of DEFAULT_APARTMENTS) {
    const old = existing.find((x) => x.id === a.id);
    if (old && old.naziv !== a.naziv) {
      // ujednačen naziv (Olive / Lavanda / Lemoni) – ispravi i ranije upisan "Holiday home …"
      try {
        await updateDoc(doc(db, 'apartments', a.id), { naziv: a.naziv });
      } catch (e) {
        console.warn('Naziv apartmana nije ažuriran:', e.message);
      }
    }
    if (!have.has(a.id)) {
      try {
        await setDoc(doc(db, 'apartments', a.id), { naziv: a.naziv, kapacitet: a.kapacitet });
        existing.push({ ...a });
      } catch (e) {
        console.warn('Seed apartmana nije uspio:', e.message);
      }
    }
  }
  // naziv uvijek iz koda (jedinstven izvor), kapacitet iz baze ako postoji
  return DEFAULT_APARTMENTS.map((a) => {
    const d = existing.find((x) => x.id === a.id);
    return { ...a, kapacitet: Number.isInteger(d?.kapacitet) ? d.kapacitet : a.kapacitet };
  });
}

// ---------- pretplate (realtime + offline keš) ----------
export async function subscribeBookings(next, error) {
  const { db, collection, onSnapshot } = await dbp();
  return onSnapshot(collection(db, 'bookings'), (snap) => next(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), error);
}
export async function subscribeInquiries(next, error) {
  const { db, collection, query, orderBy, onSnapshot } = await dbp();
  return onSnapshot(
    query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
    (snap) => next(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    error
  );
}

// ---------- upis ----------
/** Čeka commit najviše 5 s; offline se promjena sinhronizuje kasnije ('pending'). */
async function commit(batch) {
  const p = batch.commit();
  const r = await Promise.race([p.then(() => 'ok'), sleep(5000).then(() => 'pending')]);
  if (r === 'pending') p.catch((e) => console.error('Sinhronizacija nije uspjela:', e));
  return r;
}

/**
 * Čuva rezervaciju (novu ili izmjenu) + availability dokument u jednom batch-u.
 * Ako je zadat inquiryId, upit se u istom batch-u označava kao prihvaćen.
 */
export async function saveBooking(data, { id = null, inquiryId = null } = {}) {
  const { db, collection, doc, writeBatch, serverTimestamp } = await dbp();
  const ref = id ? doc(db, 'bookings', id) : doc(collection(db, 'bookings'));
  const batch = writeBatch(db);
  const fields = {
    apartmentId: data.apartmentId,
    guestName: data.guestName,
    phone: data.phone || '',
    email: data.email || '',
    from: data.from,
    to: data.to,
    guests: Number(data.guests),
    source: data.source,
    price: data.price === '' || data.price == null ? null : Number(data.price),
    note: data.note || '',
    blockedOnBooking: data.source === 'direct' ? !!data.blockedOnBooking : false,
  };
  if (id) batch.update(ref, fields);
  else batch.set(ref, { ...fields, createdAt: serverTimestamp() });
  // JAVNO: samo datumi, nikada imena/telefoni/email/napomene
  batch.set(doc(db, 'availability', ref.id), { apartmentId: fields.apartmentId, from: fields.from, to: fields.to, bookingId: ref.id });
  if (inquiryId) batch.update(doc(db, 'inquiries', inquiryId), { status: 'accepted', bookingId: ref.id });
  return { id: ref.id, state: await commit(batch) };
}

export async function deleteBooking(id) {
  const { db, doc, writeBatch } = await dbp();
  const batch = writeBatch(db);
  batch.delete(doc(db, 'bookings', id));
  batch.delete(doc(db, 'availability', id));
  return commit(batch);
}

export async function setBlockedOnBooking(id, value) {
  const { db, doc, writeBatch } = await dbp();
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', id), { blockedOnBooking: !!value });
  return commit(batch);
}

export async function setInquiryStatus(id, status) {
  const { db, doc, writeBatch } = await dbp();
  const batch = writeBatch(db);
  batch.update(doc(db, 'inquiries', id), { status });
  return commit(batch);
}
