import test from 'node:test';
import assert from 'node:assert/strict';

import { locationCities } from '../src/locations.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';

const cases = [
  ['Khumoyun mahalla', 'Humoyun', 'Mirzo Ulugbek'],
  ['Боғкўча маҳалласи', "Bog'ko'cha", 'Shaykhantahur'],
  ["Bog'bon MFY", "Bog'bon", 'Yashnobod'],
  ['Шифокорлар маҳалласи', 'Shifokorlar', 'Almazar'],
  ['Чаманбоғ маҳалласи', "Chamanbog'", 'Almazar'],
  ['Asalobod MFY', 'Asalobod', 'Yashnobod'],
];

test('Tashkent mahalla aliases preserve their existing canonical entities', () => {
  const mahallas = new Map(
    (locationCities('UZ').Tashkent?.mahallas || []).map((entry) => [entry.name, entry]),
  );

  for (const [, canonical, parent] of cases) {
    const entry = mahallas.get(canonical);
    assert.ok(entry, canonical);
    assert.equal(entry.parent, parent, canonical);
  }

  assert.ok(mahallas.get('Humoyun').aliases.includes('Khumoyun'));
  assert.ok(mahallas.get("Bog'ko'cha").aliases.includes('Боғкўча маҳалласи'));
  assert.ok(mahallas.get('Shifokorlar').aliases.includes('Шифокорлар маҳалласи'));
  assert.ok(mahallas.get("Chamanbog'").aliases.includes('Чаманбоғ маҳалласи'));
  assert.ok(mahallas.get('Asalobod').aliases.includes('Asalobod MFY'));
});

test('Tashkent mahalla spelling variants resolve with mahalla semantics', () => {
  for (const [text, canonical, parent] of cases) {
    const result = matchCentralAsiaLocationEntities(text, 'UZ', 'Tashkent');
    const match = result.matches.find((entry) => entry.type === 'mahalla' && entry.name === canonical);

    assert.ok(match, `${text} -> ${canonical}`);
    assert.equal(match.parent, parent, canonical);
  }
});