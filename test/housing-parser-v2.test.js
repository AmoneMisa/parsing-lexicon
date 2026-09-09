import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingV2 } from '../src/housing-parser-v2.js';

test('housing V2 emits explainable numeric candidates for a noisy listing', () => {
  const parsed = parseHousingV2('Сдам 3-к кв, м.Спортивная 7 мин,\n11/12, общ.пл.80 м², 22000 грн', { country: 'UA' });
  assert.equal(parsed.data.rooms, 3);
  assert.equal(parsed.data.floor, 11);
  assert.equal(parsed.data.totalFloors, 12);
  assert.equal(parsed.data['area.total'], 80);
  assert.equal(parsed.data.money.amount, 22000);
  assert.deepEqual(parsed.data.distance, { amount: 7, unit: 'minute' });
  assert.ok(parsed.debug.candidates.every((item) => item.evidence.length));
});

test('housing V2 resolves scaled Uzbek money without a legacy fallback', () => {
  const parsed = parseHousingV2('2 xona, 5/9, 55 м2, narxi 850 ming', { country: 'UZ' });
  assert.equal(parsed.data.rooms, 2);
  assert.equal(parsed.data.money.amount, 850000);
  assert.equal(parsed.data.money.currency, 'UZS');
});

test('housing V2 resolves temporal availability and minimum rental duration through the shared engine', () => {
  const parsed = parseHousingV2('Квартира свободна с 12 января, сдаётся от 3 месяцев', { publishedAt: '2026-12-20T12:00:00Z' });
  assert.deepEqual(parsed.data.availabilityDate, { year: 2027, month: 1, day: 12 });
  assert.deepEqual(parsed.data.minimumRentalDuration, { value: 3, unit: 'month', bound: 'min' });
  assert.ok(parsed.debug.refinersApplied.includes('temporal-context'));
});

test('housing V2 keeps rental-duration spans out of address and geo components', () => {
  const parsed = parseHousingV2('Квартира сдаётся от 1 месяца', { country: 'UA', city: 'Kharkiv' });
  assert.deepEqual(parsed.data.minimumRentalDuration, { value: 1, unit: 'month', bound: 'min' });
  assert.equal(parsed.data['address.street'], undefined);
  assert.equal(parsed.data['address.houseNumber'], undefined);
  assert.equal(parsed.data['geo.district'], undefined);
});

test('housing V2 emits address and catalog-reference candidates without coordinates', () => {
  const parsed = parseHousingV2('Yashnobot tuman Olmos metrosi Olmos mahalla 3/11/16', {
    country: 'UZ', city: 'Tashkent',
    resolveGeoEntity({ type, canonical }) {
      const id = { 'district:Yashnobod': 'uz:tashkent:district:yashnobod', 'metro:Olmos': 'uz:tashkent:metro:olmos' }[`${type}:${canonical}`];
      return id ? { id, canonicalName: canonical, type, country: 'UZ', parentId: 'uz:tashkent' } : null;
    },
  });
  assert.equal(parsed.data['address.houseNumber'], '3/11/16');
  assert.equal(parsed.data['geo.district'], 'Yashnobod');
  assert.equal(parsed.data['geo.metro'], 'Olmos');
  assert.equal(parsed.data['geoReference.metro'].id, 'uz:tashkent:metro:olmos');
  assert.equal('coordinates' in parsed.data['geoReference.metro'], false);
  assert.ok(parsed.debug.refinersApplied.includes('geo-catalog-reference'));
});
