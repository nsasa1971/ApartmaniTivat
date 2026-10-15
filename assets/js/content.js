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
  whatsapp: '+38269506646', // isti broj kao telefon
  viber: '+38269506646', // isti broj kao telefon
  address: 'Bonići I bb',
  city: 'Tivat',
  country: 'ME',
  countryName: 'Crna Gora',
  mapQuery: 'Bonići, Tivat, Crna Gora', // rezerva ako koordinate nisu upisane
  // Tačna lokacija apartmana (iz Google Maps linka koji je dao vlasnik; Plus code CPC6+PJ)
  lat: 42.4217772,
  lng: 18.7115365,
  mapUrl: 'https://maps.app.goo.gl/cu2iycnPNwBE63Pe6',
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
  // Pasusi se razdvajaju praznim redom (\n\n).
  text:
    'Holiday home Olive, Holiday home Lavanda i Holiday home Lemoni nalaze se na odličnoj lokaciji u Tivtu, sa veoma dobrom saobraćajnom povezanošću. U neposrednoj blizini nalaze se autobuska stanica i taxi stajalište, dok je aerodrom lako dostupan.\n\nPlaža je udaljena oko 300 m, dva velika marketa oko 50 m, restoran oko 70 m, dok je Porto Montenegro udaljen oko 1 km.',
  href: '#apartmani',
};

// ---------- Apartmani (kartice + izbor u formi za upit) ----------
// id se koristi u formi, u Firestore-u i u firestore.rules.
// Opis i sadržaj prepisani iz teksta klijenta.
export const apartmentsSection = {
  id: 'apartmani',
  title: 'Apartmani',
};

const lavandaLemoniText = (naziv) =>
  `Holiday home ${naziv} je prostran apartman od 60 m², namijenjen za 2 do 4 osobe. Sastoji se od jedne velike sobe sa bračnim krevetom i sofom, dnevnog boravka sa velikom ugaonom garniturom na razvlačenje, kupatila i potpuno opremljene kuhinje. Apartman ima poseban ulaz, terasu i prostrano dvorište u hladu maslina, sa vanjskim roštiljem, idealno za odmor i druženje. Moderan i funkcionalan raspored pruža gostima privatnost i udobnost tokom cijelog boravka.`;

// Lavanda i Lemoni imaju isti raspored i sadržaj.
// NAPOMENA: tekst klijenta za Lavandu/Lemoni ne pominje TV, internet i klima uređaje, ali su navedeni
// u ranijem opisu klijenta – ostavljeno u listi; potvrditi sa klijentom.
const lavandaLemoniFeatures = [
  'Spavaća soba sa bračnim krevetom i sofom',
  'Dnevna soba sa velikom ugaonom garniturom na razvlačenje',
  'Potpuno opremljena kuhinja i kupatilo',
  'TV, internet i dva klima uređaja',
  'Poseban ulaz, terasa i prostrano dvorište u hladu maslina sa vanjskim roštiljem',
  'Parking',
];

export const apartments = [
  {
    id: 'olive',
    name: 'Olive', // kratki naziv: forma, select, kalendar, admin
    fullName: 'Holiday home Olive', // puni naziv: samo u opisima na sajtu
    area: '50 m²',
    guests: '2–4 osobe',
    summary:
      'Holiday home Olive je komforan apartman površine 50 m², kapaciteta od 2 do 4 osobe. Raspolaže sa dvije odvojene spavaće sobe, od kojih svaka ima bračni krevet. Posebno je izdvojen dnevni boravak sa potpuno opremljenom kuhinjom, kao i kupatilo. Gostima su na raspolaganju TV, internet i dva klima uređaja. Apartman ima poseban ulaz, terasu, prostrano dvorište u hladu maslina sa vanjskim roštiljem i obezbjeđen parking, što ga čini odličnim izborom za parove, porodice i duži boravak.',
    features: [
      'Dvije odvojene spavaće sobe sa bračnim krevetom',
      'Dnevna soba sa sofom',
      'Potpuno opremljena kuhinja i kupatilo',
      'TV, internet i dva klima uređaja',
      'Poseban ulaz, terasa, prostrano dvorište u hladu maslina sa vanjskim roštiljem',
      'Parking',
    ],
    image: { src: 'assets/img/apartman-1.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Olive]' },
  },
  {
    id: 'lavanda',
    name: 'Lavanda', // kratki naziv: forma, select, kalendar, admin
    fullName: 'Holiday home Lavanda', // puni naziv: samo u opisima na sajtu
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniText('Lavanda'),
    features: lavandaLemoniFeatures,
    image: { src: 'assets/img/apartman-2.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Lavanda]' },
  },
  {
    id: 'lemoni',
    name: 'Lemoni', // kratki naziv: forma, select, kalendar, admin
    fullName: 'Holiday home Lemoni', // puni naziv: samo u opisima na sajtu
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniText('Lemoni'),
    features: lavandaLemoniFeatures,
    image: { src: 'assets/img/apartman-3.jpg', width: 1024, height: 768, alt: '[Opis fotografije – Holiday home Lemoni]' },
  },
];

// ---------- Cijene ----------
export const pricing = {
  id: 'cijene',
  title: 'Cijene i pogodnosti',
  items: [
    { label: 'Van glavne sezone', note: '', price: '100 €', unit: 'po danu' },
    { label: 'Od 01.06. do 01.09.', note: '', price: '120 €', unit: 'po danu' },
    { label: 'Novogodišnji praznici', note: '31.12., 01.01. i 02.01.', price: '120 €', unit: 'po danu' },
  ],
  basis: 'Cijene važe po apartmanu.',
  discounts: [
    'Za boravak od 10 dana i više moguć je popust od 10%.',
    'Za boravak od mjesec dana moguća je povoljnija cijena, popust do 20%.',
  ],
  disclaimer: 'Cijene su informativne. Tačnu ponudu pošaljite preko forme za upit.',
};

// ---------- Galerija (thumb 394×394, full 1240×827) ----------
// Broj slika: promijeni GALLERY_COUNT i pokreni `npm run gallery` sa istim brojem slika.
// Opise (alt) upiši u galleryAlts po redoslijedu slika, npr. 'Dnevna soba – Holiday home Olive'.
const GALLERY_COUNT = 15;
const galleryAlts = [];
export const gallery = Array.from({ length: GALLERY_COUNT }, (_, i) => i + 1).map((n) => ({
  full: `assets/img/gallery-${n}.jpg`,
  thumb: `assets/img/thumb-${n}.jpg`,
  alt: galleryAlts[n - 1] ?? `[Opis ${n}]`,
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
  text: 'Blizina mora, strogog centra grada i svih važnih sadržaja čini apartmane odličnim izborom kako za kraći, tako i za duži boravak.',
  href: '#plaze',
  image: { src: 'assets/img/foto3.jpg', width: 2500, height: 1667, alt: '[Opis]' },
};

// ---------- Plaže (kartice). `link` je opcion (npr. Google Maps); prazno = nije link ----------
// Kratki opšti opisi; udaljenosti od apartmana nisu navedene.
const beach = (n, name, desc) => ({
  name,
  desc,
  image: { src: `assets/img/beach-${n}.jpg`, width: 1024, height: 768, alt: name },
  link: '',
});
export const beaches = {
  title: 'Plaže koje vrijedi posjetiti',
  items: [
    beach(1, 'Kalardovo', 'Mirna plaža u Tivtu, pogodna za kupanje i opuštanje uz more.'),
    beach(2, 'Plavi horizonti', 'Pješčana plaža u zaštićenoj uvali na poluostrvu Luštica, poznata po bistrom moru.'),
    beach(3, 'Jaz', 'Prostrana plaža kod Budve sa šljunkom i pijeskom, poznata po živoj atmosferi i vodenim sportovima.'),
  ],
};

// ---------- Dodatne sekcije (isti obrazac kao plaže; pojavljuju se u meniju i footeru) ----------
export const extraSections = {
  // Opšti opisi znamenitosti (bez brojki, udaljenosti i radnog vremena).
  sights: {
    enabled: true,
    id: 'znamenitosti',
    title: 'Znamenitosti u okolini',
    items: [
      {
        name: 'Tivat – Porto Montenegro i centar',
        desc: 'Opuštena šetnja uz more, marina Porto Montenegro sa jahtama i kafići, restorani i prodavnice u centru grada.',
        image: { src: 'assets/img/sight-1.jpg', width: 1024, height: 768, alt: 'Tivat – Porto Montenegro i centar' },
        link: '',
      },
      {
        name: 'Kotor',
        desc: 'Stari grad Kotor poznat je po kamenim ulicama, trgovima i gradskim zidinama, a iznad njega se uzdižu planine. Idealan je za dnevni izlet i šetnju.',
        image: { src: 'assets/img/sight-2.jpg', width: 1024, height: 768, alt: 'Kotor' },
        link: '',
      },
      {
        name: 'Budva',
        desc: 'Budva je poznata po starom gradu, plažama i živom ljetnjem životu. Dobra je za izlet u kojem se kombinuju šetnja, kupanje i izlazak.',
        image: { src: 'assets/img/sight-3.jpg', width: 1024, height: 768, alt: 'Budva' },
        link: '',
      },
    ],
  },
  // Klasična jela crnogorskog primorja. Bez restorana, cijena i adresa.
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

// ---------- Dostupnost (kalendar zauzetih termina; čita se iz Firebase-a, vidi README) ----------
// Sekcija se prikazuje samo kad je Firebase podešen (assets/js/firebase-config.js).
export const availability = {
  id: 'dostupnost',
  title: 'Dostupnost',
  text: 'Izaberite apartman i datume dolaska i odlaska da vidite koji su termini slobodni, pa pošaljite upit.',
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
