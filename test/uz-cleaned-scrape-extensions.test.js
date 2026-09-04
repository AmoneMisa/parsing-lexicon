import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

const residentials = LOCATION_DICTIONARIES.UZ.Tashkent.residentialComplexes;

function byName(name) {
  return residentials.find((entry) => entry.name === name);
}

test('Tashkent cleaned residential aliases retain Latin, Russian and Uzbek listing forms', () => {
  const ecoDream = byName('Eco Dream');
  assert.ok(ecoDream);
  assert.ok(ecoDream.aliases.includes('ЖК Эко Дрим'));
  assert.ok(ecoDream.aliases.includes('Eco Dream turar joy majmuasi'));

  const bobur = byName('Bobur Residence');
  assert.ok(bobur);
  assert.ok(bobur.aliases.includes('Бобур Резиденс'));
  assert.ok(bobur.aliases.includes('Bobur Residence TJM'));

  const obi = byName('Obi Hayot');
  assert.ok(obi);
  assert.ok(obi.aliases.includes('OBI Hayot'));
  assert.ok(obi.aliases.includes('Оби Хаёт'));

  const zaytunli = byName('Zaytunli');
  assert.ok(zaytunli);
  assert.ok(zaytunli.aliases.includes('Зайтунли'));
  assert.ok(zaytunli.aliases.includes('Zaytunli turar joy majmuasi'));

  const aristocrat = byName('Aristocrat Home');
  assert.ok(aristocrat);
  assert.ok(aristocrat.aliases.includes('Aristocrat Home yashash majmuasi'));
  assert.ok(aristocrat.aliases.includes('Аристократ Хоум'));

  const shoxsaroy = byName('Shoxsaroy Residence');
  assert.ok(shoxsaroy);
  assert.ok(shoxsaroy.aliases.includes('Shohsaroy Residence'));
  assert.ok(shoxsaroy.aliases.includes('Шохсарой Резиденс'));

  const yakkasaroy = byName('Yakkasaroy Palace');
  assert.ok(yakkasaroy);
  assert.ok(yakkasaroy.aliases.includes('Yakkasaray Palace'));
  assert.ok(yakkasaroy.aliases.includes('Яккасарай Палас'));

  const olmos = byName('Olmos Residence');
  assert.ok(olmos);
  assert.ok(olmos.aliases.includes('Олмос Резиденс'));
  assert.ok(olmos.aliases.includes('Olmos Residence TJM'));
});

test('runtime matcher resolves cleaned Tashkent residential translations', () => {
  assert.equal(matchDictionaryLocation('квартира в ЖК Эко Дрим', 'UZ', 'Tashkent')?.name, 'Eco Dream');
  assert.equal(matchDictionaryLocation('Bobur Residence turar joy majmuasi', 'UZ', 'Tashkent')?.name, 'Bobur Residence');
  assert.equal(matchDictionaryLocation('продается квартира в ЖК Минор Ривер', 'UZ', 'Tashkent')?.name, 'Minor River');
  assert.equal(matchDictionaryLocation('uy OBI Hayot TJMda', 'UZ', 'Tashkent')?.name, 'Obi Hayot');
  assert.equal(matchDictionaryLocation('ЖК Аския Сити', 'UZ', 'Tashkent')?.name, 'Askiya City');
  assert.equal(matchDictionaryLocation('квартира в ЖК Вистон', 'UZ', 'Tashkent')?.name, 'Wiston');
  assert.equal(matchDictionaryLocation('ЖК Зайтунли', 'UZ', 'Tashkent')?.name, 'Zaytunli');
  assert.equal(matchDictionaryLocation('Aristocrat Home yashash majmuasi', 'UZ', 'Tashkent')?.name, 'Aristocrat Home');
  assert.equal(matchDictionaryLocation('ЖК Шохсарой Резиденс', 'UZ', 'Tashkent')?.name, 'Shoxsaroy Residence');
  assert.equal(matchDictionaryLocation('ЖК Яккасарай Палас', 'UZ', 'Tashkent')?.name, 'Yakkasaroy Palace');
  assert.equal(matchDictionaryLocation('ЖК Олмос Резиденс', 'UZ', 'Tashkent')?.name, 'Olmos Residence');
});
