import { matchProfession, professionByCanonical } from './hiring-professions.js';

const PROFESSION_ACRONYMS = Object.freeze(new Map([
  ['ai', 'AI'],
  ['api', 'API'],
  ['bi', 'BI'],
  ['crm', 'CRM'],
  ['dba', 'DBA'],
  ['erp', 'ERP'],
  ['grc', 'GRC'],
  ['hr', 'HR'],
  ['ios', 'iOS'],
  ['ml', 'ML'],
  ['pmo', 'PMO'],
  ['qa', 'QA'],
  ['seo', 'SEO'],
  ['sre', 'SRE'],
  ['ui', 'UI'],
  ['ux', 'UX'],
]));

function titleCaseCanonical(canonical) {
  return String(canonical || '')
    .split('_')
    .filter(Boolean)
    .map((part) => PROFESSION_ACRONYMS.get(part) || `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

/**
 * Return one deterministic display label for a profession owned by this package.
 *
 * This is intentionally not a search transliteration API. Search folding and
 * alias matching remain separate concerns. Unknown values are returned trimmed
 * instead of being locally transliterated or guessed by consumers.
 */
export function professionDisplayName(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const exact = professionByCanonical(raw);
  if (exact) return titleCaseCanonical(exact.canonical);

  const match = matchProfession(raw, { allowWeak: false });
  return match ? titleCaseCanonical(match.canonical) : raw;
}

export function professionCanonicalDisplayName(canonical) {
  const entry = professionByCanonical(String(canonical ?? '').trim());
  return entry ? titleCaseCanonical(entry.canonical) : '';
}
