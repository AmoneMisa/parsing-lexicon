import { findCanonical } from './normalization.js';
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_REQUIREMENTS,
  PROBATION_TERMS,
  SCHEDULE_TERMS,
  WORK_MODES,
} from './hiring.js';
import { WORK_SCHEDULE_EXTENSIONS } from './hiring-advanced.js';
import { parseExperience } from './hiring-context.js';

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

function collectCanonical(text, entries) {
  const values = [];
  for (const entry of entries) {
    if (!findCanonical(text, [entry], { partial: true })) continue;
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
  for (const entry of Object.values(PROBATION_TERMS)) {
    if (findCanonical(text, [entry], { partial: true })) return entry.canonical;
  }
  return null;
}

export function detectExperienceRequirement(value) {
  const parsed = parseExperience(String(value || ''));
  if (parsed?.requirement === 'none') return 'noExperience';
  if (parsed?.requirement === 'required') return 'experienceRequired';
  for (const entry of Object.values(EXPERIENCE_REQUIREMENTS)) {
    if (findCanonical(value, [entry], { partial: true })) return entry.canonical;
  }
  return null;
}
