import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';

const TYPE_MARKERS = Object.freeze([
  ['poi.university', /(?:university|uni\b|institute|academy|college|universitet|institut|universiteti|университет|универ|институт|академия)/iu],
  ['poi.school', /(?:school|lyceum|gymnasium|maktab|mektep|школа|лицей|гимназия|мектеп)/iu],
  ['poi.kindergarten', /(?:kindergarten|childcare|bogcha|bog['’ʻʼ`]cha|детск(?:ий|ого)\s+сад|садик|балабақша)/iu],
  ['poi.hospital', /(?:hospital|shifoxona|больниц\p{L}*|госпитал\p{L}*)/iu],
  ['poi.clinic', /(?:clinic|polyclinic|medical\s+cent(?:er|re)|klinika|поликлиник\p{L}*|клиник\p{L}*|медицинск\p{L}*\s+центр)/iu],
  ['poi.airport', /(?:airport|aeroport|аэропорт)/iu],
  ['poi.railway_station', /(?:railway\s+station|train\s+station|railway|temir\s+yol|вокзал|ж\.?д\.?\s*вокзал|железнодорожн\p{L}*\s+вокзал)/iu],
  ['poi.bus_station', /(?:bus\s+station|coach\s+station|автовокзал|автостанция|bus\s+terminal)/iu],
  ['poi.parking', /(?:parking|парковк\p{L}*|паркинг|автостоянк\p{L}*)/iu],
  ['poi.shopping_mall', /(?:shopping\s+(?:mall|cent(?:er|re))|mall\b|т[цр]\b|savdo\s+markaz)/iu],
  ['poi.market', /(?:market|bazaar|bozor|базар|рынок)/iu],
  ['poi.park', /(?:park|bog['’ʻʼ`]?|парк)/iu],
  ['metro', /(?:metro|metrosi|метро|м\.)/iu],
]);

const RELATION_RE = /(?<relation>рядом\s+(?:с|со)|возле|около|недалеко\s+от|напротив|за|перед|near(?:by)?|close\s+to|next\s+to|opposite|behind|in\s+front\s+of|yaqin(?:ida)?|yonida|ro['’ʻʼ`]?parasida|орналасқан\s+жерде|поруч|біля|поблизу|lângă|aproape\s+de)\s+(?<target>[^,;.!?\r\n]{2,96})/giu;
// Uzbek usually places the relation after the landmark: "Magic City yonida"
// rather than "yonida Magic City". Keep its target span separate so it never
// leaks into an address/street field.
const POSTFIX_RELATION_RE = /(?<target>[^,;.!?\r\n]{2,96}?)\s+(?<relation>yonida|yaqin(?:ida)?|ro['’ʻʼ`]?parasida)(?=$|[,;.!?\r\n])/giu;
const DISTANCE_RE = /(?<amount>\d{1,3}(?:[.,]\d+)?)\s*(?<unit>km|км|min(?:ute)?s?|мин(?:ут(?:ы|а|ах)?)?|дақиқа|daqiqa|метр(?:а|ов)?|m)\s*(?<mode>пешком|пішки|walking?|yayov|piyoda|на\s+машине|by\s+car)?\s*(?:до|от|from|to|до\s+станции)\s+(?<target>[^,;.!?\r\n]{2,96})/giu;

function cleanTarget(value) {
  return String(value || '')
    .replace(/\b(?:на\s+машине|пешком|пішки|walking?|piyoda|yayov)\b/giu, ' ')
    .replace(/(?<!\p{L})(\p{L}{3,})(?:ga|qa|ka)(?!\p{L})/giu, '$1')
    .replace(/\s+/g, ' ').trim();
}

function relationKind(value) {
  const text = String(value || '').toLowerCase();
  if (/напротив|opposite|ro['’ʻʼ`]?parasida/u.test(text)) return 'opposite';
  if (/behind|\bза\b/u.test(text)) return 'behind';
  if (/in\s+front|\bперед\b/u.test(text)) return 'in_front_of';
  return 'near';
}

function markerTypes(value) {
  return TYPE_MARKERS.filter(([, re]) => re.test(value)).map(([type]) => type);
}

function normalizeReference(candidate, country, city) {
  if (!candidate?.id || !candidate?.canonicalName && !candidate?.canonical) return null;
  if (candidate.country && String(candidate.country).toUpperCase() !== country) return null;
  if (city && candidate.parentId && !String(candidate.parentId).toLowerCase().includes(String(city).toLowerCase())) return null;
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
  const bareQuery = types.includes('metro') ? query.replace(/\b(?:metrosi|metro|метро|м\.)\b/giu, ' ').replace(/\s+/g, ' ').trim() : query;
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
  if (/^(?:min|мин|дақиқа|daqiqa)/u.test(unit)) {
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
  for (const pattern of [RELATION_RE, POSTFIX_RELATION_RE, DISTANCE_RE]) {
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
