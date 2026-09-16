import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_RESOLVER_WEIGHTS, MIN_WEIGHT, MAX_WEIGHT,
  normalizeResolverWeights, weightedLedgerScore, ledgerFeatures,
  fitLogisticWeights, scoreRankingAccuracy,
} from '../src/resolver-weights.js';
import { createEvidenceLedger, EVIDENCE_DIMENSIONS } from '../src/evidence-ledger.js';
import { createParseCandidate } from '../src/parser-core.js';
import { scoreEvidenceCandidate } from '../src/resolver-v2.js';

const ledgerOf = (...occurrences) => createEvidenceLedger(occurrences);
const ev = (dimension, source, weight = 1) => ({ dimension, source, weight });

test('defaults are one per dimension, reproducing the hand-set behaviour', () => {
  assert.deepEqual(Object.keys(DEFAULT_RESOLVER_WEIGHTS).sort(), Object.keys(EVIDENCE_DIMENSIONS).sort());
  for (const value of Object.values(DEFAULT_RESOLVER_WEIGHTS)) assert.equal(value, 1);
});

test('weighted scoring with defaults equals the ledger score', () => {
  const ledger = ledgerOf(ev('lexical', 'a', 2), ev('fuzzy', 'b', 0.5));
  assert.equal(weightedLedgerScore(ledger), ledger.score);
});

test('a weight amplifies its own dimension only', () => {
  const ledger = ledgerOf(ev('lexical', 'a', 2), ev('specificity', 'b', 1));
  assert.equal(weightedLedgerScore(ledger, { ...DEFAULT_RESOLVER_WEIGHTS, lexical: 2 }), 2 * 2 + 1);
});

test('calibration can never invert a dimension', () => {
  // A penalty stays a penalty however the fit comes out; weights only adjust
  // how loudly each dimension speaks.
  const normalized = normalizeResolverWeights({ lexical: -5, fuzzy: -3, contradiction: 100 });
  assert.equal(normalized.lexical, MIN_WEIGHT);
  assert.equal(normalized.fuzzy, MIN_WEIGHT);
  assert.equal(normalized.contradiction, MAX_WEIGHT);
  const penalised = ledgerOf(ev('lexical', 'a', 1), ev('fuzzy', 'b', 1));
  assert.ok(weightedLedgerScore(penalised, normalized) < weightedLedgerScore(ledgerOf(ev('lexical', 'a', 1)), normalized));
});

test('unknown and non-finite weights are ignored', () => {
  const normalized = normalizeResolverWeights({ nonsense: 3, lexical: NaN, structural: 2 });
  assert.equal(normalized.nonsense, undefined);
  assert.equal(normalized.lexical, 1);
  assert.equal(normalized.structural, 2);
});

test('features are the signed effective mass per dimension', () => {
  const features = ledgerFeatures(ledgerOf(ev('lexical', 'a', 2), ev('fuzzy', 'b', 0.5)));
  assert.equal(features.lexical, 2);
  assert.equal(features.fuzzy, -0.5, 'penalties enter the model already signed');
  assert.equal(features.hierarchy, 0);
  assert.equal(Object.keys(features).length, Object.keys(EVIDENCE_DIMENSIONS).length);
});

test('an empty ledger yields all-zero features', () => {
  for (const value of Object.values(ledgerFeatures(createEvidenceLedger([])))) assert.equal(value, 0);
  assert.equal(weightedLedgerScore(null), 0);
});

test('fitting refuses to guess from too few samples', () => {
  const fit = fitLogisticWeights([{ features: { lexical: 1 }, label: 1 }]);
  assert.equal(fit.fitted, false);
  assert.equal(fit.reason, 'insufficient_samples');
  assert.deepEqual(fit.weights, DEFAULT_RESOLVER_WEIGHTS);
});

test('fitting separates a linearly separable signal', () => {
  const samples = [];
  for (let i = 0; i < 12; i += 1) {
    samples.push({ features: { specificity: 1 + i / 10, ambiguity: 0 }, label: 1 });
    samples.push({ features: { specificity: 0.1, ambiguity: -1 - i / 10 }, label: 0 });
  }
  const fit = fitLogisticWeights(samples);
  assert.equal(fit.fitted, true);
  assert.equal(fit.sampleCount, 24);
  assert.equal(fit.positiveCount, 12);
  for (const value of Object.values(fit.weights)) {
    assert.ok(value >= MIN_WEIGHT && value <= MAX_WEIGHT, `weight ${value} stays in range`);
  }
});

test('fitting is deterministic, so calibration reruns reproduce', () => {
  const samples = Array.from({ length: 20 }, (_, i) => ({ features: { lexical: i % 2 ? 2 : 0.2 }, label: i % 2 }));
  assert.deepEqual(fitLogisticWeights(samples).weights, fitLogisticWeights(samples).weights);
});

test('ranking accuracy asks whether the true candidate wins its own case', () => {
  // Not a global threshold: every city hypothesis scores above zero, so only
  // the ordering within a case means anything.
  const groups = [
    { samples: [{ features: { specificity: 2 }, label: 1 }, { features: { specificity: 0.3 }, label: 0 }] },
    { samples: [{ features: { specificity: 0.3 }, label: 1 }, { features: { specificity: 2 }, label: 0 }] },
  ];
  assert.equal(scoreRankingAccuracy(groups, DEFAULT_RESOLVER_WEIGHTS), 0.5);
  assert.equal(scoreRankingAccuracy([groups[0]], DEFAULT_RESOLVER_WEIGHTS), 1);
  assert.equal(scoreRankingAccuracy([], DEFAULT_RESOLVER_WEIGHTS), 0);
});

test('the resolver ignores weights unless a caller opts in', () => {
  const candidate = createParseCandidate({
    id: 'a', entityType: 'geo', start: 0, end: 5,
    evidence: [ev('lexical', 'title', 2)],
  });
  assert.equal(scoreEvidenceCandidate(candidate), 2, 'default path is unchanged');
  assert.equal(scoreEvidenceCandidate(candidate, { dimensionWeights: { ...DEFAULT_RESOLVER_WEIGHTS, lexical: 2 } }), 4);
});

test('weights do not disturb the legacy confidence fallback', () => {
  const legacy = createParseCandidate({ id: 'a', entityType: 'geo', start: 0, end: 5, confidence: 0.75 });
  assert.equal(scoreEvidenceCandidate(legacy, { dimensionWeights: { ...DEFAULT_RESOLVER_WEIGHTS, lexical: 4 } }), 0.75);
});
