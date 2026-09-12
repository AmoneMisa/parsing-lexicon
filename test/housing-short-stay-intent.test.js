import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyHousingDealType,
  looksExplicitDailyRentalMention,
  resolveHousingIntent,
} from '../src/housing-intent.js';

// Catalogue cards abbreviate short-stay wording ("посут/почас") and inflect it
// ("подобова оренда"), neither of which matches a canonical dictionary alias.
// Before these were recognised the cards fell through to longRent — either via
// the generic "оренда"/"аренда" alias in the same text, or via a consumer's
// long-rent source default.
const ABBREVIATED_CARD = '600 Грн. Перевірений орендодавець Харків 1-й эт. новострой посут/почас 1к.кв м.Холодная гора 32 м²';
const INFLECTED_CARD = 'Подобова оренда житла в центрі';

test('recognises abbreviated short-stay wording on catalogue cards', () => {
  assert.equal(classifyHousingDealType(ABBREVIATED_CARD), 'shortRent');
  assert.equal(looksExplicitDailyRentalMention(ABBREVIATED_CARD), true);
});

test('an inflected short-stay adjective outranks the generic rent alias', () => {
  assert.equal(classifyHousingDealType(INFLECTED_CARD), 'shortRent');
  assert.equal(classifyHousingDealType('Подобово погодинно 1 кімнатна квартира'), 'shortRent');
  assert.equal(classifyHousingDealType('Посуточная аренда квартиры'), 'shortRent');
});

test('an explicit rent-out action stays an offer while downgrading to shortRent', () => {
  assert.deepEqual(resolveHousingIntent('Здам квартиру подобово'), {
    action: 'rentOut',
    listingKind: 'propertyOffer',
    dealType: 'shortRent',
  });
});

test('a wanted short-stay post is still propertyWanted', () => {
  assert.deepEqual(resolveHousingIntent('Шукаю квартиру подобово'), {
    action: 'rentIn',
    listingKind: 'propertyWanted',
    dealType: 'shortRent',
  });
});

test('long-term wording is unaffected', () => {
  assert.equal(classifyHousingDealType('Довгострокова оренда квартири'), 'longRent');
  assert.equal(classifyHousingDealType('Аренда квартиры помесячно'), 'longRent');
  assert.equal(looksExplicitDailyRentalMention('Довгострокова оренда квартири'), false);
});

test('a landlord label alone classifies nothing', () => {
  assert.equal(classifyHousingDealType('Перевірений орендодавець Харків 32 м²'), null);
});
