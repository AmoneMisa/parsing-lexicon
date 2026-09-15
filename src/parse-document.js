import { normalizeParserText, tokenizeParserText, generateParserSpans } from './parser-core.js';
import { normalizeForMatch } from './normalization.js';
import { detectNonAddressSpans } from './semantic-spans.js';

const DOCUMENTS = new WeakSet();

function readonlySet(values) {
  const set = new Set(values);
  const view = Object.freeze({
    get size() { return set.size; },
    has: value => set.has(value),
    entries: () => set.entries(), keys: () => set.keys(), values: () => set.values(),
    [Symbol.iterator]: () => set[Symbol.iterator](),
    forEach(callback, thisArg) { set.forEach(value => callback.call(thisArg, value, value, view)); },
  });
  return view;
}

/** One document owns its lazy caches. Offsets always refer to original UTF-16
 * text, never to the search-only folded representation. Domain consumers may
 * supply their existing heading classifier; the core does not infer a domain. */
export function createParseDocument(value, { context = {}, classifySection } = {}) {
  if (value && typeof value === 'object' && DOCUMENTS.has(value)) return value;
  const original = String(value ?? '');
  const semanticContext = Object.freeze({ ...context });
  let normalization, folded, tokens, lines, sections, semanticSpans;
  const ngrams = new Map(); const spans = new Map();
  const normalized = () => normalization ??= normalizeParserText(original);
  const document = Object.freeze({
    original,
    get normalized() { return normalized().normalizedText; },
    get folded() { return folded ??= normalizeForMatch(document.normalized); },
    get offsetMap() { return normalized(); },
    get tokens() { return tokens ??= tokenizeParserText(normalized()); },
    get lines() {
      if (!lines) {
        const result = [];
        for (const match of original.matchAll(/[^\r\n]*(?:\r\n|\r|\n|$)/g)) {
          if (!match[0] && match.index === original.length && original.length) break;
          const text = match[0].replace(/[\r\n]+$/, '');
          result.push(Object.freeze({ index: result.length, text, start: match.index, end: match.index + text.length, nextStart: match.index + match[0].length }));
        }
        lines = Object.freeze(result);
      }
      return lines;
    },
    get sections() {
      if (!sections) {
        const result = []; let active = { section: 'other', start: 0, end: original.length, contentStart: 0 };
        for (const line of document.lines) {
          const section = classifySection?.(line.text);
          if (!section) continue;
          if (line.start > active.start) result.push(Object.freeze({ ...active, end: line.start }));
          active = { section, start: line.start, end: original.length, contentStart: line.nextStart, headingRange: Object.freeze({ start: line.start, end: line.end }) };
        }
        result.push(Object.freeze(active));
        sections = Object.freeze(result);
      }
      return sections;
    },
    get semanticSpans() { return semanticSpans ??= detectNonAddressSpans(original, semanticContext); },
    getNgrams(size) {
      if (!Number.isInteger(size) || size < 1 || size > 16) throw new RangeError('Ngram size must be an integer from 1 to 16');
      if (!ngrams.has(size)) {
        const values = [];
        for (let i = 0; i + size <= document.folded.length; i++) values.push(document.folded.slice(i, i + size));
        ngrams.set(size, readonlySet(values));
      }
      return ngrams.get(size);
    },
    getTokenSpans(maxTokens = 4) {
      const limit = Math.max(1, Math.min(8, Number(maxTokens) || 4));
      if (!spans.has(limit)) spans.set(limit, generateParserSpans(document.tokens, { maxTokens: limit }));
      return spans.get(limit);
    },
  });
  DOCUMENTS.add(document);
  return document;
}
