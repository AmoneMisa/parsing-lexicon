import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(enrichment.rooms, 2);
  assert.equal(enrichment.floor, 10);
  assert.equal(enrichment.totalFloors, 16);
});

test('#8870067: nearby Infinity does not override an explicitly named primary complex', () => {
  const enrichment = parseHousingListingEnrichment(
    'АССАЛОМ СОХИЛ\n2/10/16\nДо Ц1 и ЖК Инфинити 5 мин на машине',
    { country: 'UZ' },
  );

  assert.equal(enrichment.residenceComplex, 'Assalom Sohil');
});
