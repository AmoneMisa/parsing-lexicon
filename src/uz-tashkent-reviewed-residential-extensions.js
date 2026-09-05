import { locationEntries } from './location-merge.js';

/**
 * Lexical owners for the reviewed Tashkent residential OSM batch.
 * Canonical names mirror geo-catalog; aliases only remove generic residential prefixes
 * or harmless quote/case variants without inventing a translated brand name.
 */
export const UZ_TASHKENT_REVIEWED_RESIDENTIAL_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    residentialComplexes: locationEntries([
      ['Жилой комплекс Elegant', 'ЖК Elegant', 'Elegant'],
      ['ЖК "Грин Сити" (Дровосеки)', 'ЖК Грин Сити (Дровосеки)', 'Грин Сити (Дровосеки)', 'Грин Сити'],
      ['жилой комплекс Гульсарай', 'ЖК Гульсарай', 'Гульсарай'],
      ['Хувайдо жилой комплекс', 'ЖК Хувайдо', 'Хувайдо'],
      ['Жилой комплекс LOTUS 7', 'ЖК LOTUS 7', 'LOTUS 7', 'Lotus 7'],
      ['жилой комплекс "Milliy House" от NESS', 'ЖК Milliy House', 'Milliy House', 'Milliy House от NESS'],
      ['ЖК "Ness City"', 'ЖК Ness City', 'Ness City'],
      ['жилой комплекс "Ness One" от Ness', 'ЖК Ness One', 'Ness One', 'Ness One от Ness'],
      ['ЖК "Ness Sebzar"', 'ЖК Ness Sebzar', 'Ness Sebzar'],
      ["Жилой комплекс 'Оазис'", 'Жилой комплекс Оазис', 'ЖК Оазис', 'Оазис'],
      ['Переспектива жилой комплекс', 'ЖК Переспектива', 'Переспектива'],
      ['Sultania ЖК', 'ЖК Sultania', 'Sultania'],
      ['ЖК Учтепа Авению', 'Учтепа Авению'],
      ['ЖК Янгибахт', 'Янгибахт'],
      ['Жилой комплекс “Замок счастья”', 'Жилой комплекс Замок счастья', 'ЖК Замок счастья', 'Замок счастья'],
    ]),
  }),
});
