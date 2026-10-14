// ============================================================
//  FIREBASE KONFIGURACIJA
//  Web konfiguracija je javna po dizajnu (nije tajna) – bezbjednost čine
//  pravila u firestore.rules. Ovdje NE ide service account ključ ni bilo koja tajna.
//
//  Gdje se uzima: Firebase konzola → Project settings → General → Your apps → Web app → SDK setup (Config).
//  Dok vrijednosti ne upišeš, sajt radi normalno bez kalendara dostupnosti, a /admin pokazuje upozorenje.
// ============================================================
export const firebaseConfig = {
  apiKey: '[API_KEY]',
  authDomain: '[PROJECT_ID].firebaseapp.com',
  projectId: '[PROJECT_ID]',
  storageBucket: '[PROJECT_ID].firebasestorage.app',
  messagingSenderId: '[MESSAGING_SENDER_ID]',
  appId: '[APP_ID]',
};

/** true tek kada su apiKey, projectId i appId stvarne vrijednosti (nisu [placeholder]). */
export const isFirebaseConfigured = () =>
  ['apiKey', 'projectId', 'appId'].every((k) => firebaseConfig[k] && !/\[.*\]/.test(firebaseConfig[k]));
