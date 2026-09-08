import { extractHousingMoneyCandidates, rankHousingPriceCandidates } from './housing-money.js';
import { parseHousingAddress } from './housing-address.js';
import { createParseCandidate, normalizeParserText, resolveParseCandidates } from './parser-core.js';
import { extractTemporalCandidates } from './temporal.js';

const ROOM_RE = /(?<![\p{L}\p{N}_])(\d{1,2})\s*(?:-?\s*(?:к(?:омн\p{L}*)?|xona(?:li)?|хона(?:ли|лик)?|rooms?)|ta\s+xona)(?![\p{L}\p{N}_])/iu;
const FLOOR_RE = /(?<!\d)(\d{1,3})\s*[/\\]\s*(\d{1,3})(?!\s*[/\\]\s*\d)/u;
const AREA_RE = /(?<!\d)(\d{1,4}(?:[.,]\d{1,2})?)\s*(м²|м2|m²|m2|sqm|sq\.?\s*m|кв\.?\s*м)(?![\p{L}\p{N}_])/iu;
const DISTANCE_RE = /(?:(?:метро|м\.|metro|станц\p{L}*|bekat)[^\r\n\d]{0,24}(\d{1,4})\s*(мин\p{L}*|min(?:utes?)?|м|m)|(\d{1,4})\s*(мин\p{L}*|min(?:utes?)?|м|m)[^\r\n]{0,24}(?:метро|м\.|metro|станц\p{L}*|bekat))/iu;

function candidate(id, entityType, value, match, parser, confidence, evidence, metadata = {}) {
  const start = match?.index ?? 0; const raw = match?.[0] || '';
  return createParseCandidate({ id, entityType, value, raw, start, end: start + raw.length, parser, confidence, evidence, metadata });
}

function oneEditApart(left, right) {
  if (Math.abs(left.length - right.length) > 1) return false;
  let leftIndex = 0; let rightIndex = 0; let edits = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) { leftIndex += 1; rightIndex += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else { leftIndex += 1; rightIndex += 1; }
  }
  return true;
}

function componentRange(text, value) {
  const source = String(text ?? '');
  const needle = String(value ?? '').trim();
  if (!needle) return { start: 0, end: 0, raw: '' };
  const start = source.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());
  if (start >= 0) return { start, end: start + needle.length, raw: source.slice(start, start + needle.length) };

  // This only maps a source span after the lexical parser has already made a
  // deterministic canonical decision. It never makes a geo match itself; it
  // merely preserves the original range for one-character marketplace typos
  // such as Yashnobot -> Yashnobod.
  const normalizedNeedle = needle.toLocaleLowerCase();
  if (normalizedNeedle.length < 5 || /\s/u.test(normalizedNeedle)) return { start: 0, end: 0, raw: '' };
  for (const match of source.matchAll(/\p{L}[\p{L}'’ʼ-]{3,}/gu)) {
    if (!oneEditApart(match[0].toLocaleLowerCase(), normalizedNeedle)) continue;
    const offset = match.index ?? 0;
    return { start: offset, end: offset + match[0].length, raw: match[0] };
  }
  return { start: 0, end: 0, raw: '' };
}

function addressCandidate(id, entityType, value, text, confidence, evidence, metadata = {}, sourceValue = value) {
  const range = componentRange(text, sourceValue);
  if (!range.raw) return null;
  return createParseCandidate({ id, entityType, value, ...range, parser: 'housing.address.components', confidence, evidence, metadata });
}

/** Extract structured address and geo references without performing geocoding. */
export function extractHousingAddressCandidates(value, context = {}) {
  const text = String(value ?? '');
  if (!text) return Object.freeze([]);
  const address = parseHousingAddress(text, {
    country: context.country,
    city: context.city,
    resolveGeoEntity: context.resolveGeoEntity,
    knownStreet: context.knownStreet,
    knownStreets: context.knownStreets,
  });
  const confidence = address.confidence || 0.5;
  const candidates = [];
  const components = Object.freeze({
    address: address.address,
    street: address.street,
    houseNumber: address.houseNumber,
    building: address.building,
    unit: address.unit,
    level: address.level,
    entrance: address.entrance,
    staircase: address.staircase,
  });
  for (const [component, item] of Object.entries(components)) {
    if (!item) continue;
    const extracted = addressCandidate(`housing.address.${component}`, `address.${component}`, item, text, confidence, [{ type: 'address-component', value: component }]);
    if (extracted) candidates.push(extracted);
  }
  for (const component of ['district', 'metro', 'mahalla']) {
    if (!address[component]) continue;
    const extracted = addressCandidate(`housing.geo.${component}`, `geo.${component}`, address[component], text, confidence, [{ type: 'lexicon-geo', value: component }]);
    if (extracted) candidates.push(extracted);
  }
  for (const [component, reference] of Object.entries(address.geoEntities || {})) {
    const extracted = addressCandidate(`housing.geo-reference.${component}`, `geoReference.${component}`, reference, text, Math.max(confidence, 0.9), [{ type: 'geo-catalog-id', value: reference.id }], { component }, reference.canonical);
    if (extracted) candidates.push(extracted);
  }
  return Object.freeze(candidates);
}

/** Native candidate-based numeric housing vertical slice. */
export function extractHousingNumericCandidates(value, context = {}) {
  const text = String(value ?? ''); if (!text) return Object.freeze([]);
  const candidates = [];
  const roomMatch = text.match(ROOM_RE);
  if (roomMatch) candidates.push(candidate('housing.rooms', 'rooms', Number(roomMatch[1]), roomMatch, 'housing.rooms.marker', .96, [{ type: 'regex', rule: 'room-marker' }]));
  const floorMatch = text.match(FLOOR_RE);
  if (floorMatch && Number(floorMatch[1]) <= Number(floorMatch[2])) {
    candidates.push(candidate('housing.floor', 'floor', Number(floorMatch[1]), floorMatch, 'housing.floor.pair', .97, [{ type: 'regex', rule: 'floor-pair' }]));
    candidates.push(candidate('housing.totalFloors', 'totalFloors', Number(floorMatch[2]), floorMatch, 'housing.floor.pair', .97, [{ type: 'regex', rule: 'floor-pair' }]));
  }
  const areaMatch = text.match(AREA_RE);
  if (areaMatch) candidates.push(candidate('housing.area.total', 'area.total', Number(areaMatch[1].replace(',', '.')), areaMatch, 'housing.area.unit', .97, [{ type: 'unit', value: areaMatch[2] }]));
  const moneySource = rankHousingPriceCandidates(extractHousingMoneyCandidates(text, context))[0];
  if (moneySource) candidates.push(createParseCandidate({ id: 'housing.price', entityType: 'money', value: Object.freeze({ amount: moneySource.amount, currency: moneySource.currency, approximate: moneySource.approximate }), raw: text.slice(moneySource.start, moneySource.end), start: moneySource.start, end: moneySource.end, parser: 'housing.money.candidate-ranked', confidence: moneySource.confidence, evidence: [{ type: moneySource.explicitCurrency ? 'currency' : 'context', value: moneySource.explicitCurrency ? moneySource.currency : 'scaled-price' }], metadata: { paymentRole: moneySource.paymentRole } }));
  const distanceMatch = text.match(DISTANCE_RE);
  if (distanceMatch) {
    const amount = Number(distanceMatch[1] || distanceMatch[3]); const unit = distanceMatch[2] || distanceMatch[4];
    if (Number.isFinite(amount) && amount > 0) candidates.push(candidate('housing.distance', 'distance', { amount, unit: /^(?:м|m)$/iu.test(unit) ? 'meter' : 'minute' }, distanceMatch, 'housing.distance.contextual', .91, [{ type: 'context', value: 'transport' }, { type: 'unit', value: unit }]));
  }
  return Object.freeze(candidates);
}

export function parseHousingV2(value, context = {}) {
  const normalized = normalizeParserText(value);
  // Temporal extraction shares the same candidate resolver as numeric housing
  // entities, so one deterministic conflict policy covers the whole result.
  const candidates = Object.freeze([
    ...extractHousingNumericCandidates(normalized.originalText, context),
    ...extractHousingAddressCandidates(normalized.originalText, context),
    ...extractTemporalCandidates(normalized.originalText, { ...context, domain: 'real-estate' }),
  ]); const resolved = resolveParseCandidates(candidates);
  const data = {}; const confidence = {};
  for (const item of resolved.selected) { const key = item.entityType.replace(/^area\./u, 'area.'); data[key] = item.value; confidence[key] = item.confidence; }
  return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(confidence), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['numeric-context', 'address-components', 'geo-catalog-reference', 'money-ranking', 'temporal-context', 'conflict-resolver']) }) });
}
