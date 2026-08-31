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

test('Uzbek per-day operating costs do not turn a sale into short rent', () => {
  const text = `Тошкент шахар, Шайхонтохур тумани, Самарканд Дарваза МФЙ,
  биринчи каватда, 2 хонали квартира, 56 м.кв. Мебель ва техникаси колади.
  Электрга 50% чегирма бу домда, кунига барча жихозларни ишлатганиздаям
  купи билан 8 минг сум езади. Нархи такалгани 940 мил сум. ками йук.`;

  assert.equal(resolveHousingIntent(text), null);
  assert.equal(resolveHousingIntent('Квартира ижарага берилади, нархи кунига 300 минг сум')?.dealType, 'shortRent');
  assert.equal(resolveHousingIntent('Квартира нархи кунига 300 минг сум')?.dealType, 'shortRent');
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

test('housing context recognizes bare Russian nearby', () => {
  const result = parseHousingContext('Рядом есть рынок и супермаркеты.');
  assert.ok(result.locationRelations.includes('near'));
});

test('housing context covers common Uzbek brick and separate-room spellings', () => {
  const brick = parseHousingContext('янги гиштли лифтли дом');
  assert.equal(brick.buildingType, 'brick');

  const layout = parseHousingContext('aloxida xonalar');
  assert.ok(layout.layouts.includes('separateRooms'));
});

test('closed housing status outranks generic active wording', () => {
  const result = parseHousingContext('Объявление было актуально, но уже сдано.');
  assert.equal(result.listingStatus, 'rented');
});
