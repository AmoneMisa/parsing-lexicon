import { detectDegreeLevel } from './hiring-requirements.js';
import { normalizeUnicode } from './normalization.js';

export function detectHiringEducation(value) {
  const text = String(value || '');
  // Vacancy requirements often state "Bachelor's or Master's degree". That is
  // an accepted-alternative list, not a Master's minimum; expose the least
  // restrictive accepted level so filters do not hide valid Bachelor holders.
  if (/(?:bachelor['’]?s?|бакалавр\p{L}*)[^.;\n]{0,40}(?:or|\/|или|або|sau|yoki)[^.;\n]{0,40}(?:master['’]?s?|магистр\p{L}*|магістр\p{L}*)/iu.test(text)
    || /(?:master['’]?s?|магистр\p{L}*|магістр\p{L}*)[^.;\n]{0,40}(?:or|\/|или|або|sau|yoki)[^.;\n]{0,40}(?:bachelor['’]?s?|бакалавр\p{L}*)/iu.test(text)) return 'bachelor';

  const degree = detectDegreeLevel(text);
  if (degree) return degree;
  if (/higher education|высшее образование|вища освіта|олий маълумот/iu.test(text)) return 'higher';
  return null;
}

export function detectApplicationLanguage(value) {
  const text = String(value || '');
  const match = /(?:submit|send|provide|отправ\p{L}*|пришл\p{L}*|направ\p{L}*|подай\p{L}*|надішл\p{L}*)[^.;\n]{0,35}(?:application|resume|résumé|cv|резюме)[^.;\n]{0,20}[^\p{L}\p{N}](?:in|на|у|в)\s+(english|russian|ukrainian|uzbek|kazakh|romanian|английском|русском|украинском|українською|українській|узбекском|казахском|румынском)(?![\p{L}\p{N}])/iu.exec(text);
  if (!match?.[1]) return null;
  const language = match[1].toLowerCase();
  if (/english|англий/.test(language)) return 'English';
  if (/russian|русск/.test(language)) return 'Russian';
  if (/ukrain|укра/.test(language)) return 'Ukrainian';
  if (/uzbek|узбек/.test(language)) return 'Uzbek';
  if (/kazakh|казах/.test(language)) return 'Kazakh';
  if (/romanian|румын/.test(language)) return 'Romanian';
  return null;
}

function validAge(value) {
  const age = Number(value);
  return Number.isFinite(age) && age >= 14 && age <= 90 ? age : null;
}

/** Extract an explicit vacancy candidate-age requirement without confusing it with experience. */
export function extractHiringAgeRange(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return null;

  const patterns = [
    // Russian/Ukrainian/Romanian/English labels: "Возраст от 18 до 35 лет".
    /(?:возраст|вік|age|vârsta|varsta)\s*[:—-]?[^\d]{0,18}(?:от|від|from|de\s+la)?\s*(\d{1,2})\s*(?:[-–—]|до|to|până\s+la|pana\s+la)\s*(\d{1,2})(?:\s*(?:лет|рок\p{L}*|years?|ani))?/iu,
    // Uzbek Latin/Cyrillic: "18 dan 40 yoshgacha", including common "20 madan" typo.
    /(?:^|[^\d])(\d{1,2})\s*(?:yosh(?:dan)?|ёш(?:дан)?|dan|дан|madan)?\s*(?:[-–—]|dan\s+|дан\s+)?(?:to|до)?\s*(\d{1,2})\s*(?:yoshgacha|ёшгача|yoshga\s+qadar|ёшга\s+қадар)(?=$|[^\p{L}\p{N}_])/iu,
    /(?:yosh|ёш)\s*[:—-]?[^\d]{0,18}(\d{1,2})\s*(?:[-–—]|dan\s+|дан\s+|gacha\s+|гача\s+)(\d{1,2})/iu,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const first = validAge(match[1]);
    const second = validAge(match[2]);
    if (first == null || second == null) continue;
    return Object.freeze({ min: Math.min(first, second), max: Math.max(first, second) });
  }

  const minMatch = text.match(/(?:возраст|вік|age|yosh|ёш)\s*[:—-]?[^\d]{0,16}(?:от|від|from|kamida|камида)?\s*(\d{1,2})\s*\+?(?:\s*(?:лет|рок\p{L}*|years?|yosh|ёш))?/iu);
  const minimum = validAge(minMatch?.[1]);
  if (minimum != null) return Object.freeze({ min: minimum, max: null });

  const uzMax = text.match(/(?:^|[^\d])(\d{1,2})\s*(?:yoshgacha|ёшгача)(?=$|[^\p{L}\p{N}_])/iu);
  const maximum = validAge(uzMax?.[1]);
  return maximum != null ? Object.freeze({ min: null, max: maximum }) : null;
}
