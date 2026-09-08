import { UA_CITIES } from './geography.js';
import { findCanonical } from './normalization.js';
import { UA_SECONDARY_CITY_NAMES } from './ua-secondary-cities.js';

const HISTORICAL_CITY_ALIASES = Object.freeze({
  Dnipro: ['Днепропетровск', 'Дніпропетровськ', 'Dnipropetrovsk'],
  Kropyvnytskyi: ['Кировоград', 'Кіровоград', 'Kirovograd', 'Kirovohrad', 'Єлисаветград', 'Елисаветград', 'Yelisavetgrad'],
  Rivne: ['Ровно', 'Rovno', 'Rowne'],
  'Ivano-Frankivsk': ['Ивано-Франковск', 'Ivano-Frankovsk', 'Станіслав', 'Станислав', 'Stanislav', 'Stanisławów'],
  Khmelnytskyi: ['Хмельницкий', 'Проскурів', 'Проскуров', 'Proskuriv'],
  Chernihiv: ['Чернигов', 'Chernigov'],
  Mykolaiv: ['Николаев', 'Nikolaev', 'Nikolayev'],
  Odesa: ['Одесса', 'Odessa'],
  Kharkiv: ['Харьков', 'Kharkov'],
  Kyiv: ['Киев', 'Kiev'],
  Lviv: ['Львов', 'Lvov', 'Lwów', 'Lemberg'],
  Zaporizhzhia: ['Запорожье', 'Zaporozhye', 'Zaporozhie'],
  'Kryvyi Rih': ['Кривой Рог', 'Krivoy Rog', 'Krivyi Rig', 'KryvyiRih'],
  Chernivtsi: ['Черновцы', 'Chernovtsy', 'Czernowitz', 'Cernăuți'],
  Uzhhorod: ['Uzhgorod', 'Ungvar', 'Ungvár'],
  Ternopil: ['Тернополь', 'Tarnopol', 'Tarnopil'],
  Lutsk: ['Луцк', 'Luck'],
  Kremenchuk: ['Кременчуг', 'Kremenchug'],
  'Bila Tserkva': ['Белая Церковь', 'Belaya Tserkov', 'Bila Cerkva'],
  Vinnytsia: ['Винница', 'Vinnitsa', 'Vinnytsya', 'Vinica'],
});

function flattenAliases(entry) {
  return Object.values(entry.aliases || {}).flat().filter(Boolean);
}

function cityEntry(canonical, aliases) {
  return Object.freeze({ canonical, aliases: Object.freeze({ all: Object.freeze([...new Set([canonical, ...aliases])]) }), country: 'UA' });
}

// Secondary-city identity has one source of truth in ua-secondary-cities.js.
// Keep this export for compatibility with consumers that imported the old name.
export const UA_ADDITIONAL_CITIES = Object.freeze(
  UA_SECONDARY_CITY_NAMES.map(([canonical, ...aliases]) => cityEntry(canonical, aliases)),
);

// UA_CITIES already includes the secondary catalog. Rebuild only to append
// historical aliases without duplicating secondary city entities.
export const UA_CITY_CATALOG = Object.freeze(
  UA_CITIES.map((item) => cityEntry(item.canonical, [
    ...flattenAliases(item),
    ...(HISTORICAL_CITY_ALIASES[item.canonical] || []),
  ])),
);

export const UA_CITY_HISTORICAL_ALIASES = HISTORICAL_CITY_ALIASES;

export function canonicalUkraineCity(value) {
  return findCanonical(value, UA_CITY_CATALOG)?.canonical || null;
}

export const UA_LOCATION_TERMS = Object.freeze({
  locality: Object.freeze(['г.', 'г', 'город', 'місто', 'м.', 'city']),
  district: Object.freeze(['район', 'р-н', 'рн', 'р.', 'р-н города', 'район міста', 'district']),
  microdistrict: Object.freeze(['микрорайон', 'мкр', 'мкр.', 'мкр-н', 'мкрн', 'микро-р', 'мікрорайон', 'мікр.', 'neighborhood', 'neighbourhood']),
  massif: Object.freeze(['жилмассив', 'жил. массив', 'ж/м', 'жм', 'житловий масив', 'житломасив']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'ж.к.', 'жилой комплекс', 'житловий комплекс', 'residential complex', 'residence', 'residences']),
  park: Object.freeze(['парк', 'park', 'сквер', 'сад', 'гай', 'роща']),
  mall: Object.freeze(['ТРЦ', 'ТЦ', 'торговый центр', 'торговельний центр', 'торгово-розважальний центр', 'mall', 'shopping mall']),
  metro: Object.freeze(['метро', 'ст. м.', 'ст.м.', 'станция метро', 'станція метро', 'subway', 'metro']),
});
