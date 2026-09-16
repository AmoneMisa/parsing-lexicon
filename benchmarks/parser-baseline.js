import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';
import { corpus, runCase, compareLabels } from './parser-corpus.js';
import { candidateEntries, computeTextGrams } from '../src/alias-prefilter.js';
import { centralAsiaLocationCities } from '../src/central-asia-locations.js';

const iterations = Number(process.env.BENCH_ITERATIONS || 30);
if (!Number.isInteger(iterations) || iterations < 1 || iterations > 10000) throw new RangeError('BENCH_ITERATIONS must be 1..10000');
const percentile = (values, fraction) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * fraction) - 1];
const memoryBefore = process.memoryUsage();
const cases = [];
for (const fixture of corpus) {
  const start = performance.now();
  const first = runCase(fixture);
  const firstCallMs = performance.now() - start;
  for (let i = 0; i < 3; i++) runCase(fixture);
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    runCase(fixture);
    samples.push(performance.now() - start);
  }
  cases.push({ id: fixture.id, domain: fixture.domain, firstCallMs, p50Ms: percentile(samples, .5), p95Ms: percentile(samples, .95), candidateCount: first.candidateCount, ...compareLabels(first.values, fixture.gold || fixture.expected) });
}
// Retrieval only: this never compiles every entry regex or verifies a country.
const entries = centralAsiaLocationCities('UZ').Tashkent.streets;
const retrieval = ['улица Шифокорлар', 'no location words here', 'Чиланзар 7 квартал'].map(text => {
  const grams = computeTextGrams(text);
  const start = performance.now();
  const count = candidateEntries(entries, text, grams).length;
  const firstCallMs = performance.now() - start;
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now(); candidateEntries(entries, text, grams); samples.push(performance.now() - start);
  }
  return { text, catalogCount: entries.length, candidateCount: count, firstCallMs, p50Ms: percentile(samples, .5), p95Ms: percentile(samples, .95) };
});
const truePositives = cases.reduce((sum, item) => sum + item.truePositives, 0);
const falsePositives = cases.reduce((sum, item) => sum + item.falsePositives.length, 0);
const falseNegatives = cases.reduce((sum, item) => sum + item.falseNegatives.length, 0);
console.log(JSON.stringify({
  schemaVersion: 1, node: process.version, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), iterations,
  metricScope: 'Set-valued labels in this synthetic regression corpus only; not production precision/recall. First calls share process caches. Memory is process-wide, including imports; not allocation per case.',
  metrics: { truePositives, falsePositives, falseNegatives, precision: truePositives + falsePositives ? truePositives / (truePositives + falsePositives) : null, recall: truePositives + falseNegatives ? truePositives / (truePositives + falseNegatives) : null },
  memoryBefore, memoryAfter: process.memoryUsage(), maxRssKiB: process.resourceUsage().maxRSS, cases, retrieval,
}, null, 2));
