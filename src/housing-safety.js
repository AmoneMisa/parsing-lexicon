import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';
import { isRoomOnlyHousing } from './housing-source-aliases.js';

// Clause-scoped gap: the demand and the person must sit in the same sentence.
// Crossing `.`/`!`/`?`/newline let "Ищу жильё. Одна девушка уже живёт" read as a
// demand for one woman, which it is not.
const CLAUSE = String.raw`[^\r\n.!?]`;

// "не" can attach to either side of the demand — "не нужна одна девушка" and
// "одна девушка не нужна" both negate it — so both the count word and the
// verb carry their own guard. Scoped tightly to right before each token
// rather than a whole-text negation scan, so an unrelated "не" elsewhere in
// the clause (e.g. "девушку, не курящую" — a non-smoking woman) does not
// suppress a real demand.
const NOT_NEGATED_RU = String.raw`(?<!не\s{0,3})`;

// `\b` is ASCII-only in JS even under the `u` flag — it never fires around
// Cyrillic text, so a lookahead built on `\b` after "эмас" silently never
// matches and the guard becomes a no-op. Use the same explicit
// letter/digit/underscore boundary the rest of the lexicon relies on.
const WORD_END = String.raw`(?=$|[^\p{L}\p{N}_])`;
const NOT_NEGATED_UZ = String.raw`(?!\s*emas${WORD_END})`;
const NOT_NEGATED_UZ_CYRL = String.raw`(?!\s*эмас${WORD_END})`;

const NOT_NEGATED_RO = String.raw`(?<!nu\s{0,3})`;
const NOT_NEGATED_KK = String.raw`(?!\s*емес${WORD_END})`;

// Romanian places the "single" adjective on either side of the noun — "o
// singură fată" and "o fată singură" are both natural — so the count phrase
// covers both orders rather than picking one.
const RO_FEMALE_NOUN = String.raw`(?:fat[aă]\p{L}*|fete\p{L}*|femei\p{L}*)`;
const RO_COUNT_NOUN = String.raw`(?:o\s+singur[aă]\s+${RO_FEMALE_NOUN}|o\s+${RO_FEMALE_NOUN}\s+singur[aă]|1\s+${RO_FEMALE_NOUN})`;

// A point guard right before the verb only blocks *that* instance of the verb
// from matching — it does not stop the engine from skipping past a negated
// "не нужна" to a second, unnegated verb word later in the same gap (e.g.
// "не нужна, ищем" would otherwise still complete via "ищем"). Building the
// gap out of "not the start of a standalone negation word" repeated
// character-by-character keeps any negation out of the whole span, not just
// its own position. `emas`/`эмас`/`емес` trail their verb rather than lead
// it ("kerak emas"), so those languages' gaps guard the same way as their
// point guard — excluding the negation word wherever it falls in the gap.
const gapExcluding = (word, max) => `(?:(?!${word}${WORD_END})${CLAUSE}){0,${max}}`;
const GAP_NO_NEGATION_RU = (max) => gapExcluding('не', max);
const GAP_NO_NEGATION_RO = (max) => gapExcluding('nu', max);
const GAP_NO_NEGATION_UZ = (max) => gapExcluding('emas', max);
const GAP_NO_NEGATION_UZ_CYRL = (max) => gapExcluding('эмас', max);
const GAP_NO_NEGATION_KK = (max) => gapExcluding('емес', max);

/**
 * Wording that seeks exactly one female tenant, as opposed to the generic
 * "women only" audience wording that ordinary women-only listings use.
 * The count matters: a landlord addressing one specific woman is the signal,
 * not a flat that happens to prefer female tenants.
 */
const SINGLE_FEMALE_TENANT_PATTERNS = Object.freeze([
  // ru: "только одна девушка", "нужна 1 девушка", "ищу одну женщину", "подселю одну девушку"
  new RegExp(
    NOT_NEGATED_RU
    + String.raw`(?:только|лише|нужн\p{L}*|потрібн\p{L}*|ищ[еуy]\p{L}*|шука\p{L}*|подсел\p{L}*|підсел\p{L}*)`
    + GAP_NO_NEGATION_RU(24)
    + NOT_NEGATED_RU
    + String.raw`[^\p{L}\p{N}_](?:одн(?:а|ої|ой|у|ту)|1)\s+(?:девушк\p{L}*|дівчин\p{L}*|женщин\p{L}*|жінк\p{L}*)`,
    'iu',
  ),
  // uk/ru reversed order: "одна девушка нужна"
  new RegExp(
    NOT_NEGATED_RU
    + String.raw`(?:^|[^\p{L}\p{N}_])(?:одн(?:а|ої|ой|у)|1)\s+(?:девушк\p{L}*|дівчин\p{L}*|женщин\p{L}*|жінк\p{L}*)`
    + GAP_NO_NEGATION_RU(18)
    + NOT_NEGATED_RU
    + String.raw`(?:нужн\p{L}*|потрібн\p{L}*|треба|ищ[еуy]\p{L}*|шука\p{L}*)`,
    'iu',
  ),
  // ro: "doar o singură fată", "am nevoie de 1 fată", "caut o fată singură"
  new RegExp(
    NOT_NEGATED_RO
    + String.raw`(?:doar|caut\p{L}*|căut\p{L}*|trebuie|nevoie\p{L}*)`
    + GAP_NO_NEGATION_RO(24)
    + NOT_NEGATED_RO
    + `[^\\p{L}\\p{N}_]${RO_COUNT_NOUN}`,
    'iu',
  ),
  // ro reversed order: "o singură fată e nevoie"
  new RegExp(
    NOT_NEGATED_RO
    + `(?:^|[^\\p{L}\\p{N}_])${RO_COUNT_NOUN}`
    + GAP_NO_NEGATION_RO(18)
    + NOT_NEGATED_RO
    + String.raw`(?:doar|trebuie|nevoie\p{L}*|caut[aă]\p{L}*)`,
    'iu',
  ),
  // uzLatn: "faqat 1 ta qiz kerak", "bitta ayol ijarachi kerak"
  new RegExp(
    String.raw`(?:faqat\s+)?(?:^|[^\p{L}\p{N}_])(?:1|bitta)\s*(?:ta\s*)?(?:qiz|ayol)`
    + GAP_NO_NEGATION_UZ(18)
    + String.raw`(?:ijarachi\s*)?(?:kerak|kere|kerakli)`
    + NOT_NEGATED_UZ,
    'iu',
  ),
  // uzCyrl: "фақат 1 та қиз керак"
  new RegExp(
    String.raw`(?:фақат\s+)?(?:^|[^\p{L}\p{N}_])(?:1|битта)\s*(?:та\s*)?(?:қиз|аёл)`
    + GAP_NO_NEGATION_UZ_CYRL(18)
    + String.raw`(?:ижарачи\s*)?(?:керак|керакли)`
    + NOT_NEGATED_UZ_CYRL,
    'iu',
  ),
  // kk: "тек бір қыз керек", "бір қызға орын керек" — Kazakh is verb-final,
  // so unlike the Slavic/Romance pairs above only this one order is natural.
  new RegExp(
    String.raw`(?:тек\s+)?(?:^|[^\p{L}\p{N}_])(?:бір|1)\s+(?:қыз|әйел)\p{L}*`
    + GAP_NO_NEGATION_KK(18)
    + String.raw`(?:керек|қажет|ізде)\p{L}*`
    + NOT_NEGATED_KK,
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
