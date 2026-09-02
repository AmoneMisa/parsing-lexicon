import { deepFreeze } from './lexicon-core.js';
import { parseHousingAmenities } from './housing-text.js';

const AMENITY_LABELS = Object.freeze({
  dishwasher: 'Dishwasher',
  separateRooms: 'Separate rooms',
  washingMachine: 'Washing machine',
  television: 'Television',
  bedLinen: 'Bed linen',
  towels: 'Towels',
});

const STREET_LIKE_PLACE_RE = /(?:^|[^\p{L}\p{N}_])(?:ko['’`ʼʻ]?cha(?:si)?|кўча(?:си)?|yo['’`ʼʻ]?l(?:i)?|yoli|street|road|avenue|улица|вулиця|дорога|шоссе|проспект)(?=$|[^\p{L}\p{N}_])/iu;

const SHOP_CHAINS = Object.freeze([
  ['Korzinka', /korzinka|корзинка/iu],
  ['Makro', /(?:^|[^\p{L}\p{N}_])makro(?=$|[^\p{L}\p{N}_])|макро/iu],
  ['Havas', /(?:^|[^\p{L}\p{N}_])[хxh]avas(?=$|[^\p{L}\p{N}_])|хавас/iu],
  ['Carrefour', /carrefour|карфур/iu],
  ['ATB', /(?:^|[^\p{L}\p{N}_])(?:атб|atb)(?=$|[^\p{L}\p{N}_])/iu],
  ['Klass', /(?:^|[^\p{L}\p{N}_])(?:klass|класс)(?=$|[^\p{L}\p{N}_])/iu],
  ['Magnum', /magnum|магнум/iu],
  ['Bravo', /(?:^|[^\p{L}\p{N}_])bravo(?=$|[^\p{L}\p{N}_])|браво/iu],
  ['Metro C&C', /(?:^|[^\p{L}\p{N}_])metro\s*(?:cash|c\s*&\s*c|market)|метро\s*кэш/iu],
]);

const PLACE_KINDS = Object.freeze([
  ['Рынок', /(?:рынок|базар|bozor)\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24})/u],
  ['ЗАГС', /(?:^|[^\p{L}\p{N}_])ЗАГС(?:\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24}(?:\s+район\p{L}*)?))?/u],
  ['Парк', /парк\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24})/u],
  ['Школа', /школа\s*(№\s*\d{1,4})/iu],
  ['Клиника', /(?:клиника|поликлиника|больница)\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24})/u],
  ['Стадион', /стадион\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24})/u],
  ['Университет', /(?:университет|институт)\s+([A-ZА-ЯЁ][\p{L}\p{N}_'’-]{2,24})/u],
]);

const NEARBY_BLOCK_RE = /(?:^|\n)[^\n]{0,30}?(?:что\s+(?:есть|находится)\s+р[яa]дом|р[яa]дом(?:\s+(?:есть|находятся|расположены|с\s+домом))?|непода[лл][её]ку|поблизости|в\s+шаговой\s+доступности|окружени[ие]|ориентир(?:ы|ами)?|yaqinida|atrofida|yonida|nearby|landmarks?)\s*[:—-]?\s*([^\n]{4,500})/iu;
const NEARBY_NOISE_RE = /^(?:и|а|в|на|у|до|от|все|вс[её]|есть|рядом|близко|недалеко|минут\p{L}*|пешком|транспорт|остановк\p{L}*|магазин|магазины|аптека|аптеки|садик|садики|всё\s+необходимое|развит\p{L}*)$/iu;
const NEARBY_FILLER_RE = /(?:инфраструктур\p{L}*|все\s+необходимо|вс[её]\s+рядом|шаговой\s+доступност|развитый\s+район)/iu;

function enumeratedNearby(text) {
  const blocks = [...text.matchAll(new RegExp(NEARBY_BLOCK_RE.source, `${NEARBY_BLOCK_RE.flags}g`))]
    .map((match) => match[1])
    .filter(Boolean);
  const seen = new Set();
  const items = [];
  for (const item of blocks.join(', ').split(/[,;•·|]+/).map((part) => part
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—.]+|[\s\-–—.!]+$/g, '')
    .trim())) {
    if (item.length < 3 || item.length > 45 || NEARBY_NOISE_RE.test(item) || NEARBY_FILLER_RE.test(item)) continue;
    if (!/\p{L}{3,}/u.test(item)) continue;
    const key = item.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= 14) break;
  }
  return items;
}

export function parseHousingQuarterLabel(value) {
  const text = String(value || '');
  if (!text) return null;
  if (/(?:^|[^\p{L}\p{N}_])(?:глинк[аи]?|glinka)(?:$|[^\p{L}\p{N}_])/iu.test(text)) return 'Glinka';
  const match = text.match(/(\d{1,3})\s*(?:-?\s*(?:chi|чи))?\s*[-\s]?\s*(?:квартал|кв-?л(?=$|[^\p{L}\p{N}_])|kvartal(?:i)?|квартил|kvartil|мкр(?=$|[^\p{L}\p{N}_])|микрорайон|массив|massiv|daha(?:si|dan)?|hudud|худуд)/iu)
    || text.match(/(?:квартал|kvartal(?:i)?|квартил|kvartil|мкр|микрорайон|массив|massiv|daha(?:si|dan)?|hudud|худуд)\s*[-№#]?\s*(\d{1,3})/iu)
    || text.match(/(?:чиланзар|chilonzor|chilanzar)\s*[-№#]?\s*(\d{1,2})(?!\d)/iu);
  if (match) {
    const label = `${Number(match[1])} kvartal`;
    return STREET_LIKE_PLACE_RE.test(label) ? null : label;
  }
  const centralBlock = text.match(/(?:^|[^\p{L}\p{N}_])(?:ц|c)\s*[-–]?\s*(\d{1,2})(?:$|[^\p{L}\p{N}_])/iu);
  return centralBlock ? `C-${Number(centralBlock[1])}` : null;
}

export function parseHousingCardAmenities(value) {
  const amenities = parseHousingAmenities(value)
    .filter((name) => AMENITY_LABELS[name])
    .map((name) => AMENITY_LABELS[name]);
  return deepFreeze(amenities);
}

export function parseHousingNearbyMentions(value) {
  const text = String(value || '');
  if (!text) return deepFreeze([]);
  const out = enumeratedNearby(text);
  for (const [kind, pattern] of PLACE_KINDS) {
    const match = text.match(pattern);
    if (!match) continue;
    const label = match[1] ? `${kind} ${match[1].trim()}` : kind;
    if (out.some((item) => item.toLocaleLowerCase().includes(kind.toLocaleLowerCase()))) continue;
    if (!out.includes(label)) out.push(label);
  }
  return deepFreeze(out.slice(0, 16));
}

export function parseHousingNearbyShops(value) {
  const text = String(value || '');
  if (!text) return deepFreeze([]);
  const out = SHOP_CHAINS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const namedMall = text.match(/([A-Za-z][A-Za-z'’.&-]*(?:\s+[A-Za-z][A-Za-z'’.&-]*){0,3}\s+(?:mall|moll|молл))/iu)?.[1]?.trim();
  if (namedMall && !out.includes(namedMall)) out.push(namedMall);
  const shoppingCenter = text.match(/(?:трц|тц)\s+([A-Za-z0-9'’.-]{2,25}|[А-Яа-яЁё0-9'’.-]{2,25})/iu)?.[1]?.trim();
  if (shoppingCenter && !out.includes(`ТРЦ ${shoppingCenter}`)) out.push(`ТРЦ ${shoppingCenter}`);
  return deepFreeze(out);
}
