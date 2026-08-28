import { lexiconEntity } from './lexicon-core.js';
import { normalizeForMatch } from './normalization.js';

const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, { type: 'city', ...extra });

const freezeAliases = (aliases = {}) => Object.freeze(Object.fromEntries(
  Object.entries(aliases).map(([lang, values]) => {
    const seen = new Set();
    const deduped = (values || []).filter((alias) => {
      const key = normalizeForMatch(alias);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return [lang, Object.freeze(deduped)];
  }),
));

const catalogCity = (canonical, aliases, extra = {}) => Object.freeze({
  ...extra,
  canonical,
  aliases: freezeAliases(aliases),
});

function mergeCatalog(base, additions) {
  const order = [];
  const byCanonical = new Map();
  for (const item of [...base, ...additions]) {
    if (!item?.canonical) continue;
    if (!byCanonical.has(item.canonical)) order.push(item.canonical);
    const previous = byCanonical.get(item.canonical);
    if (!previous) {
      byCanonical.set(item.canonical, item);
      continue;
    }
    const languages = [...new Set([...Object.keys(previous.aliases || {}), ...Object.keys(item.aliases || {})])];
    const aliases = Object.fromEntries(languages.map((lang) => {
      const seen = new Set();
      const values = [...(previous.aliases?.[lang] || []), ...(item.aliases?.[lang] || [])].filter((alias) => {
        const key = normalizeForMatch(alias);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return [lang, values];
    }));
    const { aliases: _previousAliases, ...previousMeta } = previous;
    const { aliases: _itemAliases, ...itemMeta } = item;
    byCanonical.set(item.canonical, catalogCity(item.canonical, aliases, { ...previousMeta, ...itemMeta }));
  }
  return Object.freeze(order.map((name) => byCanonical.get(name)));
}

const UZ_BASE_CITIES = Object.freeze([
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

const KZ_BASE_CITIES = Object.freeze([
  entity('Almaty', { kk: ['Алматы'], ru: ['Алматы', 'Алма-Ата', 'Алма Ата'], en: ['Almaty', 'Alma-Ata', 'Alma Ata'] }, { country: 'KZ' }),
  entity('Astana', { kk: ['Астана', 'Нұр-Сұлтан', 'Нұр Сұлтан'], ru: ['Астана', 'Нур-Султан', 'Нур Султан'], en: ['Astana', 'Nur-Sultan', 'Nur Sultan'] }, { country: 'KZ' }),
  entity('Shymkent', { kk: ['Шымкент'], ru: ['Шымкент', 'Чимкент'], en: ['Shymkent', 'Chimkent'] }, { country: 'KZ' }),
  entity('Karaganda', { kk: ['Қарағанды'], ru: ['Караганда'], en: ['Karaganda', 'Qaragandy'] }, { country: 'KZ' }),
  entity('Aktobe', { kk: ['Ақтөбе'], ru: ['Актобе'], en: ['Aktobe', 'Aqtobe'] }, { country: 'KZ' }),
  entity('Atyrau', { kk: ['Атырау'], ru: ['Атырау'], en: ['Atyrau'] }, { country: 'KZ' }),
  entity('Oral', { kk: ['Орал'], ru: ['Уральск', 'Орал'], en: ['Oral', 'Uralsk'] }, { country: 'KZ' }),
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
  entity('Kokshetau', { kk: ['Көкшетау'], ru: ['Кокшетау'], en: ['Kokshetau'] }, { country: 'KZ' }),
]);

export const KZ_CITY_ADDITIONS = Object.freeze([
  catalogCity('Almaty', { kk: ['Алматы'], ru: ['Алма-Ата', 'Алма Ата', 'Верный'], en: ['Alma-Ata', 'Alma Ata', 'Verny'] }, { country: 'KZ', priority: 'P0' }),
  catalogCity('Astana', { kk: ['Астана', 'Нұр-Сұлтан', 'Нұр Сұлтан', 'Ақмола'], ru: ['Астана', 'Нур-Султан', 'Нур Султан', 'Акмолинск', 'Акмола', 'Целиноград'], en: ['Astana', 'Nur-Sultan', 'Nur Sultan', 'Akmolinsk', 'Aqmola', 'Tselinograd'] }, { country: 'KZ', priority: 'P0' }),
  catalogCity('Shymkent', { kk: ['Шымкент'], ru: ['Шымкент', 'Чимкент', 'Чымкент'], en: ['Shymkent', 'Chimkent'] }, { country: 'KZ', priority: 'P0' }),
  catalogCity('Karaganda', { kk: ['Қарағанды'], ru: ['Караганда', 'Караганды'], en: ['Karaganda', 'Qaragandy', 'Karagandy'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Aktobe', { kk: ['Ақтөбе'], ru: ['Актобе', 'Актюбинск'], en: ['Aktobe', 'Aqtobe', 'Aktyubinsk'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Taraz', { kk: ['Тараз', 'Жамбыл', 'Әулие-Ата'], ru: ['Тараз', 'Джамбул', 'Жамбыл', 'Аулие-Ата'], en: ['Taraz', 'Dzhambul', 'Jambyl', 'Aulie-Ata'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Pavlodar', { kk: ['Павлодар'], ru: ['Павлодар'], en: ['Pavlodar'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Oskemen', { kk: ['Өскемен'], ru: ['Усть-Каменогорск', 'Усть Каменогорск', 'Оскемен'], en: ['Oskemen', 'Ust-Kamenogorsk', 'Ust Kamenogorsk'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Semey', { kk: ['Семей'], ru: ['Семей', 'Семипалатинск'], en: ['Semey', 'Semipalatinsk'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Atyrau', { kk: ['Атырау'], ru: ['Атырау', 'Гурьев'], en: ['Atyrau', 'Guryev', 'Guriev'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Aktau', { kk: ['Ақтау'], ru: ['Актау', 'Шевченко'], en: ['Aktau', 'Aqtau', 'Shevchenko'] }, { country: 'KZ', priority: 'P1' }),
  catalogCity('Kostanay', { kk: ['Қостанай'], ru: ['Костанай', 'Кустанай'], en: ['Kostanay', 'Qostanay', 'Kustanay'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Kyzylorda', { kk: ['Қызылорда', 'Ақмешіт'], ru: ['Кызылорда', 'Ак-Мечеть', 'Перовск'], en: ['Kyzylorda', 'Qyzylorda', 'Kzyl-Orda', 'Ak-Mechet', 'Perovsk'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Oral', { kk: ['Орал'], ru: ['Орал', 'Уральск'], en: ['Oral', 'Uralsk'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Petropavl', { kk: ['Петропавл'], ru: ['Петропавловск', 'Петропавл'], en: ['Petropavl', 'Petropavlovsk'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Taldykorgan', { kk: ['Талдықорған'], ru: ['Талдыкорган', 'Талды-Курган'], en: ['Taldykorgan', 'Taldyqorgan', 'Taldy-Kurgan'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Turkistan', { kk: ['Түркістан'], ru: ['Туркестан'], en: ['Turkistan', 'Turkestan'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Kokshetau', { kk: ['Көкшетау'], ru: ['Кокшетау', 'Кокчетав'], en: ['Kokshetau', 'Kokchetav'] }, { country: 'KZ', priority: 'P2' }),
  catalogCity('Temirtau', { kk: ['Теміртау'], ru: ['Темиртау'], en: ['Temirtau'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Ekibastuz', { kk: ['Екібастұз'], ru: ['Экибастуз'], en: ['Ekibastuz'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Rudny', { kk: ['Рудный'], ru: ['Рудный'], en: ['Rudny', 'Rudnyi'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Zhezkazgan', { kk: ['Жезқазған'], ru: ['Жезказган'], en: ['Zhezkazgan', 'Jezkazgan', 'Dzhezkazgan'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Balkhash', { kk: ['Балқаш'], ru: ['Балхаш'], en: ['Balkhash', 'Balqash'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Konaev', { kk: ['Қонаев', 'Қапшағай'], ru: ['Конаев', 'Капчагай'], en: ['Konaev', 'Qonaev', 'Kapshagay', 'Kapchagai', 'Qapshagai'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Zhanaozen', { kk: ['Жаңаөзен'], ru: ['Жанаозен'], en: ['Zhanaozen', 'Zhanaözen', 'New Uzen'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Satbayev', { kk: ['Сәтбаев'], ru: ['Сатпаев', 'Никольский'], en: ['Satbayev', 'Satpaev', 'Nikolsky'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Kosshy', { kk: ['Қосшы'], ru: ['Косшы'], en: ['Kosshy', 'Qosshy', 'Koschi'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Arys', { kk: ['Арыс'], ru: ['Арыс'], en: ['Arys'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Kentau', { kk: ['Кентау'], ru: ['Кентау'], en: ['Kentau'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Saryagash', { kk: ['Сарыағаш'], ru: ['Сарыагаш'], en: ['Saryagash'] }, { country: 'KZ', priority: 'P3' }),
  catalogCity('Stepnogorsk', { kk: ['Степногорск'], ru: ['Степногорск'], en: ['Stepnogorsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Atbasar', { kk: ['Атбасар'], ru: ['Атбасар'], en: ['Atbasar'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shchuchinsk', { kk: ['Щучинск'], ru: ['Щучинск'], en: ['Shchuchinsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Makinsk', { kk: ['Макинск'], ru: ['Макинск'], en: ['Makinsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Ereymentau', { kk: ['Ерейментау'], ru: ['Ерейментау'], en: ['Ereymentau'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Akkol', { kk: ['Ақкөл'], ru: ['Акколь'], en: ['Akkol', 'Aqkol'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Kaskelen', { kk: ['Қаскелең'], ru: ['Каскелен'], en: ['Kaskelen'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Talgar', { kk: ['Талғар'], ru: ['Талгар'], en: ['Talgar'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Esik', { kk: ['Есік'], ru: ['Есик'], en: ['Esik', 'Issyk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shelek', { kk: ['Шелек'], ru: ['Шелек'], en: ['Shelek'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Uzynagash', { kk: ['Ұзынағаш'], ru: ['Узынагаш'], en: ['Uzynagash'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Zharkent', { kk: ['Жаркент'], ru: ['Жаркент'], en: ['Zharkent'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Tekeli', { kk: ['Текелі'], ru: ['Текели'], en: ['Tekeli'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Usharal', { kk: ['Үшарал'], ru: ['Ушарал'], en: ['Usharal'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Saran', { kk: ['Саран'], ru: ['Сарань'], en: ['Saran'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shakhtinsk', { kk: ['Шахтинск'], ru: ['Шахтинск'], en: ['Shakhtinsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Abai', { kk: ['Абай'], ru: ['Абай'], en: ['Abai'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Priozersk', { kk: ['Приозерск'], ru: ['Приозёрск'], en: ['Priozersk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Karkaralinsk', { kk: ['Қарқаралы'], ru: ['Каркаралинск'], en: ['Karkaralinsk', 'Karkaraly'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Aksu', { kk: ['Ақсу'], ru: ['Аксу'], en: ['Aksu', 'Aqsu'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Ridder', { kk: ['Риддер'], ru: ['Риддер'], en: ['Ridder'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Altai', { kk: ['Алтай'], ru: ['Алтай', 'Зыряновск'], en: ['Altai', 'Zyryanovsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Serebryansk', { kk: ['Серебрянск'], ru: ['Серебрянск'], en: ['Serebryansk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shemonaikha', { kk: ['Шемонаиха'], ru: ['Шемонаиха'], en: ['Shemonaikha'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Kurchatov', { kk: ['Курчатов'], ru: ['Курчатов'], en: ['Kurchatov'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Ayagoz', { kk: ['Аягөз'], ru: ['Аягоз'], en: ['Ayagoz'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Khromtau', { kk: ['Хромтау'], ru: ['Хромтау'], en: ['Khromtau'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Alga', { kk: ['Алға'], ru: ['Алга'], en: ['Alga'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Kandyagash', { kk: ['Қандыағаш'], ru: ['Кандыагаш'], en: ['Kandyagash'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shalkar', { kk: ['Шалқар'], ru: ['Шалкар'], en: ['Shalkar'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Kulsary', { kk: ['Құлсары'], ru: ['Кульсары'], en: ['Kulsary'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Dossor', { kk: ['Доссор'], ru: ['Доссор'], en: ['Dossor'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Fort-Shevchenko', { kk: ['Форт-Шевченко'], ru: ['Форт-Шевченко'], en: ['Fort-Shevchenko'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Lisakovsk', { kk: ['Лисаковск'], ru: ['Лисаковск'], en: ['Lisakovsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Arkalyk', { kk: ['Арқалық'], ru: ['Аркалык'], en: ['Arkalyk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Tobyl', { kk: ['Тобыл'], ru: ['Тобыл'], en: ['Tobyl'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Zhitikara', { kk: ['Жітіқара'], ru: ['Житикара'], en: ['Zhitikara'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Aksai', { kk: ['Ақсай'], ru: ['Аксай'], en: ['Aksai'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Baikonur', { kk: ['Байқоңыр'], ru: ['Байконур'], en: ['Baikonur'] }, { country: 'KZ', priority: 'P4', type: 'special_status_city' }),
  catalogCity('Aral', { kk: ['Арал'], ru: ['Аральск', 'Арал'], en: ['Aral', 'Aralsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Kazaly', { kk: ['Қазалы'], ru: ['Казалинск', 'Казалы'], en: ['Kazaly', 'Kazalinsk'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shu', { kk: ['Шу'], ru: ['Шу'], en: ['Shu'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Karatau', { kk: ['Қаратау'], ru: ['Каратау'], en: ['Karatau'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Zhanatas', { kk: ['Жаңатас'], ru: ['Жанатас'], en: ['Zhanatas'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Merke', { kk: ['Мерке'], ru: ['Мерке'], en: ['Merke'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Zhetysai', { kk: ['Жетісай'], ru: ['Жетысай'], en: ['Zhetysai'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Lenger', { kk: ['Леңгір'], ru: ['Ленгер'], en: ['Lenger'] }, { country: 'KZ', priority: 'P4' }),
  catalogCity('Shardara', { kk: ['Шардара'], ru: ['Шардара'], en: ['Shardara'] }, { country: 'KZ', priority: 'P4' }),
]);

export const UZ_CITY_ADDITIONS = Object.freeze([
  catalogCity('Tashkent', { uzLatn: ['Toshkent', 'Toshkent shahri'], uzCyrl: ['Тошкент', 'Тошкент шаҳри'], ru: ['Ташкент', 'город Ташкент'], en: ['Tashkent'] }, { country: 'UZ', priority: 'P0' }),
  catalogCity('Samarkand', { uzLatn: ['Samarqand', 'Samarqand shahri'], uzCyrl: ['Самарқанд'], ru: ['Самарканд', 'г. Самарканд'], en: ['Samarkand', 'Samarqand'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Samarqand' }),
  catalogCity('Namangan', { uzLatn: ['Namangan', 'Namangan shahri'], uzCyrl: ['Наманган шаҳри'], ru: ['Наманган'], en: ['Namangan'] }, { country: 'UZ', priority: 'P0' }),
  catalogCity('Andijan', { uzLatn: ['Andijon', 'Andijon shahri', 'Andijan', 'Andizhan'], uzCyrl: ['Андижон'], ru: ['Андижан'], en: ['Andijan', 'Andizhan'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Andijon' }),
  catalogCity('Fergana', { uzLatn: ["Farg'ona", 'Fargona', "Farg'ona shahri"], uzCyrl: ['Фарғона', 'Фаргона'], ru: ['Фергана'], en: ['Fergana', 'Ferghana'] }, { country: 'UZ', priority: 'P0', localCanonical: "Farg'ona" }),
  catalogCity('Bukhara', { uzLatn: ['Buxoro', 'Buxoro shahri'], uzCyrl: ['Бухоро'], ru: ['Бухара'], en: ['Bukhara', 'Buchara'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Buxoro' }),
  catalogCity('Qarshi', { uzLatn: ['Qarshi', 'Qarshi shahri', 'Karshi'], uzCyrl: ['Қарши'], ru: ['Карши'], en: ['Qarshi', 'Karshi'] }, { country: 'UZ', priority: 'P0' }),
  catalogCity('Nukus', { uzLatn: ['Nukus', 'Nukus shahri'], uzCyrl: ['Нукус'], kaaLat: ['Nókis'], kaaCyrl: ['Нөкис', 'Нөкис қаласы'], ru: ['Нукус'], en: ['Nukus'] }, { country: 'UZ', priority: 'P0', region: "Qoraqalpog'iston" }),
  catalogCity('Urgench', { uzLatn: ['Urganch', 'Urganch shahri', 'Urgench'], uzCyrl: ['Урганч'], ru: ['Ургенч'], en: ['Urgench', 'Urganch'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Urganch' }),
  catalogCity('Kokand', { uzLatn: ["Qo'qon", 'Qo‘qon', 'Qoqon'], uzCyrl: ['Қўқон'], ru: ['Коканд'], en: ['Kokand', 'Kokon'] }, { country: 'UZ', priority: 'P1', localCanonical: "Qo'qon" }),
  catalogCity('Margilan', { uzLatn: ["Marg'ilon", 'Marg‘ilon', 'Margilon'], uzCyrl: ['Марғилон'], ru: ['Маргилан'], en: ['Margilan', 'Marghelan'] }, { country: 'UZ', priority: 'P1', localCanonical: "Marg'ilon" }),
  catalogCity('Jizzakh', { uzLatn: ['Jizzax', 'Jizzakh'], uzCyrl: ['Жиззах'], ru: ['Джизак'], en: ['Jizzakh', 'Djizak'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Jizzax' }),
  catalogCity('Navoiy', { uzLatn: ['Navoiy', 'Navoi'], uzCyrl: ['Навоий'], ru: ['Навои'], en: ['Navoiy', 'Navoi'] }, { country: 'UZ', priority: 'P1' }),
  catalogCity('Termez', { uzLatn: ['Termiz', 'Termiz shahri'], uzCyrl: ['Термиз'], ru: ['Термез'], en: ['Termez', 'Termiz'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Termiz' }),
  catalogCity('Gulistan', { uzLatn: ['Guliston', 'Gulistan'], uzCyrl: ['Гулистон'], ru: ['Гулистан'], en: ['Gulistan', 'Guliston'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Guliston' }),
  catalogCity('Chirchiq', { uzLatn: ['Chirchiq', 'Chirchik'], uzCyrl: ['Чирчиқ'], ru: ['Чирчик'], en: ['Chirchiq', 'Chirchik'] }, { country: 'UZ', priority: 'P1' }),
  catalogCity('Almalyk', { uzLatn: ['Olmaliq', 'Almalyk'], uzCyrl: ['Олмалиқ'], ru: ['Алмалык'], en: ['Almalyk', 'Olmaliq'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Olmaliq' }),
  catalogCity('Angren', { uzLatn: ['Angren'], uzCyrl: ['Ангрен'], ru: ['Ангрен'], en: ['Angren'] }, { country: 'UZ', priority: 'P1' }),
  catalogCity('Bekabad', { uzLatn: ['Bekobod', 'Bekabad'], uzCyrl: ['Бекобод'], ru: ['Бекабад', 'Бекобод'], en: ['Bekabad', 'Bekobod'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Bekobod' }),
  catalogCity('Shakhrisabz', { uzLatn: ['Shahrisabz', 'Shakhrisabz', 'Shahr-i Sabz'], uzCyrl: ['Шаҳрисабз'], ru: ['Шахрисабз'], en: ['Shakhrisabz', 'Shahrisabz'] }, { country: 'UZ', priority: 'P2', localCanonical: 'Shahrisabz' }),
  catalogCity('Khiva', { uzLatn: ['Xiva', 'Khiva'], uzCyrl: ['Хива'], ru: ['Хива'], en: ['Khiva', 'Chiwa'] }, { country: 'UZ', priority: 'P2', localCanonical: 'Xiva' }),
  catalogCity('Denov', { uzLatn: ['Denov', 'Denau'], uzCyrl: ['Денов'], ru: ['Денау', 'Денов'], en: ['Denov', 'Denau'] }, { country: 'UZ', priority: 'P2' }),
  catalogCity('Asaka', { uzLatn: ['Asaka', 'Assaka'], uzCyrl: ['Асака'], ru: ['Асака'], en: ['Asaka'] }, { country: 'UZ', priority: 'P2' }),
  catalogCity('Kogon', { uzLatn: ['Kogon', 'Yangi Buxoro'], uzCyrl: ['Когон'], ru: ['Каган', 'Когон', 'Новая Бухара'], en: ['Kogon', 'Kagan'] }, { country: 'UZ', priority: 'P2' }),
  catalogCity('Kattakurgan', { uzLatn: ["Kattaqo'rg'on", 'Kattaqo‘rg‘on', 'Kattakurgan'], uzCyrl: ['Каттақўрғон'], ru: ['Каттакурган'], en: ['Kattakurgan'] }, { country: 'UZ', priority: 'P2', localCanonical: "Kattaqo'rg'on" }),
  catalogCity('Urgut', { uzLatn: ['Urgut', 'Urgut shahri'], uzCyrl: ['Ургут'], ru: ['Ургут'], en: ['Urgut'] }, { country: 'UZ', priority: 'P2' }),
  catalogCity('Yangiyol', { uzLatn: ["Yangiyo'l", 'Yangiyo‘l', 'Yangiyul'], uzCyrl: ['Янги йўл', 'Янгийўл'], ru: ['Янгиюль'], en: ['Yangiyol', 'Yangiyul'] }, { country: 'UZ', priority: 'P2', localCanonical: "Yangiyo'l" }),
  catalogCity('Chust', { uzLatn: ['Chust'], uzCyrl: ['Чуст'], ru: ['Чуст'], en: ['Chust'] }, { country: 'UZ', priority: 'P3' }),
  catalogCity('Chartak', { uzLatn: ['Chortoq', 'Chartak'], uzCyrl: ['Чортоқ'], ru: ['Чартак'], en: ['Chartak', 'Chortoq'] }, { country: 'UZ', priority: 'P3', localCanonical: 'Chortoq' }),
  catalogCity('Kosonsoy', { uzLatn: ['Kosonsoy', 'Kasansay'], uzCyrl: ['Косонсой'], ru: ['Касансай', 'Косонсой'], en: ['Kosonsoy', 'Kasansay'] }, { country: 'UZ', priority: 'P3' }),
  catalogCity('Shahrixon', { uzLatn: ['Shahrixon', 'Shahrikhan'], uzCyrl: ['Шаҳрихон'], ru: ['Шахрихан'], en: ['Shahrixon', 'Shahrikhan'] }, { country: 'UZ', priority: 'P3' }),
  catalogCity('Xonobod', { uzLatn: ['Xonobod', 'Xonobod shahri'], uzCyrl: ['Хонобод'], ru: ['Ханабад', 'Хонобод'], en: ['Khanabad', 'Xonobod'] }, { country: 'UZ', priority: 'P3', contextRequired: true }),
  catalogCity('Khojeyli', { uzLatn: ["Xo'jayli", 'Xojayli'], uzCyrl: ['Хўжайли'], kaaLat: ['Xojeli'], ru: ['Ходжейли'], en: ['Khojeyli', 'Khodzheyli'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  catalogCity('Takhiatash', { uzLatn: ['Taxiatosh'], uzCyrl: ['Тахиатош'], kaaLat: ['Taxiatas'], ru: ['Тахиаташ'], en: ['Takhiatash', 'Tahiatash'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  catalogCity('Kungrad', { uzLatn: ["Qo'ng'irot", 'Qo‘ng‘irot'], uzCyrl: ['Қўнғирот'], kaaLat: ['Qońırat'], ru: ['Кунград'], en: ['Kungrad', 'Kongirat'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  catalogCity('Beruniy', { uzLatn: ['Beruniy'], uzCyrl: ['Беруний'], ru: ['Беруни'], en: ['Beruniy', 'Biruni'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  catalogCity('Turtkul', { uzLatn: ["To'rtko'l", 'To‘rtko‘l'], uzCyrl: ['Тўрткўл'], kaaLat: ['Tórtkúl'], ru: ['Турткуль'], en: ['Turtkul', 'Tortkul'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  catalogCity('Yangiyer', { uzLatn: ['Yangiyer', 'Yangi Yer'], uzCyrl: ['Янгиер'], ru: ['Янгиер'], en: ['Yangiyer'] }, { country: 'UZ', priority: 'P3' }),
  catalogCity('Shirin', { uzLatn: ['Shirin'], uzCyrl: ['Ширин'], ru: ['Ширин'], en: ['Shirin'] }, { country: 'UZ', priority: 'P3' }),
  catalogCity('Gazalkent', { uzLatn: ["G'azalkent", 'Gazalkent'], uzCyrl: ['Ғазалкент'], ru: ['Газалкент'], en: ['Gazalkent'] }, { country: 'UZ', priority: 'P3', localCanonical: "G'azalkent" }),
  catalogCity('Muynak', { uzLatn: ["Mo'ynoq", 'Moynaq'], uzCyrl: ['Мўйноқ'], kaaLat: ['Moynaq'], ru: ['Муйнак'], en: ['Muynak', 'Moynak'] }, { country: 'UZ', priority: 'P4', region: "Qoraqalpog'iston" }),
]);

/** Canonical Kazakhstan city catalog used by every geography consumer. */
export const KZ_CITIES = mergeCatalog(KZ_BASE_CITIES, KZ_CITY_ADDITIONS);

/** Canonical Uzbekistan city catalog used by every geography consumer. */
export const UZ_CITIES = mergeCatalog(UZ_BASE_CITIES, UZ_CITY_ADDITIONS);
