import { EVIDENCE_DIMENSIONS } from './evidence-ledger.js';

/** Static, calibrated weights for the evidence dimensions.
 *
 * The runtime stays deterministic: this module holds plain numbers and does no
 * inference. Fitting happens offline in `scripts/calibrate-resolver-weights.js`
 * against the golden corpus, and only the resulting coefficients ship. There is
 * deliberately no model, no tensor library and no runtime training step.
 *
 * Defaults are all 1, which reproduces the hand-set behaviour exactly, so a
 * consumer that never loads calibrated weights sees no change. */

export const DEFAULT_RESOLVER_WEIGHTS = Object.freeze(
  Object.fromEntries(Object.keys(EVIDENCE_DIMENSIONS).map((dimension) => [dimension, 1])),
);

/** Clamped so a fit cannot invert a dimension's meaning. A penalty stays a
 * penalty and support stays support however the numbers come out; calibration
 * may only adjust how loudly each one speaks. */
export const MIN_WEIGHT = 0.1;
export const MAX_WEIGHT = 4;

export function normalizeResolverWeights(weights) {
  const resolved = { ...DEFAULT_RESOLVER_WEIGHTS };
  for (const [dimension, value] of Object.entries(weights ?? {})) {
    if (!Object.hasOwn(EVIDENCE_DIMENSIONS, dimension)) continue;
    if (!Number.isFinite(value)) continue;
    resolved[dimension] = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, value));
  }
  return Object.freeze(resolved);
}

/** Ledger score under a weight table. Signs still come from the dimension. */
export function weightedLedgerScore(ledger, weights = DEFAULT_RESOLVER_WEIGHTS) {
  let score = 0;
  for (const [dimension, totals] of Object.entries(ledger?.dimensions ?? {})) {
    score += EVIDENCE_DIMENSIONS[dimension] * totals.effective * (weights[dimension] ?? 1);
  }
  return score;
}

/** Feature vector for one candidate: signed effective mass per dimension. */
export function ledgerFeatures(ledger) {
  const features = {};
  for (const dimension of Object.keys(EVIDENCE_DIMENSIONS)) {
    const value = EVIDENCE_DIMENSIONS[dimension] * (ledger?.dimensions?.[dimension]?.effective ?? 0);
    // A penalty dimension with no mass yields -0, which is a nuisance in
    // exported JSON and in comparisons.
    features[dimension] = value === 0 ? 0 : value;
  }
  return features;
}

/**
 * Batch gradient descent on a logistic model, written out in full because the
 * whole point is that this is small, inspectable and dependency-free.
 *
 * `samples` are `{ features, label }` with label 1 for a correct candidate and
 * 0 for an incorrect one. Returns one coefficient per dimension, clamped into
 * the valid range. This runs offline only.
 */
export function fitLogisticWeights(samples, options = {}) {
  const dimensions = Object.keys(EVIDENCE_DIMENSIONS);
  const iterations = options.iterations ?? 400;
  const learningRate = options.learningRate ?? 0.1;
  const l2 = options.l2 ?? 0.01;
  const rows = (samples ?? []).filter((sample) => sample && sample.features);
  if (rows.length < (options.minSamples ?? 8)) {
    return { weights: DEFAULT_RESOLVER_WEIGHTS, fitted: false, reason: 'insufficient_samples', sampleCount: rows.length };
  }

  const coefficients = Object.fromEntries(dimensions.map((dimension) => [dimension, 1]));
  for (let step = 0; step < iterations; step += 1) {
    const gradient = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
    for (const { features, label } of rows) {
      let z = 0;
      for (const dimension of dimensions) z += coefficients[dimension] * (features[dimension] ?? 0);
      const predicted = 1 / (1 + Math.exp(-z));
      const error = predicted - (label ? 1 : 0);
      for (const dimension of dimensions) gradient[dimension] += error * (features[dimension] ?? 0);
    }
    for (const dimension of dimensions) {
      const average = gradient[dimension] / rows.length + l2 * (coefficients[dimension] - 1);
      coefficients[dimension] -= learningRate * average;
    }
  }

  return {
    weights: normalizeResolverWeights(coefficients),
    fitted: true,
    sampleCount: rows.length,
    positiveCount: rows.filter((row) => row.label).length,
  };
}

const scoreOf = (features, weights) => {
  let z = 0;
  for (const [dimension, value] of Object.entries(features ?? {})) z += (weights[dimension] ?? 1) * value;
  return z;
};

/**
 * Top-1 accuracy over grouped candidates.
 *
 * This is a ranking problem, not a classification one: every city hypothesis
 * scores above zero, so a global threshold measures nothing. What matters is
 * whether the true city outranks its rivals *within its own case*, which is
 * exactly the decision the resolver makes.
 */
export function scoreRankingAccuracy(groups, weights) {
  const cases = (groups ?? []).filter((group) => group?.samples?.length);
  if (!cases.length) return 0;
  let correct = 0;
  for (const group of cases) {
    let best = null;
    for (const sample of group.samples) {
      const score = scoreOf(sample.features, weights);
      if (!best || score > best.score) best = { score, label: sample.label };
    }
    if (best?.label) correct += 1;
  }
  return correct / cases.length;
}
