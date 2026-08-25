import { CITIES as CENTRAL_ASIA_CITIES } from './geo.js';
import { findCanonical } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';

const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const UA_CITIES = Object.freeze([
  entity('Kyiv', { uk: ['Київ'], ru: ['Киев'], en: ['Kyiv', 'Kiev'], ro: ['Kiev'] }, { country: 'UA', type: 'city' }),
  entity('Kharkiv', { uk: ['Харків'], ru: ['Харьков'], en: ['Kharkiv', 'Kharkov'], ro: ['Harkiv'] }, { country: 'UA', type: 'city' }),
  entity('Odesa', { uk: ['Одеса'], ru: ['Одесса'], en: ['Odesa', 'Odessa'], ro: ['Odesa'] }, { country: 'UA', type: 'city' }),
  entity('Dnipro', { uk: ['Дніпро'], ru: ['Днепр'], en: ['Dnipro', 'Dnepr'], ro: ['Dnipro'] }, { country: 'UA', type: 'city' }),
  entity('Lviv', { uk: ['Львів'], ru: ['Львов'], en: ['Lviv', 'Lvov'], ro: ['Liov', 'Lviv'] }, { country: 'UA', type: 'city' }),
  entity('Zaporizhzhia', { uk: ['Запоріжжя'], ru: ['Запорожье'], en: ['Zaporizhzhia', 'Zaporozhye'], ro: ['Zaporijjea'] }, { country: 'UA', type: 'city' }),
  entity('Vinnytsia', { uk: ['Вінниця'], ru: ['Винница'], en: ['Vinnytsia', 'Vinnitsa'], ro: ['Vinița', 'Vinnytsia'] }, { country: 'UA', type: 'city' }),
  entity('Ivano-Frankivsk', { uk: ['Івано-Франківськ', 'Франківськ'], ru: ['Ивано-Франковск'], en: ['Ivano-Frankivsk', 'Frankivsk'], ro: ['Ivano-Frankivsk'] }, { country: 'UA', type: 'city' }),
  entity('Chernivtsi', { uk: ['Чернівці'], ru: ['Черновцы'], en: ['Chernivtsi', 'Chernovtsy'], ro: ['Cernăuți', 'Cernivți'] }, { country: 'UA', type: 'city' }),
  entity('Uzhhorod', { uk: ['Ужгород'], ru: ['Ужгород'], en: ['Uzhhorod', 'Uzhgorod'], ro: ['Ujhorod'] }, { country: 'UA', type: 'city' }),
  entity('Mukachevo', { uk: ['Мукачево', 'Мукачеве'], ru: ['Мукачево'], en: ['Mukachevo', 'Mukacheve'], ro: ['Muncaci', 'Mukachevo'] }, { country: 'UA', type: 'city' }),
  entity('Lutsk', { uk: ['Луцьк'], ru: ['Луцк'], en: ['Lutsk'], ro: ['Luțk'] }, { country: 'UA', type: 'city' }),
  entity('Rivne', { uk: ['Рівне'], ru: ['Ровно'], en: ['Rivne', 'Rovno'], ro: ['Rivne'] }, { country: 'UA', type: 'city' }),
  entity('Ternopil', { uk: ['Тернопіль'], ru: ['Тернополь'], en: ['Ternopil', 'Ternopol'], ro: ['Ternopil'] }, { country: 'UA', type: 'city' }),
  entity('Khmelnytskyi', { uk: ['Хмельницький'], ru: ['Хмельницкий'], en: ['Khmelnytskyi', 'Khmelnitsky'], ro: ['Hmelnițki'] }, { country: 'UA', type: 'city' }),
  entity('Zhytomyr', { uk: ['Житомир'], ru: ['Житомир'], en: ['Zhytomyr', 'Zhitomir'], ro: ['Jîtomîr'] }, { country: 'UA', type: 'city' }),
  entity('Cherkasy', { uk: ['Черкаси'], ru: ['Черкассы'], en: ['Cherkasy', 'Cherkassy'], ro: ['Cerkasî'] }, { country: 'UA', type: 'city' }),
  entity('Poltava', { uk: ['Полтава'], ru: ['Полтава'], en: ['Poltava'], ro: ['Poltava'] }, { country: 'UA', type: 'city' }),
  entity('Chernihiv', { uk: ['Чернігів'], ru: ['Чернигов'], en: ['Chernihiv', 'Chernigov'], ro: ['Cernihiv'] }, { country: 'UA', type: 'city' }),
  entity('Sumy', { uk: ['Суми'], ru: ['Сумы'], en: ['Sumy'], ro: ['Sumî'] }, { country: 'UA', type: 'city' }),
  entity('Mykolaiv', { uk: ['Миколаїв'], ru: ['Николаев'], en: ['Mykolaiv', 'Nikolaev'], ro: ['Mîkolaiiv'] }, { country: 'UA', type: 'city' }),
  entity('Kherson', { uk: ['Херсон'], ru: ['Херсон'], en: ['Kherson'], ro: ['Herson'] }, { country: 'UA', type: 'city' }),
  entity('Kropyvnytskyi', { uk: ['Кропивницький'], ru: ['Кропивницкий', 'Кировоград'], en: ['Kropyvnytskyi', 'Kirovohrad'], ro: ['Kropîvnîțkîi'] }, { country: 'UA', type: 'city' }),
  entity('Irpin', { uk: ['Ірпінь'], ru: ['Ирпень'], en: ['Irpin'], ro: ['Irpin'] }, { country: 'UA', type: 'city' }),
  entity('Bucha', { uk: ['Буча'], ru: ['Буча'], en: ['Bucha'], ro: ['Bucea'] }, { country: 'UA', type: 'city' }),
  entity('Brovary', { uk: ['Бровари'], ru: ['Бровары'], en: ['Brovary'], ro: ['Brovary'] }, { country: 'UA', type: 'city' }),
  entity('Bila Tserkva', { uk: ['Біла Церква'], ru: ['Белая Церковь'], en: ['Bila Tserkva'], ro: ['Bila Țerkva'] }, { country: 'UA', type: 'city' }),
  entity('Kryvyi Rih', { uk: ['Кривий Ріг'], ru: ['Кривой Рог'], en: ['Kryvyi Rih', 'Krivoy Rog'], ro: ['Krîvîi Rih'] }, { country: 'UA', type: 'city' }),
  entity('Kremenchuk', { uk: ['Кременчук'], ru: ['Кременчуг'], en: ['Kremenchuk'], ro: ['Kremenciuk'] }, { country: 'UA', type: 'city' }),
  entity('Uman', { uk: ['Умань'], ru: ['Умань'], en: ['Uman'], ro: ['Uman'] }, { country: 'UA', type: 'city' }),
]);

export const RO_CITIES = Object.freeze([
  entity('Bucharest', { ro: ['București', 'Bucuresti'], en: ['Bucharest'], ru: ['Бухарест'], uk: ['Бухарест'] }, { country: 'RO', type: 'city' }),
  entity('Cluj-Napoca', { ro: ['Cluj-Napoca', 'Cluj'], en: ['Cluj-Napoca', 'Cluj'], ru: ['Клуж-Напока', 'Клуж'], uk: ['Клуж-Напока'] }, { country: 'RO', type: 'city' }),
  entity('Timisoara', { ro: ['Timișoara', 'Timisoara'], en: ['Timisoara', 'Timișoara'], ru: ['Тимишоара'], uk: ['Тімішоара'] }, { country: 'RO', type: 'city' }),
  entity('Iasi', { ro: ['Iași', 'Iasi'], en: ['Iasi', 'Iași'], ru: ['Яссы'], uk: ['Ясси'] }, { country: 'RO', type: 'city' }),
  entity('Brasov', { ro: ['Brașov', 'Brasov'], en: ['Brasov', 'Brașov'], ru: ['Брашов'], uk: ['Брашов'] }, { country: 'RO', type: 'city' }),
  entity('Constanta', { ro: ['Constanța', 'Constanta'], en: ['Constanta', 'Constanța'], ru: ['Констанца'], uk: ['Констанца'] }, { country: 'RO', type: 'city' }),
  entity('Oradea', { ro: ['Oradea'], en: ['Oradea'], ru: ['Орадя'], uk: ['Орадя'] }, { country: 'RO', type: 'city' }),
  entity('Sibiu', { ro: ['Sibiu'], en: ['Sibiu'], ru: ['Сибиу'], uk: ['Сібіу'] }, { country: 'RO', type: 'city' }),
  entity('Craiova', { ro: ['Craiova'], en: ['Craiova'], ru: ['Крайова'], uk: ['Крайова'] }, { country: 'RO', type: 'city' }),
  entity('Ploiesti', { ro: ['Ploiești', 'Ploiesti'], en: ['Ploiesti', 'Ploiești'], ru: ['Плоешти'], uk: ['Плоєшті'] }, { country: 'RO', type: 'city' }),
  entity('Galati', { ro: ['Galați', 'Galati'], en: ['Galati', 'Galați'], ru: ['Галац'], uk: ['Галац'] }, { country: 'RO', type: 'city' }),
  entity('Arad', { ro: ['Arad'], en: ['Arad'], ru: ['Арад'], uk: ['Арад'] }, { country: 'RO', type: 'city' }),
]);

export const KG_CITIES = Object.freeze([
  entity('Bishkek', { ru: ['Бишкек'], en: ['Bishkek'], kk: ['Бішкек'], uzLatn: ['Bishkek'] }, { country: 'KG', type: 'city' }),
  entity('Osh', { ru: ['Ош'], en: ['Osh'], kk: ['Ош'], uzLatn: ['Osh'] }, { country: 'KG', type: 'city' }),
  entity('Karakol', { ru: ['Каракол'], en: ['Karakol'], kk: ['Қаракөл'], uzLatn: ['Karakol'] }, { country: 'KG', type: 'city' }),
]);

export const GEOGRAPHY_CITIES = Object.freeze([...CENTRAL_ASIA_CITIES, ...UA_CITIES, ...RO_CITIES, ...KG_CITIES]);
export const GEOGRAPHY_CITIES_BY_COUNTRY = Object.freeze(Object.fromEntries(
  [...new Set(GEOGRAPHY_CITIES.map((item) => item.country).filter(Boolean))].map((code) => [
    code,
    Object.freeze(GEOGRAPHY_CITIES.filter((item) => item.country === code)),
  ]),
));

export function canonicalAnyCity(value, country = null) {
  const catalog = country ? (GEOGRAPHY_CITIES_BY_COUNTRY[country] || []) : GEOGRAPHY_CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}

export const UA_REGIONS = Object.freeze([
  entity('Vinnytsia Oblast', { uk: ['Вінницька область'], ru: ['Винницкая область'], en: ['Vinnytsia Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Volyn Oblast', { uk: ['Волинська область'], ru: ['Волынская область'], en: ['Volyn Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Dnipropetrovsk Oblast', { uk: ['Дніпропетровська область'], ru: ['Днепропетровская область'], en: ['Dnipropetrovsk Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Donetsk Oblast', { uk: ['Донецька область'], ru: ['Донецкая область'], en: ['Donetsk Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Zhytomyr Oblast', { uk: ['Житомирська область'], ru: ['Житомирская область'], en: ['Zhytomyr Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Zakarpattia Oblast', { uk: ['Закарпатська область'], ru: ['Закарпатская область'], en: ['Zakarpattia Oblast', 'Transcarpathia'] }, { country: 'UA', type: 'city' }),
  entity('Zaporizhzhia Oblast', { uk: ['Запорізька область'], ru: ['Запорожская область'], en: ['Zaporizhzhia Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Ivano-Frankivsk Oblast', { uk: ['Івано-Франківська область'], ru: ['Ивано-Франковская область'], en: ['Ivano-Frankivsk Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Kyiv Oblast', { uk: ['Київська область', 'Київщина'], ru: ['Киевская область', 'Киевщина'], en: ['Kyiv Oblast', 'Kyiv Region'] }, { country: 'UA', type: 'city' }),
  entity('Kirovohrad Oblast', { uk: ['Кіровоградська область'], ru: ['Кировоградская область'], en: ['Kirovohrad Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Luhansk Oblast', { uk: ['Луганська область'], ru: ['Луганская область'], en: ['Luhansk Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Lviv Oblast', { uk: ['Львівська область', 'Львівщина'], ru: ['Львовская область'], en: ['Lviv Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Mykolaiv Oblast', { uk: ['Миколаївська область'], ru: ['Николаевская область'], en: ['Mykolaiv Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Odesa Oblast', { uk: ['Одеська область', 'Одещина'], ru: ['Одесская область'], en: ['Odesa Oblast', 'Odessa Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Poltava Oblast', { uk: ['Полтавська область'], ru: ['Полтавская область'], en: ['Poltava Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Rivne Oblast', { uk: ['Рівненська область'], ru: ['Ровенская область'], en: ['Rivne Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Sumy Oblast', { uk: ['Сумська область'], ru: ['Сумская область'], en: ['Sumy Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Ternopil Oblast', { uk: ['Тернопільська область'], ru: ['Тернопольская область'], en: ['Ternopil Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Kharkiv Oblast', { uk: ['Харківська область', 'Харківщина'], ru: ['Харьковская область'], en: ['Kharkiv Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Kherson Oblast', { uk: ['Херсонська область'], ru: ['Херсонская область'], en: ['Kherson Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Khmelnytskyi Oblast', { uk: ['Хмельницька область'], ru: ['Хмельницкая область'], en: ['Khmelnytskyi Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Cherkasy Oblast', { uk: ['Черкаська область'], ru: ['Черкасская область'], en: ['Cherkasy Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Chernivtsi Oblast', { uk: ['Чернівецька область'], ru: ['Черновицкая область'], ro: ['Regiunea Cernăuți'], en: ['Chernivtsi Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Chernihiv Oblast', { uk: ['Чернігівська область'], ru: ['Черниговская область'], en: ['Chernihiv Oblast'] }, { country: 'UA', type: 'city' }),
  entity('Autonomous Republic of Crimea', { uk: ['Автономна Республіка Крим', 'АР Крим'], ru: ['Автономная Республика Крым', 'АР Крым'], en: ['Autonomous Republic of Crimea', 'Crimea'] }, { country: 'UA', type: 'city' }),
  entity('Kyiv City', { uk: ['місто Київ', 'м. Київ'], ru: ['город Киев', 'г. Киев'], en: ['Kyiv City'] }, { country: 'UA', type: 'city' }),
  entity('Sevastopol City', { uk: ['місто Севастополь', 'м. Севастополь'], ru: ['город Севастополь', 'г. Севастополь'], en: ['Sevastopol City'] }, { country: 'UA', type: 'city' }),
]);

const RO_COUNTY_NAMES = [
  ['Alba','Alba'],['Arad','Arad'],['Arges','Argeș'],['Bacau','Bacău'],['Bihor','Bihor'],['Bistrita-Nasaud','Bistrița-Năsăud'],['Botosani','Botoșani'],['Braila','Brăila'],['Brasov','Brașov'],['Buzau','Buzău'],
  ['Calarasi','Călărași'],['Caras-Severin','Caraș-Severin'],['Cluj','Cluj'],['Constanta','Constanța'],['Covasna','Covasna'],['Dambovita','Dâmbovița'],['Dolj','Dolj'],['Galati','Galați'],['Giurgiu','Giurgiu'],['Gorj','Gorj'],
  ['Harghita','Harghita'],['Hunedoara','Hunedoara'],['Ialomita','Ialomița'],['Iasi','Iași'],['Ilfov','Ilfov'],['Maramures','Maramureș'],['Mehedinti','Mehedinți'],['Mures','Mureș'],['Neamt','Neamț'],['Olt','Olt'],
  ['Prahova','Prahova'],['Salaj','Sălaj'],['Satu Mare','Satu Mare'],['Sibiu','Sibiu'],['Suceava','Suceava'],['Teleorman','Teleorman'],['Timis','Timiș'],['Tulcea','Tulcea'],['Valcea','Vâlcea'],['Vaslui','Vaslui'],['Vrancea','Vrancea'],
];
export const RO_REGIONS = Object.freeze([
  ...RO_COUNTY_NAMES.map(([canonical, native]) => entity(`${canonical} County`, { ro: [`județul ${native}`, `județ ${native}`, native], en: [`${canonical} County`], ru: [`жудец ${native}`], uk: [`жудець ${native}`] }, { country: 'RO', type: 'city' })),
  entity('Bucharest Municipality', { ro: ['Municipiul București', 'București'], en: ['Bucharest Municipality'], ru: ['муниципий Бухарест'], uk: ['муніципій Бухарест'] }, { country: 'RO', type: 'city' }),
]);

export const UZ_REGIONS = Object.freeze([
  entity('Tashkent Region', { uzLatn: ['Toshkent viloyati'], uzCyrl: ['Тошкент вилояти'], ru: ['Ташкентская область'], en: ['Tashkent Region'] }, { country: 'UZ', type: 'city' }),
  entity('Andijan Region', { uzLatn: ['Andijon viloyati'], uzCyrl: ['Андижон вилояти'], ru: ['Андижанская область'], en: ['Andijan Region'] }, { country: 'UZ', type: 'city' }),
  entity('Bukhara Region', { uzLatn: ['Buxoro viloyati'], uzCyrl: ['Бухоро вилояти'], ru: ['Бухарская область'], en: ['Bukhara Region'] }, { country: 'UZ', type: 'city' }),
  entity('Fergana Region', { uzLatn: ["Farg'ona viloyati", 'Farg‘ona viloyati'], uzCyrl: ['Фарғона вилояти'], ru: ['Ферганская область'], en: ['Fergana Region'] }, { country: 'UZ', type: 'city' }),
  entity('Jizzakh Region', { uzLatn: ['Jizzax viloyati'], uzCyrl: ['Жиззах вилояти'], ru: ['Джизакская область'], en: ['Jizzakh Region'] }, { country: 'UZ', type: 'city' }),
  entity('Namangan Region', { uzLatn: ['Namangan viloyati'], uzCyrl: ['Наманган вилояти'], ru: ['Наманганская область'], en: ['Namangan Region'] }, { country: 'UZ', type: 'city' }),
  entity('Navoiy Region', { uzLatn: ['Navoiy viloyati'], uzCyrl: ['Навоий вилояти'], ru: ['Навоийская область'], en: ['Navoiy Region'] }, { country: 'UZ', type: 'city' }),
  entity('Qashqadaryo Region', { uzLatn: ['Qashqadaryo viloyati'], uzCyrl: ['Қашқадарё вилояти'], ru: ['Кашкадарьинская область'], en: ['Qashqadaryo Region', 'Kashkadarya Region'] }, { country: 'UZ', type: 'city' }),
  entity('Samarqand Region', { uzLatn: ['Samarqand viloyati'], uzCyrl: ['Самарқанд вилояти'], ru: ['Самаркандская область'], en: ['Samarqand Region', 'Samarkand Region'] }, { country: 'UZ', type: 'city' }),
  entity('Surxondaryo Region', { uzLatn: ['Surxondaryo viloyati'], uzCyrl: ['Сурхондарё вилояти'], ru: ['Сурхандарьинская область'], en: ['Surxondaryo Region', 'Surkhandarya Region'] }, { country: 'UZ', type: 'city' }),
  entity('Sirdaryo Region', { uzLatn: ['Sirdaryo viloyati'], uzCyrl: ['Сирдарё вилояти'], ru: ['Сырдарьинская область'], en: ['Sirdaryo Region', 'Syrdarya Region'] }, { country: 'UZ', type: 'city' }),
  entity('Xorazm Region', { uzLatn: ['Xorazm viloyati'], uzCyrl: ['Хоразм вилояти'], ru: ['Хорезмская область'], en: ['Xorazm Region', 'Khorezm Region'] }, { country: 'UZ', type: 'city' }),
  entity('Karakalpakstan', { uzLatn: ["Qoraqalpog'iston Respublikasi", 'Qoraqalpog‘iston Respublikasi'], uzCyrl: ['Қорақалпоғистон Республикаси'], ru: ['Республика Каракалпакстан', 'Каракалпакстан'], en: ['Republic of Karakalpakstan', 'Karakalpakstan'] }, { country: 'UZ', type: 'city' }),
  entity('Tashkent City', { uzLatn: ['Toshkent shahri'], uzCyrl: ['Тошкент шаҳри'], ru: ['город Ташкент', 'г. Ташкент'], en: ['Tashkent City'] }, { country: 'UZ', type: 'city' }),
]);

export const KZ_REGIONS = Object.freeze([
  entity('Abai Region', { kk: ['Абай облысы'], ru: ['Абайская область'], en: ['Abai Region'] }, { country: 'KZ', type: 'city' }),
  entity('Akmola Region', { kk: ['Ақмола облысы'], ru: ['Акмолинская область'], en: ['Akmola Region'] }, { country: 'KZ', type: 'city' }),
  entity('Aktobe Region', { kk: ['Ақтөбе облысы'], ru: ['Актюбинская область'], en: ['Aktobe Region'] }, { country: 'KZ', type: 'city' }),
  entity('Almaty Region', { kk: ['Алматы облысы'], ru: ['Алматинская область'], en: ['Almaty Region'] }, { country: 'KZ', type: 'city' }),
  entity('Atyrau Region', { kk: ['Атырау облысы'], ru: ['Атырауская область'], en: ['Atyrau Region'] }, { country: 'KZ', type: 'city' }),
  entity('East Kazakhstan Region', { kk: ['Шығыс Қазақстан облысы'], ru: ['Восточно-Казахстанская область'], en: ['East Kazakhstan Region'] }, { country: 'KZ', type: 'city' }),
  entity('Jambyl Region', { kk: ['Жамбыл облысы'], ru: ['Жамбылская область'], en: ['Jambyl Region', 'Zhambyl Region'] }, { country: 'KZ', type: 'city' }),
  entity('Jetisu Region', { kk: ['Жетісу облысы'], ru: ['Жетысуская область'], en: ['Jetisu Region', 'Zhetysu Region'] }, { country: 'KZ', type: 'city' }),
  entity('Karaganda Region', { kk: ['Қарағанды облысы'], ru: ['Карагандинская область'], en: ['Karaganda Region'] }, { country: 'KZ', type: 'city' }),
  entity('Kostanay Region', { kk: ['Қостанай облысы'], ru: ['Костанайская область'], en: ['Kostanay Region'] }, { country: 'KZ', type: 'city' }),
  entity('Kyzylorda Region', { kk: ['Қызылорда облысы'], ru: ['Кызылординская область'], en: ['Kyzylorda Region'] }, { country: 'KZ', type: 'city' }),
  entity('Mangystau Region', { kk: ['Маңғыстау облысы'], ru: ['Мангистауская область'], en: ['Mangystau Region'] }, { country: 'KZ', type: 'city' }),
  entity('North Kazakhstan Region', { kk: ['Солтүстік Қазақстан облысы'], ru: ['Северо-Казахстанская область'], en: ['North Kazakhstan Region'] }, { country: 'KZ', type: 'city' }),
  entity('Pavlodar Region', { kk: ['Павлодар облысы'], ru: ['Павлодарская область'], en: ['Pavlodar Region'] }, { country: 'KZ', type: 'city' }),
  entity('Turkistan Region', { kk: ['Түркістан облысы'], ru: ['Туркестанская область'], en: ['Turkistan Region'] }, { country: 'KZ', type: 'city' }),
  entity('Ulytau Region', { kk: ['Ұлытау облысы'], ru: ['Улытауская область'], en: ['Ulytau Region'] }, { country: 'KZ', type: 'city' }),
  entity('West Kazakhstan Region', { kk: ['Батыс Қазақстан облысы'], ru: ['Западно-Казахстанская область'], en: ['West Kazakhstan Region'] }, { country: 'KZ', type: 'city' }),
  entity('Astana City', { kk: ['Астана қаласы'], ru: ['город Астана'], en: ['Astana City'] }, { country: 'KZ', type: 'city' }),
  entity('Almaty City', { kk: ['Алматы қаласы'], ru: ['город Алматы'], en: ['Almaty City'] }, { country: 'KZ', type: 'city' }),
  entity('Shymkent City', { kk: ['Шымкент қаласы'], ru: ['город Шымкент'], en: ['Shymkent City'] }, { country: 'KZ', type: 'city' }),
]);

export const REGIONS = Object.freeze([...UZ_REGIONS, ...KZ_REGIONS, ...UA_REGIONS, ...RO_REGIONS]);
export const REGIONS_BY_COUNTRY = Object.freeze(Object.fromEntries(
  [...new Set(REGIONS.map((item) => item.country).filter(Boolean))].map((code) => [
    code,
    Object.freeze(REGIONS.filter((item) => item.country === code)),
  ]),
));

export function canonicalRegion(value, country = null) {
  const catalog = country ? (REGIONS_BY_COUNTRY[country] || []) : REGIONS;
  return findCanonical(value, catalog, { partial: true })?.canonical || null;
}
