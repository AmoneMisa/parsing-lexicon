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

test('a number already read as a duration is not also reported as a bare price', () => {
  assert.deepEqual(parseHousingPrice('Сдаю на 1200 дней', {country: 'UA'}), {
    amount: null,
    currency: 'UAH',
    approximate: false,
  });
  // A real price near duration wording must still resolve normally.
  assert.deepEqual(parseHousingPrice('Сдаю квартиру, цена 15000$, на 1200 дней', {country: 'UA'}), {
    amount: 15000,
    currency: 'USD',
    approximate: false,
  });
});

test('bare "сом" resolves via fallback currency instead of always defaulting to UZS', () => {
  // "сом" (Cyrillic) is used colloquially for both Uzbekistan's and
  // Kyrgyzstan's currencies. Kyrgyzstan housing sources (house.kg, lalafo.kg,
  // myhouse.kg, sutochno.kg) that print "<amount> сом" with no further
  // disambiguator must resolve against the caller's KGS context, not be
  // silently mistagged as UZS.
  assert.deepEqual(parseHousingPrice('7 000 сом', 'KGS'), {
    amount: 7000,
    currency: 'KGS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('7 000 сом', 'UZS'), {
    amount: 7000,
    currency: 'UZS',
    approximate: false,
  });
});

test('unlabelled Uzbek "Narxi 900 000" is so\'m when the deal type is unknown', () => {
  const text = "Kimga: student qizlarga\nXona: 2 xonali\nNarxi: 900 000\n";
  assert.deepEqual(parseHousingPrice(text, 'UZ'), {amount: 900000, currency: 'UZS', approximate: false});
  assert.deepEqual(parseHousingPrice(text, {country: 'UZ', dealType: 'longRent'}), {amount: 900000, currency: 'UZS', approximate: false});
  assert.equal(parseHousingPrice('Narxi: 500', 'UZ').currency, 'USD');
});

test('"student qizlarga" keeps students as an audience and "24/7 korzinka" has no branch number', async () => {
  const {parseHousingAudience} = await import('../src/housing-listing-enrichment.js');
  const {parseHousingInfrastructure} = await import('../src/housing-structured.js');
  assert.deepEqual(parseHousingAudience('Kimga: student qizlarga'), {primary: 'women', alternatives: ['women', 'students']});
  const [korzinka] = parseHousingInfrastructure('metro yonida 24/7 korzinka').filter((item) => item.poi === 'Korzinka');
  assert.equal(korzinka.number, null);
  assert.equal(korzinka.raw, 'korzinka');
});

test('Tashkent "Sergeli 5 104" yields massif and house number', async () => {
  const {parseHousingListingEnrichment} = await import('../src/housing-listing-enrichment.js');
  const r = parseHousingListingEnrichment("Manzil: Sergeli 5 104 ( o'zgarish netrosi yonida)", {country: 'UZ', city: 'Tashkent'});
  assert.equal(r.district, 'Sergeli');
  assert.deepEqual(r.quarter, {number: 5, suffix: ''});
  assert.equal(r.addressHouseNumber, '104');
});

test('Uzbek "ko\'chasi N-uy" and trailing district do not pollute the street', async () => {
  const {parseHousingAddress} = await import('../src/housing-address.js');
  for (const [text, street, house] of [
    ["Manzil: Bunyodkor ko'chasi 12-uy", 'Bunyodkor', '12'],
    ["Bunyodkor ko'chasi 12 uy", 'Bunyodkor', '12'],
    ["Manzil: Qatortol ko'chasi 45 uy, Sergeli", 'Qatortol', '45'],
  ]) {
    const r = parseHousingAddress(text);
    assert.equal(r.street, street, text);
    assert.equal(r.houseNumber, house, text);
  }
  assert.equal(parseHousingAddress("Manzil: Sergeli 5 104").street, null);
});

test('a building after the house number survives trimming the trailing district', async () => {
  const {parseHousingAddress} = await import('../src/housing-address.js');
  const r = parseHousingAddress("Shota Rustaveli ko'chasi 58, korpus 2");
  assert.equal(r.street, 'Shota Rustaveli');
  assert.equal(r.houseNumber, '58');
  assert.equal(r.building, '2');
  assert.equal(parseHousingAddress("Qatortol ko'chasi 45, Sergeli").street, 'Qatortol');
});
