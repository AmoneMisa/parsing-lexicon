export const HIRING_MONTHS = Object.freeze({
  январь: 0, января: 0, february: 1, февраль: 1, февраля: 1,
  март: 2, марта: 2, april: 3, апрель: 3, апреля: 3,
  may: 4, май: 4, мая: 4, june: 5, июнь: 5, июня: 5,
  july: 6, июль: 6, июля: 6, august: 7, август: 7, августа: 7,
  september: 8, сентябрь: 8, сентября: 8, october: 9, октябрь: 9, октября: 9,
  november: 10, ноябрь: 10, ноября: 10, december: 11, декабрь: 11, декабря: 11,
  ianuarie: 0, februarie: 1, martie: 2, aprilie: 3, mai: 4, iunie: 5,
  iulie: 6, august: 7, septembrie: 8, octombrie: 9, noiembrie: 10, decembrie: 11,
  січня: 0, лютого: 1, березня: 2, квітня: 3, травня: 4, червня: 5,
  липня: 6, серпня: 7, вересня: 8, жовтня: 9, листопада: 10, грудня: 11,
  yanvar: 0, fevral: 1, mart: 2, aprel: 3, iyun: 5,
  iyul: 6, avgust: 7, sentabr: 8, oktabr: 9, noyabr: 10, dekabr: 11,
  қаңтар: 0, ақпан: 1, наурыз: 2, сәуір: 3, мамыр: 4, маусым: 5,
  шілде: 6, тамыз: 7, қыркүйек: 8, қазан: 9, қараша: 10, желтоқсан: 11,
});

export const UNICODE_LEFT_BOUNDARY = '(?<![\\p{L}\\p{N}])';
export const UNICODE_RIGHT_BOUNDARY = '(?![\\p{L}\\p{N}])';
export const TODAY_RE = new RegExp(`${UNICODE_LEFT_BOUNDARY}(?:сегодня|сьогодні|bugun|today|astăzi|azi)${UNICODE_RIGHT_BOUNDARY}`, 'iu');
export const YESTERDAY_RE = new RegExp(`${UNICODE_LEFT_BOUNDARY}(?:вчера|вчора|kecha|yesterday|ieri)${UNICODE_RIGHT_BOUNDARY}`, 'iu');
export const HOURS_AGO_RE = new RegExp(`(?:^|\\s)(\\d{1,3})\\s*(?:ч\\.?|час(?:а|ов)?|год(?:ину|ини)|soat|hours?|hrs?|ore|oră)${UNICODE_RIGHT_BOUNDARY}`, 'iu');
export const DAYS_AGO_RE = new RegExp(`(?:^|\\s)(\\d{1,3})\\s*(?:дн(?:я|ей|і|ів)?|день|days?|kun|zile|zi)${UNICODE_RIGHT_BOUNDARY}`, 'iu');
export const AGO_SUFFIX = '(?:\\s*(?:назад|тому|раніше|oldin|ago|în urmă))';
export const WEEKS_AGO_RE = new RegExp(`(?:^|\\s)(\\d{1,2})\\s*(?:недел(?:ю|и|ь)|тижн(?:ів|і|я)|hafta|weeks?|săptămân\\p{L}*)${AGO_SUFFIX}`, 'iu');
export const MONTHS_AGO_RE = new RegExp(`(?:^|\\s)(\\d{1,2})\\s*(?:мес(?:яц\\p{L}*)?\\.?|міс(?:яц\\p{L}*)?\\.?|oy|months?|lun\\p{L}*)${AGO_SUFFIX}`, 'iu');
export const YEARS_AGO_RE = new RegExp(`(?:^|\\s)(\\d{1,2})\\s*(?:год(?:а|ов)?|лет|рік|рок(?:и|ів)|yil|years?|ani|an)${AGO_SUFFIX}`, 'iu');

export function parseHiringActivityDate(value, now = new Date()) {
  const text = String(value || '');
  if (TODAY_RE.test(text)) return now.toISOString();
  if (YESTERDAY_RE.test(text)) return new Date(now.getTime() - 86_400_000).toISOString();
  const absolute = text.match(/(?<![\p{L}\p{N}])(\d{1,2})\s+([\p{L}]+),?\s+(20\d{2})(?![\p{L}\p{N}])/iu);
  if (absolute) {
    const month = HIRING_MONTHS[absolute[2].toLocaleLowerCase('ru')];
    if (month != null) return new Date(Date.UTC(Number(absolute[3]), month, Number(absolute[1]), 12)).toISOString();
  }
  const dotted = text.match(/(?<![\d])(\d{1,2})[./-](\d{1,2})[./-](20\d{2})(?![\d])/);
  if (dotted) return new Date(Date.UTC(Number(dotted[3]), Number(dotted[2]) - 1, Number(dotted[1]), 12)).toISOString();
  const hours = text.match(HOURS_AGO_RE);
  if (hours) return new Date(now.getTime() - Number(hours[1]) * 3_600_000).toISOString();
  const days = text.match(DAYS_AGO_RE);
  if (days) return new Date(now.getTime() - Number(days[1]) * 86_400_000).toISOString();
  const weeks = text.match(WEEKS_AGO_RE);
  if (weeks) return new Date(now.getTime() - Number(weeks[1]) * 7 * 86_400_000).toISOString();
  const months = text.match(MONTHS_AGO_RE);
  if (months) return new Date(now.getTime() - Number(months[1]) * 30 * 86_400_000).toISOString();
  const years = text.match(YEARS_AGO_RE);
  if (years) return new Date(now.getTime() - Number(years[1]) * 365 * 86_400_000).toISOString();
  return null;
}

export function parseHiringDayMonthDate(value, now = new Date()) {
  const text = String(value || '');
  const match = text.match(new RegExp(`${UNICODE_LEFT_BOUNDARY}(\\d{1,2})\\s+(\\p{L}+)${UNICODE_RIGHT_BOUNDARY}`, 'iu'));
  if (!match) return null;
  const month = HIRING_MONTHS[match[2].toLocaleLowerCase('ru')];
  if (month == null) return null;
  const day = Number(match[1]);
  let time = Date.UTC(now.getUTCFullYear(), month, day, 12);
  if (time > now.getTime() + 48 * 60 * 60 * 1000) time = Date.UTC(now.getUTCFullYear() - 1, month, day, 12);
  return new Date(time).toISOString();
}

const DEADLINE_MARKER_RE = /(?:application\s+deadline|apply\s+by|closing\s+date|deadline|дедлайн|срок(?:\s+подачи)?|термін(?:\s+подання)?)[\s:–—-]{0,8}([^.;\n]{3,55})/iu;
const DEADLINE_DATE_RE = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|янв\p{L}*|фев\p{L}*|мар\p{L}*|апр\p{L}*|ма[йя]|июн\p{L}*|июл\p{L}*|авг\p{L}*|сен\p{L}*|окт\p{L}*|ноя\p{L}*|дек\p{L}*)\.?\s+\d{2,4})\b/iu;

export function extractHiringDeadline(value) {
  const marker = DEADLINE_MARKER_RE.exec(String(value || ''));
  return marker?.[1]?.match(DEADLINE_DATE_RE)?.[0]?.trim() || null;
}
