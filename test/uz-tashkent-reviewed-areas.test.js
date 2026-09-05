import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const assertMatch = (text, type, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Tashkent');
  assert.ok(match, text);
  assert.equal(match.type, type, text);
  assert.equal(match.name, name, text);
};

test('reviewed Tashkent area candidates resolve to their semantic owners', () => {
  const tashkent = dictionaryFor('UZ', 'Tashkent');

  for (const name of ['Abu Ali ibn Sina-2', 'Guliston', 'Ahmad Yugnakiy', 'Aviasozlar-2', 'Aviasozlar-3', 'Feruza-3', 'Humoyun', 'Tuzel-2', 'Yalangach', "Yo'ldosh-2", "Yo'ldosh-9", "Yo'ldosh-16", "Yo'ldosh-17", "Yo'ldosh-C2", 'Beltepa']) {
    assert.ok(byName(tashkent.localAreas, name), name);
  }
  for (const name of ['Chilanzar-6', 'Chilanzar-7', 'Chilanzar-8', 'Chilanzar-14', 'Chilanzar-20', 'Chilanzar-21', 'Chilanzar-22', 'Dilbulok']) {
    assert.ok(byName(tashkent.microdistricts, name), name);
  }
  assert.ok(byName(tashkent.mahallas, 'Yangi Tashkent'));
  assert.ok(byName(tashkent.mahallas, 'Toshkent mahallasi'));

  assertMatch('квартира, Абу Али ибн Сина-2', 'localAreas', 'Abu Ali ibn Sina-2');
  assertMatch('квартира в жилмассиве Гулистон', 'localAreas', 'Guliston');
  assertMatch('квартира в 21-mavze', 'microdistricts', 'Chilanzar-21');
  assertMatch('квартира в Чиланзар 22-й квартал', 'microdistricts', 'Chilanzar-22');
  assertMatch('квартира, Микрорайон Дилбулок', 'microdistricts', 'Dilbulok');
  assertMatch("Toshkent mahalla fuqarolar yig'ini", 'mahallas', 'Toshkent mahallasi');
  assertMatch('Махалля Янги Тошкент', 'mahallas', 'Yangi Tashkent');
});

test('reviewed Tashkent district noise does not become district owners', () => {
  const tashkent = dictionaryFor('UZ', 'Tashkent');
  for (const name of [
    'Davlat Xizmatlari Agentligi. Yakkasaroy tuman',
    'Электросеть Юнус-Абадского района',
    'Государственная налоговая инспекция Учтепинского района',
    'Кибрайский район',
    'Ташкент',
    'Ташкентский государственный экономический университет',
    'Ташкентский Государственный Технический Университет имени Ислама Каримова',
    'Ташкентский политехнический музей',
    'Уртачирчикский район',
    'Янгиюльский район',
    'Юкарычирчикский район',
    'Зангиатинский район',
    'Zangiota tuman ixtisoslashtirilgan maktabi',
    'Zangiota Tuman Prokuraturasi',
  ]) {
    assert.equal(byName(tashkent.districts, name), undefined, name);
  }
});

test('reviewed Tashkent local-area POI noise stays out of local areas', () => {
  const tashkent = dictionaryFor('UZ', 'Tashkent');
  for (const name of [
    '1-Massiv',
    'Coffee Massiv',
    'Massiv billiard club',
    'Massiv market',
    'Massiv Somsa',
    'Музей железнодорожной техники',
    'Sergeli massiv olti',
    '«Ташкент» Международный аэропорт',
    '"VEOLIA ENERGY TASHKENT" ИП ООО ФИЛИАЛ №3/2 МИРЗО-УЛУГБЕКСКОГО РАЙОНА',
    'Yagona darcha',
    'Yunusobod tuman prokuraturasi',
  ]) {
    assert.equal(byName(tashkent.localAreas, name), undefined, name);
  }

  const bareCity = matchDictionaryLocation('Ташкент', 'UZ', 'Tashkent');
  assert.notEqual(bareCity?.name, 'Toshkent mahallasi');
});
