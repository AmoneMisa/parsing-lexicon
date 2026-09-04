import { locationEntries } from './location-merge.js';

export const KZ_CITY_RESIDENTIAL_EXTENSIONS = Object.freeze({
  Almaty: Object.freeze({
    residentialComplexes: locationEntries([
      ['Terracotta', 'ЖК Terracotta', 'Жилой комплекс Terracotta'],
    ]),
  }),
  Karaganda: Object.freeze({
    residentialComplexes: locationEntries([
      ['Трилистник', 'ЖК Трилистник', 'Жилой комплекс Трилистник'],
    ]),
  }),
  Shymkent: Object.freeze({
    residentialComplexes: locationEntries([
      ['Кок-Жайлау', 'Кок жайлау', 'ЖК Кок-Жайлау', 'ЖК Кок жайлау', 'Жилой комплекс Кок жайлау'],
      ['Биик', 'БИИК', 'Biik', 'ЖК Биик', 'ЖК БИИК', 'жилой комплекс Биик'],
    ]),
  }),
  Taraz: Object.freeze({
    residentialComplexes: locationEntries([
      ['Атшабар', 'Atshabar', 'ЖК Атшабар', 'жилой комплекс Атшабар'],
    ]),
  }),
});
