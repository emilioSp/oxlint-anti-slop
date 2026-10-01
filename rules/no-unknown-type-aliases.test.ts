// Objective: Verify unknown type alias diagnostics. Used when testing no-unknown-type-aliases.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-unknown-type-aliases';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
