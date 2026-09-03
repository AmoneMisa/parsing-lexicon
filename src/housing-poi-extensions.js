import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

// Source feeds contain misspellings, inflected forms and colloquial spellings that
// are useful for parsing but should not become a second canonical POI catalog.
// Every extension below resolves to an existing generic semantic or to a named
// place observed in housing listings.
export const HOUSING_LANDMARK_EXTENSIONS = Object.freeze([
  group('Supermarket', {
    ru: ['супермаркеты', 'супермаркетов', 'супермаркета', 'пермаркет', 'пермаркеты'],
    en: ['supermarkets'],
    uzLatn: ['supermarketlar'],
    uzCyrl: ['супермаркетлар'],
  }, { category: 'supermarket' }),
  group('School', {
    ru: ['частная школа', 'государственная школа', 'частные школы', 'государственные школы'],
    en: ['private school', 'public school', 'state school', 'schools'],
    uzLatn: ['xususiy maktab', 'davlat maktabi', 'maktablar'],
    uzCyrl: ['хусусий мактаб', 'давлат мактаби', 'мактаблар'],
  }, { category: 'school' }),
  group('Kindergarten', {
    ru: ['детские сады', 'детские садики', 'детский садик', 'детский садики'],
    en: ['kindergartens', 'nurseries'],
    uzLatn: ["bog'chalar", 'bog‘chalar', 'bogʻchalar'],
    uzCyrl: ['боғчалар', 'богча', 'богчалар'],
  }, { category: 'kindergarten' }),
  group('Bus stop', {
    ru: ['автобусной остановке', 'автобусная остановка рядом', 'остановка рядом'],
    en: ['near bus stop'],
    uzLatn: ['avtobus bekatiga yaqin'],
    uzCyrl: ['автобус бекатига яқин'],
  }, { category: 'transport' }),
  group('Public transport', {
    ru: ['транспорт рядом', 'рядом транспорт'],
    en: ['transport nearby'],
    uzLatn: ['aftobuslar qatnovchi', 'avtobuslar qatnovchi'],
    uzCyrl: ['автобуслар қатновчи'],
  }, { category: 'transport' }),
  group('Market', {
    ru: ['рынки', 'базары'],
    en: ['markets', 'bazaars'],
    uzLatn: ['bozorlar'],
    uzCyrl: ['бозорлар'],
  }, { category: 'market' }),
  group('Cafe', {
    ru: ['кафе и рестораны'],
    en: ['cafes', 'cafes and restaurants'],
    uzLatn: ['kafelar'],
    uzCyrl: ['кафелар'],
  }, { category: 'cafe' }),
  group('Restaurant', {
    ru: ['ресторан', 'рестораны', 'кафе и рестораны'],
    en: ['restaurant', 'restaurants', 'cafes and restaurants'],
    uzLatn: ['restoran', 'restoranlar'],
    uzCyrl: ['ресторан', 'ресторанлар'],
  }, { category: 'restaurant' }),
  group('Park', {
    ru: ['парк', 'парка', 'парку', 'парком', 'парке', 'парки', 'парков', 'рядом парки', 'рядом с парком'],
    en: ['park', 'parks'],
    uzLatn: ["bog'", 'bog‘', 'bogʻ', "bog'i", 'bog‘i', 'bogʻi', "bog'lar", 'bog‘lar', 'bogʻlar'],
    uzCyrl: ['боғ', 'боғи', 'боғлар', 'сайлгоҳлар', 'сайлгох', 'сайлгохлар'],
  }, { category: 'park', display: { ru: 'Парк', en: 'Park' } }),
  group('Playground', {
    ru: ['детская площадка', 'детские площадки'],
    en: ['playground', 'playgrounds', 'children playground'],
    uzLatn: ["bolalar maydonchasi", "bolalar o'yin maydonchasi"],
    uzCyrl: ['болалар майдончаси'],
  }, { category: 'playground' }),
  group('Hospital', {
    ru: ['больницы'],
    en: ['hospitals'],
    uzLatn: ['shifoxonalar'],
    uzCyrl: ['шифохоналар'],
  }, { category: 'hospital' }),
]);

export const HOUSING_POI_EXTENSIONS = Object.freeze([
  group('Vosiq School', {
    ru: ['частная школа Vosiq', 'школа Vosiq', 'школа Vosik'],
    en: ['Vosiq School', 'Vosik School'],
    uzLatn: ['Vosiq School', 'Vosiq maktabi'],
  }, { category: 'school', display: { ru: 'Частная школа Vosiq', en: 'Vosiq School' } }),
  group('Alo Korakamish Restaurant', {
    ru: ['ресторан Ало Коракамиш', 'Ало Коракамиш'],
    en: ['Alo Korakamish Restaurant', 'Alo Korakamish'],
    uzLatn: ['Alo Qoraqamish restorani', 'Alo Qoraqamish'],
  }, { category: 'restaurant', display: { ru: 'Ресторан «Ало Коракамиш»', en: 'Alo Korakamish Restaurant' } }),
  group('Aviasozlar Bazaar', {
    ru: ['рынок Авиасозлар', 'базар Авиасозлар'],
    en: ['Aviasozlar Bazaar', 'Aviasozlar Market'],
    uzLatn: ['aviasozlar bozor', 'aviasozlar bozori', 'aviasozlar bozoriga'],
    uzCyrl: ['авиасозлар бозори', 'авиасозлар бозорига'],
  }, { category: 'market', display: { ru: 'Рынок Авиасозлар', en: 'Aviasozlar Bazaar' } }),
  group('Alfraganus University', {
    ru: ['университет Альфраганус', 'Альфраганус'],
    en: ['Alfraganus University'],
    uzLatn: ['alfraganus universiteti', 'alfraganus arxitektura', 'alfraganus architektura'],
  }, { category: 'university', display: { ru: 'Университет Альфраганус', en: 'Alfraganus University' } }),
  group('NRG Roxat', {
    ru: ['NRG Roxat', 'НРГ Рохат'],
    en: ['NRG Roxat', 'NRG Rohat'],
    uzLatn: ['NRG Roxat', 'NRG Rohat'],
  }, { category: 'residential_complex', display: { ru: 'NRG Roxat', en: 'NRG Roxat' } }),
  group('Assalom Jomiy', {
    ru: ['Ассалом Жомий', 'ЖК Ассалом Жомий', 'жилой комплекс Ассалом Жомий'],
    en: ['Assalom Jomiy', 'Assalom Jomiy residential complex'],
    uzLatn: ['Assalom Jomiy', 'Assalom Jomiy turar joy majmuasi'],
    uzCyrl: ['Ассалом Жомий'],
  }, { category: 'residential_complex', display: { ru: 'ЖК «Ассалом Жомий»', en: 'Assalom Jomiy' } }),
  group('Assalom Sohil', {
    ru: ['Ассалом Сохил', 'ЖК Ассалом Сохил', 'жилой комплекс Ассалом Сохил'],
    en: ['Assalom Sohil', 'Assalom Sohil residential complex'],
    uzLatn: ['Assalom Sohil', 'Assalom Sohil turar joy majmuasi'],
    uzCyrl: ['Ассалом Сохил'],
  }, { category: 'residential_complex', display: { ru: 'ЖК «Ассалом Сохил»', en: 'Assalom Sohil' } }),
  group('Jomiy Roundabout', {
    ru: ['круг Жомий', 'круг жомий', 'кольцо Жомий'],
    en: ['Jomiy Roundabout', 'Jomiy circle'],
    uzLatn: ['Jomiy aylanmasi', 'Jomiy krug'],
  }, { category: 'landmark', display: { ru: 'Круг Жомий', en: 'Jomiy Roundabout' } }),
  group('Yunusabad-19', {
    ru: ['Юнусабад-19', 'Юнусабад -19', 'Юнусабад 19'],
    en: ['Yunusabad-19', 'Yunusabad 19'],
    uzLatn: ['Yunusobod-19', 'Yunusobod 19'],
    uzCyrl: ['Юнусобод-19', 'Юнусобод 19'],
  }, { category: 'microdistrict', display: { ru: 'Юнусабад-19', en: 'Yunusabad-19' } }),
  group('Moviy Gumbaz', {
    ru: ['Мовий Гумбаз', 'Голубые купола'],
    en: ['Moviy Gumbaz', 'Blue Domes'],
    uzLatn: ['moviy gumbaz'],
  }, { category: 'landmark', display: { ru: 'Мовий Гумбаз', en: 'Moviy Gumbaz' } }),
  group('Kitoblar Dunyosi Park', {
    ru: ['парк Kitoblar Dunyosi'],
    en: ['Kitoblar Dunyosi Park'],
    uzLatn: ["kitoblar dunyosi bog'i", 'kitoblar dunyosi bog‘i', 'kitoblar dunyosi bogʻi'],
  }, { category: 'park', display: { ru: 'Парк Kitoblar Dunyosi', en: 'Kitoblar Dunyosi Park' } }),
  group('Interpol', { ru: ['Интерпол'], en: ['Interpol'], uzLatn: ['Interpol'] }, { category: 'landmark', display: { ru: 'Интерпол', en: 'Interpol' } }),
  group('Jemchug', { ru: ['Жемчуг'], en: ['Jemchug'], uzLatn: ['jemchug'] }, { category: 'landmark', display: { ru: 'Жемчуг', en: 'Jemchug' } }),
  group('Sumy Railway Station', {
    uk: ['Суми (станція)', 'залізничний вокзал Суми', 'вокзал станції Суми'],
    en: ['Sumy railway station'],
  }, { category: 'transport', country: 'UA', city: 'Sumy', display: { uk: 'Залізничний вокзал Суми', en: 'Sumy Railway Station' } }),
]);
