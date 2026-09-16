import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceLedger, createEvidenceOccurrence, mergeEvidenceLedgers, EMPTY_EVIDENCE_LEDGER, EVIDENCE_DIMENSIONS } from '../src/evidence-ledger.js';
import { createParseCandidate } from '../src/parser-core.js';

const at = (dimension, source, start, extra = {}) => ({ dimension, source, start, end: start + 4, ...extra });

test('an occurrence keeps its range, entity and group', () => {
  const occurrence = createEvidenceOccurrence({ dimension: 'lexical', source: 'title', section: 'profile', start: 3, end: 9, entityId: 'uz:tashkent', evidenceGroup: 'g1', weight: 2 });
  assert.deepEqual({ ...occurrence }, { dimension: 'lexical', source: 'title', section: 'profile', start: 3, end: 9, entityId: 'uz:tashkent', evidenceGroup: 'g1', weight: 2 });
  assert.ok(Object.isFrozen(occurrence));
});

test('an occurrence defaults to weight 1 and omits absent optional fields', () => {
  const occurrence = createEvidenceOccurrence({ dimension: 'source', source: 'api' });
  assert.equal(occurrence.weight, 1);
  assert.deepEqual(Object.keys(occurrence), ['dimension', 'source', 'weight']);
});

test('an occurrence rejects unknown dimensions, bad weights and half ranges', () => {
  assert.throws(() => createEvidenceOccurrence({ dimension: 'vibes', source: 'title' }), TypeError);
  assert.throws(() => createEvidenceOccurrence({ dimension: 'lexical', source: '' }), TypeError);
  assert.throws(() => createEvidenceOccurrence({ dimension: 'lexical', source: 'title', weight: -1 }), TypeError);
  assert.throws(() => createEvidenceOccurrence({ dimension: 'lexical', source: 'title', weight: Infinity }), TypeError);
  assert.throws(() => createEvidenceOccurrence({ dimension: 'lexical', source: 'title', start: 2 }), TypeError);
  assert.throws(() => createEvidenceOccurrence({ dimension: 'lexical', source: 'title', start: 9, end: 2 }), TypeError);
});

test('repeated equivalent evidence earns less each time', () => {
  const ledger = createEvidenceLedger([at('lexical', 'title', 0), at('lexical', 'title', 10), at('lexical', 'title', 20)]);
  assert.equal(ledger.dimensions.lexical.raw, 3);
  assert.equal(ledger.dimensions.lexical.effective, 1 + 0.5 + 0.25);
  assert.equal(ledger.dimensions.lexical.count, 3);
  assert.equal(ledger.score, 1.75);
});

test('independent sources each keep full weight', () => {
  const ledger = createEvidenceLedger([at('lexical', 'title', 0), at('lexical', 'body', 0), at('structural', 'title', 0)]);
  assert.equal(ledger.score, 3);
  assert.equal(ledger.independentEvidenceCount, 3);
});

test('the same observation seen twice counts once', () => {
  const ledger = createEvidenceLedger([at('lexical', 'title', 5), at('lexical', 'title', 5)]);
  assert.equal(ledger.dimensions.lexical.count, 1);
  assert.equal(ledger.score, 1);
});

test('an explicit evidenceGroup merges what would otherwise look independent', () => {
  const grouped = createEvidenceLedger([at('lexical', 'title', 0, { evidenceGroup: 'alias:chilonzor' }), at('lexical', 'body', 9, { evidenceGroup: 'alias:chilonzor' })]);
  assert.equal(grouped.score, 1.5);
  assert.equal(grouped.independentEvidenceCount, 1);
});

test('penalty dimensions subtract and are reportable on their own', () => {
  const ledger = createEvidenceLedger([at('lexical', 'title', 0), at('fuzzy', 'matcher', 0, { weight: 0.4 }), at('contradiction', 'parent', 0, { weight: 0.25 })]);
  assert.equal(Number(ledger.score.toFixed(10)), 0.35);
  assert.equal(Number(ledger.penalty.toFixed(10)), 0.65);
  assert.equal(ledger.independentEvidenceCount, 1, 'penalties are never independent support');
});

test('heavier evidence decays after lighter evidence, not before', () => {
  const ledger = createEvidenceLedger([at('lexical', 'title', 0, { weight: 1 }), at('lexical', 'title', 9, { weight: 4 })]);
  assert.equal(ledger.dimensions.lexical.effective, 4 + 0.5, 'the strongest occurrence must be the undecayed one');
});

test('decay is configurable and validated', () => {
  assert.equal(createEvidenceLedger([at('lexical', 'title', 0), at('lexical', 'title', 9)], { decay: 0 }).score, 1);
  assert.equal(createEvidenceLedger([at('lexical', 'title', 0), at('lexical', 'title', 9)], { decay: 1 }).score, 2);
  assert.throws(() => createEvidenceLedger([], { decay: 2 }), RangeError);
  assert.throws(() => createEvidenceLedger([], { decay: NaN }), RangeError);
});

test('an empty ledger scores zero and claims no support', () => {
  assert.equal(EMPTY_EVIDENCE_LEDGER.score, 0);
  assert.equal(EMPTY_EVIDENCE_LEDGER.independentEvidenceCount, 0);
  assert.equal(EMPTY_EVIDENCE_LEDGER.penalty, 0);
  assert.deepEqual(EMPTY_EVIDENCE_LEDGER.occurrences, []);
});

test('merging applies diminishing returns across the union, not per side', () => {
  const left = createEvidenceLedger([at('lexical', 'title', 0)]);
  const right = createEvidenceLedger([at('lexical', 'title', 10)]);
  assert.equal(left.score + right.score, 2);
  assert.equal(mergeEvidenceLedgers(left, right).score, 1.5);
  assert.equal(mergeEvidenceLedgers(left, null, undefined).score, 1);
});

test('every dimension named by the ledger contract carries a sign', () => {
  assert.deepEqual(Object.keys(EVIDENCE_DIMENSIONS), ['lexical', 'structural', 'section', 'source', 'hierarchy', 'specificity', 'ambiguity', 'fuzzy', 'contradiction', 'role']);
  for (const sign of Object.values(EVIDENCE_DIMENSIONS)) assert.ok(sign === 1 || sign === -1);
});

test('a candidate builds a ledger from its typed evidence', () => {
  const candidate = createParseCandidate({ id: 'geo', entityType: 'geo', start: 0, end: 5, evidence: [at('lexical', 'title', 0), at('section', 'skills', 0)] });
  assert.equal(candidate.ledger.score, 2);
  assert.equal(candidate.ledger.occurrences.length, 2);
  assert.equal(candidate.ledger, candidate.ledger, 'the ledger is built once and cached');
});

test('legacy untyped evidence still travels but argues for nothing', () => {
  const candidate = createParseCandidate({ id: 'money', entityType: 'money', start: 0, end: 3, evidence: [{ type: 'currency', value: 'UZS' }] });
  assert.deepEqual(candidate.evidence, [{ type: 'currency', value: 'UZS' }]);
  assert.equal(candidate.ledger.score, 0);
  assert.equal(candidate.ledger.occurrences.length, 0);
});

test('a candidate may carry a prebuilt ledger', () => {
  const ledger = createEvidenceLedger([at('hierarchy', 'parent', 0, { weight: 3 })]);
  assert.equal(createParseCandidate({ id: 'geo', entityType: 'geo', start: 0, end: 5, ledger }).ledger.score, 3);
});

test('a candidate with no evidence exposes an empty ledger rather than undefined', () => {
  const candidate = createParseCandidate({ id: 'rooms', entityType: 'rooms', start: 0, end: 2 });
  assert.equal(candidate.ledger.score, 0);
  assert.equal(candidate.ledger.independentEvidenceCount, 0);
});
