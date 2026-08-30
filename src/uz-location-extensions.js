import { aliasesToRegex } from './normalization.js';

function entry(name, aliases = [], meta = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({ ...meta, canonical: name, name, type: meta.type || meta.entityType, aliases: Object.freeze(all), re: aliasesToRegex(all) });
}

function entries(rows = [], defaults = {}) {
  return Object.freeze(rows.map((row) => {
    if (Array.isArray(row)) return entry(row[0], row.slice(1), defaults);
    const { name, aliases = [], ...meta } = row;
    return entry(name, aliases, { ...defaults, ...meta });
  }));
}

function city({ districts = [], mahallas = [], microdistricts = [], localAreas = [], developmentAreas = [], residentialComplexes = [], streets = [], landmarks = [], suburbs = [] }) {
  return Object.freeze({
    ...(districts.length ? { districts: entries(districts, { entityType: 'district', country: 'UZ' }) } : {}),
    ...(mahallas.length ? { mahallas: entries(mahallas, { entityType: 'mahalla', country: 'UZ' }) } : {}),
    ...(microdistricts.length ? { microdistricts: entries(microdistricts, { entityType: 'microdistrict', country: 'UZ' }) } : {}),
    ...(localAreas.length ? { localAreas: entries(localAreas, { entityType: 'local_area', country: 'UZ' }) } : {}),
    ...(developmentAreas.length ? { developmentAreas: entries(developmentAreas, { entityType: 'development_area', country: 'UZ' }) } : {}),
    ...(residentialComplexes.length ? { residentialComplexes: entries(residentialComplexes, { entityType: 'residential_complex', country: 'UZ' }) } : {}),
    ...(streets.length ? { streets: entries(streets, { entityType: 'street', country: 'UZ' }) } : {}),
    ...(landmarks.length ? { landmarks: entries(landmarks, { entityType: 'poi', country: 'UZ' }) } : {}),
    ...(suburbs.length ? { suburbs: entries(suburbs, { entityType: 'suburb', country: 'UZ' }) } : {}),
  });
}

const numberedMicrodistricts = (numbers) => numbers.map((n) => [`${n} microdistrict`, `${n} микрорайон`, `${n}-mikrorayon`, `${n} mikrorayon`, `${n} мкр`]);

const NUKUS_MFY_NAMES = Object.freeze([
  'Bes tobe','Jipek jolı','Juwazshı','Nurli bostan','Qarataw','Janabazar','Bereket','Qizil qum','Jayxun','Gúzar','Jeke terek','Isbilermenler aymagi','Nawbahar','Darbent','Nawkan baǵ','Temir jol','Nawriz','Abat makan',"Jasil bag'","Shig'is",'Uzin kol','Amanliq guzari','Allaniyaz Qaxraman','Shimbay guzari','Ata makan','Jolshilar','Qutli qonis','Dosliq guzari','Hawa joli',"Botanika bag'i",'Taslaq','Qum awil','Qutli makan','Aydin jol','Shimbay shayxana','Sarbinaz','Eliabat','Shayirlar awili','Nur','Tungish qonis','Qurilisshi','Almazar','Garezsizlik','Gulzar','Ornek','Jana zaman','Qos kol','Aq otaw','Baqshiliq','Vatanparvar','Dosliq','Tinishliq','Xaliqlar dosligi','Anasay','Boz awil','Jas awlad','Qos bulaq','Jiydeli baysin','Aq jagis','Kok ozek','Amudarya','Tele oray','Shadli awil','Kattagar','Samanbay','Altin jagis','Gone qala','Turan','Qumbiz awil','Nawpir','Bayterek',
]);

const NUKUS_MFY_ALIASES = Object.freeze({
  'Jipek jolı': ['Jipek joli','Jipek Joli','Жипек жолы','Жипек жол','Шёлковый путь'],
  'Qizil qum': ['Qizilqum','Qizil Qum','Кызылкум','Қызылқум','Кизилкум'],
  Jayxun: ['Jayhun','Jeyhun','Джейхун','Жайхун'],
  Nawbahar: ['Navbahor','Navbahar','Навбахор','Навбахар'],
  Nawriz: ["Navro'z",'Navruz','Навруз','Наўрыз'],
  'Temir jol': ["Temir yo'l",'Темир жол','Темир йўл','Железнодорожный'],
  Dosliq: ["Do'stlik",'Dustlik','Дослык','Дустлик','Дўстлик'],
  "Shig'is": ['Shygys','Sharq','Шығыс','Шарк','Восток','Восточный'],
  "Jasil bag'": ['Jasıl baǵ',"Yashil bog'",'Яшил бог','Зелёный сад'],
  Garezsizlik: ['Gárezsizlik','Mustaqillik','Ғәрезсизлик','Независимость'],
  'Xaliqlar dosligi': ["Xalqlar do'stligi",'Халклар дустлиги','Халықлар дослығы','Дружба народов'],
  "Botanika bag'i": ["Botanika bog'i",'Ботаника багы','Ботанический сад'],
  Samanbay: ['Samanboy','Саманбай','Саманбой'],
  Bayterek: ['Baiterek','Байтирек','Байтерек','Бәйтерек'],
});

const nukusMahallas = NUKUS_MFY_NAMES.map((name) => ({
  name,
  aliases: [name, ...(NUKUS_MFY_ALIASES[name] || []), `${name} MFY`, `${name} mahallasi`],
  language: 'kaa_lat',
  confidence: 'official',
}));

export const UZ_LOCATION_EXTENSIONS = Object.freeze({
  Tashkent: city({
    mahallas: [
      { name: 'Khastimam', aliases: ['Хастимом'], parent: 'Almazar' },
      { name: 'Yangi Tashkent', aliases: ['Yangi Toshkent','Янги Тошкент','Янги Ташкент'], parent: 'Almazar' },
      { name: 'Umid', aliases: ['Умид'], parent: 'Almazar' },
      { name: 'Kashgar', aliases: ['Qashqar','Кашгар'], parent: 'Yunusabad' },
      { name: 'Buyuk Turan', aliases: ['Buyuk Turon','Буюк Турон','Буюк Туран'], parent: 'Yunusabad' },
      { name: 'Minor', aliases: ['Минор'], parent: 'Yunusabad' },
      { name: 'Labzak', aliases: ['Лабзак'], parent: 'Shaykhantahur' },
      { name: 'Rakat', aliases: ['Ракат'], parent: 'Yakkasaray' },
      { name: 'Belaryk', aliases: ['Беларык'], parent: 'Yakkasaray' },
      { name: 'Shahjahan', aliases: ['Shahjahon','Шахжахон'], parent: 'Yakkasaray' },
      { name: 'Mukimiy', aliases: ['Muqimiy','Мукими','Муқимий'], parent: 'Yakkasaray' },
      { name: 'Birlashgan', aliases: ['Бирлашган'], parent: 'Yashnobod' },
      { name: 'Nadyra', aliases: ['Nodira','Нодира'], parent: 'Yashnobod' },
      { name: 'Makhmur', aliases: ['Maxmur','Махмур'], parent: 'Yashnobod' },
      { name: 'Munavvarqori', aliases: ['Munavvar Qori','Мунаввар Қори','Мунаввар Кори'], parent: 'Mirzo Ulugbek' },
      { name: 'Beshkapa', aliases: ['Бешкапа'], parent: 'Mirzo Ulugbek' },
      { name: 'Chashtepa', aliases: ['Чаштепа'], parent: 'Yangihayot' },
      { name: 'Yangi Darhan', aliases: ['Yangi Darxon','Янги Дархан','Янги Дархон'], parent: 'Yangihayot' },
      { name: 'Ahmad Yugnakiy', aliases: ['Ahmad Yugnaki','Ahmad Yugnakiy mahallasi','Аҳмад Югнакий','Ахмад Югнаки'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Humoyun', aliases: ['Humoyun mahallasi','Ҳумоюн','Хумаюн'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: "Bog'ko'cha", aliases: ['Bog‘ko‘cha','Bogʻkoʻcha','Bogkocha','Боғкўча','Богкуча'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Gulobod', aliases: ['Gulabad','Гулобод','Гулабад'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Qalqon', aliases: ['Qalqon mahallasi','Қалқон','Қалқон маҳалласи','Калкон','махалля Калкон'], labels: { en: 'Qalqon', uz: 'Qalqon mahallasi', ru: 'Калкон' }, parent: 'Yashnobod', confidence: 'official' },
      { name: "Bog'bon", aliases: ["Bog'bon mahallasi",'Bog‘bon','Bogʻbon','Bogbon','Боғбон','Боғбон маҳалласи','Богбон','махалля Богбон'], labels: { en: "Bog'bon", uz: "Bog'bon mahallasi", ru: 'Богбон' }, parent: 'Yashnobod', confidence: 'official' },
      { name: 'Shifokorlar', aliases: ['Shifokorlar mahallasi','Шифокорлар','Шифокорлар махалла'], parent: 'Almazar', confidence: 'official' },
      { name: 'Taraqqiyot', aliases: ['Taraqqiyot mahallasi','Тараққиёт','Тараккиёт'], parent: 'Almazar', confidence: 'official' },
      { name: "Chamanbog'", aliases: ['Chamanbog‘','Chamanbogʻ','Chamanbog mahallasi','Чаманбоғ','Чаманбог'], parent: 'Almazar', confidence: 'official' },
      { name: 'Asalobod', aliases: ['Asalobod mahallasi','Asalabad','Асалобод','Асалабад'], parent: 'Yashnobod', confidence: 'official' },
      { name: "Sug'diyona", aliases: ["Sug'diyona mahallasi",'Sug‘diyona','Sugʻdiyona','Sugdiyona','Суғдиёна','Суғдиёна маҳалласи','Согдиана','махалля Согдиана'], labels: { en: "Sug'diyona", uz: "Sug'diyona mahallasi", ru: 'махалля Согдиана' }, parent: 'Sergeli', confidence: 'official' },
      { name: 'Olimpiya', aliases: ['Olimpiya mahallasi','Olympia','Олимпия','Олимпия махалла'], parent: 'Almazar', confidence: 'official' },
      { name: 'Sebzor', aliases: ['Sebzor mahallasi','Sebzar','Себзор','Себзар'], parent: 'Almazar', confidence: 'official' },
      { name: 'Yangi Choshtepa', aliases: ['Yangi Choshtepa mahallasi','Янги Чоштепа','Янги Чоштепа махалла'], parent: 'Yangihayot', confidence: 'official' },
      { name: 'Taxtapul', aliases: ['Taxtapul mahallasi','Takhtapul','Тахтапул','Тахтапуль'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Ibn Sino', aliases: ['Ibn Sino mahallasi','Ибн Сино','Ибн Сино махалла'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Traktorsozlar', aliases: ['Traktorsozlar mahallasi','Тракторсозлар','Тракторсозлар махалла'], parent: 'Mirzo Ulugbek', confidence: 'official' },
    ],
    microdistricts: [
      ['Qorasuv', 'Qorasuv massivi', 'Korasuv massivi', 'Корасув Массиви', 'Корасув массиви', 'Карасу массив', 'Карасу массиви', 'Қорасув массиви'],
      { name: 'Sergeli-3A', aliases: ['Sergeli 3A','Сергели-3А','Сергели 3А','Сергели 3А массив','Сергели-3А массив'], parent: 'Yangihayot' },
      { name: 'Sergeli-5A', aliases: ['Sergeli 5A','Сергели-5А','Сергели 5А','Сергели 5А массив','Сергели-5А массив'], parent: 'Yangihayot' },
      { name: 'Sergeli-7A', aliases: ['Sergeli 7A','Сергели-7А','Сергели 7А','Сергели 7А массив','Сергели-7А массив'], parent: 'Yangihayot' },
    ],
    localAreas: [
      { name: 'Yangidarhan-1', aliases: ['Yangi Darhan-1','Yangi Darxon-1','Янги Дархан-1','Янги Дархон-1'], parent: 'Yangihayot' },
      { name: 'Yangidarhan-2', aliases: ['Yangi Darhan-2','Yangi Darxon-2','Янги Дархан-2','Янги Дархон-2'], parent: 'Yangihayot' },
      { name: 'Suvsoz-1', aliases: ['Suvsoz 1','Suvsoz-1 mavzesi','Сувсоз-1','Сувсоз 1','Водник-1','Водник 1','Сувсоз-1 мавзеси'], labels: { en: 'Suvsoz-1', uz: 'Suvsoz-1 mavzesi', ru: 'Сувсоз-1' }, parent: 'Bektemir', confidence: 'official' },
      { name: 'Suvsoz-2', aliases: ['Suvsoz 2','Suvsoz-2 mavzesi','Сувсоз-2','Сувсоз 2','Водник-2','Водник 2','Сувсоз-2 мавзеси'], labels: { en: 'Suvsoz-2', uz: 'Suvsoz-2 mavzesi', ru: 'Сувсоз-2' }, parent: 'Bektemir', confidence: 'official' },
      { name: 'Suvsoz-3', aliases: ['Suvsoz 3','Suvsoz-3 mavzesi','Сувсоз-3','Сувсоз 3','Водник-3','Водник 3','Сувсоз-3 мавзеси'], labels: { en: 'Suvsoz-3', uz: 'Suvsoz-3 mavzesi', ru: 'Сувсоз-3' }, parent: 'Bektemir', confidence: 'official' },
      { name: 'Suvsoz-4', aliases: ['Suvsoz 4','Suvsoz-4 mavzesi','Сувсоз-4','Сувсоз 4','Сувсоз-4 мавзеси'], labels: { en: 'Suvsoz-4', uz: 'Suvsoz-4 mavzesi', ru: 'Сувсоз-4' }, parent: 'Bektemir', confidence: 'official' },
      { name: 'Suvsoz-5', aliases: ['Suvsoz 5','Suvsoz-5 mavzesi','Сувсоз-5','Сувсоз 5','Сувсоз-5 мавзеси'], labels: { en: 'Suvsoz-5', uz: 'Suvsoz-5 mavzesi', ru: 'Сувсоз-5' }, parent: 'Bektemir', confidence: 'official' },
      { name: "Bo'z-1", aliases: ['Bo‘z-1','Boʻz-1','Boz-1','Boz 1','Бўз-1','Буз-1','Буз 1'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: "Bo'z-2", aliases: ['Bo‘z-2','Boʻz-2','Boz-2','Boz 2','Бўз-2','Буз-2','Буз 2'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Ahmad Yugnakiy', aliases: ['Ahmad Yugnaki dahasi','Ahmad Yugnakiy dahasi','Аҳмад Югнакий даҳаси','Ахмад Югнаки массив','Солнечный массив','массив Солнечный'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Humoyun', aliases: ['Humoyun dahasi','Ҳумоюн даҳаси','Хумаюн массив','Ясный массив','массив Ясный'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Feruza', aliases: ['Feruza dahasi','Феруза массив','Феруза массиви','Северо-Восток','Северо Восток','Северо-Восток массив'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Feruza-2', aliases: ['Feruza 2','Феруза-2','Феруза 2','Феруза 2 массив'], parent: 'Mirzo Ulugbek', confidence: 'colloquial' },
      { name: 'Feruza-3', aliases: ['Feruza 3','Феруза-3','Феруза 3','Феруза 3 массив'], parent: 'Mirzo Ulugbek', confidence: 'colloquial' },
      { name: 'Quruvchi', aliases: ['Quruvchi dahasi','Қурувчи','Курувчи','Курувчи массив'], parent: 'Sergeli', confidence: 'official' },
      { name: "Bog'ko'cha", aliases: ['Bog‘ko‘cha mavzesi','Bogʻkoʻcha mavzesi','Bogkocha mavzesi','Боғкўча массив','Богкуча массив','Ц-27','Ц 27','C-27','C 27'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Gulobod', aliases: ['Gulobod mavzesi','Gulabad mavzesi','Гулобод массив','Гулабад массив','Ц-26','Ц 26','C-26','C 26'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: "Beshqo'rg'on-1", aliases: ['Beshqo‘rg‘on-1','Beshqoʻrgʻon-1','Beshqorgon-1','Beshkurgan-1','Бешқўрғон-1','Бешкурган-1'], parent: 'Almazar', confidence: 'official' },
      { name: "Beshqo'rg'on-2", aliases: ['Beshqo‘rg‘on-2','Beshqoʻrgʻon-2','Beshqorgon-2','Beshkurgan-2','Бешқўрғон-2','Бешкурган-2'], parent: 'Almazar', confidence: 'official' },
      { name: "Beshqo'rg'on-3", aliases: ['Beshqo‘rg‘on-3','Beshqoʻrgʻon-3','Beshqorgon-3','Beshkurgan-3','Бешқўрғон-3','Бешкурган-3'], parent: 'Almazar', confidence: 'official' },
      { name: "Beshqo'rg'on-4", aliases: ['Beshqo‘rg‘on-4','Beshqoʻrgʻon-4','Beshqorgon-4','Beshkurgan-4','Бешқўрғон-4','Бешкурган-4'], parent: 'Almazar', confidence: 'official' },
      { name: "Qo'yliq-1", aliases: ['Qo‘yliq-1','Qoʻyliq-1','Qoyliq-1','Qoyliq 1','Qo‘yliq-1 mavzesi','Қўйлиқ-1','Қўйлиқ 1','Қўйлиқ-1 мавзеси','Куйлюк-1','Куйлюк 1','Куйлик-1','Куйлик 1'], labels: { en: "Qo'yliq-1", uz: 'Qo‘yliq-1 mavzesi', ru: 'Куйлюк-1' }, parent: 'Mirobod', confidence: 'official' },
      { name: "Qo'yliq-2", aliases: ['Qo‘yliq-2','Qoʻyliq-2','Qoyliq-2','Qoyliq 2','Qo‘yliq-2 mavzesi','Қўйлиқ-2','Қўйлиқ 2','Қўйлиқ-2 мавзеси','Куйлюк-2','Куйлюк 2','Куйлик-2','Куйлик 2'], labels: { en: "Qo'yliq-2", uz: 'Qo‘yliq-2 mavzesi', ru: 'Куйлюк-2' }, parent: 'Mirobod', confidence: 'official' },
      { name: "Qo'yliq-3", aliases: ['Qo‘yliq-3','Qoʻyliq-3','Qoyliq-3','Qoyliq 3','Qo‘yliq-3 mavzesi','Қўйлиқ-3','Қўйлиқ 3','Қўйлиқ-3 мавзеси','Куйлюк-3','Куйлюк 3','Куйлик-3','Куйлик 3'], labels: { en: "Qo'yliq-3", uz: 'Qo‘yliq-3 mavzesi', ru: 'Куйлюк-3' }, parent: 'Mirobod', confidence: 'official' },
      { name: "Qo'yliq-4", aliases: ['Qo‘yliq-4','Qoʻyliq-4','Qoyliq-4','Qoyliq 4','Qo‘yliq-4 mavzesi','Қўйлиқ-4','Қўйлиқ 4','Қўйлиқ-4 мавзеси','Куйлюк-4','Куйлюк 4','Куйлик-4','Куйлик 4'], labels: { en: "Qo'yliq-4", uz: 'Qo‘yliq-4 mavzesi', ru: 'Куйлюк-4' }, parent: 'Mirobod', confidence: 'official' },
      { name: "Qo'yliq-5", aliases: ['Qo‘yliq-5','Qoʻyliq-5','Qoyliq-5','Qoyliq 5','Qo‘yliq-5 mavzesi','Қўйлиқ-5','Қўйлиқ 5','Қўйлиқ-5 мавзеси','Куйлюк-5','Куйлюк 5','Куйлик-5','Куйлик 5'], labels: { en: "Qo'yliq-5", uz: 'Qo‘yliq-5 mavzesi', ru: 'Куйлюк-5' }, parent: 'Sergeli', confidence: 'official' },
      { name: "Qo'yliq-6", aliases: ['Qo‘yliq-6','Qoʻyliq-6','Qoyliq-6','Qoyliq 6','Qo‘yliq-6 mavzesi','Қўйлиқ-6','Қўйлиқ 6','Қўйлиқ-6 мавзеси','Куйлюк-6','Куйлюк 6','Куйлик-6','Куйлик 6'], labels: { en: "Qo'yliq-6", uz: 'Qo‘yliq-6 mavzesi', ru: 'Куйлюк-6' }, parent: 'Sergeli', confidence: 'official' },
      { name: "Qo'yliq-7", aliases: ['Qo‘yliq-7','Qoʻyliq-7','Qoyliq-7','Qoyliq 7','Qo‘yliq-7 mavzesi','Қўйлиқ-7','Қўйлиқ 7','Қўйлиқ-7 мавзеси','Куйлюк-7','Куйлюк 7','Куйлик-7','Куйлик 7'], labels: { en: "Qo'yliq-7", uz: 'Qo‘yliq-7 mavzesi', ru: 'Куйлюк-7' }, parent: 'Sergeli', confidence: 'official' },
      { name: 'Parkent-Riyoziy', aliases: ['Parkent Riyoziy','Parkent-Riyoziy mavzesi','Riyoziy','Mavlono Riyoziy','Мавлоно Риёзи','Риёзий','Риезий','Паркент Риёзий','Паркент-Риёзий','Паркент-Риёзий массив','Паркент-Риёзий мавзеси'], labels: { en: 'Parkent-Riyoziy', uz: 'Parkent-Riyoziy mavzesi', ru: 'Паркент-Риёзий' }, parent: 'Yashnobod', confidence: 'official' },
      { name: 'Parkent-Siolkovskiy', aliases: ['Parkent Siolkovskiy','Parkent Tsiolkovskiy','Parkent-Siolkovskiy mavzesi','Parkent-Tsiolkovskiy','Siolkovskiy','Tsiolkovskiy','Сиолковский','Сиолковский массив','Циолковский массив','Паркент Сиолковский','Паркент-Сиолковский','Паркент-Сиолковский массив','Паркент-Сиолковский мавзеси'], labels: { en: 'Parkent-Siolkovskiy', uz: 'Parkent-Siolkovskiy mavzesi', ru: 'Паркент-Сиолковский' }, parent: 'Yashnobod', confidence: 'official' },
      { name: 'Qalqon', aliases: ['Qalqon mavzesi','Қалқон мавзе','Қалқон мавзеси','Калкон массив','Harbiylar-58a','Harbiylar 58a','Harbiylar-58a shaharchasi','Ҳарбийлар-58а','Ҳарбийлар-58а шаҳарчаси','Харбийлар-58а'], labels: { en: 'Qalqon', uz: 'Qalqon mavzesi', ru: 'массив Калкон' }, parent: 'Yashnobod', confidence: 'official' },
      { name: "Bog'bon", aliases: ['Bog‘bon mavzesi','Bogʻbon mavzesi','Bogbon mavzesi','Боғбон мавзе','Боғбон мавзеси','Богбон массив','Normuhammedov mavzesi','Normuhammedov','Нормуҳаммедов','Нормуҳаммедов мавзеси','Нормухаммедов','Нормухаммедов массив'], labels: { en: "Bog'bon", uz: "Bog'bon mavzesi", ru: 'массив Богбон' }, parent: 'Yashnobod', confidence: 'official' },
      { name: 'Akademgorodok', aliases: ['Академгородок','Академ городок','Akademgorodok','Akadem shaharchasi'], parent: 'Mirzo Ulugbek', confidence: 'colloquial' },
      { name: 'C-7', aliases: ['Ц-7','Ц 7','C 7','массив Ц-7','Ц-7 массив'], parent: 'Mirobod', confidence: 'colloquial' },
      { name: 'Aviasozlar-1', aliases: ['Aviasozlar 1','Авиасозлар-1','Авиасозлар 1','Городок авиастроителей-1','Лисунова-1','Лисунова 1','Lisunova-1','Lisunova 1'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Aviasozlar-2', aliases: ['Aviasozlar 2','Авиасозлар-2','Авиасозлар 2','Городок авиастроителей-2','Лисунова-1а','Лисунова 1а','Lisunova-1A','Lisunova 1A'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Aviasozlar-3', aliases: ['Aviasozlar 3','Авиасозлар-3','Авиасозлар 3','Городок авиастроителей-3','Лисунова-2','Лисунова 2','Lisunova-2','Lisunova 2'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Aviasozlar-4', aliases: ['Aviasozlar 4','Авиасозлар-4','Авиасозлар 4','Городок авиастроителей-4','Лисунова-4','Лисунова 4','Lisunova-4','Lisunova 4'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Minora', aliases: ['Minora mavzesi','Минора','Минора массив'], parent: 'Almazar', confidence: 'official' },
      { name: 'Guruchariq', aliases: ['Guruchariq mavzesi','Guruch ariq','Гуручариқ','Гуручариқ мавзеси','Гуручарик','массив Гуручарик','S-22','S 22','С-22','С 22','C-22','C 22','Markaz-22','Markaz 22','Марказ-22','Марказ 22'], labels: { en: 'Guruchariq', uz: 'Guruchariq mavzesi', ru: 'массив Гуручарик' }, parent: 'Almazar', confidence: 'official' },
      { name: 'Muxbir', aliases: ['Muxbir mavzesi','Мухбир','Мухбир массив'], parent: 'Almazar', confidence: 'official' },
      { name: 'Chuqursoy', aliases: ['Chuqursoy mavzesi','Чуқурсой','Чукурсай','Чукурсой'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shimoliy Olmazor', aliases: ['Shimoliy Olmazor dahasi','Шимолий Олмазор'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shimoliy Olmazor-1', aliases: ['Shimoliy Olmazor 1','Шимолий Олмазор-1','Шимолий Олмазор 1'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shimoliy Olmazor-2', aliases: ['Shimoliy Olmazor 2','Шимолий Олмазор-2','Шимолий Олмазор 2'], parent: 'Almazar', confidence: 'official' },
      { name: 'Taraqqiyot-1', aliases: ['Taraqqiyot 1','Taraqqiyot-1 mavzesi','Тараққиёт-1','Тараккиёт-1'], parent: 'Almazar', confidence: 'official' },
      { name: 'Taraqqiyot-2', aliases: ['Taraqqiyot 2','Taraqqiyot-2 mavzesi','Тараққиёт-2','Тараккиёт-2'], parent: 'Almazar', confidence: 'official' },
      { name: 'Taraqqiyot-3', aliases: ['Taraqqiyot 3','Taraqqiyot-3 mavzesi','Тараққиёт-3','Тараккиёт-3'], parent: 'Almazar', confidence: 'official' },
      { name: 'Taraqqiyot-4', aliases: ['Taraqqiyot 4','Taraqqiyot-4 mavzesi','Тараққиёт-4','Тараккиёт-4'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-1', aliases: ['Shifokorlar 1','Shifokorlar-1 mavzesi','Шифокорлар-1','Шифокорлар 1','TashGosMI','ТашГосМИ'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-2', aliases: ['Shifokorlar 2','Shifokorlar-2 mavzesi','Шифокорлар-2','Шифокорлар 2'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-3', aliases: ['Shifokorlar 3','Shifokorlar-3 mavzesi','Шифокорлар-3','Шифокорлар 3'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-4', aliases: ['Shifokorlar 4','Shifokorlar-4 mavzesi','Шифокорлар-4','Шифокорлар 4','ToshGU-ToshPI','ТошГУ-ТошПИ'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-5', aliases: ['Shifokorlar 5','Shifokorlar-5 mavzesi','Шифокорлар-5','Шифокорлар 5'], parent: 'Almazar', confidence: 'official' },
      { name: 'Shifokorlar-6', aliases: ['Shifokorlar 6','Shifokorlar-6 mavzesi','Шифокорлар-6','Шифокорлар 6'], parent: 'Almazar', confidence: 'official' },
      { name: 'Beruniy-B1', aliases: ['Beruniy B1','Beruniy B-1','Beruniy-B1 mavzesi','Beruniy B1 mavzesi','Беруний-Б1','Беруний Б1','Беруний-Б1 мавзе','Беруний-Б1 массив'], labels: { en: 'Beruniy-B1', uz: 'Beruniy-B1 mavzesi', ru: 'Беруний-Б1' }, parent: 'Almazar', confidence: 'official' },
      { name: 'Beruniy-B3', aliases: ['Beruniy B3','Beruniy B-3','Beruniy-B3 mavzesi','Beruniy B3 mavzesi','Beruniy-3','Beruniy 3','Beruniy-3 mavzesi','Beruniy 3 dahasi','Беруни-3','Беруни 3','Беруний-3','Беруний 3','Беруний-Б3','Беруний Б3','Беруний-Б3 мавзе','Беруний-Б3 массив'], labels: { en: 'Beruniy-B3', uz: 'Beruniy-B3 mavzesi', ru: 'Беруний-Б3' }, parent: 'Almazar', confidence: 'official' },
      { name: "Chamanbog'", aliases: ['Chamanbog‘ mavzesi','Chamanbogʻ mavzesi','Chamanbog mavzesi','Чаманбоғ мавзе','Чаманбог массив'], parent: 'Almazar', confidence: 'official' },
      { name: 'Irrigator', aliases: ['Irrigator mavzesi','Ирригатор','массив Ирригатор','Ирригатор массив'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Parkent', aliases: ['Parkent dahasi','Паркент даха','Паркент массив'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Markaz-12', aliases: ['Markaz 12','Markaz-12 mavzesi','Марказ-12','Ц-12','Ц12','Ц 12','C-12','C12','C 12','Лабзак Ц-12','Лабзак Ц12'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: "So'lim", aliases: ['So‘lim','Soʻlim','Solim','So‘lim mavzesi','Soʻlim mavzesi','Сўлим','Сулим'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Asalobod-1', aliases: ['Asalobod 1','Asalobod-1 mavzesi','Asalabad-1','Asalabad 1','Асалобод-1','Асалабад-1'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Asalobod-2', aliases: ['Asalobod 2','Asalobod-2 mavzesi','Asalabad-2','Asalabad 2','Асалобод-2','Асалабад-2'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'ToshGRES', aliases: ['ToshGRES mavzesi','Tosh GRES','ТашГРЭС','Таш ГРЭС','Ташгрэс массив'], parent: 'Yunusabad', confidence: 'official' },
      { name: "Sug'diyona", aliases: ['Sug‘diyona mavzesi','Sugʻdiyona mavzesi','Sugdiyona mavzesi','Суғдиёна мавзе','Суғдиёна мавзеси','Согдиана массив','массив Согдиана'], labels: { en: "Sug'diyona", uz: "Sug'diyona mavzesi", ru: 'массив Согдиана' }, parent: 'Sergeli', confidence: 'official' },
      { name: 'Karakamysh-1/2', aliases: ['Karakamysh 1/2','Karakamysh 1 2','Каракамыш-1/2','Каракамыш 1/2','Қорақамиш 1/2'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Karakamysh-2/3', aliases: ['Karakamysh 2/3','Karakamysh 2 3','Каракамыш-2/3','Каракамыш 2/3','Қорақамиш 2/3'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Karakamysh-2/4', aliases: ['Karakamysh 2/4','Karakamysh 2 4','Каракамыш-2/4','Каракамыш 2/4','Қорақамиш 2/4'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Karakamysh-2/5', aliases: ['Karakamysh 2/5','Karakamysh 2 5','Каракамыш-2/5','Каракамыш 2/5','Қорақамиш 2/5'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Chimbay', aliases: ['Chimboy','Чимбай'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Medgorodok', aliases: ['Медгородок','Мед городок'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Vuzgorodok', aliases: ['Вузгородок','Вуз городок'], parent: 'Almazar', confidence: 'verified' },
      { name: 'Hospitalny', aliases: ['Госпитальный','Госпиталка','Gospital','Gospital dahasi'], parent: 'Mirobod', confidence: 'verified' },
      { name: 'Movarounnahr', aliases: ['Мавераннахр','Мовароуннахр','Movarounnahr dahasi'], parent: 'Mirobod', confidence: 'verified' },
      { name: 'Yalangach', aliases: ['Ялангач',"Yalang'och"], parent: 'Mirzo Ulugbek', confidence: 'verified' },
      { name: 'Yangi Sergeli', aliases: ['Янги Сергели','Yangi Sergeli massivi'], parent: 'Sergeli', confidence: 'verified' },
      { name: 'Nakkoshlik', aliases: ['Наккошлык','Наққошлик','Naqqoshlik'], parent: 'Chilanzar', confidence: 'verified' },
      { name: 'Beshagach', aliases: ['Бешагач',"Beshyog'och"], parent: 'Chilanzar', confidence: 'verified' },
      { name: 'Beltepa', aliases: ['Белтепа'], parent: 'Shaykhantahur', confidence: 'verified' },
      { name: 'Jangoh', aliases: ['Janggoh','Джангох','Жангох'], parent: 'Shaykhantahur', confidence: 'verified' },
      { name: 'Karatash', aliases: ['Qoratosh','Қоратош','Караташ'], parent: 'Shaykhantahur', confidence: 'verified' },
      { name: 'Bashlyk', aliases: ['Башлык','Boshliq','Бошлиқ'], parent: 'Yakkasaray', confidence: 'verified' },
      { name: 'Kushbegi', aliases: ['Кушбеги','Qushbegi','Қушбеги'], parent: 'Yakkasaray', confidence: 'verified' },
      { name: 'Alimkent', aliases: ['Алимкент','Olimkent'], parent: 'Yashnobod', confidence: 'verified' },
      { name: 'Tuzel-1', aliases: ['Tuzel 1','Тузель-1','Тузель 1'], parent: 'Yashnobod', confidence: 'verified' },
      { name: 'Tuzel-2', aliases: ['Tuzel 2','Тузель-2','Тузель 2'], parent: 'Yashnobod', confidence: 'verified' },
      { name: 'Tuzel-3', aliases: ['Tuzel 3','Тузель-3','Тузель 3'], parent: 'Yashnobod', confidence: 'verified' },
      { name: 'Tuzel-4', aliases: ['Tuzel 4','Тузель-4','Тузель 4'], parent: 'Yashnobod', confidence: 'verified' },
      { name: 'Olimpiya', aliases: ['Olimpiya mavzesi','Olympia','Олимпия','Олимпия массив'], parent: 'Almazar', confidence: 'official' },
      { name: 'Sebzor', aliases: ['Sebzor mavzesi','Sebzar','Себзор','Себзар','Ц-17','Ц-18','C-17','C-18'], parent: 'Almazar', confidence: 'official' },
      { name: 'Tashselmash', aliases: ['Toshselmash','Toshselmash mavzesi','Ташсельмаш','Тошсельмаш'], parent: 'Yashnobod', confidence: 'official' },
      { name: 'Yangi Choshtepa', aliases: ['Yangi Choshtepa mavzesi','Янги Чоштепа','Янги Чоштепа массив'], parent: 'Yangihayot', confidence: 'official' },
      { name: 'Taxtapul', aliases: ['Taxtapul mavzesi','Takhtapul','Тахтапул','Тахтапуль','Тахтапул массив'], parent: 'Almazar', confidence: 'official' },
      { name: 'Manzara', aliases: ['Manzara mavzesi','Манзара','Манзара массив'], parent: 'Yunusabad', confidence: 'official' },
      { name: 'Qiyot', aliases: ['Qiyot mavzesi','Kiyot','Киёт','Кият','Қиёт','Markaz-5','Markaz 5','S-5','S 5'], parent: 'Yunusabad', confidence: 'official' },
      { name: 'Ibn Sino-1', aliases: ['Ibn Sino 1','Ibn Sino-1 mavzesi','Ибн Сино-1','Ибн Сино 1'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Ibn Sino-2', aliases: ['Ibn Sino 2','Ibn Sino-2 mavzesi','Ибн Сино-2','Ибн Сино 2'], parent: 'Shaykhantahur', confidence: 'official' },
      { name: 'Traktorsozlar-1', aliases: ['Traktorsozlar 1','Traktorsozlar-1 dahasi','Тракторсозлар-1','Тракторсозлар 1','TTZ-1','TTZ 1','ТТЗ-1','ТТЗ 1'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'Traktorsozlar-2', aliases: ['Traktorsozlar 2','Traktorsozlar-2 dahasi','Тракторсозлар-2','Тракторсозлар 2','TTZ-2','TTZ 2','ТТЗ-2','ТТЗ 2'], parent: 'Mirzo Ulugbek', confidence: 'official' },
      { name: 'TTZ-3', aliases: ['TTZ 3','ТТЗ-3','ТТЗ 3'], parent: 'Mirzo Ulugbek', confidence: 'colloquial' },
      { name: 'Traktorsozlar-4', aliases: ['Traktorsozlar 4','Traktorsozlar-4 dahasi','Тракторсозлар-4','Тракторсозлар 4','TTZ-4','TTZ 4','ТТЗ-4','ТТЗ 4'], parent: 'Mirzo Ulugbek', confidence: 'official' },
    ],
    developmentAreas: [
      ['Tashkent City', 'Ташкент Сити', 'Toshkent City', 'Tashkent City IBC'],
    ],
    streets: [
      { name: 'Gulobod Street', aliases: ['Gulobod ko‘chasi', "Gulobod ko'chasi", 'улица Гулобод', 'ул. Гулобод'], parent: 'Shaykhantahur' },
      { name: 'Sebzor Street', aliases: ['Sebzor ko‘chasi', "Sebzor ko'chasi", 'улица Себзор', 'ул. Себзор'], parent: 'Almazar' },
      { name: 'Lolazor Street', aliases: ['Lolazor ko‘chasi', "Lolazor ko'chasi", 'улица Лолазор', 'ул. Лолазор'], parent: 'Uchtepa' },
      { name: 'Shohimardon Street', aliases: ['Shohimardon ko‘chasi', "Shohimardon ko'chasi", 'улица Шохимардон', 'ул. Шохимардон'], parent: 'Yashnobod' },
      { name: 'Shohimardon Passage 1', aliases: ['Shohimardon 1-tor ko‘chasi', "Shohimardon 1-tor ko'chasi", '1-й проезд Шохимардон', '1 проезд Шохимардон'], parent: 'Yashnobod' },
      { name: "Oltinko'l Street", aliases: ['Oltinko‘l ko‘chasi', "Oltinko'l ko'chasi", 'Oltinkol kochasi', 'улица Олтинкуль', 'ул. Олтинкуль'], parent: 'Mirobod' },
      { name: "Oltinko'l Passage 1", aliases: ['Oltinko‘l 1-tor ko‘chasi', "Oltinko'l 1-tor ko'chasi", '1-й проезд Олтинкуль', '1 проезд Олтинкуль'], parent: 'Mirobod' },
      { name: 'Rakatboshi Street', aliases: ['Rakatboshi ko‘chasi', "Rakatboshi ko'chasi", 'улица Ракатбоши', 'ул. Ракатбоши'], parent: 'Yakkasaray' },
    ],
  }),

  Samarkand: city({
    mahallas: [
      { name: "Navro'z", aliases: ['Navroz','Navruz','Навруз','Наврўз'], confidence: 'official' },
      { name: 'Sattepo', aliases: ['Sattepa','Саттепо','Саттепа'], confidence: 'official' },
      { name: 'Shirin', aliases: ['Ширин'], confidence: 'official' },
      { name: 'Chilkuduk', aliases: ['Chilkuduq','Чилкудук','Чилқудуқ'], confidence: 'official' },
      { name: "Cho'pon ota", aliases: ['Chopon ota','Чупон Ота','Чопон Ота','Чўпон ота'], confidence: 'official' },
    ],
    localAreas: [
      ['Siyob','Сиаб','Сиёб','Сиабский','Сиабский район'],['Registon','Регистан','Registan'],['Center','Центр','Марказ','Markaz'],['University area','Университетский','Университет','Университет хиёбони'],
      ['University Boulevard','Бульвар','Бульвар Университетский'],['Dahbed','Дагбитская','Дагбит','Дахбед'],['Sattepo','Саттепо','Саттепа'],['Motrid','Мотрид'],['Kimyogarlar','Кимёгарлар','Химгородок','Химики'],
      ['Railway Station area','Вокзал','Темир йўл вокзали','Железнодорожный вокзал'],['Rudakiy','Рудакий','Рудаки'],['Gagarin area','Гагарина','Гагарин'],['Mirzo Ulugbek area','Мирзо Улугбек',"Mirzo Ulug'bek"],
      ['Spitamen','Спитамен','Спитаменшох'],['Panjakent Road','Панжикентская','Пенджикентская','Panjakent'],['Bogishamol','Багишамал','Боғишамол',"Bog'ishamol"],['Qorasuv','Карасу','Корасув'],
      ['Geofizika','Геофизика'],['Sugdiyona','Согдиана','Согдиёна',"Sug'diyona"],['Super Market area','Супер','Супер рынок'],['Dinamo area','Динамо','Динамо стадион'],['Afrosiyob','Афросиаб','Афросиёб'],
      ["So'zangaron",'Сузангаран','Сузангарон'],['Buyuk Ipak Yoli','Великий Шёлковый путь',"Buyuk Ipak yo'li"],
    ],
    landmarks: [
      ['Registan Square','Регистан','Registon','Площадь Регистан'],['Gur-e Amir','Гур-Эмир',"Go'ri Amir",'Гўри Амир'],['Shohi Zinda','Шахи-Зинда','Шоҳи Зинда'],['Bibi-Khanym','Биби-Ханым','Bibixonim','Бибихоним'],
      ['Siyob Bazaar','Сиабский базар','Siyob bozori','Сиёб бозори'],['Afrosiyob','Афросиаб','Афросиёб'],['Ulugbek Observatory','Обсерватория Улугбека',"Ulug'bek rasadxonasi"],['University Boulevard','Университетский бульвар','Universitet xiyoboni'],
      ['Eternal City','Вечный город','Boqiy shahar'],['Silk Road Samarkand'],['Samarkand City','Самарканд Сити'],['Samarkand International Airport','Международный аэропорт Самарканд','Samarqand xalqaro aeroporti','SKD'],
      ['Samarkand Railway Station','Самарканд вокзал','Samarqand vokzali'],['Central Park','Центральный парк',"Markaziy bog'"],['Alisher Navoiy Park','Парк Алишера Навои',"Alisher Navoiy bog'i"],['Youth Park','Парк Молодёжи',"Yoshlar bog'i"],
      ['Yangi Ozbekiston Park',"Yangi O'zbekiston bog'i",'Парк Новый Узбекистан'],['Family Park'],
    ],
  }),

  Namangan: city({
    districts: [['Davlatobod','Davlatobod tumani','Давлатабадский район','Давлатобод','Давлатобод тумани','Davlatabad'],['Yangi Namangan','Yangi Namangan tumani','Янги Наманган','Янги Наманган тумани','Новый Наманган','Yangi Namangan shaharchasi']],
    mahallas: [
      { name: 'Obihayot', aliases: ['Обихаёт'], confidence: 'official' },
      { name: 'Porloq', aliases: ['Порлок'], parent: 'Davlatobod', confidence: 'official' },
      { name: 'Mustaqillikning 5 yilligi', aliases: ['Мустакилликнинг 5 йиллиги'], parent: 'Yangi Namangan', confidence: 'official' },
    ],
    microdistricts: numberedMicrodistricts([1,2,3,4,5,6]),
    localAreas: [['Center','Центр','Markaz'],['North','Северный','Shimoliy'],['Chortoq area','Чартакский','Chortoq'],['Uychi area','Уйчи','Uychi'],['Turaqorgon area','Туракурган',"To'raqo'rg'on"],['Galaba',"G'alaba",'Галаба','Ғалаба'],['Bobur','Бобур','Bobur'],['Navoiy','Навои','Navoiy'],['Islom Karimov','Ислам Каримов'],['Qoqimboyshox','Кукумбой','Қўқимбойшох'],['Afrosiyob','Афросиаб'],['Boburshox','Бобуршох'],['Ibrat','Ибрат'],['Nodira','Нодира']],
    landmarks: [['Bobur Park',"Bobur bog'i",'Парк Бабура'],['Namangan International Airport','Namangan xalqaro aeroporti','Международный аэропорт Наманган','NMA'],['Namangan Railway Station','Namangan vokzali','Наманган вокзал'],['Namangan Chorsu','Chorsu bozori','Чорсу'],['Valley of Legends','Afsonalar vodiysi','Долина легенд'],['Yangi Ozbekiston Park',"Yangi O'zbekiston bog'i",'Новый Узбекистан']],
  }),

  Andijan: city({
    mahallas: [
      { name: "Bo'ston", aliases: ['Bostan','Buston','Бустон','Бўстон','Бостан'], confidence: 'official' },
      { name: 'Obod', aliases: ['Обод'], confidence: 'official' },
      { name: 'Temur Malik', aliases: ['Timur Malik','Темур Малик','Тимур Малик'], confidence: 'official' },
      { name: "Qoraqo'rg'on", aliases: ['Qorakurgan','Каракурган','Коракургон','Қорақўрғон'], confidence: 'official' },
      { name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат'], confidence: 'official' },
      { name: 'Mustaqillikning 21 yilligi', aliases: ['Мустакилликнинг 21 йиллиги'], confidence: 'official' },
      { name: 'Birlashgan', aliases: ['Бирлашган','Объединённый'], confidence: 'official' },
      { name: "Taxtako'prik", aliases: ['Taxtakoprik','Тахтакуприк','Тахтакўприк'], confidence: 'official' },
    ],
    localAreas: [['Center','Центр','Markaz'],['Old City','Eski shahar','Эски шахар','Старый город'],['New City','Yangi shahar','Янги шахар','Новый город'],['Bobur','Бобур'],['Navoiy','Навои'],['Mashinasozlar','Машинасозлар'],['North','Северный микрорайон','Shimoliy'],['South-West','Юго-западный',"Janubi-g'arbiy"],['University area','Университетский'],['Railway Station area','Вокзал'],['Airport area','Аэропорт']],
    landmarks: [['Central Farmers Market','Markaziy dehqon bozori','Центральный рынок','Марказий бозор'],['Yangi Bozor','Yangi bozor','Янги бозор','Новый рынок'],['Bobur Square','Bobur maydoni','площадь Бабура'],['Bobur Park',"Bobur bog'i",'Парк Бабура'],['Andijan State University','Andijon davlat universiteti','Андижанский государственный университет'],['Andijan Airport','Andijon aeroporti','Международный аэропорт Андижан'],['Andijan Railway Station','Andijon vokzali','Андижан вокзал']],
  }),

  Fergana: city({
    mahallas: [{ name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат'], confidence: 'official' }],
    localAreas: [['Qirguli','Киргули','Қирғули','Киргили'],['Neftchi','Нефтчи','Нефтяник'],['Center','Markaz','Центр'],['Mustaqillik','Мустакиллик'],['Al-Fargoniy',"Al-Farg'oniy",'Аль-Фергани'],['Margilon Road',"Marg'ilon yo'li",'Маргиланское направление','Маргиланская'],['Railway Station area','Vokzal','Вокзал'],['Airport area','Aeroport','Аэропорт'],['University area','Университетский'],['Navoiy','Навои']],
    landmarks: [['Al-Fargoniy Park',"Al-Farg'oniy bog'i",'парк Аль-Фергани'],['Independence Square','Mustaqillik maydoni','площадь Независимости'],['Fergana International Airport',"Farg'ona xalqaro aeroporti",'Ферганский международный аэропорт','FEG'],['Fergana Railway Station',"Farg'ona vokzali",'Фергана вокзал']],
  }),

  Bukhara: city({
    mahallas: [
      { name: 'M. Narshaxiy', aliases: ['Narshaxiy','Наршахий','Наршахи','Muhammad Narshakhi'], confidence: 'official' },
      { name: 'S. Raximov nomli 17-MFY', aliases: ['S. Raximov','Sobir Raximov','Сабир Рахимов','Собир Рахимов','Рахимова','17-MFY','17 махалля'], confidence: 'official' },
    ],
    localAreas: [['Old City','Eski shahar','Старый город','Эски шахар'],['Center','Markaz','Центр'],['Lyabi Hauz','Labi Hovuz','Ляби-Хауз','Ляби Хауз','Лаби Ҳовуз'],['Gijduvon Road',"G'ijduvon yo'li",'Гиждуванская'],['Gazli Road',"Gazli yo'li",'Газлийское шоссе'],['Railway Station area','Вокзал'],['Bukhara-1','Buxoro-1','Бухара-1'],['Bukhara-2','Buxoro-2','Бухара-2'],['University area','Университетский'],['Namozgoh','Намозгох'],['Sharq','Шарк'],['Mohi Xosa','Мохи-Хоса']],
    landmarks: [['Bukhara Ark','Арк',"Ark qal'asi"],['Poi Kalon','Пои-Калян','Poi-Kalyan','Minorai Kalon','Минарет Калян'],['Lyabi Hauz','Ляби-Хауз','Labi Hovuz'],['Chor Minor','Чор-Минор'],['Bolo Hauz','Боло-Хауз','Bolo Hovuz'],['Samanids Mausoleum','Саманиды','Ismoil Somoniy maqbarasi'],['Sitorai Mohi Xosa','Ситораи Мохи Хоса'],['Bukhara International Airport','Buxoro xalqaro aeroporti','BHK']],
  }),

  Qarshi: city({
    mahallas: [
      { name: 'Navo', aliases: ['Наво'], confidence: 'official' },
      { name: 'Gungon', aliases: ['Гунгон','Гунган'], confidence: 'official' },
      { name: 'Buyuk Turon', aliases: ['Буюк Турон','Великий Туран','Great Turan'], confidence: 'official' },
    ],
    localAreas: [['Center','Markaz','Центр'],['Old City','Eski shahar','Старый город'],['Geolog','Геолог','Геологлар'],['Sharq','Шарк','Шарқ'],['Paxtazor','Пахтазор'],['Nasaf','Насаф'],['Qat','Кат'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Xonobod','Ханабад','Хонобод'],['Jayxun','Джейхун']],
    landmarks: [['Odina Mosque','Odina masjidi','мечеть Одина'],['Kokgumbaz',"Ko'kgumbaz",'Кок-Гумбаз'],['Qarshi Bridge','Qarshi ko‘prigi','Каршинский мост'],['Nasaf Stadium','Nasaf stadioni','стадион Насаф'],['Karshi Airport','Qarshi xalqaro aeroporti','KSQ'],['Qarshi Railway Station','Qarshi vokzali']],
  }),

  Nukus: city({
    mahallas: nukusMahallas,
    localAreas: [['Center','Orayliq','Марказ','Центр'],['Dosliq','Дослык',"Do'stlik"],['Beruniy area','Беруний','Beruniy'],['Qizketken','Кызкеткен','Кызылкеткен'],['Nayman','Найман'],['Samanbay','Саманбай'],['Turtkul Road','Турткульское шоссе',"To'rtko'l"],['Khojeyli Road','Ходжейлийское шоссе',"Xo'jayli"],['Airport area','Аэропорт'],['Railway Station area','Вокзал']],
    landmarks: [['Savitsky Museum','Государственный музей искусств им. Савицкого','Savitskiy muzeyi','I.V. Savitsky Museum'],['Berdakh Square','Berdax maydoni','площадь Бердаха'],['Karakalpak State University','Qoraqalpoq davlat universiteti','Каракалпакский государственный университет'],['Nukus Airport','Nukus aeroporti','Нукус аэропорт','NCU']],
  }),

  Urgench: city({
    mahallas: [
      { name: 'Mustaqillik', aliases: ['Мустакиллик','Мустақиллик','Независимость'], confidence: 'official' },
      { name: 'Feruz', aliases: ['Феруз'], confidence: 'official' },
      { name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат','Просвещение'], confidence: 'official' },
      { name: "Yuqori bog'", aliases: ['Yuqori bog','Юкори бог'], confidence: 'official' },
      { name: 'Al Xorazmiy', aliases: ['Al-Xorazmiy','Al Khwarizmi','Аль-Хорезми','Ал Хоразмий'], confidence: 'official' },
      { name: 'Besh mergan', aliases: ['Beshmergan','Беш Мерган','Бешмерган'], confidence: 'official' },
      { name: 'Shodlik', aliases: ['Шодлик'], confidence: 'official' },
      { name: 'Gulshan', aliases: ['Гулшан'], confidence: 'official' },
      { name: 'Gulzor', aliases: ['Гулзор'], confidence: 'official' },
      { name: 'Navbahor', aliases: ['Navbahar','Навбахор'], confidence: 'official' },
      { name: 'Avesto', aliases: ['Avesta','Авесто','Авеста'], confidence: 'official' },
      { name: "Mash'al", aliases: ['Mashal','Машъал'], confidence: 'official' },
      { name: 'Yangi hayot', aliases: ['Yangi xayot','Янги хаёт','Янги Ҳаёт','Новая жизнь'], confidence: 'official' },
      { name: 'Ashxobod', aliases: ['Ashgabat','Ashkhabad','Ашхабад','Ашхобод'], confidence: 'official' },
      { name: 'Jingovuz', aliases: ['Jingovuz MFY','Жинговуз','Джинговуз'], confidence: 'official' },
    ],
    localAreas: [['Center','Markaz','Центр'],['Olimpiya','Олимпия'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Al-Xorazmiy area','Аль-Хорезми','Al-Xorazmiy'],['Navoiy','Навои'],['Gurlan Road','Гурленское шоссе','Gurlan'],['Khiva Road','Хивинское шоссе',"Xiva yo'li"]],
    landmarks: [['Al-Xorazmiy Monument','памятник Аль-Хорезми','Al-Xorazmiy'],['Urgench State University','Urganch davlat universiteti','Ургенчский государственный университет'],['Urgench International Airport','Urganch xalqaro aeroporti','UGC'],['Urgench Railway Station','Urganch vokzali']],
  }),

  Kokand: city({
    localAreas: [['Center','Центр','Markaz'],['Old City','Старый город','Eski shahar'],['Khudoyar Khan area','Худояр-хан','Xudoyorxon'],['Orda','Урда',"O'rda"],['Chorsu','Чорсу'],['Dangara Road','Дангара йули',"Dang'ara"],['Railway Station area','Вокзал']],
    landmarks: [['Kokand Railway Station',"Qo'qon vokzali"],['Khudoyar Khan Palace','Дворец Худояр-хана','Xudoyorxon saroyi'],['Jami Mosque','Джами','Jome masjidi'],['Norbutabiy Madrasa','Мадраса Норбута-бия','Norbutabiy madrasasi'],['Kokand Bazaar',"Qo'qon bozori",'Кокандский базар']],
  }),

  Margilan: city({
    localAreas: [['Center','Центр','Markaz'],['Old City','Старый город','Eski shahar'],['Kumtepa','Кумтепа'],['Yodgorlik','Ёдгорлик'],['Atlas','Атлас'],['Railway Station area','Вокзал']],
    landmarks: [['Kumtepa Bazaar','Кумтепинский базар','Kumtepa bozori'],['Yodgorlik Silk Factory','Yodgorlik silk factory'],['Margilan Railway Station',"Marg'ilon vokzali"]],
  }),

  Jizzakh: city({
    mahallas: [{ name: 'Ittifoq', aliases: ['Иттифок','Иттифоқ','Союз'], confidence: 'official' }],
    localAreas: [['Center','Markaz','Центр'],['Sangzor','Сангзор'],['Zilol','Зилол'],['Hamid Olimjon','Хамид Алимджан'],['Navoiy','Навои'],['Railway Station area','Вокзал'],['Airport area','Аэропорт']],
    landmarks: [['Jizzakh Pedagogical University','Jizzax davlat pedagogika universiteti','Джизакский педагогический университет'],['Sangzor River','Sangzor daryosi','река Сангзар']],
  }),

  Navoiy: city({
    mahallas: [{ name: 'Guliston', aliases: ['Гулистон'], confidence: 'official' }],
    microdistricts: [
      ...numberedMicrodistricts([1,2,3,4,5,6,7,8,9,10,11,12]),
      ['17 microdistrict','17-kichik nohiya','17 kichik nohiya','17-й микрорайон','17 микрорайон','17-mikrorayon','17 mikrorayon','17 мкр'],
    ],
    localAreas: [['Uzbekiston Massiv',"O'zbekiston massivi",'Узбекистон массив','Ўзбекистон массиви'],['Yangi Navoiy','Янги Навои','Янги Навоий'],['Center','Markaz','Центр'],['Sputnik','Спутник'],['Railway Station area','Вокзал']],
    landmarks: [['Alisher Navoiy Park',"Alisher Navoiy bog'i",'парк Алишера Навои'],['Farhod Palace of Culture','Farhod madaniyat saroyi','Дворец культуры Фархад'],['Navoiy Mining and Metallurgical Company','Navoiy kon-metallurgiya kombinati','НГМК','NGMK','Навоийский ГМК'],['Navoi International Airport','Navoiy aeroporti','NVI']],
  }),

  Termez: city({
    mahallas: [{ name: 'Farxod', aliases: ['Farhod','Фарход','Фархад'], confidence: 'official' }],
    localAreas: [['Center','Markaz','Центр'],['Old Termez','Eski Termiz','Старый Термез'],['Northern Gate','Северные ворота'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Alpomish','Альпомиш'],["Navro'z",'Навруз'],['Qiziljar','Кызылжар','Қизилжар']],
    landmarks: [['Old Termez','Старый Термез','Eski Termiz'],['Fayoztepa','Фаяз-Тепе'],['Karatepa','Кара-Тепе'],['Sultan Saodat','Султан-Саодат'],['Hakim at-Termiziy','Хаким ат-Термизи'],['Amu Darya','Амударья','Amudaryo'],['Afghanistan Friendship Bridge','Мост Дружбы'],['Termez International Airport','Termiz xalqaro aeroporti','TMJ']],
  }),

  Gulistan: city({
    mahallas: [{ name: 'Sayqal', aliases: ['Сайкал','Сайқал'], confidence: 'official' }],
    microdistricts: numberedMicrodistricts([1,2,3,4]),
    localAreas: [['Center','Markaz','Центр'],['Dehqon Bazaar','Dehqon bozori','Дехканский рынок'],['University area','Университетский'],['Railway Station area','Вокзал']],
    landmarks: [['Gulistan State University','Guliston davlat universiteti','Гулистанский государственный университет'],['Central Stadium','Markaziy stadion','Центральный стадион'],['Gulistan Railway Station','Guliston vokzali']],
  }),

  Chirchiq: city({
    microdistricts: numberedMicrodistricts([1,2,3,4,5,6,7,8,9]),
    localAreas: [['Center','Markaz','Центр'],['Yubileiny','Юбилейный'],['Khimik','Химик'],['KhimGorodok','Химгородок'],['Mashinostroitel','Машиностроитель'],['Troitsky','Троицкий'],['Railway Station area','Вокзал'],['Bochka','Бочка'],['Olympic area','Олимпийский']],
    landmarks: [['Chirchiq River','Chirchiq daryosi','река Чирчик'],['Chirchiq Pedagogical University','Chirchiq davlat pedagogika universiteti','Чирчикский педагогический университет'],['Maxam-Chirchiq','Химкомбинат']],
  }),

  Almalyk: city({
    mahallas: [{ name: 'Kamalak', aliases: ['Камалак','Радуга'], confidence: 'official' }],
    microdistricts: [
      ...numberedMicrodistricts([1,2,3,4,5]),
      ['5/1 microdistrict','5/1-kichik nohiya','5/1 kichik nohiya','5/1 микрорайон'],
      ['5/2 microdistrict','5/2-kichik nohiya','5/2 kichik nohiya','5/2 микрорайон'],
      ['5/3 microdistrict','5/3-kichik nohiya','5/3 kichik nohiya','5/3 микрорайон'],
      ['Yubileyny microdistrict','Yubileyny','Yubiley kichi- nohiya','Yubiley kichik nohiya','Юбилейный микрорайон','Юбилейный'],
    ],
    localAreas: [['Center','Markaz','Центр'],['Old City','Eski shahar','Старый город'],['New City','Yangi shahar','Новый город'],['Metallurg','Металлург'],['Sports Palace area','Дворец спорта'],['Railway Station area','Вокзал']],
    landmarks: [['Almalyk MMC','АГМК','AGMK','ОКМК','OKMK','Олмалиқ КМК','Almalyk Mining and Metallurgical Complex'],['Metallurg Stadium','Metallurg stadioni','стадион Металлург']],
  }),

  Angren: city({
    microdistricts: numberedMicrodistricts([1,2,3,4,5]),
    localAreas: [['Center','Центр'],['Old Angren','Старый Ангрен','Эски Ангрен','Eski Angren'],['New Angren','Новый Ангрен','Yangi Angren'],['Dukent','Дукент'],['Geolog','Геолог'],['Railway Station area','Вокзал']],
    landmarks: [['Angren TPP','Angren IES','Ангренская ТЭС'],['Yangi Angren TPP','Yangi Angren IES','Ново-Ангренская ТЭС'],['Angren Railway Station','Angren vokzali']],
  }),

  Bekabad: city({
    localAreas: [['Center','Центр'],['Metallurg','Металлург'],['Tsementnik','Цементник'],['Vodnik','Водник'],['Syrdarya','Сырдарья','Sirdaryo'],['Farhod','Фархад'],['Railway Station area','Вокзал']],
    landmarks: [['Uzmetkombinat','Bekobod metallurgiya kombinati','Узметкомбинат'],['Farhod HPP','Фархадская ГЭС','Farhod GES']],
  }),

  Shakhrisabz: city({
    localAreas: [['Center','Центр'],['Old City','Старый город','Eski shahar'],['Oqsaroy','Оксарой','Ак-Сарай','Ak-Saray'],['Dorus Saodat','Дорус Саодат'],['Dorut Tilovat','Дорут Тиловат'],['Chorsu','Чорсу'],['Amir Temur','Амир Темур'],['Kitob direction','Китабское направление','Kitob'],['Railway Station area','Вокзал']],
  }),

  Khiva: city({
    localAreas: [['Ichan Kala','Ичан-Кала',"Ichan-Qal'a",'Ичан-Калъа'],['Dishan Kala','Дишан-Кала',"Dishan-Qal'a"],['Old City','Старый город','Eski shahar'],['New City','Новый город','Yangi shahar']],
    landmarks: [['Ichan Kala','Ичан-Кала','Ichan Kala'],['Kalta Minor','Кальта-Минор'],['Kunya Ark','Куня-Арк',"Ko'hna Ark"],['Islam Khodja','Ислам Ходжа',"Islom Xo'ja"],['Pahlavon Mahmud','Пахлаван Махмуд'],['Tosh Hovli','Таш-Хаули'],['Olloqulixon','Аллакулихан'],['Khiva Railway Station','Xiva vokzali','Хива вокзал']],
  }),

  Denov: city({ localAreas: [['Center','Markaz','Центр'],['Old Market','Старый рынок','Eski bozor'],['New Market','Новый рынок','Yangi bozor'],['Chaganiyon',"Chag'aniyon",'Чаганиан'],['Railway Station area','Вокзал']], landmarks: [['Denov Bazaar','Деновский базар','Denov bozori'],['Denov Arboretum','Дендрарий','Denov dendrariysi']] }),
  Asaka: city({ localAreas: [['Center','Markaz','Центр'],['Auto Plant area','Автозавод','Автозаводский'],['Old City','Старый город'],['Railway Station area','Вокзал']], landmarks: [['UzAuto Motors','UzAuto','GM Uzbekistan'],['Asaka Bank'],['Dehqon Bazaar','Dehqon bozori']] }),
  Kogon: city({ localAreas: [['Center','Центр'],['Railway Station area','Вокзал','Каган вокзал','Kogon vokzali','Бухара-1','Buxoro-1'],['Railway Workers','Железнодорожный','Темирйулчилар'],['Bukhara direction','Бухара направление']] }),
  Kattakurgan: city({ localAreas: [['Center','Markaz','Центр'],['Old City','Старый город','Eski shahar'],['Railway Station area','Вокзал','Каттакурган вокзал',"Kattaqo'rg'on vokzali"],['Bazaar','Базар','Dehqon bozori']], landmarks: [['Kattakurgan Reservoir','Каттакурганское водохранилище',"Kattaqo'rg'on suv ombori"]] }),
  Urgut: city({ localAreas: [['Center','Центр'],['Navoiy','Навои'],['Samarkand direction','Самаркандское направление','Samarqand yo‘li']], landmarks: [['Urgut Bazaar','Urgut bozori','Ургутский базар'],['Chor Chinor','Чорчинор','Chor-Chinor']] }),
  Yangiyol: city({ localAreas: [['Center','Центр'],['Railway Station area','Вокзал'],['Bazaar','Базар'],['Samarkand Highway','Самаркандское шоссе'],['Tashkent direction','Ташкентское направление']] }),
  Yangiyer: city({ microdistricts: numberedMicrodistricts([1,2,3,4]), localAreas: [['Center','центр'],['Railway Station area','вокзал','Yangiyer vokzali']] }),
  Shirin: city({ localAreas: [['Center','центр'],['Energetik','энергетик'],['Farhod','Фархад'],['Syrdarya','Сырдарья','Sirdaryo']], landmarks: [['Syrdarya TPP','Сырдарьинская ТЭС'],['HPP','ГЭС']] }),
  Gazalkent: city({ localAreas: [['Center','центр'],['Charvak direction','Чарвакское направление','Chorvoq'],['Bostanlyk direction','Бостанлык',"Bo'stonliq"]] }),
  Chartak: city({ localAreas: [['Center','центр'],['Namangan Road','Namangan yo‘li']], landmarks: [['Chartak Sanatorium','санаторий Чартак','Chortoq sanatoriysi'],['Market','рынок']] }),
  Chust: city({ localAreas: [['Center','центр']], landmarks: [['Chust Bazaar','Чустский базар','Chust bozori'],['Chust Knives','Чустские ножи','Chust pichoqlari'],['Doppi','Дуппи',"Do'ppi"]] }),
  Kosonsoy: city({ localAreas: [['Center','центр'],['Chust Road','Chust yo‘li']], landmarks: [["Mug qala","Mug' qal'a",'Муг-кала']] }),
  Khojeyli: city({ localAreas: [['Center','Центр'],['Bazaar','Базар'],['Nukus direction','Нукусское направление','Nukus yo‘li'],['Railway Station area','Вокзал']] }),
  Takhiatash: city({ localAreas: [['Center','центр']], landmarks: [['Takhiatash TPP','Тахиаташская ТЭС','Taxiatosh IES'],['Amu Darya','Амударья']] }),
  Kungrad: city({ localAreas: [['Center','центр'],['Railway Station area','вокзал',"Qo'ng'irot vokzali"],['Ustyurt direction','Устюртское направление'],['Muynak direction','Муйнакское направление']] }),
  Muynak: city({ landmarks: [['Ship Cemetery','кладбище кораблей','Кемалар қабристони'],['Aral Sea','Аральское море','Орол денгизи'],['Aral Sea Museum','Музей Аральского моря',"Mo'ynoq muzeyi"],['Aralkum','Аралкум']] }),
  Beruniy: city({ localAreas: [['Center','центр'],['Turtkul Road',"To'rtko'l yo'li",'Элликкала направление']], landmarks: [['Beruniy Bazaar','Берунийский базар']] }),
  Turtkul: city({ localAreas: [['Center','центр'],['Bazaar','базар'],['Railway Station area','вокзал']] }),
  Shahrixon: city({ localAreas: [['Center','центр'],['Market','рынок'],['Andijan direction','Андижанское направление']] }),
  Xonobod: city({ landmarks: [['Andijan Reservoir','Андижанское водохранилище','Andijon suv ombori'],['Xonobod Sanatorium','Ханабад санаторий','Xonobod sanatoriysi']] }),
});

export const UZ_AMBIGUOUS_LOCAL_NAMES = Object.freeze([
  'Center','Markaz','Navbahor','Mustaqillik','Shodlik','Guliston','Nukus','Xonobod','Farhod','Navoiy','Afrosiyob','Dosliq','Yangi hayot',
]);

export const UZ_KARAKALPAK_LANGUAGE_TAGS = Object.freeze(['kaa_lat','kaa_cyr']);
