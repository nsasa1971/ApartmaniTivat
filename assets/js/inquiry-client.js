// ============================================================
//  Javni sajt: upis upita u kolekciju `inquiries` (vlasnica ih vidi u /admin).
//  Pravila (firestore.rules) dozvoljavaju samo create sa strogom validacijom.
// ============================================================
import { isFirebaseConfigured, firestore } from './firebase-client.js';

/** Upisuje upit; vraća true ako je upisan, false ako Firebase nije podešen. Baca grešku ako upis ne uspije. */
export async function saveInquiry(d) {
  if (!isFirebaseConfigured()) return false;
  const run = async () => {
    const { db, collection, addDoc, serverTimestamp } = await firestore();
    await addDoc(collection(db, 'inquiries'), {
      guestName: d.name,
      email: d.email,
      phone: d.phone || '',
      messengers: d.messengers || '',
      apartmentId: d.apartmentId || '',
      from: d.checkin,
      to: d.checkout,
      guests: Number(d.guests),
      message: d.message || '',
      status: 'new',
      createdAt: serverTimestamp(),
    });
  };
  await Promise.race([run(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
  return true;
}
