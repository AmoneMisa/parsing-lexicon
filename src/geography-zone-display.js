import { geographyDisplayName } from './geography-display.js';
import { dictionaryFor } from './locations.js';
import { findCanonical } from './normalization.js';
import { canonicalCountryCode } from './countries.js';

const ZONE_KINDS = Object.freeze([
  ['district', ['districts']],
  ['microdistrict', ['microdistricts']],
  ['mahalla', ['mahallas']],
  ['local_area', ['localAreas']],
  ['development_area', ['developmentAreas']],
  ['residential_complex', ['residentialComplexes']],
  ['settlement', ['settlements']],
  ['suburb', ['suburbs']],
  ['metro', ['metro']],
]);

const COMPACT_ZONE_SUFFIX_RE = /\s+(?:массив|массиви|микрорайон|мкр|квартал|махалла|махалласи|даха|дахаси|даҳаси|мавзе|мавзеси|massiv|massivi|daha|dahasi|mahalla|mahallasi|mavze|mavzesi)$/iu;

function compactBase(label) {
  const compact = String(label || '').replace(COMPACT_ZONE_SUFFIX_RE, '').trim();
  return compact || String(label || '').trim();
}

function dictionaryForContext(context) {
  const country = canonicalCountryCode(context?.country);
  const city = String(context?.city || '').trim();
  if (!country || !city) return null;
  return dictionaryFor(country, city);
}

function localizedEntryLabel(entry, locale, kind, context, compact = false) {
  if (!entry) return null;
  const canonical = entry.canonical || entry.name;
  if (!canonical) return null;
  const label = geographyDisplayName(canonical, locale, kind, context);
  return compact ? compactBase(label) : label;
}

function resolveDictionaryZone(raw, locale, context, compact = false) {
  const dictionary = dictionaryForContext(context);
  if (!dictionary) return null;

  for (const [kind, keys] of ZONE_KINDS) {
    for (const key of keys) {
      const entries = dictionary[key] || [];
      const entry = findCanonical(raw, entries, { transliteration: true });
      if (!entry) continue;
      return localizedEntryLabel(entry, locale, kind, context, compact);
    }
  }
  return null;
}

function directZoneLabel(raw, locale, context) {
  for (const [kind] of ZONE_KINDS) {
    const translated = geographyDisplayName(raw, locale, kind, context);
    if (translated && translated !== raw) return translated;
  }
  const dictionary = resolveDictionaryZone(raw, locale, context);
  return dictionary && dictionary !== raw ? dictionary : null;
}

function compositeBaseLabel(rawBase, locale, context) {
  const direct = directZoneLabel(rawBase, locale, context);
  if (direct) return compactBase(direct);

  const probes = [
    rawBase,
    `${rawBase} massiv`,
    `${rawBase} massivi`,
    `${rawBase} массив`,
    `${rawBase} массиви`,
    `${rawBase} daha`,
    `${rawBase} dahasi`,
    `${rawBase} даха`,
    `${rawBase} дахаси`,
    `${rawBase} даҳаси`,
    `${rawBase} mahalla`,
    `${rawBase} mahallasi`,
    `${rawBase} махалла`,
    `${rawBase} махалласи`,
  ];

  for (const probe of probes) {
    const label = resolveDictionaryZone(probe, locale, context, true);
    if (label) return label;
  }
  return null;
}

/**
 * Resolve a visible label for a canonical or source-provided housing/map zone.
 *
 * This API intentionally owns multilingual alias/script/transliteration rules so
 * UI consumers do not need to inspect location dictionaries or understand Uzbek
 * locality suffixes. The returned value is presentation-only; callers should keep
 * the original canonical/filter value for routing and queries.
 */
export function geographyZoneDisplayName(value, locale = 'en', context = null) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const direct = directZoneLabel(raw, locale, context);
  if (direct) return direct;

  const separatorIndex = raw.indexOf('-');
  if (separatorIndex > 0) {
    const base = raw.slice(0, separatorIndex).trim();
    const suffix = raw.slice(separatorIndex);
    const label = compositeBaseLabel(base, locale, context);
    if (label) return `${label}${suffix}`;
  }

  return raw;
}
