// ============================================================
//  FIREBASE KONFIGURACIJA
//  Web konfiguracija je javna po dizajnu (nije tajna) – bezbjednost čine
//  pravila u firestore.rules. Ovdje NE ide service account ključ ni bilo koja tajna.
//
//  Gdje se uzima: Firebase konzola → Project settings → General → Your apps → Web app → SDK setup (Config).
//  Ako vrijednosti nisu upisane ([placeholder]), sajt radi normalno bez kalendara dostupnosti,
//  a /admin pokazuje upozorenje.
//  Firebase SDK se učitava lazy iz assets/js/firebase-client.js (modularni SDK sa Google CDN-a).
// ============================================================
export const firebaseConfig = {
  apiKey: 'AIzaSyCsX6zv1_8eE5St-uJdOmhQbxad4SM08Xk',
  authDomain: 'apartmani-tivat.firebaseapp.com',
  projectId: 'apartmani-tivat',
  storageBucket: 'apartmani-tivat.firebasestorage.app',
  messagingSenderId: '873935392679',
  appId: '1:873935392679:web:581d353fe3d32d770c3082',
};

/** true tek kada su apiKey, projectId i appId stvarne vrijednosti (nisu [placeholder]). */
export const isFirebaseConfigured = () =>
  ['apiKey', 'projectId', 'appId'].every((k) => firebaseConfig[k] && !/\[.*\]/.test(firebaseConfig[k]));
