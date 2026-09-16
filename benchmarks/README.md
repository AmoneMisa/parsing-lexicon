# Parser baseline

Run `npm run benchmark:parser` on Node 24 (or another supported version) and
capture stdout as JSON. `BENCH_ITERATIONS` defaults to 30 and controls warm
samples. `baseline-node24.json` records the original master behaviour before
implementation changes; its commit field identifies the code under test.

`test/fixtures/parser-baseline.json` is a synthetic, reviewed regression corpus,
not a production evaluation dataset. `expected` captures existing behaviour.
Where that behaviour is known to be wrong, `gold` records the desired labels and
`knownIssue` explains the difference. Fixes should update `expected` to `gold`
and retain the regression. Do not regenerate expectations from parser output.

The benchmark reports label precision/recall, explicit false positives and
false negatives, first-call latency, warm p50/p95, process memory and observable
candidate counts. Null counts mean the public API does not expose retrieval
candidates. The separate Tashkent street retrieval probes exercise the existing
alias prefilter without a full-country verification scan.

Imports and caches are shared within a run. First-call numbers are not isolated
cold starts. Process memory is not per-parser allocation. Compare runs on the
same runtime and otherwise idle machine; timing values are observations, not
portable CI thresholds. Existing domain regression suites remain authoritative
and are much broader than this initial corpus.

`node benchmarks/parse-document.js` compares previous eager preparation, lazy
creation, first requested token spans, and cached spans on the same text.
`parse-document-node24.json` records Stage 2. Full first-use span generation is
slightly slower in this run; the benefit is avoiding unused work and reusing
computed features, not accelerating the first request for every feature.

## Alias prefilter v2

The Tashkent street retrieval probes are the measurement for the prefilter.
Against the same 4002-entry list on Node 18, before and after alias-level
indexing:

| probe | candidates before | after | p50 before | after |
| --- | --- | --- | --- | --- |
| `улица Шифокорлар` | 145 | 6 | 0.0226 ms | 0.0111 ms |
| `no location words here` | 7 | 0 | 0.0019 ms | 0.0038 ms |
| `Чиланзар 7 квартал` | 35 | 0 | 0.0047 ms | 0.0046 ms |

The two zero-candidate probes are correct, not over-filtering: no *street*
entry matches either text on a full scan, and `test/alias-prefilter-v2.test.js`
asserts full-scan agreement plus an exhaustive per-alias round trip over the
whole list. The seven candidates previously returned for text with no location
vocabulary were the global fallback: entries carrying one short alias used to
be tested against every input.

The unrelated-text probe is slightly slower because a query now also builds the
short-substring sets a short alias needs. That cost is flat in text length and
is repaid many times over by the candidates it removes.
