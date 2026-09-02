import { COUNTRIES, canonicalCountryCode, countryByCode } from './countries.js';
import { CITIES, REGIONS } from './geography.js';
import { dictionaryFor } from './locations-runtime.js';
import { aliasesOf } from './normalization.js';

// Centralized presentation names for canonical geography values.
// Consumers must not maintain their own country/city/district/metro display dictionaries.

const EMPTY_DISPLAY_NAMES = Object.freeze({});

const LOCATION_KIND_KEYS = Object.freeze({
  district: Object.freeze(['districts']),
  microdistrict: Object.freeze(['microdistricts']),
  mahalla: Object.freeze(['mahallas']),
  local_area: Object.freeze(['localAreas']),
  suburb: Object.freeze(['suburbs']),
  settlement: Object.freeze(['settlements']),
  development_area: Object.freeze(['developmentAreas']),
  residential_complex: Object.freeze(['residentialComplexes']),
  metro: Object.freeze(['metro']),
  street: Object.freeze(['streets']),
  poi: Object.freeze(['landmarks', 'pois']),
});

const CYRILLIC_RE = /[А-ЯЁ]/iu;
const UZBEK_CYRILLIC_RE = /[ЎҚҒҲўқғҳ]/u;
const LATIN_RE = /[A-Z]/iu;
const UZBEK_LATIN_MARKER_RE = /(?:[ʻ‘’ʼ']|\b(?:ko[ʻ‘’ʼ']?chasi|shoh\s+ko[ʻ‘’ʼ']?chasi|bozori|bog[ʻ‘’ʼ']?i|maydoni|masjidi|vokzali|mahallasi|mavzesi|dahasi|massivi|savdo\s+markazi|toshkent|yunusobod|chilonzor|olmazor|o[ʻ‘’ʼ']?zbekiston)\b)/iu;
const ENGLISH_GENERIC_RE = /\b(?:street|avenue|square|park|bazaar|market|mall|mosque|railway|station|residence|city|garden|museum|theatre|theater|airport|university|hospital|school|district|microdistrict)\b/iu;
const RUSSIAN_GENERIC_RE = /\b(?:улица|проспект|площадь|сквер|рынок|базар|парк|мечеть|вокзал|аэропорт|университет|больница|школа|район|массив|махалл|жилой|жк|центр)\b/iu;

function countryDisplayNames(locale) {
  return Object.freeze(Object.fromEntries(COUNTRIES.map((item) => [
    item.code,
    item.aliases?.[locale]?.[0] || item.aliases?.en?.[0] || item.canonical,
  ])));
}

export const GEOGRAPHY_DISPLAY_NAMES = Object.freeze({
  en: Object.freeze({
    country: countryDisplayNames('en'),
    city: EMPTY_DISPLAY_NAMES,
    district: EMPTY_DISPLAY_NAMES,
    microdistrict: EMPTY_DISPLAY_NAMES,
    metro: EMPTY_DISPLAY_NAMES,
    metroAlias: EMPTY_DISPLAY_NAMES,
  }),
  uz: Object.freeze({
    country: countryDisplayNames('uz'),
    city: Object.freeze({
      Tashkent: 'Toshkent',
    }),
    district: Object.freeze({
      Chilanzar: 'Chilonzor', Yunusabad: 'Yunusobod', 'Mirzo Ulugbek': 'Mirzo Ulug‘bek',
      Yakkasaray: 'Yakkasaroy', Shaykhantahur: 'Shayxontohur', Yashnobod: 'Yashnobod', Sergeli: 'Sergeli',
      Uchtepa: 'Uchtepa', Mirobod: 'Mirobod', Bektemir: 'Bektemir', Almazar: 'Olmazor', Yangihayot: 'Yangihayot',
    }),
    microdistrict: EMPTY_DISPLAY_NAMES,
    metro: EMPTY_DISPLAY_NAMES,
    metroAlias: EMPTY_DISPLAY_NAMES,
  }),
  ru: Object.freeze({
    country: countryDisplayNames('ru'),
    city: Object.freeze({
      Tashkent: 'Ташкент', Samarkand: 'Самарканд', Bukhara: 'Бухара', Namangan: 'Наманган',
      Andijan: 'Андижан', Fergana: 'Фергана', Nukus: 'Нукус', Navoi: 'Навои', Navoiy: 'Навои', Jizzakh: 'Джизак',
      Termez: 'Термез', Qarshi: 'Карши', Urgench: 'Ургенч', Gulistan: 'Гулистан', Chirchiq: 'Чирчик',
      'Tashkent Region': 'Ташкентская область', Karakalpakstan: 'Каракалпакстан', Kashkadarya: 'Кашкадарья',
      Surkhandarya: 'Сурхандарья', Syrdarya: 'Сырдарья', Khorezm: 'Хорезм',
      Almaty: 'Алматы', Astana: 'Астана', Shymkent: 'Шымкент', Karaganda: 'Караганда',
      Aktobe: 'Актобе', Atyrau: 'Атырау', Oral: 'Уральск', Taraz: 'Тараз', Pavlodar: 'Павлодар',
      Semey: 'Семей', Kostanay: 'Костанай', Kyzylorda: 'Кызылорда', Aktau: 'Актау', Oskemen: 'Усть-Каменогорск',
      Kyiv: 'Киев', Lviv: 'Львов', Odesa: 'Одесса', Kharkiv: 'Харьков', Dnipro: 'Днепр',
      Vinnytsia: 'Винница', 'Ivano-Frankivsk': 'Ивано-Франковск', Lutsk: 'Луцк', Chernivtsi: 'Черновцы',
      Zaporizhzhia: 'Запорожье', Poltava: 'Полтава', Rivne: 'Ровно', Ternopil: 'Тернополь',
      Uzhhorod: 'Ужгород', Khmelnytskyi: 'Хмельницкий', Zhytomyr: 'Житомир', Cherkasy: 'Черкассы',
      Chernihiv: 'Чернигов', Sumy: 'Сумы', Mykolaiv: 'Николаев', Kropyvnytskyi: 'Кропивницкий',
      Kherson: 'Херсон', 'Kryvyi Rih': 'Кривой Рог', Kremenchuk: 'Кременчуг', 'Bila Tserkva': 'Белая Церковь',
      Kamianske: 'Каменское', Vyshneve: 'Вишневое', Boryspil: 'Борисполь', Vyshhorod: 'Вышгород',
      Oleksandriia: 'Александрия', Pavlohrad: 'Павлоград', Nikopol: 'Никополь', Drohobych: 'Дрогобыч',
      Stryi: 'Стрый', Kolomyia: 'Коломыя', Kalush: 'Калуш', 'Kamianets-Podilskyi': 'Каменец-Подольский',
      Izmail: 'Измаил', Dubno: 'Дубно',
      Bucharest: 'Бухарест', 'Cluj-Napoca': 'Клуж-Напока', Timisoara: 'Тимишоара', Iasi: 'Яссы',
      Brasov: 'Брашов', Constanta: 'Констанца', Oradea: 'Орадя', Sibiu: 'Сибиу',
    }),
    district: Object.freeze({
      Chilanzar: 'Чиланзар', Yunusabad: 'Юнусабад', 'Mirzo Ulugbek': 'Мирзо-Улугбек',
      Yakkasaray: 'Яккасарай', Shaykhantahur: 'Шайхантахур', Yashnobod: 'Яшнабад', Sergeli: 'Сергели',
      Uchtepa: 'Учтепа', Mirobod: 'Мирабад', Bektemir: 'Бектемир', Almazar: 'Алмазар', Yangihayot: 'Янгихаёт',
      Almaly: 'Алмалинский', Bostandyk: 'Бостандыкский', Medeu: 'Медеуский', Auezov: 'Ауэзовский',
      Turksib: 'Турксибский', Nauryzbay: 'Наурызбайский', Alatau: 'Алатауский', Zhetysu: 'Жетысуский',
      Podil: 'Подол', Pechersk: 'Печерск', Pecherskyi: 'Печерский', Obolon: 'Оболонь',
      Shevchenkivskyi: 'Шевченковский', Solomianskyi: 'Соломенский', Darnytskyi: 'Дарницкий',
      Holosiivskyi: 'Голосеевский', Dniprovskyi: 'Днепровский', Sviatoshynskyi: 'Святошинский',
      Desnianskyi: 'Деснянский', Prymorskyi: 'Приморский', Frankivskyi: 'Франковский',
      Kyivskyi: 'Киевский', Saltivskyi: 'Салтовский', Nemyshlianskyi: 'Немышлянский',
      Industrialnyi: 'Индустриальный', Slobidskyi: 'Слободской', Osnovianskyi: 'Основянский',
      Novobavarskyi: 'Новобаварский', Kholodnohirskyi: 'Холодногорский',
      Tsentralnyi: 'Центральный', 'Tsentralno-Miskyi': 'Центрально-Городской', Tsentr: 'Центр',
      Prospekt: 'Проспект', Ruska: 'Русская', Hraviton: 'Гравитон', Komarova: 'Комарова', Roscha: 'Роща',
      Sadgora: 'Садгора', Avtovokzal: 'Автовокзал', Pipera: 'Пипера', Militari: 'Милитари',
      'Drumul Taberei': 'Друмул Таберей', Titan: 'Титан', Berceni: 'Берчень', Floreasca: 'Флоряска',
      Dorobanti: 'Доробанць', Cotroceni: 'Котрочень',
    }),
    microdistrict: Object.freeze({
      Tsukrovyi: 'Сахарный',
      Karakamysh: 'Каракамыш', Sebzar: 'Себзар', Tashselmash: 'Ташсельмаш', Aviasozlar: 'Авиасозлар',
      Kuylyuk: 'Куйлюк', Sergeli: 'Сергели массив', Sputnik: 'Спутник', 'Yangi Choshtepa': 'Янги Чоштепа',
      Olympia: 'Олимпия', Olimpiya: 'Олимпия', Dustlik: 'Дустлик', Karasu: 'Карасу',
      Traktorsozlar: 'Тракторсозлар', TTZ: 'ТТЗ', Qiyot: 'Кият',
      // Same places as Choshtepa/Takhtapul above, but under the spelling the
      // mahalla registry (uz-location-extensions.js) actually uses as its
      // canonical name -- exact-key lookup means both spellings must be here.
      Chashtepa: 'Чаштепа', Taxtapul: 'Тахтапул',
    }),
    metro: Object.freeze({
      'Buyuk Ipak Yoli': 'Буюк Ипак Йули', Pushkin: 'Пушкин', 'Hamid Olimjon': 'Хамид Алимджан',
      'Amir Temur Xiyoboni': 'Амир Темур Хиёбони', 'Mustaqillik Maydoni': 'Мустакиллик майдони',
      Paxtakor: 'Пахтакор', 'Xalqlar Dostligi': 'Халклар Дустлиги', 'Milliy Bog': 'Миллий Бог', Novza: 'Новза',
      'Mirzo Ulugbek': 'Мирзо Улугбек', Chilonzor: 'Чиланзар', Olmazor: 'Алмазар', Choshtepa: 'Чаштепа',
      Ozgarish: 'Узгариш', Sergeli: 'Сергели', Yangihayot: 'Янгихаёт', Chinor: 'Чинар', Beruniy: 'Беруни',
      Tinchlik: 'Тинчлик', Chorsu: 'Чорсу', 'Gafur Gulom': 'Гафур Гулям', 'Alisher Navoi': 'Алишер Навои',
      Ozbekiston: 'Узбекистан', Kosmonavtlar: 'Космонавтлар', Oybek: 'Ойбек', Toshkent: 'Ташкент',
      Mashinasozlar: 'Машинасозлар', Dostlik: 'Дустлик', Turkiston: 'Туркистон', Yunusobod: 'Юнусабад',
      Shahriston: 'Шахристан', Bodomzor: 'Бадамзар', Minor: 'Минор', 'Abdulla Qodiriy': 'Абдулла Кадыри',
      'Yunus Rajabiy': 'Юнус Раджаби', 'Ming Orik': 'Мингурик', Texnopark: 'Технопарк', Yashnobod: 'Яшнабад',
      Tuzel: 'Тузель', Olmos: 'Алмас', Rohat: 'Рохат', Yangiobod: 'Янгиабад', Qoyliq: 'Куйлюк', Matonat: 'Матонат',
      Qiyot: 'Кият', Tolariq: 'Толарык', Xonobod: 'Хонабад', Quruvchilar: 'Курувчилар', Turon: 'Туран', Qipchoq: 'Кипчак',
    }),
    metroAlias: Object.freeze({
      'Buyuk Ipak Yoli': 'Максим Горький', Novza: 'Хамза',
      'Amir Temur Xiyoboni': 'Сквер Октябрьской Революции', 'Mustaqillik Maydoni': 'Площадь Ленина',
      'Milliy Bog': 'Национальный парк', Yunusobod: 'Фахрийлар чойхонаси',
      'Xalqlar Dostligi': 'Дружба народов', Ozbekiston: 'Узбекистан', Mashinasozlar: 'Машиностроителей',
      Dostlik: 'Дружба', Tinchlik: 'Мир',
    }),
  }),
});

function languageKey(locale) {
  return String(locale || 'en').toLowerCase().split(/[-_]/)[0];
}

function numberedMicrodistrictDisplayName(value, locale) {
  if (languageKey(locale) !== 'ru') return null;
  const text = String(value || '').trim();
  const match = text.match(/^(.+?)[\s-]+(\d{1,2}[A-Za-zА-Яа-я]?)$/u);
  if (!match) return null;
  const base = GEOGRAPHY_DISPLAY_NAMES.ru.microdistrict?.[match[1]]
    || GEOGRAPHY_DISPLAY_NAMES.ru.district?.[match[1]];
  return base ? `${base}-${match[2]}` : null;
}

function preferredEntityLabel(entry, locale) {
  if (!entry) return null;
  const key = languageKey(locale);
  const aliases = entry.aliases?.[key] || entry.aliases?.all || entry.aliases?.en || [];
  return aliases[0] || entry.canonical || null;
}

function canonicalEntityLabel(catalog, value, locale) {
  const entry = catalog.find((item) => item.canonical === value);
  return preferredEntityLabel(entry, locale);
}

function countryEntity(value) {
  const code = canonicalCountryCode(value);
  return code ? countryByCode(code) : null;
}

function locationEntryFor(value, kind, context) {
  const keys = LOCATION_KIND_KEYS[kind];
  const country = canonicalCountryCode(context?.country);
  const city = String(context?.city || '').trim();
  if (!keys || !country || !city) return null;
  const dictionary = dictionaryFor(country, city);
  if (!dictionary) return null;
  for (const key of keys) {
    const entry = (dictionary[key] || []).find((item) => (item.canonical || item.name) === value);
    if (entry) return entry;
  }
  return null;
}

function bestAlias(aliases, score) {
  let best = null;
  let bestScore = -Infinity;
  for (const alias of aliases) {
    const value = String(alias || '').trim();
    if (!value) continue;
    const valueScore = score(value);
    if (valueScore > bestScore || (valueScore === bestScore && best && value.length < best.length)) {
      best = value;
      bestScore = valueScore;
    }
  }
  return bestScore > 0 ? best : null;
}

function locationAliasLabel(entry, locale) {
  if (!entry) return null;
  const language = languageKey(locale);
  const explicit = entry.labels?.[language];
  if (explicit) return explicit;
  const canonical = entry.canonical || entry.name || null;
  if (language === 'en') return entry.labels?.en || canonical;

  const aliases = aliasesOf(entry);
  if (language === 'ru') {
    return bestAlias(aliases, (alias) => {
      if (!CYRILLIC_RE.test(alias)) return -10;
      let score = 5;
      if (RUSSIAN_GENERIC_RE.test(alias)) score += 8;
      if (UZBEK_CYRILLIC_RE.test(alias)) score -= 4;
      return score;
    }) || canonical;
  }

  if (language === 'uz') {
    return bestAlias(aliases, (alias) => {
      let score = 0;
      if (LATIN_RE.test(alias)) score += 3;
      if (UZBEK_LATIN_MARKER_RE.test(alias)) score += 10;
      if (UZBEK_CYRILLIC_RE.test(alias)) score += 6;
      if (CYRILLIC_RE.test(alias) && !UZBEK_CYRILLIC_RE.test(alias)) score -= 3;
      if (ENGLISH_GENERIC_RE.test(alias)) score -= 8;
      return score;
    }) || canonical;
  }

  return canonical;
}

export function geographyDisplayName(value, locale = 'en', kind = 'any', context = null) {
  const text = String(value || '').trim();
  if (!text) return '';
  const language = languageKey(locale);
  const tables = GEOGRAPHY_DISPLAY_NAMES[language];
  if (kind === 'country') {
    const entry = countryEntity(text);
    if (!entry) return text;
    return tables?.country?.[entry.code] || preferredEntityLabel(entry, locale) || text;
  }
  if (kind === 'city') return tables?.city?.[text] || canonicalEntityLabel(CITIES, text, locale) || text;
  if (kind === 'region') return tables?.region?.[text] || canonicalEntityLabel(REGIONS, text, locale) || text;

  const localEntry = locationEntryFor(text, kind, context);
  if (localEntry) {
    const localized = locationAliasLabel(localEntry, locale);
    if (localized) return localized;
  }

  if (kind === 'district') return tables?.district?.[text] || text;
  if (kind === 'microdistrict') return tables?.microdistrict?.[text] || numberedMicrodistrictDisplayName(text, locale) || text;
  if (kind === 'metro') return tables?.metro?.[text] || text;
  if (LOCATION_KIND_KEYS[kind]) return text;
  return tables?.country?.[canonicalCountryCode(text)] || tables?.city?.[text] || tables?.region?.[text] || tables?.district?.[text] || tables?.microdistrict?.[text] || tables?.metro?.[text] || canonicalEntityLabel(CITIES, text, locale) || canonicalEntityLabel(REGIONS, text, locale) || preferredEntityLabel(countryEntity(text), locale) || text;
}

export function geographyMetroLabelWithAlias(value, locale = 'en') {
  const text = String(value || '').trim();
  if (!text) return '';
  const label = geographyDisplayName(text, locale, 'metro');
  const tables = GEOGRAPHY_DISPLAY_NAMES[languageKey(locale)];
  const alias = tables?.metroAlias?.[text];
  return alias && alias !== label ? `${label} (${alias})` : label;
}
