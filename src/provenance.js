/** Where a parsed field value came from, and which of two competing values
 * wins. The ordering is the point: a structured source outranks a
 * deterministic parser, which outranks a semantic fallback read out of free
 * text, which outranks AI enrichment. AI output can fill a gap but must never
 * overwrite something deterministic, however confident it claims to be. */

export const PROVENANCE_SOURCES = Object.freeze({
  structured_api: 4,
  source_adapter: 3,
  labelled_field: 2,
  description: 1,
  ai_enrichment: 0,
});

export const PROVENANCE_ORDER = Object.freeze(Object.keys(PROVENANCE_SOURCES).sort((a, b) => PROVENANCE_SOURCES[b] - PROVENANCE_SOURCES[a]));

export function createProvenance(input) {
  const { source, parser, observedAt, confidence, start, end, ...extra } = input ?? {};
  if (!Object.hasOwn(PROVENANCE_SOURCES, source)) throw new TypeError(`Unknown provenance source: ${String(source)}`);
  if (confidence !== undefined && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) throw new TypeError('Provenance confidence must be a number from 0 to 1');
  const hasStart = start !== undefined, hasEnd = end !== undefined;
  if (hasStart !== hasEnd) throw new TypeError('A provenance range needs both start and end');
  if (hasStart && (!Number.isFinite(start) || !Number.isFinite(end) || end < start)) throw new TypeError('A provenance range must be finite with end >= start');
  if (observedAt !== undefined && Number.isNaN(Date.parse(observedAt))) throw new TypeError('Provenance observedAt must be an ISO timestamp');
  return Object.freeze({
    source,
    ...(parser === undefined ? {} : { parser }),
    ...(observedAt === undefined ? {} : { observedAt }),
    ...(confidence === undefined ? {} : { confidence }),
    ...(hasStart ? { start, end } : {}),
    ...extra,
  });
}

export const provenanceRank = provenance => PROVENANCE_SOURCES[provenance?.source] ?? -1;
export const isDeterministic = provenance => provenanceRank(provenance) > PROVENANCE_SOURCES.ai_enrichment;

/** True when `incoming` should replace `current`. Ties are broken by
 * confidence and then recency; an exact tie keeps what is already there, so
 * re-running a parse never churns stored data. */
export function shouldReplaceProvenance(current, incoming) {
  if (!incoming) return false;
  if (!current) return true;
  const currentRank = provenanceRank(current), incomingRank = provenanceRank(incoming);
  if (incomingRank !== currentRank) return incomingRank > currentRank;
  const currentConfidence = current.confidence ?? 0, incomingConfidence = incoming.confidence ?? 0;
  if (incomingConfidence !== currentConfidence) return incomingConfidence > currentConfidence;
  if (incoming.observedAt && current.observedAt) return Date.parse(incoming.observedAt) > Date.parse(current.observedAt);
  return false;
}

export function createProvenancedValue(value, provenance) {
  return Object.freeze({ value, provenance: provenance && !Object.isFrozen(provenance) ? createProvenance(provenance) : provenance });
}

/** Picks the winning field. A missing incoming value never erases a known one:
 * absence is not evidence, and a scrape that simply failed to see a field must
 * not delete what a better source already established. */
export function mergeProvenancedValue(current, incoming) {
  if (!incoming || incoming.value === undefined || incoming.value === null || incoming.value === '') return current;
  if (!current || current.value === undefined || current.value === null || current.value === '') return incoming;
  return shouldReplaceProvenance(current.provenance, incoming.provenance) ? incoming : current;
}

/** Merges two records of provenanced fields, field by field. */
export function mergeProvenancedRecord(current = {}, incoming = {}) {
  const result = {};
  for (const key of new Set([...Object.keys(current), ...Object.keys(incoming)])) {
    const merged = mergeProvenancedValue(current[key], incoming[key]);
    if (merged !== undefined) result[key] = merged;
  }
  return Object.freeze(result);
}
