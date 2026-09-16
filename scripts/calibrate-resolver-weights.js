import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { scoreCityHypotheses } from '../src/city-hypotheses.js';
import { ledgerFeatures, fitLogisticWeights, scoreRankingAccuracy, DEFAULT_RESOLVER_WEIGHTS } from '../src/resolver-weights.js';

/**
 * Offline calibration of the resolver's dimension weights.
 *
 * Run by hand, never at runtime. It reads the golden city-resolution corpus,
 * turns each hypothesis into a labelled feature vector, fits a small logistic
 * model and writes the resulting static coefficients. Only numbers ship; the
 * runtime never trains, never loads a model and stays deterministic.
 *
 * It deliberately refuses to write weights that do not beat the current ones
 * on held-out samples, so a small or unrepresentative corpus leaves the
 * hand-set defaults in place rather than quietly degrading resolution.
 */

const corpusPath = fileURLToPath(new URL('../test/fixtures/city-resolution-golden.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../src/data/resolver-weights.json', import.meta.url));

const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));

/** Each case becomes a group of candidate cities: 1 for the true city, 0 for
 * its rivals. Rivals within a case are what the weights have to separate. */
function groupsFrom(corpusCases) {
  return corpusCases.map((item) => {
    const options = { ...(item.options ?? {}) };
    // JSON cannot carry a predicate, so the fixture names the ambiguous
    // entries and the script turns them into one.
    if (Array.isArray(options.ambiguousNames)) {
      const ambiguous = new Set(options.ambiguousNames);
      options.isAmbiguous = (match) => ambiguous.has(match.name);
      delete options.ambiguousNames;
    }
    const scored = scoreCityHypotheses(item.byCity, options);
    return {
      id: item.id,
      samples: scored.hypotheses.map((hypothesis) => ({
        id: `${item.id}:${hypothesis.cityId}`,
        features: ledgerFeatures(hypothesis.ledger),
        label: hypothesis.cityId === item.expectedCity ? 1 : 0,
      })),
    };
  });
}

/** Split by case, not by sample. Splitting samples would put a case's true
 * city in train and its rival in holdout, which measures nothing. */
function split(groups) {
  const train = []; const holdout = [];
  groups.forEach((group, index) => ((index % 3 === 2) ? holdout : train).push(group));
  return { train, holdout: holdout.length ? holdout : groups };
}

const groups = groupsFrom(corpus);
const { train, holdout } = split(groups);
const all = groups.flatMap((group) => group.samples);
const fit = fitLogisticWeights(train.flatMap((group) => group.samples));

const baseline = scoreRankingAccuracy(holdout, DEFAULT_RESOLVER_WEIGHTS);
const calibrated = scoreRankingAccuracy(holdout, fit.weights);
const improved = fit.fitted && calibrated > baseline;

const report = {
  generatedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sampleCount: all.length,
  caseCount: groups.length,
  trainCount: train.flatMap((group) => group.samples).length,
  holdoutCaseCount: holdout.length,
  fitted: fit.fitted,
  reason: fit.reason ?? null,
  baselineAccuracy: baseline,
  calibratedAccuracy: calibrated,
  accepted: improved,
  weights: improved ? fit.weights : DEFAULT_RESOLVER_WEIGHTS,
  note: improved
    ? 'Calibrated coefficients beat the hand-set defaults on held-out samples.'
    : 'Defaults retained: the fit did not beat them on held-out samples. The corpus is small; do not read the weights as tuned.',
};

if (process.argv.includes('--write')) {
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${outputPath}`);
}
console.log(JSON.stringify(report, null, 2));
