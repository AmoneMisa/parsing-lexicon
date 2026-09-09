import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';
import { canonicalCity } from './geography.js';

const TYPE_MARKERS = Object.freeze([
  ['poi.university', /(?:university|uni\b|institute|academy|college|universitet|institut|universiteti|университет|универ|институт|академия)/iu],
  ['poi.school', /(?:school|lyceum|gymnasium|maktab|mektep|школа|лицей|гимназия|мектеп)/iu],
  ['poi.kindergarten', /(?:kindergarten|childcare|bogcha|bog['’ʻʼ`]cha|детск(?:ий|ого)\s+сад|садик|балабақша)/iu],
  ['poi.hospital', /(?:hospital|shifoxona|больниц\p{L}*|госпитал\p{L}*)/iu],
  ['poi.clinic', /(?:clinic|polyclinic|medical\s+cent(?:er|re)|klinika|поликлиник\p{L}*|клиник\p{L}*|медицинск\p{L}*\s+центр)/iu],
  ['poi.airport', /(?:airport|aeroport|аэропорт|аеропорт|әуежай)/iu],
  ['poi.railway_station', /(?:railway\s+station|train\s+station|railway|gar[ăa]|temir\s+yo['’ʻʼ`]?l|темир\s+йўл|темір\s*жол|залізничн\p{L}*\s+вокзал|вокзал|ж\.?д\.?\s*вокзал|железнодорожн\p{L}*\s+вокзал)/iu],
  ['poi.bus_station', /(?:bus\s+station|coach\s+station|автовокзал|автостанц\p{L}*|avtovokzal|avtostansiya|autogar[ăa]|bus\s+terminal)/iu],
  ['poi.parking', /(?:parking|car\s+park|парковк\p{L}*|паркінг|паркуван\p{L}*|паркинг|автостоянк\p{L}*|avtoturargoh|автотұрақ|көлік\s+тұра)/iu],
  ['poi.shopping_mall', /(?:shopping\s+(?:mall|cent(?:er|re))|mall\b|т[цр]\b|savdo\s+markaz)/iu],
  ['poi.supermarket', /(?:supermarket|супермаркет|гипермаркет|магазин)/iu],
  ['poi.market', /(?:market|bazaar|bozor|базар|рынок)/iu],
  ['poi.park', /(?:park|bog['’ʻʼ`]?|парк)/iu],
  ['metro', /(?:metro|metrosi|метро|м\.)/iu],
]);

const RELATION_RE = /(?<relation>рядом\s+(?:с|со)|возле|около|недалеко\s+от|напротив|навпроти|за|перед|позаду|near(?:by)?|close\s+to|next\s+to|opposite|behind|in\s+front\s+of|yaqin(?:ida)?|yonida|ro['’ʻʼ`]?parasida|орналасқан\s+жерде|жанында|қасында|жакын|каршысында|қарсысында|артында|алдында|поруч|біля|поблизу|lângă|aproape\s+de|în\s+apropiere\s+de|vizavi\s+de|în\s+spatele|în\s+fața)\s+(?<target>[^,;.!?\r\n]{2,96})/giu;
const POSTFIX_RELATION_RE = /(?<target>[^,;.!?\r\n]{2,96}?)\s+(?<relation>yonida|yaqin(?:ida)?|ro['’ʻʼ`]?parasida|жанында|қасында|жакын|каршысында|қарсысында|артында|алдында)(?=$|[,;.!?\r\n])/giu;
const DISTANCE_UNIT = String.raw`(?:km|км|min(?:ute)?s?|мин(?:ут(?:ы|а|ах)?)?|хв(?:илин(?:и|у)?)?|дақиқа|daqiqa|метр(?:а|ов|ів)?|m)`;
const DISTANCE_MODE = String.raw`(?:пешком|пішки|walking?|yayov|piyoda|на\s+машине|by\s+car)`;
const DISTANCE_RE = new RegExp(String.raw`(?<amount>\d{1,3}(?:[.,]\d+)?)\s*(?<unit>${DISTANCE_UNIT})\s*(?<mode>${DISTANCE_MODE})?\s*(?:до|от|from|to|до\s+станции)\s+(?<target>[^,;.!?\r\n]{2,96})`, 'giu');
const POSTFIX_DISTANCE_RE = new RegExp(String.raw`(?<target>[^,;.!?\r\n]{2,96}?)\s+(?<amount>\d{1,3}(?:[.,]\d+)?)\s*(?<unit>${DISTANCE_UNIT})(?:\s*(?<mode>${DISTANCE_MODE}))?(?=$|[,;.!?\r\n])`, 'giu');

function cleanTarget(value) {
  return String(value || '')
    .replace(/\b(?:на\s+машине|пешком|пішки|walking?|piyoda|yayov)\b/giu, ' ')
    .replace(/\s+/g, ' ').trim();
}

function relationKind(value) {
  const text = String(value || '').toLowerCase();
  if (/напротив|навпроти|opposite|vizavi|ro['’ʻʼ`]?parasida|каршысында|қарсысында/u.test(text)) return 'opposite';
  if (/behind|за|позаду|în\s+spatele|артында/u.test(text)) return 'behind';
  if (/in\s+front|\bперед\b|în\s+fața|алдында/u.test(text)) return 'in_front_of';
  return 'near';
}

function markerTypes(value) {
  return TYPE_MARKERS.filter(([, re]) => re.test(value)).map(([type]) => type);
}

function stripLeadingTypeMarker(value) {
  return String(value || '')
    .replace(/^(?:supermarket|супермаркет|гипермаркет|магазин|shopping\s+(?:mall|cent(?:er|re))|mall|т[цр]|savdo\s+markaz)\s+/iu, '')
    .replace(/\s+/g, ' ').trim();
}

function parentMatchesCity(parentId, city, country) {
  if (!city || !parentId) return true;
  const expected = canonicalCity(city, country);
  if (!expected) return true;
  const parentCities = String(parentId)
    .split(/[:/]/u)
    .map((part) => canonicalCity(part, country))
    .filter(Boolean);
  // A resolver was already given the city scope. Reject only when its stable
  // parent ID identifies a *different known city*; a catalog's local-language
  // slug (e.g. Bucuresti) is a valid alias of the caller's canonical city.
  return parentCities.length === 0 || parentCities.includes(expected);
}

function normalizeReference(candidate, country, city) {
  if (!candidate?.id || !candidate?.canonicalName && !candidate?.canonical) return null;
  if (candidate.country && String(candidate.country).toUpperCase() !== country) return null;
  if (!parentMatchesCity(candidate.parentId, city, country)) return null;
  return Object.freeze({
    id: String(candidate.id),
    canonical: String(candidate.canonicalName || candidate.canonical),
    type: String(candidate.type || 'poi'),
    country: country || String(candidate.country || ''),
    ...(candidate.parentId ? { parentId: String(candidate.parentId) } : {}),
  });
}

function resolveTarget(target, context) {
  if (typeof context.resolveGeoCandidates !== 'function') return [];
  const types = markerTypes(target);
  const query = cleanTarget(target) || String(target).trim();
  const bareQuery = types.includes('metro')
    ? query.replace(/\b(?:metrosi|metro|метро|м\.)\b/giu, ' ').replace(/\s+/g, ' ').trim()
    : stripLeadingTypeMarker(query);
  for (const currentQuery of [...new Set([query, bareQuery])].filter((item) => item.length >= 2)) {
    const resolved = context.resolveGeoCandidates(Object.freeze({
      country: context.country,
      ...(context.city ? { city: context.city } : {}),
      query: currentQuery,
      ...(types.length ? { types: Object.freeze(types) } : {}),
    }));
    if (!Array.isArray(resolved)) continue;
    const references = resolved.map((candidate) => normalizeReference(candidate, context.country, context.city)).filter(Boolean).slice(0, 4);
    if (references.length) return references;
  }
  return [];
}

function distanceDetails(groups) {
  const amount = Number(String(groups.amount || '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return {};
  const unit = String(groups.unit || '').toLowerCase();
  if (/^(?:km|км)$/u.test(unit)) return { distanceMeters: Math.round(amount * 1000) };
  if (/^(?:min|мин|хв|дақиқа|daqiqa)/u.test(unit)) {
    const mode = /пешком|пішки|walking|yayov|piyoda/iu.test(groups.mode || '') ? 'walk'
      : /машине|by\s+car/iu.test(groups.mode || '') ? 'drive' : 'unknown';
    return { durationMinutes: Math.round(amount), mode };
  }
  if (/^(?:m|метр)/u.test(unit)) return { distanceMeters: Math.round(amount) };
  return {};
}

/** Extract stable catalog references for proximity statements; never returns coordinates. */
export function extractHousingPoiRelations(value, { country = '', city = '', resolveGeoCandidates } = {}) {
  const text = normalizeUnicode(value ?? '');
  const normalizedCountry = String(country || '').toUpperCase();
  if (!text || !normalizedCountry || typeof resolveGeoCandidates !== 'function') return deepFreeze([]);
  const context = { country: normalizedCountry, city, resolveGeoCandidates };
  const relations = [];
  for (const pattern of [RELATION_RE, POSTFIX_RELATION_RE, DISTANCE_RE, POSTFIX_DISTANCE_RE]) {
    for (const match of text.matchAll(pattern)) {
      const groups = match.groups || {};
      const target = groups.target || '';
      for (const entity of resolveTarget(target, context)) {
        relations.push({
          relation: groups.relation ? relationKind(groups.relation) : 'travel_time',
          target: entity,
          confidence: markerTypes(target).length ? 0.94 : 0.78,
          ...distanceDetails(groups),
        });
      }
    }
  }
  const seen = new Set();
  return deepFreeze(relations.filter((item) => {
    const key = `${item.relation}|${item.target.id}|${item.distanceMeters ?? ''}|${item.durationMinutes ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12));
}
