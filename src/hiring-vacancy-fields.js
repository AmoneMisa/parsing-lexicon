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
  const match = /(?:submit|send|provide)[^.;\n]{0,35}(?:application|resume|résumé|cv)[^.;\n]{0,20}\b(?:in|на)\s+(english|russian|ukrainian|uzbek|kazakh|romanian|английском|русском|украинском|українською|узбекском|казахском|румынском)\b/iu.exec(text);
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
