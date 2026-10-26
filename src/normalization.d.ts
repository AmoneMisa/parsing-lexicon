export {
  aliasesOf,
  aliasesToRegex,
  assertValidLexicon,
  buildAliasIndex,
  collectAliasCollisions,
  escapeRegex,
  findAllCanonical,
  findCanonical,
  foldCyrillicForSearch,
  getAliasIndex,
  getAliasOwnersIndex,
  normalizeForMatch,
  normalizeUnicode,
  normalizedAliasKeys,
  stripSettlementPrefix,
  validateAliasCollisions,
  validateLexicon,
} from '../index.js';
import type { AliasMap } from '../index.js';
export const CYRILLIC_SEARCH_MAP: Readonly<Record<string, string>>;
export function findCanonicalCandidates<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { partial?: boolean; transliteration?: boolean }): T[];
