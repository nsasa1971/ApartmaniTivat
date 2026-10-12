// ============================================================
//  CENTRALNI SADRŽAJ SAJTA – Tivat Garden Homes
//  Sve tekstove, slike, apartmane, cijene, plaže i linkove mijenjaš OVDE.
//  Tekst u uglastim zagradama [...] je placeholder – zamijeni ga pravim podatkom.
//  Posle izmjene: osvježi stranicu (dev) ili pokreni `npm run build`.
// ============================================================

// ---------- Osnovne informacije o sajtu (koriste se i za SEO/meta) ----------
export const site = {
  brand: 'Tivat Garden Homes',
  // Planirani domen: apartmanigardentivat.com
  // TODO: kad se domen poveže, ovde upiši 'https://apartmanigardentivat.com' (bez završne kose crte)
  // i dodaj CNAME fajl (vidi README). Do tada ostaje placeholder.
  url: 'https://[VAŠ-DOMEN]',
  title: 'Tivat Garden Homes – Apartmani u Tivtu',
  description:
    'Holiday home Olive, Lavanda i Lemoni u Tivtu: mediteranski ambijent među maslinama, plaža oko 300 m, Porto Montenegro oko 1 km. Pošaljite upit za boravak.',
  ogDescription: 'Apartmani u Tivtu: Holiday home Olive, Lavanda i Lemoni – mediteranski ambijent među maslinama.',
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

// ---------- Kontakt podaci (prikazuju se pored forme, u footeru i u JSON-LD) ----------
// Prazna vrijednost ('') = stavka se ne prikazuje.
export const contact = {
  phone: '+38269506646', // koristi se za tel: link
  phoneDisplay: '+382 69 506 646', // prikaz na sajtu
  email: '[EMAIL]',
  whatsapp: '', // dodati kad se potvrdi broj, npr. '+38269506646'
  viber: '', // dodati kad se potvrdi broj
  address: 'Bonići I bb',
  city: 'Tivat',
  country: 'ME',
  countryName: 'Crna Gora',
  mapQuery: 'Bonići, Tivat, Crna Gora',
};

export const social = {
  instagram: 'https://instagram.com/[INSTAGRAM]',
};

// ---------- Hero ----------
export const hero = {
  image: { src: 'assets/img/hero.jpg', width: 1920, height: 900 },
  subtitle: 'Apartmani u Tivtu',
  title: 'Tivat Garden Homes',
  text: 'Holiday home Olive, Holiday home Lavanda i Holiday home Lemoni nalaze se na odličnoj lokaciji u Tivtu, u mirnom mediteranskom ambijentu okruženom maslinama.',
};

export const logo = { src: 'assets/img/logo.png', width: 211, height: 100 };

// ---------- Uvodna sekcija (slika preklapa sekciju) ----------
export const intro = {
  image: { src: 'assets/img/foto1.jpg', width: 605, height: 806, alt: '[Opis fotografije]' },
  title: 'Odlična lokacija i dobra povezanost',
  text: 'U neposrednoj blizini su autobuska stanica i taxi stajalište, a aerodrom je lako dostupan. Plaža je udaljena oko 300 m, dva velika marketa oko 50 m, restoran oko 70 m, a Porto Montenegro oko 1 km.',
  href: '#apartmani',
};

// ---------- Apartmani (kartice + izbor u formi za upit) ----------
// id se koristi u formi i u data/availability.json.
// Opis i sadržaj prepisani iz teksta klijenta.
export const apartmentsSection = {
  id: 'apartmani',
  title: 'Apartmani',
};

const yard = 'Prostrano dvorište u hladu maslina sa vanjskim roštiljem';
const lavandaLemoniSummary =
  'Jedna velika spavaća soba sa bračnim krevetom i sofom. Dnevna soba sa velikom ugaonom garniturom na razvlačenje, potpuno opremljena kuhinja i kupatilo.';

export const apartments = [
  {
    id: 'olive',
    name: 'Holiday home Olive',
    area: '50 m²',
    guests: '2–4 osobe',
    summary:
      'Dvije odvojene spavaće sobe, svaka sa bračnim krevetom. Dnevna soba sa sofom, potpuno opremljena kuhinja i kupatilo.',
    features: ['TV, internet i dva klima uređaja', 'Poseban ulaz i terasa', yard, 'Parking'],
    image: { src: 'assets/img/apartman-1.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Olive]' },
  },
  {
    id: 'lavanda',
    name: 'Holiday home Lavanda',
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniSummary,
    features: ['TV, internet i dva klima uređaja', 'Poseban ulaz i terasa', yard, 'Parking'],
    image: { src: 'assets/img/apartman-2.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Lavanda]' },
  },
  {
    id: 'lemoni',
    name: 'Holiday home Lemoni',
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniSummary, // isti raspored i sadržaj kao Lavanda
    features: ['TV, internet i dva klima uređaja', 'Poseban ulaz i terasa', yard, 'Parking'],
    image: { src: 'assets/img/apartman-3.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Lemoni]' },
  },
];

// ---------- Cijene ----------
export const pricing = {
  id: 'cijene',
  title: 'Cijene',
  items: [
    { label: 'Van glavne sezone', note: '', price: '100 €', unit: 'po danu' },
    { label: 'Od 01.06. do 01.09.', note: '', price: '120 €', unit: 'po danu' },
    { label: 'Novogodišnji praznici', note: '31.12., 01.01. i 02.01.', price: '120 €', unit: 'po danu' },
  ],
  // Na šta se cijena odnosi još nije potvrđeno – ne pisati "po apartmanu" / "po osobi" dok klijent ne potvrdi.
  basis: 'Cijena važi: [POTVRDITI: po apartmanu]',
  discounts: [
    '[POTVRDITI sa klijentom tačan tekst: popust 10% za boravak od/do 10 dana]',
    'Za boravak od mjesec dana povoljnija cijena, popust do 20%.',
  ],
  disclaimer: 'Cijene su informativne. Tačnu ponudu pošaljite preko forme za upit.',
};

// ---------- Galerija (6 slika; thumb 394×394, full 1240×827) ----------
export const gallery = [1, 2, 3, 4, 5, 6].map((n) => ({
  full: `assets/img/gallery-${n}.jpg`,
  thumb: `assets/img/thumb-${n}.jpg`,
  alt: `[Opis ${n}]`,
}));

// ---------- Tekst + slika (svijetla sekcija) ----------
export const feature = {
  title: 'Mediteranski ambijent među maslinama',
  text: 'Apartmani pružaju miran i prijatan mediteranski ambijent okružen maslinama, uz blizinu mora, strogog centra grada i svih važnih sadržaja.',
  href: '#apartmani',
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
  title: 'Za kraći i duži boravak',
  text: 'Blizina mora, strogog centra grada i svih važnih sadržaja čini apartmane odličnim izborom za kraći i duži boravak.',
  href: '#plaze',
  image: { src: 'assets/img/foto3.jpg', width: 2500, height: 1667, alt: '[Opis]' },
};

// ---------- Plaže (kartice). `link` je opcion (npr. Google Maps); prazno = nije link ----------
// Samo naziv + placeholder za opis; udaljenosti i tvrdnje dodati tek kad se potvrde.
const beach = (n, name) => ({
  name,
  desc: '[Jedna rečenica opisa plaže]',
  image: { src: `assets/img/beach-${n}.jpg`, width: 1024, height: 768, alt: name },
  link: '',
});
export const beaches = {
  title: 'Plaže koje vrijedi posjetiti',
  items: [beach(1, 'Kaluman'), beach(2, 'Plavi horizonti'), beach(3, 'Jaz')],
};

// ---------- Dodatne sekcije (isti obrazac kao plaže; pojavljuju se u meniju i footeru) ----------
export const extraSections = {
  // ZA PROVJERU KLIJENTA: opšti opisi znamenitosti – klijent treba da provjeri tekst.
  sights: {
    enabled: true,
    id: 'znamenitosti',
    title: 'Znamenitosti u okolini',
    items: [
      {
        name: 'Tivat – Porto Montenegro i centar',
        desc: 'Šetnja obalom, jahte u marini Porto Montenegro i kafići u centru grada.',
        image: { src: 'assets/img/sight-1.jpg', width: 1024, height: 768, alt: 'Tivat – Porto Montenegro i centar' },
        link: '',
      },
      {
        name: 'Kotor',
        desc: 'Poznat po starom gradu sa kamenim ulicama i trgovima, okruženom gradskim zidinama i planinama iznad zaliva.',
        image: { src: 'assets/img/sight-2.jpg', width: 1024, height: 768, alt: 'Kotor' },
        link: '',
      },
      {
        name: 'Budva',
        desc: 'Poznata po starom gradu, plažama i živom ljetnjem životu na crnogorskom primorju.',
        image: { src: 'assets/img/sight-3.jpg', width: 1024, height: 768, alt: 'Budva' },
        link: '',
      },
    ],
  },
  // ZA PROVJERU KLIJENTA: spisak jela treba da potvrdi klijent. Bez restorana, cijena i adresa.
  food: {
    enabled: true,
    id: 'hrana',
    title: 'Mediteranska kuhinja',
    intro:
      'Crnogorsko primorje poznato je po jednostavnoj mediteranskoj kuhinji zasnovanoj na svježoj ribi, maslinovom ulju i domaćim specijalitetima.',
    items: [
      {
        name: 'Riba na žaru',
        desc: 'Svježa riba pečena na žaru, uz maslinovo ulje i limun.',
        image: { src: 'assets/img/food-1.jpg', width: 1024, height: 768, alt: 'Riba na žaru' },
        link: '',
      },
      {
        name: 'Crni rižoto',
        desc: 'Rižoto od sipe, tamne boje od sipinog mastila, čest izbor na primorju.',
        image: { src: 'assets/img/food-2.jpg', width: 1024, height: 768, alt: 'Crni rižoto' },
        link: '',
      },
      {
        name: 'Brudet',
        desc: 'Tradicionalno jelo od ribe krčkane u sosu od paradajza i maslinovog ulja.',
        image: { src: 'assets/img/food-3.jpg', width: 1024, height: 768, alt: 'Brudet' },
        link: '',
      },
      {
        name: 'Pršut i sir',
        desc: 'Domaći pršut i sir, klasična hladna zakuska uz čašu vina.',
        image: { src: 'assets/img/food-4.jpg', width: 1024, height: 768, alt: 'Pršut i sir' },
        link: '',
      },
      {
        name: 'Maslinovo ulje i masline',
        desc: 'Masline i maslinovo ulje su osnova mediteranske trpeze.',
        image: { src: 'assets/img/food-5.jpg', width: 1024, height: 768, alt: 'Maslinovo ulje i masline' },
        link: '',
      },
    ],
  },
};

// ---------- Sekcija rezervacije / upita ----------
export const booking = {
  title: 'Pošaljite upit za rezervaciju',
  text: 'Izaberite termin, broj gostiju i apartman, a mi ćemo vam se javiti.',
  privacyHref: 'politika-privatnosti.html',
};

// ---------- Footer ----------
export const footer = {
  about:
    'Holiday home Olive, Lavanda i Lemoni nalaze se na odličnoj lokaciji u Tivtu. Apartmani pružaju miran i prijatan mediteranski ambijent okružen maslinama, uz blizinu mora i strogog centra grada.',
  privacyHref: 'politika-privatnosti.html',
};
