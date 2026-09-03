import { TASHKENT_AREAS } from './geo.js';
import { aliasesToRegex } from './normalization.js';

function legacyAreaEntry(district, canonical) {
  const source = (TASHKENT_AREAS[district] || []).find((item) => item.name === canonical);
  if (!source) throw new Error(`Missing canonical Tashkent area: ${district}/${canonical}`);

  const aliases = Object.freeze([...new Set([
    source.name,
    ...(source.aliases || []),
  ].filter(Boolean))]);

  return Object.freeze({
    canonical: source.name,
    name: source.name,
    type: source.type || 'local_area',
    entityType: source.type || 'local_area',
    country: 'UZ',
    city: 'Tashkent',
    district,
    parent: district,
    aliases,
    re: aliasesToRegex(aliases),
  });
}

// C-1 / Ц-1 is a very common Tashkent housing reference. The historical
// TASHKENT_AREAS catalog already owns its canonical identity (`Buyuk Ipak Yuli`),
// so expose that same entity to the runtime location matcher instead of creating
// a second C-1 canonical or consumer-local regex.
const C1 = legacyAreaEntry('Mirzo Ulugbek', 'Buyuk Ipak Yuli');

export const UZ_TASHKENT_CONTEXT_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    localAreas: Object.freeze([C1]),
  }),
});
