import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreCityHypotheses, DEFAULT_CITY_ACCEPTANCE } from '../src/city-hypotheses.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';

const match = (name, key, extra = {}) => ({ name, key, type: key, start: 0, end: name.length, matchedText: name, role: 'mentioned', explicitContext: false, parent: null, ...extra });
const scoreOf = (result, city) => result.hypotheses.find((item) => item.cityId === city)?.score ?? null;

test('a single well-evidenced city is accepted', () => {
  const result = scoreCityHypotheses([{ city: 'Tashkent', matches: [match('Shifokorlar', 'streets')] }]);
  assert.equal(result.city, 'Tashkent');
  assert.equal(result.hypotheses.length, 1);
  assert.ok(result.hypotheses[0].score > 0);
});

test('hypotheses are ranked by score', () => {
  const result = scoreCityHypotheses([
    { city: 'Almaty', matches: [match('Center', 'districts')] },
    { city: 'Tashkent', matches: [match('Shifokorlar', 'streets'), match('Chilonzor 7', 'microdistricts')] },
  ]);
  assert.deepEqual(result.hypotheses.map((item) => item.cityId), ['Tashkent', 'Almaty']);
  assert.ok(scoreOf(result, 'Tashkent') > scoreOf(result, 'Almaty'));
});

test('a street pins a city harder than a district name', () => {
  const street = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets')] }]);
  const district = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'districts')] }]);
  assert.ok(scoreOf(street, 'A') > scoreOf(district, 'A'));
});

test('a numbered match counts for more than a bare name', () => {
  const numbered = scoreCityHypotheses([{ city: 'A', matches: [match('Chilonzor 7', 'microdistricts')] }]);
  const bare = scoreCityHypotheses([{ city: 'A', matches: [match('Chilonzor', 'microdistricts')] }]);
  assert.ok(scoreOf(numbered, 'A') > scoreOf(bare, 'A'), 'the number is its own discriminator');
});

test('an explicit city in the text is strong evidence', () => {
  const result = scoreCityHypotheses([
    { city: 'Tashkent', matches: [match('Center', 'districts')] },
    { city: 'Almaty', matches: [match('Center', 'districts')] },
  ], { explicitCity: 'Tashkent' });
  assert.equal(result.city, 'Tashkent');
  assert.ok(result.hypotheses[0].evidence.some((item) => item.source === 'explicit-city'));
});

test('a structured preferred city is strong but weaker than an explicit mention', () => {
  const explicitCity = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'districts')] }], { explicitCity: 'A' });
  const preferred = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'districts')] }], { preferredCity: 'A' });
  assert.ok(scoreOf(explicitCity, 'A') > scoreOf(preferred, 'A'));
});

test('explicit context around a match adds structural evidence', () => {
  const withContext = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets', { explicitContext: true })] }]);
  const without = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets')] }]);
  assert.ok(scoreOf(withContext, 'A') > scoreOf(without, 'A'));
});

test('an ambiguous name is recorded as a contradiction and costs score', () => {
  const ambiguous = scoreCityHypotheses([{ city: 'A', matches: [match('Center', 'districts')] }], { isAmbiguous: () => true });
  const clean = scoreCityHypotheses([{ city: 'A', matches: [match('Center', 'districts')] }]);
  assert.ok(scoreOf(ambiguous, 'A') < scoreOf(clean, 'A'));
  assert.ok(ambiguous.hypotheses[0].contradictions.some((item) => item.dimension === 'ambiguity'));
});

test('a mention role other than an address argues less for the city', () => {
  const nearby = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets', { role: 'nearby' })] }]);
  const address = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets')] }]);
  assert.ok(scoreOf(nearby, 'A') < scoreOf(address, 'A'));
  assert.ok(nearby.hypotheses[0].contradictions.some((item) => item.dimension === 'role'));
});

test('a parent inside the city agrees and a parent elsewhere contradicts', () => {
  const agreeing = scoreCityHypotheses([{ city: 'Tashkent', matches: [match('X', 'streets', { parent: 'Tashkent' })] }], { cityNames: ['Tashkent', 'Almaty'] });
  const conflicting = scoreCityHypotheses([{ city: 'Tashkent', matches: [match('X', 'streets', { parent: 'Almaty' })] }], { cityNames: ['Tashkent', 'Almaty'] });
  assert.ok(agreeing.hypotheses[0].evidence.some((item) => item.dimension === 'hierarchy'));
  assert.ok(conflicting.hypotheses[0].contradictions.some((item) => item.dimension === 'contradiction'));
  assert.ok(scoreOf(agreeing, 'Tashkent') > scoreOf(conflicting, 'Tashkent'));
});

test('a critical contradiction leaves the city unresolved', () => {
  const result = scoreCityHypotheses([{ city: 'Tashkent', matches: [match('X', 'streets', { parent: 'Almaty' })] }], { cityNames: ['Tashkent', 'Almaty'] });
  assert.equal(result.city, null, 'a contradicted parent must not silently assign a city');
  assert.ok(result.unresolvedReasons.includes('contradiction'));
});

test('two equally supported cities leave the city unresolved', () => {
  const result = scoreCityHypotheses([
    { city: 'Almaty', matches: [match('Samal', 'microdistricts')] },
    { city: 'Astana', matches: [match('Samal', 'microdistricts')] },
  ]);
  assert.equal(result.city, null, 'a name shared by two cities identifies neither');
  assert.ok(result.unresolvedReasons.includes('margin'));
  assert.equal(result.hypotheses.length, 2, 'both stay inspectable');
});

test('a clear margin resolves where a thin one does not', () => {
  const clear = scoreCityHypotheses([
    { city: 'Tashkent', matches: [match('Shifokorlar', 'streets'), match('Chilonzor 7', 'microdistricts')] },
    { city: 'Almaty', matches: [match('Center', 'districts')] },
  ]);
  assert.equal(clear.city, 'Tashkent');
});

test('weak evidence below the score floor stays unresolved', () => {
  const result = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'districts')] }], { acceptance: { minScore: 5 } });
  assert.equal(result.city, null);
  assert.ok(result.unresolvedReasons.includes('score'));
});

test('repeated mentions of the same place do not stack into false confidence', () => {
  const once = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets')] }]);
  const thrice = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets'), { ...match('X', 'streets'), start: 30, end: 31 }, { ...match('X', 'streets'), start: 60, end: 61 }] }]);
  assert.ok(scoreOf(thrice, 'A') < scoreOf(once, 'A') * 3, 'diminishing returns apply to one place named repeatedly');
  assert.equal(thrice.hypotheses[0].independentEvidenceCount, 1);
});

test('distinct places in one city are independent evidence', () => {
  const result = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets'), match('Y', 'metro')] }]);
  assert.equal(result.hypotheses[0].independentEvidenceCount, 2);
});

test('the acceptance thresholds are exposed and overridable', () => {
  assert.deepEqual(Object.keys(DEFAULT_CITY_ACCEPTANCE).sort(), ['criticalContradiction', 'minIndependentEvidence', 'minMargin', 'minScore']);
  const strict = scoreCityHypotheses([{ city: 'A', matches: [match('X', 'streets')] }], { acceptance: { minIndependentEvidence: 5 } });
  assert.equal(strict.city, null);
  assert.ok(strict.unresolvedReasons.includes('independence'));
});

test('an empty input resolves to nothing without throwing', () => {
  const result = scoreCityHypotheses([]);
  assert.equal(result.city, null);
  assert.deepEqual(result.hypotheses, []);
});

test('the Central Asia matcher now reports hypotheses alongside its existing answer', () => {
  const result = matchCentralAsiaLocationEntities('Шифокорлар кўчаси', 'UZ', 'Tashkent');
  assert.ok(Array.isArray(result.hypotheses), 'hypotheses are always present');
  assert.equal(result.city, 'Tashkent', 'the established selection is unchanged');
  if (result.hypotheses.length) {
    assert.equal(result.hypotheses[0].cityId, 'Tashkent');
    assert.ok(result.hypotheses[0].score > 0);
    assert.ok(Array.isArray(result.hypotheses[0].evidence));
  }
});

test('an unmatched text still returns the established empty shape', () => {
  const result = matchCentralAsiaLocationEntities('nothing here at all', 'UZ');
  assert.equal(result.city, null);
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.hypotheses, []);
});
