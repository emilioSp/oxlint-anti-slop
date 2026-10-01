// Objective: Verify chained type assertion diagnostics. Used when testing no-chained-type-assertions.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-chained-type-assertions';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
