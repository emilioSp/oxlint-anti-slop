// Objective: Verify typeof outside guard diagnostics. Used when testing no-typeof-outside-guards.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-typeof-outside-guards';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
