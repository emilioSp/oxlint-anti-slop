// Objective: Verify narrowing-after-widening diagnostics. Used when testing no-narrowing-after-widening.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-narrowing-after-widening';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
