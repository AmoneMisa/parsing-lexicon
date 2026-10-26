/** Opaque, reusable text-side retrieval index; it is not a matching verdict. */
export interface TextGrams { readonly folded: string; readonly grams: ReadonlySet<string>; readonly shorts: ReadonlySet<string> }
export function computeTextGrams(text: unknown): TextGrams;
export function candidateEntries<T>(entries: readonly T[], text: unknown, grams?: TextGrams | ReadonlySet<string>): T[];
export function matchFirstEntry<T extends { re?: RegExp }>(entries: readonly T[], text: unknown, accept?: (entry: T, matchedText: string) => boolean): T | undefined;
