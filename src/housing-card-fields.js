import { deepFreeze } from './lexicon-core.js';
import { parseHousingAmenities } from './housing-text.js';
import { housingSemanticCanonical } from './housing-display.js';

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

const NEARBY_CATEGORY_ALIASES = [
  ['park', ['park', 'парк']],
  ['school', ['school', 'школа']],
  ['market', ['market', 'рынок', 'ринок', 'базар']],
  ['stadium', ['stadium', 'стадион', 'стадіон']],
  ['clinic', ['clinic', 'клиника', 'клініка']],
];

/**
 * De-duplicates a raw list of nearby-place mentions: collapses generic terms
 * ("park"/"парк"/"парки") onto their shared canonical identity, then drops a
 * bare category name ("park") when a more specific mention of that category
 * ("Central park") is already present.
 */
export function dedupeHousingNearbyMentions(values) {
  const unique = [];
  const seen = new Set();
  for (const raw of values || []) {
    const value = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!value) continue;
    const key = housingSemanticCanonical(value).toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(value);
  }

  const categoryForExact = (value) => {
    const key = value.toLocaleLowerCase();
    return NEARBY_CATEGORY_ALIASES.find(([, aliases]) => aliases.includes(key))?.[0] || null;
  };
  const hasSpecific = (category) => {
    const aliases = NEARBY_CATEGORY_ALIASES.find(([name]) => name === category)?.[1] || [];
    return unique.some((value) => {
      const key = value.toLocaleLowerCase();
      if (aliases.includes(key)) return false;
      return aliases.some((alias) => key.startsWith(`${alias} `) || key.endsWith(` ${alias}`));
    });
  };

  return unique.filter((value) => {
    const category = categoryForExact(value);
    return !category || !hasSpecific(category);
  });
}

// EN / RO / RU / UA / UZ / KZ keyword patterns for deriving human-friendly
// listing-card tags from free-text title + description.
export const HOUSING_LISTING_KEYWORD_TAGS = Object.freeze([
  ['furnished', /\b(furnished|mobilat|mebl|меблюванн|мебльован|с мебелью|обставлен|jihozlangan|jihozli|жиһаз)/i],
  ['unfurnished', /\b(unfurnished|nemobilat|без мебел|без меблів|jihozsiz|жиһazsіz|жиһазсыз)/i],
  ['renovated', /\b(renovat|euro ?renov|євроремонт|ремонт|отремонт|reamenajat|с ремонтом|ta'?mirlangan|remont|жөндел|жөндеу)/i],
  ['new build', /\b(new build|bloc nou|constructie noua|новострой|новобуд|новостро|yangi qurilgan|novostroyka|жаңа құрыл)/i],
  ['parking', /\b(parking|parcare|garaj|garage|гараж|парков|парко-?місц|avtoturargoh|avtomobil joyi|автотұрақ|көлік)/i],
  ['balcony', /\b(balcony|balcon|балкон|лоджи|лоджі|balkon|балкон)/i],
  ['elevator', /\b(elevator|lift|ліфт|лифт|lift|лифт)/i],
  ['pets ok', /\b(pets? ?(allowed|ok)|se accepta animale|можно с животными|з тваринами|uy hayvon|жануар)/i],
  ['no agency', /\b(no agency|fara intermediari|fără comision|без посредник|без агент|собственник|власник|від власника|vositachisiz|egasidan|иесінен)/i],
  ['utilities included', /\b(utilities included|utilitati incluse|комунальні включ|коммунальн.*включ|kommunal)/i],
  ['studio', /\b(studio|garsonier|студи[яї]|studiya)/i],
  ['air conditioning', /\b(air ?condition|\ba\/?c\b|conditioner|кондиционер|кондиціонер|konditsioner|klimat|klima\b|aer condi[țt]ionat)/i],
  ['microwave', /\b(microwave|микроволнов|мікрохвильов|mikroto'?lqinli|mikrovolnovka|cuptor cu microunde|СВЧ)/i],
  ['dishwasher', /\b(dishwasher|посудомо|посудомийн|idish yuvish|idishyuvg|ma[șs]ina de sp[ăa]lat vase)/i],
  ['washing machine', /\b(washing ?machine|стиральн(?:ая|ой) маш|пральн(?:а|ої) маш|kir yuvish|kir mashina|ma[șs]ina de sp[ăa]lat rufe)/i],
  ['central heating', /\b(central heating|centrala termica|central[ăa]|центральн.*отопл|опаленн|isitish|жылу)/i],
  ['pool', /\b(pool|piscina|бассейн|басейн|basseyn)/i],
  ['negotiable', /\b(negotiable|negociabil|торг(?! центр)|можен торг|kelishilgan|kelishamiz|келісім)/i],
  ['for rent', /\b(for rent|de inchiriat|inchiriere|оренда|аренда|сдам|сдаётся|здам|ijara|arenda|жалға)/i],
  ['for sale', /\b(for sale|de vanzare|vanzare|продаж|продажа|продам|продаётся|sotiladi|sotuv|сатылады)/i],
]);

export function matchHousingListingKeywordTags(text) {
  const value = String(text || '').toLowerCase();
  const tags = [];
  for (const [tag, re] of HOUSING_LISTING_KEYWORD_TAGS) {
    if (re.test(value)) tags.push(tag);
  }
  return deepFreeze(tags);
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
