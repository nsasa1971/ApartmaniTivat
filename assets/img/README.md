# Slike

Zameni placeholdere svojim fotografijama **istim imenom i istim dimenzijama** (ili većim, istog odnosa stranica).
Preporuka: JPG kvalitet ~75–82 (ili WebP uz izmenu ekstenzije u `assets/js/content.js`), do ~250 KB po slici.

| Fajl | Dimenzije | Gde se koristi |
|---|---|---|
| `hero.jpg` | 1920×900 | Hero sekcija (pozadina) |
| `foto1.jpg` | 605×806 | Uvodna sekcija (slika koja preklapa sekciju) |
| `gallery-1.jpg` … `gallery-6.jpg` | 1240×827 | Galerija – velika slika u lightbox-u |
| `thumb-1.jpg` … `thumb-6.jpg` | 394×394 | Galerija – umanjena slika (kvadrat) |
| `foto2.jpg` | 1240×827 | Sekcija tekst + slika |
| `foto3.jpg` | 2500×1667 | Tamna sekcija (slika sa ofsetom) |
| `beach-1.jpg` … `beach-4.jpg` | 1024×768 | Kartice plaža (i opcionih sekcija Hrana/Znamenitosti) |
| `apartman-1.jpg` … `apartman-3.jpg` | 1024×768 | Kartice apartmana (Olive, Lavanda, Lemoni) |
| `sight-1.jpg` … `sight-3.jpg` | 1024×768 | Znamenitosti u okolini |
| `food-1.jpg` … `food-5.jpg` | 1024×768 | Mediteranska kuhinja |
| `og.jpg` | 1200×630 | Slika za deljenje (Open Graph) |
| `logo.png` | 211×100 | Logo u zaglavlju |
| `favicon.png` | 64×64 | Favicon |
| `icon-192.png`, `icon-512.png` | 192×192, 512×512 | Ikone za manifest / mobilni početni ekran |
| `avatar.png` | 80×80 | Avatar u utiscima gostiju (po želji dodaj nove i upiši u `content.js`) |

Ako menjaš dimenzije ili nazive, ažuriraj `width`/`height` i putanje u `assets/js/content.js`
(vrednosti `width`/`height` sprečavaju „skakanje“ stranice dok se slike učitavaju).

Trenutne slike su generisane skriptom `python3 scripts/make-placeholders.py` (potrebna je biblioteka Pillow).
