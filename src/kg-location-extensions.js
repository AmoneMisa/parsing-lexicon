import { aliasesToRegex } from './normalization.js';

function entry(name, aliases = [], meta = {}) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    ...meta,
    canonical: name,
    name,
    type: meta.type || meta.entityType,
    entityType: meta.entityType || meta.type,
    country: 'KG',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const entries = (rows, entityType) => Object.freeze(rows.map((row) => (
  Array.isArray(row)
    ? entry(row[0], row.slice(1), { entityType })
    : entry(row.name, row.aliases || [], { ...row, entityType: row.entityType || entityType })
)));

const city = ({ districts = [], microdistricts = [], localAreas = [], suburbs = [], residentialComplexes = [], streets = [], landmarks = [] } = {}) => Object.freeze({
  ...(districts.length ? { districts: entries(districts, 'district') } : {}),
  ...(microdistricts.length ? { microdistricts: entries(microdistricts, 'microdistrict') } : {}),
  ...(localAreas.length ? { localAreas: entries(localAreas, 'local_area') } : {}),
  ...(suburbs.length ? { suburbs: entries(suburbs, 'suburb') } : {}),
  ...(residentialComplexes.length ? { residentialComplexes: entries(residentialComplexes, 'residential_complex') } : {}),
  ...(streets.length ? { streets: entries(streets, 'street') } : {}),
  ...(landmarks.length ? { landmarks: entries(landmarks, 'poi') } : {}),
});

export const KG_LOCATION_EXTENSIONS = Object.freeze({
  Bishkek: city({
    districts: [
      ['Pervomaisky', 'Первомайский', 'Первомайский район', 'Биринчи Май', 'Биринчи Май району', 'Birinchi May', 'Birinchi May district'],
      ['Leninsky', 'Ленинский', 'Ленинский район', 'Ленин району', 'Lenin district'],
      ['Oktyabrsky', 'Октябрьский', 'Октябрьский район', 'Октябрь району', 'Oktyabr district'],
      ['Sverdlovsky', 'Свердловский', 'Свердловский район', 'Свердлов району', 'Sverdlov district'],
    ],
    microdistricts: [
      ['Asanbay', 'Асанбай', 'Асанбай микрорайон', 'Асанбай кичирайону'],
      ['Jal', 'Джал', 'Жал', 'Джал микрорайон', 'Жал кичирайону'],
      ['Tunguch', 'Тунгуч', 'Тунгуч микрорайон'],
      ['Ulan', 'Улан', 'Улан микрорайон'],
      ['Kok-Jar', 'Кок-Жар', 'Көк-Жар', 'Кок Жар', 'Көк Жар'],
      ['Ak-Orgo', 'Ак-Орго', 'Ак Орго', 'Ак-Өргө', 'Ак Өргө', 'Ak-Ordo', 'Ак-Ордо', 'Ак Ордо'],
      ['Kyzyl-Asker', 'Кызыл-Аскер', 'Кызыл Аскер', 'Кызыл-Аскер району'],
      ['Alamedin-1', 'Аламедин-1', 'Аламедин 1', 'Аламүдүн-1', 'Аламүдүн 1'],
      ['Vostok-5', 'Восток-5', 'Восток 5', '5-й микрорайон Восток'],
      ['Vostok-6', 'Восток-6', 'Восток 6', '6-й микрорайон Восток'],
      ['Dordoi', 'Дордой', 'Дордой массив', 'Дордой конушу'],
      ['3-й микрорайон', '3 микрорайон', '3 мкр', '3 мкр.', '3-й мкр', '3rd microdistrict'],
      ['6-й микрорайон', '6 микрорайон', '6 мкр', '6 мкр.', '6-й мкр', '6th microdistrict'],
      ['7-й микрорайон', '7 микрорайон', '7 мкр', '7 мкр.', '7-й мкр', '7th microdistrict'],
      ['8-й микрорайон', '8 микрорайон', '8 мкр', '8 мкр.', '8-й мкр', '8th microdistrict'],
      ['10-й микрорайон', '10 микрорайон', '10 мкр', '10 мкр.', '10-й мкр', '10th microdistrict'],
      ['11-й микрорайон', '11 микрорайон', '11 мкр', '11 мкр.', '11-й мкр', '11th microdistrict'],
      ['12-й микрорайон', '12 микрорайон', '12 мкр', '12 мкр.', '12-й мкр', '12th microdistrict'],
    ],
    localAreas: [
      ['Center', 'Центр', 'центр Бишкека', 'Бишкек центр', 'шаар борбору'],
      ['Rabochiy Gorodok', 'Рабочий городок', 'Рабочий Городок'],
      ['Ала-Тоо 3', 'Ала-Тоо-3', 'Ала Тоо 3', 'Ala-Too 3', 'Ala Too 3'],
      ['Киргизия-1', 'Киргизия 1', 'Kirgiziya-1', 'Kyrgyzia-1'],
    ],
    residentialComplexes: [
      ['Dastan City', 'Дастан Сити', 'ЖК Дастан Сити'],
      ['Diamond Park', 'Diamond park', 'Даймонд Парк', 'ЖК Diamond Park'],
      ['Neo City', 'NEO CITY', 'Нео Сити', 'ЖК Neo City', 'ЖК NEO CITY'],
      ['One', 'ONE', 'ЖК One', 'ЖК ONE'],
      ['Prime Park', 'PRIME PARK', 'Прайм Парк', 'ЖК Prime Park'],
      ['Крейсер', 'Kreiser', 'ЖК Крейсер'],
      ['Сирень', 'Siren', 'ЖК Сирень'],
      ['Тянь-Шань', 'Тянь Шань', 'Tyan-Shan', 'Tian Shan', 'ЖК Тянь-Шань'],
      ['Эркиндик', 'Erkindik', 'ЖК Эркиндик'],
      ['Юг-7', 'Юг 7', 'Yug-7', 'Yug 7', 'ЖК Юг-7'],
      ['Level Lux', 'LEVEL LUX', 'Level LUX', 'ЖК Level Lux', 'ЖД Level Lux', 'Левел Люкс', 'Level Lux турак жай комплекси'],
      ['Nuran Park', 'NURAN PARK', 'Нуран Парк', 'ЖК Нуран Парк', 'ЖК Nuran Park', 'Nuran Park турак жай комплекси'],
      ['Art Square', 'ART SQUARE', 'Арт Сквер', 'ЖК Art Square', 'ЖД Art Square', 'Art Square турак жай комплекси'],
      ['Kok-Jar Hills', 'Kok Jar Hills', 'Кок-Жар Хиллс', 'Көк-Жар Хиллс', 'ЖК Kok-Jar Hills', 'Kok-Jar Hills турак жай комплекси'],
      ['Tokyo City', 'TOKYO CITY', 'Токио Сити', 'ЖК Токио Сити', 'ЖК Tokyo City', 'Tokyo City турак жай комплекси'],
      ['Nova Prestige', 'NOVA PRESTIGE', 'Нова Престиж', 'ЖК Нова Престиж', 'ЖК Nova Prestige', 'Nova Prestige турак жай комплекси'],
      ['Mega City', 'MEGA CITY', 'Мега-Сити', 'Мега Сити', 'ЖК Мега Сити', 'ЖК Mega City', 'Mega City турак жай комплекси'],
      ['Sun House Plus', 'SunHouse Plus', 'SUN HOUSE PLUS', 'SunHouse PLUS', 'Сан Хаус Плюс', 'ЖК Sun House Plus', 'ЖД SunHouse Plus', 'Sun House Plus турак жай комплекси'],
      ['Испанский дом', 'Ispanskiy Dom', 'Spanish House', 'ЖК Испанский дом', 'Испан үйү', 'Испанский дом турак жай комплекси'],
      ['Brooklyn', 'BROOKLYN', 'Бруклин', 'ЖК Brooklyn', 'ЖК Бруклин', 'Brooklyn турак жай комплекси'],
      ['Barcelona', 'BARCELONA', 'Барселона', 'ЖК Барселона', 'МФК Барселона', 'ЖК Barcelona', 'Barcelona турак жай комплекси'],
    ],
    landmarks: [
      ['Ala-Too Square', 'площадь Ала-Тоо', 'Ала-Тоо аянты', 'Ала Тоо площадь'],
      ['Osh Bazaar', 'Ошский базар', 'Ош базары', 'Ош базар'],
      ['Dordoi Bazaar', 'рынок Дордой', 'Дордой базары', 'Дордой рынок'],
      ['Victory Square', 'площадь Победы', 'Жеңиш аянты'],
      ['Panfilov Park', 'парк Панфилова', 'Панфилов паркы'],
      ['Botanical Garden', 'Ботанический сад', 'Ботаникалык бак'],
      ['Bishkek Railway Station', 'железнодорожный вокзал Бишкек', 'Бишкек-2', 'Бишкек 2 вокзал'],
    ],
  }),

  Osh: city({
    localAreas: [
      ['Center', 'Центр', 'центр Оша', 'Ош центр', 'шаар борбору'],
      ['Cheremushki', 'Черемушки', 'Черёмушки'],
    ],
    landmarks: [
      ['Sulayman-Too', 'Сулайман-Тоо', 'Сулейман-Тоо', 'Sulaiman-Too', 'Suleiman Too'],
      ['Osh Bazaar', 'Ошский базар', 'Ош базары', 'Жайма базары', 'Jayma Bazaar'],
      ['Ak-Buura River', 'Ак-Буура', 'Ак Буура', 'Ак-Буура дарыясы'],
    ],
  }),

  Karakol: city({
    localAreas: [
      ['Center', 'Центр', 'центр Каракола', 'Каракол центр'],
    ],
    landmarks: [
      ['Dungan Mosque', 'Дунганская мечеть', 'Дунганской мечети', 'Дунган мечити'],
      ['Holy Trinity Cathedral', 'Свято-Троицкий собор', 'Троицкий собор'],
      ['Karakol Ski Base', 'горнолыжная база Каракол', 'лыжная база Каракол'],
    ],
  }),

  // These cities are intentionally registered before inventing local districts.
  // Country-wide enrichment can now discover their spatial vocabulary through
  // the same crawler and promote only verified results afterwards.
  'Jalal-Abad': city(),
  Tokmok: city(),
  Naryn: city(),
  Talas: city(),
  Batken: city(),
  'Kara-Balta': city(),
  Balykchy: city(),
  Kant: city(),
  Uzgen: city(),
  'Kyzyl-Kiya': city(),
});
