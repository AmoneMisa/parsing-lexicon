import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const aliases = Object.freeze([
  ['Qızılqum', 'Qizil qum'],
  ['Isbilermenler aymaǵı', 'Isbilermenler aymagi'],
  ['Dárbent', 'Darbent'],
  ['Abat mákan', 'Abat makan'],
  ['Jolshılar', 'Jolshilar'],
  ['Qutlı qonıs', 'Qutli qonis'],
  ['Aydın jol', 'Aydin jol'],
  ['Qum awıl', 'Qum awil'],
  ['Qutlı mákan', 'Qutli makan'],
  ['Shımbay shayxana', 'Shimbay shayxana'],
  ['Shayırlar awılı', 'Shayirlar awili'],
  ['Tunǵısh qonıs', 'Tungish qonis'],
  ['Qurılısshı', 'Qurilisshi'],
  ['Órnek', 'Ornek'],
  ['Jańa zaman', 'Jana zaman'],
  ['Baqshılıq', 'Baqshiliq'],
  ['Tınıshlıq', 'Tinishliq'],
  ['Xalıqlar doslıǵı', 'Xaliqlar dosligi'],
  ['Boz awıl', 'Boz awil'],
  ['Jas áwlad', 'Jas awlad'],
  ['Aq jaǵıs', 'Aq jagis'],
  ['Telecentr', 'Tele oray'],
  ['Shadlı', 'Shadli awil'],
  ['Qumbız awıl', 'Qumbiz awil'],
]);

test('Nukus Karakalpak spellings resolve to canonical mahallas', () => {
  for (const [input, canonical] of aliases) {
    const match = matchDictionaryLocation(input, 'UZ', 'Nukus');
    assert.ok(match, input);
    assert.equal(match.type, 'mahallas', input);
    assert.equal(match.name, canonical, input);
  }
});

test('Nukus mahallas have a single semantic owner', () => {
  const nukus = LOCATION_DICTIONARIES.UZ.Nukus;
  assert.equal(nukus.mahallas.some(({ name }) => name === 'Dosliq'), true);
  assert.equal(nukus.localAreas.some(({ name }) => name === 'Dosliq'), false);
  assert.equal(nukus.mahallas.some(({ name }) => name === 'Samanbay'), true);
  assert.equal(nukus.localAreas.some(({ name }) => name === 'Samanbay'), false);
});
