import test from 'node:test';
import assert from 'node:assert/strict';
import { locationEntries, mergeLocationEntries } from '../src/location-merge.js';

test('merging entries does not compile alias regexes eagerly', () => {
  // Object spread invokes getters. Spreading a location entry therefore used to
  // build every alias regex at merge time, which happens at module load — tens
  // of seconds of startup for the full dictionary set.
  let compiled = 0;
  const entry = (name, aliases) => Object.freeze({
    canonical: name,
    name,
    aliases: Object.freeze(aliases),
    get re() {
      compiled += 1;
      return /never-used/u;
    },
  });

  const merged = mergeLocationEntries(
    [entry('Chilonzor', ['Чиланзар'])],
    [entry('Chilonzor', ['Chilanzar'])],
  );

  assert.equal(compiled, 0);
  assert.equal(merged.length, 1);
  assert.deepEqual([...merged[0].aliases].sort(), ['Chilanzar', 'Chilonzor', 'Чиланзар']);
  // The merged entry still exposes a working matcher on demand.
  assert.ok(merged[0].re.test(' Чиланзар '));
});

test('merged entries keep the aliases of every source', () => {
  const merged = mergeLocationEntries(
    locationEntries([['Yunusobod', 'Юнусабад']]),
    locationEntries([['Yunusobod', 'Yunusabad']]),
  );
  assert.equal(merged.length, 1);
  assert.ok(merged[0].re.test(' Yunusabad '));
  assert.ok(merged[0].re.test(' Юнусабад '));
});
