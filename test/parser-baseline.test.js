import test from 'node:test';
import assert from 'node:assert/strict';
import { corpus, runCase } from '../benchmarks/parser-corpus.js';

for (const fixture of corpus) {
  test(`baseline ${fixture.domain}/${fixture.id} (${fixture.kind})`, () => {
    assert.deepEqual(runCase(fixture).values.toSorted(), fixture.expected.toSorted());
  });
}

test('baseline covers every domain with positive, negative and ambiguous evidence', () => {
  assert.equal(new Set(corpus.map(item => item.id)).size, corpus.length);
  assert.deepEqual([...new Set(corpus.map(item => item.domain))].sort(), ['ATS', 'CV', 'geo', 'housing', 'primitives', 'vacancies']);
  for (const kind of ['positive', 'negative', 'ambiguous']) assert.ok(corpus.some(item => item.kind === kind));
  for (const fixture of corpus.filter(item => item.gold)) assert.ok(fixture.knownIssue);
});
