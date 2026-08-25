import { aliasesToRegex, findCanonical } from './normalization.js';

const entity = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });

export const UZ_CITIES = Object.freeze([
  entity('Tashkent', { uzLatn: ['Toshkent'], uzCyrl: ['Тошкент'], ru: ['Ташкент'], en: ['Tashkent'] }, { country: 'UZ' }),
  entity('Samarkand', { uzLatn: ['Samarqand'], uzCyrl: ['Самарқанд'], ru: ['Самарканд'], en: ['Samarkand'] }, { country: 'UZ' }),
  entity('Bukhara', { uzLatn: ['Buxoro'], uzCyrl: ['Бухоро'], ru: ['Бухара'], en: ['Bukhara'] }, { country: 'UZ' }),
  entity('Namangan', { uzLatn: ['Namangan'], uzCyrl: ['Наманган'], ru: ['Наманган'], en: ['Namangan'] }, { country: 'UZ' }),
  entity('Andijan', { uzLatn: ['Andijon', 'Andijan', 'Anjon', 'Anjan'], uzCyrl: ['Андижон'], ru: ['Андижан'], en: ['Andijan'] }, { country: 'UZ' }),
  entity('Fergana', { uzLatn: ["Farg'ona", 'Farg‘ona', 'Fargʻona', 'Fargona'], uzCyrl: ['Фарғона'], ru: ['Фергана', 'Фаргана'], en: ['Fergana'] }, { country: 'UZ' }),
  entity('Nukus', { uzLatn: ['Nukus'], uzCyrl: ['Нукус'], ru: ['Нукус'], en: ['Nukus'] }, { country: 'UZ' }),
  entity('Qarshi', { uzLatn: ['Qarshi', 'Karshi'], uzCyrl: ['Қарши'], ru: ['Карши'], en: ['Qarshi', 'Karshi'] }, { country: 'UZ' }),
  entity('Urgench', { uzLatn: ['Urganch', 'Urgench'], uzCyrl: ['Урганч'], ru: ['Ургенч'], en: ['Urgench'] }, { country: 'UZ' }),
  entity('Khiva', { uzLatn: ['Xiva', 'Khiva'], uzCyrl: ['Хива'], ru: ['Хива'], en: ['Khiva'] }, { country: 'UZ' }),
  entity('Navoiy', { uzLatn: ['Navoiy', 'Navoi'], uzCyrl: ['Навоий'], ru: ['Навои'], en: ['Navoiy', 'Navoi'] }, { country: 'UZ' }),
  entity('Jizzakh', { uzLatn: ['Jizzax', 'Jizzakh'], uzCyrl: ['Жиззах'], ru: ['Джизак'], en: ['Jizzakh'] }, { country: 'UZ' }),
  entity('Termez', { uzLatn: ['Termiz', 'Termez'], uzCyrl: ['Термиз'], ru: ['Термез'], en: ['Termez'] }, { country: 'UZ' }),
  entity('Gulistan', { uzLatn: ['Guliston', 'Gulistan'], uzCyrl: ['Гулистон'], ru: ['Гулистан'], en: ['Gulistan'] }, { country: 'UZ' }),
  entity('Chirchiq', { uzLatn: ['Chirchiq', 'Chirchik'], uzCyrl: ['Чирчиқ'], ru: ['Чирчик'], en: ['Chirchiq'] }, { country: 'UZ' }),
]);

export const KZ_CITIES = Object.freeze([
  entity('Almaty', { kk: ['Алматы'], ru: ['Алматы', 'Алма-Ата', 'Алма Ата'], en: ['Almaty', 'Alma-Ata', 'Alma Ata'] }, { country: 'KZ' }),
  entity('Astana', { kk: ['Астана', 'Нұр-Сұлтан', 'Нұр Сұлтан'], ru: ['Астана', 'Нур-Султан', 'Нур Султан'], en: ['Astana', 'Nur-Sultan', 'Nur Sultan'] }, { country: 'KZ' }),
  entity('Shymkent', { kk: ['Шымкент'], ru: ['Шымкент', 'Чимкент'], en: ['Shymkent', 'Chimkent'] }, { country: 'KZ' }),
  entity('Karaganda', { kk: ['Қарағанды'], ru: ['Караганда'], en: ['Karaganda', 'Qaragandy'] }, { country: 'KZ' }),
  entity('Aktobe', { kk: ['Ақтөбе'], ru: ['Актобе'], en: ['Aktobe', 'Aqtobe'] }, { country: 'KZ' }),
  entity('Atyrau', { kk: ['Атырау'], ru: ['Атырау'], en: ['Atyrau'] }, { country: 'KZ' }),
  entity('Oral', { kk: ['Орал'], ru: ['Уральск', 'Орал'], en: ['Oral', 'Uralsk', 'Uralsk'] }, { country: 'KZ' }),
  entity('Taraz', { kk: ['Тараз'], ru: ['Тараз', 'Джамбул'], en: ['Taraz'] }, { country: 'KZ' }),
  entity('Pavlodar', { kk: ['Павлодар'], ru: ['Павлодар'], en: ['Pavlodar'] }, { country: 'KZ' }),
  entity('Semey', { kk: ['Семей'], ru: ['Семей', 'Семипалатинск'], en: ['Semey', 'Semipalatinsk'] }, { country: 'KZ' }),
  entity('Kostanay', { kk: ['Қостанай'], ru: ['Костанай'], en: ['Kostanay', 'Qostanay'] }, { country: 'KZ' }),
  entity('Kyzylorda', { kk: ['Қызылорда'], ru: ['Кызылорда'], en: ['Kyzylorda', 'Qyzylorda'] }, { country: 'KZ' }),
  entity('Aktau', { kk: ['Ақтау'], ru: ['Актау'], en: ['Aktau', 'Aqtau'] }, { country: 'KZ' }),
  entity('Oskemen', { kk: ['Өскемен'], ru: ['Усть-Каменогорск'], en: ['Oskemen', 'Ust-Kamenogorsk'] }, { country: 'KZ' }),
  entity('Petropavl', { kk: ['Петропавл'], ru: ['Петропавловск'], en: ['Petropavl', 'Petropavlovsk'] }, { country: 'KZ' }),
  entity('Turkistan', { kk: ['Түркістан'], ru: ['Туркестан'], en: ['Turkistan', 'Turkestan'] }, { country: 'KZ' }),
  entity('Taldykorgan', { kk: ['Талдықорған'], ru: ['Талдыкорган'], en: ['Taldykorgan', 'Taldyqorgan'] }, { country: 'KZ' }),
  entity('Kokshetau', { kk: ['Көкшетау'], ru: ['Кокшетау'], en: ['Kokshetau', 'Kokshetau'] }, { country: 'KZ' }),
]);

export const CITIES = Object.freeze([...UZ_CITIES, ...KZ_CITIES]);

export function canonicalCity(value, country = null) {
  const catalog = country ? CITIES.filter((item) => item.country === country) : CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}

export const TASHKENT_DISTRICTS = Object.freeze([
  entity('Almazar', { uzLatn: ['Olmazor', 'Olmazor tumani'], uzCyrl: ['Олмазор', 'Олмазор тумани'], ru: ['Алмазар', 'Алмазарский район'], en: ['Almazar', 'Olmazor district'] }),
  entity('Bektemir', { uzLatn: ['Bektemir', 'Bektemir tumani'], uzCyrl: ['Бектемир', 'Бектемир тумани'], ru: ['Бектемир', 'Бектемирский район'], en: ['Bektemir'] }),
  entity('Mirobod', { uzLatn: ['Mirobod', 'Mirobod tumani'], uzCyrl: ['Миробод', 'Миробод тумани'], ru: ['Мирабад', 'Мирабадский район'], en: ['Mirobod', 'Mirabad'] }),
  entity('Mirzo Ulugbek', { uzLatn: ["Mirzo Ulug'bek", 'Mirzo Ulug‘bek', 'Mirzo Ulugbek', "Mirzo Ulug'bek tumani"], uzCyrl: ['Мирзо Улуғбек', 'Мирзо Улуғбек тумани'], ru: ['Мирзо-Улугбекский район', 'Мирзо Улугбек'], en: ['Mirzo Ulugbek', 'Mirzo Ulughbek'] }),
  entity('Sergeli', { uzLatn: ['Sergeli', 'Sergeli tumani'], uzCyrl: ['Сергели', 'Сергели тумани'], ru: ['Сергелийский район', 'Сергели'], en: ['Sergeli'] }),
  entity('Uchtepa', { uzLatn: ['Uchtepa', 'Uchtepa tumani'], uzCyrl: ['Учтепа', 'Учтепа тумани'], ru: ['Учтепинский район', 'Учтепа'], en: ['Uchtepa'] }),
  entity('Chilanzar', { uzLatn: ['Chilonzor', 'Chilonzor tumani', 'Chilanzar'], uzCyrl: ['Чилонзор', 'Чилонзор тумани'], ru: ['Чиланзар', 'Чиланзарский район'], en: ['Chilanzar', 'Chilonzor'] }),
  entity('Shaykhantahur', { uzLatn: ['Shayxontohur', 'Shayxontohur tumani', 'Shaykhantahur'], uzCyrl: ['Шайхонтоҳур', 'Шайхонтоҳур тумани', 'Шайхонтохур'], ru: ['Шайхантахур', 'Шайхантахурский район'], en: ['Shaykhantahur', 'Shayxontohur'] }),
  entity('Yunusabad', { uzLatn: ['Yunusobod', 'Yunusobod tumani', 'Yunusabad'], uzCyrl: ['Юнусобод', 'Юнусобод тумани'], ru: ['Юнусабад', 'Юнусабадский район'], en: ['Yunusabad', 'Yunusobod'] }),
  entity('Yakkasaray', { uzLatn: ['Yakkasaroy', 'Yakkasaroy tumani', 'Yakkasaray'], uzCyrl: ['Яккасарой', 'Яккасарой тумани'], ru: ['Яккасарай', 'Яккасарайский район'], en: ['Yakkasaray', 'Yakkasaroy'] }),
  entity('Yangihayot', { uzLatn: ['Yangihayot', 'Yangihayot tumani'], uzCyrl: ['Янгиҳаёт', 'Янгиҳаёт тумани', 'Янгихаёт'], ru: ['Янгихаётский район', 'Янгихаёт'], en: ['Yangihayot'] }),
  entity('Yashnobod', { uzLatn: ['Yashnobod', 'Yashnobod tumani'], uzCyrl: ['Яшнобод', 'Яшнобод тумани'], ru: ['Яшнабад', 'Яшнабадский район'], en: ['Yashnobod', 'Yashnabad'] }),
]);

export function canonicalTashkentDistrict(value) {
  return findCanonical(value, TASHKENT_DISTRICTS, { partial: true })?.canonical || null;
}

function station(name, ru, en, line, aliases = []) {
  const allAliases = [...new Set([name, ru, en, ...aliases])];
  return Object.freeze({ name, line, labels: Object.freeze({ ru, en }), aliases: Object.freeze(allAliases), re: aliasesToRegex(allAliases) });
}

export const TASHKENT_METRO = Object.freeze([
  station('Buyuk Ipak Yoli', 'Буюк Ипак Йули', 'Buyuk Ipak Yoli', 'chilonzor', ['Buyuk Ipak Yuli', "Buyuk Ipak Yo'li", 'Buyuk Ipak Yo‘li', 'Buyuk Ipak Yoʻli', 'Буюк Ипак Йўли', 'БИЙ', 'Максим Горький', 'Максима Горького', 'Горького', 'Maxim Gorky', 'Maksim Gorkiy']),
  station('Pushkin', 'Пушкин', 'Pushkin', 'chilonzor'),
  station('Hamid Olimjon', 'Хамид Алимджан', 'Hamid Olimjon', 'chilonzor', ['Хамид Олимжон', 'Hamid Alimjan', 'Hamid Alimjon']),
  station('Amir Temur Xiyoboni', 'Амир Темур Хиёбони', 'Amir Temur Xiyoboni', 'chilonzor', ['Сквер', 'Amir Timur Square', 'Amir Temur']),
  station('Mustaqillik Maydoni', 'Мустакиллик майдони', 'Mustaqillik Maydoni', 'chilonzor', ['Мустақиллик майдони', 'Площадь Независимости', 'Independence Square']),
  station('Paxtakor', 'Пахтакор', 'Paxtakor', 'chilonzor', ['Pakhtakor']),
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

export const TASHKENT_METRO_BY_NAME = new Map(TASHKENT_METRO.map((item) => [item.name, item]));

export function canonicalTashkentMetro(value) {
  if (!value) return null;
  const direct = TASHKENT_METRO_BY_NAME.get(String(value));
  if (direct) return direct.name;
  return TASHKENT_METRO.find((item) => item.re.test(String(value)))?.name || null;
}

export function tashkentMetroLabels() {
  return Object.fromEntries(TASHKENT_METRO.map((item) => [item.name, { ru: item.labels.ru, en: item.labels.en, line: item.line }]));
}

const area = (name, aliases) => Object.freeze({ name, aliases: Object.freeze(aliases) });

export const TASHKENT_AREAS = Object.freeze({
  Almazar: Object.freeze([
    area('Sebzar', ['себзар', 'sebzar', 'ц 17', 'ц 18', 'c 17', 'c 18']),
    area('Karakamysh-1/2', ['каракамыш 1 2', 'қорақамиш 1 2', 'qoraqamish 1 2', 'karakamish 1 2']),
    area('Karakamysh-2/3', ['каракамыш 2 3', 'қорақамиш 2 3', 'qoraqamish 2 3', 'karakamish 2 3']),
    area('Karakamysh-2/4', ['каракамыш 2 4', 'қорақамиш 2 4', 'qoraqamish 2 4', 'karakamish 2 4']),
    area('Karakamysh-2/5', ['каракамыш 2 5', 'қорақамиш 2 5', 'qoraqamish 2 5', 'karakamish 2 5']),
    area('Olympia', ['олимпия', 'olimpiya', 'olympia']), area('Vuzgorodok', ['вузгородок', 'вуз городок', 'vuzgorodok']),
    area('Medgorodok', ['медгородок', 'мед городок', 'medgorodok']), area('Takhtapul', ['тахтапуль', 'тахтапул', 'taxtapul', 'takhtapul']),
    area('Chimbay', ['чимбай', 'chimboy', 'chimbay']),
  ]),
  Mirobod: Object.freeze([
    area('Hospitalny', ['госпитальный', 'госпиталка', 'hospitalny']), area('Lolazor', ['лолазор', 'lolazor']),
    area('Oltinkul', ['алтынкуль', 'олтинкул', 'олтинкўл', 'oltinkol', 'oltinkul']), area('Movarounnahr', ['мавераннахр', 'мовароуннахр', 'movarounnahr']),
  ]),
  'Mirzo Ulugbek': Object.freeze([
    area('Buyuk Ipak Yuli', ['буюк ипак йули', 'буюк ипак йўли', 'buyuk ipak yuli', "buyuk ipak yo'li", 'ц 1', 'c 1']),
    area('Alay', ['олой', 'алайский', 'алайск', 'alay', 'ц 2', 'c 2']),
    ...[1, 2, 3, 4, 6].map((n) => area(`Karasu-${n}`, [`карасу ${n}`, `қорасув ${n}`, `qorasuv ${n}`, `karasu ${n}`])),
    ...[1, 2, 3, 4].map((n) => area(`TTZ-${n}`, [`ттз ${n}`, `ttz ${n}`])),
    area('Yalangach', ['ялангач', 'yalangach', "yalang'och"]), area('Feruza', ['феруза', 'feruza']), area('Geofizika', ['геофизика', 'поселок геофизиков', 'geofizika']),
  ]),
  Sergeli: Object.freeze([
    area('Sergeli Car Bazaar', ['сергели машинный базар', 'сергели машина бозор', 'sergeli moshina bozor', 'sergile moshena bozor', 'sergele moshina bozor']),
    area('Yangi Sergeli', ['янги сергели', 'yangi sergeli']), area('Stroygorod', ['стройгород', 'stroygorod']),
  ]),
  Chilanzar: Object.freeze([
    area('Nakkoshlik', ['наккошлык', 'наққошлик', 'naqqoshlik']), area('Al-Khorezmi-1', ['аль хорезми 1', 'ал хорезми 1', 'al xorazmiy 1', 'al khorezmi 1']),
  ]),
  Shaykhantahur: Object.freeze([
    area('Labzak', ['лабзак', 'labzak', 'ц 13', 'c 13']), area('Khadra', ['хадра', 'xadra', 'khadra', 'ц 14', 'c 14']),
    area('Jangoh', ['джангох', 'жангох', 'jangoh', 'ц 15', 'c 15']), area('Karatash', ['караташ', 'қоратош', 'qoratosh', 'karatash']),
    area('Chorsu', ['чорсу', 'chorsu']), area('Beshagach', ['бешагач', "beshyog'och", 'beshagach']), area('Beltepa', ['белтепа', 'beltepa']),
  ]),
  Yunusabad: Object.freeze([
    area('Kashgar', ['кашгар', 'қашқар', 'qashqar', 'kashgar', 'ц 4', 'c 4']), area('Kiyot', ['киёт', 'қиёт', 'qiyot', 'kiyot', 'ц 5', 'c 5']),
    area('Minor', ['минор', 'minor', 'ц 6', 'c 6']), area('TashGRES', ['ташгрэс', 'tashgres']), area('Dehqonobod', ['дехконобод', 'деҳқонобод', 'dehqonobod']),
  ]),
  Yakkasaray: Object.freeze([
    area('Bashlyk', ['башлык', 'бошлиқ', 'boshliq', 'bashlyk']), area('Kushbegi', ['кушбеги', 'қушбеги', 'qushbegi', 'kushbegi']),
    area('Rakat', ['ракат', 'rakat']), area('Rakatboshi', ['ракатбоши', 'rakatboshi']), area('Glinka', ['глинка', 'glinka']),
  ]),
  Yangihayot: Object.freeze([
    area('Uzgarish', ['узгарыш', 'ўзгариш', "o'zgarish", 'uzgarish']), area('Dustlik-1', ['дустлик 1', 'дўстлик 1', "do'stlik 1", 'dustlik 1']),
    area('Dustlik-2', ['дустлик 2', 'дўстлик 2', "do'stlik 2", 'dustlik 2']), area('Yangi Choshtepa', ['янги чоштепа', 'yangi choshtepa']), area('Sputnik', ['спутник', 'йўлдош', "yo'ldosh", 'yoldosh']),
  ]),
  Yashnobod: Object.freeze([
    area('Kuylyuk Center', ['куйлюк центр', 'куйлик центр', "qo'yliq markaz", 'kuylyuk center']),
    ...[1, 2, 3, 4].map((n) => area(`Aviasozlar-${n}`, [`авиасозлар ${n}`, `городок авиастроителей ${n}`, `aviasozlar ${n}`])),
    ...[1, 2, 3, 4].map((n) => area(`Tuzel-${n}`, [`тузель ${n}`, `tuzel ${n}`])),
    area('Tashselmash', ['ташсельмаш', 'tashselmash']), area('Alimkent', ['алимкент', 'olimkent', 'alimkent']), area('Shohimardon', ['шохимардон', 'shohimardon']),
  ]),
});
