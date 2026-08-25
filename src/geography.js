import { CITIES as CENTRAL_ASIA_CITIES } from './geo.js';
import { findCanonical } from './normalization.js';

const entity = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });

export const UA_CITIES = Object.freeze([
  entity('Kyiv', { uk: ['Київ'], ru: ['Киев'], en: ['Kyiv', 'Kiev'], ro: ['Kiev'] }, { country: 'UA' }),
  entity('Kharkiv', { uk: ['Харків'], ru: ['Харьков'], en: ['Kharkiv', 'Kharkov'], ro: ['Harkiv'] }, { country: 'UA' }),
  entity('Odesa', { uk: ['Одеса'], ru: ['Одесса'], en: ['Odesa', 'Odessa'], ro: ['Odesa'] }, { country: 'UA' }),
  entity('Dnipro', { uk: ['Дніпро'], ru: ['Днепр'], en: ['Dnipro', 'Dnepr'], ro: ['Dnipro'] }, { country: 'UA' }),
  entity('Lviv', { uk: ['Львів'], ru: ['Львов'], en: ['Lviv', 'Lvov'], ro: ['Liov', 'Lviv'] }, { country: 'UA' }),
  entity('Zaporizhzhia', { uk: ['Запоріжжя'], ru: ['Запорожье'], en: ['Zaporizhzhia', 'Zaporozhye'], ro: ['Zaporijjea'] }, { country: 'UA' }),
  entity('Vinnytsia', { uk: ['Вінниця'], ru: ['Винница'], en: ['Vinnytsia', 'Vinnitsa'], ro: ['Vinița', 'Vinnytsia'] }, { country: 'UA' }),
  entity('Ivano-Frankivsk', { uk: ['Івано-Франківськ', 'Франківськ'], ru: ['Ивано-Франковск'], en: ['Ivano-Frankivsk', 'Frankivsk'], ro: ['Ivano-Frankivsk'] }, { country: 'UA' }),
  entity('Chernivtsi', { uk: ['Чернівці'], ru: ['Черновцы'], en: ['Chernivtsi', 'Chernovtsy'], ro: ['Cernăuți', 'Cernivți'] }, { country: 'UA' }),
  entity('Uzhhorod', { uk: ['Ужгород'], ru: ['Ужгород'], en: ['Uzhhorod', 'Uzhgorod'], ro: ['Ujhorod'] }, { country: 'UA' }),
  entity('Mukachevo', { uk: ['Мукачево', 'Мукачеве'], ru: ['Мукачево'], en: ['Mukachevo', 'Mukacheve'], ro: ['Muncaci', 'Mukachevo'] }, { country: 'UA' }),
  entity('Lutsk', { uk: ['Луцьк'], ru: ['Луцк'], en: ['Lutsk'], ro: ['Luțk'] }, { country: 'UA' }),
  entity('Rivne', { uk: ['Рівне'], ru: ['Ровно'], en: ['Rivne', 'Rovno'], ro: ['Rivne'] }, { country: 'UA' }),
  entity('Ternopil', { uk: ['Тернопіль'], ru: ['Тернополь'], en: ['Ternopil', 'Ternopol'], ro: ['Ternopil'] }, { country: 'UA' }),
  entity('Khmelnytskyi', { uk: ['Хмельницький'], ru: ['Хмельницкий'], en: ['Khmelnytskyi', 'Khmelnitsky'], ro: ['Hmelnițki'] }, { country: 'UA' }),
  entity('Zhytomyr', { uk: ['Житомир'], ru: ['Житомир'], en: ['Zhytomyr', 'Zhitomir'], ro: ['Jîtomîr'] }, { country: 'UA' }),
  entity('Cherkasy', { uk: ['Черкаси'], ru: ['Черкассы'], en: ['Cherkasy', 'Cherkassy'], ro: ['Cerkasî'] }, { country: 'UA' }),
  entity('Poltava', { uk: ['Полтава'], ru: ['Полтава'], en: ['Poltava'], ro: ['Poltava'] }, { country: 'UA' }),
  entity('Chernihiv', { uk: ['Чернігів'], ru: ['Чернигов'], en: ['Chernihiv', 'Chernigov'], ro: ['Cernihiv'] }, { country: 'UA' }),
  entity('Sumy', { uk: ['Суми'], ru: ['Сумы'], en: ['Sumy'], ro: ['Sumî'] }, { country: 'UA' }),
  entity('Mykolaiv', { uk: ['Миколаїв'], ru: ['Николаев'], en: ['Mykolaiv', 'Nikolaev'], ro: ['Mîkolaiiv'] }, { country: 'UA' }),
  entity('Kherson', { uk: ['Херсон'], ru: ['Херсон'], en: ['Kherson'], ro: ['Herson'] }, { country: 'UA' }),
  entity('Kropyvnytskyi', { uk: ['Кропивницький'], ru: ['Кропивницкий', 'Кировоград'], en: ['Kropyvnytskyi', 'Kirovohrad'], ro: ['Kropîvnîțkîi'] }, { country: 'UA' }),
  entity('Irpin', { uk: ['Ірпінь'], ru: ['Ирпень'], en: ['Irpin'], ro: ['Irpin'] }, { country: 'UA' }),
  entity('Bucha', { uk: ['Буча'], ru: ['Буча'], en: ['Bucha'], ro: ['Bucea'] }, { country: 'UA' }),
  entity('Brovary', { uk: ['Бровари'], ru: ['Бровары'], en: ['Brovary'], ro: ['Brovary'] }, { country: 'UA' }),
  entity('Bila Tserkva', { uk: ['Біла Церква'], ru: ['Белая Церковь'], en: ['Bila Tserkva'], ro: ['Bila Țerkva'] }, { country: 'UA' }),
  entity('Kryvyi Rih', { uk: ['Кривий Ріг'], ru: ['Кривой Рог'], en: ['Kryvyi Rih', 'Krivoy Rog'], ro: ['Krîvîi Rih'] }, { country: 'UA' }),
  entity('Kremenchuk', { uk: ['Кременчук'], ru: ['Кременчуг'], en: ['Kremenchuk'], ro: ['Kremenciuk'] }, { country: 'UA' }),
  entity('Uman', { uk: ['Умань'], ru: ['Умань'], en: ['Uman'], ro: ['Uman'] }, { country: 'UA' }),
]);

export const RO_CITIES = Object.freeze([
  entity('Bucharest', { ro: ['București', 'Bucuresti'], en: ['Bucharest'], ru: ['Бухарест'], uk: ['Бухарест'] }, { country: 'RO' }),
  entity('Cluj-Napoca', { ro: ['Cluj-Napoca', 'Cluj'], en: ['Cluj-Napoca', 'Cluj'], ru: ['Клуж-Напока', 'Клуж'], uk: ['Клуж-Напока'] }, { country: 'RO' }),
  entity('Timisoara', { ro: ['Timișoara', 'Timisoara'], en: ['Timisoara', 'Timișoara'], ru: ['Тимишоара'], uk: ['Тімішоара'] }, { country: 'RO' }),
  entity('Iasi', { ro: ['Iași', 'Iasi'], en: ['Iasi', 'Iași'], ru: ['Яссы'], uk: ['Ясси'] }, { country: 'RO' }),
  entity('Brasov', { ro: ['Brașov', 'Brasov'], en: ['Brasov', 'Brașov'], ru: ['Брашов'], uk: ['Брашов'] }, { country: 'RO' }),
  entity('Constanta', { ro: ['Constanța', 'Constanta'], en: ['Constanta', 'Constanța'], ru: ['Констанца'], uk: ['Констанца'] }, { country: 'RO' }),
  entity('Oradea', { ro: ['Oradea'], en: ['Oradea'], ru: ['Орадя'], uk: ['Орадя'] }, { country: 'RO' }),
  entity('Sibiu', { ro: ['Sibiu'], en: ['Sibiu'], ru: ['Сибиу'], uk: ['Сібіу'] }, { country: 'RO' }),
  entity('Craiova', { ro: ['Craiova'], en: ['Craiova'], ru: ['Крайова'], uk: ['Крайова'] }, { country: 'RO' }),
  entity('Ploiesti', { ro: ['Ploiești', 'Ploiesti'], en: ['Ploiesti', 'Ploiești'], ru: ['Плоешти'], uk: ['Плоєшті'] }, { country: 'RO' }),
  entity('Galati', { ro: ['Galați', 'Galati'], en: ['Galati', 'Galați'], ru: ['Галац'], uk: ['Галац'] }, { country: 'RO' }),
  entity('Arad', { ro: ['Arad'], en: ['Arad'], ru: ['Арад'], uk: ['Арад'] }, { country: 'RO' }),
]);

export const KG_CITIES = Object.freeze([
  entity('Bishkek', { ru: ['Бишкек'], en: ['Bishkek'], kk: ['Бішкек'], uzLatn: ['Bishkek'] }, { country: 'KG' }),
  entity('Osh', { ru: ['Ош'], en: ['Osh'], kk: ['Ош'], uzLatn: ['Osh'] }, { country: 'KG' }),
  entity('Karakol', { ru: ['Каракол'], en: ['Karakol'], kk: ['Қаракөл'], uzLatn: ['Karakol'] }, { country: 'KG' }),
]);

export const GEOGRAPHY_CITIES = Object.freeze([...CENTRAL_ASIA_CITIES, ...UA_CITIES, ...RO_CITIES, ...KG_CITIES]);

export function canonicalAnyCity(value, country = null) {
  const catalog = country ? GEOGRAPHY_CITIES.filter((item) => item.country === country) : GEOGRAPHY_CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}

export const UA_REGIONS = Object.freeze([
  entity('Vinnytsia Oblast', { uk: ['Вінницька область'], ru: ['Винницкая область'], en: ['Vinnytsia Oblast'] }, { country: 'UA' }),
  entity('Volyn Oblast', { uk: ['Волинська область'], ru: ['Волынская область'], en: ['Volyn Oblast'] }, { country: 'UA' }),
  entity('Dnipropetrovsk Oblast', { uk: ['Дніпропетровська область'], ru: ['Днепропетровская область'], en: ['Dnipropetrovsk Oblast'] }, { country: 'UA' }),
  entity('Donetsk Oblast', { uk: ['Донецька область'], ru: ['Донецкая область'], en: ['Donetsk Oblast'] }, { country: 'UA' }),
  entity('Zhytomyr Oblast', { uk: ['Житомирська область'], ru: ['Житомирская область'], en: ['Zhytomyr Oblast'] }, { country: 'UA' }),
  entity('Zakarpattia Oblast', { uk: ['Закарпатська область'], ru: ['Закарпатская область'], en: ['Zakarpattia Oblast', 'Transcarpathia'] }, { country: 'UA' }),
  entity('Zaporizhzhia Oblast', { uk: ['Запорізька область'], ru: ['Запорожская область'], en: ['Zaporizhzhia Oblast'] }, { country: 'UA' }),
  entity('Ivano-Frankivsk Oblast', { uk: ['Івано-Франківська область'], ru: ['Ивано-Франковская область'], en: ['Ivano-Frankivsk Oblast'] }, { country: 'UA' }),
  entity('Kyiv Oblast', { uk: ['Київська область', 'Київщина'], ru: ['Киевская область', 'Киевщина'], en: ['Kyiv Oblast', 'Kyiv Region'] }, { country: 'UA' }),
  entity('Kirovohrad Oblast', { uk: ['Кіровоградська область'], ru: ['Кировоградская область'], en: ['Kirovohrad Oblast'] }, { country: 'UA' }),
  entity('Luhansk Oblast', { uk: ['Луганська область'], ru: ['Луганская область'], en: ['Luhansk Oblast'] }, { country: 'UA' }),
  entity('Lviv Oblast', { uk: ['Львівська область', 'Львівщина'], ru: ['Львовская область'], en: ['Lviv Oblast'] }, { country: 'UA' }),
  entity('Mykolaiv Oblast', { uk: ['Миколаївська область'], ru: ['Николаевская область'], en: ['Mykolaiv Oblast'] }, { country: 'UA' }),
  entity('Odesa Oblast', { uk: ['Одеська область', 'Одещина'], ru: ['Одесская область'], en: ['Odesa Oblast', 'Odessa Oblast'] }, { country: 'UA' }),
  entity('Poltava Oblast', { uk: ['Полтавська область'], ru: ['Полтавская область'], en: ['Poltava Oblast'] }, { country: 'UA' }),
  entity('Rivne Oblast', { uk: ['Рівненська область'], ru: ['Ровенская область'], en: ['Rivne Oblast'] }, { country: 'UA' }),
  entity('Sumy Oblast', { uk: ['Сумська область'], ru: ['Сумская область'], en: ['Sumy Oblast'] }, { country: 'UA' }),
  entity('Ternopil Oblast', { uk: ['Тернопільська область'], ru: ['Тернопольская область'], en: ['Ternopil Oblast'] }, { country: 'UA' }),
  entity('Kharkiv Oblast', { uk: ['Харківська область', 'Харківщина'], ru: ['Харьковская область'], en: ['Kharkiv Oblast'] }, { country: 'UA' }),
  entity('Kherson Oblast', { uk: ['Херсонська область'], ru: ['Херсонская область'], en: ['Kherson Oblast'] }, { country: 'UA' }),
  entity('Khmelnytskyi Oblast', { uk: ['Хмельницька область'], ru: ['Хмельницкая область'], en: ['Khmelnytskyi Oblast'] }, { country: 'UA' }),
  entity('Cherkasy Oblast', { uk: ['Черкаська область'], ru: ['Черкасская область'], en: ['Cherkasy Oblast'] }, { country: 'UA' }),
  entity('Chernivtsi Oblast', { uk: ['Чернівецька область'], ru: ['Черновицкая область'], ro: ['Regiunea Cernăuți'], en: ['Chernivtsi Oblast'] }, { country: 'UA' }),
  entity('Chernihiv Oblast', { uk: ['Чернігівська область'], ru: ['Черниговская область'], en: ['Chernihiv Oblast'] }, { country: 'UA' }),
  entity('Autonomous Republic of Crimea', { uk: ['Автономна Республіка Крим', 'АР Крим'], ru: ['Автономная Республика Крым', 'АР Крым'], en: ['Autonomous Republic of Crimea', 'Crimea'] }, { country: 'UA' }),
  entity('Kyiv City', { uk: ['місто Київ', 'м. Київ'], ru: ['город Киев', 'г. Киев'], en: ['Kyiv City'] }, { country: 'UA' }),
  entity('Sevastopol City', { uk: ['місто Севастополь', 'м. Севастополь'], ru: ['город Севастополь', 'г. Севастополь'], en: ['Sevastopol City'] }, { country: 'UA' }),
]);

const RO_COUNTY_NAMES = [
  ['Alba','Alba'],['Arad','Arad'],['Arges','Argeș'],['Bacau','Bacău'],['Bihor','Bihor'],['Bistrita-Nasaud','Bistrița-Năsăud'],['Botosani','Botoșani'],['Braila','Brăila'],['Brasov','Brașov'],['Buzau','Buzău'],
  ['Calarasi','Călărași'],['Caras-Severin','Caraș-Severin'],['Cluj','Cluj'],['Constanta','Constanța'],['Covasna','Covasna'],['Dambovita','Dâmbovița'],['Dolj','Dolj'],['Galati','Galați'],['Giurgiu','Giurgiu'],['Gorj','Gorj'],
  ['Harghita','Harghita'],['Hunedoara','Hunedoara'],['Ialomita','Ialomița'],['Iasi','Iași'],['Ilfov','Ilfov'],['Maramures','Maramureș'],['Mehedinti','Mehedinți'],['Mures','Mureș'],['Neamt','Neamț'],['Olt','Olt'],
  ['Prahova','Prahova'],['Salaj','Sălaj'],['Satu Mare','Satu Mare'],['Sibiu','Sibiu'],['Suceava','Suceava'],['Teleorman','Teleorman'],['Timis','Timiș'],['Tulcea','Tulcea'],['Valcea','Vâlcea'],['Vaslui','Vaslui'],['Vrancea','Vrancea'],
];
export const RO_REGIONS = Object.freeze([
  ...RO_COUNTY_NAMES.map(([canonical, native]) => entity(`${canonical} County`, { ro: [`județul ${native}`, `județ ${native}`, native], en: [`${canonical} County`], ru: [`жудец ${native}`], uk: [`жудець ${native}`] }, { country: 'RO' })),
  entity('Bucharest Municipality', { ro: ['Municipiul București', 'București'], en: ['Bucharest Municipality'], ru: ['муниципий Бухарест'], uk: ['муніципій Бухарест'] }, { country: 'RO' }),
]);

export const UZ_REGIONS = Object.freeze([
  entity('Tashkent Region', { uzLatn: ['Toshkent viloyati'], uzCyrl: ['Тошкент вилояти'], ru: ['Ташкентская область'], en: ['Tashkent Region'] }, { country: 'UZ' }),
  entity('Andijan Region', { uzLatn: ['Andijon viloyati'], uzCyrl: ['Андижон вилояти'], ru: ['Андижанская область'], en: ['Andijan Region'] }, { country: 'UZ' }),
  entity('Bukhara Region', { uzLatn: ['Buxoro viloyati'], uzCyrl: ['Бухоро вилояти'], ru: ['Бухарская область'], en: ['Bukhara Region'] }, { country: 'UZ' }),
  entity('Fergana Region', { uzLatn: ["Farg'ona viloyati", 'Farg‘ona viloyati'], uzCyrl: ['Фарғона вилояти'], ru: ['Ферганская область'], en: ['Fergana Region'] }, { country: 'UZ' }),
  entity('Jizzakh Region', { uzLatn: ['Jizzax viloyati'], uzCyrl: ['Жиззах вилояти'], ru: ['Джизакская область'], en: ['Jizzakh Region'] }, { country: 'UZ' }),
  entity('Namangan Region', { uzLatn: ['Namangan viloyati'], uzCyrl: ['Наманган вилояти'], ru: ['Наманганская область'], en: ['Namangan Region'] }, { country: 'UZ' }),
  entity('Navoiy Region', { uzLatn: ['Navoiy viloyati'], uzCyrl: ['Навоий вилояти'], ru: ['Навоийская область'], en: ['Navoiy Region'] }, { country: 'UZ' }),
  entity('Qashqadaryo Region', { uzLatn: ['Qashqadaryo viloyati'], uzCyrl: ['Қашқадарё вилояти'], ru: ['Кашкадарьинская область'], en: ['Qashqadaryo Region', 'Kashkadarya Region'] }, { country: 'UZ' }),
  entity('Samarqand Region', { uzLatn: ['Samarqand viloyati'], uzCyrl: ['Самарқанд вилояти'], ru: ['Самаркандская область'], en: ['Samarqand Region', 'Samarkand Region'] }, { country: 'UZ' }),
  entity('Surxondaryo Region', { uzLatn: ['Surxondaryo viloyati'], uzCyrl: ['Сурхондарё вилояти'], ru: ['Сурхандарьинская область'], en: ['Surxondaryo Region', 'Surkhandarya Region'] }, { country: 'UZ' }),
  entity('Sirdaryo Region', { uzLatn: ['Sirdaryo viloyati'], uzCyrl: ['Сирдарё вилояти'], ru: ['Сырдарьинская область'], en: ['Sirdaryo Region', 'Syrdarya Region'] }, { country: 'UZ' }),
  entity('Xorazm Region', { uzLatn: ['Xorazm viloyati'], uzCyrl: ['Хоразм вилояти'], ru: ['Хорезмская область'], en: ['Xorazm Region', 'Khorezm Region'] }, { country: 'UZ' }),
  entity('Karakalpakstan', { uzLatn: ["Qoraqalpog'iston Respublikasi", 'Qoraqalpog‘iston Respublikasi'], uzCyrl: ['Қорақалпоғистон Республикаси'], ru: ['Республика Каракалпакстан', 'Каракалпакстан'], en: ['Republic of Karakalpakstan', 'Karakalpakstan'] }, { country: 'UZ' }),
  entity('Tashkent City', { uzLatn: ['Toshkent shahri'], uzCyrl: ['Тошкент шаҳри'], ru: ['город Ташкент', 'г. Ташкент'], en: ['Tashkent City'] }, { country: 'UZ' }),
]);

export const KZ_REGIONS = Object.freeze([
  entity('Abai Region', { kk: ['Абай облысы'], ru: ['Абайская область'], en: ['Abai Region'] }, { country: 'KZ' }),
  entity('Akmola Region', { kk: ['Ақмола облысы'], ru: ['Акмолинская область'], en: ['Akmola Region'] }, { country: 'KZ' }),
  entity('Aktobe Region', { kk: ['Ақтөбе облысы'], ru: ['Актюбинская область'], en: ['Aktobe Region'] }, { country: 'KZ' }),
  entity('Almaty Region', { kk: ['Алматы облысы'], ru: ['Алматинская область'], en: ['Almaty Region'] }, { country: 'KZ' }),
  entity('Atyrau Region', { kk: ['Атырау облысы'], ru: ['Атырауская область'], en: ['Atyrau Region'] }, { country: 'KZ' }),
  entity('East Kazakhstan Region', { kk: ['Шығыс Қазақстан облысы'], ru: ['Восточно-Казахстанская область'], en: ['East Kazakhstan Region'] }, { country: 'KZ' }),
  entity('Jambyl Region', { kk: ['Жамбыл облысы'], ru: ['Жамбылская область'], en: ['Jambyl Region', 'Zhambyl Region'] }, { country: 'KZ' }),
  entity('Jetisu Region', { kk: ['Жетісу облысы'], ru: ['Жетысуская область'], en: ['Jetisu Region', 'Zhetysu Region'] }, { country: 'KZ' }),
  entity('Karaganda Region', { kk: ['Қарағанды облысы'], ru: ['Карагандинская область'], en: ['Karaganda Region'] }, { country: 'KZ' }),
  entity('Kostanay Region', { kk: ['Қостанай облысы'], ru: ['Костанайская область'], en: ['Kostanay Region'] }, { country: 'KZ' }),
  entity('Kyzylorda Region', { kk: ['Қызылорда облысы'], ru: ['Кызылординская область'], en: ['Kyzylorda Region'] }, { country: 'KZ' }),
  entity('Mangystau Region', { kk: ['Маңғыстау облысы'], ru: ['Мангистауская область'], en: ['Mangystau Region'] }, { country: 'KZ' }),
  entity('North Kazakhstan Region', { kk: ['Солтүстік Қазақстан облысы'], ru: ['Северо-Казахстанская область'], en: ['North Kazakhstan Region'] }, { country: 'KZ' }),
  entity('Pavlodar Region', { kk: ['Павлодар облысы'], ru: ['Павлодарская область'], en: ['Pavlodar Region'] }, { country: 'KZ' }),
  entity('Turkistan Region', { kk: ['Түркістан облысы'], ru: ['Туркестанская область'], en: ['Turkistan Region'] }, { country: 'KZ' }),
  entity('Ulytau Region', { kk: ['Ұлытау облысы'], ru: ['Улытауская область'], en: ['Ulytau Region'] }, { country: 'KZ' }),
  entity('West Kazakhstan Region', { kk: ['Батыс Қазақстан облысы'], ru: ['Западно-Казахстанская область'], en: ['West Kazakhstan Region'] }, { country: 'KZ' }),
  entity('Astana City', { kk: ['Астана қаласы'], ru: ['город Астана'], en: ['Astana City'] }, { country: 'KZ' }),
  entity('Almaty City', { kk: ['Алматы қаласы'], ru: ['город Алматы'], en: ['Almaty City'] }, { country: 'KZ' }),
  entity('Shymkent City', { kk: ['Шымкент қаласы'], ru: ['город Шымкент'], en: ['Shymkent City'] }, { country: 'KZ' }),
]);

export const REGIONS = Object.freeze([...UZ_REGIONS, ...KZ_REGIONS, ...UA_REGIONS, ...RO_REGIONS]);

export function canonicalRegion(value, country = null) {
  const catalog = country ? REGIONS.filter((item) => item.country === country) : REGIONS;
  return findCanonical(value, catalog, { partial: true })?.canonical || null;
}
