import { aliasesToRegex } from './normalization.js';

function residential(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'residential_complex',
    entityType: 'residential_complex',
    country: 'UA',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const residentialEntries = (rows = []) => Object.freeze(rows.map(([name, ...aliases]) => residential(name, aliases)));

/**
 * Multilingual aliases for entities promoted from the cleaned page-scrape
 * pipeline. Keep source/provider wording as aliases while using stable Latin
 * canonicals compatible with the rest of the Ukraine location dictionaries.
 */
export const UA_CLEANED_SCRAPE_EXTENSIONS = Object.freeze({
  Dnipro: Object.freeze({
    residentialComplexes: residentialEntries([
      [
        'Pikhtovyi',
        'Pikhtovy', 'Pikhtovyy',
        'Пихтовый', 'ЖК Пихтовый', 'жилой комплекс Пихтовый',
        'Піхтовий', 'ЖК Піхтовий', 'житловий комплекс Піхтовий',
        'Ялицевий', 'ЖК Ялицевий', 'житловий комплекс Ялицевий',
      ],
      [
        'Dom na Tytova',
        'Dom na Titova',
        'Дом на Титова', 'ЖК Дом на Титова', 'жилой комплекс Дом на Титова',
        'Будинок на Титова', 'ЖК Будинок на Титова', 'житловий комплекс Будинок на Титова',
      ],
      [
        'Atlant',
        'Атлант', 'ЖК Атлант', 'жилой комплекс Атлант', 'житловий комплекс Атлант',
        'Atlant Dnipro', 'ЖК Atlant',
      ],
      [
        'Krasnopolskyi',
        'Krasnopolskiy',
        'Краснопольский', 'ЖК Краснопольский', 'жилой комплекс Краснопольский',
        'Краснопільський', 'ЖК Краснопільський', 'житловий комплекс Краснопільський',
      ],
      [
        'Lighthouse',
        'Lighthouse Dnipro', 'ЖК Lighthouse', 'Lighthouse residential complex',
        'Лайтхаус', 'ЖК Лайтхаус', 'жилой комплекс Лайтхаус', 'житловий комплекс Лайтхаус',
      ],
      [
        'Palermo',
        'Палермо', 'ЖК Палермо', 'жилой комплекс Палермо', 'житловий комплекс Палермо', 'ЖК Palermo',
      ],
      [
        'Salyut',
        'Saliut', 'Салют', 'ЖК Салют', 'жилой комплекс Салют', 'житловий комплекс Салют',
      ],
      [
        'Ptakhy',
        'Птахи', 'ЖК Птахи', 'жилой комплекс Птахи', 'житловий комплекс Птахи', 'ЖК Ptakhy',
      ],
    ]),
  }),
});
