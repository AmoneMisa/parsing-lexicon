import type { SalaryParseResult } from '../index.d.ts';

export type CandidateExperienceMention = Readonly<{ years: number; context: string; approximate?: true }>;
export type VisaSponsorshipWording = 'offered' | 'notOffered' | null;

export function extractCandidateStructuredField(value: unknown, key: string, maxLength?: number): string | null;
export function extractJobStructuredField(value: unknown, key: string, maxLength?: number): string | null;
export function extractCandidateDisplayName(value: unknown): string;
export function extractCandidateExperienceMentions(value: unknown): readonly CandidateExperienceMention[];
export function parseHiringSourceSalary(value: unknown): SalaryParseResult | null;
export function parseCandidateSalary(value: unknown, country?: string): SalaryParseResult | null;
export function detectUsLocation(value: unknown): boolean;
export function detectVisaSponsorshipWording(value: unknown): VisaSponsorshipWording;
export const TEMPORARY_WORK_AUTH_RE: RegExp;
export function detectRecruitmentAgency(value: unknown): boolean;
export function extractNiceToHaveContext(value: unknown, maxLength?: number): string;
export type CandidatePostSignals = Readonly<{
  candidateForm: boolean;
  cvMarker: boolean;
  firstPerson: boolean;
  personalProfile: boolean;
  contact: boolean;
  emptyRecommendation: boolean;
  sectionCount: number;
}>;
export function detectCandidatePostSignals(value: unknown): CandidatePostSignals;
export function extractCandidateStructuredBlock(value: unknown, key: string, maxLength?: number): string | null;
export function defaultHiringCurrency(country: unknown): string | null;
export function isHiringCharityAppeal(value: unknown): boolean;
export function isHiringRecruitingOpportunity(value: unknown): boolean;
export function sameHiringProfessionFamily(a: unknown, b: unknown): boolean;
