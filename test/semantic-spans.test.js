import test from 'node:test';
import assert from 'node:assert/strict';

import { NON_ADDRESS_SPAN_TYPE, detectNonAddressSpans, overlapsAnySpan } from '../src/semantic-spans.js';

test('detects money, contact and temporal spans with offsets aligned to the original text', () => {
  const text = 'Сдаю квартиру от 1 месяца, тел +998901112233, цена 350$, ул. Ленина 5';
  const spans = detectNonAddressSpans(text, { country: 'UZ' });

  const money = spans.find((span) => span.type === NON_ADDRESS_SPAN_TYPE.MONEY);
  assert.equal(text.slice(money.start, money.end), '350$');

  const contact = spans.find((span) => span.type === NON_ADDRESS_SPAN_TYPE.CONTACT);
  assert.equal(text.slice(contact.start, contact.end), '+998901112233');

  const temporal = spans.find((span) => span.type === NON_ADDRESS_SPAN_TYPE.TEMPORAL);
  assert.equal(text.slice(temporal.start, temporal.end), 'от 1 месяца');

  // The street itself must never be covered by any non-address span.
  const streetStart = text.indexOf('Ленина');
  assert.equal(overlapsAnySpan(streetStart, streetStart + 'Ленина 5'.length, spans), false);
});

test('a bare unlabelled number is not treated as money evidence', () => {
  // "5" here is a plausible house number, not a price — must not appear as a MONEY span.
  const text = 'ул. Ленина 5';
  const spans = detectNonAddressSpans(text, { country: 'UA' });
  assert.equal(spans.some((span) => span.type === NON_ADDRESS_SPAN_TYPE.MONEY), false);
});

test('empty or non-string input returns no spans', () => {
  assert.deepEqual(detectNonAddressSpans(''), []);
  assert.deepEqual(detectNonAddressSpans(null), []);
  assert.deepEqual(detectNonAddressSpans(undefined), []);
});

test('overlapsAnySpan reports true only for genuinely overlapping ranges', () => {
  const spans = [{ type: 'money', start: 10, end: 14 }];
  assert.equal(overlapsAnySpan(0, 10, spans), false);
  assert.equal(overlapsAnySpan(14, 20, spans), false);
  assert.equal(overlapsAnySpan(12, 16, spans), true);
  assert.equal(overlapsAnySpan(5, 20, spans), true);
});
