import { findPhoneLikeSpans, findTelegramContacts, parsePhoneNumbers } from './contact.js';
import { countryPhoneHint } from './country-context.js';

const EXPLICIT_FEMALE_RE = /(?:^|[^\p{L}])(?:женщина|женский|девушка|female|ayol)(?=$|[^\p{L}])/iu;
const EXPLICIT_MALE_RE = /(?:^|[^\p{L}])(?:мужчина|мужской|парень|male|erkak)(?=$|[^\p{L}])/iu;
const FEMALE_LINEAGE_RE = /(?:^|[^\p{L}])(?:qizi|қизи|кизи|қызы)(?=$|[^\p{L}])/iu;
const MALE_LINEAGE_RE = /(?:^|[^\p{L}])(?:o(?:['’ʻʼ‘`])?g(?:['’ʻʼ‘`])?li|ўғли|угли|оғли|огли)(?=$|[^\p{L}])/iu;
const FEMALE_SURNAME_RE = /(?:^|[^\p{L}])\p{L}[\p{L}ёЁ-]{2,}(?:ова|ева|ёва|ина|ына|ская|цкая|ая)(?=$|[^\p{L}])/iu;
const MALE_SURNAME_RE = /(?:^|[^\p{L}])\p{L}[\p{L}ёЁ-]{2,}(?:ов|ев|ёв|ин|ын|ский|цкий|ой)(?=$|[^\p{L}])/iu;
const FEMALE_LATIN_SURNAME_RE = /(?:^|[^\p{L}])\p{L}[\p{L}'’ʻʼ‘`-]{2,}(?:ova|eva|ina|skaya|tskaya|aya)(?=$|[^\p{L}])/iu;
const MALE_LATIN_SURNAME_RE = /(?:^|[^\p{L}])\p{L}[\p{L}'’ʻʼ‘`-]{2,}(?:ov|ev|in|skiy|sky|tskiy|oy)(?=$|[^\p{L}])/iu;
const FEMALE_PATRONYMIC_RE = /(?:^|[^\p{L}])\p{L}[\p{L}ёЁ-]{2,}(?:овна|евна|ична|инична)(?=$|[^\p{L}])/iu;
const MALE_PATRONYMIC_RE = /(?:^|[^\p{L}])\p{L}[\p{L}ёЁ-]{2,}(?:ович|евич|ич)(?=$|[^\p{L}])/iu;
const NAME_LINE_RE = /^[\p{L}'’ʻʼ‘`-]+(?:\s+[\p{L}'’ʻʼ‘`-]+){1,5}$/u;
const NON_NAME_LINE_RE = /(?:^|\s)(?:работ\p{L}*|робот\p{L}*|онлайн|удал[её]н\p{L}*|remote|job|role|ish|любая|любую|подработ\p{L}*)(?=$|\s)/iu;
const NO_EXPERIENCE_RE = /без опыта|нет опыта|без досвіду|немає досвіду|no experience|fără experiență|tajribasiz|tajriba(?:m)?\s+yo(?:'|’)q|ish tajribasi talab qilinmaydi/iu;
const EXPERIENCE_VALUE_RE = /(?<![\d])(\d+(?:[.,]\d+)?)\s*(?:лет|год(?:а|ов)?|рок(?:и|ів)?|years?|ani|an|yil)(?![\p{L}\p{N}])/iu;
const AGE_VALUE_RE = /(?<![\d])(\d{2})\s*(?:лет|год(?:а)?|рок(?:и|ів)?|years?|ani|an|yil)(?![\p{L}\p{N}])/iu;

export function extractCandidateGender(value) {
  const text = String(value || '');
  if (EXPLICIT_FEMALE_RE.test(text)) return 'female';
  if (EXPLICIT_MALE_RE.test(text)) return 'male';
  if (FEMALE_LINEAGE_RE.test(text)) return 'female';
  if (MALE_LINEAGE_RE.test(text)) return 'male';
  const nameLine = text.split(/\r?\n/u).map((line) => line.trim()).find(Boolean) || '';
  if (!NAME_LINE_RE.test(nameLine) || NON_NAME_LINE_RE.test(nameLine)) return undefined;
  if (FEMALE_PATRONYMIC_RE.test(nameLine)) return 'female';
  if (MALE_PATRONYMIC_RE.test(nameLine)) return 'male';
  if (FEMALE_SURNAME_RE.test(nameLine) || FEMALE_LATIN_SURNAME_RE.test(nameLine)) return 'female';
  if (MALE_SURNAME_RE.test(nameLine) || MALE_LATIN_SURNAME_RE.test(nameLine)) return 'male';
  return undefined;
}

export function extractCandidateName(value) {
  const text = String(value || '');
  const match = text.match(/(?:^|\n)[^\p{L}\p{N}\n]{0,10}(?:xodim|hodim|nomzod|candidate|фио|ф\.и\.о\.?|f\.?\s*i\.?\s*sh\.?|піб|full name|name|имя|ім(?:ʼ|')я|fio|ism(?:i|im)?(?:\s*[-–—]\s*(?:familya|familiya))?|familya|familiya)\s*[:—-]\s*([^\n]{2,100})/iu);
  return (match?.[1] || '')
    .split(/\s*[▪▫◾◽📚🕑🌐💰📞🇺🇿]\s*|\s+(?=(?:tug['’ʻʼ‘`]?ilgan|yashash|ma['’ʻʼ‘`]?lumoti|avvalgi|ish\s+staji|so['’ʻʼ‘`]?ralgan)\b)/iu)[0]
    .trim().replace(/\s{2,}/g, ' ').slice(0, 100);
}

export function extractCandidateAge(value, now = new Date()) {
  const text = String(value || '');
  const patterns = [
    /(?:возраст|вік|age|yosh|yoshi|vârsta)\s*[:—-]?\s*(\d{1,2})/iu,
    /(?:yoshim|yoshm)\s*(\d{1,2})\s*da\b/iu,
    /(?:мне|мені)\s+(\d{1,2})\s*(?:лет|рок(?:и|ів)?)/iu,
    AGE_VALUE_RE,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const age = match ? Number(match[1]) : Number.NaN;
    if (Number.isFinite(age) && age >= 14 && age <= 90) return age;
  }
  const born = text.match(/(?:tug(?:['’‘])ilgan\s+yili|tug(?:['’‘])ilgan\s+sana(?:si)?|год\s+рождения|дата\s+рождения|рік\s+народження|дата\s+народження|birth\s+(?:year|date))\s*[:—-]?\s*(?:(\d{1,2})[./-](\d{1,2})[./-])?((?:19|20)\d{2})/iu);
  if (!born) return null;
  const year = Number(born[3]);
  let age = now.getUTCFullYear() - year;
  if (born[1] && born[2]) {
    const month = Number(born[2]);
    const day = Number(born[1]);
    if (now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day)) age -= 1;
  }
  return age >= 14 && age <= 90 ? age : null;
}

export function parseCandidateExperienceValue(value) {
  const text = String(value || '');
  if (NO_EXPERIENCE_RE.test(text)) return 0;
  const match = text.match(EXPERIENCE_VALUE_RE);
  return match ? Number(match[1].replace(',', '.')) : null;
}

export function extractCandidateExperienceYears(value) {
  const text = String(value || '');
  if (NO_EXPERIENCE_RE.test(text)) return 0;
  const match = text.match(/(?:опыт(?: работы)?|стаж|досвід(?: роботи)?|experience|experiență|tajriba\p{L}*|ish tajribasi)[^\d]{0,30}(\d+(?:[.,]\d+)?)\s*(?:лет|год(?:а|ов)?|рок(?:и|ів)?|years?|ani|an|yil)/iu)
    || text.match(/(?<![\d])(\d+(?:[.,]\d+)?)\s*(?:лет|год(?:а|ов)?|рок(?:и|ів)?|years?|ani|an|yil)(?![\p{L}\p{N}])[^\n]{0,30}(?:опыт|стаж|досвід|experience|experiență|tajriba)/iu);
  return match ? Number(match[1].replace(',', '.')) : null;
}

export function extractCandidateContacts(value, country = '') {
  const text = String(value || '');
  const countryHint = countryPhoneHint(country) || undefined;
  const parsedPhone = parsePhoneNumbers(text, { countryHint, includePossible: true })[0];
  const broadPhone = parsedPhone ? null : findPhoneLikeSpans(text)[0];
  const phone = parsedPhone?.number || broadPhone?.raw || undefined;
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu)?.[0];
  const telegram = findTelegramContacts(text)[0]?.handle;
  return Object.freeze({ ...(phone ? { phone } : {}), ...(email ? { email } : {}), ...(telegram ? { telegram } : {}) });
}
