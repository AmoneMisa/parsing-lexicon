import test from 'node:test';
import assert from 'node:assert/strict';

import { detectHousingCommercialAdSignals, isHousingCommercialAd } from '../src/housing-intent.js';

test('a hotel-group advertisement with multiple businesses, phones and prices is flagged commercial', () => {
  const text = 'Hotel Malika, Hotel Bek, Hostel Uz\n'
    + 'Tel: +998901112233, +998907778899, +998933334455\n'
    + 'narx 350$, 400$, 500$, скидки, бронируйте прямо сейчас';
  const signals = detectHousingCommercialAdSignals(text);
  assert.equal(signals.multipleBusinessNames, true);
  assert.equal(signals.repeatedContactBlocks, true);
  assert.equal(signals.manyPriceMentions, true);
  assert.equal(signals.promotionalText, true);
  assert.equal(isHousingCommercialAd(text), true);
});

test('an ordinary single-property listing that merely names a nearby hotel is not flagged', () => {
  const text = 'Сдам 2х комнатную квартиру, рядом гостиница Малика. тел +998901112233. цена 350$';
  const signals = detectHousingCommercialAdSignals(text);
  assert.equal(Object.values(signals).filter(Boolean).length <= 1, true);
  assert.equal(isHousingCommercialAd(text), false);
});

test('a single weak signal alone does not trigger commercial classification', () => {
  // Two phone numbers on a broker listing is common and must not alone flag as commercial.
  const text = 'Сдам квартиру, тел +998901112233 или +998907778899, цена 400$';
  assert.equal(isHousingCommercialAd(text), false);
});
