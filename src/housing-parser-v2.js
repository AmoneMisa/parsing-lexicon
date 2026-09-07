import { parseHousingAreas, parseHousingFloor, parseHousingRoomCount } from './housing-structured.js';
import { extractHousingMoneyCandidates, parseHousingPrice, rankHousingPriceCandidates } from './housing-money.js';
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

/** Candidate-only numeric vertical slice; legacy APIs remain the production path. */
export function extractHousingNumericCandidates(value, context = {}) {
  const text = String(value ?? ''); if (!text) return Object.freeze([]);
  const candidates = [];
  const rooms = parseHousingRoomCount(text); const roomMatch = text.match(ROOM_RE);
  if (rooms != null) candidates.push(candidate('housing.rooms', 'rooms', rooms, roomMatch, 'housing.rooms.legacy-backed', roomMatch ? .96 : .72, [{ type: 'regex', rule: roomMatch ? 'room-marker' : 'room-lexicon' }]));
  const floor = parseHousingFloor(text); const floorMatch = text.match(FLOOR_RE);
  if (floor.floor != null) candidates.push(candidate('housing.floor', 'floor', floor.floor, floorMatch, 'housing.floor.legacy-backed', floorMatch ? .97 : .78, [{ type: 'regex', rule: floorMatch ? 'floor-pair' : 'floor-marker' }]));
  if (floor.totalFloors != null) candidates.push(candidate('housing.totalFloors', 'totalFloors', floor.totalFloors, floorMatch, 'housing.floor.legacy-backed', floorMatch ? .97 : .78, [{ type: 'regex', rule: floorMatch ? 'floor-pair' : 'floor-marker' }]));
  const areas = parseHousingAreas(text, context); const areaMatch = text.match(AREA_RE);
  for (const [kind, amount] of Object.entries(areas)) if (amount != null) candidates.push(candidate(`housing.area.${kind}`, `area.${kind}`, amount, areaMatch, 'housing.area.legacy-backed', areaMatch ? .97 : .74, [{ type: 'unit', value: areaMatch?.[2] || 'contextual-area' }]));
  const money = parseHousingPrice(text, context); const rankedMoney = rankHousingPriceCandidates(extractHousingMoneyCandidates(text, context));
  const moneySource = rankedMoney.find((entry) => entry.amount === money.amount && (!money.currency || entry.currency === money.currency));
  if (money.amount != null) candidates.push(createParseCandidate({ id: 'housing.price', entityType: 'money', value: money, raw: moneySource ? text.slice(moneySource.start, moneySource.end) : String(money.amount), start: moneySource?.start ?? 0, end: moneySource?.end ?? String(money.amount).length, parser: 'housing.money.candidate-ranked', confidence: moneySource?.confidence ?? .65, evidence: [{ type: moneySource?.explicitCurrency ? 'currency' : 'context', value: moneySource?.explicitCurrency ? money.currency : 'legacy-fallback' }], metadata: { paymentRole: moneySource?.paymentRole || 'listing' } }));
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
  // entities. The legacy structured result remains untouched during migration.
  const candidates = Object.freeze([...extractHousingNumericCandidates(normalized.originalText, context), ...extractTemporalCandidates(normalized.originalText, { ...context, domain: 'real-estate' })]); const resolved = resolveParseCandidates(candidates);
  const data = {}; const confidence = {};
  for (const item of resolved.selected) { const key = item.entityType.replace(/^area\./u, 'area.'); data[key] = item.value; confidence[key] = item.confidence; }
  return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(confidence), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['numeric-context', 'money-ranking', 'temporal-context', 'conflict-resolver']) }) });
}

export function compareHousingParsers(value, context = {}) {
  const legacy = Object.freeze({ rooms: parseHousingRoomCount(value), ...parseHousingFloor(value), areas: parseHousingAreas(value, context), price: parseHousingPrice(value, context) });
  const v2 = parseHousingV2(value, context); const differences = Object.entries(v2.data).filter(([key, item]) => JSON.stringify(item) !== JSON.stringify(legacy[key])).map(([key]) => key);
  return Object.freeze({ legacy, v2, differences: Object.freeze(differences) });
}
