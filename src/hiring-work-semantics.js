import { aliasesOf, aliasesToRegex, findCanonical } from './normalization.js';
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_REQUIREMENTS,
  PROBATION_TERMS,
  SCHEDULE_TERMS,
  WORK_MODES,
} from './hiring.js';
import { parseExperience, WORK_SCHEDULE_EXTENSIONS } from './hiring-advanced.js';

const EMPLOYMENT_OUTPUT = Object.freeze({
  fullTime: 'full_time',
  partTime: 'part_time',
  contract: 'contract',
  project: 'project',
  freelance: 'freelance',
  temporary: 'temporary',
  internship: 'internship',
  volunteer: 'volunteer',
  seasonal: 'seasonal',
});

const PROBATION_MATCH_ORDER = Object.freeze([
  PROBATION_TERMS.paid,
  PROBATION_TERMS.unpaid,
  PROBATION_TERMS.noProbation,
  PROBATION_TERMS.probation,
]);

function matchesEmploymentType(text, entry) {
  // `project` is a useful canonical output but a dangerously generic input:
  // ordinary vacancy prose says "projects", "Project Tech Stack" and
  // "international projects" without describing project-based employment.
  // Its multilingual aliases already encode the actual employment semantics
  // ("project work", "project-based", "проектная работа", etc.), so only
  // those aliases are accepted for this one canonical.
  if (entry.canonical === 'project') {
    const aliases = aliasesOf(entry);
    return aliases.length ? aliasesToRegex(aliases).test(text) : false;
  }
  return Boolean(findCanonical(text, [entry], { partial: true }));
}

function collectCanonical(text, entries) {
  const values = [];
  for (const entry of entries) {
    if (!matchesEmploymentType(text, entry)) continue;
    if (!values.includes(entry.canonical)) values.push(entry.canonical);
  }
  return values;
}

export function detectEmploymentTypes(value) {
  return Object.freeze(
    collectCanonical(String(value || ''), EMPLOYMENT_TYPES)
      .map((canonical) => EMPLOYMENT_OUTPUT[canonical])
      .filter(Boolean),
  );
}

export function detectWorkModes(value) {
  return Object.freeze(collectCanonical(String(value || ''), WORK_MODES));
}

export function detectWorkSchedules(value) {
  return Object.freeze(collectCanonical(String(value || ''), [...SCHEDULE_TERMS, ...WORK_SCHEDULE_EXTENSIONS]));
}

export function detectProbation(value) {
  const text = String(value || '');
  for (const entry of PROBATION_MATCH_ORDER) {
    if (findCanonical(text, [entry], { partial: true })) return entry.canonical;
  }
  return null;
}

export function detectExperienceRequirement(value) {
  const text = String(value || '');
  const parsed = parseExperience(text);
  if (parsed?.requirement === 'none') return 'noExperience';
  if (parsed?.requirement === 'required') return 'experienceRequired';
  for (const entry of Object.values(EXPERIENCE_REQUIREMENTS)) {
    if (findCanonical(text, [entry], { partial: true })) return entry.canonical;
  }
  return null;
}
