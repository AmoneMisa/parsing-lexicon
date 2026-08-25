export type ExtendedLanguageContextItem = Readonly<{
  language: string;
  name: string;
  relation: string | null;
  level: string | null;
  cefr: string | null;
  start: number;
  end: number;
}>;

export const LANGUAGE_LEVEL_EXTENSIONS: readonly Readonly<{
  canonical: string;
  aliases: Readonly<Record<string, readonly string[]>>;
}>[];

export function parseExtendedLanguageContext(
  value: unknown,
  options?: { mode?: 'candidate' | 'vacancy' | null },
): readonly ExtendedLanguageContextItem[];
