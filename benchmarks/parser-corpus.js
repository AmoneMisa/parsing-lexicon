import { readFileSync } from 'node:fs';
import { parseHousingV2 } from '../src/housing-parser-v2.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';
import { buildHiringAtsProfile, scoreHiringAts } from '../src/hiring-ats.js';
import { bucketVacancyText } from '../src/hiring-requirements.js';
import { extractSkillNames } from '../src/hiring-skills.js';
import { tokenizeParserText } from '../src/parser-core.js';

export const corpus = JSON.parse(readFileSync(new URL('../test/fixtures/parser-baseline.json', import.meta.url), 'utf8'));

// Stable public-behaviour projections. Candidate counts are null where the
// existing API does not expose them; output counts are not candidate counts.
export function runCase(fixture) {
  const { domain, text } = fixture;
  if (domain === 'housing') {
    const result = parseHousingV2(text, fixture.context);
    const values = [];
    for (const key of ['rooms', 'floor', 'totalFloors', 'area.total']) {
      if (result.data[key] !== undefined) values.push(`${key}=${result.data[key]}`);
    }
    for (const key of ['amount', 'currency']) {
      if (result.data.money?.[key] !== undefined) values.push(`money.${key}=${result.data.money[key]}`);
    }
    for (const key of ['minimumRentalDuration', 'fixedRentalDuration']) {
      const period = result.data[key];
      if (period) values.push(`${key}=${period.value}:${period.unit}:${period.bound}`);
    }
    return { values, candidateCount: result.debug.candidates.length };
  }
  if (domain === 'geo') {
    const result = matchCentralAsiaLocationEntities(text, fixture.country, fixture.city);
    return { values: result.matches.map(item => `${item.type}:${item.name}:${item.parent || ''}:${item.role}`), candidateCount: null };
  }
  if (domain === 'vacancies') {
    return { values: Object.entries(bucketVacancyText(text)).flatMap(([bucket, value]) => extractSkillNames(value).map(skill => `${bucket}:${skill}`)), candidateCount: null };
  }
  if (domain === 'CV') return { values: [...buildHiringAtsProfile(text, { fuzzySkills: true }).skills], candidateCount: null };
  if (domain === 'ATS') {
    const result = scoreHiringAts(text, fixture.job, { fuzzySkills: true });
    return { values: [...result.matched.map(skill => `matched:${skill}`), ...result.missing.map(skill => `missing:${skill}`), `skills:${result.breakdown.skills}`, `eligible:${result.eligible}`], candidateCount: null };
  }
  if (domain === 'primitives') return { values: tokenizeParserText(text).map(token => `${token.normalized}@${token.start}:${token.end}`), candidateCount: null };
  throw new Error(`Unknown corpus domain: ${domain}`);
}

export function compareLabels(actual, expected) {
  const found = new Set(actual); const wanted = new Set(expected);
  return {
    truePositives: [...found].filter(value => wanted.has(value)).length,
    falsePositives: [...found].filter(value => !wanted.has(value)),
    falseNegatives: [...wanted].filter(value => !found.has(value)),
  };
}
