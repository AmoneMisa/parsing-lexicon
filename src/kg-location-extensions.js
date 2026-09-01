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
      ['Tunguch', 'Тунгуч', 'Тунгуч микрорайон', 'Тунгуч кичирайону'],
      ['Ulan', 'Улан', 'Улан микрорайон'],
      ['Kok-Jar', 'Кок-Жар', 'Көк-Жар', 'Кок Жар', 'Көк Жар'],
      ['Ak-Orgo', 'Ак-Орго', 'Ак Орго', 'Ак-Өргө', 'Ак Өргө'],
      ['Kyzyl-Asker', 'Кызыл-Аскер', 'Кызыл Аскер', 'Кызыл-Аскер району'],
      ['Alamedin-1', 'Аламедин-1', 'Аламедин 1', 'Аламүдүн-1', 'Аламүдүн 1'],
      ['Vostok-5', 'Восток-5', 'Восток 5', '5-й микрорайон Восток'],
      ['Vostok-6', 'Восток-6', 'Восток 6', '6-й микрорайон Восток'],
      ['Dordoi', 'Дордой', 'Дордой массив', 'Дордой конушу'],
    ],
    localAreas: [
      ['Center', 'Центр', 'центр Бишкека', 'Бишкек центр', 'шаар борбору'],
      ['Rabochiy Gorodok', 'Рабочий городок', 'Рабочий Городок'],
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
      ['Dungan Mosque', 'Дунганская мечеть', 'Дунган мечити'],
      ['Holy Trinity Cathedral', 'Свято-Троицкий собор', 'Троицкий собор'],
      ['Karakol Ski Base', 'горнолыжная база Каракол', 'лыжная база Каракол'],
    ],
  }),
});
