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

Skripta rekurzivno smanjuje najdužu stranicu na 1600 px (po potrebi `--max`), skida metapodatke (GPS i sl.), poštuje rotaciju i čuva strukturu foldera; originali se ne mijenjaju. Zatim iz `optimized/` izaberi slike, preimenuj ih prema tabeli u `assets/img/README.md` i kopiraj u `assets/img/`. Cilj je do ~250 KB po slici.

## Forma za upit (`#rezervacija`)

Rezervacije idu preko sopstvene forme za upit. Booking traka u hero sekciji na „Pretraži“ skroluje do forme i popunjava dolazak, odlazak i broj gostiju.

Slanje se podešava u `content.js` → `config.form`:

| Servis | Podešavanje |
|---|---|
| **Formspree** *(trenutno podešeno: `mgaozble`)* | napravi formu na formspree.io, upiši `provider: 'formspree'` i `endpoint: 'https://formspree.io/f/xxxxxxxx'` |
| **Web3Forms** | upiši `provider: 'web3forms'` i `web3formsAccessKey: '<ključ>'` |
| *(ništa)* | fallback: otvara se `mailto:` sa popunjenim telom poruke (potreban je pravi `contact.email`) |

Zaštita od botova: skriveno honeypot polje i minimalno vreme popunjavanja (`minFillSeconds`). Validacija i poruke grešaka su na srpskom (`assets/js/booking.js`). Nema sopstvenog backenda.

## Deploy (GitHub Pages)

Workflow `.github/workflows/deploy.yml` na svaki push na `main` pokreće `npm ci && npm run build` i objavljuje sajt na GitHub Pages.

1. Na GitHub-u: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Sve putanje u sajtu su relativne, pa radi i na `korisnik.github.io/repo/` i na sopstvenom domenu.

### Sopstveni domen

1. U `content.js` postavi `site.url` na pun URL (npr. `https://www.moji-apartmani.me`) i pokreni `npm run build` (canonical, OG, sitemap i robots koriste ovu vrednost).
2. Dodaj fajl `CNAME` u koren repoa sa jednom linijom – domenom (npr. `www.moji-apartmani.me`). Workflow ga kopira u objavu.
3. Kod registratora domena: `CNAME` zapis za `www` → `<korisnik>.github.io`; za „goli“ domen `A` zapisi ka GitHub Pages IP adresama (vidi dokumentaciju GitHub Pages).
4. U **Settings → Pages** upiši domen i uključi **Enforce HTTPS**.

## Šta je namerno ostavljeno za sledeću verziju

- **Kalendar dostupnosti** – nije uključen. Struktura je pripremljena: `data/availability.json` (zauzeti termini po apartmanu, ključevi odgovaraju `apartments[].id`). Sledeći korak: ručno održavanje tog fajla ili uvoz iCal kalendara sa Booking/Airbnb (npr. zakazani GitHub Action koji preuzme `.ics` i upiše JSON), pa prikaz u booking traci/formi (zauzeti datumi, provera pre slanja).
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
data/availability.json     # priprema za kalendar dostupnosti
```
