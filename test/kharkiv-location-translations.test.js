import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, type, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === type ? result.name : null;
}

test('Kharkiv numbered microdistricts accept Ukrainian and Russian listing forms', () => {
  for (const number of ['520','521','522','524','531','533','601','602','603','604','605','606','607','608','614','615','616','624','625','626','627','656']) {
    assert.equal(match('Kharkiv', 'microdistricts', `${number}-й мікрорайон`), `${number} microdistrict`);
    assert.equal(match('Kharkiv', 'microdistricts', `${number} мікрорайон`), `${number} microdistrict`);
    assert.equal(match('Kharkiv', 'microdistricts', `${number}-й микрорайон`), `${number} microdistrict`);
    assert.equal(match('Kharkiv', 'microdistricts', `${number} микрорайон`), `${number} microdistrict`);
  }
});

test('Kharkiv North Saltivka aliases cover Ukrainian and common Russian spellings', () => {
  assert.equal(match('Kharkiv', 'microdistricts', 'Північна Салтівка'), 'North Saltivka');
  assert.equal(match('Kharkiv', 'microdistricts', 'Северная Салтовка'), 'North Saltivka');

  for (const number of ['1','2','3','4','5']) {
    assert.equal(match('Kharkiv', 'microdistricts', `Північна Салтівка ${number}`), `North Saltivka-${number}`);
    assert.equal(match('Kharkiv', 'microdistricts', `Північна Салтівка-${number}`), `North Saltivka-${number}`);
    assert.equal(match('Kharkiv', 'microdistricts', `Северная Салтовка ${number}`), `North Saltivka-${number}`);
    assert.equal(match('Kharkiv', 'microdistricts', `Северная Салтовка-${number}`), `North Saltivka-${number}`);
  }
});

test('Kharkiv lettered microdistrict aliases cover Latin and Cyrillic forms', () => {
  for (const value of ['535A', '535А', '535а', 'Мікрорайон 535а', 'Микрорайон 535а']) {
    assert.equal(match('Kharkiv', 'microdistricts', value), '535A');
  }
  for (const value of ['606A', '606А', '606а', 'Мікрорайон 606а', 'Микрорайон 606а']) {
    assert.equal(match('Kharkiv', 'microdistricts', value), '606A');
  }
});

test('Kharkiv-only microdistrict aliases do not leak into Kyiv', () => {
  assert.equal(match('Kyiv', 'microdistricts', 'Кулиничі'), null);
  assert.equal(match('Kyiv', 'microdistricts', '524-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Північна Салтівка 3'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Северная Салтовка-5'), null);
  assert.equal(match('Kyiv', 'microdistricts', '624-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Микрорайон 606а'), null);
});
