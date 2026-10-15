# Apartmani Tivat – sajt

Sajt za izdavanje apartmana u Tivtu: čist HTML + Tailwind CSS (build) + vanilla JS (ES moduli). Bez frameworka i bez spoljnih biblioteka.

## Pokretanje

```bash
npm install
npm run dev          # Tailwind u watch režimu → assets/css/style.css
npx serve .          # u drugom terminalu, otvori http://localhost:3000
```

Stranica se mora otvarati preko lokalnog servera (ES moduli ne rade sa `file://`).

## Build

```bash
npm run build
```

Radi dve stvari:

1. `build:css` – minifikovan `assets/css/style.css` (Tailwind 3.4, konfiguracija u `tailwind.config.cjs`, ulaz `src/input.css`).
2. `build:meta` – `scripts/build-meta.mjs` iz `assets/js/content.js` upisuje u `index.html` SEO `<head>` (title, description, canonical, Open Graph, JSON-LD) i prerenderovan sadržaj stranice, i generiše `manifest.webmanifest`, `robots.txt` i `sitemap.xml`.

> Izmene u `content.js` se u browseru vide odmah posle osvežavanja (JS ponovo generiše sekcije), ali **pre objave obavezno pokreni `npm run build`** da se SEO deo i prerender ažuriraju. `assets/css/style.css`, `index.html`, `sitemap.xml` itd. su generisani fajlovi i commit-uju se.
>
> Zašto prerender: sadržaj se generiše iz `content.js` (template literali), a build isti HTML upisuje u `index.html` da bi pretraživači i društvene mreže videli tekst i meta podatke bez izvršavanja JS-a.

## Gde se menja sadržaj

Sve na jednom mestu: **`assets/js/content.js`**

- `site` – naziv brenda, **URL sajta**, title, opis, OG slika
- `contact`, `social` – telefon, email, WhatsApp, Viber, adresa, Instagram
- `hero`, `intro`, `feature`, `dark`, `reviews`, `gallery`, `beaches`, `booking`, `footer` – tekstovi i slike sekcija
- `apartments` – lista apartmana (koristi se u izboru u formi za upit i u JSON-LD)
- `extraSections` – opcione sekcije *Hrana* i *Znamenitosti* (`enabled: true` ih uključuje i dodaje u meni)
- `config` – min/max gostiju i **podešavanje slanja forme**

Tekstovi u uglastim zagradama `[...]` su placeholderi. Meni, dugmad i oznake na tri jezika (sr/en/ru) su u **`assets/js/i18n.js`** (prevedeni su samo navigacija i dugmad; ostali tekstovi ostaju na jeziku iz `content.js`). Tekst politike privatnosti: `politika-privatnosti.html`.

## Slike

Stavljaju se u `assets/img/`. Tačna imena i dimenzije su u [`assets/img/README.md`](assets/img/README.md).

### Veliki originali (npr. 1,6 GB)

Originale **ne stavljaj u repo**. Drži ih van projekta (ili u folderu `originals/`, koji je u `.gitignore`) i smanji ih skriptom:

```bash
npm run images -- putanja/do/foldera-sa-originalima            # izlaz: ./optimized
npm run images -- putanja/do/originala optimized --max 1600 --quality 78
```

Skripta rekurzivno smanjuje najdužu stranicu na 1600 px (po potrebi `--max`), skida metapodatke (GPS i sl.), poštuje rotaciju i čuva strukturu foldera; originali se ne mijenjaju. Za tačne dimenzije dodaj `--crop`, npr. `--crop 1024x768` (kartice apartmana i plaža), `--crop 1240x827` (galerija), `--crop 394x394` (sličice), `--crop 1920x900` (hero); izlaz stavi u poseban folder: `npm run images -- originali izlaz-kartice --crop 1024x768`.

Zatim iz `optimized/` izaberi slike, preimenuj ih prema tabeli u `assets/img/README.md` i kopiraj u `assets/img/`. Cilj je do ~250 KB po slici.

### Galerija i hero

```bash
npm run gallery -- putanja/do/foldera-sa-slikama     # pravi gallery-N.jpg (1240×827) i thumb-N.jpg (394×394) u assets/img
npm run images -- folder-sa-hero-slikom hero-gotovo --crop 1920x900   # zatim preimenuj u hero.jpg
```
Slike u folderu nazovi `1.jpg`, `2.jpg`, … da odrediš redoslijed u galeriji; njihov broj mora odgovarati `GALLERY_COUNT` u `assets/js/content.js` (trenutno 15). Posle kopiranja pokreni `npm run build`.

## Forma za upit (`#rezervacija`)

Rezervacije idu preko sopstvene forme za upit. Booking traka u hero sekciji na „Pretraži“ skroluje do forme i popunjava dolazak, odlazak i broj gostiju.

Slanje se podešava u `content.js` → `config.form`:

| Servis | Podešavanje |
|---|---|
| **Formspree** *(trenutno podešeno: `mgaozble`)* | napravi formu na formspree.io, upiši `provider: 'formspree'` i `endpoint: 'https://formspree.io/f/xxxxxxxx'` |
| **Web3Forms** | upiši `provider: 'web3forms'` i `web3formsAccessKey: '<ključ>'` |
| *(ništa)* | fallback: otvara se `mailto:` sa popunjenim telom poruke (potreban je pravi `contact.email`) |

Zaštita od botova: skriveno honeypot polje i minimalno vreme popunjavanja (`minFillSeconds`). Validacija i poruke grešaka su na srpskom (`assets/js/booking.js`). Nema sopstvenog backenda.

## Administracija (`/admin`) i kalendar dostupnosti

Dashboard za vlasnicu: kalendar po apartmanu, rezervacije, sanduče upita sa sajta, rezervna kopija. Radi na telefonu kao PWA, a podatke čuva u **Firebase** (Authentication + Firestore, besplatni *Spark* plan, bez Cloud Functions). Javni sajt dobija sekciju **Dostupnost** koja čita samo datume zauzetih termina.

### 1. Podešavanje Firebase-a (jednom)

1. Na [console.firebase.google.com](https://console.firebase.google.com) napravite projekat (Spark plan, Google Analytics nije potreban).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
   Zatim **Authentication → Settings → User actions** i isključite *Enable create (sign-up)* ako je opcija dostupna (javne registracije nisu potrebne; i bez toga pravila puštaju samo UID vlasnice).
3. **Authentication → Users → Add user**: unesite email i lozinku vlasnice. Kopirajte **User UID** iz tabele.
4. **Build → Firestore Database → Create database** → izaberite lokaciju (npr. `eur3 (europe-west)`) i *production mode*.
5. **Project settings (zupčanik) → General → Your apps → `</>` (Web)** → registrujte aplikaciju (Hosting nije potreban) i kopirajte `firebaseConfig`.
6. Upišite te vrijednosti u `assets/js/firebase-config.js`. Web konfiguracija je javna po dizajnu; nikada u repo ne stavljajte service account ključ.
7. **Authentication → Settings → Authorized domains** → dodajte domen sajta (npr. `apartmanigardentivat.netlify.app` i `apartmanigardentivat.com`).

### 2. Pravila (Firestore → Rules)

1. Otvorite `firestore.rules` u repou i u funkciji `isOwner()` zamijenite `UPISI_UID_VLASNICE` UID-om iz koraka 3 (može više UID-ova: `['uid1', 'uid2']`).
2. U Firebase konzoli: **Firestore Database → Rules** → obrišite postojeći tekst, zalijepite cijeli sadržaj `firestore.rules` → **Publish**.
   *(Opciono, Firebase CLI: `npx firebase-tools login`, pa `npx firebase-tools deploy --only firestore:rules --project <ID-projekta>`.)*

Šta pravila garantuju: `bookings` (lični podaci gostiju) vidi i piše samo vlasnica; `availability` je javno za čitanje ali sadrži samo `apartmentId`, `from`, `to`, `bookingId` (i vlasnici je zabranjeno da upiše išta drugo); `inquiries` javnost može samo da **kreira** (strogo validirano: dozvoljena polja, tipovi, dužine, `status` mora biti `new`), a čita/mijenja/briše samo vlasnica; `apartments` je javno za čitanje.

Nije potreban nijedan Firestore indeks (svi upiti koriste jedan filter).

### 3. Objava i prvi ulazak

```bash
npm run build:site     # ili samo push na main – Netlify gradi sam
```
Otvorite `https://<vaš-domen>/admin/`, prijavite se, i apartmani (Olive, Lavanda, Lemoni, kapacitet 4) se sami upišu u Firestore pri prvoj prijavi. `/admin` nije u sitemap-u, ima `noindex` i `Disallow` u `robots.txt`.

### 4. Instalacija na telefon

- **Android / Chrome:** otvorite `/admin/` → *Više* → **Dodaj na početni ekran** (ili meni ⋮ → *Instaliraj aplikaciju*).
- **iPhone / Safari:** *Podijeli* → **Dodaj na početni ekran**.

Aplikacija radi i bez interneta (ljuska se kešira, a Firestore čuva podatke u IndexedDB-u); izmjene unesene offline sinhronizuju se čim se vrati veza. Nova verzija aplikacije se učita pri drugom otvaranju (service worker osvježava keš u pozadini).

### 5. Kako se koristi

- **Kalendar:** izaberite apartman, dodirnite slobodan dan za novu rezervaciju ili zauzet dan za izmjenu/brisanje. Boje: Booking (svijetlosivo, B), Direktno (tamnozeleno, D), Drugo (ugljenasto, O). Crveno **!** = direktna rezervacija koja još nije blokirana na Bookingu.
- **Dan odlaska je slobodan** za novi dolazak (odlazak je isključen iz zauzeća). Preklapanje sa postojećom rezervacijom istog apartmana je blokirano, a kapacitet se provjerava.
- **Direktne rezervacije:** nakon unosa blokirajte termin na Bookingu i označite „Blokirano na Bookingu“ (kvačica u formi ili dugme u listi).
- **Upiti:** upiti sa sajta stižu u karticu *Upiti* (značka = broj novih). *Prihvati* otvara formu rezervacije popunjenu iz upita (uz provjeru preklapanja); posle čuvanja upit postaje „Prihvaćen“, a termin je odmah zauzet na sajtu. *Odbij* ga označava kao odbijen. Dugmad: Pozovi, WhatsApp, Email.
- **Rezervna kopija:** *Više → Rezervna kopija* preuzima sve rezervacije kao JSON ili CSV (Excel). Preporuka: jednom mjesečno.

### 6. Javni sajt

- Sekcija **Dostupnost** (izbor apartmana, mjesečni prikaz) čita samo kolekciju `availability`. Firebase SDK se učitava tek kad je sekcija blizu ekrana, ili kad posjetilac počne da popunjava termin.
- Booking traka i forma za upit odbijaju termin koji se preklapa sa zauzetim danima izabranog apartmana: „Izabrani termin nije slobodan. Izaberite druge datume.“ Booking traka nema izbor apartmana, pa je termin prihvaćen ako je slobodan **bar jedan** apartman; ako je u formi izabran konkretan apartman, mora biti slobodan baš on.
- Forma i dalje šalje preko Formspree-a (email obavještenje) i **paralelno** upisuje upit u `inquiries`. Ako upis u Firestore ne uspije, upit ipak ide preko Formspree-a, i obrnuto – korisnik vidi uspjeh ako je bar jedan put uspio.
- Ako Firebase nije podešen ili nije dostupan, sekcija „Dostupnost“ ostaje sakrivena, provjera termina se preskače, a sajt radi kao ranije.
- Zaštita od spama: honeypot polje, minimalno vrijeme popunjavanja i stroga pravila za `inquiries`. Dodatno se može uključiti **Firebase App Check** (reCAPTCHA v3/Enterprise), ali tada treba dodati inicijalizaciju App Check-a u `assets/js/firebase-client.js`.

### 7. Testiranje

- **Cijeli tok (ručno):** (1) na sajtu popunite i pošaljite upit za slobodan termin → (2) u `/admin → Upiti` pojavi se novi upit sa značkom → (3) *Prihvati* i sačuvajte → (4) na sajtu, u sekciji *Dostupnost*, taj termin je zauzet, a ista forma ga više ne prihvata.
- **Logika datuma:** `npm test`.
- **Pravila (Firebase Emulator, zahtijeva Javu):**
  ```bash
  npm i --no-save @firebase/rules-unit-testing@3 firebase@10.14.1
  npx firebase-tools@13 emulators:exec --only firestore --project tgh-rules-test "node --test tests/rules/*.test.mjs"
  ```

## Deploy (Netlify)

`netlify.toml` je podešen: build komanda `npm run build:site`, objavljuje se samo folder `dist/` (index, stranica politike, `assets`, `data`, sitemap, robots, manifest). U Netlify-u ne treba ništa ručno podešavati osim da production grana bude `main`. Domen: Netlify → Domain management → Add a domain, a `site.url` u `content.js` postaviti na isti domen.

## Deploy (GitHub Pages, alternativa)

Workflow `.github/workflows/deploy.yml` na svaki push na `main` pokreće `npm ci && npm run build` i objavljuje sajt na GitHub Pages.

1. Na GitHub-u: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Sve putanje u sajtu su relativne, pa radi i na `korisnik.github.io/repo/` i na sopstvenom domenu.

### Sopstveni domen

1. U `content.js` postavi `site.url` na pun URL (npr. `https://www.moji-apartmani.me`) i pokreni `npm run build` (canonical, OG, sitemap i robots koriste ovu vrednost).
2. Dodaj fajl `CNAME` u koren repoa sa jednom linijom – domenom (npr. `www.moji-apartmani.me`). Workflow ga kopira u objavu.
3. Kod registratora domena: `CNAME` zapis za `www` → `<korisnik>.github.io`; za „goli“ domen `A` zapisi ka GitHub Pages IP adresama (vidi dokumentaciju GitHub Pages).
4. U **Settings → Pages** upiši domen i uključi **Enforce HTTPS**.

## Šta je namerno ostavljeno za sledeću verziju

- **Uvoz iCal kalendara sa Booking/Airbnb** – nije uključen. Kalendar dostupnosti sada vodi vlasnica u `/admin` (Firebase, vidi „Administracija“). Raniji pristup sa `data/availability.json` je uklonjen (nije bio povezan ni sa čim). Sledeći korak može biti automatski uvoz `.ics` kalendara u kolekciju `availability`.
- **Online plaćanje** – nije uključeno.
- **Banner za kolačiće** – dodati tek ako se uvede analitika.

## Struktura

```
index.html                 # ljuska stranice (head i #app generiše build)
politika-privatnosti.html  # placeholder stranica
src/input.css              # Tailwind direktive + @font-face + custom CSS
tailwind.config.cjs        # paleta, fontovi, container
scripts/build-meta.mjs     # SEO, prerender, manifest, robots, sitemap
scripts/make-placeholders.py  # generiše placeholder slike
assets/js/                 # content, i18n, render, main, booking, lightbox
assets/fonts, assets/img   # lokalni fontovi (Spinnaker, Lato) i slike
admin/                     # administracija za vlasnicu (PWA, Firebase)
firestore.rules            # Firestore pravila (lijepe se u Firebase konzolu)
firebase.json              # opciono: Firebase CLI / emulator za testiranje pravila
tests/                     # testovi (npm test; pravila: test:rules)
```
