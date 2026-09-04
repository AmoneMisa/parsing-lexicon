import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';
import { KZ_ASTANA_CLEANED_RESIDENTIAL_EXTENSIONS } from '../src/kz-astana-cleaned-residential-extensions.js';

const names = () => new Set((dictionaryFor('KZ', 'Astana')?.residentialComplexes || []).map(({ name }) => name));

test('remaining cleaned Astana residential batch is complete', () => {
  const imported = KZ_ASTANA_CLEANED_RESIDENTIAL_EXTENSIONS.Astana.residentialComplexes;
  assert.equal(imported.length, 53);

  const astana = names();
  for (const name of [
    'Central Park',
    'Авангард',
    'Богенбай батыр',
    'Бухар Жырау',
    'Времена года Весна',
    'Жагалау-3',
    'Жетису Аксу',
    'Жетіген',
    'Омир Озен',
    'Сapital Park Flowers',
    'Сыганак',
    'Французский квартал',
    'Эмират',
  ]) {
    assert.ok(astana.has(name), `Astana should contain residential complex ${name}`);
  }
});

test('cleaned Astana Kazakh and prefixed forms resolve to the imported canonical', () => {
  const cases = [
    ['ЖК Бөгенбай батыр', 'Богенбай батыр'],
    ['жилой комплекс Бұқар Жырау', 'Бухар Жырау'],
    ['ЖК Жағалау-3', 'Жагалау-3'],
    ['ЖК Жетісу Ақсу', 'Жетису Аксу'],
    ['ЖК Өмір Өзен', 'Омир Озен'],
    ['ЖК Қазақстан', 'Казахстан'],
    ['ЖК Қазына', 'Казына'],
    ['ЖК Қайнар', 'Кайнар'],
    ['ЖК Самұрық', 'Самрук'],
    ['ЖК Сәулет', 'Саулет'],
    ['ЖК Сығанақ', 'Сыганак'],
    ['ЖК Тұлпар', 'Тулпар'],
    ['ЖК Тұмар', 'Тумар'],
    ['ЖК Capital Park Flowers', 'Сapital Park Flowers'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Astana');
    assert.equal(match?.type, 'residentialComplexes', text);
    assert.equal(match?.name, expected, text);
  }
});

test('existing Astana canonical owners are enriched rather than duplicated', () => {
  const cases = [
    ['ЖК Ак Дидар', 'Aq-Didar'],
    ['ЖК Жагалау', 'Jagalau'],
    ['ЖК Инжу Променад', 'Inju Promenade'],
    ['ЖК Лазурный квартал', 'Lazurny Kvartal'],
    ['ЖК Нова Сити', 'Nova City'],
    ['ЖК Триумфальный', 'Triumph'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Astana');
    assert.equal(match?.type, 'residentialComplexes', text);
    assert.equal(match?.name, expected, text);
  }
});
