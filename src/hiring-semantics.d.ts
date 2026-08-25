import type { DegreeLevel } from './hiring-requirements.js';

export type CandidateFeatureCode = 'student' | 'parentalLeave' | 'noExperience' | 'partTime' | 'nightShift' | 'openToRelocation';
export type HiringScopeCode = 'architecture' | 'leadership' | 'mentoring' | 'scale' | 'ownership';

export function isCandidateNonTargetContext(value: unknown): boolean;
export function extractCandidateTargetContext(value: unknown): string;
export function extractCandidateSkillField(value: unknown): string | null;
export function extractCandidateGoalRole(value: unknown): string | null;
export function extractCandidateWorkHistory(value: unknown): string;
export function detectCandidateFeatureCodes(value: unknown): readonly CandidateFeatureCode[];
export function extractCandidateContactHours(value: unknown): string | null;
export function extractCandidateSalaryField(value: unknown): string | null;
export function detectCandidateRelocationPreference(value: unknown): boolean | null;
export function detectManagementRole(title: unknown, value?: unknown): true | null;
export function detectHiringScopeSignals(value: unknown, options?: { mode?: 'vacancy' | 'candidate' }): readonly HiringScopeCode[];
export function detectDegreeRequirement(value: unknown): Readonly<{
  level?: DegreeLevel;
  field?: string;
  equivalentExperience: boolean;
}>;
