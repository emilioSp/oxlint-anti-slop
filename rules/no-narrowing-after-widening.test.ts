// Objective: Verify narrowing-after-widening diagnostics. Used when testing no-narrowing-after-widening.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noNarrowingAfterWidening;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'object-widening-then-assertion',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'unknown-to-named-type', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'widening-in-initializer',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'readonly-dictionary-to-structure',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'angle-bracket-narrowing',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'same-named-source-type', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'external-input-has-no-local-evidence', expectedCode: null },
    { name: 'broad-to-broad-assertion', expectedCode: null },
    { name: 'mutable-binding-outside-rule-scope', expectedCode: null },
    { name: 'cross-function-flow-outside-rule-scope', expectedCode: null },
  ],
});
