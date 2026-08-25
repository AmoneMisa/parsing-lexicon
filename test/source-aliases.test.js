import test from 'node:test';
import assert from 'node:assert/strict';

import { parseExtendedLanguageContext } from '../src/hiring-language-extensions.js';
import { isRoomOnlyHousing, resolveExtendedHousingIntent } from '../src/housing-source-aliases.js';

test('candidate language source extensions stay centralized', () => {
  const parsed = parseExtendedLanguageContext(
    'Знание профессионального русского языка и базового таджикского языка. English level: B2.',
    { mode: 'candidate' },
  );

  const russian = parsed.find(({ language }) => language === 'ru');
  const tajik = parsed.find(({ language }) => language === 'tg');
  const english = parsed.find(({ language }) => language === 'en');

  assert.equal(russian?.level, 'professional');
  assert.equal(tajik?.level, 'basic');
  assert.equal(english?.cefr, 'B2');
});

test('housing source aliases normalize deal and room-only wording', () => {
  assert.equal(resolveExtendedHousingIntent('Квартира ижарага берилади')?.dealType, 'longRent');
  assert.equal(resolveExtendedHousingIntent('Kvartira kunlik beriladi')?.dealType, 'shortRent');
  assert.equal(resolveExtendedHousingIntent('Квартира продается')?.dealType, 'sale');
  assert.equal(isRoomOnlyHousing('Student qizlarga xona, opshijit dom'), true);
});
