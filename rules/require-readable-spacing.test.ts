// Objective: Verify readable spacing diagnostics. Used when testing require-readable-spacing.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'require-readable-spacing';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
