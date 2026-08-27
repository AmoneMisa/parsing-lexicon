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
    'Caut o singură fată pentru cameră',
    'Doar o fată singură, cameră liberă',
    'O singură fată e nevoie, restul e ocupat',
    'Am nevoie de 1 fată în apartament',
    'Тек бір қыз керек, бөлме бар',
    'Бір қыз керек, қалғаны толған',
    'Бір әйел қажет',
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
    'Caut o fată pentru cameră',
    'Apartament pentru fete, chirie lunară',
    'Қыздарға арналған пәтер',
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

test('a negated demand is not a demand, however the negation is placed', () => {
  for (const text of [
    'Нужна не одна девушка, а можно и парень',
    'Одна девушка не нужна, ищем пару',
    'Подселение, не одна девушка нужна, а двое',
    'Podselitsya bitta qiz kerak emas',
    'Хонага фақат 1 та қиз керак эмас',
    'Nu doar o fată, poate fi și băiat',
    'O singură fată nu mai e nevoie, am găsit',
    'Бір қыз керек емес, ерлер де болады',
    'Бір қыз емес, ерлер керек',
  ]) {
    assert.equal(seeksSingleFemaleTenant(text), false, text);
  }
});

test('an unrelated не does not block a real demand from a different verb', () => {
  // Regression: the verb-negation guard used to only block the negated verb
  // itself, letting the engine skip past "не нужна" to a second, unnegated
  // verb word ("ищем") within the same gap and still report a match.
  assert.equal(seeksSingleFemaleTenant('Нужна одна девушка, подселение'), true);
});

test('the Cyrillic negation word is actually recognised, not just present', () => {
  // Regression: `\b` is ASCII-only in JS even with the `u` flag, so it never
  // fires around Cyrillic letters — a lookahead built on `эмас\b` silently
  // never matched anything, making the guard a permanent no-op. If this ever
  // regresses, both assertions below start failing the same way: the "no
  // suffix" case still matching (correct) and the "emas" case also matching
  // (the bug), so a lookahead that always fails to fire cannot pass both.
  assert.equal(seeksSingleFemaleTenant('Хонага фақат 1 та қиз керак'), true);
  assert.equal(seeksSingleFemaleTenant('Хонага фақат 1 та қиз керак эмас'), false);
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
