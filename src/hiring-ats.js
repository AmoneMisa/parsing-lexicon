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
const TERM_STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'our', 'are', 'will', 'have', 'has', 'who', 'what', 'when', 'where', 'which', 'their', 'they', 'them', 'about', 'within', 'across', 'using', 'including', 'work', 'working', 'team', 'teams', 'role', 'company', 'years', 'year', 'experience', 'skills', 'skill', 'strong', 'good', 'excellent', 'ability', 'knowledge', 'looking', 'required', 'requirements', 'preferred', 'responsibilities', 'opportunity', 'candidate', 'position', 'professional', 'develop', 'development', 'build', 'building', 'software', 'engineer', 'engineering', 'help', 'support', 'ensure', 'provide', 'plus', 'nice', 'must', 'need', 'needs', 'для', 'что', 'как', 'или', 'это', 'мы', 'вы', 'ваш', 'ваша', 'ваши', 'наш', 'наша', 'наши', 'работа', 'работы', 'работать', 'опыт', 'лет', 'года', 'год', 'команда', 'команды', 'знание', 'знания', 'навыки', 'требования', 'обязанности', 'будет', 'нужно', 'необходимо', 'умение', 'разработка', 'разработки', 'позиция', 'кандидат']);

function canonicalSet(values = []) {
  return new Set(values.map((value) => canonicalSkillName(value)).filter(Boolean));
}

function extractTerms(value) {
  const words = String(value || '').toLowerCase().replace(/[’']/g, '').match(/[a-zа-яёіїєґ][a-zа-яёіїєґ0-9+#.-]{2,}/giu) || [];
  return new Set(words.filter((word) => !TERM_STOP_WORDS.has(word) && !/^\d+$/u.test(word)));
}

function coverage(have, wanted) {
  if (!wanted.size) return 0;
  let found = 0;
  for (const value of wanted) if (have.has(value)) found += 1;
  return found / wanted.size;
}

function evidenceFromCv(raw, { fuzzySkills = false } = {}) {
  const evidence = new Map();
  let section = 'other';
  const add = (line, weight) => {
    for (const name of extractSkillNames(line)) evidence.set(name, Math.max(evidence.get(name) || 0, weight));
    if (!fuzzySkills) return;
    for (const match of matchSkillCandidates(line, { fuzzy: true, allowAmbiguousExact: section === 'skills' })) {
      // Fuzzy evidence is deliberately discounted relative to direct canonical
      // or alias evidence in the same section, and never overrides it.
      const score = match.matchType === 'fuzzy' ? weight * Math.min(0.75, match.confidence) : weight;
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
    terms: extractTerms(raw),
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
  const description = String(job?.description || ''); const title = String(job?.title || ''); const tagText = (job?.tags || []).join(' ');
  const buckets = bucketVacancyText(description);
  const titleSkills = new Set(extractSkillNames(title)); const requiredTextSkills = new Set(extractSkillNames(buckets.required));
  const optionalTextSkills = new Set(extractSkillNames(buckets.optional)); const contextTextSkills = new Set(extractSkillNames(buckets.context));
  const noiseSkills = new Set(extractSkillNames(buckets.noise)); const serverRequired = canonicalSet(job?.skills); const serverOptional = canonicalSet(job?.niceToHave);
  const required = new Set([...titleSkills, ...requiredTextSkills]); const optional = new Set(optionalTextSkills); const context = new Set();
  // Server tags can be useful context, but they only become required when the
  // vacancy itself supplies title/requirement evidence. This preserves the
  // established 4 / 1 / .35 evidence architecture.
  for (const skill of serverRequired) {
    if (noiseSkills.has(skill) && !required.has(skill)) continue;
    if (requiredTextSkills.has(skill) || titleSkills.has(skill)) required.add(skill); else context.add(skill);
  }
  for (const skill of serverOptional) {
    if (noiseSkills.has(skill) && !optionalTextSkills.has(skill)) continue;
    optional.add(skill);
  }
  for (const skill of [...extractSkillNames(tagText), ...contextTextSkills]) {
    if (noiseSkills.has(skill) || required.has(skill) || optional.has(skill)) continue;
    context.add(skill);
  }
  for (const skill of required) { optional.delete(skill); context.delete(skill); }
  for (const skill of optional) context.delete(skill);
  let possible = 0; let earned = 0; const matched = []; const missingSkills = [];
  const evidenceFor = (skill) => profile.skillEvidence.get(skill) ?? (profile.skills.has(skill) ? 0.45 : 0);
  for (const [skills, weight, requiredSkill] of [[required, 4, true], [optional, 1, false], [context, .35, false]]) {
    for (const skill of skills) {
      possible += weight; const evidence = evidenceFor(skill);
      if (evidence) { earned += weight * evidence; matched.push(skill); } else if (requiredSkill) missingSkills.push(skill);
    }
  }
  const experience = scoreExperience(profile.experienceYears, job?.experienceMinYears ?? extractRequiredExperienceYears(`${buckets.required} ${description}`) ?? undefined);
  const seniority = scoreSeniority(profile.seniority, detectHiringSeniority(title) || detectHiringSeniority(job?.seniority || '') || undefined);
  const scope = scoreScope(`${title} ${buckets.required} ${description}`, profile.raw);
  const educationRequirement = detectDegreeRequirement(`${buckets.required} ${job?.education || ''}`);
  const education = scoreEducation(profile, educationRequirement);
  const skills = possible ? Math.round(earned / possible * 100) : 60;
  const keywordSource = buckets.required || buckets.optional ? `${buckets.required} ${buckets.optional}` : `${title} ${tagText} ${buckets.context.slice(0, 1800)}`;
  const relevance = extractTerms(keywordSource).size ? Math.round(coverage(profile.terms || extractTerms(profile.raw), extractTerms(keywordSource)) * 100) : 60;
  const breakdown = Object.freeze({ skills, experience: experience.score, seniority: seniority.score, scope: scope.score, education: education.score, relevance });
  let fitScore = Math.round(skills * .30 + experience.score * .20 + seniority.score * .20 + scope.score * .15 + education.score * .10 + relevance * .05);
  // Source-specific ATS ingestion can supply the wording that established a
  // sponsorship policy separately from the rendered description.  It remains
  // input evidence, not consumer-side parsing logic.
  const usText = `${job?.location || ''} ${title} ${description} ${tagText} ${(job?.sponsorshipEvidence || []).join(' ')}`;
  const visaBlocked = (job?.country || '').toUpperCase() === 'US' || detectCountryCodeFromText(usText) === 'US'
    ? profile.requiresUsSponsorship === true && isNoSponsorshipRequirement(usText) : false;
  const blockers = visaBlocked ? [Object.freeze({ code: 'visa_sponsorship', label: 'Visa sponsorship unavailable', critical: true })] : [];
  fitScore = Math.max(0, Math.min(100, fitScore));
  const missing = [...blockers.map((item) => item.label), ...missingSkills, ...scope.missing];
  if (experience.gap > 0) missing.push(`${job?.experienceMinYears ?? extractRequiredExperienceYears(`${buckets.required} ${description}`)}+ years experience`);
  if (seniority.gap > 0) missing.push(`${String(detectHiringSeniority(title) || detectHiringSeniority(job?.seniority || '') || '').replace(/^./u, (letter) => letter.toUpperCase())} seniority`);
  if (education.fieldMismatch && educationRequirement.field === 'computer_science') missing.push('Computer Science / related degree');
  else if (education.levelMismatch && educationRequirement.level) missing.push(`${educationRequirement.level} degree`);
  return Object.freeze({ score: blockers.length ? Math.min(fitScore, 49) : fitScore, fitScore, eligible: !blockers.length, blockers: Object.freeze(blockers), breakdown, matched: Object.freeze([...new Set(matched)].slice(0, 12)), missing: Object.freeze([...new Set(missing.filter(Boolean))].slice(0, 12)) });
}

export function hiringAtsScoreColor(score) { return Number(score) >= 75 ? '#34d399' : Number(score) >= 50 ? '#fbbf24' : '#f87171'; }
