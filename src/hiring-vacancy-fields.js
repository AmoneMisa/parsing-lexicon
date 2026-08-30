import { detectDegreeLevel } from './hiring-requirements.js';

export function detectHiringEducation(value) {
  const text = String(value || '');
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

const AGE_MIN = 14;
const AGE_MAX = 90;

function validAge(value) {
  const age = Number(value);
  return Number.isInteger(age) && age >= AGE_MIN && age <= AGE_MAX ? age : null;
}

function ageRange(minRaw, maxRaw) {
  const first = validAge(minRaw);
  const second = validAge(maxRaw);
  if (first == null && second == null) return null;
  if (first != null && second != null) {
    return Object.freeze({ minAge: Math.min(first, second), maxAge: Math.max(first, second) });
  }
  return Object.freeze({ minAge: first, maxAge: second });
}

/**
 * Parse an employer's age requirement, not a candidate's current age.
 *
 * Age ranges are deliberately accepted only with explicit age vocabulary. This
 * keeps arbitrary numeric ranges (salary, work hours, IELTS scores, experience)
 * out of the age field and gives consumers a semantic signal they can use to
 * prevent the same range from being classified as work experience.
 */
export function parseHiringAgeRequirement(value) {
  const text = String(value || '');
  if (!text.trim()) return null;

  const explicitRange = /(?:возраст|вік|age|v[âa]rst(?:ă|a)|yosh(?:i)?|ёш(?:и)?|йош(?:и)?)\s*[:—-]?[^\d\n]{0,24}(?:от|від|from|de\s+la)?\s*(\d{1,2})\s*(?:лет|рок(?:и|ів)?|years?|ani|yosh|ёш|йош)?\s*(?:-|–|—|до|to|gacha|гача)\s*(\d{1,2})(?:\s*(?:лет|рок(?:и|ів)?|years?|ani|yosh|ёш|йош|yoshgacha|ёшгача|йошгача))?/iu.exec(text);
  if (explicitRange) return ageRange(explicitRange[1], explicitRange[2]);

  // Common Uzbek forms put the age noun after the upper bound:
  // "20 yoshdan 35 yoshgacha", and noisy listings sometimes shorten/mistype
  // the first marker ("20 madan 35 yoshgacha"). The final yoshgacha marker is
  // explicit enough to keep this range separate from money/time/experience.
  const uzRange = /(?<!\d)(\d{1,2})\s*(?:yosh(?:dan)?|ёшдан|йошдан|\p{L}{1,8}dan)?\s*(?:-|–|—|dan|дан)?\s*(\d{1,2})\s*(?:yoshgacha|ёшгача|йошгача)(?!\p{L})/iu.exec(text);
  if (uzRange) return ageRange(uzRange[1], uzRange[2]);

  const minOnly = /(?:возраст|вік|age|v[âa]rst(?:ă|a)|yosh(?:i)?|ёш(?:и)?|йош(?:и)?)\s*[:—-]?[^\d\n]{0,20}(?:от|від|from|kamida|камида)\s*(\d{1,2})/iu.exec(text);
  if (minOnly) return ageRange(minOnly[1], null);

  const maxOnly = /(?:(?:возраст|вік|age|v[âa]rst(?:ă|a)|yosh(?:i)?|ёш(?:и)?|йош(?:и)?)\s*[:—-]?[^\d\n]{0,20})?(?:до\s*)?(\d{1,2})\s*(?:yoshgacha|ёшгача|йошгача|(?:лет|years?|ani)\s*(?:максимум|maximum)?)/iu.exec(text);
  if (maxOnly && /(?:возраст|вік|age|yosh|ёш|йош|yoshgacha|ёшгача|йошгача)/iu.test(maxOnly[0])) {
    return ageRange(null, maxOnly[1]);
  }

  return null;
}
