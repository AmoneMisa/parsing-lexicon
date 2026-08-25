export interface ExtendedProfessionMatch {
  canonical: string;
  group: string;
  family: string;
  score: number;
  strength: 'strong' | 'weak';
  matched: string;
  index: number;
  label: string;
}

export interface SourceProfessionAlias {
  canonical: string;
  label: string;
  group: string;
  aliases: readonly string[];
  re: RegExp;
}

export const SOURCE_PROFESSION_ALIASES: readonly SourceProfessionAlias[];
export const SOURCE_CANDIDATE_INTENT_ALIASES: readonly string[];
export function matchesSourceCandidateIntent(value: unknown): boolean;
export function professionDisplayLabel(canonical: string): string;
export function matchExtendedProfessions(value: unknown, options?: { limit?: number; allowWeak?: boolean }): readonly ExtendedProfessionMatch[];
