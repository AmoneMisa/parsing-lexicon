import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHousingTextLanguage, housingTextIsInLanguage } from '../src/housing-language.js';

const RU = 'Сдается квартира, 2 комнаты, 5 этаж, рядом метро, коммунальные отдельно';
const UK = 'Здається квартира, 2 кімнати, 5 поверх, поруч метро, комунальні окремо';
const EN = 'Apartment for rent, 2 rooms, 5th floor, near metro, utilities not included';
const UZ = 'Kvartira ijaraga beriladi, 2 xona, 5-qavat, metroga yaqin, narxi kelishilgan';
const RO = 'Apartament de închiriat, 2 camere, etajul 5, aproape de metrou, preț negociabil';
const KK = 'Пәтер жалға беріледі, 2 бөлме, 5 қабат, метроға жақын, бағасы келісімді';

test('recognises the language a housing text is written in', () => {
  assert.equal(detectHousingTextLanguage(RU), 'ru');
  assert.equal(detectHousingTextLanguage(UK), 'uk');
  assert.equal(detectHousingTextLanguage(EN), 'en');
  assert.equal(detectHousingTextLanguage(UZ), 'uz');
  assert.equal(detectHousingTextLanguage(RO), 'ro');
  assert.equal(detectHousingTextLanguage(KK), 'kk');
});

test('housingTextIsInLanguage answers the translation question', () => {
  assert.equal(housingTextIsInLanguage(RU, 'ru'), true);
  assert.equal(housingTextIsInLanguage(RU, 'en'), false);
  assert.equal(housingTextIsInLanguage(EN, 'en'), true);
  assert.equal(housingTextIsInLanguage(EN, 'ru'), false);
  assert.equal(housingTextIsInLanguage(RO, 'ro'), true);
  assert.equal(housingTextIsInLanguage(RO, 'ru'), false);
  assert.equal(housingTextIsInLanguage(KK, 'kk'), true);
  assert.equal(housingTextIsInLanguage(KK, 'ru'), false);
  assert.equal(housingTextIsInLanguage(KK, 'uk'), false);
});

test('Uzbek Cyrillic is not mistaken for Russian or Kazakh', () => {
  const uzCyrl = 'Квартира ижарага берилади, 2 хона, 5-қават, метрога яқин';
  assert.equal(housingTextIsInLanguage(uzCyrl, 'ru'), false);
  assert.equal(housingTextIsInLanguage(uzCyrl, 'kk'), false);
  assert.equal(detectHousingTextLanguage(uzCyrl), null);
});

test('a shared word alone is not enough to cross-classify Romanian and Kazakh', () => {
  assert.equal(housingTextIsInLanguage('balcon', 'ro'), false);
  assert.equal(housingTextIsInLanguage('метро', 'kk'), false);
});

test('Ukrainian furniture word is recognised in every case form', () => {
  // Regression: the pattern required the literal substring "меблі", so
  // dative/instrumental/locative forms ("меблях", "меблями") never counted —
  // only nominative/genitive did. Needed a bare "мебл" stem like every other
  // entry in this dictionary uses. Paired with exactly one other signal word
  // (minimum is 2) so a broken furniture match would drop the count to 1 and
  // flip the result, instead of being masked by extra unrelated evidence.
  for (const form of ['меблі', 'меблів', 'меблям', 'меблями', 'меблях']) {
    assert.equal(housingTextIsInLanguage(`Квартира з ${form}`, 'uk'), true, form);
  }
});

test('a single shared word is not enough evidence', () => {
  assert.equal(housingTextIsInLanguage('metro', 'en'), false);
  assert.equal(housingTextIsInLanguage('Метро', 'ru'), false);
});

test('empty and unknown input yields no language', () => {
  assert.equal(detectHousingTextLanguage(''), null);
  assert.equal(detectHousingTextLanguage(null), null);
  assert.equal(detectHousingTextLanguage('zzz qqq'), null);
  assert.equal(housingTextIsInLanguage('', 'ru'), false);
  assert.equal(housingTextIsInLanguage(RU, 'de'), false);
});
