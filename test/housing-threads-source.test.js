import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cleanHousingSourceText,
  detectHousingSource,
  parseHousingSourcePost,
} from '../src/housing-source-aliases.js';

const THREADS_POST = `nika_imgrund
3d
А вы бы сняли квартиру напротив Ташкент Сити Бульвара, в 3-х минутах от метро Дружба Народов за 1200$?
Сдаю квартиру в аренду — собственник, без риелтора ❗
2-х комнатная квартира, 2/9 этаж
Общая площадь 51,7 кв.м, жилая 32,12 кв.м
После капитального ремонта, ранее никто не жил
Внутри абсолютно ВСЁ новое
Новая бытовая техника, сантехника, встроенная мебель
Кондиционер, посудомойка, телевизор 65 дюймов
Новая кровать и матрас Аскона
ТОЛЬКО долгосрочная аренда
Все подробности — в лс
Translate`;

test('detects a copied Threads housing post from its wrapper shape', () => {
  assert.equal(detectHousingSource(THREADS_POST), 'threads');
});

test('uses the first Threads line as contact and removes source UI garbage', () => {
  const parsed = parseHousingSourcePost(THREADS_POST);
  assert.equal(parsed.source, 'threads');
  assert.equal(parsed.contact, 'nika_imgrund');
  assert.match(parsed.text, /^А вы бы сняли квартиру/);
  assert.doesNotMatch(parsed.text, /nika_imgrund|^3d$|Translate/m);
  assert.match(parsed.text, /ТОЛЬКО долгосрочная аренда/);
});

test('cleans explicit Threads markers without changing meaningful description lines', () => {
  const copied = `threads\n@nika_imgrund\n3d\nСдаю квартиру.\nTranslate`;
  assert.equal(detectHousingSource(copied), 'threads');
  assert.equal(cleanHousingSourceText(copied), 'Сдаю квартиру.');
});

test('does not classify ordinary listing text as Threads', () => {
  const text = 'Сдаю квартиру\n2/9 этаж\nВсе подробности в лс';
  assert.equal(detectHousingSource(text), null);
  assert.equal(cleanHousingSourceText(text), text);
});
