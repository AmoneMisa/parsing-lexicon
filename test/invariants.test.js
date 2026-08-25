import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTRIES,
  CURRENCY_TERMS,
  HOUSING_ACTIONS,
  HOUSING_DEAL_TYPES,
  KZ_CITY_CATALOG,
  LANGUAGES,
  LANGUAGE_LEVELS,
  SELLER_TERMS,
  TASHKENT_DISTRICTS,
  TASHKENT_METRO,
  UA_CITY_CATALOG,
  UZ_CITY_CATALOG,
  collectAliasCollisions,
  findAllCanonical,
  validateLexicon,
} from '../src/index.js';

const structuralErrors = (entries) => validateLexicon(entries).errors.filter(
  ({ kind }) => kind !== 'crossCanonicalCollision',
);

test('canonical alias-map lexicons satisfy structural invariants', () => {
  for (const [name, entries] of [
    ['countries', COUNTRIES],
    ['kz cities', KZ_CITY_CATALOG],
    ['uz cities', UZ_CITY_CATALOG],
    ['ua cities', UA_CITY_CATALOG],
    ['tashkent districts', TASHKENT_DISTRICTS],
    ['housing actions', HOUSING_ACTIONS],
    ['housing deals', HOUSING_DEAL_TYPES],
    ['currencies', CURRENCY_TERMS],
    ['languages', LANGUAGES],
    ['language levels', LANGUAGE_LEVELS],
  ]) {
    assert.deepEqual(structuralErrors(entries), [], `${name} has structural lexicon errors`);
  }
});

test('published lexicon aliases are immutable at runtime', () => {
  assert.equal(Object.isFrozen(HOUSING_ACTIONS), true);
  assert.equal(Object.isFrozen(HOUSING_ACTIONS[0]), true);
  assert.equal(Object.isFrozen(HOUSING_ACTIONS[0].aliases), true);
  assert.equal(Object.isFrozen(HOUSING_ACTIONS[0].aliases.ru), true);
  assert.throws(() => HOUSING_ACTIONS[0].aliases.ru.push('mutated'), TypeError);

  assert.equal(Object.isFrozen(TASHKENT_METRO), true);
  assert.equal(Object.isFrozen(TASHKENT_METRO[0]), true);
  assert.equal(Object.isFrozen(TASHKENT_METRO[0].aliases), true);
  assert.throws(() => TASHKENT_METRO[0].aliases.push('mutated'), TypeError);
});

test('findAllCanonical preserves multiple entities and original offsets', () => {
  const text = 'English обязателен, русский желательно';
  const matches = findAllCanonical(text, LANGUAGES);
  const english = matches.find(({ canonical }) => canonical === 'en');
  const russian = matches.find(({ canonical }) => canonical === 'ru');

  assert.ok(english);
  assert.ok(russian);
  assert.equal(text.slice(english.start, english.end).toLowerCase(), 'english');
  assert.equal(text.slice(russian.start, russian.end).toLowerCase(), 'русский');
  assert.ok(english.start < russian.start);
});

test('semantic alias collisions are surfaced instead of silently discarded', () => {
  const sellerEntries = Object.values(SELLER_TERMS);
  const collisions = collectAliasCollisions(sellerEntries);
  const noMiddleman = collisions.find(({ canonicals }) =>
    canonicals.includes('owner') && canonicals.includes('noCommission'),
  );
  assert.ok(noMiddleman, 'owner/noCommission overlap must stay explicit and reviewable');
});

test('validator detects unknown languages and duplicate normalized aliases', () => {
  const invalid = [{
    canonical: 'demo',
    aliases: { russian: ['Test'], en: ['Test', 'test'] },
  }];
  const kinds = validateLexicon(invalid).errors.map(({ kind }) => kind);
  assert.ok(kinds.includes('unknownLanguageKey'));
  assert.ok(kinds.includes('duplicateAlias'));
});
