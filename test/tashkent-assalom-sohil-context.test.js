import test from 'node:test';
import assert from 'node:assert/strict';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';
import { parseHousingListingEnrichment } from '../src/housing-listing-enrichment.js';

const LISTING_8870067 = `
Квартира Аренда Мирабад 2/10/16 Евро новая новостройка

Сдается квартира в Новостройке

ГОЛДЕН ХАУС
АССАЛОМ СОХИЛ

2/10/16

Узбум

До Ц1 и ЖК Инфинити 5 мин на машине

Общая площадь 65кв2
По кадастру 58кв2 без балкона

Два лифта
Евроремонт
Все под ключ готово
Есть стиральная и сушильная машинка, гардеробная комната, посудомойка, кондиционер
Раздельная двухкомнатная квартира
Панорамные окна
`;

test('#8870067: Assalom Sohil is the listing complex, not nearby Infinity', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_8870067, { country: 'UZ' });
  assert.equal(enrichment.residenceComplex, 'Assalom Sohil');
});

test('#8870067: Assalom Sohil is primary evidence while Ц1 and ЖК Инфинити stay nearby', () => {
  const result = matchCentralAsiaLocationEntities(LISTING_8870067, 'UZ', 'Tashkent');
  const assalom = result.matches.find((item) => item.name === 'Assalom Sohil');
  const c1 = result.matches.find((item) => item.name === 'Buyuk Ipak Yuli');
  const infinity = result.matches.find((item) => item.name === 'Infinity');

  assert.ok(assalom);
  assert.notEqual(assalom.role, 'nearby');
  assert.ok(c1);
  assert.equal(c1.role, 'nearby');
  assert.ok(infinity);
  assert.equal(infinity.role, 'nearby');
});

test('Central Asia location matches mark coordinated proximity targets as nearby', () => {
  const result = matchCentralAsiaLocationEntities(
    'До Assalom Sohil и Infinity 5 мин на машине',
    'UZ',
    'Tashkent',
  );

  const assalom = result.matches.find((item) => item.name === 'Assalom Sohil');
  const infinity = result.matches.find((item) => item.name === 'Infinity');
  assert.equal(assalom?.role, 'nearby');
  assert.equal(infinity?.role, 'nearby');
});

test('a trailing ЖК alias is also recognized when the type marker comes first', () => {
  const result = matchCentralAsiaLocationEntities('рядом с ЖК Инфинити', 'UZ', 'Tashkent');
  const infinity = result.matches.find((item) => item.name === 'Infinity');

  assert.ok(infinity);
  assert.equal(infinity.role, 'nearby');
});

test('a direct subject marker wins over an unrelated temporal "до" in the same clause', () => {
  const result = matchCentralAsiaLocationEntities(
    'До пятницы сдается квартира в ЖК Assalom Sohil',
    'UZ',
    'Tashkent',
  );

  const assalom = result.matches.find((item) => item.name === 'Assalom Sohil');
  assert.equal(assalom?.role, 'primary');
});
