import type { DegreeLevel } from './hiring-requirements.js';

export type CandidateFeatureCode = 'student' | 'parentalLeave' | 'noExperience' | 'partTime' | 'nightShift' | 'openToRelocation' | 'withPets';
export type HiringScopeCode = 'architecture' | 'leadership' | 'mentoring' | 'scale' | 'ownership';

export function isCandidateNonTargetContext(value: unknown): boolean;
export function extractCandidateTargetContext(value: unknown): string;
export function extractCandidateSkillField(value: unknown): string | null;
export function extractCandidateRoleField(value: unknown): string | null;
export function extractCandidateGoalField(value: unknown): string | null;
export function extractCandidateLocationField(value: unknown): string | null;
export function isCandidateStatusOnly(value: unknown): boolean;
export function isFlexibleCandidateRole(value: unknown): boolean;
export function isCandidateNonRoleValue(value: unknown): boolean;
export function extractCandidateGoalRole(value: unknown): string | null;
export function extractCandidateWorkHistory(value: unknown): string;
export function detectCandidateFeatureCodes(value: unknown): readonly CandidateFeatureCode[];
export function extractCandidateContactHours(value: unknown): string | null;
export function extractCandidateSalaryField(value: unknown): string | null;
export function detectCandidateRelocationPreference(value: unknown): boolean | null;
export function detectCandidateRemotePreference(value: unknown): boolean | null;
export function detectCandidateProfessionLabels(targetValue: unknown, skillValue?: unknown): readonly string[];
export function detectManagementRole(title: unknown, value?: unknown): true | null;
export function detectHiringScopeSignals(value: unknown, options?: { mode?: 'vacancy' | 'candidate' }): readonly HiringScopeCode[];
export function detectDegreeRequirement(value: unknown): Readonly<{
  level?: DegreeLevel;
  field?: string;
  equivalentExperience: boolean;
}>;
