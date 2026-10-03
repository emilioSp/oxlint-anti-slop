// Objective: Verify type assertion justification diagnostics. Used when testing require-type-assertion-justification.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.requireTypeAssertionJustification;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'unjustified-type-assertion',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'justified-type-assertion', expectedCode: null },
    { name: 'const-assertion', expectedCode: null },
    { name: 'satisfies-contract', expectedCode: null },
    { name: 'block-comment-on-export', expectedCode: null },
    { name: 'inline-comment-on-assertion', expectedCode: null },
    { name: 'empty-marker', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'marker-inside-another-word',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'comment-after-assertion',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'comment-on-unrelated-statement',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'angle-bracket-without-comment',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
  ],
});
