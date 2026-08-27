import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';
import { isRoomOnlyHousing } from './housing-source-aliases.js';

// Clause-scoped gap: the demand and the person must sit in the same sentence.
// Crossing `.`/`!`/`?`/newline let "Ищу жильё. Одна девушка уже живёт" read as a
// demand for one woman, which it is not.
const CLAUSE = String.raw`[^\r\n.!?]`;

/**
 * Wording that seeks exactly one female tenant, as opposed to the generic
 * "women only" audience wording that ordinary women-only listings use.
 * The count matters: a landlord addressing one specific woman is the signal,
 * not a flat that happens to prefer female tenants.
 */
const SINGLE_FEMALE_TENANT_PATTERNS = Object.freeze([
  // ru: "только одна девушка", "нужна 1 девушка", "ищу одну женщину", "подселю одну девушку"
  new RegExp(
    String.raw`(?:только|лише|нужн\p{L}*|потрібн\p{L}*|ищ[еуy]\p{L}*|шука\p{L}*|подсел\p{L}*|підсел\p{L}*)`
    + CLAUSE + `{0,24}`
    + String.raw`(?:^|[^\p{L}\p{N}_])(?:одн(?:а|ої|ой|у|ту)|1)\s+(?:девушк\p{L}*|дівчин\p{L}*|женщин\p{L}*|жінк\p{L}*)`,
    'iu',
  ),
  // uk/ru reversed order: "одна девушка нужна"
  new RegExp(
    String.raw`(?:^|[^\p{L}\p{N}_])(?:одн(?:а|ої|ой|у)|1)\s+(?:девушк\p{L}*|дівчин\p{L}*|женщин\p{L}*|жінк\p{L}*)`
    + CLAUSE + `{0,18}`
    + String.raw`(?:нужн\p{L}*|потрібн\p{L}*|треба|ищ[еуy]\p{L}*|шука\p{L}*)`,
    'iu',
  ),
  // uzLatn: "faqat 1 ta qiz kerak", "bitta ayol ijarachi kerak"
  new RegExp(
    String.raw`(?:faqat\s+)?(?:^|[^\p{L}\p{N}_])(?:1|bitta)\s*(?:ta\s*)?(?:qiz|ayol)`
    + CLAUSE + `{0,18}`
    + String.raw`(?:ijarachi\s*)?(?:kerak|kere|kerakli)`,
    'iu',
  ),
  // uzCyrl: "фақат 1 та қиз керак"
  new RegExp(
    String.raw`(?:фақат\s+)?(?:^|[^\p{L}\p{N}_])(?:1|битта)\s*(?:та\s*)?(?:қиз|аёл)`
    + CLAUSE + `{0,18}`
    + String.raw`(?:ижарачи\s*)?(?:керак|керакли)`,
    'iu',
  ),
]);

/**
 * True when the text asks for exactly one female tenant.
 *
 * Deliberately narrower than the `women` audience: "только для девушек" is an
 * ordinary preference and must not match, while "нужна одна девушка" does.
 */
export function seeksSingleFemaleTenant(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text.trim()) return false;
  return SINGLE_FEMALE_TENANT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Linguistic safety signals for a housing listing.
 *
 * This reports only what the wording says. Whether a given combination is
 * treated as a risk — and any price policy applied on top — belongs to the
 * consuming service, not to the lexicon.
 */
export function parseHousingSafetySignals(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text.trim()) {
    return deepFreeze({ roomOnly: false, singleFemaleTenantSought: false });
  }
  return deepFreeze({
    roomOnly: isRoomOnlyHousing(text),
    singleFemaleTenantSought: seeksSingleFemaleTenant(text),
  });
}
