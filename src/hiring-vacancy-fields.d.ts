export type HiringEducation = 'doctorate' | 'master' | 'bachelor' | 'higher' | 'secondary';
export type HiringApplicationLanguage = 'English' | 'Russian' | 'Ukrainian' | 'Uzbek' | 'Kazakh' | 'Romanian';

export interface HiringAgeRequirement {
  minAge: number | null;
  maxAge: number | null;
}

export function detectHiringEducation(value: unknown): HiringEducation | null;
export function detectApplicationLanguage(value: unknown): HiringApplicationLanguage | null;
export function parseHiringAgeRequirement(value: unknown): HiringAgeRequirement | null;