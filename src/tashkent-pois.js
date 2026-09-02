import { aliasesToRegex } from './normalization.js';

function poi(name, category, aliases = [], options = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({
    canonical: name,
    name,
    category,
    categories: Object.freeze([...new Set([category, ...(options.categories || [])])]),
    aliases: Object.freeze(all),
    re: aliasesToRegex(all),
    contextRequired: Boolean(options.contextRequired),
    contextRe: options.context ? new RegExp(options.context, 'iu') : null,
    ...(options.parent ? { parent: options.parent } : {}),
  });
}

const MALL_CONTEXT = '(?:mall|молл|трц|тц|торгов(?:ый|ого)\\s+центр|savdo\\s+markazi|shopping\\s+(?:center|centre))';
const PARK_CONTEXT = '(?:парк|bog|бог|боғ|park|national|milliy|navoi|наво)';

export const TASHKENT_PARKS = Object.freeze([
  poi('Tashkent City Park', 'park', ['Ташкент Сити парк', 'Парк Tashkent City']),
  poi('Magic City', 'park', ['Magic City Park', 'Magic Park', 'Мэджик Сити']),
  poi('Ecopark', 'park', ['Eco Park', 'Экопарк', 'Центральный экопарк']),
  poi('Central Park Mirzo Ulugbek', 'park', ['Центральный парк имени Мирзо Улугбека', 'Центральный парк', 'Central Park', 'Парк Мирзо Улугбека']),
  poi('Japanese Garden', 'park', ['Японский сад', "Yapon bog'i", 'Yapon bog‘i', 'Yapon bogʻI']),
  poi('Alisher Navoi National Park', 'park', [
    'Парк имени Алишера Навои',
    'Национальный парк Узбекистана имени Алишера Навои',
    'Milliy Bog Park',
    "Milliy Bog'",
    'Milliy Bog‘',
    'Milliy Bogʻ',
    'Миллий бог',
    'Национальный парк',
  ], { contextRequired: true, context: PARK_CONTEXT }),
  poi('Dream Park', 'park', ['Dream Park имени Гафура Гуляма', 'Парк имени Гафура Гуляма', 'Парк Гафура Гуляма', 'Gafur Gulyam Park', 'Gafur Gulam Dream Park', "G'afur G'ulom bog'i", 'Парк культуры и отдыха имени Гафура Гуляма']),
  poi('Anhor Lokomotiv Park', 'park', ['Anhor Lokomotiv', 'Anhor-Lokomotiv', 'Анхор Локомотив', 'Парк Анхор Локомотив', 'Парк Локомотив']),
  poi('Tashkentland', 'park', ['Ташкентленд']),
  poi('Victory Park', 'park', ['Парк Победы', "G'alaba Bog'i", 'G‘alaba Bog‘i', 'Gʻalaba Bogʻi']),
  poi('Ashgabat Park', 'park', ['Ашхабад парк', 'Ashxobod Park', "Ashxobod bog'i", 'Ashxobod bog‘i']),
  poi('Dostlik Park', 'park', ['Парк Дустлик', "Do'stlik Park", 'Do‘stlik Park', 'Doʻstlik Park', 'Bobur Park', 'Парк Бабура', 'Парк Бобура', "Bobur bog'i", 'Bobur bog‘i']),
  poi('Navruz Park', 'park', ['Парк Навруз', 'Navroʻz bogʻi', "Navro'z bog'i"]),
  poi('Furqat Park', 'park', ['Парк Фурката', "Furqat bog'i", 'Furqat bog‘i']),
  poi('Yakub Kolas Park', 'park', ['Парк Якуба Коласа', 'Парк имени Якуба Коласа']),
  poi('Friendship of Peoples Park', 'park', ['Парк Дружбы народов', "Xalqlar Do'stligi Park", 'Xalqlar Do‘stligi Park']),
  poi('Yangi Ozbekiston Park', 'park', ["Yangi O'zbekiston Bog'i", 'Yangi O‘zbekiston Bog‘i', 'Yangi Oʻzbekiston bogʻi', 'Парк Новый Узбекистан', 'Новый Узбекистан', "Yangi O'zbekiston Park"]),
  poi('Tashkent Botanical Garden', 'park', ['Botanical Garden named after Fyodor Rusanov', 'Botanical Garden named after Fyodor Rusananov', 'Ботанический сад имени Фёдора Русанова', 'Ташкентский ботанический сад', 'Fyodor Rusanov nomidagi Botanika bog‘i', 'Toshkent botanika bog‘i']),
]);

export const TASHKENT_SQUARES = Object.freeze([
  poi('Amir Timur Square', 'square', ['Площадь Амира Темура', 'Amir Temur Square', 'Сквер Амира Темура', 'Сквер']),
  poi('Independence Square', 'square', ['Площадь Независимости', 'Mustaqillik Maydoni', 'Mustaqillik Square', 'Площадь Мустакиллик', 'Мустақиллик майдони']),
  poi('Friendship of Peoples Square', 'square', ['Площадь Дружбы народов']),
  poi('Khadra', 'square', ['Хадра', 'Xadra']),
  poi('Broadway Sayilgoh', 'square', ['Broadway', 'Бродвей', 'Сайилгох', 'Sayilgoh']),
]);

export const TASHKENT_MARKETS = Object.freeze([
  poi('Chorsu Bazaar', 'market', ['Чорсу', 'Chorsu Bazaar', 'Chorsu bozori', 'базар Чорсу', 'Чорсу бозори']),
  poi('Eski Juva Bazaar', 'market', ['Эски Жува', 'Eski Juva']),
  poi('Alay Bazaar', 'market', ['Алайский рынок', 'Алайский базар', 'Oloy bozori', 'Олой бозори']),
  poi('Qoyliq Bazaar', 'market', ['Куйлюк базар', 'Куйлик базар', "Qo'yliq bozori", 'Qo‘yliq bozori', 'Qoʻyliq bozori']),
  poi('Kuyluk Bazaar', 'market', ['Куйлюкский рынок', 'Куйлыкский базар', 'Kuyluk bazar']),
  poi('Yunusobod Bazaar', 'market', ['Юнусабадский рынок', 'Yunusobod bozori']),
  poi('Farhod Bazaar', 'market', ['Фархадский рынок', 'Фархадский базар', 'Farhod bozori']),
  poi('Uch Qahramon Bazaar', 'market', ['Уч Кахрамон', 'Уч Кахрамон базар']),
  poi('Katartal Bazaar', 'market', ['Катартал', 'Катартал базар']),
  poi('Karakamysh Bazaar', 'market', ['Каракамышский рынок']),
  poi('Parkent Bazaar', 'market', ['Паркентский рынок', 'Parkent bozori']),
  poi('Mirobod Bazaar', 'market', ['Мирабадский рынок', 'Госпитальный рынок', 'Mirobod bozori']),
  poi('Sergeli Bazaar', 'market', ['Сергели рынок', 'Сергели базар']),
  poi('Bek Baraka', 'market', ['Бек Барака']),
  poi('Ippodrom Bazaar', 'market', ['Ипподром']),
  poi('Abu Sahiy', 'market', ['Абу Сахий']),
  poi('Orikzor Bazaar', 'market', ['Урикзор', "O'rikzor", 'O‘rikzor', 'Oʻrikzor']),
  poi('Stroygorod', 'market', ['Стройгород', 'рынок Стройгород', 'Стройгород рынок', 'Stroygorod market', 'Stroygorod bazaar'], { parent: 'Uchtepa' }),
  poi('Kadysheva Bazaar', 'market', ['Кадышева рынок', 'Кадышева базар']),
  poi('Yangiobod Bazaar', 'market', ['Янгиабадский рынок', 'Янгиабад', 'Yangiobod bozori']),
]);

export const TASHKENT_MALLS = Object.freeze([
  poi('Tashkent City Mall', 'mall', ['Ташкент Сити Молл']),
  poi('Samarqand Darvoza', 'mall', ['Самарканд Дарвоза', 'Samarkand Darvoza']),
  poi('Compass Mall', 'mall', ['Compass', 'ТРЦ Compass', 'ТЦ Compass', 'Compass savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Mega Planet', 'mall', ['MegaPlanet', 'Мега Планет', 'ТРЦ Mega Planet', 'Mega Planet savdo markazi']),
  poi('Anhor Park Mall', 'mall', ['Anhor Park', 'Anhor Mall', 'Anhor Park Savdo Markazi', 'Анхор Парк', 'Анхор Молл', 'ТРЦ Анхор', 'ТЦ Анхор']),
  poi('Riviera Mall', 'mall', ['Riviera', 'Ривьера Молл', 'ТРЦ Riviera', 'Riviera savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('NEXT Mall', 'mall', ['Next', 'NEXT', 'Некст Молл', 'ТРЦ NEXT', 'NEXT savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Atlas Mall', 'mall', ['Atlas', 'Атлас Молл', 'ТРЦ Atlas', 'Atlas savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Parus Mall', 'mall', ['Parus', 'Парус Молл', 'ТРЦ Parus', 'Parus savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Depo Mall', 'mall', ['Depo', 'Депо Молл', 'ТРЦ Depo', 'Depo savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Vega Centre', 'mall', ['Vega Center', 'Вега Центр', 'Vega savdo markazi']),
  poi('Yunusabad Gallery', 'mall', ['Юнусабад Галерея', 'Yunusobod Galereya', 'Yunusobod Gallery']),
  poi('Poytaxt Mall', 'mall', ['Poytaxt', 'Пойтахт Молл', 'Пойтахт', 'Poytaxt Shopping Center', 'Poytaxt savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Alfraganus Mall', 'mall', ['Alfraganus', 'Альфраганус Молл', 'Alfraganus savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('High Town Mall', 'mall', ['HT Mall', 'HT Молл', 'HT savdo markazi']),
  poi('Seoul Mun Mall', 'mall', ['Seoul Mun', 'Сеул Мун Молл', 'Seoul Mun savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Ecobozor', 'mall', ['Eco Bozor', 'Ekobozor', 'Эко Бозор', 'Экобозор']),
  poi('Chimgan Shopping Center', 'mall', ['Chimgan', 'Chimgan Mall', 'ТРЦ Чимган', 'ТЦ Чимган', 'Chimgan savdo markazi'], { contextRequired: true, context: MALL_CONTEXT }),
  poi('Golden Life', 'mall', ['Golden Life Mall', 'Голден Лайф', 'ТРЦ Golden Life', 'ТЦ Golden Life']),
  poi("Chig'atoy Mall", 'mall', ["Chig'atoy", 'Chigatoy', "ТРЦ Chig'atoy", 'ТРЦ Чигатай', 'ТЦ Чигатай']),
  poi('Scopus Mall', 'mall', ['Scopus', 'Скопус Молл', 'ТРЦ Scopus']),
]);

export const TASHKENT_ATTRACTIONS = Object.freeze([
  poi('Tashkent TV Tower', 'attraction', ['Телебашня', 'Ташкентская телебашня']),
  poi('Minor Mosque', 'religious', ['Мечеть Минор', 'Minor masjidi', 'Минор'], { contextRequired: true, context: '(?:мечет|mosque|masjid|масжид)' }),
  poi('Hazrati Imam', 'attraction', ['Хазрати Имам', 'Хаст Имам', 'Hast Imam', 'Khazrati Imam Complex']),
  poi('Kaffal Shashi Mausoleum', 'religious', ['Мавзолей Каффаля Шаши']),
  poi('Barak-Khan Madrasa', 'religious', ['Медресе Баракхан', 'Barak Khan Madrasa']),
  poi('Kukeldash Madrasa', 'religious', ['Медресе Кукельдаш']),
  poi('Khoja Ahrar Vali Mosque', 'religious', ['Мечеть Ходжа Ахрар Вали']),
  poi('Sacred Heart Cathedral', 'religious', ['Собор Святейшего Сердца Иисуса', 'Католический костёл']),
  poi('Holy Assumption Cathedral', 'religious', ['Успенский собор']),
  poi('Sheikh Zayniddin Mosque', 'religious', ['Мечеть Шейха Зайниддина']),
  poi('Suzuk Ota', 'attraction', ['Сузук Ота', 'Комплекс Сузук Ота']),
  poi('Ming Urik Archaeological Site', 'attraction', ['Минг Урик', "Ming O'rik archaeological site", 'Ming Urik'], { contextRequired: true, context: '(?:археолог|archaeolog|site|городищ|комплекс)' }),
]);

export const TASHKENT_CULTURAL_POIS = Object.freeze([
  poi('Amir Timur Museum', 'museum', ['Государственный музей истории Тимуридов', 'Музей Амира Темура', 'Museum of the Temurids']),
  poi('State Museum of History of Uzbekistan', 'museum', ['Государственный музей истории Узбекистана']),
  poi('Museum of Arts of Uzbekistan', 'museum', ['Государственный музей искусств Узбекистана']),
  poi('Museum of Applied Arts', 'museum', ['Музей прикладного искусства']),
  poi('Railway Museum', 'museum', ['Музей железнодорожной техники']),
  poi('Museum of Olympic Glory', 'museum', ['Музей Олимпийской славы']),
  poi('Tamara Khanum Museum', 'museum', ['Дом-музей Тамары Ханум']),
  poi('Alisher Navoi Museum of Literature', 'museum', ['Музей литературы Алишера Навои']),
  poi('Art Gallery of Uzbekistan', 'museum', ['Государственная галерея искусств']),
  poi('Alisher Navoi Theatre', 'culture', ['Театр имени Алишера Навои', 'Большой театр Навои']),
  poi('Xalqlar Dostligi Palace', 'culture', ['Дворец Дружбы народов', "Xalqlar Do'stligi Palace", 'Xalqlar Do‘stligi Palace']),
  poi('Istiqlol Palace', 'culture', ['Дворец искусств Истиклол']),
  poi('Dom Kino', 'culture', ['Дом кино']),
  poi('Panoramic Cinema', 'culture', ['Панорамный кинотеатр']),
  poi('Alley of Writers', 'culture', ['Аллея литераторов']),
  poi('Tashkent Chimes', 'culture', ['Куранты', 'Ташкентские куранты']),
]);

export const TASHKENT_TRANSPORT_POIS = Object.freeze([
  poi('Tashkent International Airport', 'airport', ['Международный аэропорт Ташкент', 'Аэропорт имени Ислама Каримова', 'Международный аэропорт имени Ислама Каримова', 'Tashkent Airport', 'Toshkent aeroporti']),
  poi('Tashkent Domestic Airport', 'airport', ['Аэропорт местных авиалиний', 'Аэропорт внутренних рейсов']),
  poi('Tashkent Central Railway Station', 'railway', ['Северный вокзал', 'Ташкент Северный', 'Toshkent Markaziy', 'Центральный вокзал', 'Ташкент Северный вокзал']),
  poi('Tashkent South Railway Station', 'railway', ['Южный вокзал', 'Ташкент Южный', 'Toshkent Janubiy', 'Ташкент Южный вокзал']),
  poi('Tashkent Bus Station', 'bus', ['Автовокзал Ташкент']),
]);

const TASHKENT_MEDICAL_ACADEMY = poi('Tashkent Medical Academy', 'university', ['ТМА', 'Ташкентская медицинская академия'], { categories: ['medical'] });

export const TASHKENT_UNIVERSITIES = Object.freeze([
  poi('National University of Uzbekistan', 'university', ['Национальный университет Узбекистана', 'NUUz', "O'zMU", 'O‘zMU', 'OʻzMU']),
  poi('University of World Economy and Diplomacy', 'university', ['Университет мировой экономики и дипломатии', 'UWED']),
  poi('Westminster International University in Tashkent', 'university', ['WIUT', 'Вестминстер']),
  poi('Turin Polytechnic University in Tashkent', 'university', ['Turin Polytechnic University', 'Туринский политех']),
  poi('INHA University in Tashkent', 'university', ['INHA', 'Университет Инха']),
  poi('Tashkent State Technical University', 'university', ['ТашГТУ', 'ТГТУ']),
  poi('Tashkent State University of Economics', 'university', ['ТГЭУ', 'Ташкентский государственный экономический университет']),
  poi('Tashkent State University of Law', 'university', ['ТГЮУ', 'Ташкентский государственный юридический университет']),
  TASHKENT_MEDICAL_ACADEMY,
  poi('Tashkent University of Information Technologies', 'university', ['TUIT', 'ТУИТ']),
  poi('Webster University Tashkent', 'university', ['Webster', 'Университет Вебстера в Ташкенте', 'Вебстерский университет', 'Toshkentdagi Webster universiteti']),
  poi('TEAM University', 'university', ['Университет TEAM', 'TEAM университет', 'TEAM Universiteti']),
  poi('Kimyo International University', 'university', ['KIUT', 'Yeoju', 'Ташкентский международный университет Кимё', 'Международный университет Кимё в Ташкенте', 'Технический институт Ёджу', 'Toshkent Kimyo xalqaro universiteti', 'Kimyo xalqaro universiteti']),
  poi('MDIS Tashkent', 'university', ['MDIS', 'СИРМТ', 'Сингапурский институт развития менеджмента в Ташкенте', 'Toshkentdagi Singapur menejmentni rivojlantirish instituti']),
  poi('Ajou University in Tashkent', 'university', ['AUT', 'ADJU', 'Университет Аджу в Ташкенте', 'Университет Аджу в городе Ташкент', 'Toshkent shahridagi Adju Universiteti', 'Toshkentdagi Adju universiteti']),
  poi('New Uzbekistan University', 'university', ['Новый университет Узбекистана']),
]);

export const TASHKENT_SCHOOLS = Object.freeze([
  poi('Tashkent International School', 'school', ['TIS', 'American School Tashkent', 'Международная школа Ташкента', 'Ташкентская международная школа']),
  poi('Academic Lyceum under WIUT', 'school', ['ALWIUT', 'Westminster Academic Lyceum', 'Академический лицей при Вестминстерском университете', 'Лицей Вестминстер']),
  poi('Academic Lyceum under TMA', 'school', ['TMA Academic Lyceum', 'Академический лицей при ТМА', 'Лицей Ташкентской медицинской академии']),
  poi('Tashkent Ulugbek International School', 'school', ['Ulugbek International School', 'Улугбекская международная школа', 'Международная школа Улугбека']),
  poi('Uzbek International School Invento', 'school', ['Invento International School', 'Invento School', 'Международная школа Invento', 'Школа Invento']),
]);

export const TASHKENT_MEDICAL_POIS = Object.freeze([
  TASHKENT_MEDICAL_ACADEMY,
  poi('Tashkent City Hospital No. 1', 'medical', ['1-я городская больница']),
  poi('Tashkent City Hospital No. 4', 'medical', ['4-я городская больница']),
  poi('Tashkent City Hospital No. 5', 'medical', ['5-я городская больница']),
  poi('Tashkent City Hospital No. 7', 'medical', ['7-я городская больница']),
  poi('Tashkent City Hospital No. 16', 'medical', ['16-я городская больница', '16-я больница']),
  poi('Republican Oncology Center', 'medical', ['Республиканский онкоцентр', 'Онкология']),
  poi('Republican Cardiology Center', 'medical', ['Республиканский кардиоцентр', 'Кардиоцентр']),
  poi('Republican Emergency Medical Center', 'medical', ['Республиканский центр экстренной медицинской помощи']),
  poi('Republican Research Centre of Emergency Medicine', 'medical', ['Tashkent Emergency Medicine Center', 'Республиканский научный центр экстренной медицинской помощи', 'Республиканский центр экстренной медицины', '16-я городская больница']),
  poi('Republican Ophthalmology Hospital', 'medical', ['Republican Eye Hospital', 'Республиканская офтальмологическая больница', 'Республиканская глазная больница']),
  poi('Republican Hematology Center', 'medical', ['Tashkent Hematology Center', 'Республиканский гематологический центр', 'Центр гематологии']),
  poi('Republican Thoracic Surgery Center Vakhidov', 'medical', ['Vakhidov Thoracic Surgery Center', 'Республиканский центр грудной хирургии им. Вахидова', 'Центр грудной хирургии Вахидова']),
  poi('Tashkent International Clinic', 'medical', ['TIMC', 'Tashkent International Medical Clinic', 'Ташкентская международная клиника']),
  poi('Republican Pathological Anatomy Center', 'medical', ['Republican Pathology Center', 'Республиканский патологоанатомический центр', 'Центр патологической анатомии']),
  poi('Republic Specialized Nephrology and Transplantation Centre', 'medical', ['Republican Nephrology Center', 'Республиканский нефрологический центр', 'Центр нефрологии и трансплантации']),
  poi('Republican Perinatal Center', 'medical', ['Республиканский перинатальный центр', 'Перинатальный центр']),
  poi('Institute of Obstetrics and Gynecology', 'medical', ['Институт акушерства и гинекологии']),
  poi('AKFA Medline', 'medical', ['AKFA MEDLINE', 'Akfa Medline', 'Акфа Медлайн']),
  poi('Shifo Nur', 'medical', ['Шифо Нур']),
  poi('Nano Medical Clinic', 'medical', ['Клиника Нано', 'Nano Clinic', 'Nano Klinikasi', 'Nano tibbiy klinikasi']),
  poi('Medas Medical Center', 'medical', ['Medas Group', 'MEDAS', 'Медицинский центр MEDAS']),
  poi('Prof Med Clinic', 'medical', ['ProfMedService', 'Prof Med Klinikasi', 'Клиника Профмедсервис']),
  poi('Dr. Akshay Kumar Eye Clinic', 'medical', ['Глазная клиника доктора Акшая Кумара', 'Vedanta Medical']),
  poi('Shox International Hospital', 'medical', ['Shox Hospital', 'Международная больница Шоx']),
]);

export const TASHKENT_LEGACY_LANDMARKS = Object.freeze([
  poi('TSUM', 'legacy', ['ЦУМ']),
  poi('Main Post Office', 'legacy', ['Главпочтамт']),
  poi('GUM', 'legacy', ['ГУМ']),
]);

export const TASHKENT_POI_GROUPS = Object.freeze({
  parks: TASHKENT_PARKS,
  squares: TASHKENT_SQUARES,
  markets: TASHKENT_MARKETS,
  malls: TASHKENT_MALLS,
  attractions: TASHKENT_ATTRACTIONS,
  culture: TASHKENT_CULTURAL_POIS,
  schools: TASHKENT_SCHOOLS,
  transport: TASHKENT_TRANSPORT_POIS,
  universities: TASHKENT_UNIVERSITIES,
  medical: TASHKENT_MEDICAL_POIS,
  legacy: TASHKENT_LEGACY_LANDMARKS,
});

const seen = new Set();
export const TASHKENT_LANDMARKS = Object.freeze(Object.values(TASHKENT_POI_GROUPS).flat().filter((entry) => {
  const key = entry.name;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}));

function hasRequiredContext(entry, text, start, end) {
  if (!entry.contextRequired) return true;
  const around = text.slice(Math.max(0, start - 48), Math.min(text.length, end + 48));
  return entry.contextRe?.test(around) ?? false;
}

export function matchTashkentPoi(value, category = null) {
  const text = String(value ?? '');
  if (!text) return null;
  const catalog = category ? (TASHKENT_POI_GROUPS[category] || []) : TASHKENT_LANDMARKS;
  const matches = [];
  for (const entry of catalog) {
    const match = text.match(entry.re);
    if (!match) continue;
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (!hasRequiredContext(entry, text, start, end)) continue;
    matches.push({ entry, start, length: match[0].trim().length });
  }
  matches.sort((a, b) => b.length - a.length || a.start - b.start);
  return matches[0]?.entry ?? null;
}