// Objective: Verify runtime typeof diagnostics. Used when testing no-runtime-typeof.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-runtime-typeof';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
