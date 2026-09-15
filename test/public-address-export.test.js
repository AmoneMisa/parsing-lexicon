import test from 'node:test';
import assert from 'node:assert/strict';
import { extractHousingAddressCandidates } from '../src/index.js';
import { extractHousingAddressCandidates as addressCandidates } from '../src/housing-address.js';
import { extractHousingAddressCandidates as pipelineCandidates } from '../src/housing-parser-v2.js';

test('root address extractor has one explicit owner and V2 stays on its subpath', () => {
  assert.strictEqual(extractHousingAddressCandidates, addressCandidates);
  assert.notStrictEqual(extractHousingAddressCandidates, pipelineCandidates);
  assert.deepEqual(extractHousingAddressCandidates(''), []);
  assert.deepEqual(pipelineCandidates(''), []);
});
