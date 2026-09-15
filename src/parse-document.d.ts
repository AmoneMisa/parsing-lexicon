import type { ParserToken, ParserSpan, TextRange, normalizeParserText } from './parser-core.js';
import type { NonAddressSpan } from './semantic-spans.js';
export type OffsetMap = ReturnType<typeof normalizeParserText>;
export type Token = ParserToken;
export type TokenSpan = ParserSpan;
export type SemanticSpan = NonAddressSpan;
export type DocumentLine = Readonly<{ index: number; text: string; start: number; end: number; nextStart: number }>;
export type DocumentSection = Readonly<{ section: string; start: number; end: number; contentStart: number; headingRange?: TextRange }>;
export interface ParseDocument {
  readonly original: string;
  readonly normalized: string;
  readonly folded: string;
  readonly offsetMap: OffsetMap;
  readonly tokens: readonly Token[];
  readonly lines: readonly DocumentLine[];
  readonly sections: readonly DocumentSection[];
  readonly semanticSpans: readonly SemanticSpan[];
  getNgrams(size: number): ReadonlySet<string>;
  getTokenSpans(maxTokens?: number): readonly TokenSpan[];
}
export function createParseDocument(value: unknown, options?: { context?: Readonly<Record<string, unknown>>; classifySection?: (line: string) => string | null | undefined }): ParseDocument;
