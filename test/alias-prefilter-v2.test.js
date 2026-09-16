import test from 'node:test';
import assert from 'node:assert/strict';
import { candidateEntries, computeTextGrams, matchFirstEntry } from '../src/alias-prefilter.js';
import { centralAsiaLocationCities } from '../src/index.js';

// Prefilter v2: alias-level indexing, rarity-chosen bucket keys, exact run
// verification. test/alias-prefilter.test.js already asserts the core safety
// property against a full scan; these pin the behaviours the rewrite was for.

const tashkentStreets = () => centralAsiaLocationCities('UZ').Tashkent.streets;

test('every alias of every entry retrieves its own entry (exhaustive)', () => {
  // The existing probe test steps through every third entry. This one leaves
  // nothing out, because a prefilter that hides one entry in ten thousand is
  // exactly the bug a sample would miss.
  const entries = tashkentStreets();
  let checked = 0;
  for (const entry of entries) {
    for (const alias of entry.aliases || [entry.name]) {
      const probe = `текст ${alias} текст`;
      const expected = entries.find((item) => item?.re?.test(probe));
      assert.equal(matchFirstEntry(entries, probe), expected, `street :: "${alias}"`);
      checked += 1;
    }
  }
  assert.ok(checked > 1000, `exercised the whole list (${checked})`);
});

test('one short alias no longer drags its entry into every result', () => {
  // Previously an entry was indexable only if *every* alias produced a gram,
  // so one short alias put the whole entry in the always-test set and it came
  // back for completely unrelated text.
  const entries = [
    { name: 'Long Name', aliases: ['Long Name', 'LN'], re: /long name|ln/iu },
    { name: 'Other', aliases: ['Othername'], re: /othername/iu },
  ];
  assert.deepEqual(candidateEntries(entries, 'nothing relevant at all').map((entry) => entry.name), []);
  assert.deepEqual(candidateEntries(entries, 'a Long Name here').map((entry) => entry.name), ['Long Name']);
  assert.deepEqual(candidateEntries(entries, 'call me LN please').map((entry) => entry.name), ['Long Name'], 'the short alias must still retrieve its entry');
});

test('text with no location vocabulary retrieves nothing from a real catalogue', () => {
  assert.deepEqual(candidateEntries(tashkentStreets(), 'no location words here'), [], 'the global fallback is gone');
});

test('a real street name retrieves a small candidate set', () => {
  const entries = tashkentStreets();
  const text = 'улица Шифокорлар';
  const truth = entries.find((entry) => entry.re.test(text));
  assert.ok(truth, 'the fixture must actually match something');
  const candidates = candidateEntries(entries, text);
  assert.ok(candidates.includes(truth), 'the matching entry must survive the filter');
  assert.ok(candidates.length < 30, `expected a small candidate set, got ${candidates.length} of ${entries.length}`);
});

test('candidate sets still agree with a full scan on real catalogue text', () => {
  const entries = tashkentStreets();
  for (const text of ['улица Шифокорлар', 'Чиланзар 7 квартал', 'no location words here', 'Ташкент, Юнусабад 19 квартал']) {
    const scanned = entries.filter((entry) => entry.re.test(text));
    const candidates = candidateEntries(entries, text);
    for (const entry of scanned) assert.ok(candidates.includes(entry), `${text} :: ${entry.name} was hidden by the prefilter`);
  }
});

test('a precomputed index and an internally computed one agree', () => {
  const entries = tashkentStreets();
  for (const text of ['улица Шифокорлар', 'Чиланзар 7 квартал', 'no location words here', '']) {
    assert.deepEqual(
      candidateEntries(entries, text, computeTextGrams(text)).map((entry) => entry.name),
      candidateEntries(entries, text).map((entry) => entry.name),
      text,
    );
  }
});

test('a bare Set of grams from an older caller still works', () => {
  // computeTextGrams used to return a plain Set. Callers holding one must not
  // silently start retrieving a different candidate set.
  const entries = tashkentStreets();
  const text = 'улица Шифокорлар';
  const legacy = new Set();
  const folded = text.toLocaleLowerCase();
  for (let i = 0; i + 4 <= folded.length; i += 1) legacy.add(folded.slice(i, i + 4));
  const truth = entries.find((entry) => entry.re.test(text));
  assert.ok(candidateEntries(entries, text, legacy).includes(truth));
});

test('an entry whose aliases carry no letters or digits is always tested', () => {
  const entries = [{ name: '---', aliases: ['---'], re: /-{3}/u }];
  assert.equal(candidateEntries(entries, 'anything at all').length, 1, 'an unindexable alias must never be filtered out');
});
