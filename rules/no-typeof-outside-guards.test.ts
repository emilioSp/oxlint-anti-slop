// Objective: Verify typeof outside guard diagnostics. Used when testing no-typeof-outside-guards.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-typeof-outside-guards';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
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
