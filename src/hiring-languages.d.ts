import type { LexiconEntity } from '../index.js';
export type LanguageEntry = LexiconEntity & Readonly<{ name: string }>;
export type LanguageMention = Readonly<{
  language: string; name: string; relation: 'notRequired' | 'preferred' | 'required' | 'candidateHas' | 'mentioned';
  level: string | null; cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null; matched: string; index: number;
}>;
export const LANGUAGES: readonly LanguageEntry[];
export const LANGUAGE_LEVELS: readonly LexiconEntity[];
export const LANGUAGE_CONTEXT_TERMS: Readonly<Record<string, LexiconEntity>>;
export function languageByCode(code: unknown): LanguageEntry | null;
export function parseLanguageMentions(value: unknown, options?: { mode?: 'candidate' | 'vacancy' | null }): LanguageMention[];
