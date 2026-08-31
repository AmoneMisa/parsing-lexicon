import assert from 'node:assert/strict';
import test from 'node:test';

import {
  professionCanonicalDisplayName,
  professionDisplayName,
} from '../src/hiring-profession-display.js';

test('profession display uses one deterministic package-owned canonical label', () => {
  assert.equal(professionCanonicalDisplayName('frontend_developer'), 'Frontend Developer');
  assert.equal(professionCanonicalDisplayName('qa_engineer'), 'QA Engineer');
  assert.equal(professionCanonicalDisplayName('ui_ux_designer'), 'UI UX Designer');
  assert.equal(professionCanonicalDisplayName('ios_developer'), 'iOS Developer');
});

test('profession display resolves supported aliases without exposing search folding', () => {
  assert.equal(professionDisplayName('фронтенд разработчик'), 'Frontend Developer');
  assert.equal(professionDisplayName('QA инженер'), 'QA Engineer');
  assert.equal(professionDisplayName('frontend dasturchi'), 'Frontend Developer');
});

test('profession display preserves unsupported source values instead of inventing transliteration', () => {
  assert.equal(professionDisplayName('Senior Cat Wrangler'), 'Senior Cat Wrangler');
  assert.equal(professionCanonicalDisplayName('not_in_catalog'), '');
  assert.equal(professionDisplayName('  Not In Catalog  '), 'Not In Catalog');
});
