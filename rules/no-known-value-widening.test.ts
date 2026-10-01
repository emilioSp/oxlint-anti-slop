// Objective: Verify known-value widening diagnostics. Used when testing no-known-value-widening.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-known-value-widening';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
