import { KZ_CITIES, UZ_CITIES } from './geo.js';
import { aliasesOf, findCanonical, normalizeForMatch } from './normalization.js';

const freezeAliases = (aliases = {}) => Object.freeze(Object.fromEntries(
  Object.entries(aliases).map(([lang, values]) => [lang, Object.freeze([...new Set(values || [])])]),
));

const city = (canonical, aliases, extra = {}) => Object.freeze({
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
    byCanonical.set(item.canonical, city(item.canonical, aliases, { ...previousMeta, ...itemMeta }));
  }
  return Object.freeze(order.map((name) => byCanonical.get(name)));
}

export const KZ_CITY_ADDITIONS = Object.freeze([
  city('Almaty', { kk: ['Алматы'], ru: ['Алма-Ата', 'Алма Ата', 'Верный'], en: ['Alma-Ata', 'Alma Ata', 'Verny'] }, { country: 'KZ', priority: 'P0' }),
  city('Astana', { kk: ['Астана', 'Нұр-Сұлтан', 'Нұр Сұлтан', 'Ақмола'], ru: ['Астана', 'Нур-Султан', 'Нур Султан', 'Акмолинск', 'Акмола', 'Целиноград'], en: ['Astana', 'Nur-Sultan', 'Nur Sultan', 'Akmolinsk', 'Aqmola', 'Tselinograd'] }, { country: 'KZ', priority: 'P0' }),
  city('Shymkent', { kk: ['Шымкент'], ru: ['Шымкент', 'Чимкент', 'Чымкент'], en: ['Shymkent', 'Chimkent'] }, { country: 'KZ', priority: 'P0' }),
  city('Karaganda', { kk: ['Қарағанды'], ru: ['Караганда', 'Караганды'], en: ['Karaganda', 'Qaragandy', 'Karagandy'] }, { country: 'KZ', priority: 'P1' }),
  city('Aktobe', { kk: ['Ақтөбе'], ru: ['Актобе', 'Актюбинск'], en: ['Aktobe', 'Aqtobe', 'Aktyubinsk'] }, { country: 'KZ', priority: 'P1' }),
  city('Taraz', { kk: ['Тараз', 'Жамбыл', 'Әулие-Ата'], ru: ['Тараз', 'Джамбул', 'Жамбыл', 'Аулие-Ата'], en: ['Taraz', 'Dzhambul', 'Jambyl', 'Aulie-Ata'] }, { country: 'KZ', priority: 'P1' }),
  city('Pavlodar', { kk: ['Павлодар'], ru: ['Павлодар'], en: ['Pavlodar'] }, { country: 'KZ', priority: 'P1' }),
  city('Oskemen', { kk: ['Өскемен'], ru: ['Усть-Каменогорск', 'Усть Каменогорск', 'Оскемен'], en: ['Oskemen', 'Ust-Kamenogorsk', 'Ust Kamenogorsk'] }, { country: 'KZ', priority: 'P1' }),
  city('Semey', { kk: ['Семей'], ru: ['Семей', 'Семипалатинск'], en: ['Semey', 'Semipalatinsk'] }, { country: 'KZ', priority: 'P1' }),
  city('Atyrau', { kk: ['Атырау'], ru: ['Атырау', 'Гурьев'], en: ['Atyrau', 'Guryev', 'Guriev'] }, { country: 'KZ', priority: 'P1' }),
  city('Aktau', { kk: ['Ақтау'], ru: ['Актау', 'Шевченко'], en: ['Aktau', 'Aqtau', 'Shevchenko'] }, { country: 'KZ', priority: 'P1' }),
  city('Kostanay', { kk: ['Қостанай'], ru: ['Костанай', 'Кустанай'], en: ['Kostanay', 'Qostanay', 'Kustanay'] }, { country: 'KZ', priority: 'P2' }),
  city('Kyzylorda', { kk: ['Қызылорда', 'Ақмешіт'], ru: ['Кызылорда', 'Ак-Мечеть', 'Перовск'], en: ['Kyzylorda', 'Qyzylorda', 'Kzyl-Orda', 'Ak-Mechet', 'Perovsk'] }, { country: 'KZ', priority: 'P2' }),
  city('Oral', { kk: ['Орал'], ru: ['Орал', 'Уральск'], en: ['Oral', 'Uralsk'] }, { country: 'KZ', priority: 'P2' }),
  city('Petropavl', { kk: ['Петропавл'], ru: ['Петропавловск', 'Петропавл'], en: ['Petropavl', 'Petropavlovsk'] }, { country: 'KZ', priority: 'P2' }),
  city('Taldykorgan', { kk: ['Талдықорған'], ru: ['Талдыкорган', 'Талды-Курган'], en: ['Taldykorgan', 'Taldyqorgan', 'Taldy-Kurgan'] }, { country: 'KZ', priority: 'P2' }),
  city('Turkistan', { kk: ['Түркістан'], ru: ['Туркестан'], en: ['Turkistan', 'Turkestan'] }, { country: 'KZ', priority: 'P2' }),
  city('Kokshetau', { kk: ['Көкшетау'], ru: ['Кокшетау', 'Кокчетав'], en: ['Kokshetau', 'Kokchetav'] }, { country: 'KZ', priority: 'P2' }),
  city('Temirtau', { kk: ['Теміртау'], ru: ['Темиртау'], en: ['Temirtau'] }, { country: 'KZ', priority: 'P3' }),
  city('Ekibastuz', { kk: ['Екібастұз'], ru: ['Экибастуз'], en: ['Ekibastuz'] }, { country: 'KZ', priority: 'P3' }),
  city('Rudny', { kk: ['Рудный'], ru: ['Рудный'], en: ['Rudny', 'Rudnyi'] }, { country: 'KZ', priority: 'P3' }),
  city('Zhezkazgan', { kk: ['Жезқазған'], ru: ['Жезказган'], en: ['Zhezkazgan', 'Jezkazgan', 'Dzhezkazgan'] }, { country: 'KZ', priority: 'P3' }),
  city('Balkhash', { kk: ['Балқаш'], ru: ['Балхаш'], en: ['Balkhash', 'Balqash'] }, { country: 'KZ', priority: 'P3' }),
  city('Konaev', { kk: ['Қонаев', 'Қапшағай'], ru: ['Конаев', 'Капчагай'], en: ['Konaev', 'Qonaev', 'Kapshagay', 'Kapchagai', 'Qapshagai'] }, { country: 'KZ', priority: 'P3' }),
  city('Zhanaozen', { kk: ['Жаңаөзен'], ru: ['Жанаозен'], en: ['Zhanaozen', 'Zhanaözen', 'New Uzen'] }, { country: 'KZ', priority: 'P3' }),
  city('Satbayev', { kk: ['Сәтбаев'], ru: ['Сатпаев', 'Никольский'], en: ['Satbayev', 'Satpaev', 'Nikolsky'] }, { country: 'KZ', priority: 'P3' }),
  city('Kosshy', { kk: ['Қосшы'], ru: ['Косшы'], en: ['Kosshy', 'Qosshy', 'Koschi'] }, { country: 'KZ', priority: 'P3' }),
  city('Arys', { kk: ['Арыс'], ru: ['Арыс'], en: ['Arys'] }, { country: 'KZ', priority: 'P3' }),
  city('Kentau', { kk: ['Кентау'], ru: ['Кентау'], en: ['Kentau'] }, { country: 'KZ', priority: 'P3' }),
  city('Saryagash', { kk: ['Сарыағаш'], ru: ['Сарыагаш'], en: ['Saryagash'] }, { country: 'KZ', priority: 'P3' }),
  city('Stepnogorsk', { kk: ['Степногорск'], ru: ['Степногорск'], en: ['Stepnogorsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Atbasar', { kk: ['Атбасар'], ru: ['Атбасар'], en: ['Atbasar'] }, { country: 'KZ', priority: 'P4' }),
  city('Shchuchinsk', { kk: ['Щучинск'], ru: ['Щучинск'], en: ['Shchuchinsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Makinsk', { kk: ['Макинск'], ru: ['Макинск'], en: ['Makinsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Ereymentau', { kk: ['Ерейментау'], ru: ['Ерейментау'], en: ['Ereymentau'] }, { country: 'KZ', priority: 'P4' }),
  city('Akkol', { kk: ['Ақкөл'], ru: ['Акколь'], en: ['Akkol', 'Aqkol'] }, { country: 'KZ', priority: 'P4' }),
  city('Kaskelen', { kk: ['Қаскелең'], ru: ['Каскелен'], en: ['Kaskelen'] }, { country: 'KZ', priority: 'P4' }),
  city('Talgar', { kk: ['Талғар'], ru: ['Талгар'], en: ['Talgar'] }, { country: 'KZ', priority: 'P4' }),
  city('Esik', { kk: ['Есік'], ru: ['Есик'], en: ['Esik', 'Issyk'] }, { country: 'KZ', priority: 'P4' }),
  city('Shelek', { kk: ['Шелек'], ru: ['Шелек'], en: ['Shelek'] }, { country: 'KZ', priority: 'P4' }),
  city('Uzynagash', { kk: ['Ұзынағаш'], ru: ['Узынагаш'], en: ['Uzynagash'] }, { country: 'KZ', priority: 'P4' }),
  city('Zharkent', { kk: ['Жаркент'], ru: ['Жаркент'], en: ['Zharkent'] }, { country: 'KZ', priority: 'P4' }),
  city('Tekeli', { kk: ['Текелі'], ru: ['Текели'], en: ['Tekeli'] }, { country: 'KZ', priority: 'P4' }),
  city('Usharal', { kk: ['Үшарал'], ru: ['Ушарал'], en: ['Usharal'] }, { country: 'KZ', priority: 'P4' }),
  city('Saran', { kk: ['Саран'], ru: ['Сарань'], en: ['Saran'] }, { country: 'KZ', priority: 'P4' }),
  city('Shakhtinsk', { kk: ['Шахтинск'], ru: ['Шахтинск'], en: ['Shakhtinsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Abai', { kk: ['Абай'], ru: ['Абай'], en: ['Abai'] }, { country: 'KZ', priority: 'P4' }),
  city('Priozersk', { kk: ['Приозерск'], ru: ['Приозёрск', 'Приозерск'], en: ['Priozersk'] }, { country: 'KZ', priority: 'P4' }),
  city('Karkaralinsk', { kk: ['Қарқаралы'], ru: ['Каркаралинск'], en: ['Karkaralinsk', 'Karkaraly'] }, { country: 'KZ', priority: 'P4' }),
  city('Aksu', { kk: ['Ақсу'], ru: ['Аксу'], en: ['Aksu', 'Aqsu'] }, { country: 'KZ', priority: 'P4' }),
  city('Ridder', { kk: ['Риддер'], ru: ['Риддер'], en: ['Ridder'] }, { country: 'KZ', priority: 'P4' }),
  city('Altai', { kk: ['Алтай'], ru: ['Алтай', 'Зыряновск'], en: ['Altai', 'Zyryanovsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Serebryansk', { kk: ['Серебрянск'], ru: ['Серебрянск'], en: ['Serebryansk'] }, { country: 'KZ', priority: 'P4' }),
  city('Shemonaikha', { kk: ['Шемонаиха'], ru: ['Шемонаиха'], en: ['Shemonaikha'] }, { country: 'KZ', priority: 'P4' }),
  city('Kurchatov', { kk: ['Курчатов'], ru: ['Курчатов'], en: ['Kurchatov'] }, { country: 'KZ', priority: 'P4' }),
  city('Ayagoz', { kk: ['Аягөз'], ru: ['Аягоз'], en: ['Ayagoz'] }, { country: 'KZ', priority: 'P4' }),
  city('Khromtau', { kk: ['Хромтау'], ru: ['Хромтау'], en: ['Khromtau'] }, { country: 'KZ', priority: 'P4' }),
  city('Alga', { kk: ['Алға'], ru: ['Алга'], en: ['Alga'] }, { country: 'KZ', priority: 'P4' }),
  city('Kandyagash', { kk: ['Қандыағаш'], ru: ['Кандыагаш'], en: ['Kandyagash'] }, { country: 'KZ', priority: 'P4' }),
  city('Shalkar', { kk: ['Шалқар'], ru: ['Шалкар'], en: ['Shalkar'] }, { country: 'KZ', priority: 'P4' }),
  city('Kulsary', { kk: ['Құлсары'], ru: ['Кульсары'], en: ['Kulsary'] }, { country: 'KZ', priority: 'P4' }),
  city('Dossor', { kk: ['Доссор'], ru: ['Доссор'], en: ['Dossor'] }, { country: 'KZ', priority: 'P4' }),
  city('Fort-Shevchenko', { kk: ['Форт-Шевченко'], ru: ['Форт-Шевченко'], en: ['Fort-Shevchenko'] }, { country: 'KZ', priority: 'P4' }),
  city('Lisakovsk', { kk: ['Лисаковск'], ru: ['Лисаковск'], en: ['Lisakovsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Arkalyk', { kk: ['Арқалық'], ru: ['Аркалык'], en: ['Arkalyk'] }, { country: 'KZ', priority: 'P4' }),
  city('Tobyl', { kk: ['Тобыл'], ru: ['Тобыл'], en: ['Tobyl'] }, { country: 'KZ', priority: 'P4' }),
  city('Zhitikara', { kk: ['Жітіқара'], ru: ['Житикара'], en: ['Zhitikara'] }, { country: 'KZ', priority: 'P4' }),
  city('Aksai', { kk: ['Ақсай'], ru: ['Аксай'], en: ['Aksai'] }, { country: 'KZ', priority: 'P4' }),
  city('Baikonur', { kk: ['Байқоңыр'], ru: ['Байконур'], en: ['Baikonur'] }, { country: 'KZ', priority: 'P4', type: 'special_status_city' }),
  city('Aral', { kk: ['Арал'], ru: ['Аральск', 'Арал'], en: ['Aral', 'Aralsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Kazaly', { kk: ['Қазалы'], ru: ['Казалинск', 'Казалы'], en: ['Kazaly', 'Kazalinsk'] }, { country: 'KZ', priority: 'P4' }),
  city('Shu', { kk: ['Шу'], ru: ['Шу'], en: ['Shu'] }, { country: 'KZ', priority: 'P4' }),
  city('Karatau', { kk: ['Қаратау'], ru: ['Каратау'], en: ['Karatau'] }, { country: 'KZ', priority: 'P4' }),
  city('Zhanatas', { kk: ['Жаңатас'], ru: ['Жанатас'], en: ['Zhanatas'] }, { country: 'KZ', priority: 'P4' }),
  city('Merke', { kk: ['Мерке'], ru: ['Мерке'], en: ['Merke'] }, { country: 'KZ', priority: 'P4' }),
  city('Zhetysai', { kk: ['Жетісай'], ru: ['Жетысай'], en: ['Zhetysai'] }, { country: 'KZ', priority: 'P4' }),
  city('Lenger', { kk: ['Леңгір'], ru: ['Ленгер'], en: ['Lenger'] }, { country: 'KZ', priority: 'P4' }),
  city('Shardara', { kk: ['Шардара'], ru: ['Шардара'], en: ['Shardara'] }, { country: 'KZ', priority: 'P4' }),
]);

export const KZ_CITY_CATALOG = mergeCatalog(KZ_CITIES, KZ_CITY_ADDITIONS);

export const KZ_SEARCH_TARGETS = Object.freeze([
  city('Burabay', { kk: ['Бурабай'], ru: ['Бурабай', 'Боровое'], en: ['Burabay', 'Borovoe'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
  city('Zerenda', { kk: ['Зеренді'], ru: ['Зеренда'], en: ['Zerenda'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
  city('Bayanaul', { kk: ['Баянауыл'], ru: ['Баянаул'], en: ['Bayanaul'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
]);

export const UZ_CITY_ADDITIONS = Object.freeze([
  city('Tashkent', { uzLatn: ['Toshkent', 'Toshkent shahri'], uzCyrl: ['Тошкент', 'Тошкент шаҳри'], ru: ['Ташкент', 'город Ташкент'], en: ['Tashkent'] }, { country: 'UZ', priority: 'P0' }),
  city('Samarkand', { uzLatn: ['Samarqand', 'Samarqand shahri'], uzCyrl: ['Самарқанд'], ru: ['Самарканд', 'г. Самарканд'], en: ['Samarkand', 'Samarqand'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Samarqand' }),
  city('Namangan', { uzLatn: ['Namangan', 'Namangan shahri'], uzCyrl: ['Наманган шаҳри'], ru: ['Наманган'], en: ['Namangan'] }, { country: 'UZ', priority: 'P0' }),
  city('Andijan', { uzLatn: ['Andijon', 'Andijon shahri', 'Andijan', 'Andizhan'], uzCyrl: ['Андижон'], ru: ['Андижан'], en: ['Andijan', 'Andizhan'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Andijon' }),
  city('Fergana', { uzLatn: ["Farg'ona", 'Fargona', "Farg'ona shahri"], uzCyrl: ['Фарғона', 'Фаргона'], ru: ['Фергана'], en: ['Fergana', 'Ferghana'] }, { country: 'UZ', priority: 'P0', localCanonical: "Farg'ona" }),
  city('Bukhara', { uzLatn: ['Buxoro', 'Buxoro shahri'], uzCyrl: ['Бухоро'], ru: ['Бухара'], en: ['Bukhara', 'Buchara'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Buxoro' }),
  city('Qarshi', { uzLatn: ['Qarshi', 'Qarshi shahri', 'Karshi'], uzCyrl: ['Қарши'], ru: ['Карши'], en: ['Qarshi', 'Karshi'] }, { country: 'UZ', priority: 'P0' }),
  city('Nukus', { uzLatn: ['Nukus', 'Nukus shahri'], uzCyrl: ['Нукус'], kaaLat: ['Nókis'], kaaCyrl: ['Нөкис', 'Нөкис қаласы'], ru: ['Нукус'], en: ['Nukus'] }, { country: 'UZ', priority: 'P0', region: "Qoraqalpog'iston" }),
  city('Urgench', { uzLatn: ['Urganch', 'Urganch shahri', 'Urgench'], uzCyrl: ['Урганч'], ru: ['Ургенч'], en: ['Urgench', 'Urganch'] }, { country: 'UZ', priority: 'P0', localCanonical: 'Urganch' }),
  city('Kokand', { uzLatn: ["Qo'qon", 'Qo‘qon', 'Qoqon'], uzCyrl: ['Қўқон'], ru: ['Коканд'], en: ['Kokand', 'Kokon'] }, { country: 'UZ', priority: 'P1', localCanonical: "Qo'qon" }),
  city('Margilan', { uzLatn: ["Marg'ilon", 'Marg‘ilon', 'Margilon'], uzCyrl: ['Марғилон'], ru: ['Маргилан'], en: ['Margilan', 'Marghelan'] }, { country: 'UZ', priority: 'P1', localCanonical: "Marg'ilon" }),
  city('Jizzakh', { uzLatn: ['Jizzax', 'Jizzakh'], uzCyrl: ['Жиззах'], ru: ['Джизак'], en: ['Jizzakh', 'Djizak'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Jizzax' }),
  city('Navoiy', { uzLatn: ['Navoiy', 'Navoi'], uzCyrl: ['Навоий'], ru: ['Навои'], en: ['Navoiy', 'Navoi'] }, { country: 'UZ', priority: 'P1' }),
  city('Termez', { uzLatn: ['Termiz', 'Termiz shahri'], uzCyrl: ['Термиз'], ru: ['Термез'], en: ['Termez', 'Termiz'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Termiz' }),
  city('Gulistan', { uzLatn: ['Guliston', 'Gulistan'], uzCyrl: ['Гулистон'], ru: ['Гулистан'], en: ['Gulistan', 'Guliston'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Guliston' }),
  city('Chirchiq', { uzLatn: ['Chirchiq', 'Chirchik'], uzCyrl: ['Чирчиқ'], ru: ['Чирчик'], en: ['Chirchiq', 'Chirchik'] }, { country: 'UZ', priority: 'P1' }),
  city('Almalyk', { uzLatn: ['Olmaliq', 'Almalyk'], uzCyrl: ['Олмалиқ'], ru: ['Алмалык'], en: ['Almalyk', 'Olmaliq'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Olmaliq' }),
  city('Angren', { uzLatn: ['Angren'], uzCyrl: ['Ангрен'], ru: ['Ангрен'], en: ['Angren'] }, { country: 'UZ', priority: 'P1' }),
  city('Bekabad', { uzLatn: ['Bekobod', 'Bekabad'], uzCyrl: ['Бекобод'], ru: ['Бекабад', 'Бекобод'], en: ['Bekabad', 'Bekobod'] }, { country: 'UZ', priority: 'P1', localCanonical: 'Bekobod' }),
  city('Shakhrisabz', { uzLatn: ['Shahrisabz', 'Shakhrisabz', 'Shahr-i Sabz'], uzCyrl: ['Шаҳрисабз'], ru: ['Шахрисабз'], en: ['Shakhrisabz', 'Shahrisabz'] }, { country: 'UZ', priority: 'P2', localCanonical: 'Shahrisabz' }),
  city('Khiva', { uzLatn: ['Xiva', 'Khiva'], uzCyrl: ['Хива'], ru: ['Хива'], en: ['Khiva', 'Chiwa'] }, { country: 'UZ', priority: 'P2', localCanonical: 'Xiva' }),
  city('Denov', { uzLatn: ['Denov', 'Denau'], uzCyrl: ['Денов'], ru: ['Денау', 'Денов'], en: ['Denov', 'Denau'] }, { country: 'UZ', priority: 'P2' }),
  city('Asaka', { uzLatn: ['Asaka', 'Assaka'], uzCyrl: ['Асака'], ru: ['Асака'], en: ['Asaka'] }, { country: 'UZ', priority: 'P2' }),
  city('Kogon', { uzLatn: ['Kogon', 'Yangi Buxoro'], uzCyrl: ['Когон'], ru: ['Каган', 'Когон', 'Новая Бухара'], en: ['Kogon', 'Kagan'] }, { country: 'UZ', priority: 'P2' }),
  city('Kattakurgan', { uzLatn: ["Kattaqo'rg'on", 'Kattaqo‘rg‘on', 'Kattakurgan'], uzCyrl: ['Каттақўрғон'], ru: ['Каттакурган'], en: ['Kattakurgan'] }, { country: 'UZ', priority: 'P2', localCanonical: "Kattaqo'rg'on" }),
  city('Urgut', { uzLatn: ['Urgut', 'Urgut shahri'], uzCyrl: ['Ургут'], ru: ['Ургут'], en: ['Urgut'] }, { country: 'UZ', priority: 'P2' }),
  city('Yangiyol', { uzLatn: ["Yangiyo'l", 'Yangiyo‘l', 'Yangiyul'], uzCyrl: ['Янги йўл', 'Янгийўл'], ru: ['Янгиюль'], en: ['Yangiyol', 'Yangiyul'] }, { country: 'UZ', priority: 'P2', localCanonical: "Yangiyo'l" }),
  city('Chust', { uzLatn: ['Chust'], uzCyrl: ['Чуст'], ru: ['Чуст'], en: ['Chust'] }, { country: 'UZ', priority: 'P3' }),
  city('Chartak', { uzLatn: ['Chortoq', 'Chartak'], uzCyrl: ['Чортоқ'], ru: ['Чартак'], en: ['Chartak', 'Chortoq'] }, { country: 'UZ', priority: 'P3', localCanonical: 'Chortoq' }),
  city('Kosonsoy', { uzLatn: ['Kosonsoy', 'Kasansay'], uzCyrl: ['Косонсой'], ru: ['Касансай', 'Косонсой'], en: ['Kosonsoy', 'Kasansay'] }, { country: 'UZ', priority: 'P3' }),
  city('Shahrixon', { uzLatn: ['Shahrixon', 'Shahrikhan'], uzCyrl: ['Шаҳрихон'], ru: ['Шахрихан'], en: ['Shahrixon', 'Shahrikhan'] }, { country: 'UZ', priority: 'P3' }),
  city('Xonobod', { uzLatn: ['Xonobod', 'Xonobod shahri'], uzCyrl: ['Хонобод'], ru: ['Ханабад', 'Хонобод'], en: ['Khanabad', 'Xonobod'] }, { country: 'UZ', priority: 'P3', contextRequired: true }),
  city('Khojeyli', { uzLatn: ["Xo'jayli", 'Xojayli'], uzCyrl: ['Хўжайли'], kaaLat: ['Xojeli'], ru: ['Ходжейли'], en: ['Khojeyli', 'Khodzheyli'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  city('Takhiatash', { uzLatn: ['Taxiatosh'], uzCyrl: ['Тахиатош'], kaaLat: ['Taxiatas'], ru: ['Тахиаташ'], en: ['Takhiatash', 'Tahiatash'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  city('Kungrad', { uzLatn: ["Qo'ng'irot", 'Qo‘ng‘irot'], uzCyrl: ['Қўнғирот'], kaaLat: ['Qońırat'], ru: ['Кунград'], en: ['Kungrad', 'Kongirat'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  city('Beruniy', { uzLatn: ['Beruniy'], uzCyrl: ['Беруний'], ru: ['Беруни'], en: ['Beruniy', 'Biruni'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  city('Turtkul', { uzLatn: ["To'rtko'l", 'To‘rtko‘l'], uzCyrl: ['Тўрткўл'], kaaLat: ['Tórtkúl'], ru: ['Турткуль'], en: ['Turtkul', 'Tortkul'] }, { country: 'UZ', priority: 'P3', region: "Qoraqalpog'iston" }),
  city('Yangiyer', { uzLatn: ['Yangiyer', 'Yangi Yer'], uzCyrl: ['Янгиер'], ru: ['Янгиер'], en: ['Yangiyer'] }, { country: 'UZ', priority: 'P3' }),
  city('Shirin', { uzLatn: ['Shirin'], uzCyrl: ['Ширин'], ru: ['Ширин'], en: ['Shirin'] }, { country: 'UZ', priority: 'P3' }),
  city('Gazalkent', { uzLatn: ["G'azalkent", 'Gazalkent'], uzCyrl: ['Ғазалкент'], ru: ['Газалкент'], en: ['Gazalkent'] }, { country: 'UZ', priority: 'P3', localCanonical: "G'azalkent" }),
  city('Muynak', { uzLatn: ["Mo'ynoq", 'Moynaq'], uzCyrl: ['Мўйноқ'], kaaLat: ['Moynaq'], ru: ['Муйнак'], en: ['Muynak', 'Moynak'] }, { country: 'UZ', priority: 'P4', region: "Qoraqalpog'iston" }),
]);

export const UZ_CITY_CATALOG = mergeCatalog(UZ_CITIES, UZ_CITY_ADDITIONS);

export const UZ_SEARCH_TARGETS = Object.freeze([
  city('Chorvoq', { uzLatn: ['Chorvoq', 'Charvak'], ru: ['Чарвак'], en: ['Chorvoq', 'Charvak'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Beldersoy', { uzLatn: ['Beldersoy'], ru: ['Бельдерсай'], en: ['Beldersoy'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Chimgan', { uzLatn: ['Chimgan'], ru: ['Чимган'], en: ['Chimgan'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Zomin', { uzLatn: ['Zomin', 'Zaamin'], ru: ['Заамин', 'Зомин'], en: ['Zomin', 'Zaamin'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Boysun', { uzLatn: ['Boysun'], ru: ['Байсун'], en: ['Boysun'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Rishton', { uzLatn: ['Rishton'], ru: ['Риштан'], en: ['Rishton'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Gijduvon', { uzLatn: ["G'ijduvon", 'Gijduvon'], ru: ['Гиждуван'], en: ['Gijduvan'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city('Vobkent', { uzLatn: ['Vobkent'], ru: ['Вабкент'], en: ['Vobkent'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city('Hazorasp', { uzLatn: ['Hazorasp'], ru: ['Хазарасп'], en: ['Hazorasp'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city("Ellikqal'a", { uzLatn: ["Ellikqal'a", 'Ellikkala'], kaaLat: ['Elliqala'], ru: ['Элликкала'], en: ['Ellikkala'] }, { country: 'UZ', type: 'search_target', priority: 'P4', region: "Qoraqalpog'iston" }),
]);

export const KZ_LOCATION_TERMS = Object.freeze({
  microdistrict: Object.freeze(['микрорайон', 'микр.', 'микр', 'мкр.', 'мкр', 'м-н', 'мкр-н', 'ықшамаудан', 'ықш.ауд.', 'ықш']),
  residentialArea: Object.freeze(['жилой массив', 'жилмассив', 'ж/м', 'ж.м.', 'тұрғын алабы', 'тұрғын массиві', 'массив']),
  district: Object.freeze(['район', 'р-н', 'рн', 'аудан', 'ауд.', 'district']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'жилой комплекс', 'тұрғын үй кешені', 'ТҮК', 'residence', 'residential complex', 'residential quarter']),
});

export const UZ_LOCATION_TERMS = Object.freeze({
  city: Object.freeze(['shahar', 'shahri', 'город', 'г.']),
  district: Object.freeze(['tuman', 'tumani', 'район', 'р-н']),
  mahalla: Object.freeze(['MFY', 'M.F.Y.', 'mfy', 'mahalla', "mahalla fuqarolar yig'ini", "mahalla fuqarolari yig'ini", 'маҳалла', 'маҳалла фуқаролар йиғини', 'махалля', 'махалла']),
  microdistrict: Object.freeze(['mikrorayon', 'микрорайон', 'мкр', 'мкр.']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'turar joy majmuasi', 'residential complex', 'residence']),
});

export function canonicalKazakhstanCity(value) {
  return findCanonical(value, KZ_CITY_CATALOG)?.canonical || null;
}

export function canonicalUzbekistanCity(value) {
  return findCanonical(value, UZ_CITY_CATALOG)?.canonical || null;
}

export function canonicalCentralAsiaCity(value, country = null) {
  if (country === 'KZ') return canonicalKazakhstanCity(value);
  if (country === 'UZ') return canonicalUzbekistanCity(value);
  return canonicalKazakhstanCity(value) || canonicalUzbekistanCity(value);
}

export function centralAsiaCityAliases(canonical, country) {
  const catalog = country === 'KZ' ? KZ_CITY_CATALOG : country === 'UZ' ? UZ_CITY_CATALOG : [...KZ_CITY_CATALOG, ...UZ_CITY_CATALOG];
  const item = catalog.find((entry) => entry.canonical === canonical);
  return item ? Object.freeze([...new Set([item.canonical, ...aliasesOf(item)])]) : Object.freeze([]);
}
