// ============================================================
//  PREVODI INTERFEJSA (crnogorski / engleski / ruski; interni kodovi sr / en / ru)
//  Ovdje su dugmad, navigacija, labele formi i poruke. Dugi tekstovi sekcija
//  (opisi apartmana, plaža...) su u content.js (crnogorski) i content.i18n.js (en, ru).
//  Svaki unos: 'kljuc': [crnogorski, engleski, ruski]. U tekstu se mogu koristiti {n}, {m}, {link}...
//  Novi jezik: dodaj ga u `languages`, u LANG_INDEX i dopiši treću/četvrtu vrijednost u unose.
// ============================================================

export const defaultLang = 'sr';

export const languages = [
  { code: 'sr', label: 'CG', name: 'Crnogorski', flag: 'me' }, // interni kod ostaje 'sr' (sačuvan izbor posjetilaca)
  { code: 'en', label: 'EN', name: 'English', flag: 'gb' },
  { code: 'ru', label: 'RU', name: 'Русский', flag: 'ru' },
];

const LANG_INDEX = { sr: 0, en: 1, ru: 2 };

// vrijednost atributa lang na <html> (crnogorski, latinica)
const LANG_TAGS = { sr: 'sr-Latn-ME', en: 'en', ru: 'ru' };

const T = {
  // navigacija
  'nav.home': ['Početna', 'Home', 'Главная'],
  'nav.stay': ['Apartmani', 'Apartments', 'Апартаменты'],
  'nav.prices': ['Cijene', 'Prices', 'Цены'],
  'nav.beaches': ['Plaže', 'Beaches', 'Пляжи'],
  'nav.food': ['Hrana', 'Food', 'Кухня'],
  'nav.sights': ['Znamenitosti', 'Sights', 'Что посмотреть'],
  'nav.gallery': ['Galerija', 'Gallery', 'Галерея'],
  'nav.contact': ['Kontakt', 'Contact', 'Контакты'],

  // dugmad
  'btn.book': ['Rezerviši', 'Book now', 'Бронировать'],
  'btn.search': ['Pretraži', 'Search', 'Найти'],
  'btn.more': ['Saznaj više', 'Learn more', 'Узнать больше'],
  'btn.send': ['Pošalji upit', 'Send inquiry', 'Отправить запрос'],
  'btn.sendRange': ['Pošalji upit za ovaj termin', 'Send an inquiry for these dates', 'Отправить запрос на эти даты'],
  'btn.close': ['Zatvori', 'Close', 'Закрыть'],
  'btn.prev': ['Prethodna', 'Previous', 'Назад'],
  'btn.next': ['Sljedeća', 'Next', 'Вперёд'],
  'btn.top': ['Na vrh', 'Back to top', 'Наверх'],

  // aria / pristupačnost
  'aria.menu': ['Meni', 'Menu', 'Меню'],
  'aria.language': ['Jezik', 'Language', 'Язык'],
  'aria.skip': ['Preskoči na sadržaj', 'Skip to content', 'Перейти к содержимому'],
  'aria.mainNav': ['Glavna navigacija', 'Main navigation', 'Главная навигация'],
  'aria.mobileNav': ['Mobilna navigacija', 'Mobile navigation', 'Мобильная навигация'],
  'aria.slides': ['Slike', 'Images', 'Изображения'],
  'aria.slide': ['Slika {n} od {m}', 'Image {n} of {m}', 'Изображение {n} из {m}'],
  'aria.search': ['Pretraga termina', 'Date search', 'Поиск по датам'],
  'aria.stars': ['{n} od 5 zvjezdica', '{n} out of 5 stars', '{n} из 5 звёзд'],
  'aria.location': ['Lokacija', 'Location', 'Расположение'],
  'aria.inquiryForm': ['Forma za upit', 'Inquiry form', 'Форма запроса'],
  'aria.directContact': ['Direktni kontakt', 'Direct contact', 'Прямой контакт'],
  'aria.apartment': ['Apartman', 'Apartment', 'Апартамент'],
  'aria.prevMonth': ['Prethodni mjesec', 'Previous month', 'Предыдущий месяц'],
  'aria.nextMonth': ['Sljedeći mjesec', 'Next month', 'Следующий месяц'],
  'aria.gallery': ['Galerija', 'Gallery', 'Галерея'],

  // booking traka
  'booking.checkin': ['Dolazak', 'Check-in', 'Заезд'],
  'booking.checkout': ['Odlazak', 'Check-out', 'Выезд'],
  'booking.adults': ['Odrasli', 'Adults', 'Взрослые'],
  'booking.children': ['Djeca', 'Children', 'Дети'],
  'booking.childAge': ['Uzrast djeteta {n}', 'Age of child {n}', 'Возраст ребёнка {n}'],
  'booking.crib': ['Treba mi krevetac za bebu', 'I need a baby crib', 'Нужна детская кроватка'],
  'booking.fewer': ['Manje', 'Fewer', 'Меньше'],
  'booking.more': ['Više', 'More', 'Больше'],
  'age.under1': ['Mlađe od 1 god.', 'Under 1 yr', 'Младше 1 года'],
  'age.n': ['{n} god.', '{n} yrs', '{n} лет'],
  'booking.pickDates': ['Izaberite datum dolaska i odlaska.', 'Please choose your check-in and check-out dates.', 'Выберите даты заезда и выезда.'],

  // footer
  'footer.about': ['O nama', 'About us', 'О нас'],
  'footer.follow': ['Pratite nas', 'Follow us', 'Мы в соцсетях'],
  'footer.privacy': ['Politika privatnosti', 'Privacy policy', 'Политика конфиденциальности'],
  'footer.rights': ['Sva prava zadržana.', 'All rights reserved.', 'Все права защищены.'],

  // kontakt
  'contact.direct': ['Direktni kontakt', 'Direct contact', 'Прямой контакт'],
  'contact.phone': ['Telefon', 'Phone', 'Телефон'],
  'contact.address': ['Adresa', 'Address', 'Адрес'],
  'map.directions': ['Putanja do apartmana', 'Get directions', 'Построить маршрут'],
  'map.title': ['Mapa – {city}', 'Map – {city}', 'Карта – {city}'],

  // kalendar dostupnosti
  'avail.loading': ['Učitavanje kalendara…', 'Loading the calendar…', 'Загрузка календаря…'],
  'avail.free': ['Slobodno', 'Available', 'Свободно'],
  'avail.taken': ['Zauzeto', 'Booked', 'Занято'],
  'avail.yours': ['Vaš izbor', 'Your choice', 'Ваш выбор'],
  'avail.past': ['prošlo', 'past', 'прошло'],
  'avail.freeLower': ['slobodno', 'available', 'свободно'],
  'avail.takenLower': ['zauzeto', 'booked', 'занято'],
  'avail.chosen': ['Izabrano: {range}', 'Selected: {range}', 'Выбрано: {range}'],
  'avail.pickOut': ['Sada izaberite dan odlaska.', 'Now choose your check-out day.', 'Теперь выберите день выезда.'],
  'avail.notFree': ['Izabrani termin nije slobodan. Izaberite druge datume.', 'The selected dates are not available. Please choose other dates.', 'Выбранные даты недоступны. Выберите другие даты.'],

  // datum, apartmani
  'f.pickDate': ['Izaberite datum', 'Choose a date', 'Выберите дату'],
  'apt.photosAll': ['Sve fotografije ({n})', 'All photos ({n})', 'Все фотографии ({n})'],
  'apt.photo': ['{name} – fotografija {n}', '{name} – photo {n}', '{name} – фото {n}'],
  'apt.ac': ['Klima', 'A/C', 'Кондиционер'],
  'apt.wifi': ['Internet', 'Wi-Fi', 'Wi-Fi'],
  'apt.tv': ['TV', 'TV', 'ТВ'],
  'apt.parking': ['Parking', 'Parking', 'Парковка'],

  // blog
  'nav.blog': ['Savjeti', 'Tips', 'Советы'],
  'nav.around': ['Okolina', 'Around Tivat', 'Окрестности'],
  'blog.title': ['Savjeti za boravak u Tivtu', 'Travel tips for Tivat', 'Советы для отдыха в Тивате'],
  'sights.guide': ['Cijeli vodič', 'Full guide', 'Полный гид'],
  'blog.read': ['Pročitaj članak', 'Read article', 'Читать статью'],
  'blog.all': ['Svi članci', 'All articles', 'Все статьи'],
  'blog.related': ['Pročitajte i', 'Read next', 'Читайте также'],
  'blog.ctaTitle': ['Planirate odmor u Tivtu?', 'Planning a holiday in Tivat?', 'Планируете отдых в Тивате?'],
  'blog.ctaText': ['Provjerite slobodne termine u apartmanima Olive, Lavande i Lemoni i pošaljite upit.', 'Check the available dates in the Olive, Lavande and Lemoni apartments and send an inquiry.', 'Проверьте свободные даты в апартаментах Olive, Lavande и Lemoni и отправьте запрос.'],
  'blog.ctaButton': ['Provjeri slobodne termine', 'Check availability', 'Проверить свободные даты'],
  'blog.home': ['Početna', 'Home', 'Главная'],
  'blog.stay': ['Apartmani', 'Apartments', 'Апартаменты'],

  // utisci
  'review.source': ['Recenzija sa Google Maps-a', 'Review on Google Maps', 'Отзыв на Google Maps'],

  // forma za upit
  'f.name': ['Ime i prezime *', 'Full name *', 'Имя и фамилия *'],
  'f.email': ['Email *', 'Email *', 'Email *'],
  'f.phone': ['Telefon', 'Phone', 'Телефон'],
  'f.messengers': ['Dostupan/na sam i na', 'I am also available on', 'Я также на связи в'],
  'f.checkin': ['Dolazak *', 'Check-in *', 'Заезд *'],
  'f.checkout': ['Odlazak *', 'Check-out *', 'Выезд *'],
  'f.adults': ['Odrasli *', 'Adults *', 'Взрослые *'],
  'f.children': ['Djeca', 'Children', 'Дети'],
  'f.ages': ['Uzrast djece (npr. 3, 7)', 'Children’s ages (e.g. 3, 7)', 'Возраст детей (напр. 3, 7)'],
  'f.crib': ['Treba mi krevetac za bebu', 'I need a baby crib', 'Мне нужна детская кроватка'],
  'f.apartment': ['Apartman', 'Apartment', 'Апартамент'],
  'f.noPref': ['Bez preferencije', 'No preference', 'Без предпочтений'],
  'f.message': ['Poruka', 'Message', 'Сообщение'],
  'f.consent': [
    'Saglasan/na sam sa {link} i obradom podataka radi odgovora na upit. *',
    'I agree to the {link} and to my data being processed in order to answer my inquiry. *',
    'Я согласен/согласна с {link} и обработкой данных для ответа на мой запрос. *',
  ],
  'f.privacyLink': ['politikom privatnosti', 'privacy policy', 'политикой конфиденциальности'],
  'f.honeypot': ['Ne popunjavati', 'Do not fill in', 'Не заполнять'],

  // poruke forme
  'm.fullname': ['Unesite ime i prezime.', 'Please enter your full name.', 'Введите имя и фамилию.'],
  'm.emailEmpty': ['Unesite email adresu.', 'Please enter your email address.', 'Введите адрес электронной почты.'],
  'm.emailBad': ['Unesite ispravnu email adresu (npr. ime@domen.com).', 'Please enter a valid email address (e.g. name@domain.com).', 'Введите корректный адрес (напр. name@domain.com).'],
  'm.phoneBad': ['Unesite ispravan broj telefona (cifre, razmaci, + i -).', 'Please enter a valid phone number (digits, spaces, + and -).', 'Введите корректный номер телефона (цифры, пробелы, + и -).'],
  'm.checkinEmpty': ['Izaberite datum dolaska.', 'Please choose a check-in date.', 'Выберите дату заезда.'],
  'm.checkinPast': ['Datum dolaska ne može biti u prošlosti.', 'The check-in date cannot be in the past.', 'Дата заезда не может быть в прошлом.'],
  'm.checkoutEmpty': ['Izaberite datum odlaska.', 'Please choose a check-out date.', 'Выберите дату выезда.'],
  'm.checkoutOrder': ['Datum odlaska mora biti poslije datuma dolaska.', 'The check-out date must be after the check-in date.', 'Дата выезда должна быть позже даты заезда.'],
  'm.guests': ['Ukupan broj gostiju mora biti između {min} i {max}.', 'The total number of guests must be between {min} and {max}.', 'Общее число гостей должно быть от {min} до {max}.'],
  'm.consent': ['Morate prihvatiti politiku privatnosti da biste poslali upit.', 'You must accept the privacy policy to send your inquiry.', 'Чтобы отправить запрос, примите политику конфиденциальности.'],
  'm.sending': ['Šalje se…', 'Sending…', 'Отправка…'],
  'm.success': ['Hvala! Vaš upit je poslat. Javićemo vam se na email adresu koju ste unijeli.', 'Thank you! Your inquiry has been sent. We will reply to the email address you provided.', 'Спасибо! Ваш запрос отправлен. Мы ответим на указанный адрес электронной почты.'],
  'm.tooFast': ['Molimo sačekajte nekoliko sekundi i pokušajte ponovo.', 'Please wait a few seconds and try again.', 'Подождите несколько секунд и попробуйте снова.'],
  'm.failed': ['Slanje nije uspjelo. Pokušajte ponovo ili nas kontaktirajte direktno.', 'Sending failed. Please try again or contact us directly.', 'Не удалось отправить. Попробуйте снова или свяжитесь с нами напрямую.'],
  'm.mailto': ['Otvaramo vaš email program sa popunjenim upitom. Ako se ništa ne desi, pošaljite poruku na {email}.', 'We are opening your email app with the inquiry filled in. If nothing happens, send a message to {email}.', 'Открываем вашу почтовую программу с готовым запросом. Если ничего не произошло, напишите на {email}.'],
  'm.noTarget': ['Slanje forme još nije podešeno. Kontaktirajte nas direktno (podaci pored forme).', 'The form is not set up yet. Please contact us directly (details next to the form).', 'Форма ещё не настроена. Свяжитесь с нами напрямую (контакты рядом с формой).'],

  // datum i trajanje
  'date.nights.one': ['noćenje', 'night', 'ночь'],
  'date.nights.few': ['noćenja', 'nights', 'ночи'],
  'date.nights.many': ['noćenja', 'nights', 'ночей'],
};

export const i18n = Object.fromEntries(
  Object.keys(LANG_INDEX).map((code) => [code, Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v[LANG_INDEX[code]]]))])
);

// ---------- trenutni jezik ----------
let current = defaultLang;
export const getLang = () => current;
export const setLang = (lang) => {
  current = i18n[lang] ? lang : defaultLang;
  return current;
};

/** Prevod ključa; ako ga nema u izabranom jeziku, koristi crnogorski. `vars` mijenja {n}, {max}... u tekstu. */
export const t = (key, vars, lang = current) => {
  let s = i18n[lang]?.[key] ?? i18n[defaultLang][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
};

/** Postavlja atribut lang na <html> i stanje dugmadi za jezik. */
export function applyLanguage(lang, root = document) {
  const code = setLang(lang);
  document.documentElement.lang = LANG_TAGS[code] ?? code;
  root.querySelectorAll('[data-lang][aria-pressed]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === code));
  });
  return code;
}
