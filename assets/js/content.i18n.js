// ============================================================
//  PREVODI SADRŽAJA SEKCIJA (engleski i ruski)
//  Osnovni (srpski) tekstovi su u content.js. Ovdje su samo izmijenjena polja,
//  istim redoslijedom i strukturom kao u content.js; sve što ovdje ne postoji
//  ostaje na srpskom. Liste (apartments, items...) se spajaju po redoslijedu.
// ============================================================
import * as base from './content.js';

const lavandeLemoniText = {
  en: (n) =>
    `Holiday home ${n} is a spacious 60 m² apartment for 2 to 4 guests. It consists of one large bedroom with a double bed and a sofa, a living room with a large corner sofa bed, a bathroom and a fully equipped kitchen. Guests have a TV, internet and two air conditioners. The apartment has a private entrance, a terrace and a spacious yard in the shade of olive trees with an outdoor grill, ideal for relaxing and socialising. The modern, practical layout gives guests privacy and comfort throughout their stay.`,
  ru: (n) =>
    `Holiday home ${n} — просторный апартамент площадью 60 м² для 2–4 человек. Он состоит из одной большой спальни с двуспальной кроватью и диваном, гостиной с большим угловым раскладным диваном, ванной комнаты и полностью оборудованной кухни. В распоряжении гостей телевизор, интернет и два кондиционера. У апартамента отдельный вход, терраса и просторный двор в тени оливковых деревьев с уличным грилем — идеально для отдыха и общения. Современная и удобная планировка обеспечивает гостям приватность и комфорт на протяжении всего пребывания.`,
};

const lavandeLemoniFeatures = {
  en: [
    'Bedroom with a double bed and a sofa',
    'Living room with a large corner sofa bed',
    'Fully equipped kitchen and bathroom',
    'TV, internet and two air conditioners',
    'Private entrance, terrace and a spacious yard in the shade of olive trees with an outdoor grill',
    'Parking',
  ],
  ru: [
    'Спальня с двуспальной кроватью и диваном',
    'Гостиная с большим угловым раскладным диваном',
    'Полностью оборудованная кухня и ванная комната',
    'Телевизор, интернет и два кондиционера',
    'Отдельный вход, терраса и просторный двор в тени олив с уличным грилем',
    'Парковка',
  ],
};

const aptName = (id) => base.apartments.find((a) => a.id === id).name;

export const translations = {
  en: {
    site: {
      title: 'Tivat Garden Homes – Apartments in Tivat',
      description:
        'Holiday homes Olive, Lavande and Lemoni in Tivat: Mediterranean setting among olive trees, beach about 300 m away, Porto Montenegro about 1 km. Send an inquiry for your stay.',
    },
    contact: { countryName: 'Montenegro' },
    hero: {
      image: { alt: 'View of the sea and the coast of Tivat among olive trees' },
      subtitle: 'Apartments in Tivat',
      text: 'Apartments Olive, Lavande and Lemoni are in a great location in Tivat, in a peaceful Mediterranean setting surrounded by olive trees.',
    },
    intro: {
      title: 'Great location and easy access',
      text:
        'Holiday home Olive, Holiday home Lavande and Holiday home Lemoni are in a great location in Tivat with very good transport connections. The bus station and a taxi stand are close by, and the airport is easy to reach.\n\nThe beach is about 300 m away, two large supermarkets about 50 m, a restaurant about 70 m, and Porto Montenegro about 1 km.',
      image: { alt: 'Porto Montenegro in Tivat' },
    },
    apartmentsSection: { title: 'Apartments' },
    apartments: [
      {
        guests: '2–4 guests',
        summary:
          'Holiday home Olive is a comfortable 50 m² apartment for 2 to 4 guests. It has two separate bedrooms, each with a double bed. The living room with a fully equipped kitchen is a separate space, and there is a bathroom. Guests have a TV, internet and two air conditioners. The apartment has a private entrance, a terrace, a spacious yard in the shade of olive trees with an outdoor grill, and parking, which makes it an excellent choice for couples, families and longer stays.',
        features: [
          'Two separate bedrooms with double beds',
          'Living room with a sofa',
          'Fully equipped kitchen and bathroom',
          'TV, internet and two air conditioners',
          'Private entrance, terrace, spacious yard in the shade of olive trees with an outdoor grill',
          'Parking',
        ],
        image: { alt: 'Living room – Holiday home Olive' },
      },
      {
        guests: '2–4 guests',
        summary: lavandeLemoniText.en(aptName('lavanda')),
        features: lavandeLemoniFeatures.en,
        image: { alt: 'Living room and kitchen – Holiday home Lavande' },
      },
      {
        guests: '2–4 guests',
        summary: lavandeLemoniText.en(aptName('lemoni')),
        features: lavandeLemoniFeatures.en,
        image: { alt: 'Kitchen – Holiday home Lemoni' },
      },
    ],
    pricing: {
      title: 'Prices and benefits',
      items: [
        { label: 'Off-season', unit: 'per day' },
        { label: 'From 1 June to 1 September', unit: 'per day' },
        { label: 'New Year holidays', note: '31 Dec, 1 Jan and 2 Jan', unit: 'per day' },
      ],
      basis: 'Prices are per apartment.',
      checkInfo: 'Check-in from 14:00, check-out by 10:00.',
      discounts: [
        'A 10% discount is possible for stays of 10 days or more.',
        'For a stay of a month, a better price is possible, with a discount of up to 20%.',
      ],
      disclaimer: 'Prices are approximate and may vary depending on the dates and length of stay. We confirm the final price for your dates after your inquiry – send an inquiry and we will get back to you.',
    },
    gallery: [
      { alt: 'Living room with a corner sofa and a dining table' },
      { alt: 'Bathroom with a shower and a round illuminated mirror' },
      { alt: 'Bedroom with a double bed and a sofa' },
      { alt: 'Living room with a TV, a dining table and a desk' },
      { alt: 'Bathroom with a round mirror and a stone sink' },
      { alt: 'Bedroom with two beds' },
      { alt: 'Living room with a kitchen and a sofa' },
      { alt: 'Bathroom with a white sink' },
      { alt: 'Bedroom with a double bed' },
      { alt: 'Bedroom with a bed by the window' },
      { alt: 'Terrace with a grapevine and a wooden table in the yard' },
      { alt: 'Apartment entrance and an olive tree in the yard' },
      { alt: 'View of the sea and an oleander at sunset' },
      { alt: 'Basket of grapes and wine in the olive grove' },
      { alt: 'Apartment exterior with a path and a yard' },
    ],
    feature: {
      title: 'Mediterranean atmosphere among olive trees',
      text: 'The apartments offer a calm and pleasant Mediterranean setting surrounded by olive trees, close to the sea, the town centre and all the important amenities.',
      image: { alt: 'Yard with a terrace in the shade of grapevines' },
    },
    reviews: [
      {
        title: 'A perfect ten!',
        text: 'A perfect ten! Staying at this accommodation was one of the best experiences we\'ve ever had. The accommodation is even more beautiful in person than in the pictures – spotlessly clean, modern and in a great location. The attention to detail is incredible, from the comfort of the bed to the little things that make the stay enjoyable. The hosts welcomed us extremely warmly and made us feel right at home. Our sincere recommendation for anyone looking for the perfect vacation!',
      },
      {
        title: 'Feels like home, on vacation',
        text: 'If you like to feel at home but in your vacation this the place. Large apartment, new, clean, lots of things like decorations, kitchen equipped read to make your meals, comfortable beds and so... To sum - we totally recommend this place',
      },
      {
        title: 'Beautiful apartment',
        text: 'Beautiful apartment and very kind hosts, no one will regret being a guest of these good people.',
      },
    ],
    dark: {
      title: 'For short and long stays',
      text: 'Being close to the sea, the town centre and all the important amenities makes the apartments an excellent choice for both short and longer stays.',
      image: { alt: 'Living room with kitchen' },
    },
    beaches: {
      title: 'Beaches worth visiting',
      items: [
        {
          name: 'Kalardovo',
          desc: 'Kalardovo is an excursion beach about 2 km from the apartments, close to the airport and the Island of Flowers. It is sandy and about 250 m long. With its shallow water, the usual beach furniture and many facilities nearby, it is ideal for families with small children. There is no accommodation nearby, so people come purely to swim and relax by the sea. There is no bus service, so you need your own or a rented car, or a taxi. Parking is available in front of the beach, so arriving by car is easy.',
        },
        {
          name: 'Plavi Horizonti',
          desc: 'The largest and most important beach in the Tivat area. It lies at the bottom of Pržno bay, considered one of the most beautiful in this part of the Adriatic. The beach is sandy, 350 m long and covered with fine sand said to have healing properties, especially for rheumatic conditions. The sand stretches far into the shallow sea, making it an ideal destination for children and family holidays. Next to the beach there are a pine forest and olive groves, so bathers can find natural shade under their branches. This area has the most hours of sunshine per year. The beach is fully equipped with showers and toilets, and there are many restaurants and cafés, sports courts and parking nearby.',
        },
        {
          name: 'Jaz',
          desc: 'Jaz is one of the most popular beaches in Montenegro, and the travel guide “Lonely Planet” ranked it among the 10 best beaches in Europe. It lies 3 km west of Budva and is about 800 m long, divided into two parts. The smaller beach is pebbly (about 300 m) and the larger one sandy (about 500 m). Next to the pebble beach there is a large campsite. The larger beach is surrounded by many bars and cafés, and in summer it hosts numerous concerts and events.',
        },
        {
          name: 'Župa Beach',
          desc: 'Župa beach lies in a bay just before the entrance to Tivat from the south. It is a small sandy beach about 70 m long, set in a quiet bay. Next to the beach there is a dense pine forest that lets guests enjoy natural shade even on the hottest days. Thanks to its modest size and green surroundings, it is a good place to relax in a natural setting.',
        },
      ],
    },
    extraSections: {
      sights: {
        title: 'Sights nearby',
        items: [
          {
            name: 'Tivat',
            desc: 'Tivat is the calmest town in the bay, ideal for a slow-paced holiday. The seaside promenade leads past beaches, cafés and restaurants, and the Porto Montenegro marina, with its yachts and elegant waterfront, attracts guests from all over the world. For nature lovers there are the Solila salt pans, a protected bird habitat, and the Island of Flowers just off the coast.',
            highlights: ['Porto Montenegro and its promenade', 'Seaside promenade and town park', 'Solila (ornithological reserve)', 'Island of Flowers'],
            image: { alt: 'Tivat' },
          },
          {
            name: 'Kotor',
            desc: 'The Old Town of Kotor lies beneath steep mountains at the end of the bay and is one of the best-preserved medieval towns in the Mediterranean. Narrow stone streets, squares and churches preserve centuries of history, and the Cathedral of Saint Tryphon dominates the centre. For the best view of the bay, climb to the St John Fortress above the town, ideally in the early morning or late afternoon.',
            highlights: [
              'Kotor Old Town (UNESCO)',
              'Cathedral of Saint Tryphon',
              'City walls and St John Fortress',
              'A walk along the bay',
              'Drive from the apartments: about 15 minutes',
            ],
            image: { alt: 'Kotor' },
          },
          {
            name: 'Budva',
            desc: 'Budva combines history and fun: the Old Town with its stone streets and the Citadel sits on a peninsula by the sea, and beaches such as Mogren and Slovenska Plaža line up around it. In the evening the town comes alive with cafés, restaurants and music. From Budva it is easy to reach Sveti Stefan, the famous island hotel, best seen from the viewpoint above it.',
            highlights: [
              'Old Town and Citadel',
              'Mogren and Slovenska Plaža beaches',
              'Seaside promenade and nightlife',
              'View of Sveti Stefan',
              'Drive from the apartments: about 30 minutes',
            ],
            image: { alt: 'Budva' },
          },
        ],
      },
      food: {
        title: 'Mediterranean cuisine',
        intro: 'The Montenegrin coast is known for simple, healthy and delicious Mediterranean cuisine that for centuries has relied on the gifts of the sea and the hinterland. Fresh fish just out of the nets, fragrant homemade olive oil, ripe lemon, garlic and herbs such as rosemary and parsley are the basis of every authentic Boka meal. In our konobas and restaurants food is not just a meal but a way of life: light, aromatic and made for long enjoyment with a glass of good homemade wine.',
        items: [
          { name: 'Grilled fish (gradele)', desc: 'There is nothing more honest on the coast than fresh sea fish prepared on a traditional grill. Whether it is gilthead bream, sea bass, dentex or scorpion fish, the preparation is simple and the taste perfect: the fish is cooked over moderate wood embers, constantly brushed with a sprig of rosemary dipped in extra virgin olive oil. It is served hot, drizzled with a marinade of finely chopped garlic, parsley and olive oil, with the inevitable slice of lemon and a side of boiled Swiss chard and potatoes.', image: { alt: 'Grilled fish (gradele)' } },
          { name: 'Black risotto', desc: 'Black cuttlefish risotto is an absolute classic of Boka and coastal menus. Its distinctive, intense black colour and deep scent of the sea come from the natural ink the cuttlefish releases. The rice is simmered gently with pieces of juicy cuttlefish, garlic, olive oil and a drop of Montenegrin white wine until it becomes creamy and full of the flavours of the sea. The dish is traditionally served with a few drops of lemon juice and a little grated hard cheese.', image: { alt: 'Black risotto' } },
          { name: 'Brudet', desc: 'Brudet (or brodet) is an old fishermen’s dish that carries the whole philosophy of coastal cooking. It began as a meal fishermen prepared on board from several kinds of sea fish (such as scorpion fish, monkfish, conger eel or gilthead bream), and is slowly simmered in a thick sauce of ripe tomatoes, red and white onion, olive oil and wine. The secret of a true brudet is that it is not stirred with a spoon while cooking; the pot is only gently shaken now and then so the pieces of fish stay whole. It is most often served with hot polenta (kačamak), which perfectly soaks up the rich sauce.', image: { alt: 'Brudet' } },
          { name: 'Cured ham and cheese', desc: 'The essential cold starter and the warmest welcome in any Boka home is a combination of authentic flavours from the Montenegrin karst: Njeguši prosciutto and ripe homemade cheese. Dried in clean mountain air where the sea and mountain currents meet, the ham has a distinctive aroma of beechwood smoke and a recognisable texture that melts in the mouth. It is served with full-fat semi-hard Njeguši cheese, aged cheese in oil or homemade goat cheese, homemade bread and homemade olives, perfect for starting dinner with a glass of Montenegrin Vranac.', image: { alt: 'Cured ham and cheese' } },
          { name: 'Olive oil and olives', desc: 'The olive is the sacred tree of the coast and a centuries-old symbol of peace and longevity, and olive oil is the foundation of every Mediterranean table. Along the bay and the Luštica peninsula there are centuries-old olive groves whose fruit, by traditional cold pressing, gives a thick, golden-green extra virgin oil with a rich, slightly peppery flavour. Homemade salted and marinated olives, served with a little aromatic herbs and homemade bread dipped in the oil, offer the purest taste of the Mediterranean in its simplest form.', image: { alt: 'Olive oil and olives' } },
        ],
      },
    },
    availability: {
      title: 'Availability',
      text: 'Choose an apartment and your check-in and check-out dates to see which dates are free, then send an inquiry.',
    },
    booking: {
      title: 'Send a booking inquiry',
      text: 'Choose your dates, the number of guests and an apartment, and we will get back to you.',
    },
    footer: {
      about:
        'Holiday home Olive, Lavande and Lemoni are in a great location in Tivat. The apartments offer a calm, pleasant Mediterranean setting surrounded by olive trees, close to the sea and the very centre of town.',
    },
  },

  ru: {
    site: {
      title: 'Tivat Garden Homes – Апартаменты в Тивате',
      description:
        'Holiday home Olive, Lavande и Lemoni в Тивате: средиземноморская атмосфера среди олив, пляж в 300 м, Порто Монтенегро в 1 км. Отправьте запрос на проживание.',
    },
    contact: { countryName: 'Черногория' },
    hero: {
      image: { alt: 'Вид на море и побережье Тивата среди олив' },
      subtitle: 'Апартаменты в Тивате',
      text: 'Апартаменты Olive, Lavande и Lemoni расположены в отличном месте в Тивате, в тихой средиземноморской обстановке среди оливковых деревьев.',
    },
    intro: {
      title: 'Отличное расположение и удобная транспортная доступность',
      text:
        'Holiday home Olive, Holiday home Lavande и Holiday home Lemoni расположены в отличном месте в Тивате с очень хорошим транспортным сообщением. Рядом находятся автовокзал и стоянка такси, а до аэропорта легко добраться.\n\nДо пляжа около 300 м, до двух больших супермаркетов около 50 м, до ресторана около 70 м, а до Порто Монтенегро около 1 км.',
      image: { alt: 'Порто Монтенегро в Тивате' },
    },
    apartmentsSection: { title: 'Апартаменты' },
    apartments: [
      {
        guests: '2–4 гостя',
        summary:
          'Holiday home Olive — комфортабельный апартамент площадью 50 м², рассчитанный на 2–4 человек. Здесь две отдельные спальни, в каждой — двуспальная кровать. Отдельно расположена гостиная с полностью оборудованной кухней, а также ванная комната. В распоряжении гостей телевизор, интернет и два кондиционера. У апартамента отдельный вход, терраса, просторный двор в тени оливковых деревьев с уличным грилем и парковка — отличный выбор для пар, семей и длительного проживания.',
        features: [
          'Две отдельные спальни с двуспальными кроватями',
          'Гостиная с диваном',
          'Полностью оборудованная кухня и ванная комната',
          'Телевизор, интернет и два кондиционера',
          'Отдельный вход, терраса, просторный двор в тени олив с уличным грилем',
          'Парковка',
        ],
        image: { alt: 'Гостиная – Holiday home Olive' },
      },
      {
        guests: '2–4 гостя',
        summary: lavandeLemoniText.ru(aptName('lavanda')),
        features: lavandeLemoniFeatures.ru,
        image: { alt: 'Гостиная и кухня – Holiday home Lavande' },
      },
      {
        guests: '2–4 гостя',
        summary: lavandeLemoniText.ru(aptName('lemoni')),
        features: lavandeLemoniFeatures.ru,
        image: { alt: 'Кухня – Holiday home Lemoni' },
      },
    ],
    pricing: {
      title: 'Цены и скидки',
      items: [
        { label: 'Вне основного сезона', unit: 'в сутки' },
        { label: 'С 1 июня по 1 сентября', unit: 'в сутки' },
        { label: 'Новогодние праздники', note: '31 декабря, 1 и 2 января', unit: 'в сутки' },
      ],
      basis: 'Цены указаны за апартамент.',
      checkInfo: 'Заезд с 14:00, выезд до 10:00.',
      discounts: [
        'При проживании от 10 суток возможна скидка 10%.',
        'При проживании в течение месяца возможна более выгодная цена — скидка до 20%.',
      ],
      disclaimer: 'Цены ориентировочные и могут отличаться в зависимости от дат и срока проживания. Окончательную стоимость для ваших дат мы подтверждаем после запроса — отправьте запрос, и мы свяжемся с вами.',
    },
    gallery: [
      { alt: 'Гостиная с угловым диваном и обеденным столом' },
      { alt: 'Ванная комната с душевой кабиной и круглым зеркалом с подсветкой' },
      { alt: 'Спальня с двуспальной кроватью и диваном' },
      { alt: 'Гостиная с телевизором, обеденным столом и рабочим столом' },
      { alt: 'Ванная комната с круглым зеркалом и каменной раковиной' },
      { alt: 'Спальня с двумя кроватями' },
      { alt: 'Гостиная с кухней и диваном' },
      { alt: 'Ванная комната с белой раковиной' },
      { alt: 'Спальня с двуспальной кроватью' },
      { alt: 'Спальня с кроватью у окна' },
      { alt: 'Терраса с виноградной лозой и деревянным столом во дворе' },
      { alt: 'Вход в апартамент и олива во дворе' },
      { alt: 'Вид на море и олеандр на закате' },
      { alt: 'Корзина с виноградом и вино в оливковой роще' },
      { alt: 'Внешний вид апартамента с дорожкой и двором' },
    ],
    feature: {
      title: 'Средиземноморская атмосфера среди олив',
      text: 'Апартаменты предлагают спокойную и приятную средиземноморскую обстановку среди оливковых деревьев, рядом с морем, центром города и всей необходимой инфраструктурой.',
      image: { alt: 'Двор с террасой в тени виноградной лозы' },
    },
    reviews: [
      {
        title: 'Твёрдая десятка!',
        text: 'Твёрдая десятка! Проживание здесь стало одним из лучших впечатлений в нашей жизни. В реальности жильё ещё красивее, чем на фотографиях: безупречно чистое, современное и в отличном месте. Внимание к деталям поразительное — от удобства кровати до мелочей, которые делают отдых приятным. Хозяева встретили нас очень тепло и сделали так, чтобы мы чувствовали себя как дома. Искренне рекомендуем всем, кто ищет идеальный отпуск!',
      },
      {
        title: 'Как дома, но в отпуске',
        text: 'Если вы любите чувствовать себя как дома, но в отпуске, — это то самое место. Большой, новый, чистый апартамент, много приятных мелочей вроде декора, оборудованная кухня, где можно готовить, удобные кровати и многое другое… Короче говоря, мы однозначно рекомендуем это место.',
      },
      {
        title: 'Прекрасный апартамент',
        text: 'Прекрасный апартамент и очень добрые хозяева — никто не пожалеет, что остановился у этих хороших людей.',
      },
    ],
    dark: {
      title: 'Для коротких и длительных поездок',
      text: 'Близость моря, центра города и всей необходимой инфраструктуры делает апартаменты отличным выбором как для короткого, так и для длительного отдыха.',
      image: { alt: 'Гостиная с кухней' },
    },
    beaches: {
      title: 'Пляжи, которые стоит посетить',
      items: [
        {
          name: 'Калардово',
          desc: 'Калардово — пляж для однодневных поездок, расположенный примерно в 2 км от апартаментов, недалеко от аэропорта и острова Цветов. Пляж песчаный, длиной около 250 м. Благодаря мелкому морю, обычному пляжному оборудованию и множеству объектов инфраструктуры рядом он идеально подходит для семей с маленькими детьми. Поблизости нет мест проживания, поэтому сюда приезжают только ради купания и отдыха на море. Автобус сюда не ходит — нужен собственный или арендованный автомобиль либо такси. Перед пляжем есть парковка, так что добраться на машине просто.',
        },
        {
          name: 'Плави Хоризонти',
          desc: 'Самый большой и самый значимый пляж в районе Тивата. Он находится в глубине бухты Пржно, которая считается одной из самых красивых в этой части Адриатики. Пляж песчаный, длиной 350 м, покрыт мелким песком, который считается целебным, особенно при ревматических заболеваниях. Песчаное дно уходит далеко в мелкое море, поэтому это идеальное место для детей и семейного отдыха. Рядом с пляжем растут сосновый лес и оливковые рощи, так что купающиеся найдут естественную тень под их кронами. Этот район отличается самым большим числом солнечных часов в году. Пляж полностью благоустроен: есть души и туалеты, а рядом — множество кафе и ресторанов, спортивные площадки и парковка.',
        },
        {
          name: 'Яз',
          desc: 'Яз — один из самых популярных пляжей Черногории, а путеводитель «Lonely Planet» включил его в десятку лучших пляжей Европы. Он находится в 3 км к западу от Будвы, имеет длину около 800 м и разделён на две части. Меньший пляж галечный (около 300 м), больший — песчаный (около 500 м). Рядом с галечным пляжем расположен большой автокемпинг. Большой пляж окружён множеством баров и кафе, а летом здесь проходят многочисленные концерты и мероприятия.',
        },
        {
          name: 'Пляж Жупа',
          desc: 'Пляж Жупа находится в бухте, сразу перед въездом в Тиват с юга. Это небольшой песчаный пляж длиной около 70 м, расположенный в тихой бухте. Рядом с пляжем растёт густой сосновый лес, дарящий гостям естественную тень даже в самые жаркие дни. Благодаря скромным размерам и зелёному окружению он подходит для отдыха на природе.',
        },
      ],
    },
    extraSections: {
      sights: {
        title: 'Достопримечательности поблизости',
        items: [
          {
            name: 'Тиват',
            desc: 'Тиват — самый спокойный город залива, идеальный для неспешного отдыха. Набережная ведёт мимо пляжей, кафе и ресторанов, а марина Порто Монтенегро с яхтами и элегантной прогулочной зоной собирает гостей со всего мира. Любителям природы понравятся Солила — охраняемое место обитания птиц — и остров Цветов недалеко от берега.',
            highlights: ['Порто Монтенегро и его набережная', 'Приморская набережная и городской парк', 'Солила (орнитологический заповедник)', 'Остров Цветов'],
            image: { alt: 'Тиват' },
          },
          {
            name: 'Котор',
            desc: 'Старый город Котор расположен под крутыми горами в конце залива и относится к наиболее хорошо сохранившимся средневековым городам Средиземноморья. Узкие каменные улочки, площади и церкви хранят вековую историю, а собор Святого Трифона возвышается в центре. Чтобы увидеть самый красивый вид на залив, поднимитесь к крепости Святого Иоанна над городом — лучше всего рано утром или во второй половине дня.',
            highlights: [
              'Старый город Котор (ЮНЕСКО)',
              'Собор Святого Трифона',
              'Крепостные стены и крепость Святого Иоанна',
              'Прогулка вдоль залива',
              'Дорога от апартаментов: около 15 минут',
            ],
            image: { alt: 'Котор' },
          },
          {
            name: 'Будва',
            desc: 'Будва сочетает историю и развлечения: Старый город с каменными улочками и Цитаделью расположен на полуострове у моря, а вокруг него тянутся пляжи, такие как Могрен и Словенская плажа. Вечером город оживает: кафе, рестораны, музыка. Из Будвы легко добраться до Свети-Стефана — знаменитого острова-отеля, который лучше всего виден со смотровой площадки над ним.',
            highlights: [
              'Старый город и Цитадель',
              'Пляжи Могрен и Словенская плажа',
              'Набережная и вечерняя жизнь',
              'Вид на Свети-Стефан',
              'Дорога от апартаментов: около 30 минут',
            ],
            image: { alt: 'Будва' },
          },
        ],
      },
      food: {
        title: 'Средиземноморская кухня',
        intro: 'Черногорское побережье известно простой, здоровой и вкусной средиземноморской кухней, которая веками опирается на дары моря и внутренних земель. Свежая рыба прямо из сетей, ароматное домашнее оливковое масло, спелый лимон, чеснок и пряные травы, такие как розмарин и петрушка, — основа любого подлинного бококоторского обеда. В наших коноба и ресторанах еда — это не просто приём пищи, а образ жизни: лёгкая, ароматная и созданная для долгого удовольствия за бокалом хорошего домашнего вина.',
        items: [
          { name: 'Рыба на гриле (граделе)', desc: 'На побережье нет ничего честнее свежей морской рыбы, приготовленной на традиционном гриле. Будь то дорада, сибас, зубатка или скорпена, приготовление простое, а вкус безупречный: рыбу жарят на умеренном жару от дров, постоянно смазывая веточкой розмарина, смоченной в оливковом масле extra virgin. Подают горячей, политой маринадом из мелко нарезанного чеснока, петрушки и оливкового масла, с обязательной долькой лимона и гарниром из отварного мангольда и картофеля.', image: { alt: 'Рыба на гриле (граделе)' } },
          { name: 'Чёрное ризотто', desc: 'Чёрное ризотто из каракатицы — абсолютная классика бококоторских и приморских меню. Характерный насыщенный чёрный цвет и глубокий аромат моря дают природные чернила, которые выпускает каракатица. Рис медленно томится с кусочками сочного мяса каракатицы, чесноком, оливковым маслом и каплей черногорского белого вина, пока не станет кремовым и полным вкусов моря. Традиционно блюдо подают с несколькими каплями лимонного сока и немного тёртого твёрдого сыра.', image: { alt: 'Чёрное ризотто' } },
          { name: 'Брудет', desc: 'Брудет (или бродет) — старинное рыбацкое блюдо, в котором заключена вся философия приморской кухни. Возникнув как еда, которую рыбаки готовили на судне из нескольких видов морской рыбы (скорпены, морского чёрта, угря или дорады), брудет медленно томится в густом соусе из спелых помидоров, красного и белого лука, оливкового масла и вина. Секрет настоящего брудета в том, что при готовке его не перемешивают ложкой, а лишь время от времени слегка встряхивают кастрюлю, чтобы куски рыбы остались целыми. Чаще всего его подают с горячей поленты (качамак), которая прекрасно впитывает насыщенный соус.', image: { alt: 'Брудет' } },
          { name: 'Прошутто и сыр', desc: 'Незаменимая холодная закуска и самое тёплое приветствие в любом доме в Боке — сочетание подлинных вкусов черногорского карста: неговушское прошутто и зрелый домашний сыр. Вяленое на чистом горном воздухе, где встречаются морской и горный ветры, прошутто обладает особым ароматом дыма букового дерева и узнаваемой текстурой, тающей во рту. К нему подают жирный полутвёрдый неговушский сыр, выдержанный сыр в масле или домашний козий сыр, домашний хлеб и домашние оливки — идеально для начала ужина с бокалом черногорского вранаца.', image: { alt: 'Прошутто и сыр' } },
          { name: 'Оливковое масло и оливки', desc: 'Олива — священное дерево побережья и вековой символ мира и долголетия, а оливковое масло — основа любого средиземноморского стола. Вдоль залива и на полуострове Луштица растут вековые оливковые рощи, из плодов которых традиционным холодным отжимом получают густое золотисто-зелёное масло extra virgin с богатым, слегка острым вкусом. Домашние солёные и маринованные оливки, поданные с небольшим количеством ароматных трав, и домашний хлеб, обмакнутый в масло, дарят самый чистый вкус Средиземноморья в его простейшем виде.', image: { alt: 'Оливковое масло и оливки' } },
        ],
      },
    },
    availability: {
      title: 'Свободные даты',
      text: 'Выберите апартамент и даты заезда и выезда, чтобы увидеть свободные даты, а затем отправьте запрос.',
    },
    booking: {
      title: 'Отправьте запрос на бронирование',
      text: 'Выберите даты, количество гостей и апартамент — мы свяжемся с вами.',
    },
    footer: {
      about:
        'Holiday home Olive, Lavande и Lemoni расположены в отличном месте в Тивате. Апартаменты предлагают спокойную и приятную средиземноморскую обстановку среди оливковых деревьев, рядом с морем и самым центром города.',
    },
  },
};

// ---------- spajanje: osnovni sadržaj + prevod ----------
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function merge(b, o) {
  if (o === undefined) return b;
  if (Array.isArray(b) && Array.isArray(o)) {
    // liste objekata se spajaju po redoslijedu, liste tekstova se zamjenjuju
    return b.map((item, i) => (isObj(item) && isObj(o[i]) ? merge(item, o[i]) : o[i] !== undefined && !isObj(item) ? o[i] : item));
  }
  if (isObj(b) && isObj(o)) {
    const out = { ...b };
    for (const k of Object.keys(o)) out[k] = merge(b[k], o[k]);
    return out;
  }
  return o;
}

/** Sav sadržaj sajta na traženom jeziku (nepostojeći prevod = srpski). */
export function localizedContent(lang) {
  const plain = { ...base };
  const tr = translations[lang];
  if (!tr) return plain;
  return merge(plain, tr);
}
