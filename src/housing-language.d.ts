export type HousingTextLanguage = 'ru' | 'uk' | 'en' | 'uz';

export function housingTextIsInLanguage(value: unknown, language: string): boolean;
export function detectHousingTextLanguage(value: unknown): HousingTextLanguage | null;
