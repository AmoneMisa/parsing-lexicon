import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHousingAreas,
  parseHousingFloor,
  parseHousingInfrastructure,
  parseHousingPayments,
  parseHousingRoomCount,
  parseHousingSeller,
} from '../src/housing-structured.js';

test('normalizes multilingual room counts and floor fractions', () => {
  assert.equal(parseHousingRoomCount('Сдам 2-к квартиру'), 2);
  assert.equal(parseHousingRoomCount('3 xona kvartira'), 3);
  assert.equal(parseHousingRoomCount('4 бөлмелі пәтер'), 4);
  assert.equal(parseHousingRoomCount('1- хоналик квартира'), 1);
  assert.equal(parseHousingRoomCount('2 хона'), 2);
  assert.deepEqual(parseHousingFloor('Этаж 3/9'), { floor: 3, totalFloors: 9 });
  assert.deepEqual(parseHousingFloor('4- каватда квартира'), { floor: 4, totalFloors: null });
  assert.deepEqual(parseHousingFloor('16 этажлик дом, 13-этаж'), { floor: 13, totalFloors: 16 });
});

test('extracts typed area details without collapsing labels', () => {
  assert.deepEqual(parseHousingAreas('Общая площадь 75 м², жилая 44 м², кухня 12 м², балкон 5 м²'), {
    total: 75,
    living: 44,
    kitchen: 12,
    balcony: 5,
    terrace: null,
  });
});

test('extracts deposit, utilities and commission context', () => {
  const result = parseHousingPayments('Депозит 500 USD. Предоплата за 2 месяца. Коммунальные отдельно. Без комиссии.');
  assert.equal(result.deposit.required, true);
  assert.equal(result.deposit.amount, 500);
  assert.equal(result.deposit.currency, 'USD');
  assert.equal(result.prepaymentMonths, 2);
  assert.equal(result.utilities, 'utilitiesSeparate');
  assert.equal(result.commission.required, false);
});

test('does not confuse a deposit duration with a money amount', () => {
  const result = parseHousingPayments('Депозит за 1 месяц');
  assert.equal(result.deposit.required, true);
  assert.equal(result.deposit.amount, null);
  assert.equal(result.deposit.currency, null);
});

test('parses percent placed before the commission keyword', () => {
  const result = parseHousingPayments('Цена 1200 у.е. + 50% комиссия агенства от первого месяца');
  assert.equal(result.commission.required, true);
  assert.equal(result.commission.percent, 50);
});

test('owner context remains independent from no-commission semantics', () => {
  assert.deepEqual(parseHousingSeller('От хозяина, без комиссии'), { type: 'owner', confidence: 1 });
});

test('agency seller recognizes misspelling, service commission and brokerage prose', () => {
  assert.deepEqual(parseHousingSeller('50% комиссия агенства от первого месяца'), { type: 'agency', confidence: 1 });
  assert.deepEqual(parseHousingSeller('2 млн 500 + агентство хизмати'), { type: 'agency', confidence: 1 });
  assert.deepEqual(
    parseHousingSeller('Оперативный, профессиональный подбор лучших вариантов на рынке Недвижимости по Вашим пожеланиям!'),
    { type: 'agency', confidence: 1 },
  );
});

test('binds infrastructure distance to nearby POI', () => {
  const matches = parseHousingInfrastructure('До метро 5 минут пешком, до школы 15 минут.');
  const metro = matches.find(({ poi }) => poi === 'Metro');
  const school = matches.find(({ poi }) => poi === 'School');
  assert.equal(metro?.distance?.value, 5);
  assert.equal(metro?.distance?.mode, 'walk');
  assert.equal(school?.distance?.value, 15);
});
