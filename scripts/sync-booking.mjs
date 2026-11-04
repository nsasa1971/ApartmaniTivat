// ============================================================
//  Sinhronizacija Booking.com kalendara (iCal) → Firestore `availability`.
//  Pokretanje: node scripts/sync-booking.mjs [--dry-run]   (u produkciji ga pokreće GitHub Actions)
//
//  Okruženje (GitHub Secrets – NIKAD u repozitorijumu, ne ispisuju se u logovima):
//    FIREBASE_SERVICE_ACCOUNT   JSON ključ servisnog naloga
//    BOOKING_ICAL_OLIVE, BOOKING_ICAL_LAVANDA, BOOKING_ICAL_LEMONI   iCal linkovi sa Bookinga
//
//  Pravila: upisuje/briše SAMO dokumente sa source === 'booking'. Ako feed ne može da se preuzme ili parsira,
//  taj apartman se preskače, a postojeći Booking blokovi ostaju netaknuti.
// ============================================================
import { apartments } from '../assets/js/content.js';
import { parseBookingIcs, planApartmentSync, safeMessage, SOURCE } from './lib/booking-ical.mjs';

const dryRun = process.argv.includes('--dry-run');
const FETCH_TIMEOUT_MS = 20000;
const MAX_BYTES = 5 * 1024 * 1024;
const BATCH_LIMIT = 400; // Firestore dozvoljava 500 operacija po batch-u

const envName = (id) => `BOOKING_ICAL_${id.toUpperCase()}`;
const feeds = apartments.map((a) => ({ id: a.id, env: envName(a.id), url: (process.env[envName(a.id)] ?? '').trim() }));
const secrets = [process.env.FIREBASE_SERVICE_ACCOUNT, ...feeds.map((f) => f.url)].filter(Boolean);
const log = (...a) => console.log(...a);

async function fetchFeed(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { accept: 'text/calendar, text/plain, */*' } });
  if (res.status !== 200) throw new Error(`Preuzimanje nije uspjelo (HTTP ${res.status}).`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error('Feed je neočekivano velik.');
  return text;
}

async function openFirestore() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  let credentials;
  try {
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT nije validan JSON.');
  }
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getFirestore, Timestamp } = await import('firebase-admin/firestore');
  initializeApp({ credential: cert(credentials) });
  return { db: getFirestore(), Timestamp };
}

async function commitInBatches(db, ops) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + BATCH_LIMIT)) op(batch);
    await batch.commit();
  }
}

async function main() {
  log(dryRun ? 'Booking sinhronizacija – DRY RUN (ništa se ne upisuje).' : 'Booking sinhronizacija.');
  const fs = await openFirestore();
  if (!fs && !dryRun) throw new Error('FIREBASE_SERVICE_ACCOUNT nije podešen.');
  if (!fs) log('FIREBASE_SERVICE_ACCOUNT nije podešen: dry-run samo parsira feedove, bez poređenja sa bazom.');

  let existing = null;
  if (fs) existing = (await fs.db.collection('availability').where('source', '==', SOURCE).get()).docs.map((d) => ({ id: d.id, data: d.data() }));

  const counts = {};
  const errors = [];
  for (const feed of feeds) {
    try {
      if (!feed.url) throw new Error(`${feed.env} nije podešen.`);
      const blocks = parseBookingIcs(await fetchFeed(feed.url));
      counts[feed.id] = blocks.length;
      if (!existing) {
        log(`[${feed.id}] ${blocks.length} blok(ova) u feedu.`);
        for (const b of blocks) log(`    ${b.from} → ${b.to}`);
        continue;
      }
      const plan = planApartmentSync(feed.id, blocks, existing);
      log(`[${feed.id}] feed: ${blocks.length}, novo/izmijenjeno: ${plan.upserts.length}, nepromijenjeno: ${plan.unchanged.length}, za brisanje: ${plan.deletes.length}`);
      for (const u of plan.upserts) log(`    + ${u.data.from} → ${u.data.to}`);
      for (const d of plan.deletes) log(`    - ${d.data.from} → ${d.data.to}`);
      if (dryRun) continue;
      const col = fs.db.collection('availability');
      await commitInBatches(fs.db, [
        ...plan.upserts.map((u) => (batch) => batch.set(col.doc(u.id), u.data)),
        ...plan.deletes.map((d) => (batch) => batch.delete(col.doc(d.id))),
      ]);
    } catch (e) {
      const message = safeMessage(e, secrets);
      errors.push(`${feed.id}: ${message}`);
      console.error(`[${feed.id}] GREŠKA: ${message} (postojeći Booking blokovi nisu dirani)`);
    }
  }

  if (fs && !dryRun) {
    const now = fs.Timestamp.now();
    const status = { lastAttemptAt: now, lastError: errors.length ? errors.join(' | ').slice(0, 500) : null };
    if (!errors.length) status.lastSuccessAt = now;
    // brojevi blokova se mijenjaju samo za apartmane koji su uspješno sinhronizovani
    await fs.db.doc('meta/bookingSync').set({ ...status, blocks: counts }, { merge: true });
  }
  log(errors.length ? `Završeno sa greškama (${errors.length}).` : 'Završeno bez grešaka.');
  if (errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`GREŠKA: ${safeMessage(e, secrets)}`);
  process.exitCode = 1;
});
