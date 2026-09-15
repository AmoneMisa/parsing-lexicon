import { performance } from 'node:perf_hooks';
import { createParseDocument, normalizeParserText, tokenizeParserText, generateParserSpans } from '../src/parser-core.js';
const text = 'Experience\nBuilt TypeScript services with PostgreSQL.\n'.repeat(100);
const rounds = 100;
function measure(run) {
  for (let i = 0; i < 5; i++) run();
  const times = [];
  for (let i = 0; i < rounds; i++) { const start = performance.now(); run(); times.push(performance.now() - start); }
  times.sort((a,b) => a-b);
  return { p50Ms: times[49], p95Ms: times[94] };
}
const legacy = measure(() => generateParserSpans(tokenizeParserText(normalizeParserText(text))));
const lazy = measure(() => createParseDocument(text));
const demanded = measure(() => createParseDocument(text).getTokenSpans());
const doc = createParseDocument(text); doc.getTokenSpans();
const reused = measure(() => doc.getTokenSpans());
console.log(JSON.stringify({ node: process.version, characters: text.length, rounds, legacyEager: legacy, lazyCreation: lazy, allFeaturesDemanded: demanded, cachedSpans: reused, memory: process.memoryUsage(), note: 'Same-process timing; memory is shared, not per-variant allocation. Legacy emulates the previous pipeline preparation.' }, null, 2));
