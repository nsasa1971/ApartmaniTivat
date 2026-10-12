// ============================================================
//  CENTRALNI SADRŽAJ SAJTA
//  Sve tekstove, slike, plaže, utiske i linkove menjaš OVDE.
//  Tekst u uglastim zagradama [...] je placeholder – zameni ga svojim.
//  Posle izmene: osveži stranicu (dev) ili pokreni `npm run build`.
// ============================================================

// ---------- Osnovne informacije o sajtu (koriste se i za SEO/meta) ----------
export const site = {
  brand: '[NAZIV BRENDA]',
  // Pun URL sajta bez završne kose crte, npr. 'https://www.moji-apartmani.me'
  url: 'https://[VAŠ-DOMEN]',
  title: '[NAZIV BRENDA] – Apartmani u Tivtu',
  description:
    '[KRATAK OPIS – 150 do 160 karaktera: apartmani za odmor u Tivtu, blizina mora, kapacitet, direktna rezervacija.]',
  ogDescription: '[KRATAK OPIS]',
  ogImage: 'assets/img/og.jpg', // 1200×630
  locale: 'sr_ME',
  themeColor: '#191B18',
};

// ---------- Konfiguracija ponašanja ----------
export const config = {
  minGuests: 1,
  maxGuests: 8,
  defaultGuests: 2,

  // Slanje forme za upit. Ako nije podešeno, forma koristi `mailto:` fallback.
  //  - Formspree:  provider: 'formspree', endpoint: 'https://formspree.io/f/xxxxxxxx'
  //  - Web3Forms:  provider: 'web3forms', web3formsAccessKey: 'vaš-access-key'
  form: {
    provider: 'formspree', // 'formspree' | 'web3forms'
    endpoint: 'https://formspree.io/f/mgaozble',
    web3formsAccessKey: '',
    minFillSeconds: 4, // zaštita od botova: brže slanje od ovoga se odbija
  },
};

// ---------- Kontakt podaci (prikazuju se pored forme) ----------
export const contact = {
  phone: '[+382 XX XXX XXX]',
  email: '[email@vas-domen.me]',
  whatsapp: '[+382XXXXXXXX]', // međunarodni format
  viber: '[+382XXXXXXXX]', // međunarodni format
  address: '[Ulica i broj]',
  city: 'Tivat',
  country: 'ME',
};

export const social = {
  instagram: 'https://instagram.com/[NALOG]',
};

// ---------- Hero ----------
export const hero = {
  image: { src: 'assets/img/hero.jpg', width: 1920, height: 900 },
  subtitle: '[Podnaslov – npr. Apartmani u Tivtu]',
  title: '[NAZIV BRENDA]',
  text: '[Jedna do dve rečenice o apartmanima: lokacija, atmosfera, kome su namenjeni. Tekst iz originala je potpuno zamenjen.]',
};

export const logo = { src: 'assets/img/logo.png', width: 211, height: 100 };

// ---------- Uvodna sekcija (slika preklapa sekciju) ----------
export const intro = {
  image: { src: 'assets/img/foto1.jpg', width: 605, height: 806, alt: '[Opis fotografije]' },
  title: '[Naslov sekcije]',
  text: '[Dva do tri rečenice o apartmanima – stil, komfor, pogled, kapacitet. Zameniti sopstvenim tekstom.]',
  href: '#rezervacija',
};

// ---------- Galerija (6 slika; thumb 394×394, full 1240×827) ----------
export const gallery = [1, 2, 3, 4, 5, 6].map((n) => ({
  full: `assets/img/gallery-${n}.jpg`,
  thumb: `assets/img/thumb-${n}.jpg`,
  alt: `[Opis ${n}]`,
}));

// ---------- Tekst + slika (svetla sekcija) ----------
export const feature = {
  title: '[Naslov – npr. Mir i privatnost]',
  text: '[Dve rečenice – npr. opis lokacije, terase, pogleda i kapaciteta (do X osoba).]',
  href: '#rezervacija',
  image: { src: 'assets/img/foto2.jpg', width: 1240, height: 827, alt: '[Opis]' },
};

// ---------- Utisci gostiju (koristiti samo prave recenzije uz dozvolu gosta) ----------
export const reviews = [
  {
    title: '[Naslov utiska]',
    rating: 5,
    text: '[Citat gosta – 2 do 4 rečenice. Koristiti samo prave recenzije uz dozvolu gosta.]',
    name: '[Ime gosta]',
    avatar: 'assets/img/avatar.png',
  },
  {
    title: '[Naslov utiska]',
    rating: 5,
    text: '[Citat gosta – 2 do 4 rečenice.]',
    name: '[Ime gosta]',
    avatar: 'assets/img/avatar.png',
  },
];

// ---------- Tamna sekcija (tekst + slika sa ofsetom) ----------
export const dark = {
  title: '[Naslov – npr. Odmor na dva koraka od mora]',
  text: '[Dve rečenice – npr. za koga je smeštaj idealan i šta je u blizini.]',
  href: '#plaze',
  image: { src: 'assets/img/foto3.jpg', width: 2500, height: 1667, alt: '[Opis]' },
};

// ---------- Plaže (kartice). `link` je opcion (npr. Google Maps); prazno = nije link ----------
export const beaches = {
  title: 'Plaže koje vredi posetiti',
  items: [1, 2, 3].map((n) => ({
    name: `[Naziv plaže ${n}]`,
    image: { src: `assets/img/beach-${n}.jpg`, width: 1024, height: 768, alt: '[Naziv plaže]' },
    link: '',
  })),
};

// ---------- Opcione sekcije (isti obrazac kao plaže). Uključi sa enabled: true ----------
// Kada ih uključiš, linkovi "Hrana" / "Znamenitosti" se automatski pojavljuju u meniju.
export const extraSections = {
  food: {
    enabled: false,
    id: 'hrana',
    title: '[Naslov – Hrana]',
    items: [
      { name: '[Naziv 1]', image: { src: 'assets/img/beach-1.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
      { name: '[Naziv 2]', image: { src: 'assets/img/beach-2.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
      { name: '[Naziv 3]', image: { src: 'assets/img/beach-3.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
    ],
  },
  sights: {
    enabled: false,
    id: 'znamenitosti',
    title: '[Naslov – Znamenitosti]',
    items: [
      { name: '[Naziv 1]', image: { src: 'assets/img/beach-1.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
      { name: '[Naziv 2]', image: { src: 'assets/img/beach-2.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
      { name: '[Naziv 3]', image: { src: 'assets/img/beach-3.jpg', width: 1024, height: 768, alt: '[Opis]' }, link: '' },
    ],
  },
};

// ---------- Apartmani (lista za izbor u formi za upit; ne izmišljaj podatke) ----------
export const apartments = [
  { id: 'apartman-1', name: '[Apartman 1]', description: '[Kratak opis apartmana 1]' },
  { id: 'apartman-2', name: '[Apartman 2]', description: '[Kratak opis apartmana 2]' },
];

// ---------- Sekcija rezervacije / upita ----------
export const booking = {
  title: '[Naslov poziva na rezervaciju]',
  text: '[Kratak tekst – direktna rezervacija, najbolja cena, odgovor u roku od X sati.]',
  privacyHref: 'politika-privatnosti.html',
};

// ---------- Footer ----------
export const footer = {
  about: '[Kratak opis brenda – 2 do 3 rečenice.]',
  privacyHref: 'politika-privatnosti.html',
};
