import type { ParseCandidate } from './parser-core.js';
import type { HousingMoneyParseContext, HousingPriceParseResult } from './housing-money.js';
export function extractHousingNumericCandidates(value: unknown, context?: HousingMoneyParseContext): readonly ParseCandidate[];
export function parseHousingV2(value: unknown, context?: HousingMoneyParseContext): Readonly<{ data: Readonly<Record<string, unknown>>; confidence: Readonly<Record<string, number>>; debug: Readonly<{ candidates: readonly ParseCandidate[]; discardedCandidates: readonly ParseCandidate[]; refinersApplied: readonly string[] }> }>;
export function compareHousingParsers(value: unknown, context?: HousingMoneyParseContext): Readonly<{ legacy: Readonly<{ rooms: number | null; floor: number | null; totalFloors: number | null; areas: unknown; price: HousingPriceParseResult }>; v2: ReturnType<typeof parseHousingV2>; differences: readonly string[] }>;
