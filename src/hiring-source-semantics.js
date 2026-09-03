import { CANDIDATE_FIELD_TERMS, JOB_FIELD_TERMS } from './hiring.js';
import { aliasesOf, escapeRegex, normalizeUnicode } from './normalization.js';
import { parseSalary } from './money.js';
import { extractCandidateName } from './hiring-candidate-fields.js';
import { countryCurrency } from './country-context.js';

const FIELD_EXTRA_ALIASES = Object.freeze({
  candidate: Object.freeze({
    name: ['xodim', 'hodim', 'nomzod', 'candidate', 'f.i.o.', 'f i sh'],
    profession: ["so'ralgan ish joyi", "so'ralgan ish turi", 'qidirayotgan kasb'],
    skills: ['texnologiya', 'stack'],
    salary: ['narx', 'narxi'],
    address: ['hozirgi manzil', 'yashash joyi'],
    contact: ['murojaat', 'boglanish'],
    employmentType: ['format', 'bandlik', 'ish vaqti'],
  }),
  job: Object.freeze({
    title: ['vacancy', 'position', 'role', 'job', 'вакансия', 'позиция', 'посада', 'loc de muncă', 'loc de munca', 'post', 'angajare'],
    company: ['company', 'employer', 'компания', 'работодатель', 'роботодавець', 'компанія', 'companie', 'angajator', 'tashkilot', 'ish beruvchi'],
    location: ['location', 'city', 'локация', 'локація', 'город', 'місто', 'locație', 'locatie', 'oraș', 'oras', 'manzil', 'shahar'],
  }),
});

const APPLICATION_MODAL_RE = /(?:отправить\s*резюме\s*)+(?:\[telegram\]\s*)?пол\s*мужской\s*женский\s*образование[\s\S]{0,500}?выберите\s*вакансию[\s\S]*/iu;
const LEAKED_STYLESHEET_START_RE = /:root\s*\{\s*--[\w-]+\s*:/iu;
const LEAKED_CSS_RULE_RE = /\s*(?:[.#][\w\\-]+|:root)(?:[^{}\n]{0,300})\{\s*(?:(?:--)?[\w-]+\s*:\s*[^;{}]+;?\s*)+\}\s*/giu;
// Button/chrome labels copied along with a resume from Ukrainian job boards
// (novarobota.ua, robota.ua, work.ua and similar). Matched as whole lines so
// genuine resume prose is never touched.
const JOB_BOARD_UI_NOISE_RE = /^(?:подробнее|детальніше|предпросмотр|попередній\s+перегляд|добавить\s+в\s+отклики\/?\s*избранное|додати\s+до\s+відгуків\/?\s*обраного|предложить\s+вакансию|запропонувати\s+вакансію|для\s+того\s+чтобы\s+предложить\s+вакансию\s+нужно\s+авторизоваться\s+как\s+работодатель|щоб\s+запропонувати\s+вакансію[^\n]*|пожаловаться\s+на\s+резюме|поскаржитися\s+на\s+резюме|отправить)$/iu;

/** Remove source-page controls and stylesheet fragments copied into hiring text. */
export function cleanHiringSourceText(value) {
  const text = String(value || '');
  const stylesheetStart = text.search(LEAKED_STYLESHEET_START_RE);
  return (stylesheetStart >= 0 ? text.slice(0, stylesheetStart) : text)
    .replace(APPLICATION_MODAL_RE, '')
    .replace(LEAKED_CSS_RULE_RE, ' ')
    .split('\n')
    .filter((line) => !JOB_BOARD_UI_NOISE_RE.test(line.trim()))
    .join('\n')
    .replace(/[ \t]+(?=\n)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function entryAliases(entry, extras = []) {
  return [...new Set([entry?.canonical, ...aliasesOf(entry || {}), ...extras].filter(Boolean))];
}

function fieldAliasPattern(value) {
  return escapeRegex(normalizeUnicode(value).trim())
    .replace(/[\s\-–—'’‘`ʻʼ]+/g, "[\\s\\-–—'’‘`ʻʼ]*");
}

function extractField(value, entry, extras = [], maxLength = 220) {
  const text = String(value || '');
  const aliases = entryAliases(entry, extras).sort((a, b) => b.length - a.length);
  if (!text || !aliases.length) return null;
  const label = aliases.map(fieldAliasPattern).join('|');
  const match = text.match(new RegExp(`(?:^|\\n)[^\\p{L}\\p{N}\\n]{0,10}(?:${label})\\s*[:：—-]\\s*([^\\n]{1,${maxLength}})`, 'iu'));
  return match?.[1]?.trim() || null;
}

export function extractCandidateStructuredField(value, key, maxLength = 220) {
  return extractField(value, CANDIDATE_FIELD_TERMS[key], FIELD_EXTRA_ALIASES.candidate[key] || [], maxLength);
}

export function extractJobStructuredField(value, key, maxLength = 220) {
  return extractField(value, JOB_FIELD_TERMS[key], FIELD_EXTRA_ALIASES.job[key] || [], maxLength);
}

const INLINE_VACANCY_HEADING_RE = /✔️?\s*([A-ZА-ЯЁЎҚҒҲІЇЄ][A-ZА-ЯЁЎҚҒҲІЇЄ\s()\/-]{2,100}?)(?=\s*(?:[•⏳✔📍✈📞]|$))/gu;
const SHARED_HIRING_CONTACT_RE = /(?:✈️?\s*Telegram\s*:|📞\s*Контакт\s*:)/iu;

/** Split a multi-vacancy source post into role-local blocks and shared context. */
export function splitHiringVacancyEntries(value) {
  const text = cleanHiringSourceText(value);
  if (!text) return Object.freeze({ prefix: '', suffix: '', entries: Object.freeze([]) });

  const headings = [...text.matchAll(INLINE_VACANCY_HEADING_RE)]
    .map((match) => ({ start: match.index ?? 0, title: match[1].replace(/\s+/g, ' ').trim() }));
  if (headings.length < 2) return Object.freeze({ prefix: text, suffix: '', entries: Object.freeze([]) });

  let suffix = '';
  let contentEnd = text.length;
  const lastStart = headings.at(-1).start;
  const contact = SHARED_HIRING_CONTACT_RE.exec(text.slice(lastStart));
  if (contact?.index != null) {
    contentEnd = lastStart + contact.index;
    suffix = text.slice(contentEnd).trim();
  }

  const entries = headings.map((heading, index) => {
    const end = Math.min(headings[index + 1]?.start ?? contentEnd, contentEnd);
    return Object.freeze({ title: heading.title, text: text.slice(heading.start, end).trim() });
  }).filter(({ text: entryText }) => Boolean(entryText));

  return Object.freeze({
    prefix: text.slice(0, headings[0].start).trim(),
    suffix,
    entries: Object.freeze(entries),
  });
}

export function extractCandidateDisplayName(value) {
  const text = String(value || '');
  const structured = extractCandidateName(text);
  if (structured) return structured;
  const linkedIn = text.match(/(?:резюме|resume)\s*\|\s*(\p{Lu}\p{Ll}+(?:\s+\p{Lu}(?:\p{Ll}+|\.))?)/iu)?.[1]
    || text.match(/(?:^|\n)(\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+)+)\s+-\s+(?:HR|Developer|Engineer|Manager|Designer)\b/iu)?.[1];
  if (linkedIn) return linkedIn.trim().slice(0, 100);
  const introduced = text.match(/(?:^|\n)(?:вітаю,?\s+)?мене\s+звати\s+(\p{Lu}\p{Ll}+)/iu)?.[1];
  if (introduced) return introduced.trim().slice(0, 100);
  const handleName = text.match(/@(\p{Lu}\p{Ll}{2,})(?:_|\p{Lu}|\d)/u)?.[1];
  if (handleName) return handleName.trim().slice(0, 100);
  return text.match(/(?:^|\n)(\p{Lu}\p{Ll}+)\s+\d+\+?\s+(?:рок\p{L}*|лет|years?)\s+(?:у|в|in)\s+(?:HR|IT)\b/iu)?.[1]?.trim().slice(0, 100) || '';
}

const APPROXIMATE_EXPERIENCE_RE = /(?:\b(?:about|around|approximately|approx\.?|circa)\b|(?:примерно|около|приблизно|близько|yaqin|atrofida|qariyb))/iu;

function approximateExperienceSignal(context) {
  return APPROXIMATE_EXPERIENCE_RE.test(context) ? { approximate: true } : {};
}

function validYears(raw) {
  const years = Number(String(raw || '').replace(',', '.'));
  return Number.isFinite(years) && years >= 0 && years <= 60 ? years : null;
}

export function extractCandidateExperienceMentions(value) {
  const text = String(value || '');
  const mentions = [];
  const segments = text.split(/\n|(?<=[.!?])\s+/u).map((segment) => segment.trim()).filter(Boolean);
  for (const segment of segments) {
    const months = segment.match(/(?:опыт(?:\s+работы)?|досвід(?:\s+роботи)?|experience|experiență|staj|tajriba(?:m)?|ish\s+tajribasi)[^\n.!?]{0,100}?(\d{1,2})\s*(?:мес(?:яц\p{L}*)?\.?|міс(?:яц\p{L}*)?\.?|months?|mo\b|oy(?:lik)?)/iu);
    if (months?.[1]) {
      const count = Number(months[1]);
      if (Number.isFinite(count) && count > 0 && count < 24) {
        const from = (months.index || 0) + months[0].length;
        const context = `${months[0]} ${segment.slice(from, from + 100)}`.replace(/\s+/g, ' ').trim();
        mentions.push(Object.freeze({ years: Math.round((count / 12) * 10) / 10, context, ...approximateExperienceSignal(context) }));
      }
      continue;
    }
    const reverse = segment.match(/(\d+(?:[.,]\d+)?)\+?\s*(?:лет|год(?:а|ов)?|рок(?:и|ів)?|years?|ani|an|yil(?:ga|lik)?|йил(?:га|лик)?)[^\n.!?]{0,140}?(?:опыт|досвід|experience|experiență|staj|tajriba(?:m)?)/iu);
    if (reverse?.[1]) {
      const years = validYears(reverse[1]);
      if (years != null) {
        const context = reverse[0].replace(/\s+/g, ' ').trim();
        mentions.push(Object.freeze({ years, context, ...approximateExperienceSignal(context) }));
      }
      continue;
    }
    const direct = segment.match(/(?:опыт(?:\s+работы)?|досвід(?:\s+роботи)?|experience|experiență|staj|tajriba(?:m)?|ish\s+tajribasi)[^\n.!?]{0,100}?(\d+(?:[.,]\d+)?)\+?\s*(?:лет|год(?:а|ов)?|рок(?:и|ів)?|years?|ani|an|yil|йил)?/iu);
    if (!direct?.[1]) continue;
    const years = validYears(direct[1]);
    if (years == null) continue;
    const tailStart = (direct.index || 0) + direct[0].length;
    const context = `${direct[0]} ${segment.slice(tailStart, tailStart + 100)}`.replace(/\s+/g, ' ').trim();
    mentions.push(Object.freeze({ years, context, ...approximateExperienceSignal(context) }));
  }
  return Object.freeze(mentions);
}

const EXTRA_CURRENCIES = Object.freeze([
  ['TJS', /(?:\bTJS\b|сомони)/iu],
  ['TMT', /(?:\bTMT\b|манат\p{L}*)/iu],
]);

function sourceCurrency(text) {
  for (const [code, pattern] of EXTRA_CURRENCIES) if (pattern.test(text)) return code;
  return null;
}

function parseLooseNumber(raw, suffix = '') {
  const scale = /^(?:кк|kk|млн|mln|million)$/iu.test(suffix) ? 1_000_000
    : /^(?:к|k|тыс|тис|ming|thousand)$/iu.test(suffix) ? 1_000
      : 1;
  const value = String(raw || '').replace(/\u00a0/g, ' ').replace(/\s+/g, '').trim();
  if (!value) return null;
  let base;
  if (/^\d{1,3}([.,])\d{3}(?:\1\d{3})*$/.test(value)) base = Number(value.replace(/[.,]/g, ''));
  else if (scale > 1 && /^\d+[.,]\d{1,2}$/.test(value)) base = Number(value.replace(',', '.'));
  else base = Number(value.replace(/[.,]/g, ''));
  const parsed = Math.round(base * scale);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const SOURCE_AMOUNT_RE = /(\d[\d\s.,]*\d|\d)(?:\s*(кк|kk|млн|mln|million|к|k|тыс|тис|ming|thousand))?(?:\s*(?:[-–—…]{1,3}|до|to|dan\s+gacha|gacha)\s*(\d[\d\s.,]*\d|\d)(?:\s*(кк|kk|млн|mln|million|к|k|тыс|тис|ming|thousand))?)?/iu;

export function parseHiringSourceSalary(value) {
  const text = String(value || '').replace(/(?<=\d)\s*(?:кк|kk)(?![\p{L}\p{N}_])/giu, ' mln ');
  const parsed = parseSalary(text);
  if (parsed?.currency && (parsed.min != null || parsed.max != null)) return parsed;
  const currency = sourceCurrency(text);
  if (!currency) return parsed;
  const match = text.match(SOURCE_AMOUNT_RE);
  if (!match) return parsed;
  const first = parseLooseNumber(match[1], match[2]);
  const second = match[3] ? parseLooseNumber(match[3], match[4]) : null;
  if (first == null && second == null) return parsed;
  const low = first ?? second;
  const high = second ?? first;
  return Object.freeze({
    min: low != null && high != null ? Math.min(low, high) : low,
    max: low != null && high != null ? Math.max(low, high) : high,
    currency,
    period: parsed?.period ?? null,
    gross: parsed?.gross ?? null,
    negotiable: parsed?.negotiable ?? false,
    approximate: parsed?.approximate ?? false,
  });
}

export function parseCandidateSalary(value, country = '') {
  const field = extractCandidateStructuredField(value, 'salary', 140);
  if (!field) return null;
  const defaultCurrency = defaultHiringCurrency(country);
  let parsed = parseHiringSourceSalary(field);
  if (!parsed || (parsed.min == null && parsed.max == null)) {
    const match = field.match(SOURCE_AMOUNT_RE);
    if (!match) return null;
    const first = parseLooseNumber(match[1], match[2]);
    const second = match[3] ? parseLooseNumber(match[3], match[4]) : null;
    if (first == null && second == null) return null;
    const low = first ?? second;
    const high = second ?? first;
    parsed = Object.freeze({
      min: low != null && high != null ? Math.min(low, high) : low,
      max: /\+/.test(field) ? null : (low != null && high != null ? Math.max(low, high) : high),
      currency: defaultCurrency,
      period: null,
      gross: null,
      negotiable: false,
      approximate: false,
    });
  }
  return Object.freeze({ ...parsed, currency: parsed.currency || defaultCurrency });
}

export function detectUsLocation(value) {
  return /\bunited states\b|\busa\b|\bu\.s\.?\b|\bUS(?:\s+remote)?\b|\b(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i.test(String(value || ''));
}

const NEGATIVE_SPONSORSHIP_RE = /(?:\bno\s+(?:visa\s+|immigration\s+|employment\s+)?sponsorship\b|\b(?:will\s+not|cannot|can't|unable\s+to|not\s+able\s+to)\s+sponsor\b|\bdo(?:es)?\s+not\s+(?:offer|provide)\s+(?:visa\s+|immigration\s+|employment\s+)?sponsorship\b|\bwithout\s+(?:the\s+need\s+for\s+)?(?:(?:current\s+(?:and\/or|or)\s+future|current|future)\s+)?(?:employer\s+|visa\s+)?sponsorship\b|\bmust\s+(?:be\s+)?(?:legally\s+)?authoriz\w+\s+to\s+work[^.!?]{0,80}\bwithout\s+(?:current\s+or\s+future\s+|current\s+|future\s+)?sponsorship\b|\bmust\s+not\s+require\s+(?:current\s+or\s+future\s+|current\s+|future\s+)?(?:visa\s+|employment\s+)?sponsorship\b|\b(?:current\s+and\/or\s+future|current\s+or\s+future)\s+sponsorship\s+(?:is\s+)?not\s+(?:available|provided|offered)\b|\bsponsorship\s+(?:is\s+)?not\s+(?:available|provided|offered)\b|\bno\s+c2c(?:\s+or\s+visa\s+sponsorship)?\b|\bmay\s+not\s+be\s+able\s+to\b[^\n!?]{0,450}\b(?:sponsor|support|provide)\b[^\n!?]{0,180}\bsponsorship\b|\b(?:will|can|may)\s+not\b[^\n!?]{0,220}\b(?:support|provide)\b[^\n!?]{0,160}\bsponsorship\b|\bnot\s+(?:currently\s+)?(?:able\s+to\s+)?(?:support|provide)\b[^\n!?]{0,160}\bsponsorship\b)/iu;
const POSITIVE_SPONSORSHIP_RE = /(?:\bwill\s+sponsor\b|\bwe\s+sponsor\b|\b(?:can|may)\s+sponsor\b|\bopen\s+to\s+(?:visa\s+)?sponsorship\b|\bvisa\s+sponsorship\s+(?:is\s+)?(?:available|provided|offered|possible)\b|\b(?:h-?1b|h1-b)\s+(?:visa\s+)?sponsorship\b|\bh-?1b\s+transfer\b|\bimmigration\s+sponsorship\b|\bemployment\s+visa\s+sponsorship\b|\bwork\s+visa\s+sponsorship\b|\bsponsor(?:ing)?\s+(?:qualified|eligible|selected)\s+candidates\b|\beligible\s+for\s+(?:visa\s+)?sponsorship\b|\bvisa\s+support\b|\bwork\s+visa\s+support\b)/iu;

export function detectVisaSponsorshipWording(value) {
  const text = String(value || '');
  if (NEGATIVE_SPONSORSHIP_RE.test(text)) return 'notOffered';
  if (POSITIVE_SPONSORSHIP_RE.test(text)) return 'offered';
  return null;
}

// Bare "opt" needs case-sensitive "OPT" (the Optional Practical Training
// abbreviation is written that way in real postings) — a case-insensitive
// `\bopt\b` also matched the common English verb ("opt-in", "opt out").
// "cpt" and "stem opt" don't collide with ordinary words, so they stay
// case-insensitive via explicit character classes instead of the `i` flag.
export const TEMPORARY_WORK_AUTH_RE = /\b(?:[Cc][Pp][Tt]|[Ss][Tt][Ee][Mm]\s+[Oo][Pp][Tt])\b|\bOPT\b/u;

export function detectRecruitmentAgency(value) {
  return /recruit(?:ment|ing) agency|staffing agency|talent agency|кадров(?:ое|е) агентство|рекрут(?:ингов|инг)\p{L}* агентство|агентство по подбору/iu.test(String(value || ''));
}

const NICE_TO_HAVE_RE = /(will be a plus|is a plus|as a plus|nice to have|would be a plus|plus:|плюсом|будет плюсом|буде плюсом|перевагою|преимуществом|will be an advantage)/iu;
export function extractNiceToHaveContext(value, maxLength = 500) {
  const text = String(value || '');
  const match = NICE_TO_HAVE_RE.exec(text);
  if (!match?.index && match?.index !== 0) return '';
  return text.slice(match.index + match[0].length, match.index + match[0].length + Math.max(40, Math.min(1500, Number(maxLength) || 500))).trim();
}

const CANDIDATE_FORM_RE = /(?:^|\n)\s*[^\p{L}\p{N}\n]{0,8}(?:ism(?:i|im)?(?:\s*[-–—]\s*(?:familya|familiya))?|familya|familiya|f\.?i\.?o\.?|фио|имя|yoshi|yoshim|tug(?:['’‘])ilgan\s+yili|возраст|qidirayotgan\s+kasb|so(?:['’‘])ralgan\s+ish\s+(?:joyi|turi)|yashash\s+manzili|ma(?:['’‘])lumoti|ожидаемая\s+работа|желаемая\s+(?:должность|работа)|tajribasi?|опыт\s+работы)\s*[:—-]/imu;
const CV_MARKER_RE = /(?:резюме|resume|\bcv\b|curriculum vitae|анкета|профиль кандидата|профіль кандидата|кандидат(?:ка)?|candidate profile|mening\s+(?:cv|rezume)|my\s+cv)/iu;
const FIRST_PERSON_CANDIDATE_RE = /(?:^|\n)\s*[^\p{L}\p{N}\n]{0,6}(?:я[\s—,-]|я\s+(?:ищу|шукаю)(?![\p{L}\p{N}_])|(?:ищу|шукаю)(?![\p{L}\p{N}_])|men[\s,]|mening[\s,]|my name is|i am a|i'm a|ismim\b)/iu;
const PERSONAL_PROFILE_RE = /(?:^|[^\p{L}\p{N}_])(?:(?:1[6-9]|[2-6]\d)\s*(?:лет|года?|рок(?:и|ів)?|years?\s+old)|(?:студент(?:ка|ом|кой)?|student))(?![\p{L}\p{N}_])/iu;
const CANDIDATE_CONTACT_RE = /(?:\+?\d[\d\s()\-]{7,}|@[a-z0-9_]{4,}|(?:telegram|телефон|phone|tel|aloqa|murojaat|bog(?:'|’)lanish)\s*[:—-])/iu;
const EMPTY_CANDIDATE_RECOMMENDATION_RE = /^(?:колеги[,!\s]*)?(?:вітаю[,!\s]*)?рекомендую\s+(?:класного\s+)?кандидат\p{L}*[.!\s]+(?:контакт\p{L}*\s+та\s+)?резюме\s+додаю\.?$/iu;
const CANDIDATE_SECTION_PATTERNS = Object.freeze([
  /(?:опыт|досвід|experience|staj|tajriba|ish\s+tajribasi)/iu,
  /(?:skills|навыки|навички|умею|стек|stack|technologies|texnologiyalar|ko(?:'|’)nikmalar)/iu,
  /(?:education|образован|освіт|o(?:'|’)qish|ta(?:'|’)lim|университет|університет|university|college|institut)/iu,
  /(?:languages|языки|мови|til(?:lar)?|language skills)/iu,
  /(?:contact|контакт|telegram|телефон|phone|tel|bog(?:'|’)lanish|aloqa)/iu,
]);

export function detectCandidatePostSignals(value) {
  const text = String(value || '').split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n').trim();
  return Object.freeze({
    candidateForm: CANDIDATE_FORM_RE.test(text),
    cvMarker: CV_MARKER_RE.test(text),
    firstPerson: FIRST_PERSON_CANDIDATE_RE.test(text),
    personalProfile: PERSONAL_PROFILE_RE.test(text),
    contact: CANDIDATE_CONTACT_RE.test(text),
    emptyRecommendation: EMPTY_CANDIDATE_RECOMMENDATION_RE.test(text.replace(/\s+/g, ' ')),
    sectionCount: CANDIDATE_SECTION_PATTERNS.filter((pattern) => pattern.test(text)).length,
  });
}

function candidateBlockLabels(key) {
  return entryAliases(CANDIDATE_FIELD_TERMS[key], FIELD_EXTRA_ALIASES.candidate[key] || [])
    .sort((a, b) => b.length - a.length)
    .map(fieldAliasPattern);
}

export function extractCandidateStructuredBlock(value, key, maxLength = 800) {
  const text = String(value || '');
  const labels = candidateBlockLabels(key);
  if (!text || !labels.length) return null;
  const label = labels.join('|');
  const allLabels = Object.keys(CANDIDATE_FIELD_TERMS)
    .flatMap((candidateKey) => candidateBlockLabels(candidateKey))
    .filter(Boolean)
    .join('|');
  const match = text.match(new RegExp(`(?:^|\\n)[^\\p{L}\\p{N}\\n]{0,10}(?:${label})\\s*[:：—-]?\\s*\\n([\\s\\S]{1,${maxLength}}?)(?=\\n[^\\p{L}\\p{N}\\n]{0,10}(?:${allLabels})\\s*[:：—-]|$)`, 'iu'));
  return match?.[1]?.replace(/\s+/g, ' ').trim() || null;
}

export function defaultHiringCurrency(country) {
  return countryCurrency(country);
}

const HIRING_CHARITY_APPEAL_RE = /(?:шелтер|притулок|прихисток|благодійн\p{L}*|благотворительн\p{L}*|донат\p{L}*|пожертв\p{L}*|збір\s+(?:кошт|грош)\p{L}*|сбор\s+средств|допоможіть|допомогти\s+(?:родин|дідус|бабус)\p{L}*|потребує\s+допомоги|нуждается\s+в\s+помощи|опікунств\p{L}*|інвалідніст\p{L}*|карта\s+для\s+допомоги|реквізити\s+для|monobank|банка\s+збор)/iu;

export function isHiringCharityAppeal(value) {
  const text = String(value || '');
  if (!text) return false;
  const matches = text.match(new RegExp(HIRING_CHARITY_APPEAL_RE.source, 'giu')) || [];
  return matches.length >= 2;
}

const RECRUITING_OPPORTUNITY_SIGNALS = Object.freeze([
  /(?:\blaboratory\b|\bacademy\b|\bbootcamp\b|\btraining\s+program\b|\binternship\s+program\b|лабораторія|лаборатория|академія|академия|буткемп)/iu,
  /(?:запрошує|приглашает|приглашаем|набір|набор)[^.]{0,100}(?:кандидат|учасник|участник)/iu,
  /(?:(?:реєстрац|регистрац)\p{L}*\s+до|\bregistration\b\s+(?:until|by))/iu,
  /(?:(?:старт|початок)\s*[—:,-]?\s*\d{1,2}\s+\p{L}+|\bstart\b\s*[—:,-]?\s*\d{1,2})/iu,
  /(?:кількість\s+місць|количество\s+мест|\blimited\s+spots\b|менторськ|менторск|\bmentorship\b)/iu,
]);

export function isHiringRecruitingOpportunity(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return false;
  return RECRUITING_OPPORTUNITY_SIGNALS.filter((pattern) => pattern.test(text)).length >= 2;
}

export function sameHiringProfessionFamily(a, b) {
  const left = String(a || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const right = String(b || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!left || !right) return false;
  if (left === right) return true;
  return /(?:^|\s)developer$/u.test(left) && /(?:^|\s)developer$/u.test(right);
}
