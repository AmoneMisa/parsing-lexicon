import { aliasesToRegex } from './normalization.js';

const district = (name, aliases = []) => {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'district',
    entityType: 'district',
    country: 'KG',
    aliases: all,
    re: aliasesToRegex(all),
  });
};

export const KG_LOCATION_EXTENSIONS = Object.freeze({
  Bishkek: Object.freeze({
    districts: Object.freeze([
      district('Pervomaisky', ['Первомайский', 'Первомайский район', 'Биринчи Май', 'Биринчи Май району', 'Birinchi May', 'Birinchi May district']),
      district('Leninsky', ['Ленинский', 'Ленинский район', 'Ленин району', 'Lenin district']),
      district('Oktyabrsky', ['Октябрьский', 'Октябрьский район', 'Октябрь району', 'Oktyabr district']),
      district('Sverdlovsky', ['Свердловский', 'Свердловский район', 'Свердлов району', 'Sverdlov district']),
    ]),
  }),
});
