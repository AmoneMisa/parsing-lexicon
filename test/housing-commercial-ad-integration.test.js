import test from 'node:test';
import assert from 'node:assert/strict';

import { parseHousingStructured } from '../src/housing-structured.js';

test('a commercial hotel-group ad suppresses address and price instead of returning an arbitrary single value', () => {
  const text = 'Hotel Malika, Hotel Bek, Hostel Uz\n'
    + 'Tel: +998901112233, +998907778899, +998933334455\n'
    + 'нарх 350$, 400$, 500$, скидки, бронируйте прямо сейчас, ул. Амира Темура 5';
  const parsed = parseHousingStructured(text, { country: 'UZ' });
  assert.equal(parsed.isCommercialAd, true);
  assert.deepEqual(parsed.price, { amount: null, currency: 'UZS', approximate: false });
  assert.deepEqual(parsed.address, { address: null, street: null, houseNumber: null, building: null, confidence: 0 });
});

test('an ordinary single-property listing keeps its address and price untouched', () => {
  const text = 'Сдам 2х комнатную квартиру, ул. Амира Темура 5. тел +998901112233. цена 350$';
  const parsed = parseHousingStructured(text, { country: 'UZ' });
  assert.equal(parsed.isCommercialAd, false);
  assert.equal(parsed.price.amount, 350);
  assert.equal(parsed.address.street, 'Амира Темура');
});
