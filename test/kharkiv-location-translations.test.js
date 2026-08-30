import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, type, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === type ? result.name : null;
}

test('Kharkiv numbered microdistricts accept Ukrainian and Russian listing forms', () => {
  for (const number of ['455','519','520','521','522','524','531','533','601','602','603','604','605','606','607','608','614','615','616','624','625','626','627','656']) {
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

test('Kharkiv residential aliases cover Ukrainian and Russian listing forms', () => {
  const cases = new Map([
    ['Будинок на Сумській', 'Dim na Sumskii'],
    ['Дім на Сумській', 'Dim na Sumskii'],
    ['Дом на Сумской', 'Dim na Sumskii'],
    ['ЖК Дом на Сумской', 'Dim na Sumskii'],
    ['Мироносицька', 'Myronosytska'],
    ['ЖК Мироносицька', 'Myronosytska'],
    ['Мироносицкая', 'Myronosytska'],
    ['ЖК Мироносицкая', 'Myronosytska'],
    ['Млечний шлях', 'Mlechnyi Shliakh'],
    ['ЖК Млечний шлях', 'Mlechnyi Shliakh'],
    ['Млечный путь', 'Mlechnyi Shliakh'],
    ['ЖК Млечный путь', 'Mlechnyi Shliakh'],
    ['Макіївська', 'Makiivska'],
    ['ЖК Макіївська', 'Makiivska'],
    ['Макеевская', 'Makiivska'],
    ['ЖК на Макеевской', 'Makiivska'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', 'residentialComplexes', alias), canonical);
  }
});

test('Kharkiv landmark aliases cover Ukrainian and Russian listing forms', () => {
  const cases = new Map([
    ['Саржин Яр', 'Sarzhyn Yar'],
    ['Парк Машинобудівників', 'Machine Builders Park'],
    ['Парк Машиностроителей', 'Machine Builders Park'],
    ['Зелений Гай', 'Zelenyi Hai'],
    ['Зелёный Гай', 'Zelenyi Hai'],
    ['Карпівський сад', 'Karpivskyi Garden'],
    ['Карповский сад', 'Karpivskyi Garden'],
    ['Покровський сквер', 'Pokrovskyi Square'],
    ['Покровский сквер', 'Pokrovskyi Square'],
    ['Будинок державної промисловості', 'Derzhprom'],
    ['Дом государственной промышленности', 'Derzhprom'],
    ['Покровський монастир', 'Pokrovskyi Monastery'],
    ['Покровский монастырь', 'Pokrovskyi Monastery'],
    ['Харківський зоопарк', 'Kharkiv Zoo'],
    ['Харьковский зоопарк', 'Kharkiv Zoo'],
    ['ХАІ', 'KhAI'],
    ['ХАИ', 'KhAI'],
    ['Харківський авіаційний інститут', 'KhAI'],
    ['Харьковский авиационный институт', 'KhAI'],
    ['ХПІ', 'KhPI'],
    ['ХПИ', 'KhPI'],
    ['ХНУРЕ', 'KhNURE'],
    ['ХНУРЭ', 'KhNURE'],
    ['ТРЦ Французький бульвар', 'French Boulevard'],
    ['ТРЦ Французский бульвар', 'French Boulevard'],
    ['ринок Барабашово', 'Barabashovo Market'],
    ['рынок Барабашово', 'Barabashovo Market'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', 'landmarks', alias), canonical);
  }
});

test('Kharkiv Derzhprom bare name remains ambiguous while explicit building names resolve the landmark', () => {
  assert.equal(matchDictionaryLocation('Держпром', 'UA', 'Kharkiv'), null);
  assert.equal(matchDictionaryLocation('Госпром', 'UA', 'Kharkiv'), null);
  assert.equal(match('Kharkiv', 'landmarks', 'Будинок державної промисловості'), 'Derzhprom');
  assert.equal(match('Kharkiv', 'landmarks', 'Дом государственной промышленности'), 'Derzhprom');
});

test('Kharkiv-only aliases do not leak into Kyiv', () => {
  assert.equal(match('Kyiv', 'microdistricts', '455-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', '519-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Кулиничі'), null);
  assert.equal(match('Kyiv', 'microdistricts', '524-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Північна Салтівка 3'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Северная Салтовка-5'), null);
  assert.equal(match('Kyiv', 'microdistricts', '624-й мікрорайон'), null);
  assert.equal(match('Kyiv', 'microdistricts', 'Микрорайон 606а'), null);
  assert.equal(match('Kyiv', 'landmarks', 'ХАІ'), null);
  assert.equal(match('Kyiv', 'landmarks', 'ринок Барабашово'), null);
});
