import test from 'node:test';
import assert from 'node:assert/strict';
import { createParseCandidate, resolveParseCandidates } from '../src/parser-core.js';
import { resolveEvidenceCandidates, scoreEvidenceCandidate, DEFAULT_BEAM_WIDTH } from '../src/resolver-v2.js';

const ev = (dimension, source, weight = 1, extra = {}) => ({ dimension, source, weight, ...extra });
const cand = (id, entityType, start, end, input = {}) => createParseCandidate({ id, entityType, start, end, ...input });
const ids = list => list.map(item => item.id);

test('a candidate with a ledger is scored by its evidence', () => {
  const candidate = cand('a', 'geo', 0, 5, { confidence: 0.1, evidence: [ev('lexical', 'title'), ev('structural', 'body')] });
  assert.equal(scoreEvidenceCandidate(candidate), 2);
});

test('a candidate without a ledger falls back to its legacy confidence', () => {
  assert.equal(scoreEvidenceCandidate(cand('a', 'geo', 0, 5, { confidence: 0.75 })), 0.75);
  assert.equal(scoreEvidenceCandidate(cand('a', 'geo', 0, 5, { confidence: 0.75, evidence: [{ type: 'legacy' }] })), 0.75);
});

test('source priority and section relevance adjust the score', () => {
  const candidate = cand('a', 'geo', 0, 5, { parser: 'osm', evidence: [ev('lexical', 'title')], metadata: { section: 'experience' } });
  assert.equal(scoreEvidenceCandidate(candidate, { sourcePriority: { osm: 2 }, sectionRelevance: { experience: 0.5 } }), 3.5);
  assert.equal(scoreEvidenceCandidate(candidate, { sourcePriority: () => 4 }), 5);
  assert.equal(scoreEvidenceCandidate(candidate, { score: () => 42, sourcePriority: { osm: 2 } }), 42, 'an explicit score wins outright');
});

test('single cardinality keeps only the best candidate of that type', () => {
  const strong = cand('strong', 'city', 0, 8, { evidence: [ev('lexical', 'title'), ev('structural', 'head')] });
  const weak = cand('weak', 'city', 40, 48, { evidence: [ev('lexical', 'body')] });
  const resolved = resolveEvidenceCandidates([weak, strong], { cardinality: 'single' });
  assert.deepEqual(ids(resolved.selected), ['strong']);
  assert.deepEqual(ids(resolved.discarded), ['weak']);
});

test('many cardinality keeps non-overlapping candidates and drops range conflicts', () => {
  const first = cand('first', 'skill', 0, 5, { evidence: [ev('lexical', 'a')] });
  const second = cand('second', 'skill', 10, 15, { evidence: [ev('lexical', 'b')] });
  const clash = cand('clash', 'skill', 2, 7, { evidence: [ev('lexical', 'c', 0.2)] });
  const resolved = resolveEvidenceCandidates([first, second, clash], { cardinality: 'many' });
  assert.deepEqual(ids(resolved.selected).sort(), ['first', 'second']);
});

test('roleBased cardinality keeps one candidate per role', () => {
  const resolved = resolveEvidenceCandidates([
    cand('from', 'geo', 0, 5, { evidence: [ev('lexical', 'a')], metadata: { role: 'origin' } }),
    cand('from-weak', 'geo', 30, 35, { evidence: [ev('lexical', 'b', 0.2)], metadata: { role: 'origin' } }),
    cand('to', 'geo', 10, 15, { evidence: [ev('lexical', 'c')], metadata: { role: 'destination' } }),
  ], { cardinality: 'roleBased' });
  assert.deepEqual(ids(resolved.selected).sort(), ['from', 'to']);
});

test('candidates of different types coexist under single cardinality', () => {
  const resolved = resolveEvidenceCandidates([
    cand('city', 'city', 0, 5, { evidence: [ev('lexical', 'a')] }),
    cand('rooms', 'rooms', 0, 5, { evidence: [ev('lexical', 'b')] }),
  ], { cardinality: 'single' });
  assert.deepEqual(ids(resolved.selected).sort(), ['city', 'rooms']);
});

test('cardinality can be chosen per entity type', () => {
  const resolved = resolveEvidenceCandidates([
    cand('city-a', 'city', 0, 5, { evidence: [ev('lexical', 'a')] }),
    cand('city-b', 'city', 20, 25, { evidence: [ev('lexical', 'b', 0.5)] }),
    cand('skill-a', 'skill', 40, 45, { evidence: [ev('lexical', 'c')] }),
    cand('skill-b', 'skill', 50, 55, { evidence: [ev('lexical', 'd')] }),
  ], { cardinality: { city: 'single', default: 'many' } });
  assert.deepEqual(ids(resolved.selected).sort(), ['city-a', 'skill-a', 'skill-b']);
});

test('an unknown cardinality is rejected', () => {
  assert.throws(() => resolveEvidenceCandidates([cand('a', 'geo', 0, 5)], { cardinality: 'someday' }), TypeError);
});

test('disagreeing parents are incompatible across entity types', () => {
  const district = cand('district', 'district', 0, 5, { evidence: [ev('lexical', 'a', 2)], metadata: { parentId: 'city:tashkent' } });
  const metro = cand('metro', 'metro', 10, 15, { evidence: [ev('lexical', 'b')], metadata: { parentId: 'city:almaty' } });
  const resolved = resolveEvidenceCandidates([district, metro], { cardinality: 'many' });
  assert.deepEqual(ids(resolved.selected), ['district'], 'the weaker candidate under a rival parent loses');
});

test('an agreeing parent keeps both candidates', () => {
  const resolved = resolveEvidenceCandidates([
    cand('district', 'district', 0, 5, { evidence: [ev('lexical', 'a', 2)], metadata: { parentId: 'city:tashkent' } }),
    cand('metro', 'metro', 10, 15, { evidence: [ev('lexical', 'b')], metadata: { parentId: 'city:tashkent' } }),
  ], { cardinality: 'many' });
  assert.deepEqual(ids(resolved.selected).sort(), ['district', 'metro']);
});

test('a caller supplied cross-entity contradiction vetoes a pair', () => {
  const resolved = resolveEvidenceCandidates([
    cand('sale', 'deal', 0, 5, { evidence: [ev('lexical', 'a', 2)] }),
    cand('rent', 'term', 10, 15, { evidence: [ev('lexical', 'b')] }),
  ], { cardinality: 'many', contradicts: (left, right) => [left.id, right.id].sort().join() === 'rent,sale' });
  assert.deepEqual(ids(resolved.selected), ['sale']);
});

test('negative evidence can sink a candidate below its rival', () => {
  const noisy = cand('noisy', 'city', 0, 5, { evidence: [ev('lexical', 'a', 2), ev('fuzzy', 'matcher', 1.5)] });
  const clean = cand('clean', 'city', 20, 25, { evidence: [ev('lexical', 'b', 1)] });
  const resolved = resolveEvidenceCandidates([noisy, clean], { cardinality: 'single' });
  assert.deepEqual(ids(resolved.selected), ['clean']);
});

test('a single-valued type stays unresolved when the margin is too thin', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x', 1.0)] }),
    cand('b', 'city', 20, 25, { evidence: [ev('lexical', 'y', 0.95)] }),
  ], { cardinality: 'single', acceptance: { minMargin: 0.5 } });
  assert.deepEqual(resolved.selected, []);
  assert.equal(resolved.unresolved.length, 1);
  assert.equal(resolved.unresolved[0].entityType, 'city');
  assert.deepEqual(resolved.unresolved[0].reasons, ['margin']);
  assert.equal(Number(resolved.unresolved[0].margin.toFixed(10)), 0.05);
});

test('a single-valued type stays unresolved without enough independent evidence', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x'), ev('lexical', 'x', 1, { start: 9, end: 12 })] }),
  ], { cardinality: 'single', acceptance: { minIndependentEvidence: 2 } });
  assert.deepEqual(resolved.unresolved[0].reasons, ['independence']);
  assert.equal(resolved.unresolved[0].independentEvidenceCount, 1, 'one source repeating itself is still one source');
});

test('a critical contradiction blocks a single-valued type outright', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x', 10), ev('contradiction', 'parent', 1)] }),
  ], { cardinality: 'single' });
  assert.deepEqual(resolved.unresolved[0].reasons, ['contradiction']);
  assert.deepEqual(resolved.selected, [], 'a high score never buys past a critical contradiction');
});

test('a blocked type does not block the rest of the document', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x', 1)] }),
    cand('b', 'city', 20, 25, { evidence: [ev('lexical', 'y', 1)] }),
    cand('rooms', 'rooms', 40, 45, { evidence: [ev('lexical', 'z')] }),
  ], { cardinality: 'single', acceptance: { minMargin: 0.5 } });
  assert.deepEqual(ids(resolved.selected), ['rooms']);
  assert.deepEqual(ids(resolved.discarded).sort(), ['a', 'b']);
});

test('gates report every failed reason at once', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x', 0.1), ev('contradiction', 'parent', 2)] }),
  ], { cardinality: 'single', acceptance: { minScore: 1 } });
  assert.deepEqual(resolved.unresolved[0].reasons, ['score', 'contradiction']);
});

test('hypotheses are ranked and expose their ledgers for every type', () => {
  const resolved = resolveEvidenceCandidates([
    cand('weak', 'city', 20, 25, { evidence: [ev('lexical', 'y', 0.5)] }),
    cand('strong', 'city', 0, 5, { evidence: [ev('lexical', 'x', 3)] }),
  ], { cardinality: 'single' });
  assert.deepEqual(resolved.hypotheses.city.map(item => item.candidate.id), ['strong', 'weak']);
  assert.deepEqual(resolved.hypotheses.city.map(item => item.score), [3, 0.5]);
  assert.equal(resolved.hypotheses.city[0].ledger.dimensions.lexical.effective, 3);
});

test('hypotheses still list candidates the gates rejected', () => {
  const resolved = resolveEvidenceCandidates([
    cand('a', 'city', 0, 5, { evidence: [ev('lexical', 'x', 1)] }),
    cand('b', 'city', 20, 25, { evidence: [ev('lexical', 'y', 1)] }),
  ], { cardinality: 'single', acceptance: { minMargin: 0.5 } });
  assert.equal(resolved.hypotheses.city.length, 2, 'a caller must still be able to inspect why nothing was chosen');
});

test('search runs only when candidates actually conflict', () => {
  const free = [cand('a', 'skill', 0, 5, { evidence: [ev('lexical', 'x')] }), cand('b', 'skill', 10, 15, { evidence: [ev('lexical', 'y')] })];
  assert.equal(resolveEvidenceCandidates(free, { cardinality: 'many' }).searched, false);
  assert.equal(resolveEvidenceCandidates([...free, cand('c', 'skill', 1, 4, { evidence: [ev('lexical', 'z')] })], { cardinality: 'many' }).searched, true);
});

test('beam search beats a greedy pass when one fat candidate blocks two better ones', () => {
  // Greedy takes the highest-scoring candidate first and is then stuck with 2.5.
  const fat = cand('fat', 'geo', 0, 30, { evidence: [ev('lexical', 'wide', 2.5)] });
  const left = cand('left', 'geo', 0, 10, { evidence: [ev('lexical', 'l', 1.6)] });
  const right = cand('right', 'geo', 12, 22, { evidence: [ev('lexical', 'r', 1.6)] });
  assert.deepEqual(ids(resolveParseCandidates([fat, left, right]).selected), ['fat'], 'the legacy greedy resolver is unchanged');
  const resolved = resolveEvidenceCandidates([fat, left, right], { cardinality: 'many' });
  assert.deepEqual(ids(resolved.selected).sort(), ['left', 'right']);
  assert.equal(resolved.total, 3.2);
});

test('the beam is bounded and its width is configurable', () => {
  assert.equal(DEFAULT_BEAM_WIDTH, 3);
  const many = Array.from({ length: 40 }, (_, index) => cand(`c${index}`, 'geo', index, index + 3, { evidence: [ev('lexical', `s${index}`, 1 + index / 100)] }));
  const wide = resolveEvidenceCandidates(many, { cardinality: 'many', beamWidth: 8 });
  assert.ok(wide.selected.length > 1);
  assert.ok(wide.searched);
});

test('resolution is deterministic regardless of input order', () => {
  const built = [
    cand('a', 'geo', 0, 10, { evidence: [ev('lexical', 'x', 1)] }),
    cand('b', 'geo', 5, 15, { evidence: [ev('lexical', 'y', 1)] }),
    cand('c', 'geo', 12, 20, { evidence: [ev('lexical', 'z', 1)] }),
  ];
  const forward = ids(resolveEvidenceCandidates(built, { cardinality: 'many' }).selected).sort();
  const reversed = ids(resolveEvidenceCandidates([...built].reverse(), { cardinality: 'many' }).selected).sort();
  assert.deepEqual(forward, reversed);
});

test('an empty candidate set resolves to nothing without throwing', () => {
  const resolved = resolveEvidenceCandidates([]);
  assert.deepEqual(resolved.selected, []);
  assert.deepEqual(resolved.unresolved, []);
  assert.deepEqual(resolved.hypotheses, {});
  assert.equal(resolved.searched, false);
});

test('the legacy resolver keeps its own behaviour untouched', () => {
  const broad = createParseCandidate({ id: 'geo', entityType: 'geo', start: 0, end: 12, confidence: 0.8 });
  const specific = createParseCandidate({ id: 'quarter', entityType: 'geo', start: 0, end: 14, confidence: 0.9 });
  assert.deepEqual(ids(resolveParseCandidates([broad, specific]).selected), ['quarter']);
});
