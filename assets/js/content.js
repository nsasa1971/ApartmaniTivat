// ============================================================
//  CENTRALNI SADRŽAJ SAJTA – Tivat Garden Homes
//  Sve tekstove, slike, apartmane, cijene, plaže i linkove mijenjaš OVDE.
//  Tekst u uglastim zagradama [...] je placeholder – zamijeni ga pravim podatkom.
//  Posle izmjene: osvježi stranicu (dev) ili pokreni `npm run build`.
// ============================================================

import { apartmentPhotos } from './apartment-photos.js';

// ---------- Osnovne informacije o sajtu (koriste se i za SEO/meta) ----------
export const site = {
  brand: 'Tivat Garden Homes',
  // Planirani domen: apartmanigardentivat.com
  // TODO: kad se domen poveže, ovde upiši 'https://apartmanigardentivat.com' (bez završne kose crte)
  // i dodaj CNAME fajl (vidi README). Do tada ostaje placeholder.
  url: 'https://apartmanigardentivat.netlify.app', // adresa sajta (za pregled linka na Viber/WhatsApp, canonical, sitemap)
  title: 'Tivat Garden Homes – Apartmani u Tivtu',
  description:
    'Holiday home Olive, Lavande i Lemoni u Tivtu: mediteranski ambijent među maslinama, plaža oko 300 m, Porto Montenegro oko 1 km. Pošaljite upit za boravak.',
  ogDescription: 'Apartmani u Tivtu: Holiday home Olive, Lavande i Lemoni – mediteranski ambijent među maslinama.',
  ogImage: 'assets/img/og.jpg', // 1200×630
  locale: 'sr_ME',
  themeColor: '#34493A',
};

// ---------- Konfiguracija ponašanja ----------
export const config = {
  minGuests: 1,
  maxGuests: 8,
  defaultGuests: 2,
  checkIn: '14:00', // prijava od (koristi se i u podacima za Google)
  checkOut: '10:00', // odjava do

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
  phone2: '+38263216588', // drugi broj (tel: link)
  phoneDisplay2: '+382 63 216 588',
  email: 'baukbiljana@gmail.com',
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
  instagram: 'https://www.instagram.com/olive_lavande_lemoni_holiday/',
};

// ---------- Hero ----------
export const hero = {
  image: { src: 'assets/img/hero-1.jpg', width: 1920, height: 900, alt: 'Zalazak sunca nad Tivatskim zalivom i jedrilice' },
  mobileSrc: 'assets/img/hero-mobile.jpg', // oštra uspravna verzija iz većeg originala (telefoni)
  // Slider: prva je `image`, ostale se učitavaju iza nje (slika koja ne postoji se preskoči).
  slides: [
    'assets/img/hero-2.jpg',
    'assets/img/hero-3.jpg',
    'assets/img/gallery-13.jpg',
  ],
  subtitle: 'Apartmani u Tivtu',
  title: 'Tivat Garden Homes',
  text: 'Apartmani Olive, Lavande i Lemoni nalaze se na odličnoj lokaciji u Tivtu, u mirnom mediteranskom ambijentu okruženom maslinama.',
};

export const logo = { src: 'assets/img/logo.png', width: 288, height: 288 };

// ---------- Uvodna sekcija (slika preklapa sekciju) ----------
export const intro = {
  image: { src: 'assets/img/foto1.jpg', width: 605, height: 806, alt: 'Porto Montenegro u Tivtu' },
  title: 'Odlična lokacija i dobra povezanost',
  // Pasusi se razdvajaju praznim redom (\n\n).
  text:
    'Holiday home Olive, Holiday home Lavande i Holiday home Lemoni nalaze se na odličnoj lokaciji u Tivtu, sa veoma dobrom saobraćajnom povezanošću. U neposrednoj blizini nalaze se autobuska stanica i taxi stajalište, dok je aerodrom lako dostupan.\n\nPlaža je udaljena oko 300 m, dva velika marketa oko 50 m, restoran oko 70 m, dok je Porto Montenegro udaljen oko 1 km.',
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
  `Holiday home ${naziv} je prostran apartman od 60 m², namijenjen za 2 do 4 osobe. Sastoji se od jedne velike sobe sa bračnim krevetom i sofom, dnevnog boravka sa velikom ugaonom garniturom na razvlačenje, kupatila i potpuno opremljene kuhinje. Gostima su na raspolaganju TV, internet i dva klima uređaja. Apartman ima poseban ulaz, terasu i prostrano dvorište u hladu maslina, sa vanjskim roštiljem, idealno za odmor i druženje. Moderan i funkcionalan raspored pruža gostima privatnost i udobnost tokom cijelog boravka.`;

// Lavande i Lemoni imaju isti raspored i sadržaj.
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
    image: { src: 'assets/img/apartman-1.jpg', width: 1024, height: 768, alt: 'Dnevna soba – Holiday home Olive' },
    photos: apartmentPhotos.olive, // galerija apartmana: `npm run apt-photos`
  },
  {
    id: 'lavanda',
    name: 'Lavande', // kratki naziv: forma, select, kalendar, admin
    fullName: 'Holiday home Lavande', // puni naziv: samo u opisima na sajtu
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniText('Lavande'),
    features: lavandaLemoniFeatures,
    image: { src: 'assets/img/apartman-2.jpg', width: 1024, height: 768, alt: 'Dnevna soba i kuhinja – Holiday home Lavande' },
    photos: apartmentPhotos.lavanda,
  },
  {
    id: 'lemoni',
    name: 'Lemoni', // kratki naziv: forma, select, kalendar, admin
    fullName: 'Holiday home Lemoni', // puni naziv: samo u opisima na sajtu
    area: '60 m²',
    guests: '2–4 osobe',
    summary: lavandaLemoniText('Lemoni'),
    features: lavandaLemoniFeatures,
    image: { src: 'assets/img/apartman-3.jpg', width: 1024, height: 768, alt: 'Kuhinja – Holiday home Lemoni' },
    photos: apartmentPhotos.lemoni,
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
  checkInfo: 'Prijava (check-in) od 14:00 h, odjava (check-out) do 10:00 h.',
  discounts: [
    'Za boravak od 10 dana i više moguć je popust od 10%.',
    'Za boravak od mjesec dana moguća je povoljnija cijena, popust do 20%.',
  ],
  disclaimer:
    'Cijene su orijentacione i mogu se razlikovati zavisno od termina i dužine boravka. Konačnu cijenu za vaš termin potvrđujemo nakon upita – pošaljite upit i javićemo vam se.',
};

// ---------- Galerija (thumb 394×394, full 1240×827) ----------
// Broj slika: promijeni GALLERY_COUNT i pokreni `npm run gallery` sa istim brojem slika.
// Opise (alt) upiši u galleryAlts po redoslijedu slika, npr. 'Dnevna soba – Holiday home Olive'.
const GALLERY_COUNT = 15;
const galleryAlts = [
  'Dnevna soba sa ugaonom garniturom i trpezarijskim stolom',
  'Kupatilo sa tuš kabinom i okruglim osvijetljenim ogledalom',
  'Spavaća soba sa bračnim krevetom i sofom',
  'Dnevna soba sa TV-om, trpezarijskim stolom i radnim stolom',
  'Kupatilo sa okruglim ogledalom i kamenim umivaonikom',
  'Spavaća soba sa dva kreveta',
  'Dnevna soba sa kuhinjom i sofom',
  'Kupatilo sa bijelim umivaonikom',
  'Spavaća soba sa bračnim krevetom',
  'Spavaća soba sa krevetom pored prozora',
  'Terasa sa lozom i drvenim stolom u dvorištu',
  'Ulaz u apartman i maslina u dvorištu',
  'Pogled na more i oleandar u zalasku sunca',
  'Korpa sa grožđem i vinom u maslinjaku',
  'Vanjski dio apartmana sa stazom i dvorištem',
];
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
  image: { src: 'assets/img/foto2.jpg', width: 1240, height: 827, alt: 'Dvorište sa terasom u hladu vinove loze' },
};

// ---------- Utisci gostiju (Google Maps recenzije za Holiday home Olive; koristiti samo prave recenzije) ----------
// Srpski tekst je prevod: izvorni jezici su bosanski (Sasa), engleski (Shamai) i hrvatski (Losmi).
export const reviews = [
  {
    title: 'Desetka!',
    rating: 5,
    text: 'Desetka! Boravak u ovom smještaju bio je jedno od najboljih iskustava koja smo ikada imali. Smještaj je u stvarnosti još ljepši nego na slikama – besprijekorno čist, moderan i na odličnoj lokaciji. Pažnja posvećena detaljima je nevjerovatna, od udobnosti kreveta do sitnica koje boravak čine prijatnim. Domaćini su nas dočekali izuzetno toplo i učinili da se osjećamo kao kod kuće. Iskrena preporuka svima koji traže savršen odmor!',
    name: 'Sasa Nikolic',
    avatar: 'assets/img/avatar-1.png',
    source: 'https://maps.app.goo.gl/iFh2TooFZ2Z1pUmX8',
  },
  {
    title: 'Kao kod kuće, a na odmoru',
    rating: 5,
    text: 'Ako volite da se osjećate kao kod kuće, ali na odmoru, ovo je pravo mjesto. Veliki, novi i čist apartman, pun sitnica poput dekoracije, opremljena kuhinja spremna za pripremu obroka, udobni kreveti i još mnogo toga… Ukratko – potpuno preporučujemo ovo mjesto.',
    name: 'Shamai Keidar',
    avatar: 'assets/img/avatar-2.png',
    source: 'https://maps.app.goo.gl/Gyu7YP66JkcsRpAZ8',
  },
  {
    title: 'Prelijep apartman',
    rating: 5,
    text: 'Prelijep apartman i veoma ljubazni domaćini, niko neće požaliti što je bio gost ovih dobrih ljudi.',
    name: 'Losmi Losmic',
    avatar: 'assets/img/avatar-3.png',
    source: 'https://maps.app.goo.gl/geiKQ2PBEDsXqkeVA',
  },
];

// ---------- Tamna sekcija (tekst + slika sa ofsetom) ----------
export const dark = {
  title: 'Za kraći i duži boravak',
  text: 'Blizina mora, strogog centra grada i svih važnih sadržaja čini apartmane odličnim izborom kako za kraći, tako i za duži boravak.',
  href: '#plaze',
  image: { src: 'assets/img/foto3.jpg', width: 1240, height: 827, alt: 'Dnevni boravak sa kuhinjom' },
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
    beach(1, 'Kalardovo', 'Kalardovo je izletnička plaža udaljena oko 2 km od apartmana, u blizini aerodroma i Ostrva cvijeća. Plaža je pješčana i duga oko 250 m. Zahvaljujući plitkom moru, uobičajenom plažnom mobilijaru i brojnim pratećim objektima, idealna je za porodice sa malom djecom. U njenoj blizini nema smještajnih objekata, pa se dolazi isključivo radi kupanja i odmora na moru. Do nje ne ide autobuski prevoz, već je potreban sopstveni ili iznajmljeni automobil ili taksi. Ispred plaže je obezbijeđen parking, tako da je dolazak autom jednostavan.'),
    beach(2, 'Plavi horizonti', 'Najveća i najznačajnija plaža u tivatskoj oblasti. Nalazi se na dnu uvale Pržno, koja se smatra jednom od najljepših u ovom dijelu Jadrana. Plaža je pješčana, duga 350 m i prekrivena sitnim pijeskom koji se smatra ljekovitim, naročito za reumatska oboljenja. Pijesak se pruža daleko u plitkom moru, pa je ovo idealno odredište za djecu i porodični odmor. Pored same plaže nalaze se borova šuma i maslinjaci, tako da kupači pod njihovim krošnjama nalaze prirodnu hladovinu. Ovaj predio ima najveći broj sunčanih sati tokom godine. Kupalište je potpuno uređeno, sa tuševima i toaletima, a u blizini se nalaze brojni ugostiteljski objekti, sportski tereni i parking.'),
    beach(3, 'Jaz', 'Jaz je jedna od najpopularnijih plaža u Crnoj Gori, a turistički vodič „Lonely Planet“ svrstao ju je među 10 najboljih plaža u Evropi. Nalazi se 3 km zapadno od Budve i duga je oko 800 m, podijeljena na dva dijela. Manja plaža je šljunkovita (oko 300 m), a veća pješčana (oko 500 m). Kod šljunkovite plaže nalazi se auto-kamp velikog kapaciteta. Veća plaža je okružena velikim brojem barova i kafića, a tokom ljeta na njoj se održavaju brojni koncerti i manifestacije.'),
    beach(4, 'Plaža Župa', 'Plaža Župa nalazi se u uvali neposredno pred ulaz u Tivat s južne strane. Riječ je o maloj pješčanoj plaži dužine oko 70 m, smještenoj u mirnoj uvali. Pored same plaže nalazi se gusta borova šuma koja gostima omogućava da uživaju u prirodnoj hladovini čak i tokom najtoplijih dana. Zbog skromnih dimenzija i zelenog okruženja pogodna je za opuštanje u prirodnom ambijentu.'),
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
        name: 'Tivat',
        desc: 'Tivat je najmirniji grad u zalivu, idealan za spor tempo odmora. Šetalište uz more vodi pored plaža, kafića i restorana, a marina Porto Montenegro, sa jahtama i elegantnim šetalištem, okuplja goste iz cijelog svijeta. Za ljubitelje prirode tu su Solila, zaštićeno stanište ptica, i Ostrvo cvijeća pored obale.',
        highlights: [
          'Porto Montenegro i njegovo šetalište',
          'Šetalište uz more i gradski park',
          'Solila (ornitološki rezervat)',
          'Ostrvo cvijeća',
        ],
        image: { src: 'assets/img/sight-1.jpg', width: 1024, height: 768, alt: 'Tivat' },
        link: '',
        guide: 'tivat',
      },
      {
        name: 'Kotor',
        desc: 'Stari grad Kotor smješten je ispod strmih planina na kraju zaliva i spada među najbolje očuvane srednjovjekovne gradove Mediterana. Uske kamene ulice, trgovi i crkve čuvaju vijekove istorije, a katedrala Svetog Tripuna dominira centrom. Za najljepši pogled na zaliv popnite se na tvrđavu Sveti Ivan iznad grada, najbolje u ranim jutarnjim ili poslijepodnevnim satima.',
        highlights: [
          'Stari grad Kotor (UNESCO)',
          'Katedrala Svetog Tripuna',
          'Bedemi i tvrđava Sveti Ivan',
          'Šetnja uz zaliv',
          'Vožnja od apartmana: oko 15 minuta',
        ],
        image: { src: 'assets/img/sight-2.jpg', width: 1024, height: 768, alt: 'Kotor' },
        link: '',
        guide: 'kotor',
      },
      {
        name: 'Budva',
        desc: 'Budva spaja istoriju i zabavu: Stari grad sa kamenim ulicama i Citadelom smješten je na poluostrvu uz more, a oko njega se redaju plaže poput Mogrena i Slovenske plaže. Uveče grad oživi kafićima, restoranima i muzikom. Iz Budve se lako stiže do Svetog Stefana, čuvenog ostrva-hotela, koje se najljepše vidi sa vidikovca iznad njega.',
        highlights: [
          'Stari grad i Citadela',
          'Plaže Mogren i Slovenska plaža',
          'Šetalište uz more i večernji život',
          'Pogled na Sveti Stefan',
          'Vožnja od apartmana: oko 30 minuta',
        ],
        image: { src: 'assets/img/sight-3.jpg', width: 1024, height: 768, alt: 'Budva' },
        link: '',
        guide: 'budva',
      },
    ],
  },
  // Klasična jela crnogorskog primorja. Bez restorana, cijena i adresa.
  food: {
    enabled: true,
    id: 'hrana',
    title: 'Mediteranska kuhinja',
    intro:
      'Crnogorsko primorje poznato je po jednostavnoj, zdravoj i ukusnoj mediteranskoj kuhinji koja se vjekovima oslanja na darove mora i zaleđa. Svježa riba tek izvađena iz mreža, mirisno domaće maslinovo ulje, zreo limun, bijeli luk i začinsko bilje poput ruzmarina i peršuna čine osnovu svakog autentičnog bokeljskog obroka. U našim konobama i restoranima hrana nije samo obrok, već način života: lagana, aromatična i stvorena za dugo uživanje uz čašu dobrog domaćeg vina.',
    items: [
      {
        name: 'Riba na žaru (gradele)',
        desc: 'Nema ničeg iskrenijeg na primorju od svježe morske ribe spremljene na tradicionalnim gradelama. Bilo da se radi o oradi, brancinu, zubatcu ili škrpini, priprema je jednostavna, a ukus savršen: riba se peče na umjerenom žaru od drveta, uz stalno premazivanje grančicom ruzmarina umočenom u ekstra djevičansko maslinovo ulje. Poslužuje se topla, prelivena marinadom od sitno sjeckanog bijelog luka, peršuna i maslinovog ulja, uz nezaobilaznu krišku limuna i prilog od kuvane blitve i krtule (krompira).',
        image: { src: 'assets/img/food-1.jpg', width: 1024, height: 768, alt: 'Riba na žaru' },
        link: '',
      },
      {
        name: 'Crni rižoto',
        desc: 'Crni rižoto od sipe predstavlja apsolutni klasik bokeljskih i primorskih jelovnika. Prepoznatljiva, intenzivna crna boja i dubok miris mora potiču od prirodnog mastila koje sipa ispušta. Pirinač se lagano krčka sa komadićima sočnog mesa sipe, bijelim lukom, maslinovim uljem i kapljicom crnogorskog bijelog vina, sve dok ne postane kremast i pun morskih ukusa. Jelo se tradicionalno poslužuje uz nekoliko kapi limunovog soka i malo struganog tvrdog sira.',
        image: { src: 'assets/img/food-2.jpg', width: 1024, height: 768, alt: 'Crni rižoto' },
        link: '',
      },
      {
        name: 'Brudet',
        desc: 'Brudet (ili brodet) je staro ribarsko jelo koje u sebi nosi čitavu filozofiju primorskog kuvanja. Nastao kao obrok koji su ribari spremali na brodu od više vrsta morske ribe (poput škarpine, grdobine, ugora ili orade), brudet se polako krčka u gustom saftu od zrelog paradajza, crnog i bijelog luka, maslinovog ulja i vina. Posebna tajna pravog brudeta je u tome što se tokom kuvanja ne miješa varjačom, već se šerpa samo povremeno blago protrese kako bi komadi ribe ostali cijeli. Najčešće se servira uz toplu palentu (kačamak) koja savršeno upija bogati saft.',
        image: { src: 'assets/img/food-3.jpg', width: 1024, height: 768, alt: 'Brudet' },
        link: '',
      },
      {
        name: 'Pršut i sir',
        desc: 'Neizostavna hladna zakuska i najljepša dobrodošlica u svakom domu u Boki jeste kombinacija autentičnih ukusa iz crnogorskog krša: njeguški pršut i zreli domaći sir. Sušen na čistom planinskom vazduhu đe se sudaraju morska i planinska struja, pršut ima specifičnu aromu dima bukovog drveta i prepoznatljivu teksturu koja se topi u ustima. Uz njega se služe punomasni polutvrdi njeguški sir, zreli sir iz ulja ili domaći kozji sir, domaći hljeb i domaće masline, savršeno za početak večere uz čašu crnogorskog Vranca.',
        image: { src: 'assets/img/food-4.jpg', width: 1024, height: 768, alt: 'Pršut i sir' },
        link: '',
      },
      {
        name: 'Maslinovo ulje i masline',
        desc: 'Maslina je sveto drvo primorja i vjekovni simbol mira i dugovječnosti, a maslinovo ulje temelj svake mediteranske trpeze. Duž zaliva i poluostrva Luštica nalaze se vjekovni maslinjaci od čijih se plodova, tradicionalnim hladnim cijeđenjem, dobija gusto, zlatno-zeleno ekstra djevičansko ulje bogatog, blago pikantnog ukusa. Domaće soljene i marinirane masline, poslužene uz malo aromatičnog bilja i domaći hljeb umočen u ulje, pružaju najčistiji ukus Mediterana u svom najjednostavnijem obliku.',
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
    'Holiday home Olive, Lavande i Lemoni nalaze se na odličnoj lokaciji u Tivtu. Apartmani pružaju miran i prijatan mediteranski ambijent okružen maslinama, uz blizinu mora i strogog centra grada.',
  privacyHref: 'politika-privatnosti.html',
};
