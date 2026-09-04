import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const names = (city, key) => new Set((dictionaryFor('KZ', city)?.[key] || []).map(({ name }) => name));

test('Astana and Almaty scrape-backed address canonicals are registered', () => {
  const astanaStreets = names('Astana', 'streets');
  for (const name of ['Проспект Аль-Фараби', 'Улица Айтеке Би', 'Улица Оралхан Бокей', 'Улица Туркестан']) {
    assert.ok(astanaStreets.has(name), `Astana should contain ${name}`);
  }

  const almatyMicrodistricts = names('Almaty', 'microdistricts');
  for (const name of ['Samal-1', 'Aksai-3A', 'Koktem-2', 'Zhetysu-1', 'Nur Alatau']) {
    assert.ok(almatyMicrodistricts.has(name), `Almaty should contain ${name}`);
  }
});

test('Astana Kazakh and Latin address forms resolve to one canonical', () => {
  const cases = [
    ['пәтер Әл-Фараби даңғылы бойында', 'streets', 'Проспект Аль-Фараби'],
    ['Әйтеке би көшесі, 12', 'streets', 'Улица Айтеке Би'],
    ['Оралхан Бөкей көшесі', 'streets', 'Улица Оралхан Бокей'],
    ['Turkistan Street', 'streets', 'Улица Туркестан'],
    ['мкр Алатау', 'microdistricts', 'Alatau'],
  ];

  for (const [text, type, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Astana');
    assert.equal(match?.type, type, text);
    assert.equal(match?.name, expected, text);
  }
});

test('Almaty Russian, Kazakh and Latin address forms resolve to one canonical', () => {
  const cases = [
    ['Ақсай-3А шағын ауданы', 'microdistricts', 'Aksai-3A'],
    ['Жетісу-1 шағын ауданы', 'microdistricts', 'Zhetysu-1'],
    ['Көктем-2 шағын ауданы', 'microdistricts', 'Koktem-2'],
    ['Достық даңғылы', 'streets', 'проспект Достык'],
    ['Бөгенбай батыр көшесі', 'streets', 'Улица Богенбай батыра'],
    ['Нұртас Оңдасынов көшесі', 'streets', 'Улица Нуртаса Ондасынова'],
    ['Töle Bi Street', 'streets', 'Улица Толе Би'],
  ];

  for (const [text, type, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Almaty');
    assert.equal(match?.type, type, text);
    assert.equal(match?.name, expected, text);
  }
});
