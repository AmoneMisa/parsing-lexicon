import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingContext, resolveHousingIntent } from '../src/index.js';

test('housing action stays orthogonal to rent duration', () => {
  assert.deepEqual(resolveHousingIntent('Сдам квартиру посуточно'), {
    action: 'rentOut', listingKind: 'propertyOffer', dealType: 'shortRent',
  });
  assert.deepEqual(resolveHousingIntent('Сниму квартиру'), {
    action: 'rentIn', listingKind: 'propertyWanted', dealType: 'longRent',
  });
});

test('housing context preserves negated policies and legal state', () => {
  const result = parseHousingContext('Новый ремонт. Без животных, с детьми можно. Ипотека возможна. Кадастр готов. Без торга.');
  assert.equal(result.condition, 'newRenovation');
  assert.equal(result.tenantPolicies.pets, 'notAllowed');
  assert.equal(result.tenantPolicies.children, 'allowed');
  assert.ok(result.financing.includes('mortgageAllowed'));
  assert.ok(result.documents.includes('cadastralReady'));
  assert.ok(result.priceModifiers.includes('fixed'));
});

test('housing context recognizes Uzbek ready documents and contract wording', () => {
  const result = parseHousingContext('Hujjatlari joyida shartnoma ham qilib beriladi.');
  assert.ok(result.documents.includes('documentsReady'));
  assert.ok(result.documents.includes('contractAvailable'));
});

test('housing context recognizes the short Uzbek near relation', () => {
  const result = parseHousingContext('boxcha, supermarket, korzinka yaqin.');
  assert.ok(result.locationRelations.includes('near'));
});

test('closed housing status outranks generic active wording', () => {
  const result = parseHousingContext('Объявление было актуально, но уже сдано.');
  assert.equal(result.listingStatus, 'rented');
});
