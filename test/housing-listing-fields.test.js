import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingListingFields } from '../src/index.js';
import { parseHousingListingEnrichment } from '../src/housing-listing-enrichment.js';
import { parseHousingStructured } from '../src/housing-structured.js';
import { matchDictionaryLocation } from '../src/locations-runtime.js';

test('centralized housing field parser covers listing table semantics', () => {
  const result = parseHousingListingFields(`
    Первая сдача. Минимальный срок аренды 6 месяцев. Доступно с 15.09.2026.
    2 спальни, 1 санузел. Дом 2022 года. Новостройка.
    С мебелью, есть балкон, посудомойка, кондиционер, газ, отопление, горячая вода.
    Есть парковка и лифт. Wi-Fi роутер. Собственный двор и беседка.
    Коммунальные отдельно, примерно 2500 грн. Торг возможен.
    Можно с небольшим животным, с детьми можно. Курить нельзя.
  `);

  assert.equal(result.bedrooms, 2);
  assert.equal(result.bathrooms, 1);
  assert.equal(result.buildingYear, 2022);
  assert.equal(result.newBuilding, true);
  assert.equal(result.furnished, true);
  assert.equal(result.balcony, true);
  assert.equal(result.dishwasher, true);
  assert.equal(result.airConditioner, true);
  assert.equal(result.gas, true);
  assert.equal(result.heating, true);
  assert.equal(result.hotWater, true);
  assert.equal(result.parking, true);
  assert.equal(result.elevator, true);
  assert.equal(result.internet, true);
  assert.equal(result.privateYard, true);
  assert.equal(result.courtyard, true);
  assert.equal(result.gazebo, true);
  assert.equal(result.communalSeparated, true);
  assert.equal(result.negotiable, true);
  assert.equal(result.petsAllowed, true);
  assert.equal(result.childrenAllowed, true);
  assert.equal(result.smokingAllowed, false);
  assert.equal(result.firstRent, true);
  assert.deepEqual(result.minRentTerm, { value: 6, unit: 'month' });
  assert.equal(result.availableFrom, '15.09.2026');
  assert.deepEqual(result.utilitiesAmount, { amount: 2500, currency: 'UAH', approximate: true });
});

test('extracts Uzbek move-in date attached to the ablative suffix', () => {
  const result = parseHousingListingFields('Горгaзда 1- хоналик 4- каватда квартира ижарага 1-сентябрдан берилади');
  assert.equal(result.availableFrom, '1-сентябр');
});

test('recognizes bare furniture and mixed Uzbek equipment wording', () => {
  const result = parseHousingListingFields('mebel va oshxona jihozlari, konditsioner, wefi');
  assert.equal(result.furnished, true);
  assert.equal(result.airConditioner, true);
  assert.equal(result.internet, true);
});

test('keeps common Dream House listing booleans in the listing field parser', () => {
  const result = parseHousingListingFields(`
    ЖК Dream House. 2 санузла. Депозит за 1 месяц.
    Свое бесплатное парковочное место! Мебель + техника.
  `);
  assert.equal(result.bathrooms, 2);
  assert.equal(result.depositRequired, true);
  assert.equal(result.parking, true);
  assert.equal(result.furnished, true);
});

test('does not retain rental-only utility payments for a Ukrainian sale listing', () => {
  const text = `
    Продажа. Продам 4-комнатную квартиру в Харькове за 55 000 USD.
    Коммунальные оплачиваются отдельно, около 2500 грн.
  `;

  const fields = parseHousingListingFields(text, { country: 'UA' });
  const structured = parseHousingStructured(text, { country: 'UA' });
  const enrichment = parseHousingListingEnrichment(text, { country: 'UA' });

  assert.equal(fields.communalSeparated, null);
  assert.equal(fields.utilitiesAmount, null);
  assert.equal(structured.intent?.dealType, 'sale');
  assert.equal(structured.payments.utilities, null);
  assert.equal(enrichment.communalSeparated, null);
  assert.equal(enrichment.utilitiesAmount, null);
});

test('parses Ukrainian move-in availability and keeps the Kharkiv area ahead of nearby supermarkets', () => {
  const text = `
    Довгострокова оренда 1-к кв. (ст. м. Хол. Гора — 4 хв. пішки).
    Поруч супермаркети Рост, Класс, АТБ. Перегляд і заселення можливі лише з 12 вересня.
  `;

  assert.equal(parseHousingListingFields(text, { country: 'UA' }).availableFrom, '12 вересня');
  assert.equal(matchDictionaryLocation(text, 'UA', 'Kharkiv')?.name, 'Kholodna Hora');
});

test('does not turn a phone prefix after utilities into a utility amount', () => {
  const result = parseHousingListingFields('Цена 6000 грн плюс коммунальные. Тел. 0612345671', { country: 'UA' });
  assert.equal(result.utilitiesAmount, null);
});
