import { aliasesToRegex } from './normalization.js';

function residential(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  let re = null;
  return Object.freeze({
    canonical: name,
    name,
    type: 'residential_complex',
    entityType: 'residential_complex',
    country: 'UA',
    aliases: all,
    get re() {
      re ||= aliasesToRegex(all);
      return re;
    },
  });
}

export const UA_CHERNIHIV_RESIDENTIAL_EXTENSIONS = Object.freeze({
  Chernihiv: Object.freeze({
    residentialComplexes: Object.freeze([
      residential('Masany', [
        'ЖК Масани',
        'ЖК «Масани»',
        'житловий комплекс Масани',
        'жилой комплекс Масани',
        'Masany residential complex',
      ]),
    ]),
  }),
});
