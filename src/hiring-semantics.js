import { detectDegreeFields, detectDegreeLevel } from './hiring-requirements.js';
import { matchExtendedProfessions } from './hiring-source-aliases.js';

const NON_TARGET_CONTEXT_RE = /(?:опыт\s+работы|досвід\s+роботи|work\s+experience|previous|раньше|ранее|прежде|работал|работала|працював|працювала|worked\s+(?:as|at)|oldin|avval|ishlagan|ishladim|tajriba|диплом|diplom|mutaxassisligim)/iu;
const TARGET_CONTEXT_RE = /(?:ищу\s+(?:работу|подработку)|шукаю\s+(?:роботу|підробіток)|желаемая\s+(?:должность|работа)|бажана\s+(?:посада|робота)|target\s+role|desired\s+(?:role|position)|looking\s+for\s+(?:a\s+)?(?:job|work)|open\s+to\s+work|menga\s+ish\s+kerak|ish\s+(?:kerak|qidiryapman|qidiraman|izlayapman)|ish\s+joyi\s+kerak|lavozim|kasb|soha|soxa|maqsad(?:im)?)/iu;

const SKILLS_FIELD_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,10}(?:skills|навыки|навички|стек|stack|technologies|texnologiya(?:lar)?|ko(?:'|’)nikmalar)\s*[:—-]\s*([^\n]{2,500})/iu;
const WORK_HISTORY_BLOCK_RE = /(?:^|\n)\s*(?:опыт\s+работы|досвід\s+роботи|work\s+experience|previous\s+(?:jobs?|positions?)|tajriba|ish\s+tajribasi)\s*[:—-]?\s*([\s\S]{1,2600}?)(?=\n\s*(?:навыки|навички|skills|образование|освіта|education|контакт|contact|ожидания|salary|языки|мови|languages)\s*[:—-]|$)/iu;
const WORK_HISTORY_LINE_RE = /(?:работал[аи]?|працюва(?:в|ла)|worked\s+(?:as|at)|oldin|avval|ishlagan|ishladim|ishlaganman|tajriba(?:m)?\s+bor)/iu;
const GOAL_ROLE_RE = /\b((?:(?:frontend|front-end|backend|back-end|full[- ]?stack|mobile|android|ios)\s+)?(?:dasturchi|developer|programmer))\s+sifatida\s+(?:ish\s+(?:topish|qidirish|izlash)|ishlash)\b/iu;
const CONTACT_HOURS_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,10}(?:murojaat\s+qilish\s+vaqti|aloqa\s+vaqti|qo(?:'|’)ng(?:'|’)iroq\s+vaqti|bog(?:'|’)lanish\s+vaqti|время\s+(?:связи|звонков|для\s+связи)|звонить\s+(?:с|в)|contact\s+(?:hours|time)|call\s+time)\s*[:—-]?\s*([^\n]{3,60})/iu;
const SALARY_FIELD_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,10}(?:narxi?|salary|expected\s+salary|зарплата|зп|бажана\s+зарплата|oylik|maosh|ish\s+haqi)\s*[:—-]\s*([^\n]{1,120})/iu;
const ROLE_FIELD_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,8}(?:желаемая\s+(?:работа|должность)|бажана\s+(?:робота|посада)|target\s+role|desired\s+(?:role|position)|position|role|должность|посада|lavozim|kasbi|kasb|qidirayotgan\s+kasb|so(?:'|’)ralgan\s+ish\s+turi)\s*[:：—-]\s*([^\n]{1,220})/iu;
const GOAL_FIELD_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,8}(?:maqsad|мақсад|goal|цель|мета)\s*[:：—-]\s*([^\n]{1,220})/iu;
const LOCATION_FIELD_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,8}(?:location|локация|локація|country|страна|країна)\s*[:：—-]\s*([^\n]{1,220})/iu;
const LOCATION_COMPACT_RE = /(?:^|\n)[^\p{L}\p{N}\n]{0,8}(?:location|локация|локація|country|страна|країна)\s+(#?[\p{L}][^\n]{0,120})/iu;

const STATUS_ONLY_RE = /^(?:talaba|student|студент(?:ка)?|студент(?:ка)?ка|o(?:'|’)quvchi|учащ(?:ийся|аяся))$/iu;
const FLEXIBLE_ROLE_RE = /^(?:нет|без)\s+разницы(?:\s+.*)?$|^не\s*важно(?:\s+.*)?$|^farqi\s+yo['’ʻʼ‘`]?q$|^любая\s+(?:работа|занятость)(?:\s+.*)?$/iu;
const NON_ROLE_RE = /^(?:удал[её]нно|работа\s+на\s+удал[её]н\p{L}*\s+основе|remote|onlayn|online|онлайн|farqi\s+yo['’ʻʼ‘`]?q|bilmaym\p{L}*|ish\s+ker(?:e|a)\s+onlayn|любая\s+(?:работа|занятость)|немає|нет|не\s+указано|not\s+specified)$/iu;
const REMOTE_NEGATIVE_RE = /(?:onsite|on-site|office\s+only|тільки\s+офіс|только\s+офис|офисн(?:ый|ая)\s+формат|офлайн|без\s+удал[её]нк|удал[её]нк\p{L}*\s+не\s+рассматрива|не\s+рассматрива\p{L}*\s+удал[её]н|remote\s+(?:not|no)|faqat\s+ofis|ofisda\s+ish(?:lash)?)/iu;
const REMOTE_POSITIVE_RE = /(?:\bremote\b|\bremotely\b|удал[её]н(?:но|ка|ный|ная|н\p{L}*)?|віддален(?:о|а|ий)?|дистанц(?:ионно|ійно)|masofaviy|(?<!\p{L})onlayn(?!\p{L})|online\s+(?:work|job)|онлайн\s+работ)/iu;

const FEATURE_RULES = Object.freeze([
  ['student', /\bstudent\b|студент|студентк|talaba/iu],
  ['parentalLeave', /декрет|в\s+декрете|у\s+декреті|maternity\s+leave|parental\s+leave/iu],
  ['noExperience', /без\s+опыта|без\s+досвіду|no\s+experience|tajriba\s+yo(?:'|’)q/iu],
  ['partTime', /подработк|підробіт|part[-\s]?time|неполный\s+день|неповн(?:ий|а)\s+день|yarim\s+stavka/iu],
  ['nightShift', /ночн(?:ая|ую|ой)\s+смен|нічн(?:а|у|ої)\s+змін|night\s+shift|tungi\s+smena/iu],
  ['openToRelocation', /готов\p{L}*\s+к\s+переезду|готов\p{L}*\s+переехать|готов\p{L}*\s+до\s+переїзду|relocat(?:e|ion)|ko(?:'|’)chib\s+o(?:'|’)tish/iu],
]);

const RELOCATION_NEGATIVE_RE = /не\s+готов\p{L}*\s+к\s+переезду|не\s+розгляда\p{L}*\s+переїзд|not\s+(?:open|ready)\s+to\s+relocat/iu;
const RELOCATION_POSITIVE_RE = /готов\p{L}*\s+к\s+переезду|готов\p{L}*\s+переехать|готов\p{L}*\s+до\s+переїзду|relocat(?:e|ion)|ko(?:'|’)chib\s+o(?:'|’)tish/iu;

const SPECIAL_CANDIDATE_PROFESSIONS = Object.freeze([
  ['HR / Recruiter', /#(?:hr|hrd|hrbp|hrgeneralist|peopleops)\b|\b(?:hr\s+lead|head\s+of\s+hr|people\s+partner|talent\s+operations|кадров\p{L}*\s+аудит)\b/iu],
  ['Sales Manager', /(?:sotuv|savdo)\s+(?:menejer|menejr|menedjer|manager)|\bsales\s+manager\b|менеджер\s+(?:по\s+)?продаж|менеджер\s+з\s+продаж/iu],
  ['Backend Developer', /\bbackend\s+(?:developer|engineer)\b|\bback[- ]?end\s+(?:developer|engineer)\b|backend\s+dasturchi|серверн(?:ый|ий)\s+разработчик/iu],
  ['Frontend Developer', /\bfrontend\s+(?:developer|engineer)\b|\bfront[- ]?end\s+(?:developer|engineer)\b|frontend\s+dasturchi/iu],
  ['AI / ML Engineer', /\b(?:ai|artificial\s+intelligence|machine\s+learning|ml)\s*(?:\/\s*(?:ai|ml))?\s*(?:engineer|developer)\b|\b(?:engineer|developer)\s+(?:ai|ml|machine\s+learning)\b/iu],
  ['Penetration Tester', /\b(?:penetration\s+tester|penetration\s+testing|pentest(?:er|ing)?)\b|пентест(?:ер|инг)?/iu],
  ['Network Administrator', /\b(?:network\s+administrator|network\s+admin)\b|(?:tarmoq|тармоқ)[^\n]{0,70}(?:administrator|admin(?:strator)?i?|администратор)/iu],
  ['System Administrator', /\b(?:system\s+administrator|system\s+admin|sysadmin)\b|(?:tizim|тизим)[^\n]{0,50}(?:administrator|admin(?:strator)?i?|администратор)|системн(?:ый|ий)\s+администратор/iu],
  ['Cybersecurity Specialist', /\b(?:cybersecurity|cyber\s+security|information\s+security)\b|кибербезопасност|кібербезпек|информационн(?:ая|ой)\s+безопасност|інформаційн(?:а|ої)\s+безпек|axborot\s+xavfsizligi/iu],
  ['Data Scientist', /\bdata\s+scientist\b|\bdata\s+science\b|дата\s+саентист/iu],
  ['Data Engineer', /\bdata\s+engineer\b|инженер\s+данных|інженер\s+даних/iu],
]);

const SCOPE_SIGNALS = Object.freeze([
  Object.freeze({
    code: 'architecture',
    vacancy: /\barchitect(?:ure|ing)?\b|\bsystem design\b|\btechnical roadmap\b|\blong[- ]term solutions?\b/i,
    candidate: /\barchitect(?:ed|ure|ing)?\b|\bsystem design\b|\btechnical roadmap\b|\bsolution architecture\b/i,
  }),
  Object.freeze({
    code: 'leadership',
    vacancy: /\btechnical leader(?:ship)?\b|\bengineering standards\b|\bdrive product vision\b|\blead technical\b/i,
    candidate: /\btechnical leader(?:ship)?\b|\bengineering standards\b|\bled\s+(?:a\s+)?(?:team|project|initiative)\b|\btech(?:nical)? lead\b/i,
  }),
  Object.freeze({
    code: 'mentoring',
    vacancy: /\bmentor(?:ing|ed)?\s+(?:other\s+)?(?:engineers?|developers?|team members?)\b|\bcoach(?:ing|ed)?\s+(?:engineers?|developers?)\b/i,
    candidate: /\bmentor(?:ing|ed)?\s+(?:other\s+)?(?:engineers?|developers?|team members?)\b|\bcoach(?:ing|ed)?\s+(?:engineers?|developers?)\b/i,
  }),
  Object.freeze({
    code: 'scale',
    vacancy: /\b(?:millions?|billions?)\s+of\s+(?:users|people|requests|events)\b|\bat scale\b|\bhigh[- ]scale\b|\blarge[- ]scale\b/i,
    candidate: /\b(?:millions?|billions?)\s+of\s+(?:users|requests|events)\b|\bat scale\b|\bhigh[- ]scale\b|\blarge[- ]scale\b|\bhigh[- ]traffic\b/i,
  }),
  Object.freeze({
    code: 'ownership',
    vacancy: /\bown\s+(?:critical\s+)?(?:features?|systems?|services?|roadmap)\b|\bproduct owner\b|\bdrive product\b/i,
    candidate: /\bown(?:ed|ership)?\s+(?:features?|systems?|services?|roadmap|product)\b|\bproduct owner\b|\bdrove\s+(?:a\s+)?(?:feature|product|initiative)\b/i,
  }),
]);

const fieldValue = (value, re) => String(value || '').match(re)?.[1]?.trim() || null;

export function isCandidateNonTargetContext(value) {
  return NON_TARGET_CONTEXT_RE.test(String(value || ''));
}

export function extractCandidateTargetContext(value) {
  const lines = String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const picked = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!TARGET_CONTEXT_RE.test(lines[i])) continue;
    for (let offset = 0; offset < 3 && i + offset < lines.length; offset += 1) {
      const line = lines[i + offset];
      if (offset > 0 && NON_TARGET_CONTEXT_RE.test(line)) break;
      picked.push(line);
    }
  }
  return picked.join('\n');
}

export function extractCandidateSkillField(value) {
  return fieldValue(value, SKILLS_FIELD_RE);
}

export function extractCandidateRoleField(value) {
  return fieldValue(value, ROLE_FIELD_RE);
}

export function extractCandidateGoalField(value) {
  return fieldValue(value, GOAL_FIELD_RE);
}

export function extractCandidateLocationField(value) {
  return fieldValue(value, LOCATION_FIELD_RE) || fieldValue(value, LOCATION_COMPACT_RE);
}

export function isCandidateStatusOnly(value) {
  return STATUS_ONLY_RE.test(String(value || '').trim());
}

export function isFlexibleCandidateRole(value) {
  return FLEXIBLE_ROLE_RE.test(String(value || '').trim());
}

export function isCandidateNonRoleValue(value) {
  return NON_ROLE_RE.test(String(value || '').trim());
}

export function extractCandidateGoalRole(value) {
  return String(value || '').match(GOAL_ROLE_RE)?.[1]?.trim() || null;
}

export function extractCandidateWorkHistory(value) {
  const text = String(value || '');
  const explicit = text.match(WORK_HISTORY_BLOCK_RE)?.[1];
  if (explicit) return explicit;
  return text.split(/\n|(?<=[.!?])\s+/u).filter((line) => WORK_HISTORY_LINE_RE.test(line)).join('\n');
}

export function detectCandidateFeatureCodes(value) {
  const text = String(value || '');
  return Object.freeze(FEATURE_RULES.filter(([, re]) => re.test(text)).map(([code]) => code));
}

export function extractCandidateContactHours(value) {
  const raw = String(value || '').match(CONTACT_HOURS_RE)?.[1];
  if (!raw) return null;
  const cleaned = raw.replace(/\s{2,}/g, ' ').replace(/[.;,]+$/, '').trim();
  return /\b24\s*\/\s*7\b|\d{1,2}[:.]\d{2}|\d{1,2}\s*[-–—]\s*\d{1,2}/.test(cleaned)
    ? cleaned.slice(0, 60)
    : null;
}

export function extractCandidateSalaryField(value) {
  return fieldValue(value, SALARY_FIELD_RE);
}

export function detectCandidateRelocationPreference(value) {
  const text = String(value || '');
  if (RELOCATION_NEGATIVE_RE.test(text)) return false;
  if (RELOCATION_POSITIVE_RE.test(text)) return true;
  return null;
}

export function detectCandidateRemotePreference(value) {
  const text = String(value || '');
  if (REMOTE_NEGATIVE_RE.test(text)) return false;
  if (REMOTE_POSITIVE_RE.test(text)) return true;
  return null;
}

export function detectCandidateProfessionLabels(targetValue, skillValue = '') {
  const target = String(targetValue || '');
  const special = SPECIAL_CANDIDATE_PROFESSIONS
    .filter(([, re]) => re.test(target))
    .map(([label]) => label);
  if (special.length) return Object.freeze([...new Set(special)]);

  const matched = matchExtendedProfessions(target, { limit: 8, allowWeak: true }).map((item) => item.label);
  if (matched.length) return Object.freeze([...new Set(matched)]);

  const skills = String(skillValue || '');
  if (!skills) return Object.freeze([]);
  if (/\bflutter\b|\bdart\b/iu.test(skills)) return Object.freeze(['Mobile Developer']);

  const sysadminBase = /\bcisco\b/iu.test(skills)
    && /\b(?:linux|windows\s+server|active\s+directory|network(?:ing)?)\b/iu.test(skills);
  const specializedTools = /\b(?:devops|sre|docker|kubernetes|k8s|terraform|ansible|jenkins|gitlab\s+ci|github\s+actions|ci\/?cd|aws|azure|gcp|ai|ml|mlops|artificial\s+intelligence|machine\s+learning|deep\s+learning|data\s+scien(?:ce|tist)|tensorflow|pytorch|scikit[- ]?learn|llm|langchain|developer|software\s+engineer|programmer|разработчик|программист|react|angular|vue(?:\.js)?|next(?:\.js)?|node(?:\.js)?|django|laravel|spring\s+boot|asp\.net)\b/iu.test(skills);
  if (sysadminBase && !specializedTools) return Object.freeze(['System Administrator']);

  const strongDeveloperSkill = /\b(?:react|vue\.?\s*js|angular|node\.?\s*js|next\.?\s*js|django|laravel|fastapi|flask|spring|asp\.?net|ruby\s+on\s+rails)\b/iu.test(skills);
  const softwareSignals = (skills.match(/\b(?:python|java(?:script)?|typescript|php|react|vue\.?\s*js|angular|node\.?\s*js|next\.?\s*js|django|laravel|fastapi|flask|spring|asp\.?net|sql|html|css|c\+\+|c#|golang)\b/giu) || []).length;
  return strongDeveloperSkill || softwareSignals >= 2
    ? Object.freeze(['Software Developer'])
    : Object.freeze([]);
}

export function detectManagementRole(title, value = '') {
  const heading = String(title || '');
  const text = String(value || '');
  if (/\b(?:head|director|chief|manager|supervisor|team\s*lead|tech\s*lead)\b|руководител|начальник|директор|тимлид|заведующ/i.test(heading)) return true;
  if (/manage(?:s|ment|ing)?\s+(?:a\s+)?(?:team|people|staff)|people management|direct reports|руковод(?:ить|ство)\s+(?:команд|сотруд)|управлени[ея]\s+(?:команд|персонал)/i.test(text)) return true;
  return null;
}

export function detectHiringScopeSignals(value, options = {}) {
  const mode = options.mode === 'candidate' ? 'candidate' : 'vacancy';
  const text = String(value || '');
  return Object.freeze(SCOPE_SIGNALS.filter((signal) => signal[mode].test(text)).map((signal) => signal.code));
}

export function detectDegreeRequirement(value) {
  const text = String(value || '');
  const level = detectDegreeLevel(text) || undefined;
  const fields = detectDegreeFields(text);
  let field;
  if (fields.includes('computer_science')) field = 'computer_science';
  else if (fields.includes('engineering') && /\bengineering\b[^.;\n]{0,60}\bdegree\b|\bdegree\b[^.;\n]{0,60}\bengineering\b/i.test(text)) field = 'engineering';
  const equivalentExperience = /equivalent\s+(?:professional\s+|work\s+)?experience|or\s+equivalent\s+experience/i.test(text);
  return Object.freeze({ level, field, equivalentExperience });
}
