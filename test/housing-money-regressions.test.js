import test from 'node:test';
import assert from 'node:assert/strict';

import {parseHousingPrice, parseHousingPricePerSqm} from '../src/housing-money.js';
import {parseHousingStructured} from '../src/housing-structured.js';

test('housing multipliers do not match measurement or word prefixes', () => {
  assert.deepEqual(parseHousingPrice('Yunusobod 500 m2 hovli sotiladi', 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Sergele metroda 5 minut metroga piyoda', 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Сдам 1-к кв на Салтовке, 531 м/р, 7000+коммун.', 'UAH'), {
    amount: 7000,
    currency: 'UAH',
    approximate: false,
  });
});

test('country-aware housing parsing masks Ukrainian area and microdistrict notation', () => {
  const aerokosmichnyi = 'Сдам 3-к кв в Новострое на Аэрокосмическом пр.41,м.Спортивная 7 мин,11/12,кирпич,общ.пл.80 м,кухня-гостинная+2 разд.комнаты,евроремонт,мебель,2-спальная кровать+диван+2-ярусная детская кровать,кондиционер,посудомойка,холод,индукц.плита,духовка,СВЧ,стиралка,бойлер 22000+коммун.Без животных. 0956183826, 0679396050';
  const saltivka = 'Сдам свою 2х кімнатну квартиру, в довгострокову аренду, Салтівка, 606м/р, разв’язка транспорта хороша, поблизу базар та супермаркети, школа, садочок, 4/5, 6000грн+комуналка+6000(залог), 0971698824';

  assert.deepEqual(parseHousingPrice(aerokosmichnyi, {country: 'UA'}), {
    amount: 22000,
    currency: 'UAH',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice(saltivka, {country: 'UA'}), {
    amount: 6000,
    currency: 'UAH',
    approximate: false,
  });

  // Legacy callers still pass the country's fallback currency. That path is
  // kept compatible and resolves unique default currencies back to a country.
  assert.equal(parseHousingPrice(aerokosmichnyi, 'UAH').amount, 22000);
  assert.equal(parseHousingPrice(saltivka, 'UAH').amount, 6000);
});

test('one-letter million shorthand cannot outrank housing measurements', () => {
  assert.deepEqual(parseHousingPrice('общ.пл.80 m, аренда 22000', {country: 'UA'}), {
    amount: 22000,
    currency: 'UAH',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('606m/r, rent 6000', {country: 'UA'}), {
    amount: 6000,
    currency: 'UAH',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('80m'), {
    amount: null,
    currency: '',
    approximate: false,
  });
});

test('Uzbek sale context restores compact m as million without weakening measurement guards', () => {
  assert.deepEqual(parseHousingPrice('800m', {country: 'UZ', dealType: 'sale'}), {
    amount: 800_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice("80m uzbek so'm", {country: 'UZ'}), {
    amount: 80_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Narxi 950 m', {country: 'UZ'}), {
    amount: 950_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('metro 800m, kvartira sotiladi', {country: 'UZ', dealType: 'sale'}), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('umumiy maydon 80m, narxi 800m', {country: 'UZ', dealType: 'sale'}), {
    amount: 800_000_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('structured Ukrainian parsing keeps rental price, deposit and phone domains separate', () => {
  const text = 'Сдам свою 2х кімнатну квартиру, в довгострокову аренду, Салтівка, 606м/р, разв’язка транспорта хороша, поблизу базар та супермаркети, школа, садочок, 4/5, 6000грн+комуналка+6000(залог), 0971698824';
  const parsed = parseHousingStructured(text, {country: 'UA'});

  assert.equal(parsed.intent?.dealType, 'longRent');
  assert.equal(parsed.price.amount, 6000);
  assert.equal(parsed.price.currency, 'UAH');
  assert.equal(parsed.payments.deposit.required, true);
  assert.equal(parsed.payments.deposit.amount, 6000);
  assert.notEqual(parsed.payments.deposit.amount, 97169882);
  assert.ok(parsed.contacts.phones.some((phone) => phone.raw.includes('0971698824')));
});

test('housing multipliers still parse complete scale words', () => {
  assert.deepEqual(parseHousingPrice('Цена 5 миллионов', 'UZS'), {
    amount: 5_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Narxi 200 000 kunlik', 'UZS'), {
    amount: 200_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('per-square-meter amounts are not treated as total listing prices', () => {
  assert.deepEqual(
    parseHousingPrice('Цена: Гибрид/Ипотека на стадии строительство 18%/ рассрочка От 13 млн за м2 Эксклюзив', 'UZS'),
    {amount: null, currency: 'UZS', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Цена 13 000 000 сум за м²', 'UZS'),
    {amount: null, currency: 'UZS', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Sale price $1200/m2', 'USD'),
    {amount: null, currency: 'USD', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Цена 45 000$; также 13 млн сум за м2', 'UZS'),
    {amount: 45_000, currency: 'USD', approximate: false},
  );
});

test('parses Uzbek classifieds split-million notation', () => {
  assert.deepEqual(
    parseHousingPrice('2 хона 2 млн 500 + агентство хизмати', 'UZS'),
    { amount: 2_500_000, currency: 'UZS', approximate: false },
  );
  assert.deepEqual(parseHousingPrice('ijara 3 mln 250', 'UZS'), {
    amount: 3_250_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('currency codes do not match as a substring of an unrelated word', () => {
  // "cad" is a substring of "cadastru" (RO: cadastral record) — it must not
  // be read as a 100 CAD price.
  assert.deepEqual(parseHousingPrice('100 cadastru'), { amount: null, currency: '', approximate: false });
  assert.deepEqual(parseHousingPrice('rent 1200 CAD'), { amount: 1200, currency: 'CAD', approximate: false });
  assert.deepEqual(parseHousingPrice('CAD 1200 rent'), { amount: 1200, currency: 'CAD', approximate: false });
});

test('a currency symbol directly touching its number (no space) still parses', () => {
  // The boundary that blocks "cad" bleeding into "cadastru" must not also
  // reject a digit immediately touching its currency symbol, which is the
  // ordinary way prices are written ("350$", "$100").
  assert.deepEqual(
    parseHousingPrice('2 хонали 3 этажда ремонти яхши холатда турибди 350$', 'UZS'),
    { amount: 350, currency: 'USD', approximate: false },
  );
  assert.deepEqual(parseHousingPrice('rent $100 monthly'), { amount: 100, currency: 'USD', approximate: false });
});

test('dotted currency suffix parses as money but payment amounts stay out of listing price', () => {
  assert.deepEqual(parseHousingPrice('Аренда 800$, депозит 500.$', 'USD'), {
    amount: 800,
    currency: 'USD',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Uyning depaziti xam bor 500.$', 'USD'), {
    amount: null,
    currency: 'USD',
    approximate: false,
  });
});

test('marks an approximate price when the text hedges the amount', () => {
  assert.deepEqual(parseHousingPrice('Цена около 800$'), { amount: 800, currency: 'USD', approximate: true });
});

test('sale price per square meter is not parsed as the listing total', () => {
  const text = 'Цена: Гибрид/Ипотека на стадии строительство 18%/рассрочка От 13 млн за м2 Эксклюзив';

  assert.deepEqual(parseHousingPrice(text, 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm(text, 'UZS'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('per-square-meter parser supports explicit currencies and common unit forms', () => {
  assert.deepEqual(parseHousingPricePerSqm('13 000 000 сум/м²', 'USD'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm('price per sqm: 1,100 USD'), {
    amount: 1100,
    currency: 'USD',
    approximate: false,
  });
});

test('a total sale price still wins when a separate per-square-meter quote is present', () => {
  const text = 'Цена 572 млн сум, 13 млн сум за м2';
  assert.deepEqual(parseHousingPrice(text, 'UZS'), {
    amount: 572_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm(text, 'UZS'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('a bare build year is not mistaken for the listing price', () => {
  assert.deepEqual(parseHousingPrice('Дом 2022 года постройки, сдается в долгосрочную аренду', {country: 'UA'}), {
    amount: null,
    currency: 'UAH',
    approximate: false,
  });
  // A year next to real price evidence still stays out of the year guard's way.
  assert.deepEqual(parseHousingPrice('Продаю дом, цена 2022 $', {country: 'UA'}), {
    amount: 2022,
    currency: 'USD',
    approximate: false,
  });
});

test('a labelled price range keeps its scale on both endpoints', () => {
  assert.deepEqual(parseHousingPrice('цена 50-60 тыс сум', {country: 'UZ'}), {
    amount: 50000,
    currency: 'UZS',
    approximate: false,
    range: {minimum: 50000, maximum: 60000},
  });
});

test('a keyword-less price range is not deleted by phone masking', () => {
  const result = parseHousingPrice('Продаю, 50000-60000 сум', {country: 'UZ'});
  assert.notEqual(result.amount, null);
  assert.equal(result.currency, 'UZS');
});
