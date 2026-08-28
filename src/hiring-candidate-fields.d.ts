export type CandidateGender = 'female' | 'male';
export type CandidateContacts = Readonly<{ phone?: string; email?: string; telegram?: string }>;

export function extractCandidateGender(value: unknown): CandidateGender | undefined;
export function extractCandidateName(value: unknown): string;
export function isCandidateNameHidden(value: unknown): boolean;
export function extractCandidateAge(value: unknown, now?: Date): number | null;
export function parseCandidateExperienceValue(value: unknown): number | null;
export function extractCandidateExperienceYears(value: unknown): number | null;
export function extractCandidateContacts(value: unknown, country?: string | null): CandidateContacts;
