import { detectCountryCodeFromText } from './geography-detection.js';
import {
  SENIORITY_RANK, bucketVacancyText, classifyCvSectionHeading, detectDegreeFields,
  detectDegreeLevel, detectHiringSeniority, extractCvExperienceYears,
  extractRequiredExperienceYears, isNoSponsorshipRequirement, requiresUsSponsorship,
} from './hiring-requirements.js';
import { detectDegreeRequirement, detectHiringScopeSignals } from './hiring-semantics.js';
import { canonicalSkillName, extractSkillNames, matchSkillCandidates } from './hiring-skills.js';

const SECTION_WEIGHT = Object.freeze({ experience: 1, projects: 0.7, profile: 0.55, skills: 0.4, education: 0.35, other: 0.45 });
const DEGREE_RANK = Object.freeze({ secondary: 0, bachelor: 1, master: 2, doctorate: 3 });
const SCOPE_LABELS = Object.freeze({ architecture: 'Architecture / system design', leadership: 'Technical leadership', mentoring: 'Mentoring engineers', scale: 'Large-scale systems', ownership: 'Product / feature ownership' });

function canonicalSet(values = []) {
  return new Set(values.map((value) => canonicalSkillName(value)).filter(Boolean));
}

function evidenceFromCv(raw, { fuzzySkills = false } = {}) {
  const evidence = new Map();
  let section = 'other';
  const add = (line, weight) => {
    for (const name of extractSkillNames(line)) evidence.set(name, Math.max(evidence.get(name) || 0, weight));
    if (!fuzzySkills) return;
    for (const match of matchSkillCandidates(line, { fuzzy: true })) {
      // Fuzzy evidence is deliberately discounted relative to a direct skills
      // hit in the same section, and never overrides it.
      const score = weight * Math.min(0.75, match.confidence);
      evidence.set(match.canonical, Math.max(evidence.get(match.canonical) || 0, score));
    }
  };
  for (const line of String(raw || '').replace(/\r/g, '').split('\n')) {
    const heading = classifyCvSectionHeading(line.trim());
    if (heading) { section = heading; continue; }
    if (line.trim()) add(line, SECTION_WEIGHT[section]);
  }
  return evidence;
}

export function buildHiringAtsProfile(cvText, options = {}) {
  const raw = String(cvText || '');
  const skillEvidence = evidenceFromCv(raw, options);
  return Object.freeze({
    raw,
    skills: new Set(skillEvidence.keys()), skillEvidence,
    experienceYears: extractCvExperienceYears(raw, options.referenceDate) ?? undefined,
    seniority: detectHiringSeniority(raw) || undefined,
    degreeLevel: detectDegreeLevel(raw) || undefined,
    degreeFields: new Set(detectDegreeFields(raw)),
    requiresUsSponsorship: requiresUsSponsorship(raw) ?? undefined,
  });
}

function scoreSeniority(candidate, required) {
  if (!required) return { score: 100, gap: 0 };
  if (!candidate) return { score: 45, gap: 1 };
  const gap = SENIORITY_RANK[required] - SENIORITY_RANK[candidate];
  return { score: gap <= 0 ? 100 : gap === 1 ? 65 : gap === 2 ? 30 : 10, gap };
}
function scoreExperience(candidate, required) {
  if (required === undefined) return { score: 100, gap: 0 };
  if (candidate === undefined) return { score: 35, gap: required };
  if (candidate >= required) return { score: 100, gap: 0 };
  const ratio = candidate / required;
  return { score: ratio >= .85 ? 75 : ratio >= .7 ? 55 : ratio >= .5 ? 35 : 15, gap: Math.max(0, required - candidate) };
}
function scoreScope(jobText, cvText) {
  const required = detectHiringScopeSignals(jobText, { mode: 'vacancy' });
  if (!required.length) return { score: 100, missing: [], requiredCount: 0 };
  const have = new Set(detectHiringScopeSignals(cvText, { mode: 'candidate' }));
  const missing = required.filter((code) => !have.has(code)).map((code) => SCOPE_LABELS[code] || code);
  return { score: Math.round((1 - missing.length / required.length) * 100), missing, requiredCount: required.length };
}
function scoreEducation(profile, requirement) {
  if (!requirement.level && !requirement.field) return { score: 100, fieldMismatch: false, levelMismatch: false };
  const levelMismatch = requirement.level && (DEGREE_RANK[profile.degreeLevel] ?? -1) < DEGREE_RANK[requirement.level];
  const fieldMismatch = requirement.field && !profile.degreeFields.has(requirement.field) && !(requirement.field === 'computer_science' && profile.degreeFields.has('engineering'));
  if (levelMismatch) return { score: requirement.equivalentExperience ? 45 : 10, fieldMismatch: Boolean(fieldMismatch), levelMismatch: true };
  if (fieldMismatch) return { score: requirement.equivalentExperience ? 60 : 35, fieldMismatch: true, levelMismatch: false };
  return { score: 100, fieldMismatch: false, levelMismatch: false };
}

/** Portable, explainable ATS scoring; no browser, transport, or UI concerns. */
export function scoreHiringAts(profileOrCv, job, options = {}) {
  const profile = typeof profileOrCv === 'string' ? buildHiringAtsProfile(profileOrCv, options) : profileOrCv;
  const description = String(job?.description || ''); const title = String(job?.title || '');
  const buckets = bucketVacancyText(description);
  const required = new Set([...extractSkillNames(title), ...extractSkillNames(buckets.required), ...canonicalSet(job?.skills)]);
  const optional = new Set([...extractSkillNames(buckets.optional), ...canonicalSet(job?.niceToHave)]);
  for (const skill of required) optional.delete(skill);
  let possible = 0; let earned = 0; const matched = []; const missing = [];
  for (const [skills, weight] of [[required, 4], [optional, 1], [new Set(extractSkillNames(buckets.context)), .35]]) {
    for (const skill of skills) {
      if (required.has(skill) && skills !== required || optional.has(skill) && skills !== optional) continue;
      possible += weight; const evidence = profile.skillEvidence.get(skill) || 0;
      if (evidence) { earned += weight * evidence; matched.push(skill); } else if (skills === required) missing.push(skill);
    }
  }
  const experience = scoreExperience(profile.experienceYears, job?.experienceMinYears ?? extractRequiredExperienceYears(`${buckets.required} ${description}`) ?? undefined);
  const seniority = scoreSeniority(profile.seniority, detectHiringSeniority(title) || detectHiringSeniority(job?.seniority || '') || undefined);
  const scope = scoreScope(`${title} ${buckets.required} ${description}`, profile.raw);
  const educationRequirement = detectDegreeRequirement(`${buckets.required} ${job?.education || ''}`);
  const education = scoreEducation(profile, educationRequirement);
  const skills = possible ? Math.round(earned / possible * 100) : 60;
  const breakdown = Object.freeze({ skills, experience: experience.score, seniority: seniority.score, scope: scope.score, education: education.score, relevance: 60 });
  let fitScore = Math.round(skills * .30 + experience.score * .20 + seniority.score * .20 + scope.score * .15 + education.score * .10 + 3);
  const usText = `${job?.location || ''} ${title} ${description}`;
  const visaBlocked = (job?.country || '').toUpperCase() === 'US' || detectCountryCodeFromText(usText) === 'US'
    ? profile.requiresUsSponsorship === true && isNoSponsorshipRequirement(usText) : false;
  const blockers = visaBlocked ? [Object.freeze({ code: 'visa_sponsorship', label: 'Visa sponsorship unavailable', critical: true })] : [];
  fitScore = Math.max(0, Math.min(100, fitScore));
  return Object.freeze({ score: blockers.length ? Math.min(fitScore, 49) : fitScore, fitScore, eligible: !blockers.length, blockers: Object.freeze(blockers), breakdown, matched: Object.freeze([...new Set(matched)].slice(0, 12)), missing: Object.freeze([...new Set([...missing, ...scope.missing])].slice(0, 12)) });
}

export function hiringAtsScoreColor(score) { return Number(score) >= 75 ? '#34d399' : Number(score) >= 50 ? '#fbbf24' : '#f87171'; }
