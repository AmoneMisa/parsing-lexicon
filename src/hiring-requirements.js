import { parseExperience } from './hiring-advanced.js';

export const SENIORITY_RANK = Object.freeze({
  intern: 0,
  junior: 1,
  middle: 2,
  senior: 3,
  staff: 4,
  lead: 4,
  manager: 4,
  principal: 5,
  director: 6,
});

export function detectHiringSeniority(value) {
  const text = String(value || '');
  const target = /\b(?:looking|searching)\s+for\s+(?:an?\s+)?(?:a\s+)?(intern|junior|middle|mid|senior|staff|principal|lead)\b/i.exec(text)?.[1];
  const normalize = (item) => item.toLowerCase() === 'mid' ? 'middle' : item.toLowerCase();
  if (target) return normalize(target);
  const checks = [
    ['director', /\b(?:engineering\s+)?director\b|директор/i],
    ['principal', /\bprincipal\b(?=[^,;\n]{0,60}\b(?:engineer|developer|architect)\b)/i],
    ['staff', /\bstaff\b(?=[^,;\n]{0,60}\b(?:engineer|developer|architect)\b)/i],
    ['lead', /\b(?:team\s*lead|tech\s*lead|lead\s+(?:engineer|developer|frontend|backend))\b|тимлид|техлид|ведущ\w*/i],
    ['manager', /\bengineering manager\b|руководител/i],
    ['senior', /\bsenior\b(?=[^,;\n]{0,60}\b(?:engineer|developer|frontend|backend|software)\b)|сеньор|старш\w*\s+(?:разработ|инженер)/i],
    ['middle', /\b(?:middle|mid[- ]?level)\b(?=[^,;\n]{0,60}\b(?:engineer|developer|frontend|backend|software)\b)|мидл/i],
    ['junior', /\bjunior\b(?=[^,;\n]{0,60}\b(?:engineer|developer|frontend|backend|software)\b)|джун\w*|младш\w*/i],
    ['intern', /\b(?:intern|trainee)\b|стаж[ёе]р|стажир/i],
  ];
  return checks.find(([, pattern]) => pattern.test(text))?.[0] || null;
}

export function detectDegreeLevel(value) {
  const text = String(value || '');
  if (/\b(?:ph\.?d\.?|doctorate|doctoral degree)\b|доктор(?:ская| наук)/i.test(text)) return 'doctorate';
  if (/master['’]?s degree|master degree|магистр|магістр/i.test(text)) return 'master';
  if (/bachelor['’]?s degree|bachelor degree|бакалавр/i.test(text)) return 'bachelor';
  if (/secondary education|среднее образование|середня освіта/i.test(text)) return 'secondary';
  return null;
}

export function detectDegreeFields(value) {
  const text = String(value || '');
  const fields = [];
  if (/computer science|computer engineering|software engineering|information technology|informatics|інформатик|информатик/i.test(text)) fields.push('computer_science');
  if (/\bengineering\b|инженерн|інженерн/i.test(text)) fields.push('engineering');
  if (/\b(?:civil\s+)?law\b|legal studies|юридич|юриспруд|право\b/i.test(text)) fields.push('law');
  if (/forensic|criminal investigation|криминалист|криміналіст|следствен|слідч/i.test(text)) fields.push('forensics');
  if (/business|economics|finance|management|эконом|економ/i.test(text)) fields.push('business');
  return Object.freeze([...new Set(fields)]);
}

export function extractRequiredExperienceYears(value) {
  const parsed = parseExperience(value);
  return typeof parsed?.minYears === 'number' ? parsed.minYears : null;
}

export function hasUsWorkAuthorization(value) {
  const text = String(value || '');
  return /\b(?:u\.?s\.?|united states)\s+citizen\b|\bgreen card\b|\bpermanent resident\b|\bemployment authorization document\b|\bEAD\b|\bauthoriz\w+\s+to\s+work\s+in\s+(?:the\s+)?(?:u\.?s\.?|united states)(?:[^.!?]{0,50}\bwithout\s+sponsorship\b)?|\bno\s+(?:visa\s+)?sponsorship\s+required\b/i.test(text);
}

export function requiresUsSponsorship(value) {
  const text = String(value || '');
  if (hasUsWorkAuthorization(text)) return false;
  if (/\b(?:require|requires|requiring|need|needs|seeking)\b[^.!?]{0,60}\b(?:visa|employment)\s+sponsorship\b|\bneed\s+(?:an?\s+)?(?:h-?1b|work visa)\b/i.test(text)) return true;
  const citizenship = /\bcitizenship\s*[:\-]\s*([^\n|,;]{2,45})/i.exec(text)?.[1];
  if (citizenship && !/^\s*(?:u\.?s\.?a?|united states|american)\b/i.test(citizenship)) return true;
  return null;
}

export function isNoSponsorshipRequirement(value) {
  const text = String(value || '');
  return /(?:\bno\s+(?:visa\s+|immigration\s+|employment\s+)?sponsorship\b|\b(?:will\s+not|cannot|can't|unable\s+to|not\s+able\s+to)\s+sponsor\b|\bwithout\s+(?:the\s+need\s+for\s+)?(?:current\s+or\s+future\s+)?(?:employer\s+|visa\s+)?sponsorship\b|\bmust\s+(?:be\s+)?(?:legally\s+)?authoriz\w+\s+to\s+work[^.!?]{0,100}\bwithout\s+(?:current\s+or\s+future\s+)?sponsorship\b|\bsponsorship\s+(?:is\s+)?not\s+(?:available|provided|offered)\b|\bmay\s+not\s+be\s+able\s+to\b[^\n!?]{0,450}\b(?:sponsor|support|provide)\b[^\n!?]{0,180}\bsponsorship\b|\b(?:will|can|may)\s+not\b[^\n!?]{0,220}\b(?:sponsor|support|provide)\b[^\n!?]{0,160}\bsponsorship\b|\bnot\s+(?:currently\s+)?(?:able\s+to\s+)?(?:sponsor|support|provide)\b[^\n!?]{0,160}\bsponsorship\b)/i.test(text);
}

const REQUIRED_MARKER_RE = /\b(requirements?|qualifications?|minimum qualifications?|required skills?|must[- ]?have|you have|what (?:we|you) (?:are looking for|need|bring)|you(?:'|’)ll need|who you are|ideal candidate|what makes you a fit)\b|требован|квалификац|обязательн|необходим(?:о|ые|ый)|что мы (?:жд[её]м|ожидаем)|кого мы ищем|вимог|кваліфікац|обов['’]?язков|необхідн|кого ми шукаємо/i;
const OPTIONAL_MARKER_RE = /\b(nice to have|preferred qualifications?|preferred skills?|bonus points?|would be a plus|plus if|desirable)\b|желательн|будет плюсом|буде плюсом|преимуществ|бажан/i;
const HARD_REQUIREMENT_RE = /\b(must|need to|required|proficien(?:t|cy)|expertise in|experience (?:with|in)|knowledge of|familiarity with|hands[- ]on)\b|обязател|требуется|необходим|знание|опыт (?:с|в)|владение|умение|потрібн|необхідн|досвід (?:з|у|в)|знання/i;
const NOISE_RE = /\b(equal opportunity|eeo|diversity and inclusion|reasonable accommodation|candidate privacy|privacy notice|background check|recruit(?:ment|ing) process|talent acquisition team|compensation range|pay transparency)\b|процесс найма|процес найму|политик[аи] конфиденциальности|політик[аи] конфіденційності/i;
const SECTION_BREAK_RE = /\b(what we offer|benefits|perks|about us|about the company|our company|compensation|salary|responsibilities|what you(?:'|’)ll do|your role)\b|что мы предлагаем|условия работы|о компании|про компанію|обязанности|обов['’]?язки/i;

export function bucketVacancyText(value) {
  const segments = String(value || '').replace(/[•●▪◦·]/g, '. ').split(/\n+|(?<=[.!?;])\s+/).map((part) => part.trim()).filter(Boolean);
  const buckets = { required: [], optional: [], context: [], noise: [] };
  let active = null;
  let ttl = 0;
  for (const segment of segments) {
    if (NOISE_RE.test(segment)) { buckets.noise.push(segment); active = null; ttl = 0; continue; }
    buckets.context.push(segment);
    if (OPTIONAL_MARKER_RE.test(segment)) { active = 'optional'; ttl = 6; buckets.optional.push(segment); continue; }
    if (REQUIRED_MARKER_RE.test(segment)) { active = 'required'; ttl = 8; buckets.required.push(segment); continue; }
    if (SECTION_BREAK_RE.test(segment)) { active = null; ttl = 0; }
    if (HARD_REQUIREMENT_RE.test(segment)) { buckets.required.push(segment); continue; }
    if (active && ttl > 0) { buckets[active].push(segment); ttl -= 1; }
  }
  return Object.freeze({ required: buckets.required.join(' '), optional: buckets.optional.join(' '), context: buckets.context.join(' '), noise: buckets.noise.join(' ') });
}

const CV_SECTION_HEADING_RE = /^\s*(profile|professional profile|summary|professional summary|about me|work experience|professional experience|experience|employment|employment history|projects?|pet projects?|hobbies|skills|technical skills|tech stack|education|languages?|contact|additional information)\s*:?[\s]*$/i;

export function classifyCvSectionHeading(value) {
  const heading = CV_SECTION_HEADING_RE.exec(String(value || '').trim())?.[1];
  if (!heading) return null;
  const normalized = heading.toLowerCase();
  if (/work experience|professional experience|^experience$|employment/.test(normalized)) return 'experience';
  if (/project|hobbies/.test(normalized)) return 'projects';
  if (/profile|summary|about me/.test(normalized)) return 'profile';
  if (/skills|tech stack/.test(normalized)) return 'skills';
  if (/education/.test(normalized)) return 'education';
  return 'other';
}

export function extractCvSection(value, wanted) {
  const lines = String(value || '').replace(/\r/g, '').split('\n');
  const collected = [];
  let section = 'other';
  let sawHeading = false;
  for (const line of lines) {
    const trimmed = line.trim();
    const nextSection = classifyCvSectionHeading(trimmed);
    if (nextSection) {
      section = nextSection;
      sawHeading = true;
      continue;
    }
    if (section === wanted && trimmed) collected.push(trimmed);
  }
  return sawHeading ? collected.join('\n') : '';
}

function monthIndex(year, month = 1) {
  return year * 12 + Math.max(1, Math.min(12, month)) - 1;
}

export function extractCvExperienceYears(value, referenceDate = new Date()) {
  const raw = String(value || '');
  const experienceSection = extractCvSection(raw, 'experience');
  const datedSource = experienceSection || raw;
  const intervals = [];
  const ranges = /\b(19\d{2}|20\d{2})(?:[-/.](0?[1-9]|1[0-2]))?\s*(?:-|–|—|to)\s*(?:(present|current|now)|((?:19|20)\d{2})(?:[-/.](0?[1-9]|1[0-2]))?)/gi;
  for (const match of datedSource.matchAll(ranges)) {
    const startYear = Number(match[1]);
    const startMonth = Number(match[2] || 1);
    const endYear = match[3] ? referenceDate.getFullYear() : Number(match[4]);
    const endMonth = match[3] ? referenceDate.getMonth() + 1 : Number(match[5] || 12);
    if (!startYear || !endYear) continue;
    const start = monthIndex(startYear, startMonth);
    const end = monthIndex(endYear, endMonth);
    if (end >= start && end - start <= 12 * 50) intervals.push([start, end]);
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (!last || interval[0] > last[1] + 1) merged.push([...interval]);
    else last[1] = Math.max(last[1], interval[1]);
  }
  const datedMonths = merged.reduce((sum, [start, end]) => sum + end - start + 1, 0);
  const datedYears = datedMonths ? datedMonths / 12 : 0;
  let explicitYears = 0;
  const explicit = /\b(?:over|more than|at least|about|approximately|approx\.?|around)?\s*(\d{1,2}(?:[.,]\d)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:hands[- ]on\s+|professional\s+|commercial\s+)?experience\b/gi;
  for (const match of raw.matchAll(explicit)) {
    const years = Number(match[1]?.replace(',', '.'));
    if (Number.isFinite(years) && years >= 0 && years <= 50) explicitYears = Math.max(explicitYears, years);
  }
  const result = Math.max(datedYears, explicitYears);
  return result > 0 ? Math.round(result * 10) / 10 : null;
}
