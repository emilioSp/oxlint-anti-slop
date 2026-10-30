// Objective: Verify fallback for unavailable cooked template text. Used by test title extraction tests.

import type { ESTree } from '@oxlint/plugins';
import { expect, it } from 'vitest';

import { extractTitle } from '#utils/test-titles/extract-title.js';

it('given unavailable cooked text when extracting a title then it uses the raw text', () => {
  // JUSTIFICATION: Only the fields read by the extractor are needed to exercise this parser edge case.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions
  const template = {
    type: 'TemplateLiteral',
    quasis: [
      { value: { cooked: null, raw: 'given a cart when checkout starts then payment opens' } },
    ],
  } as unknown as ESTree.TemplateLiteral;

  expect(extractTitle(template)).toBe('given a cart when checkout starts then payment opens');
});
