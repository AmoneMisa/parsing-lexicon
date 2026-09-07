/** Domain-neutral parser primitives. They preserve source offsets and do not
 * interpret tokens; domain parsers emit candidates which are resolved later. */
const NORMALIZED_CHARS = Object.freeze({ '\u00a0': ' ', '\u202f': ' ', '\u2018': "'", '\u2019': "'", '\u02bc': "'", '\u2013': '-', '\u2014': '-', '\u2212': '-' });
const TOKEN_RE = /\d+(?:[.,]\d+)?(?:\s*(?:м²|м2|m²|m2|к|кв|br))?|\p{L}+(?:['’ʼ-]\p{L}+)*|[$€₽₴₸₾]|[,:;|/()\[\]{}-]|\S/gu;

export function normalizeParserText(value) {
  const originalText = String(value ?? '');
  let normalizedText = ''; const mapping = [];
  let pendingSpace = false; let spaceSource = 0;
  for (let index = 0; index < originalText.length; index += 1) {
    const raw = originalText[index]; const normalized = NORMALIZED_CHARS[raw] ?? raw.normalize('NFKC');
    if (/\s/u.test(normalized)) { if (normalizedText) { pendingSpace = true; spaceSource = index; } continue; }
    if (pendingSpace) { normalizedText += ' '; mapping.push(spaceSource); pendingSpace = false; }
    normalizedText += normalized; for (let offset = 0; offset < normalized.length; offset += 1) mapping.push(index);
  }
  return Object.freeze({ originalText, normalizedText, mapping: Object.freeze(mapping), toOriginalRange(start, end) {
    const safeStart = Math.max(0, Math.min(mapping.length, start));
    const safeEnd = Math.max(safeStart, Math.min(mapping.length, end));
    return Object.freeze({ start: mapping[safeStart] ?? originalText.length, end: safeEnd ? (mapping[safeEnd - 1] ?? originalText.length - 1) + 1 : mapping[safeStart] ?? originalText.length });
  } });
}

export function tokenizeParserText(value) {
  const normalized = typeof value === 'string' ? normalizeParserText(value) : value;
  const tokens = [];
  for (const match of normalized.normalizedText.matchAll(TOKEN_RE)) {
    const raw = match[0]; const start = match.index ?? 0; const end = start + raw.length;
    const kind = /^\d/u.test(raw) ? 'number' : /^[\p{L}]/u.test(raw) ? 'word' : /^[$€₽₴₸₾]$/u.test(raw) ? 'currency' : /^[,:;|/()\[\]{}-]$/u.test(raw) ? 'punctuation' : 'symbol';
    const original = normalized.toOriginalRange(start, end);
    tokens.push(Object.freeze({ index: tokens.length, raw: normalized.originalText.slice(original.start, original.end), normalized: raw, start: original.start, end: original.end, kind }));
  }
  return Object.freeze(tokens);
}

export function generateParserSpans(tokens, options = {}) {
  const maxTokens = Math.max(1, Math.min(8, Number(options.maxTokens) || 4)); const spans = [];
  for (let start = 0; start < tokens.length; start += 1) {
    for (let end = start + 1; end <= Math.min(tokens.length, start + maxTokens); end += 1) {
      const first = tokens[start]; const last = tokens[end - 1];
      spans.push(Object.freeze({ tokenStart: start, tokenEnd: end, start: first.start, end: last.end, raw: tokens.slice(start, end).map((token) => token.raw).join(' '), normalized: tokens.slice(start, end).map((token) => token.normalized).join(' ') }));
    }
  }
  return Object.freeze(spans);
}

export function createParseCandidate(input) {
  const candidate = { confidence: 0, evidence: [], metadata: {}, ...input };
  if (!candidate.id || !candidate.entityType || !Number.isFinite(candidate.start) || !Number.isFinite(candidate.end)) throw new TypeError('A parse candidate requires id, entityType, start and end');
  return Object.freeze({ ...candidate, evidence: Object.freeze([...candidate.evidence]), metadata: Object.freeze({ ...candidate.metadata }) });
}

export function resolveParseCandidates(candidates, options = {}) {
  const selected = []; const discarded = []; const compatibility = options.compatible || ((left, right) => left.entityType !== right.entityType || (left.end <= right.start || right.end <= left.start));
  const ordered = [...candidates].sort((a, b) => b.confidence - a.confidence || (b.end - b.start) - (a.end - a.start) || a.start - b.start || a.id.localeCompare(b.id));
  for (const candidate of ordered) {
    if (selected.every((existing) => compatibility(candidate, existing))) selected.push(candidate);
    else discarded.push(candidate);
  }
  return Object.freeze({ selected: Object.freeze(selected), discarded: Object.freeze(discarded) });
}

export function runCandidatePipeline(value, { parsers = [], refiners = [], resolver = resolveParseCandidates, context = {}, debug = false } = {}) {
  const normalized = normalizeParserText(value); const tokens = tokenizeParserText(normalized); const spans = generateParserSpans(tokens);
  let candidates = parsers.flatMap((parser) => parser({ originalText: normalized.originalText, normalizedText: normalized.normalizedText, tokens, spans, context }) || []);
  const refinersApplied = [];
  for (const refiner of refiners) { candidates = refiner(candidates, { originalText: normalized.originalText, normalizedText: normalized.normalizedText, tokens, spans, context }) || candidates; refinersApplied.push(refiner.name || 'anonymous'); }
  const resolved = resolver(candidates, context);
  return Object.freeze({ data: resolved.selected, ...(debug ? { debug: Object.freeze({ candidates: Object.freeze(candidates), discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(refinersApplied), tokens, spans }) } : {}) });
}
