import {
  LOCATION_DICTIONARIES, UA_EXTRA_LOCATION_DICTIONARIES,
  parseHousingAudience, parseHousingListingEnrichment, parseHiringSalaryWithContext,
} from '@whiteslove/parsing-lexicon';
import { parseHousingAudience as structuredAudience } from '@whiteslove/parsing-lexicon/housing-listing-enrichment';
import { canonicalCity } from '@whiteslove/parsing-lexicon/geography';
import { candidateEntries, computeTextGrams, matchFirstEntry } from '@whiteslove/parsing-lexicon/alias-prefilter';
import { scoreCityHypotheses } from '@whiteslove/parsing-lexicon/city-hypotheses';
import { extractMicroGrammarCandidates } from '@whiteslove/parsing-lexicon/micro-grammars';
import { fitLogisticWeights, ledgerFeatures } from '@whiteslove/parsing-lexicon/resolver-weights';

const audience: 'family' | 'women' | 'men' | null = parseHousingAudience('для семьи');
const alternatives: readonly string[] = structuredAudience('для студентов').alternatives;
const city: string | null = canonicalCity('Ташкент', 'UZ');
const cities: typeof LOCATION_DICTIONARIES.UA = UA_EXTRA_LOCATION_DICTIONARIES;
const entries = [{ id: 1, aliases: ['test'], re: /test/ }];
const candidates: typeof entries = candidateEntries(entries, 'test', computeTextGrams('test'));
const first: (typeof entries)[number] | undefined = matchFirstEntry(entries, 'test', entry => entry.id === 1);
const hypothesis: string | null = scoreCityHypotheses([{ city: 'Tashkent', matches: [{ name: 'Minor' }] }]).city;
const micro = extractMicroGrammarCandidates('2/5', { domain: 'housing' });
const fit = fitLogisticWeights([{ features: ledgerFeatures(micro[0]?.ledger), label: true }]);

// Incompatible contracts must keep failing rather than degrade to `any`.
// @ts-expect-error Root audience is the legacy scalar, not the enrichment object.
parseHousingAudience('family').alternatives;
// @ts-expect-error Candidates retain the caller's entry type.
candidates[0]?.nonexistent;

void [audience, alternatives, city, cities, candidates, first, hypothesis, fit,
  parseHousingListingEnrichment('сдам квартиру'), parseHiringSalaryWithContext('salary $1000')];
