import test from 'node:test';
import assert from 'node:assert/strict';
import { matchFirstEntry } from '../src/alias-prefilter.js';
import { centralAsiaLocationCities, locationCities } from '../src/index.js';

const LIST_KEYS = ['districts', 'microdistricts', 'metro', 'residentialComplexes', 'streets', 'landmarks'];

function dictionaryFor(countryCode) {
  return countryCode === 'UZ' || countryCode === 'KZ'
    ? centralAsiaLocationCities(countryCode)
    : locationCities(countryCode);
}

function entryLists(countryCode) {
  const lists = [];
  for (const [cityName, data] of Object.entries(dictionaryFor(countryCode))) {
    for (const key of LIST_KEYS) {
      const entries = data?.[key];
      if (Array.isArray(entries) && entries.length) lists.push([`${countryCode}/${cityName}/${key}`, entries]);
    }
  }
  return lists;
}

// A full scan compiles every regex it touches, and the production dictionaries
// hold ~14k entries per country whose compiled regexes alone exceed a gigabyte.
// These tests therefore cross-check against real-but-modest lists: enough real
// alias shapes (separators, Cyrillic/Latin, equivalence classes) to catch a
// divergence, without turning a semantics test into a memory stress test.
const MAX_SAMPLE_LIST = 300;

function sampleLists(countryCode, count) {
  return entryLists(countryCode)
    .filter(([, entries]) => entries.length >= 10 && entries.length <= MAX_SAMPLE_LIST)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .slice(0, count);
}

const PROBE_TEXTS = [
  '2-комнатная квартира Аренда 2 комнаты 65 м² 700 USD/мес. Риелтор',
  'Сдам квартиру Чиланзар 9 квартал рядом метро Новза',
  'Оренда квартири Київ Печерськ вул. Хрещатик 12',
  'no location words here at all 12345',
];

for (const countryCode of ['UZ', 'KZ', 'UA', 'RO']) {
  test(`prefilter returns exactly what a full scan returns (${countryCode})`, () => {
    const lists = sampleLists(countryCode, 4);
    assert.ok(lists.length > 0, `${countryCode} has dictionaries`);

    for (const [label, entries] of lists) {
      for (const text of PROBE_TEXTS) {
        const expected = entries.find((entry) => entry?.re?.test(text));
        assert.equal(matchFirstEntry(entries, text), expected, `${label} :: ${text}`);
      }
    }
  });
}

// The failure mode that matters is a false negative: an entry the prefilter
// hides from a regex that would have matched. Driving the probes from the
// aliases themselves exercises the real alias shapes, and comparing against
// find() keeps the assertion honest — some aliases (e.g. ones containing "№",
// which aliasesToRegex NFKC-folds to "No") match nothing even on a full scan,
// and the prefilter must agree with that too.
for (const countryCode of ['UZ', 'UA']) {
  test(`alias-driven probes agree with a full scan (${countryCode})`, () => {
    let checked = 0;
    for (const [label, entries] of sampleLists(countryCode, 8)) {
      for (let i = 0; i < entries.length; i += 3) {
        for (const alias of entries[i].aliases || [entries[i].name]) {
          const probe = `текст ${alias} текст`;
          const expected = entries.find((entry) => entry?.re?.test(probe));
          assert.equal(matchFirstEntry(entries, probe), expected, `${label} :: "${alias}"`);
          checked += 1;
        }
      }
    }
    assert.ok(checked > 200, `sampled enough aliases (${checked})`);
  });
}

test('the first matching entry in list order wins, as with find()', () => {
  const re = /(?:^|[^\p{L}\p{N}_])sunrise city(?:$|[^\p{L}\p{N}_])/iu;
  const entries = [
    Object.freeze({ name: 'first', aliases: ['Sunrise City'], re }),
    Object.freeze({ name: 'second', aliases: ['Sunrise City'], re }),
  ];
  assert.equal(matchFirstEntry(entries, 'ЖК Sunrise City rooms')?.name, 'first');
});

test('short aliases that cannot be indexed are still matched', () => {
  const entries = [
    Object.freeze({ name: 'A1', aliases: ['A1'], re: /(?:^|[^\p{L}\p{N}_])a1(?:$|[^\p{L}\p{N}_])/iu }),
    Object.freeze({ name: 'Long Name', aliases: ['Long Name'], re: /(?:^|[^\p{L}\p{N}_])long name(?:$|[^\p{L}\p{N}_])/iu }),
  ];
  assert.equal(matchFirstEntry(entries, 'block A1 here')?.name, 'A1');
  assert.equal(matchFirstEntry(entries, 'a Long Name here')?.name, 'Long Name');
  assert.equal(matchFirstEntry(entries, 'nothing relevant'), undefined);
});

test('empty and missing inputs are handled', () => {
  assert.equal(matchFirstEntry([], 'text'), undefined);
  assert.equal(matchFirstEntry(null, 'text'), undefined);
  assert.equal(matchFirstEntry([{ name: 'x', aliases: ['xxxx'], re: /xxxx/iu }], ''), undefined);
});
