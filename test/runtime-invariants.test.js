import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';
import {
  aliasesToRegex,
  findAllCanonical,
  getAliasIndex,
  lexiconEntity,
  validateLexicon,
} from '../src/index.js';

test('lexiconEntity deep-freezes alias arrays', () => {
  const item = lexiconEntity('example', { en: ['Example'], ru: ['Пример'] });
  assert.equal(Object.isFrozen(item), true);
  assert.equal(Object.isFrozen(item.aliases), true);
  assert.equal(Object.isFrozen(item.aliases.en), true);
  assert.throws(() => item.aliases.en.push('mutate'), TypeError);
});

test('cached alias index is reused for immutable lexicons', () => {
  const entries = Object.freeze([
    lexiconEntity('alpha', { en: ['Alpha'] }),
    lexiconEntity('beta', { en: ['Beta'] }),
  ]);
  assert.equal(getAliasIndex(entries), getAliasIndex(entries));
});

test('findAllCanonical returns every entity with offsets', () => {
  const entries = Object.freeze([
    lexiconEntity('en', { en: ['English'] }),
    lexiconEntity('ru', { en: ['Russian'] }),
  ]);
  const text = 'English required, Russian preferred';
  const matches = findAllCanonical(text, entries, { transliteration: false });
  assert.deepEqual(matches.map(({ canonical }) => canonical), ['en', 'ru']);
  assert.equal(text.slice(matches[0].start, matches[0].end), 'English');
  assert.equal(text.slice(matches[1].start, matches[1].end), 'Russian');
});

test('validator catches duplicate and cross-canonical aliases', () => {
  const report = validateLexicon(Object.freeze([
    lexiconEntity('owner', { kk: ['делдалсыз', 'делдалсыз'] }),
    lexiconEntity('noCommission', { kk: ['делдалсыз'] }),
  ]));
  assert.equal(report.ok, false);
  assert.ok(report.errors.some(({ kind }) => kind === 'duplicateAlias'));
  assert.ok(report.errors.some(({ kind }) => kind === 'crossCanonicalCollision'));
});

test('aliasesToRegex rejects an empty public alias list', () => {
  assert.throws(() => aliasesToRegex([]), TypeError);
});

test('public Tashkent metro API does not expose a mutable Map', () => {
  assert.equal('TASHKENT_METRO_BY_NAME' in api, false);
  assert.equal(api.tashkentMetroStation('Minor')?.canonical, 'Minor');
});

test('Tashkent geo entities carry their own parent identity', () => {
  const district = api.TASHKENT_DISTRICTS.find(({ canonical }) => canonical === 'Yunusabad');
  const metro = api.TASHKENT_METRO.find(({ canonical }) => canonical === 'Minor');
  assert.deepEqual({ type: district.type, country: district.country, city: district.city }, { type: 'district', country: 'UZ', city: 'Tashkent' });
  assert.deepEqual({ type: metro.type, country: metro.country, city: metro.city }, { type: 'metro', country: 'UZ', city: 'Tashkent' });
});
