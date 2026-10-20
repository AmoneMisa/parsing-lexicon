import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cleanHousingSourceText,
  detectHousingSource,
  parseHousingSourcePost,
} from '../src/housing-source-aliases.js';
import {
  parseHousingAreaFromText,
  parseHousingFloorFromText,
  parseHousingRoomsFromText,
} from '../src/housing-text.js';
import { parseHousingListingFields } from '../src/housing-listing-fields.js';
import { parseHousingAddress } from '../src/housing-address.js';
import { parseHousingAreas } from '../src/housing-structured.js';

const THREADS_POST = `nika_imgrund
3d
А вы бы сняли квартиру напротив Ташкент Сити Бульвара, в 3-х минутах от метро Дружба Народов за 1200$?
Сдаю квартиру в аренду — собственник, без риелтора ❗
2-х комнатная квартира, 2/9 этаж
Общая площадь 51,7 кв.м, жилая 32,12 кв.м
После капитального ремонта, ранее никто не жил
Внутри абсолютно ВСЁ новое
Новая бытовая техника, сантехника, встроенная мебель
Кондиционер, посудомойка, телевизор 65 дюймов
Новая кровать и матрас Аскона
ТОЛЬКО долгосрочная аренда
Все подробности — в лс
Translate`;

test('detects a copied Threads housing post from its wrapper shape', () => {
  assert.equal(detectHousingSource(THREADS_POST), 'Threads');
});

test('uses the first Threads line as contact and removes source UI garbage', () => {
  const parsed = parseHousingSourcePost(THREADS_POST);
  assert.equal(parsed.source, 'Threads');
  assert.equal(parsed.contact, 'nika_imgrund');
  assert.match(parsed.text, /^А вы бы сняли квартиру/);
  assert.doesNotMatch(parsed.text, /nika_imgrund|^3d$|Translate/m);
  assert.match(parsed.text, /ТОЛЬКО долгосрочная аренда/);
});

test('parses decimal area, first rental and does not invent an address from area text', () => {
  const { text } = parseHousingSourcePost(THREADS_POST);

  assert.equal(parseHousingRoomsFromText(text), 2);
  assert.deepEqual(parseHousingFloorFromText(text), { floor: 2, totalFloors: 9 });
  assert.equal(parseHousingAreaFromText(text), 51.7);
  assert.deepEqual(parseHousingAreas(text), {
    total: 51.7,
    living: 32.12,
    kitchen: null,
    balcony: null,
    terrace: null,
  });

  const fields = parseHousingListingFields(text, { country: 'UZ' });
  assert.equal(fields.firstRent, true);
  assert.equal(fields.dishwasher, true);
  assert.equal(fields.airConditioner, true);
  assert.equal(fields.furnished, true);

  const address = parseHousingAddress(text);
  assert.equal(address.address, null);
  assert.equal(address.street, null);
  assert.equal(address.houseNumber, null);
});

test('cleans explicit Threads markers without changing meaningful description lines', () => {
  const copied = `Threads\n@nika_imgrund\n3d\nСдаю квартиру.\nTranslate`;
  assert.equal(detectHousingSource(copied), 'Threads');
  assert.equal(cleanHousingSourceText(copied), 'Сдаю квартиру.');
});

test('accepts lowercase source input but normalizes output to Threads', () => {
  const parsed = parseHousingSourcePost(THREADS_POST, { source: 'threads' });
  assert.equal(parsed.source, 'Threads');
  assert.equal(parsed.contact, 'nika_imgrund');
});

test('does not classify ordinary listing text as Threads', () => {
  const text = 'Сдаю квартиру\n2/9 этаж\nВсе подробности в лс';
  assert.equal(detectHousingSource(text), null);
  assert.equal(cleanHousingSourceText(text), text);
});

test('portal footer and pagination are cut so the site address and phone never reach the parsers', async () => {
  const {cleanHousingSourceText} = await import('../src/housing-source-aliases.js');
  const {parseHousingStructured} = await import('../src/housing-structured.js');
  const body = '900 У.е./мес. 3-комн. квартира 95 м² 8/12 город Ташкент, Мирабадский район, улица Нукус. Риелтор Написать автору +998 ** *** **** 1 … 19 20 21 … 549';
  const footer = ' Площадка для покупки, продажи и аренды недвижимости в Узбекистане. Контакы ИП ООО «Seide International» г. Ташкент, Яшнабадский район, массив М.Риёзий, 13/1 +998-55-515-2002 info@uybor.uz © 2015- 2026 ИП ООО «Seide International» Все права защищены';
  const cleaned = cleanHousingSourceText(body + footer);
  assert.doesNotMatch(cleaned, /Seide|Риёзий|Все права|19 20 21/u);
  assert.match(cleaned, /Нукус/u);
  const parsed = parseHousingStructured(body + footer, {country: 'UZ', city: 'Tashkent', dealType: 'longRent'});
  assert.equal(parsed.address.district, 'Mirobod');
  assert.equal(parsed.contacts.phones.length, 0);
  assert.equal(cleanHousingSourceText('Сдам квартиру. Все права защищены'), 'Сдам квартиру. Все права защищены');
});
