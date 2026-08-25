export type HiringEducation = 'doctorate' | 'master' | 'bachelor' | 'higher' | 'secondary';
export type HiringApplicationLanguage = 'English' | 'Russian' | 'Ukrainian' | 'Uzbek' | 'Kazakh' | 'Romanian';

export function detectHiringEducation(value: unknown): HiringEducation | null;
export function detectApplicationLanguage(value: unknown): HiringApplicationLanguage | null;
