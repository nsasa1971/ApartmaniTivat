// Testovi firestore.rules (Firebase Emulator). Pokretanje: vidi README ("Testiranje pravila").
import test, { before, after, beforeEach } from 'node:test';
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, addDoc, collection, getDocs, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

const OWNER = 'test-owner-uid';
const OWNER2 = 'test-second-owner-uid';
// u testu zamjenjujemo UID iz ownerUids() sa dva test UID-a (provjera da lista radi sa više vlasnica)
const rules = fs
  .readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8')
  .replace("return ['PTsPq8QOzFa1VUN9A5ekLPHzK6I3'];", `return ['${OWNER}', '${OWNER2}'];`);
if (!rules.includes(OWNER2)) throw new Error('ownerUids() u firestore.rules nije u očekivanom obliku');

let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'tgh-rules-test', firestore: { rules, host: '127.0.0.1', port: 8080 } });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const owner = () => env.authenticatedContext(OWNER).firestore();
const owner2 = () => env.authenticatedContext(OWNER2).firestore();
const other = () => env.authenticatedContext('somebody-else').firestore();
const anon = () => env.unauthenticatedContext().firestore();

const goodInquiry = () => ({
  guestName: 'Gost', email: 'gost@example.com', phone: '', messengers: '', apartmentId: 'olive',
  from: '2030-07-10', to: '2030-07-12', guests: 2, message: 'Zdravo', status: 'new', createdAt: serverTimestamp(),
});
const booking = { apartmentId: 'olive', guestName: 'Gost', phone: '1', email: 'a@b.c', from: '2030-07-10', to: '2030-07-12', guests: 2, source: 'direct', price: null, note: 'tajna', blockedOnBooking: false };
const avail = { apartmentId: 'olive', from: '2030-07-10', to: '2030-07-12', bookingId: 'b1' };

test('bookings su privatne', async () => {
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'bookings/b1'), booking));
  await assertFails(getDoc(doc(anon(), 'bookings/b1')));
  await assertFails(getDoc(doc(other(), 'bookings/b1')));
  await assertFails(getDocs(collection(anon(), 'bookings')));
  await assertSucceeds(getDoc(doc(owner(), 'bookings/b1')));
  await assertFails(setDoc(doc(anon(), 'bookings/b2'), booking));
  await assertFails(setDoc(doc(other(), 'bookings/b2'), booking));
  await assertSucceeds(setDoc(doc(owner(), 'bookings/b2'), booking));
});

test('više vlasnica: oba UID-a iz liste imaju pristup, ostali ne', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'bookings/m1'), booking));
  await assertSucceeds(getDoc(doc(owner2(), 'bookings/m1')));
  await assertFails(getDoc(doc(other(), 'bookings/m1')));
});

test('availability: javno čitanje, pisanje samo vlasnica, samo datumi', async () => {
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'availability/b1'), avail));
  await assertSucceeds(getDoc(doc(anon(), 'availability/b1')));
  await assertSucceeds(getDocs(collection(anon(), 'availability')));
  await assertFails(setDoc(doc(anon(), 'availability/x'), avail));
  await assertFails(setDoc(doc(other(), 'availability/x'), avail));
  await assertSucceeds(setDoc(doc(owner(), 'availability/x'), avail));
  // nikakvi lični podaci čak ni od vlasnice
  await assertFails(setDoc(doc(owner(), 'availability/y'), { ...avail, guestName: 'Marko' }));
  await assertFails(setDoc(doc(owner(), 'availability/y'), { ...avail, phone: '123' }));
  await assertFails(setDoc(doc(owner(), 'availability/y'), { ...avail, to: '2030-07-10' }));
  await assertFails(setDoc(doc(owner(), 'availability/y'), { ...avail, from: 'sjutra' }));
  await assertFails(deleteDoc(doc(anon(), 'availability/b1')));
  await assertSucceeds(deleteDoc(doc(owner(), 'availability/b1')));
});

test('atomski batch: booking + availability (vlasnica)', async () => {
  const db = owner();
  const b = writeBatch(db);
  b.set(doc(db, 'bookings/n1'), booking);
  b.set(doc(db, 'availability/n1'), { ...avail, bookingId: 'n1' });
  await assertSucceeds(b.commit());
});

test('apartments: javno čitanje, pisanje samo vlasnica', async () => {
  await assertSucceeds(getDocs(collection(anon(), 'apartments')));
  await assertFails(setDoc(doc(anon(), 'apartments/olive'), { naziv: 'x', kapacitet: 4 }));
  await assertFails(setDoc(doc(other(), 'apartments/olive'), { naziv: 'x', kapacitet: 4 }));
  await assertSucceeds(setDoc(doc(owner(), 'apartments/olive'), { naziv: 'x', kapacitet: 4 }));
});

test('inquiries: javno samo validan create', async () => {
  await assertSucceeds(addDoc(collection(anon(), 'inquiries'), goodInquiry()));
  await assertSucceeds(addDoc(collection(anon(), 'inquiries'), { ...goodInquiry(), apartmentId: '' }));
  const bad = [
    { ...goodInquiry(), status: 'accepted' },
    { ...goodInquiry(), extra: 'x' },
    { ...goodInquiry(), guestName: '' },
    { ...goodInquiry(), guestName: 'x'.repeat(101) },
    { ...goodInquiry(), email: 'nije-email' },
    { ...goodInquiry(), message: 'x'.repeat(2001) },
    { ...goodInquiry(), phone: 'x'.repeat(41) },
    { ...goodInquiry(), guests: 0 },
    { ...goodInquiry(), guests: 21 },
    { ...goodInquiry(), guests: '2' },
    { ...goodInquiry(), apartmentId: 'vila' },
    { ...goodInquiry(), from: '10.07.2030' },
    { ...goodInquiry(), to: '2030-07-10' },
    { ...goodInquiry(), createdAt: new Date('2020-01-01') },
  ];
  for (const [i, d] of bad.entries()) await assertFails(addDoc(collection(anon(), 'inquiries'), d), `loš upit #${i}`);
  const { createdAt, ...noTs } = goodInquiry();
  await assertFails(addDoc(collection(anon(), 'inquiries'), noTs));
});

test('inquiries: čitanje/izmjena/brisanje samo vlasnica', async () => {
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'inquiries/q1'), { ...goodInquiry(), createdAt: new Date() }));
  await assertFails(getDoc(doc(anon(), 'inquiries/q1')));
  await assertFails(getDocs(collection(anon(), 'inquiries')));
  await assertFails(updateDoc(doc(anon(), 'inquiries/q1'), { status: 'accepted' }));
  await assertFails(deleteDoc(doc(anon(), 'inquiries/q1')));
  await assertFails(getDoc(doc(other(), 'inquiries/q1')));
  await assertSucceeds(getDoc(doc(owner(), 'inquiries/q1')));
  await assertSucceeds(updateDoc(doc(owner(), 'inquiries/q1'), { status: 'accepted' }));
  await assertSucceeds(deleteDoc(doc(owner(), 'inquiries/q1')));
});

test('nepoznate kolekcije su zatvorene', async () => {
  await assertFails(getDoc(doc(anon(), 'nesto/1')));
  await assertFails(setDoc(doc(owner(), 'nesto/1'), { a: 1 }));
});
