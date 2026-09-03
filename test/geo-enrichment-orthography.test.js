import test from 'node:test';
import assert from 'node:assert/strict';

import { matchCentralAsiaLocationEntities } from '../src/index.js';

const names = (result, type) => result.matches
  .filter((item) => item.type === type)
  .map((item) => item.name);

test('Aktau accepts Kazakh numbered microdistrict wording', () => {
  const result = matchCentralAsiaLocationEntities('3 шағын аудан, Ақтау', 'KZ', 'Aktau');
  assert.equal(result.city, 'Aktau');
  assert.ok(names(result, 'microdistrict').includes('3 microdistrict'));
});

test('Aktau Mall resolves through the TRK Aktau lexical owner', () => {
  const result = matchCentralAsiaLocationEntities('Aktau Mall, Актау', 'KZ', 'Aktau');
  assert.equal(result.city, 'Aktau');
  assert.ok(names(result, 'poi').includes('TRK Aktau'));
  assert.ok(!names(result, 'poi').includes('Aktau Mall'));
});

test('Karakalpak Latin source spelling matches Nukus ASCII canonicals', () => {
  const altin = matchCentralAsiaLocationEntities('Altın jaǵıs, Nókis', 'UZ', 'Nukus');
  assert.equal(altin.city, 'Nukus');
  assert.ok(names(altin, 'mahalla').includes('Altin jagis'));

  const qizketken = matchCentralAsiaLocationEntities('Qızketken, Nókis', 'UZ', 'Nukus');
  assert.equal(qizketken.city, 'Nukus');
  assert.ok(names(qizketken, 'local_area').includes('Qizketken'));
});
