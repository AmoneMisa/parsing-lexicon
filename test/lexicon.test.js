import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADDRESS_TERMS,
  CANDIDATE_FIELD_TERMS,
  DEAL_TYPES,
  HIRING_INTENT,
  TASHKENT_METRO,
  canonicalCity,
  canonicalTashkentDistrict,
  canonicalTashkentMetro,
  findCanonical,
  foldCyrillicForSearch,
  normalizeForMatch,
} from '../src/index.js';

const aliasValues = (entry) => Object.values(entry.aliases).flat();

test('normalizes Uzbek apostrophe variants to the same match form', () => {
  const variants = ["O'zbekiston", 'O‘zbekiston', 'Oʻzbekiston', 'Oʼzbekiston'];
  assert.equal(new Set(variants.map(normalizeForMatch)).size, 1);
});

test('folds Uzbek and Kazakh Cyrillic search characters', () => {
  assert.equal(foldCyrillicForSearch('Ўзбекистон'), 'ozbekiston');
  assert.equal(foldCyrillicForSearch('Қарағанды'), 'qaragandy');
  assert.equal(foldCyrillicForSearch('Өскемен'), 'oskemen');
});

test('canonicalizes Uzbek cities across scripts', () => {
  assert.equal(canonicalCity('Тошкент', 'UZ'), 'Tashkent');
  assert.equal(canonicalCity('Samarqand', 'UZ'), 'Samarkand');
  assert.equal(canonicalCity('Фарғона', 'UZ'), 'Fergana');
  assert.equal(canonicalCity('Қарши', 'UZ'), 'Qarshi');
});

test('canonicalizes Kazakh cities using Kazakh, Russian and historical names', () => {
  assert.equal(canonicalCity('Қарағанды', 'KZ'), 'Karaganda');
  assert.equal(canonicalCity('Ақтөбе', 'KZ'), 'Aktobe');
  assert.equal(canonicalCity('Нур-Султан', 'KZ'), 'Astana');
  assert.equal(canonicalCity('Усть-Каменогорск', 'KZ'), 'Oskemen');
});

test('canonicalizes Tashkent districts across Uzbek and Russian forms', () => {
  assert.equal(canonicalTashkentDistrict('Шайхонтоҳур тумани'), 'Shaykhantahur');
  assert.equal(canonicalTashkentDistrict('Чиланзарский район'), 'Chilanzar');
  assert.equal(canonicalTashkentDistrict('Yakkasaroy tumani'), 'Yakkasaray');
});

test('Tashkent metro keeps all 50 canonical stations and legacy aliases', () => {
  assert.equal(TASHKENT_METRO.length, 50);
  assert.equal(canonicalTashkentMetro('метро Максим Горький'), 'Buyuk Ipak Yoli');
  assert.equal(canonicalTashkentMetro('Бунёдкор'), 'Xalqlar Dostligi');
  assert.equal(canonicalTashkentMetro('Қўйлиқ'), 'Qoyliq');
  assert.equal(canonicalTashkentMetro('Gʻafur Gʻulom'), 'Gafur Gulom');
});

test('housing lexicon covers Kazakh and Uzbek Cyrillic address/deal vocabulary', () => {
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('кўчаси'));
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('көшесі'));
  assert.ok(aliasValues(ADDRESS_TERMS.residentialComplex).includes('тұрғын үй кешені'));
  assert.equal(findCanonical('жалға беріледі', DEAL_TYPES)?.canonical, 'longRent');
  assert.equal(findCanonical('суткалик', DEAL_TYPES)?.canonical, 'shortRent');
  assert.equal(findCanonical('сатылады', DEAL_TYPES)?.canonical, 'sale');
});

test('hiring lexicon covers Uzbek Cyrillic and Kazakh CV language', () => {
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.experience).includes('тажриба'));
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.skills).includes('дағдылар'));
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.salary).includes('жалақы'));
  assert.ok(aliasValues(HIRING_INTENT.candidate).includes('жұмыс іздеймін'));
  assert.ok(aliasValues(HIRING_INTENT.employer).includes('қызметкер керек'));
});
