import { HIRING_MONTHS } from './hiring-temporal.js';
import { detectCvSections } from './cv-sections.js';
import { extractSkillNames } from './hiring-skills.js';
import { matchProfession } from './hiring-professions.js';
import { escapeRegex } from './normalization.js';

/** Structured employment chronology for CVs. This is not another date parser:
 * month vocabulary comes from `hiring-temporal`, section spans from
 * `cv-sections`, skills from `hiring-skills` and roles from
 * `hiring-professions`. What is new here is pairing two dates into a period,
 * attaching the employer and role that introduced it, and keeping the source
 * range so a caller can point back at the text. */

const MONTH_SRC = Object.keys(HIRING_MONTHS).sort((a, b) => b.length - a.length).map(escapeRegex).join('|');
const YEAR_SRC = '(?:19|20)\\d{2}';
// Longest alternative first, and the trailing digit guard on DATE_SRC below:
// without both, "2021-12" matches as "2021-1" and silently loses 11 months.
const MONTH_NUMBER_SRC = '(?:1[0-2]|0?[1-9])';
const PRESENT_SRC = '(?:present|current|now|to date|ongoing|по\\s+настоящее\\s+время|настоящее\\s+время|наст\\.?\\s*время|н\\.\\s*в\\.|по\\s+сей\\s+день|сейчас|теперь|донині|до\\s+тепер|дотепер|теперішній\\s+час|зараз|hozirgi\\s+kunga\\s+qadar|hozirgacha|hozir|ҳозирги\\s+кунгача|ҳозиргача|ҳозир|қазірге\\s+дейін|қазір|осы\\s+күнге\\s+дейін|în\\s+prezent|in\\s+prezent|prezent|pân[ăa]\\s+în\\s+prezent)';
/** Written longest-first so "March 2019" is never truncated to "2019". */
const DATE_SRC = `(?:(?:${MONTH_SRC})\\.?\\s+${YEAR_SRC}|${YEAR_SRC}\\s*[-/.]\\s*${MONTH_NUMBER_SRC}|${MONTH_NUMBER_SRC}\\s*[/.]\\s*${YEAR_SRC}|${YEAR_SRC})(?!\\d)`;
const SEPARATOR_SRC = '(?:\\s*(?:[-–—]|\\.{2,})\\s*|\\s+(?:to|till|until|по|до|gacha|pân[ăa]|pana)\\s+)';

const RANGE_RE = new RegExp(`(${DATE_SRC})${SEPARATOR_SRC}(${DATE_SRC}|${PRESENT_SRC})`, 'giu');
const MONTH_YEAR_RE = new RegExp(`^(${MONTH_SRC})\\.?\\s+(${YEAR_SRC})$`, 'iu');
const YEAR_MONTH_RE = new RegExp(`^(${YEAR_SRC})\\s*[-/.]\\s*(${MONTH_NUMBER_SRC})$`, 'iu');
const MONTH_SLASH_YEAR_RE = new RegExp(`^(${MONTH_NUMBER_SRC})\\s*[/.]\\s*(${YEAR_SRC})$`, 'iu');
const YEAR_ONLY_RE = new RegExp(`^(${YEAR_SRC})$`, 'iu');
const PRESENT_RE = new RegExp(`^${PRESENT_SRC}$`, 'iu');
/** Employer and role sit on the same line as the dates, separated by commas,
 * pipes, bullets or a spaced dash. "at"/"в" join a role to its employer. */
const ENTRY_SPLIT_RE = /\s*(?:[,|•·;]|\s[—–-]\s|\s+(?:at|@|in|в|у|da)\s+)\s*/iu;
const COMPANY_MARKER_RE = /\b(?:llc|ltd|inc|gmbh|corp|corporation|company|co|plc|ag|sa|srl|bv|oy|ab|as|llp|studio|labs?|group|holding|bank|university|ооо|зао|оао|пао|ип|тоо|ао|мчж|mchj|xk|аж|жшс)\b\.?|["«»“”]/iu;

const monthIndex = (year, month) => year * 12 + Math.max(1, Math.min(12, month)) - 1;
const parsedDate = (year, month, precision) => Object.freeze(month === undefined ? { year, precision } : { year, month, precision });

/** A ParsedDate records what the text actually said. "2019" is year precision;
 * inventing a month for it would fabricate detail the CV never gave. */
export function parseEmploymentDate(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  let match = MONTH_YEAR_RE.exec(text);
  if (match) return parsedDate(Number(match[2]), HIRING_MONTHS[match[1].toLowerCase()] + 1, 'month');
  match = YEAR_MONTH_RE.exec(text);
  if (match) return parsedDate(Number(match[1]), Number(match[2]), 'month');
  match = MONTH_SLASH_YEAR_RE.exec(text);
  if (match) return parsedDate(Number(match[2]), Number(match[1]), 'month');
  match = YEAR_ONLY_RE.exec(text);
  if (match) return parsedDate(Number(match[1]), undefined, 'year');
  return null;
}

const startIndexOf = date => monthIndex(date.year, date.month ?? 1);
const endIndexOf = date => monthIndex(date.year, date.month ?? 12);

/** Date ranges with their offsets in `text`. Shared by the period builder and
 * by the legacy total-years helper, so both read the same chronology. */
export function findEmploymentRanges(value, options = {}) {
  const text = String(value ?? '');
  const reference = options.referenceDate ?? new Date();
  const ranges = [];
  RANGE_RE.lastIndex = 0;
  for (const match of text.matchAll(RANGE_RE)) {
    const start = parseEmploymentDate(match[1]);
    if (!start) continue;
    const ongoing = PRESENT_RE.test(match[2].trim());
    const end = ongoing ? parsedDate(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 'month') : parseEmploymentDate(match[2]);
    if (!end) continue;
    const startIndex = startIndexOf(start);
    const endIndex = ongoing ? monthIndex(end.year, end.month) : endIndexOf(end);
    if (endIndex < startIndex || endIndex - startIndex > 12 * 50) continue;
    ranges.push(Object.freeze({ start, end, ongoing, startIndex, endIndex, durationMonths: endIndex - startIndex + 1, raw: match[0], range: Object.freeze({ start: match.index, end: match.index + match[0].length }) }));
  }
  return Object.freeze(ranges);
}

function labelsFrom(line, rangeText) {
  const remainder = line.replace(rangeText, ' ');
  const segments = remainder.split(ENTRY_SPLIT_RE).map(part => part.replace(/^[\s\-–—:|()]+|[\s\-–—:|()]+$/gu, '')).filter(part => part.length > 1);
  let role, company;
  for (const segment of segments) {
    const isRole = Boolean(matchProfession(segment));
    if (isRole && role === undefined) { role = segment; continue; }
    if (!isRole && company === undefined && COMPANY_MARKER_RE.test(segment)) { company = segment; continue; }
  }
  for (const segment of segments) {
    if (segment === role || segment === company) continue;
    if (company === undefined) company = segment;
    else if (role === undefined) role = segment;
  }
  return { role, company };
}

/** One period per employment entry: the line carrying the dates plus the lines
 * under it, which is where that entry's skills live. */
export function parseCvEmploymentPeriods(value, options = {}) {
  const text = String(value ?? '');
  const wanted = options.sections ?? ['experience', 'projects'];
  const spans = detectCvSections(text).filter(span => wanted.includes(span.section));
  const scopes = spans.length ? spans.map(span => ({ start: span.contentStart, end: span.end, section: span.section })) : [{ start: 0, end: text.length, section: undefined }];
  const periods = [];
  for (const scope of scopes) {
    const body = text.slice(scope.start, scope.end);
    const found = findEmploymentRanges(body, options);
    if (!found.length) continue;
    const lines = [];
    let offset = 0;
    for (const raw of body.split('\n')) { lines.push({ start: offset, end: offset + raw.replace(/\r$/, '').length, text: raw.trim() }); offset += raw.length + 1; }
    const headers = found.map(range => ({ range, line: lines.find(line => range.range.start >= line.start && range.range.start <= line.end) ?? lines[0] }));
    headers.forEach((header, index) => {
      const next = headers.slice(index + 1).find(other => other.line.start > header.line.start);
      const entryEnd = next ? next.line.start : scope.end - scope.start;
      const { role, company } = labelsFrom(header.line.text, header.range.raw);
      periods.push(Object.freeze({
        company, role, section: scope.section,
        start: header.range.start, end: header.range.end, ongoing: header.range.ongoing,
        durationMonths: header.range.durationMonths,
        sectionRange: Object.freeze({ start: scope.start + header.line.start, end: scope.start + entryEnd }),
        skills: Object.freeze([...new Set(extractSkillNames(body.slice(header.line.start, entryEnd)))]),
        startIndex: header.range.startIndex, endIndex: header.range.endIndex,
      }));
    });
  }
  return Object.freeze(periods);
}

/** Overlapping or adjacent periods collapse into one interval. Concurrent jobs
 * must not be counted twice, so this merges across employers and keeps every
 * contributing company name. */
export function mergeEmploymentPeriods(periods) {
  const ordered = [...periods].sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
  const merged = [];
  for (const period of ordered) {
    const last = merged[merged.length - 1];
    if (last && period.startIndex <= last.endIndex + 1) {
      last.endIndex = Math.max(last.endIndex, period.endIndex);
      last.ongoing ||= period.ongoing;
      if (period.company) last.companies.add(period.company);
      continue;
    }
    merged.push({ startIndex: period.startIndex, endIndex: period.endIndex, ongoing: period.ongoing, companies: new Set(period.company ? [period.company] : []) });
  }
  return Object.freeze(merged.map(entry => Object.freeze({
    startIndex: entry.startIndex, endIndex: entry.endIndex, ongoing: entry.ongoing,
    durationMonths: entry.endIndex - entry.startIndex + 1,
    companies: Object.freeze([...entry.companies]),
  })));
}

export function totalEmploymentMonths(periods) {
  return mergeEmploymentPeriods(periods).reduce((sum, entry) => sum + entry.durationMonths, 0);
}
