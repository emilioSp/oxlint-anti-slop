// Objective: Verify unnecessary type widening diagnostics. Used when testing no-unnecessary-type-widening.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-unnecessary-type-widening';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
