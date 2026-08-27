import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingSafetySignals, seeksSingleFemaleTenant } from '../src/housing-safety.js';

test('detects a demand for exactly one female tenant', () => {
  for (const text of [
    'Подселение, нужна одна девушка, 100$',
    'Ищу одну девушку в комнату',
    'Только 1 девушка, койко-место',
    'Підселення, потрібна одна дівчина',
    'Xonaga faqat 1 ta qiz kerak',
    'Bitta ayol ijarachi kerak',
    'Хонага фақат 1 та қиз керак',
  ]) {
    assert.equal(seeksSingleFemaleTenant(text), true, text);
  }
});

test('ordinary women-only preferences are not a single-tenant demand', () => {
  for (const text of [
    'Сдается квартира, только для девушек',
    'Квартира для семьи или девушек',
    'Women only, 2 rooms, long term rent',
    'Qizlar uchun kvartira ijaraga beriladi',
    'Сдам комнату двум девушкам',
  ]) {
    assert.equal(seeksSingleFemaleTenant(text), false, text);
  }
});

test('the demand and the person must share a clause', () => {
  assert.equal(
    seeksSingleFemaleTenant('Ищу жильё. Одна девушка уже живёт в квартире'),
    false,
  );
});

test('signals combine room-share detection with the single-tenant demand', () => {
  const risky = parseHousingSafetySignals('Подселение в комнату, нужна одна девушка');
  assert.deepEqual(risky, { roomOnly: true, singleFemaleTenantSought: true });

  const wholeFlat = parseHousingSafetySignals('Сдам квартиру целиком, нужна одна девушка');
  assert.equal(wholeFlat.roomOnly, false);
  assert.equal(wholeFlat.singleFemaleTenantSought, true);

  const ordinary = parseHousingSafetySignals('Койко-место в общежитии');
  assert.equal(ordinary.roomOnly, true);
  assert.equal(ordinary.singleFemaleTenantSought, false);
});

test('empty input is safe and frozen', () => {
  const signals = parseHousingSafetySignals('');
  assert.deepEqual(signals, { roomOnly: false, singleFemaleTenantSought: false });
  assert.ok(Object.isFrozen(signals));
  assert.equal(seeksSingleFemaleTenant(null), false);
  assert.equal(seeksSingleFemaleTenant(undefined), false);
});
