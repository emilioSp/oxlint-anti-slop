// Objective: Verify typeof outside guard diagnostics. Used when testing no-typeof-outside-guards.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noTypeofOutsideGuards;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'inline-typeof-check', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'named-type-guard', expectedCode: null },
    { name: 'existence-probe', expectedCode: null },
    { name: 'reversed-existence-probe', expectedCode: null },
    { name: 'type-query', expectedCode: null },
    { name: 'assertion-function', expectedCode: null },
    {
      name: 'boolean-return-is-not-guard',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'nested-callback-is-not-guard',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'undefined-value-is-not-existence-probe',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
  ],
});
