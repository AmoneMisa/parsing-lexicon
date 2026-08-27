import { parseHiringContext as parseBaseHiringContext } from './hiring-context.js';

const EXPLICIT_POSITIVE_VISA_SPONSORSHIP_RE = /\bwe\s+do\s+sponsor\s+visas?\b/i;

/**
 * Compatibility refinements for real-world hiring copy that is intentionally
 * more specific than the generic alias catalog. Keep this wrapper tiny so the
 * base multilingual context parser remains the single source of truth.
 */
export function parseHiringContext(value, options = {}) {
  const text = String(value || '');
  const parsed = parseBaseHiringContext(text, options);
  if (!EXPLICIT_POSITIVE_VISA_SPONSORSHIP_RE.test(text)
    || parsed.workAuthorization.includes('sponsorshipOffered')) {
    return parsed;
  }

  return Object.freeze({
    ...parsed,
    workAuthorization: Object.freeze([...parsed.workAuthorization, 'sponsorshipOffered']),
  });
}
