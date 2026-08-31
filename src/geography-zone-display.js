import { geographyDisplayName } from './geography-display.js';
import { dictionaryFor } from './locations.js';
import { aliasesOf, findCanonical } from './normalization.js';
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

const CYRILLIC_RE = /\p{Script=Cyrillic}/u;
const NON_RUSSIAN_CYRILLIC_RE = /[ІіЇїЄєҐґЎўҚқҒғҲҳӘәӨөҰұҮүҢң]/u;
const UZBEK_LOCALITY_SUFFIX_RE = /\b(?:массиви|махалласи|даҳаси|дахаси|мавзеси)\b/iu;
const COMPACT_ZONE_SUFFIX_RE = /\s+(?:массив|массиви|микрорайон|мкр|квартал|махалла|махалласи|даха|дахаси|даҳаси|мавзе|мавзеси|massiv|massivi|daha|dahasi|mahalla|mahallasi|mavze|mavzesi)$/iu;

function compactBase(label) {
  const compact = String(label || '').replace(COMPACT_ZONE_SUFFIX_RE, '').trim();
  return compact || String(label || '').trim();
}

function languageKey(locale) {
  const key = String(locale || 'en').toLowerCase().split(/[-_]/)[0];
  return key === 'ru' || key === 'uz' ? key : 'en';
}

function dictionaryForContext(context) {
  const country = canonicalCountryCode(context?.country);
  const city = String(context?.city || '').trim();
  if (!country || !city) return null;
  return dictionaryFor(country, city);
}

function preferredFallbackAlias(entry, locale) {
  const language = languageKey(locale);
  const canonical = entry?.canonical || entry?.name || null;
  if (!entry || !canonical || language === 'en') return canonical;

  const aliases = aliasesOf(entry).map((value) => String(value || '').trim()).filter(Boolean);
  if (language === 'ru') {
    const candidates = aliases
      .filter((alias) => CYRILLIC_RE.test(alias) && !NON_RUSSIAN_CYRILLIC_RE.test(alias))
      .sort((a, b) => {
        const suffixPenalty = Number(UZBEK_LOCALITY_SUFFIX_RE.test(a)) - Number(UZBEK_LOCALITY_SUFFIX_RE.test(b));
        if (suffixPenalty) return suffixPenalty;
        return compactBase(a).length - compactBase(b).length || a.length - b.length;
      });
    return candidates[0] || canonical;
  }

  return entry.labels?.uz || canonical;
}

function localizedEntryLabel(entry, locale, kind, compact = false) {
  if (!entry) return null;
  const canonical = entry.canonical || entry.name;
  if (!canonical) return null;

  // Prefer stable presentation tables when they already know this canonical.
  // Passing no city context avoids a source-language alias from overriding an
  // established Russian display name such as Chilanzar -> Чиланзар.
  const established = geographyDisplayName(canonical, locale, kind, null);
  const label = established !== canonical
    ? established
    : preferredFallbackAlias(entry, locale);
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
      return localizedEntryLabel(entry, locale, kind, compact);
    }
  }
  return null;
}

function directZoneLabel(raw, locale, context) {
  const dictionary = dictionaryForContext(context);
  if (dictionary) {
    // With an explicit city scope, never fall through to global display tables:
    // the same canonical-looking token may belong to another city.
    const scoped = resolveDictionaryZone(raw, locale, context, true);
    return scoped && scoped !== raw ? scoped : null;
  }

  // Context-free callers may still use globally unambiguous presentation names.
  for (const [kind] of ZONE_KINDS) {
    const translated = geographyDisplayName(raw, locale, kind, null);
    if (translated && translated !== raw) return compactBase(translated);
  }
  return null;
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
