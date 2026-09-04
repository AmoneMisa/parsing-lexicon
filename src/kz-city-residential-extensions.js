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
});
