import { aliasesToRegex, findCanonical } from './normalization.js';
import { deepFreeze, lexiconEntity } from './lexicon-core.js';

const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, { type: extra.type || (extra.country ? 'city' : 'district'), ...(!extra.country ? { country: 'UZ', city: 'Tashkent' } : {}), ...extra });

export { UZ_CITIES, KZ_CITIES } from './geography-central-asia.js';

// Compatibility for the historical ./geo subpath. Canonical city ownership lives in geography.js.
export { CITIES, CITIES_BY_COUNTRY, canonicalCity } from './geography.js';

export const TASHKENT_DISTRICTS = Object.freeze([
  entity('Almazar', { uzLatn: ['Olmazor', 'Olmazor tumani'], uzCyrl: ['Олмазор', 'Олмазор тумани'], ru: ['Алмазар', 'Алмазарский район'], en: ['Almazar', 'Olmazor district'] }),
  entity('Bektemir', { uzLatn: ['Bektemir', 'Bektemir tumani'], uzCyrl: ['Бектемир', 'Бектемир тумани'], ru: ['Бектемир', 'Бектемирский район'], en: ['Bektemir'] }),
  entity('Mirobod', { uzLatn: ['Mirobod', 'Mirobod tumani'], uzCyrl: ['Миробод', 'Миробод тумани'], ru: ['Мирабад', 'Мирабадский район'], en: ['Mirobod', 'Mirabad'] }),
  entity('Mirzo Ulugbek', { uzLatn: ["Mirzo Ulug'bek", 'Mirzo Ulugbek', "Mirzo Ulug'bek tumani"], uzCyrl: ['Мирзо Улуғбек', 'Мирзо Улуғбек тумани'], ru: ['Мирзо-Улугбекский район', 'Мирзо Улугбек'], en: ['Mirzo Ulugbek', 'Mirzo Ulughbek'] }),
  entity('Sergeli', { uzLatn: ['Sergeli', 'Sergeli tumani'], uzCyrl: ['Сергели', 'Сергели тумани'], ru: ['Сергелийский район', 'Сергели'], en: ['Sergeli'] }),
  entity('Uchtepa', { uzLatn: ['Uchtepa', 'Uchtepa tumani'], uzCyrl: ['Учтепа', 'Учтепа тумани'], ru: ['Учтепинский район', 'Учтепа'], en: ['Uchtepa'] }),
  entity('Chilanzar', { uzLatn: ['Chilonzor', 'Chilonzor tumani', 'Chilanzar'], uzCyrl: ['Чилонзор', 'Чилонзор тумани'], ru: ['Чиланзар', 'Чиланзарский район'], en: ['Chilanzar', 'Chilonzor'] }),
  entity('Shaykhantahur', { uzLatn: ['Shayxontohur', 'Shayxontohur tumani', 'Shaykhantahur'], uzCyrl: ['Шайхонтоҳур', 'Шайхонтоҳур тумани', 'Шайхонтохур'], ru: ['Шайхантахур', 'Шайхантахурский район'], en: ['Shaykhantahur', 'Shayxontohur'] }),
  entity('Yunusabad', { uzLatn: ['Yunusobod', 'Yunusobod tumani', 'Yunusabad'], uzCyrl: ['Юнусобод', 'Юнусобод тумани'], ru: ['Юнусабад', 'Юнусабадский район'], en: ['Yunusabad', 'Yunusobod'] }),
  entity('Yakkasaray', { uzLatn: ['Yakkasaroy', 'Yakkasaroy tumani', 'Yakkasaray'], uzCyrl: ['Яккасарой', 'Яккасарой тумани'], ru: ['Яккасарай', 'Яккасарайский район'], en: ['Yakkasaray', 'Yakkasaroy'] }),
  entity('Yangihayot', { uzLatn: ['Yangihayot', 'Yangihayot tumani'], uzCyrl: ['Янгиҳаёт', 'Янгиҳаёт тумани', 'Янгихаёт'], ru: ['Янгихаётский район', 'Янгихаёт'], en: ['Yangihayot'] }),
  entity('Yashnobod', { uzLatn: ['Yashnobod', 'Yashnobod tumani', 'Yashnabod', 'Yashnabod tumani'], uzCyrl: ['Яшнобод', 'Яшнобод тумани'], ru: ['Яшнабад', 'Яшнабадский район'], en: ['Yashnobod', 'Yashnabad'] }),
]);

export function canonicalTashkentDistrict(value) {
  return findCanonical(value, TASHKENT_DISTRICTS, { partial: true })?.canonical || null;
}

function station(name, ru, en, line, aliases = []) {
  const allAliases = [...new Set([name, ru, en, ...aliases])];
  return deepFreeze({
    canonical: name,
    name,
    type: 'metro',
    country: 'UZ',
    city: 'Tashkent',
    line,
    labels: { ru, en },
    aliases: allAliases,
    re: aliasesToRegex(allAliases),
  });
}

export const TASHKENT_METRO = Object.freeze([
  station('Buyuk Ipak Yoli', 'Буюк Ипак Йули', 'Buyuk Ipak Yoli', 'chilonzor', ['Buyuk Ipak Yuli', "Buyuk Ipak Yo'li", 'Buyuk Ipak Yo‘li', 'Buyuk Ipak Yoʻli', 'Буюк Ипак Йўли', 'БИЙ', 'Максим Горький', 'Максима Горького', 'Горького', 'Maxim Gorky', 'Maksim Gorkiy']),
  station('Pushkin', 'Пушкин', 'Pushkin', 'chilonzor'),
  station('Hamid Olimjon', 'Хамид Алимджан', 'Hamid Olimjon', 'chilonzor', ['Хамид Олимжон', 'Hamid Alimjan', 'Hamid Alimjon']),
  station('Amir Temur Xiyoboni', 'Амир Темур Хиёбони', 'Amir Temur Xiyoboni', 'chilonzor', ['Сквер', 'Amir Timur Square', 'Amir Temur']),
  station('Mustaqillik Maydoni', 'Мустакиллик майдони', 'Mustaqillik Maydoni', 'chilonzor', ['Мустақиллик майдони', 'Площадь Независимости', 'Independence Square']),
  station('Paxtakor', 'Пахтакор', 'Paxtakor', 'chilonzor'),
  station('Xalqlar Dostligi', 'Халклар Дустлиги', 'Xalqlar Dostligi', 'chilonzor', ["Xalqlar Do'stligi", 'Xalqlar Do‘stligi', 'Xalqlar Doʻstligi', 'Халклар Дўстлиги', 'Халқлар Дўстлиги', 'Дружба народов', 'Bunyodkor', 'Бунёдкор']),
  station('Milliy Bog', 'Миллий Бог', 'Milliy Bog', 'chilonzor', ["Milliy Bog'", 'Milliy Bog‘', 'Milliy Bogʻ', 'Миллий Боғ', 'Yoshlik', 'Ёшлик']),
  station('Novza', 'Новза', 'Novza', 'chilonzor', ['Хамза', 'Hamza', 'Hamza metro', 'метро Хамза']),
  station('Mirzo Ulugbek', 'Мирзо Улугбек', 'Mirzo Ulugbek', 'chilonzor', ["Mirzo Ulug'bek", 'Mirzo Ulug‘bek', 'Mirzo Ulugʻbek', 'Мирзо Улуғбек', 'М. Улугбек', 'метро М. Улугбек']),
  station('Chilonzor', 'Чиланзар', 'Chilonzor', 'chilonzor', ['Чилонзор', 'Chilanzar', 'метро Чиланзар', 'Chilonzor metro']),
  station('Olmazor', 'Алмазар', 'Olmazor', 'chilonzor', ['Олмазор', 'Almazar', 'Сабир Рахимов', 'Собир Рахимов', 'Sobir Raximov', 'Sabir Rakhimov']),
  station('Choshtepa', 'Чаштепа', 'Choshtepa', 'chilonzor', ['Чоштепа']),
  station('Ozgarish', 'Узгариш', 'Ozgarish', 'chilonzor', ["O'zgarish", 'O‘zgarish', 'Oʻzgarish', 'Ўзгариш']),
  station('Sergeli', 'Сергели', 'Sergeli', 'chilonzor', ['метро Сергели', 'Sergeli metro']),
  station('Yangihayot', 'Янгихаёт', 'Yangihayot', 'chilonzor', ['Янгиҳаёт', 'Янгихаят']),
  station('Chinor', 'Чинар', 'Chinor', 'chilonzor', ['Чинор']),
  station('Beruniy', 'Беруни', 'Beruniy', 'ozbekiston', ['Beruni']),
  station('Tinchlik', 'Тинчлик', 'Tinchlik', 'ozbekiston'),
  station('Chorsu', 'Чорсу', 'Chorsu', 'ozbekiston'),
  station('Gafur Gulom', 'Гафур Гулям', 'Gafur Gulom', 'ozbekiston', ["G'afur G'ulom", 'G‘afur G‘ulom', 'Gʻafur Gʻulom', 'Ғафур Ғулом']),
  station('Alisher Navoi', 'Алишер Навои', 'Alisher Navoi', 'ozbekiston', ['Alisher Navoiy', 'Алишер Навоий']),
  station('Ozbekiston', 'Узбекистан', 'Ozbekiston', 'ozbekiston', ["O'zbekiston", 'O‘zbekiston', 'Oʻzbekiston', 'Ўзбекистон']),
  station('Kosmonavtlar', 'Космонавтлар', 'Kosmonavtlar', 'ozbekiston', ['Космонавты']),
  station('Oybek', 'Ойбек', 'Oybek', 'ozbekiston'),
  station('Toshkent', 'Ташкент', 'Toshkent', 'ozbekiston', ['Тошкент', 'Tashkent metro', 'метро Ташкент']),
  station('Mashinasozlar', 'Машинасозлар', 'Mashinasozlar', 'ozbekiston'),
  station('Dostlik', 'Дустлик', 'Dostlik', 'ozbekiston', ["Do'stlik", 'Do‘stlik', 'Doʻstlik', 'Дўстлик']),
  station('Turkiston', 'Туркистон', 'Turkiston', 'yunusobod', ['Туркестан']),
  station('Yunusobod', 'Юнусабад', 'Yunusobod', 'yunusobod', ['Юнусобод', 'Yunusabad', 'метро Юнусабад', 'Yunusobod metro']),
  station('Shahriston', 'Шахристан', 'Shahriston', 'yunusobod', ['Шахристон']),
  station('Bodomzor', 'Бадамзар', 'Bodomzor', 'yunusobod', ['Бодомзор']),
  station('Minor', 'Минор', 'Minor', 'yunusobod'),
  station('Abdulla Qodiriy', 'Абдулла Кадыри', 'Abdulla Qodiriy', 'yunusobod', ['Абдулла Кодири', 'Абдулла Қодирий', 'Abdulla Kadiri']),
  station('Yunus Rajabiy', 'Юнус Раджаби', 'Yunus Rajabiy', 'yunusobod', ['Yunus Rajabi']),
  station('Ming Orik', 'Мингурик', 'Ming Orik', 'yunusobod', ["Ming O'rik", 'Ming O‘rik', 'Ming Oʻrik', 'Минг Урик', 'Мингўрик']),
  station('Texnopark', 'Технопарк', 'Texnopark', 'circle', ['Technopark']),
  station('Yashnobod', 'Яшнабад', 'Yashnobod', 'circle', ['Яшнобод']),
  station('Tuzel', 'Тузель', 'Tuzel', 'circle'),
  station('Olmos', 'Алмас', 'Olmos', 'circle', ['Олмос']),
  station('Rohat', 'Рохат', 'Rohat', 'circle'),
  station('Yangiobod', 'Янгиабад', 'Yangiobod', 'circle', ['Янгиобод']),
  station('Qoyliq', 'Куйлюк', 'Qoyliq', 'circle', ['Qo‘yliq', "Qo'yliq", 'Qoʻyliq', 'Қўйлиқ', 'Куйлик', 'Куйлюк метро']),
  station('Matonat', 'Матонат', 'Matonat', 'circle'),
  station('Qiyot', 'Кият', 'Qiyot', 'circle', ['Киёт', 'Қиёт']),
  station('Tolariq', 'Толарык', 'Tolariq', 'circle', ['Толарик', 'Толариқ']),
  station('Xonobod', 'Хонабад', 'Xonobod', 'circle', ['Ханабад']),
  station('Quruvchilar', 'Курувчилар', 'Quruvchilar', 'circle', ['Қурувчилар']),
  station('Turon', 'Туран', 'Turon', 'circle', ['Турон']),
  station('Qipchoq', 'Кипчак', 'Qipchoq', 'circle', ['Қипчоқ']),
]);

const TASHKENT_METRO_BY_NAME = new Map(TASHKENT_METRO.map((item) => [item.name, item]));

export function tashkentMetroStation(value) {
  if (!value) return null;
  const direct = TASHKENT_METRO_BY_NAME.get(String(value));
  if (direct) return direct;
  return TASHKENT_METRO.find((item) => item.re.test(String(value))) || null;
}

export function canonicalTashkentMetro(value) {
  return tashkentMetroStation(value)?.canonical || null;
}

export function tashkentMetroLabels() {
  return Object.fromEntries(TASHKENT_METRO.map((item) => [item.name, { ru: item.labels.ru, en: item.labels.en, line: item.line }]));
}

// Historical consumer name retained, but entries now carry their actual semantic type.
const area = (name, aliases, type = 'local_area') => deepFreeze({ canonical: name, name, type, country: 'UZ', city: 'Tashkent', aliases });

export const TASHKENT_AREAS = Object.freeze({
  Almazar: Object.freeze([
    area('Sebzar', ['себзар', 'себзор', 'sebzar', 'sebzor', 'ц 17', 'ц 18', 'c 17', 'c 18']),
    area('Karakamysh-1/2', ['каракамыш 1 2', 'қорақамиш 1 2', 'qoraqamish 1 2', 'karakamish 1 2']),
    area('Karakamysh-2/3', ['каракамыш 2 3', 'қорақамиш 2 3', 'qoraqamish 2 3', 'karakamish 2 3']),
    area('Karakamysh-2/4', ['каракамыш 2 4', 'қорақамиш 2 4', 'qoraqamish 2 4', 'karakamish 2 4']),
    area('Karakamysh-2/5', ['каракамыш 2 5', 'қорақамиш 2 5', 'qoraqamish 2 5', 'karakamish 2 5']),
    area('Olympia', ['олимпия', 'olimpiya', 'olympia']), area('Vuzgorodok', ['вузгородок', 'вуз городок', 'vuzgorodok']),
    area('Medgorodok', ['медгородок', 'мед городок', 'medgorodok', 'TashMI-2', 'TashMI 2', 'ToshMI-2', 'ToshMI 2', 'ТашМИ-2', 'ТашМИ 2', 'ТошМИ-2', 'ТошМИ 2', 'новый ташми', 'новый ташми-2', 'янги ташми', 'yangi tashmi']),
    area('Chimbay', ['чимбай', 'чимбой', 'chimboy', 'chimbay']),
    area('Taxtapul', ['тахтапуль', 'тахтапул', 'taxtapul', 'takhtapul', 'Takhtapul']),
  ]),
  Mirobod: Object.freeze([
    area('Hospitalny', ['госпитальный', 'госпиталка', 'hospitalny']),
    area('Oltinkul', ['алтынкуль', 'олтинкул', 'олтинкўл', 'oltinkol', 'oltinkul']), area('Movarounnahr', ['мавераннахр', 'мовароуннахр', 'movarounnahr']),
  ]),
  'Mirzo Ulugbek': Object.freeze([
    area('Buyuk Ipak Yuli', ['буюк ипак йули', 'буюк ипак йўли', 'buyuk ipak yuli', "buyuk ipak yo'li", 'ц 1', 'c 1']),
    area('Alay', ['олой', 'алайский', 'алайск', 'alay', 'ц 2', 'c 2']),
    ...[1, 2, 3, 4].map((n) => area(`Karasu-${n}`, [`карасу ${n}`, `қорасув ${n}`, `qorasuv ${n}`, `karasu ${n}`], 'microdistrict')),
    area('Karasu-6', ['карасу 6', 'қорасув 6', 'qorasuv 6', 'karasu 6'], 'microdistrict'),
    area('Traktorsozlar-1', ['тракторсозлар 1', 'traktorsozlar 1', 'ттз 1', 'ttz 1']),
    area('Traktorsozlar-2', ['тракторсозлар 2', 'traktorsozlar 2', 'ттз 2', 'ttz 2']),
    area('TTZ-3', ['ттз 3', 'ttz 3']),
    area('Traktorsozlar-4', ['тракторсозлар 4', 'traktorsozlar 4', 'ттз 4', 'ttz 4']),
    area('Yalangach', ['ялангач', 'ялангач массив', 'yalangach', "yalang'och", "yalang'och dahasi", 'высоковольтный', 'массив высоковольтный']), area('Feruza', ['феруза', 'feruza']), area('Geofizika', ['геофизика', 'поселок геофизиков', 'geofizika']),
  ]),
  Uchtepa: Object.freeze([
    area('Lolazor', ['лолазор', 'lolazor']),
  ]),
  Sergeli: Object.freeze([
    area('Yangi Sergeli', ['янги сергели', 'yangi sergeli']),
    area('Uzgarish', ['узгарыш', 'ўзгариш', "o'zgarish", 'uzgarish']),
  ]),
  Chilanzar: Object.freeze([
    area('Nakkoshlik', ['наккошлык', 'наққошлик', 'naqqoshlik']), area('Al-Khorezmi-1', ['аль хорезми 1', 'ал хорезми 1', 'al xorazmiy 1', 'al khorezmi 1']),
    area('Beshagach', ['бешагач', "beshyog'och", 'beshagach']),
  ]),
  Shaykhantahur: Object.freeze([
    area('Labzak', ['лабзак', 'labzak', 'ц 13', 'c 13']), area('Khadra', ['хадра', 'xadra', 'khadra', 'ц 14', 'c 14']),
    area('Jangoh', ['джангох', 'жангох', 'jangoh', 'ц 15', 'c 15']), area('Karatash', ['караташ', 'қоратош', 'qoratosh', 'karatash']),
    area('Chorsu', ['чорсу', 'chorsu']), area('Beltepa', ['белтепа', 'beltepa']),
  ]),
  Yunusabad: Object.freeze([
    area('Kashgar', ['кашгар', 'қашқар', 'qashqar', 'kashgar', 'ц 4', 'c 4']), area('Qiyot', ['киёт', 'кият', 'қиёт', 'qiyot', 'kiyot', 'markaz 5', 's 5']),
    area('Minor', ['минор', 'minor', 'ц 6', 'c 6']), area('ToshGRES', ['ташгрэс', 'tashgres', 'TashGRES', 'toshgres']), area('Manzara', ['манзара', 'manzara']),
  ]),
  Yakkasaray: Object.freeze([
    area('Bashlyk', ['башлык', 'бошлиқ', 'boshliq', 'bashlyk']), area('Kushbegi', ['кушбеги', 'қушбеги', 'qushbegi', 'kushbegi']),
    area('Rakat', ['ракат', 'rakat']), area('Rakatboshi', ['ракатбоши', 'rakatboshi']),
  ]),
  Yangihayot: Object.freeze([
    area('Dustlik-1', ['дустлик 1', 'дўстлик 1', "do'stlik 1", 'dustlik 1'], 'microdistrict'),
    area('Dustlik-2', ['дустлик 2', 'дўстлик 2', "do'stlik 2", 'dustlik 2'], 'microdistrict'), area('Yangi Choshtepa', ['янги чоштепа', 'yangi choshtepa']), area('Sputnik', ['спутник', 'йўлдош', "yo'ldosh", 'yoldosh'], 'microdistrict'),
  ]),
  Yashnobod: Object.freeze([
    area('Kuylyuk Center', ['куйлюк центр', 'куйлик центр', "qo'yliq markaz", 'kuylyuk center']),
    ...[1, 2, 3, 4].map((n) => area(`Aviasozlar-${n}`, [`авиасозлар ${n}`, `городок авиастроителей ${n}`, `aviasozlar ${n}`])),
    ...[1, 2, 3, 4].map((n) => area(`Tuzel-${n}`, [`тузель ${n}`, `tuzel ${n}`])),
    area('Tashselmash', ['ташсельмаш', 'tashselmash']), area('Alimkent', ['алимкент', 'olimkent', 'alimkent']), area('Shohimardon', ['шохимардон', 'shohimardon']),
  ]),
});