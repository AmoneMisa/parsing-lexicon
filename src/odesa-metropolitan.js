import { aliasesToRegex } from './normalization.js';

function entity(name, type, aliases = [], options = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({
    canonical: name,
    name,
    type,
    aliases: Object.freeze(all),
    re: aliasesToRegex(all),
    parent: options.parent || null,
    cluster: options.cluster || null,
    contextRequired: Boolean(options.contextRequired),
    contextRe: options.context ? new RegExp(options.context, 'iu') : null,
  });
}

const NORTH_EAST_CLUSTER = 'Одеса — північно-східна агломерація';

export const ODESA_LOCAL_AREAS = Object.freeze([
  entity('Житловий масив Котовського', 'local_area', [
    'Посёлок Котовского', 'Поселок Котовского', 'селище Котовського', 'Котовского', 'Котовського',
    'Котовка', 'Поскот', 'ПосКот', 'пос. Котовского', 'пос Котовского', 'п. Котовского', 'п.Котовского',
    'ж/м Котовского', 'жилмассив Котовского', 'житловий масив Котовського', 'Kotovskoho', 'Kotovskogo',
    'Kotovsky settlement', 'Старый Посёлок', 'Старий селище Котовського', 'Старый Котовского',
    'Новый Котовского', 'Новий Котовського', 'Поле Чудес', 'Поле чудес', 'Сахарный', 'Цукровий',
  ], { cluster: NORTH_EAST_CLUSTER }),
  entity('Малий Фонтан', 'local_area', [
    'Малый Фонтан', 'Малий Фонтан', 'Малого Фонтана', 'Малого Фонтану',
    'на Малом Фонтане', 'на Малому Фонтані', 'район Малого Фонтана', 'район Малого Фонтану',
    'Malyi Fontan', 'Maly Fontan',
  ]),
]);

export const ODESA_MICRODISTRICT_EXTENSIONS = Object.freeze([
  entity('Лузанівка', 'microdistrict', ['Лузановка','Luzanivka','Luzanovka','Лузановский район','Лузанівський район','район Лузановки','район Лузанівки','Лузановка пляж','Лузанівка пляж'], { cluster: NORTH_EAST_CLUSTER }),
  entity('Вузівський', 'microdistrict', ['Вузовский','Вузівський','Вузовський','Vuzovskyi','Вузовский район','Вузівський район']),
  entity('Чубаївка', 'microdistrict', ['Чубаевка','Чубаївка','Chubaivka','Chubayevka']),
  entity('411-та батарея', 'local_area', ['411 батарея','411-я батарея','411 батарея Одесса','411-та батарея','Мемориал 411 батареи']),
  entity('Дача Ковалевського', 'microdistrict', ['Дача Ковалевского','Дача Ковалевського','Дача Ковальского','Kovalevskoho Dacha','Kovalevskogo Dacha']),
  entity('Золотий Берег', 'microdistrict', ['Золотой Берег','Золотий Берег','Golden Coast','16 станция Фонтана','16-та станція Великого Фонтану']),
  entity('Чорноморка', 'microdistrict', ['Черноморка','Чорноморка','Chornomorka','Chernomorka','Люстдорф','Lustdorf']),
  entity('Таїрова', 'microdistrict', ['Таирова','Таїрова','Tairova','район Таирова','ж/м Таирова','жилмассив Таирова']),
  entity('Черемушки', 'microdistrict', ['Черёмушки','Черемушки','Cheremushky','Cheryomushki','Черёмушки Одесса','Черемушки Одеса']),
  entity('Ближні Млини', 'microdistrict', ['Ближние Мельницы','Ближні Млини','Ближние Мельницы Одесса','Ближні Млини Одеса']),
  entity('Дальні Млини', 'microdistrict', ['Дальние Мельницы','Дальні Млини','Дальние Мельницы Одесса','Дальні Млини Одеса']),
  entity('Бугаївка', 'microdistrict', ['Бугаёвка','Бугаевка','Бугаївка','Buhaivka','Bugaevka']),
  entity('Ленселище', 'microdistrict', ['Ленпосёлок','Ленпоселок','Ленселище','Ленпос','Ленпосёлок Одесса']),
  entity('Застава', 'microdistrict', ['Застава','Застава-1','Застава-2','Застава I','Застава II','Первая Застава','Перша Застава','Вторая Застава','Друга Застава']),
  entity('Слобідка', 'microdistrict', ['Слободка','Слобідка','Slobidka','Слободка Одесса','Слобідка Одеса']),
  entity('Молдаванка', 'microdistrict', ['Молдаванка','Moldavanka','Молдаванка Одесса','Молдаванка Одеса']),
  entity('Пересип', 'microdistrict', ['Пересыпь','Пересип','Peresyp','Пересип Одеса','Пересыпь Одесса']),
]);

export const ODESA_SUBURBS = Object.freeze([
  entity('Крижанівка', 'suburb', ['Крыжановка','Kryzhanivka','Kryzhanovka','с. Крыжановка','с. Крижанівка','село Крыжановка','село Крижанівка','Крыжановка Одесса','Крижанівка Одеса','район Крыжановки','район Крижанівки','Крыжановка / Котовского','Крижанівка / Котовського'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанська громада' }),
  entity('Ліски', 'suburb', ['Лески','Liski','Lisky','с. Лески','селище Ліски','поселок Лески','Лески Одесса','Ліски Одеса','Лески / Крыжановка','Ліски / Крижанівка','Лески / Фонтанка','Ліски / Фонтанка'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанська громада' }),
  entity('Фонтанка', 'suburb', ['Fontanka','с. Фонтанка','село Фонтанка','Фонтанка Одесса','Фонтанка Одеса','Одесса Фонтанка','Одеса Фонтанка','район Фонтанки','район Фонтанка','Fontanka Odesa','Fontanka Odessa'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанська громада' }),
  entity('Вапнярка', 'suburb', ['Вапнярка Одеса','Вапнярка Одесса','Vapniarka','Vapnyarka','село Вапнярка'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанська громада' }),
  entity('Нова Дофінівка', 'suburb', ['Новая Дофиновка','Нова Дофиновка','Nova Dofinivka','Novaya Dofinovka','Дофиновка','Дофінівка'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанська громада' }),
  entity('Олександрівка', 'suburb', ['Александровка','Oleksandrivka','Aleksandrovka','Александровка Одесса','Олександрівка Одеський район'], { parent: 'Фонтанська громада' }),
  entity('Світле', 'suburb', ['Светлое','Svitłe','Svitle','Светлое Одесса'], { parent: 'Фонтанська громада' }),
  entity('Авангард', 'suburb', ['Avanhard','Avangard','Авангард Одесса','Авангард Одеса','ж/м 7 Небо','7 Небо','Седьмое небо']),
  entity('Лиманка', 'suburb', ['Lymanka','Limanka','Лиманка Одесса','Лиманка Одеса','ж/м Радужный','Радужный массив','Райдужний масив','Мизикевича','Мізікевича','Mizikevycha','ж/м Мизикевича']),
  entity('Червоний Хутір', 'suburb', ['Червоный Хутор','Красный Хутор','Chervonyi Khutir']),
  entity('Таїрове', 'suburb', ['Таирово','Tairove','Tairovo','с. Таирово','смт Таїрове']),
]);

export const ODESA_DEVELOPMENT_AREAS = Object.freeze([
  entity('Совіньйон', 'development_area', ['Совиньон','Совіньйон','Sauvignon','Совиньон-1','Совиньон-2','Совиньон-3','Совиньон Марин Виллас']),
  entity('Чорноморська Рів’єра', 'development_area', ['Черноморская Ривьера','Чорноморська Рів\'єра','Black Sea Riviera','район Черноморской Ривьеры']),
]);

const MALL_CONTEXT = '(?:трц|тц|торгов(?:ый|ельний)|shopping|mall|возле|біля|рядом|напротив|навпроти|у\\s+ривьер|у\\s+рів.{0,2}єр)';

export const ODESA_RIVIERA_ENTITIES = Object.freeze([
  entity('ТРЦ Рів’єра', 'poi.shopping_mall', ['Ривьера','Ривьеры','Рів’єра','Рів’єри','Riviera','ТРЦ Ривьера','ТРЦ Рів’єра','Riviera Shopping City','Riviera Mall','ТЦ Ривьера','ТЦ Рів’єра'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанка', contextRequired: true, context: MALL_CONTEXT }),
  entity('Район ТРЦ Рів’єра', 'informal_area', ['район Ривьеры','район Рів’єри','у Ривьеры','возле Ривьеры','біля Рів’єри','рядом с Ривьерой','напротив Ривьеры','навпроти Рів’єри','Ривьера район','Riviera area'], { cluster: NORTH_EAST_CLUSTER, parent: 'Фонтанка' }),
  entity('Сади Рів’єри', 'residential_complex', ['Сады Ривьеры','Сади Рів’єри','Сады Ривьера','Сади Рів’єра','Riviera Gardens','Gardens of Riviera','Ривьера Сити','Рів’єра Сіті','Riviera City'], { parent: 'Фонтанка' }),
]);

export const ODESA_CONTEXT_POIS = Object.freeze([
  entity('Лузанівський пляж', 'poi.beach', ['пляж Лузановка','пляж Лузанівка'], { parent: 'Лузанівка', cluster: NORTH_EAST_CLUSTER }),
  entity('Лузанівський парк', 'poi.park', ['Лузановский парк','Лузанівський парк','Лузановский лес','Лузанівський ліс'], { parent: 'Лузанівка', cluster: NORTH_EAST_CLUSTER }),
  entity('Молода Гвардія', 'poi.landmark', ['Молодая Гвардия','Молода Гвардія'], { parent: 'Лузанівка', cluster: NORTH_EAST_CLUSTER }),
  entity('411-та батарея', 'poi.memorial', ['Мемориал 411 батареи','411 батарея Одесса']),
  entity('Південний ринок', 'poi.market', ['Южный рынок','Південний ринок','район Южного рынка','район Південного ринку']),
]);

export const ODESA_SEARCH_CLUSTERS = Object.freeze([
  Object.freeze({
    canonical: NORTH_EAST_CLUSTER,
    name: NORTH_EAST_CLUSTER,
    type: 'search_cluster',
    administrative: false,
    members: Object.freeze(['Житловий масив Котовського','Лузанівка','Крижанівка','Ліски','Фонтанка','ТРЦ Рів’єра','Вапнярка','Нова Дофінівка']),
  }),
]);

export const ODESA_METROPOLITAN_ENTITIES = Object.freeze([
  ...ODESA_LOCAL_AREAS,
  ...ODESA_MICRODISTRICT_EXTENSIONS,
  ...ODESA_SUBURBS,
  ...ODESA_DEVELOPMENT_AREAS,
  ...ODESA_RIVIERA_ENTITIES,
  ...ODESA_CONTEXT_POIS,
]);

function contextMatches(text, match, entity) {
  if (!entity.contextRequired || !entity.contextRe) return true;
  const start = match.index ?? 0;
  const end = start + match[0].length;
  const window = text.slice(Math.max(0, start - 48), Math.min(text.length, end + 48));
  return entity.contextRe.test(window);
}

export function matchOdesaMetropolitanEntities(value) {
  const text = String(value ?? '');
  if (!text) return Object.freeze({ matches: Object.freeze([]), searchClusters: Object.freeze([]) });

  const found = [];
  for (const item of ODESA_METROPOLITAN_ENTITIES) {
    const match = text.match(item.re);
    if (!match || !contextMatches(text, match, item)) continue;
    found.push({ item, start: match.index ?? 0, length: match[0].length });
  }

  found.sort((a, b) => a.start - b.start || b.length - a.length);
  const unique = [];
  const seen = new Set();
  for (const { item } of found) {
    const key = `${item.type}:${item.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  const clusterNames = [...new Set(unique.map((item) => item.cluster).filter(Boolean))];
  const searchClusters = ODESA_SEARCH_CLUSTERS.filter((cluster) => clusterNames.includes(cluster.name));
  return Object.freeze({ matches: Object.freeze(unique), searchClusters: Object.freeze(searchClusters) });
}

export function matchOdesaMetropolitanEntity(value, type = null) {
  const result = matchOdesaMetropolitanEntities(value);
  return result.matches.find((item) => !type || item.type === type) || null;
}
