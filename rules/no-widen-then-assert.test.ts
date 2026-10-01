// Objective: Verify widen-then-assert diagnostics. Used when testing no-widen-then-assert.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-widen-then-assert';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
