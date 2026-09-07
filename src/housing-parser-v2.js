import { extractHousingMoneyCandidates, rankHousingPriceCandidates } from './housing-money.js';
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
  const candidates = Object.freeze([...extractHousingNumericCandidates(normalized.originalText, context), ...extractTemporalCandidates(normalized.originalText, { ...context, domain: 'real-estate' })]); const resolved = resolveParseCandidates(candidates);
  const data = {}; const confidence = {};
  for (const item of resolved.selected) { const key = item.entityType.replace(/^area\./u, 'area.'); data[key] = item.value; confidence[key] = item.confidence; }
  return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(confidence), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['numeric-context', 'money-ranking', 'temporal-context', 'conflict-resolver']) }) });
}
